/**
 * 表单推导 + 请求配置生成。
 *
 * 数据文件只写「这个 Provider 特有的字段」，端点 / 模型 / 超时这类通用项
 * 由这里补齐，保证不同项目渲染出的配置页结构一致。
 *
 * Schema v2 起，endpoints / auth.mode / billing.mode 是权威字段；
 * baseURL / authType / quota 仍然保留，作为旧消费者的兼容投影。
 */

import { inferAuthMode, inferBillingMode } from './infer.mjs';

const GROUP_ORDER = ['auth', 'endpoint', 'model', 'runtime', 'advanced'];

function hasField(fields, key) {
  return fields.some((f) => f.key === key);
}


/**
 * 返回 Provider 的所有接入面；旧数据没有 endpoints 时，用 baseURL 合成一个。
 */
export function getEndpoints(provider) {
  if (Array.isArray(provider.endpoints) && provider.endpoints.length > 0) {
    return provider.endpoints;
  }
  return [
    {
      id: 'default',
      label: '默认端点',
      protocol: 'unknown',
      baseURL: provider.baseURL ?? null,
      billing: inferBillingMode(provider),
      default: true,
    },
  ];
}

export function getDefaultEndpoint(provider) {
  const endpoints = getEndpoints(provider);
  return endpoints.find((endpoint) => endpoint.default === true) ?? endpoints[0] ?? null;
}

const DEFAULT_PROTOCOL_PATH = {
  'openai-chat': '/chat/completions',
  'openai-responses': '/responses',
  'anthropic-messages': '/v1/messages',
};

/**
 * 端点相对路径。显式 path 优先；否则按协议给默认路径；本地/原生协议没有统一路径。
 */
export function getEndpointPath(endpoint) {
  if (!endpoint) return '';
  if (typeof endpoint.path === 'string' && endpoint.path) return endpoint.path;
  return DEFAULT_PROTOCOL_PATH[endpoint.protocol] ?? '';
}

/**
 * 实际请求 URL = baseURL + path。若 baseURL 已经以 path 结尾，不重复拼接。
 */
export function getRequestURL(endpoint) {
  if (!endpoint?.baseURL) return null;
  const base = String(endpoint.baseURL).replace(/\/+$/, '');
  const path = getEndpointPath(endpoint);
  if (!path) return base;
  if (base.endsWith(path)) return base;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * 按表单里的 endpoint 值解析接入面：支持 id，也支持旧的 value。
 */
export function resolveEndpoint(provider, values = {}) {
  const endpoints = getEndpoints(provider);
  const selectedValue = values.endpoint ?? values.endpointId;
  if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
    const selected = endpoints.find(
      (endpoint) => endpoint.id === selectedValue || endpoint.value === selectedValue,
    );
    if (selected) return selected;
  }
  return getDefaultEndpoint(provider);
}

/**
 * 返回可直接渲染的完整字段列表（按分组排序）。
 * @param {object} provider
 */
