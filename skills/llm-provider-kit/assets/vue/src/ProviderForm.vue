<script setup>
import { computed, ref } from 'vue';
import {
  getFormFields,
  groupFormFields,
  buildRequestConfig,
  getQuotaWarning,
} from './registry/index.mjs';

const props = defineProps({
  provider: { type: Object, required: true },
  values: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['change']);

const GROUP_LABEL = {
  auth: '鉴权',
  endpoint: '端点',
  model: '模型',
  runtime: '运行时 / 会话',
  advanced: '高级',
};

const showAdvanced = ref(false);
const errors = ref({});
const revealed = ref({});

const fields = computed(() => getFormFields(props.provider));
const groups = computed(() => groupFormFields(fields.value));
const basicGroups = computed(() => Object.entries(groups.value).filter(([g]) => g !== 'advanced'));
const warning = computed(() => getQuotaWarning(props.provider));

function maskValue(value) {
  const raw = String(value ?? '');
  if (!raw) return '';
  if (raw.length <= 8) return '••••';
  return `${raw.slice(0, 4)}…${raw.slice(-4)}`;
}

function maskPreview(value, secrets) {
  if (typeof value === 'string') {
    let text = value;
    for (const secret of secrets) text = text.split(secret).join(maskValue(secret));
    return text;
  }
  if (Array.isArray(value)) return value.map((item) => maskPreview(item, secrets));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, item]) => [k, maskPreview(item, secrets)]));
  }
  return value;
}

const secretValues = computed(() =>
  fields.value
    .filter((f) => f.secret === true)
    .map((f) => String(props.values[f.key] ?? ''))
    .filter(Boolean),
);

const preview = computed(() =>
  maskPreview(buildRequestConfig(props.provider, props.values), secretValues.value),
);

function controlValue(field) {
  return props.values[field.key] ?? field.default ?? '';
}

function onInput(field, event) {
  const target = event.target;
  const value =
    field.type === 'number' ? (target.value === '' ? '' : Number(target.value)) :
    field.type === 'boolean' ? target.checked : target.value;
  emit('change', field.key, value);
  if (errors.value[field.key]) {
    const next = { ...errors.value };
    delete next[field.key];
    errors.value = next;
  }
}

function toggleReveal(key) {
  revealed.value = { ...revealed.value, [key]: !revealed.value[key] };
}

function validate() {
  const next = {};
  for (const field of fields.value) {
    const value = props.values[field.key] ?? field.default;
    if (field.required && !String(value ?? '').trim()) next[field.key] = '必填项';
  }
  errors.value = next;
}
</script>

<template>
  <section class="provider-form">
    <div v-if="warning" :class="`banner banner-${warning.level}`">
      <strong>{{ warning.title }}</strong>
      <p>{{ warning.detail }}</p>
    </div>

    <fieldset v-for="[group, groupFields] in basicGroups" :key="group">
      <legend>{{ GROUP_LABEL[group] ?? group }}</legend>
      <div v-for="field in groupFields" :key="field.key" class="field" :class="{ 'field-error': errors[field.key] }">
        <label :for="`field-${field.key}`">
          {{ field.label }}
          <span v-if="field.required" class="required">必填</span>
          <span v-if="field.secret" class="tag">密钥</span>
        </label>

        <select v-if="field.type === 'select'" :id="`field-${field.key}`" :value="controlValue(field)" @change="onInput(field, $event)">
          <option v-for="option in field.options ?? []" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <input v-else-if="field.type === 'boolean'" type="checkbox" :id="`field-${field.key}`"
          :checked="Boolean(controlValue(field))" @change="onInput(field, $event)" />

        <textarea v-else-if="field.type === 'textarea' || field.type === 'json'" :id="`field-${field.key}`" rows="4"
          :placeholder="field.placeholder" :value="controlValue(field)" @input="onInput(field, $event)" />

        <input v-else-if="field.type === 'number'" type="number" :id="`field-${field.key}`"
          :min="field.validate?.min" :max="field.validate?.max" :placeholder="field.placeholder"
          :value="controlValue(field)" @input="onInput(field, $event)" />

        <div v-else-if="field.type === 'password'" class="secret-row">
          <input :type="revealed[field.key] ? 'text' : 'password'" :id="`field-${field.key}`"
            autocomplete="off" :placeholder="field.placeholder" :value="controlValue(field)"
            @input="emit('change', field.key, $event.target.value)" />
          <button type="button" @click="toggleReveal(field.key)">
            {{ revealed[field.key] ? '隐藏' : '显示' }}
          </button>
        </div>

        <input v-else :type="field.type === 'url' ? 'url' : 'text'" :id="`field-${field.key}`"
          autocomplete="off" :placeholder="field.placeholder" :value="controlValue(field)" @input="onInput(field, $event)" />

        <p v-if="field.help" class="help">{{ field.help }}</p>
        <p v-if="errors[field.key]" class="error">{{ errors[field.key] }}</p>
      </div>
    </fieldset>

    <template v-if="groups.advanced?.length">
      <button type="button" class="link" @click="showAdvanced = !showAdvanced">
        {{ showAdvanced ? '收起高级项' : `显示高级项（${groups.advanced.length}）` }}
      </button>
      <fieldset v-if="showAdvanced">
        <legend>{{ GROUP_LABEL.advanced }}</legend>
        <div v-for="field in groups.advanced" :key="field.key" class="field">
          <label :for="`field-${field.key}`">
            {{ field.label }}
            <span v-if="field.required" class="required">必填</span>
            <span v-if="field.secret" class="tag">密钥</span>
          </label>
          <input :type="field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'"
            :id="`field-${field.key}`" autocomplete="off" :placeholder="field.placeholder"
            :value="controlValue(field)" @input="onInput(field, $event)" />
          <p v-if="field.help" class="help">{{ field.help }}</p>
        </div>
      </fieldset>
    </template>

    <div class="actions">
      <button type="button" @click="validate">校验配置</button>
    </div>

    <pre class="preview">{{ JSON.stringify(preview, null, 2) }}</pre>
  </section>
</template>
