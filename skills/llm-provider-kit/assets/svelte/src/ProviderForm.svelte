<script>
  import { createEventDispatcher } from 'svelte';
  import {
    getFormFields,
    groupFormFields,
    buildRequestConfig,
    getQuotaWarning,
  } from './registry/index.mjs';

  export let provider;
  export let values = {};
  const dispatch = createEventDispatcher();

  const GROUP_LABEL = {
    auth: '鉴权',
    endpoint: '端点',
    model: '模型',
    runtime: '运行时 / 会话',
    advanced: '高级',
  };

  let showAdvanced = false;
  let errors = {};
  let revealed = {};

  $: fields = getFormFields(provider);
  $: groups = groupFormFields(fields);
  $: basicGroups = Object.entries(groups).filter(([g]) => g !== 'advanced');
  $: warning = getQuotaWarning(provider);
  $: secretValues = fields
    .filter((f) => f.secret === true)
    .map((f) => String(values[f.key] ?? ''))
    .filter(Boolean);
  $: preview = maskPreview(buildRequestConfig(provider, values), secretValues);

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

  function controlValue(field) {
    return values[field.key] ?? field.default ?? '';
  }

  function onInput(field, event) {
    const target = event.target;
    const value =
      field.type === 'number' ? (target.value === '' ? '' : Number(target.value)) :
      field.type === 'boolean' ? target.checked : target.value;
    dispatch('change', { key: field.key, value });
    if (errors[field.key]) {
      const next = { ...errors };
      delete next[field.key];
      errors = next;
    }
  }

  function toggleReveal(key) {
    revealed = { ...revealed, [key]: !revealed[key] };
  }

  function validate() {
    const next = {};
    for (const field of fields) {
      const value = values[field.key] ?? field.default;
      if (field.required && !String(value ?? '').trim()) next[field.key] = '必填项';
    }
    errors = next;
  }
</script>

<section class="provider-form">
  {#if warning}
    <div class={`banner banner-${warning.level}`}>
      <strong>{warning.title}</strong>
      <p>{warning.detail}</p>
    </div>
  {/if}

  {#each basicGroups as [group, groupFields]}
    <fieldset>
      <legend>{GROUP_LABEL[group] ?? group}</legend>
      {#each groupFields as field (field.key)}
        <div class="field" class:field-error={errors[field.key]}>
          <label for={`field-${field.key}`}>
            {field.label}
            {#if field.required}<span class="required">必填</span>{/if}
            {#if field.secret}<span class="tag">密钥</span>{/if}
          </label>

          {#if field.type === 'select'}
            <select id={`field-${field.key}`} value={controlValue(field)} on:change={(e) => onInput(field, e)}>
              {#each field.options ?? [] as option (option.value)}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          {:else if field.type === 'boolean'}
            <input type="checkbox" id={`field-${field.key}`}
              checked={Boolean(controlValue(field))} on:change={(e) => onInput(field, e)} />
          {:else if field.type === 'textarea' || field.type === 'json'}
            <textarea id={`field-${field.key}`} rows="4" placeholder={field.placeholder}
              value={controlValue(field)} on:input={(e) => onInput(field, e)}></textarea>
          {:else if field.type === 'number'}
            <input type="number" id={`field-${field.key}`} min={field.validate?.min} max={field.validate?.max}
              placeholder={field.placeholder} value={controlValue(field)} on:input={(e) => onInput(field, e)} />
          {:else if field.type === 'password'}
            <div class="secret-row">
              <input type={revealed[field.key] ? 'text' : 'password'} id={`field-${field.key}`}
                autocomplete="off" placeholder={field.placeholder} value={controlValue(field)}
                on:input={(e) => dispatch('change', { key: field.key, value: e.target.value })} />
              <button type="button" on:click={() => toggleReveal(field.key)}>
                {revealed[field.key] ? '隐藏' : '显示'}
              </button>
            </div>
          {:else}
            <input type={field.type === 'url' ? 'url' : 'text'} id={`field-${field.key}`}
              autocomplete="off" placeholder={field.placeholder} value={controlValue(field)}
              on:input={(e) => onInput(field, e)} />
          {/if}

          {#if field.help}<p class="help">{field.help}</p>{/if}
          {#if errors[field.key]}<p class="error">{errors[field.key]}</p>{/if}
        </div>
      {/each}
    </fieldset>
  {/each}

  {#if groups.advanced?.length}
    <button type="button" class="link" on:click={() => (showAdvanced = !showAdvanced)}>
      {showAdvanced ? '收起高级项' : `显示高级项（${groups.advanced.length}）`}
    </button>
    {#if showAdvanced}
      <fieldset>
        <legend>{GROUP_LABEL.advanced}</legend>
        {#each groups.advanced as field (field.key)}
          <div class="field">
            <label for={`field-${field.key}`}>
              {field.label}
              {#if field.required}<span class="required">必填</span>{/if}
              {#if field.secret}<span class="tag">密钥</span>{/if}
            </label>
            <input type={field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
              id={`field-${field.key}`} autocomplete="off" placeholder={field.placeholder}
              value={controlValue(field)} on:input={(e) => onInput(field, e)} />
            {#if field.help}<p class="help">{field.help}</p>{/if}
          </div>
        {/each}
      </fieldset>
    {/if}
  {/if}

  <div class="actions">
    <button type="button" on:click={validate}>校验配置</button>
  </div>

  <pre class="preview">{JSON.stringify(preview, null, 2)}</pre>
</section>