export function getFormFields(provider) {
  const fields = [...(provider.fields ?? [])];
  const endpoints = getEndpoints(provider);

  const needsBaseURL =
    provider.kind !== 'session' &&
    endpoints.length <= 1 &&
    (provider.baseURL === null ||
      provider.baseURLEditable === true ||
      (Boolean(provider.baseURLTemplate) &&
        provider.fields?.some((f) => f.key === 'baseURL') !== true &&
        provider.form?.baseURLField === true));
  if (needsBaseURL && !hasField(fields, 'baseURL')) {
    fields.push({
      key: 'baseURL',
      label: 'Base URL',
      type: 'url',
      group: 'endpoint',
      required: provider.baseURL === null,
      placeholder: provider.baseURLTemplate ?? 'https://example.com/v1',
      help:
        provider.baseURLTemplate
          ? '按模板填写，{...} 部分替换成你的资源标识'
          : '该 Provider 没有固定公共端点，请填写你的自建 / 网关地址',
      advanced: false,
    });
  }

  // 多接入面：自动补一个选择器，让 UI 不必为每个套餐写特例。
  if (endpoints.length > 1 && !hasField(fields, 'endpoint')) {
    const defaultEndpoint = getDefaultEndpoint(provider);
    fields.unshift({
      key: 'endpoint',
      label: '接入方式',
      type: 'select',
      group: 'endpoint',
      required: true,
      default: defaultEndpoint?.id,
      options: endpoints.map((endpoint) => ({
        label: endpoint.label ?? endpoint.id,
        value: endpoint.id,
        description: getRequestURL(endpoint) ?? '本地会话，无公开端点',
      })),
      help: '不同套餐使用不同端点；选错端点会出现 401，即使 Key 本身有效',
    });
  }

  if (!hasField(fields, 'model') && provider.kind !== 'session') {
    fields.push({
      key: 'model',
      label: '默认模型',
      type: 'text',
      group: 'model',
      required: false,
      placeholder: provider.defaultModel ?? '模型 ID（留空则由服务端决定）',
      help:
        provider.runtime?.passthroughModels === true
          ? '该网关支持透传模型 ID，模型目录可能需要登录后动态发现'
          : '只影响默认值，配置页可让用户在会话里切换',
    });
  }

  if (!hasField(fields, 'timeout')) {
    fields.push({
      key: 'timeout',
      label: '请求超时（秒）',
      type: 'number',
      group: 'advanced',
      required: false,
      default: 60,
      advanced: true,
      validate: { min: 5, max: 600 },
    });
  }

  return fields.sort((a, b) => {
    const ga = GROUP_ORDER.indexOf(a.group ?? 'advanced');
    const gb = GROUP_ORDER.indexOf(b.group ?? 'advanced');
    if (ga !== gb) return ga - gb;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

/**
 * 按分组归并，方便 UI 直接渲染分组表单。
 */
export function groupFormFields(fields) {
  const groups = {};
  for (const field of fields) {
    const group = field.group ?? 'advanced';
    (groups[group] ??= []).push(field);
  }
  return groups;
}

/**
 * 取出所有密钥字段名，供 UI 做脱敏 / 存储策略。
 */
export function getSecretFieldKeys(provider) {
  return getFormFields(provider)
    .filter((f) => f.secret === true)
    .map((f) => f.key);
}

function interpolate(template, values) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    const v = values?.[key];
    return v === undefined || v === null || v === '' ? `{${key}}` : String(v);
  });
}

