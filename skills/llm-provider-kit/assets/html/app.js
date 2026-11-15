/*
 * 单文件静态页运行时（经典 script，可在 file:// 下打开）。
 * Kit 注册表函数与 DATA 由生成器注入到同一份 HTML，这里只做渲染。
 * 字段、端点、鉴权头与请求预览全部来自注册表数据，不手写任何 Provider 字段。
 */
(function () {
  const {
    createRegistry,
    getFormFields,
    groupFormFields,
    buildRequestConfig,
    getQuotaWarning,
  } = Kit;

  const registry = createRegistry(DATA);
  const providers = registry.providers;
  const params = new URLSearchParams(location.search);
  const requested = params.get('provider');
  const initialProvider = registry.getProvider(requested) ?? providers[0];
  const state = {
    providerId: initialProvider?.id ?? '',
    query: '',
    showAdvanced: false,
    errors: {},
    values: {},
  };

  for (const provider of providers) {
    const values = {};
    for (const field of getFormFields(provider)) {
      if (field.default !== undefined) values[field.key] = field.default;
    }
    state.values[provider.id] = values;
  }

  const $ = (id) => document.getElementById(id);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const CATEGORY_LABEL = { global: '海外', china: '国内', aggregator: '聚合', local: '本地' };
  const GROUP_LABEL = { auth: '鉴权', endpoint: '端点', model: '模型', runtime: '运行时 / 会话', advanced: '高级' };

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
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, maskPreview(item, secrets)]));
    }
    return value;
  }

  function currentProvider() {
    return registry.getProvider(state.providerId) ?? providers[0];
  }

  function visibleProviders() {
    const query = state.query.trim().toLowerCase();
    if (!query) return providers;
    const matches = providers.filter((provider) =>
      `${provider.id} ${provider.name}`.toLowerCase().includes(query),
    );
    return matches.length ? matches : providers.filter((provider) => provider.id === state.providerId);
  }

  function riskPill(provider) {
    const wrap = el('div', 'pill-line');
    if (provider.risk?.variant === 'unsupported') wrap.appendChild(el('span', 'pill unsupported', 'unsupported'));
    if (provider.risk?.level) wrap.appendChild(el('span', `pill risk-${provider.risk.level}`, `${provider.risk.level} risk`));
    return wrap;
  }

  function fieldControl(field, value, onChange) {
    let control;
    if (field.type === 'select') {
      control = el('select');
      for (const option of field.options ?? []) {
        const item = el('option', '', option.label);
        item.value = option.value;
        control.appendChild(item);
      }
      control.value = value ?? field.default ?? '';
    } else if (field.type === 'boolean') {
      control = el('input');
      control.type = 'checkbox';
      control.checked = Boolean(value ?? field.default);
    } else if (field.type === 'textarea' || field.type === 'json') {
      control = el('textarea');
      control.rows = 4;
      control.value = value ?? field.default ?? '';
    } else {
      control = el('input');
      control.type = field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text';
      control.value = value ?? field.default ?? '';
      if (field.type === 'number') {
        control.min = field.validate?.min ?? '';
        control.max = field.validate?.max ?? '';
      }
      if (field.type === 'password') control.autocomplete = 'off';
    }
    control.id = `field-${field.key}`;
    control.name = field.key;
    if ('placeholder' in control && field.placeholder) control.placeholder = field.placeholder;
    control.addEventListener(field.type === 'boolean' ? 'change' : 'input', () => {
      onChange(field.type === 'number'
        ? (control.value === '' ? '' : Number(control.value))
        : field.type === 'boolean' ? control.checked : control.value);
    });
    return control;
  }

  function renderField(provider, field) {
    const values = state.values[provider.id] ?? (state.values[provider.id] = {});
    const wrap = el('div', 'field');
    const label = el('label', '', field.label ?? field.key);
    label.htmlFor = `field-${field.key}`;
    if (field.required) label.appendChild(el('span', 'required', '必填'));
    if (field.secret) label.appendChild(el('span', 'tag', '密钥'));
    wrap.appendChild(label);
    if (field.type === 'password') {
      const row = el('div', 'secret-row');
      const control = fieldControl(field, values[field.key], (value) => {
        values[field.key] = value;
        renderPreview();
      });
      const toggle = el('button', '', '显示');
      toggle.type = 'button';
      toggle.addEventListener('click', () => {
        control.type = control.type === 'password' ? 'text' : 'password';
        toggle.textContent = control.type === 'password' ? '显示' : '隐藏';
      });
      row.append(control, toggle);
      wrap.appendChild(row);
    } else {
      wrap.appendChild(fieldControl(field, values[field.key], (value) => {
        values[field.key] = value;
        renderPreview();
      }));
    }
    if (field.help) wrap.appendChild(el('p', 'help', field.help));
    return wrap;
  }

  function renderPreview() {
    const provider = currentProvider();
    const fields = getFormFields(provider);
    const values = state.values[provider.id] ?? {};
    const config = buildRequestConfig(provider, values);
    const secrets = fields
      .filter((field) => field.secret === true)
      .map((field) => String(values[field.key] ?? ''))
      .filter(Boolean);
    $('preview').textContent = JSON.stringify(maskPreview(config, secrets), null, 2);
  }

  function renderDetail() {
    const provider = currentProvider();
    if (!provider) return;
    $('provider-name').textContent = provider.name;
    $('provider-meta').textContent = `${provider.id} · ${CATEGORY_LABEL[provider.category] ?? provider.category} · ${provider.endpoints?.length ?? 1} 个接入面`;
    const pills = riskPill(provider);
    pills.id = 'pill-line';
    $('pill-line').replaceWith(pills);
    const risk = $('risk');
    risk.replaceChildren();
    const warning = getQuotaWarning(provider);
    if (warning) {
      const banner = el('div', `banner banner-${warning.level}`);
      banner.appendChild(el('strong', '', warning.title));
      banner.appendChild(el('p', '', warning.detail));
      risk.appendChild(banner);
    } else if (provider.risk?.note) {
      risk.appendChild(el('p', 'risk-note', provider.risk.note));
    }

    const fields = getFormFields(provider);
    const groups = groupFormFields(fields);
    const form = $('form');
    form.replaceChildren();
    for (const [group, groupFields] of Object.entries(groups)) {
      if (group === 'advanced') continue;
      const fieldset = el('fieldset');
      fieldset.appendChild(el('legend', '', GROUP_LABEL[group] ?? group));
      for (const field of groupFields) fieldset.appendChild(renderField(provider, field));
      form.appendChild(fieldset);
    }
    if (groups.advanced?.length) {
      const toggle = el('button', 'link', state.showAdvanced ? '收起高级项' : `显示高级项（${groups.advanced.length}）`);
      toggle.type = 'button';
      toggle.addEventListener('click', () => {
        state.showAdvanced = !state.showAdvanced;
        renderDetail();
      });
      form.appendChild(toggle);
      if (state.showAdvanced) {
        const fieldset = el('fieldset');
        fieldset.appendChild(el('legend', '', GROUP_LABEL.advanced));
        for (const field of groups.advanced) fieldset.appendChild(renderField(provider, field));
        form.appendChild(fieldset);
      }
    }
    renderPreview();
  }

  function renderSelect() {
    const select = $('provider-select');
    const list = visibleProviders();
    select.replaceChildren();
    for (const provider of list) {
      const option = el('option', '', `${provider.name} · ${CATEGORY_LABEL[provider.category] ?? provider.category}`);
      option.value = provider.id;
      select.appendChild(option);
    }
    select.value = state.providerId;
    $('provider-count').textContent = `Provider（${list.length} / ${providers.length}）`;
  }

  function boot() {
    const tier = DATA.tier ?? {};
    $('eyebrow').textContent = `Provider Registry · ${tier.label ?? 'Tier'}`;
    $('tier-count').textContent = tier.count ?? providers.length;
    $('tier-label').textContent = `${tier.label ?? ''} Providers`;
    $('tier-warning').textContent = tier.description ?? '';

    renderSelect();
    $('search').addEventListener('input', (event) => {
      state.query = event.target.value;
      const list = visibleProviders();
      if (list.length && !list.some((provider) => provider.id === state.providerId)) {
        state.providerId = list[0].id;
        state.errors = {};
        state.showAdvanced = false;
      }
      renderSelect();
      renderDetail();
    });
    $('provider-select').addEventListener('change', (event) => {
      state.providerId = event.target.value;
      state.errors = {};
      state.showAdvanced = false;
      renderDetail();
    });
    $('validate').addEventListener('click', () => {
      const provider = currentProvider();
      const missing = getFormFields(provider)
        .filter((field) => field.required && !String(state.values[provider.id]?.[field.key] ?? field.default ?? '').trim())
        .map((field) => field.key);
      if (missing.length) {
        $('preview').textContent = JSON.stringify({ missing }, null, 2);
      } else {
        renderPreview();
      }
    });
    renderDetail();
  }

  boot();
})();
