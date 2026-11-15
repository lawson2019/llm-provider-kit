/**
 * 参考实现：把一个 Provider 的 fields 直接渲染成配置表单。
 * 不依赖任何 UI 库，复制后按自己的设计系统替换样式即可。
 *
 * 用法：
 *   <ProviderForm
 *     provider={provider}
 *     values={values}
 *     onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
 *   />
 */
import React, { useMemo, useState } from 'react';
import {
  getFormFields,
  groupFormFields,
  buildRequestConfig,
  getQuotaWarning,
} from './registry/index.mjs';


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

const GROUP_LABEL = {
  auth: '鉴权',
  endpoint: '端点',
  model: '模型',
  runtime: '运行时 / 会话',
  advanced: '高级',
};

function Field({ field, value, onChange, error }) {
  const [reveal, setReveal] = useState(false);
  const common = {
    id: `field-${field.key}`,
    'aria-invalid': error ? 'true' : undefined,
    placeholder: field.placeholder,
    value: value ?? field.default ?? '',
  };

  let control;
  switch (field.type) {
    case 'select':
      control = (
        <select {...common} onChange={(e) => onChange(e.target.value)}>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'boolean':
      control = (
        <input
          type="checkbox"
          checked={Boolean(value ?? field.default)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
      break;
    case 'textarea':
    case 'json':
      control = <textarea {...common} rows={4} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'number':
      control = (
        <input
          {...common}
          type="number"
          min={field.validate?.min}
          max={field.validate?.max}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      );
      break;
    case 'password':
      control = (
        <div className="secret-row">
          <input
            {...common}
            type={reveal ? 'text' : 'password'}
            autoComplete="off"
            onChange={(e) => onChange(e.target.value)}
          />
          <button type="button" onClick={() => setReveal((v) => !v)}>
            {reveal ? '隐藏' : '显示'}
          </button>
        </div>
      );
      break;
    default:
      control = (
        <input
          {...common}
          type={field.type === 'url' ? 'url' : 'text'}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className={`field${error ? ' field-error' : ''}`}>
      <label htmlFor={`field-${field.key}`}>
        {field.label}
        {field.required && <span className="required">必填</span>}
        {field.secret && <span className="tag">密钥</span>}
      </label>
      {control}
      {field.help && <p className="help">{field.help}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default function ProviderForm({ provider, values = {}, onChange = () => {} }) {
  const fields = useMemo(() => getFormFields(provider), [provider]);
  const groups = useMemo(() => groupFormFields(fields), [fields]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});

  const warning = getQuotaWarning(provider);
  const config = buildRequestConfig(provider, values);
  const secretValues = fields
    .filter((field) => field.secret === true)
    .map((field) => String(values[field.key] ?? ''))
    .filter(Boolean);
  const preview = maskPreview(config, secretValues);

  const validate = () => {
    const next = {};
    for (const field of fields) {
      const value = values[field.key] ?? field.default;
      if (field.required && !String(value ?? '').trim()) {
        next[field.key] = '必填项';
      }
    }
    setErrors(next);
    return next;
  };

  const basicGroups = Object.entries(groups).filter(([group]) => group !== 'advanced');

  return (
    <section className="provider-form">
      {warning && (
        <div className={`banner banner-${warning.level}`}>
          <strong>{warning.title}</strong>
          <p>{warning.detail}</p>
        </div>
      )}

      {basicGroups.map(([group, groupFields]) => (
        <fieldset key={group}>
          <legend>{GROUP_LABEL[group] ?? group}</legend>
          {groupFields.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={values[field.key]}
              error={errors[field.key]}
              onChange={(value) => {
                onChange(field.key, value);
                if (errors[field.key]) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next[field.key];
                    return next;
                  });
                }
              }}
            />
          ))}
        </fieldset>
      ))}

      {groups.advanced?.length > 0 && (
        <>
          <button type="button" className="link" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? '收起高级项' : `显示高级项（${groups.advanced.length}）`}
          </button>
          {showAdvanced && (
            <fieldset>
              <legend>{GROUP_LABEL.advanced}</legend>
              {groups.advanced.map((field) => (
                <Field
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  error={errors[field.key]}
                  onChange={(value) => onChange(field.key, value)}
                />
              ))}
            </fieldset>
          )}
        </>
      )}

      <div className="actions">
        <button type="button" onClick={validate}>
          校验配置
        </button>
      </div>

      <pre className="preview">{JSON.stringify(preview, null, 2)}</pre>
    </section>
  );
}