function firstCredential(provider, values) {
  const fields = getFormFields(provider).filter((f) => f.secret === true);
  for (const field of fields) {
    const value = values?.[field.key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return '';
}

function applyHeaders(headers, extraHeaders, values) {
  for (const [name, value] of Object.entries(extraHeaders ?? {})) {
    if (typeof value !== 'string') continue;
    if (value.includes('{')) {
      const resolved = interpolate(value, values);
      // 用户没填的可选字段不发送，避免把字面量 {siteUrl} 发给服务端
      if (resolved.includes('{')) continue;
      headers[name] = resolved;
    } else {
      headers[name] = value;
    }
  }
}

/**
 * 根据表单值生成可发给 SDK / fetch 的请求配置。
 * 不会发起请求，也不会持久化任何密钥。
 *
 * @param {object} provider
 * @param {Record<string, unknown>} values
 */
export function buildRequestConfig(provider, values = {}) {
  const headers = {};
  const query = {};
  const missing = [];
  const warnings = [];

  const fields = getFormFields(provider);
  for (const field of fields) {
    const value = values[field.key] ?? field.default;
    if (field.required && (value === undefined || value === null || value === '')) {
      missing.push(field.key);
    }
  }

  const endpoint = resolveEndpoint(provider, values);
  let baseURL = values.baseURL ?? endpoint?.baseURL ?? provider.baseURL ?? '';

  if (provider.baseURLTemplate) {
    baseURL = interpolate(provider.baseURLTemplate, values);
  } else if (baseURL.includes('{')) {
    baseURL = interpolate(baseURL, values);
  }
  if (baseURL.startsWith('http://localhost') || baseURL.startsWith('http://127.0.0.1')) {
    warnings.push('本地端点：请确认该地址只在可信网络内可达');
  }

  const path = getEndpointPath(endpoint);
  let requestURL = baseURL ? String(baseURL).replace(/\/+$/, '') : '';
  if (requestURL && path && !requestURL.endsWith(path)) {
    requestURL = `${requestURL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  const auth = provider.auth ?? {};
  // 接入面级鉴权覆盖：同一 Provider 的不同接入面可能要求不同 header（Anthropic 面用 x-api-key，OpenAI 面用 bearer）。
  const endpointAuth = endpoint?.auth ?? {};
  const authMode = endpointAuth.mode ?? inferAuthMode(provider);
  const scheme = endpointAuth.scheme ?? auth.scheme ?? provider.authType;
  const headerName = endpointAuth.headerName ?? auth.headerName;
  const queryName = endpointAuth.queryName ?? auth.queryName;
  const credential = firstCredential(provider, values);

  if (authMode === 'oauth' || authMode === 'device-code') {
    warnings.push('OAuth / 设备码：先在面板完成登录，不要把 access token 写进配置文件或 Prompt');
  }
  if (authMode === 'browser-cookie') {
    warnings.push('浏览器 Cookie：只应存在本地凭据库，不能提交到仓库或日志');
  }
  if (authMode === 'local-session') {
    warnings.push('本地登录态：凭证由已登录客户端 / CLI 动态签发，不能导出为静态 Key');
  }

  switch (scheme) {
    case 'bearer':
      if (credential) headers.Authorization = `Bearer ${credential}`;
      break;
    case 'api-key-header':
      if (credential) headers[headerName ?? 'x-api-key'] = credential;
      break;
    case 'query-param':
      if (credential) query[queryName ?? 'key'] = credential;
      break;
    case 'azure-api-key':
      if (credential) headers['api-key'] = credential;
      query['api-version'] = values.apiVersion ?? '2024-10-21';
      break;
    case 'aws-sigv4':
      warnings.push('AWS SigV4 需要 SDK 计算签名，不能只靠静态 headers 转发');
      break;
    case 'cookie':
      if (credential) headers.Cookie = credential;
      break;
    case 'jwt-session':
      warnings.push('会话型 Provider：请求头必须由已登录的桌面端 / CLI 动态签发，不能保存静态 JWT');
      break;
    case 'none':
      break;
    default:
      warnings.push(`未知鉴权类型：${scheme}`);
  }

  // 端点级 headers 优先于 Provider 级 extraHeaders。
  applyHeaders(headers, auth.extraHeaders, values);
  applyHeaders(headers, endpoint?.headers, values);

  if (provider.kind === 'session') {
    warnings.push('该配置不会被写入磁盘以换取长期额度；额度跟随登录会话');
  }
  if (provider.risk && ['medium', 'high'].includes(provider.risk.level)) {
    warnings.push(`风险提示（${provider.risk.level}）：${provider.risk.note}`);
  }
  if (provider.runtime?.forceStream === true) {
    warnings.push('该网关只接受流式请求；非流式调用需要先聚合 SSE');
  }
  if (provider.runtime?.strictChatHistory === true) {
    warnings.push('该网关要求严格回放 tool_call / reasoning 历史，否则会断在多轮');
  }

  return {
    baseURL,
    endpoint: endpoint?.id ?? 'default',
    protocol: endpoint?.protocol ?? 'unknown',
    path,
    requestURL,
    headers,
    query,
    missing,
    warnings,
    quota: provider.quota?.type,
    billing: inferBillingMode(provider),
    authMode,
    runtime: provider.runtime ?? null,
  };
}
