/**
 * 注册表词汇表 + 校验规则（零依赖）。
 *
 * Schema v2 的核心变化：
 * - `auth` 负责「怎么拿到凭证」与「凭证放在哪个 header」；
 * - `billing` 负责「按量 / 订阅 / 免费」，不再和 `kind` 混在一起；
 * - `endpoints` 负责「一个厂商的多个接入面」，例如标准 API / Coding Plan / Anthropic 兼容；
 * - 旧字段 `authType`、`quota`、`baseURL` 继续保留，作为兼容投影。
 */

export const SCHEMA_VERSION = 2;

export const KINDS = {
  api: '厂商直连 API（通常是 OpenAI / Anthropic / Gemini 兼容协议）',
  gateway: '聚合网关 / 中转（OpenRouter、SiliconFlow 等）',
  local: '本地运行时（Ollama、vLLM、LM Studio），无云端鉴权',
  session: '会话型 Provider：依赖已登录的桌面端 / CLI 会话，不能只用静态 API Key',
};

export const CATEGORIES = {
  global: '海外厂商',
  china: '国内厂商',
  aggregator: '聚合 / 中转',
  local: '本地运行时',
  agent: 'Agent / 桌面会话',
};

/** 凭证获取方式。它回答「Key 从哪来」，不回答「放在哪个 header」。 */
export const AUTH_MODES = {
  'api-key': '静态 API Key / Token',
  oauth: 'OAuth 授权（浏览器跳转或本地回调）',
  'device-code': '设备码 / CLI 登录轮询（OAuth device flow）',
  'browser-cookie': '浏览器 Cookie / 网页会话',
  'local-session': '本机客户端 / CLI 的登录态（不导出静态凭证）',
  none: '无鉴权',
};

/** 凭证在请求里的携带方式。旧文档里也叫 authType。 */
export const AUTH_TYPES = {
  bearer: 'Authorization: Bearer <token>',
  'api-key-header': '自定义鉴权头（x-api-key、api-key 等）',
  'query-param': '查询参数鉴权（?key=<token>）',
  'aws-sigv4': 'AWS Signature V4（accessKeyId / secretAccessKey / region）',
  'azure-api-key': 'api-key 请求头 + api-version 查询参数',
  cookie: 'Cookie 请求头（网页会话）',
  'jwt-session': '登录会话 JWT：会过期、需刷新，不能当静态 Key 长期保存',
  none: '无鉴权（本地运行时）',
};

export const BILLING_MODES = {
  payg: '按量计费 / API Key 余额',
  subscription: '订阅制（Coding Plan、Agent Plan、桌面会员等）',
  free: '免费 / 本地自托管',
  mixed: '混合（免费额度 + 付费额度）',
  unknown: '计费方式未确认',
};

export const PROTOCOLS = {
  'openai-chat': 'OpenAI Chat Completions',
  'openai-responses': 'OpenAI Responses API',
  'anthropic-messages': 'Anthropic Messages API',
  'gemini-native': 'Gemini 原生 generateContent',
  native: '厂商原生协议',
  'web-session': '网页会话协议',
  'local-session': '本地客户端会话协议',
  unknown: '协议未确认',
};

export const FIELD_TYPES = [
  'text',
  'password',
  'url',
  'select',
  'number',
  'boolean',
  'json',
  'textarea',
];

export const FIELD_GROUPS = {
  auth: '鉴权',
  endpoint: '端点',
  model: '模型',
  runtime: '运行时 / 会话',
  advanced: '高级',
};

export const QUOTA_TYPES = {
  'api-key': '按 API Key 余额 / 用量计费',
  subscription: '订阅制（Coding Plan 等），与 API 余额是两套账',
  session: '登录会话额度，依赖桌面端 / CLI 的会话状态',
  free: '免费 / 本地自托管',
  mixed: '混合（免费额度 + 付费额度）',
};

export const RISK_LEVELS = {
  low: '普通风险：按官方文档接入即可',
  medium: '需要额外说明：订阅边界、登录态、区域或账号不通用',
  high: '高风险：网页逆向、账号封禁或 ToS 风险',
};

export const RISK_VARIANTS = {
  'official-api': '官方 API',
  subscription: '订阅 / 套餐边界',
  oauth: 'OAuth / 登录态',
  'browser-cookie': '浏览器 Cookie / 网页会话',
  'local-session': '本地客户端会话',
  deprecated: '已废弃 / 即将下线',
  'unsupported': '非官方支持 / 社区桥接',
};

export const AGENT_TRANSPORTS = {
  stdio: '标准输入输出（本地进程）',
  http: 'HTTP / WebSocket 远程连接',
  ssh: 'SSH 远程终端',
  desktop: '桌面客户端',
  none: '无运行通道（纯面板 / 目录项）',
};

export const AGENT_PROTOCOLS = {
  acp: 'Agent Client Protocol（编辑器 / 客户端 ↔ Agent）',
  mcp: 'Model Context Protocol（工具 / 资源）',
  jsonl: 'JSONL 事件流',
  rest: 'REST 管理接口',
  pty: '伪终端 / 原始终端',
  native: '厂商私有协议',
};

export const AGENT_BACKEND_MODES = {
  acp: '原生 ACP 后端',
  'stdio-adapter': 'legacy stdio 适配器（不等于原生 ACP）',
  native: '厂商私有后端',
  none: '不启动 Agent 进程',
};

export const AGENT_SURFACES = ['catalog', 'detect', 'run', 'configure', 'generate'];

export const CAPABILITY_KEYS = [
  'streaming',
  'toolCalling',
  'vision',
  'embeddings',
  'audio',
  'reasoning',
  'promptCaching',
];

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const CREDENTIAL_SCHEMES = new Set([
  'bearer',
  'api-key-header',
  'query-param',
  'aws-sigv4',
  'azure-api-key',
  'cookie',
]);

const SECRET_KEY_RE = /(api[_-]?key|token|secret|password|access[_-]?key|cookie)/i;

const BILLING_TO_QUOTA = {
  payg: ['api-key'],
  subscription: ['subscription', 'session', 'mixed'],
  free: ['free'],
  mixed: ['mixed', 'api-key', 'subscription', 'free'],
  unknown: ['api-key', 'mixed', 'session'],
};

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isHttpUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isLocalHostUrl(v) {
  try {
    const u = new URL(v);
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(u.hostname);
  } catch {
    return false;
  }
}

function isTemplateUrl(v) {
  return typeof v === 'string' && v.includes('{') && v.includes('}');
}

function isUrlOrTemplate(v) {
  return isHttpUrl(v) || isTemplateUrl(v);
}

function validateField(field, ctx) {
  const errors = [];
  const warnings = [];
  const at = `${ctx}: fields["${field?.key ?? '?'}"]`;

  if (!isObject(field)) {
    return { errors: [`${at} 不是对象`], warnings };
  }
  if (!isNonEmptyString(field.key)) errors.push(`${at} 缺少 key`);
  if (!isNonEmptyString(field.label)) errors.push(`${at} 缺少 label`);
  if (!FIELD_TYPES.includes(field.type)) {
    errors.push(`${at} type 必须是 ${FIELD_TYPES.join(' / ')}`);
  }
  if (field.group !== undefined && !Object.hasOwn(FIELD_GROUPS, field.group)) {
    errors.push(`${at} group 必须是 ${Object.keys(FIELD_GROUPS).join(' / ')}`);
  }
  if (field.type === 'select') {
    if (!Array.isArray(field.options) || field.options.length < 2) {
      errors.push(`${at} select 至少需要 2 个 options`);
    } else {
      const values = new Set(field.options.map((o) => o.value));
      if (values.size !== field.options.length) {
        errors.push(`${at} options 的 value 不能重复`);
      }
      if (field.default !== undefined && !values.has(field.default)) {
        errors.push(`${at} default 不在 options 中`);
      }
    }
  }
  if (field.secret === true && field.type !== 'password') {
    warnings.push(`${at} 标记了 secret，但 type 不是 password（UI 可能明文展示）`);
  }
  if (field.type === 'password' && field.secret !== true) {
    errors.push(`${at} type=password 必须显式标 secret: true`);
  }
  return { errors, warnings };
}

function validateEndpoint(endpoint, ctx, index) {
  const errors = [];
  const warnings = [];
  const at = `${ctx}: endpoints[${index}]`;

  if (!isObject(endpoint)) {
    return { errors: [`${at} 不是对象`], warnings };
  }
  if (!isNonEmptyString(endpoint.id) || !ID_RE.test(endpoint.id)) {
    errors.push(`${at}.id 必须是小写 kebab-case`);
  }
  if (!isNonEmptyString(endpoint.label)) errors.push(`${at}.label 必填`);
  if (!Object.hasOwn(PROTOCOLS, endpoint.protocol)) {
    errors.push(`${at}.protocol 必须是 ${Object.keys(PROTOCOLS).join(' / ')}`);
  }
  if (endpoint.baseURL !== null && endpoint.baseURL !== undefined) {
    if (!isNonEmptyString(endpoint.baseURL)) {
      errors.push(`${at}.baseURL 必须是字符串或 null`);
    } else if (!isUrlOrTemplate(endpoint.baseURL)) {
      errors.push(`${at}.baseURL 不是合法 http(s) 地址或模板`);
    }
  }
  if (!Object.hasOwn(BILLING_MODES, endpoint.billing)) {
    errors.push(`${at}.billing 必须是 ${Object.keys(BILLING_MODES).join(' / ')}`);
  }
  if (endpoint.default !== undefined && typeof endpoint.default !== 'boolean') {
    errors.push(`${at}.default 必须是布尔值`);
  }
  if (endpoint.value !== undefined && !isNonEmptyString(endpoint.value)) {
    errors.push(`${at}.value 必须是非空字符串`);
  }
  if (endpoint.path !== undefined) {
    if (!isNonEmptyString(endpoint.path) || !endpoint.path.startsWith('/')) {
      errors.push(`${at}.path 必须以 / 开头`);
    }
  }
  if (endpoint.headers !== undefined) {
    if (!isObject(endpoint.headers)) {
      errors.push(`${at}.headers 必须是对象`);
    } else {
      for (const [key, value] of Object.entries(endpoint.headers)) {
        if (!isNonEmptyString(key) || typeof value !== 'string') {
          errors.push(`${at}.headers.${key} 必须是非空字符串`);
        }
      }
    }
  }
  // 接入面级鉴权覆盖：同一 Provider 的多个接入面可能要求不同 header（Anthropic 面 x-api-key、OpenAI 面 bearer）。
  if (endpoint.auth !== undefined) {
    if (!isObject(endpoint.auth)) {
      errors.push(`${at}.auth 必须是对象`);
    } else {
      if (!Object.hasOwn(AUTH_TYPES, endpoint.auth.scheme)) {
        errors.push(`${at}.auth.scheme 必须是 ${Object.keys(AUTH_TYPES).join(' / ')}`);
      }
      if (endpoint.auth.mode !== undefined && !Object.hasOwn(AUTH_MODES, endpoint.auth.mode)) {
        errors.push(`${at}.auth.mode 必须是 ${Object.keys(AUTH_MODES).join(' / ')}`);
      }
      if (endpoint.auth.scheme === 'api-key-header' && !isNonEmptyString(endpoint.auth.headerName)) {
        errors.push(`${at}.auth.scheme=api-key-header 时必须提供 auth.headerName`);
      }
      if (endpoint.auth.headerName !== undefined && !isNonEmptyString(endpoint.auth.headerName)) {
        errors.push(`${at}.auth.headerName 必须是非空字符串`);
      }
      if (endpoint.auth.queryName !== undefined && !isNonEmptyString(endpoint.auth.queryName)) {
        errors.push(`${at}.auth.queryName 必须是非空字符串`);
      }
    }
  }
  if (endpoint.note !== undefined && !isNonEmptyString(endpoint.note)) {
    warnings.push(`${at}.note 建议填写非空说明`);
  }
  return { errors, warnings };
}

/**
 * 校验单个 Provider。
 * @param {object} provider
 * @param {number} index
 * @param {{schemaVersion?: number}} options
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateProvider(provider, index = 0, options = {}) {
  const schemaVersion = options.schemaVersion ?? SCHEMA_VERSION;
  const v2 = schemaVersion >= 2;
  const errors = [];
  const warnings = [];

  if (!isObject(provider)) {
    return { errors: [`providers[${index}] 不是对象`], warnings };
  }

  const id = typeof provider.id === 'string' ? provider.id : `<index ${index}>`;
  const ctx = `provider "${id}"`;

  if (!isNonEmptyString(provider.id)) {
    errors.push(`${ctx} 缺少 id`);
  } else if (!ID_RE.test(provider.id)) {
    errors.push(`${ctx} id 必须是小写 kebab-case（如 volcengine-ark）`);
  }
  if (!isNonEmptyString(provider.name)) errors.push(`${ctx} 缺少 name`);

  if (!Object.hasOwn(KINDS, provider.kind)) {
    errors.push(`${ctx} kind 必须是 ${Object.keys(KINDS).join(' / ')}`);
  }
  if (!Object.hasOwn(CATEGORIES, provider.category)) {
    errors.push(`${ctx} category 必须是 ${Object.keys(CATEGORIES).join(' / ')}`);
  }
  if (!Object.hasOwn(AUTH_TYPES, provider.authType)) {
    errors.push(`${ctx} authType 必须是 ${Object.keys(AUTH_TYPES).join(' / ')}`);
  }
  if (!isNonEmptyString(provider.docs) || !isHttpUrl(provider.docs)) {
    errors.push(`${ctx} docs 必须是 http(s) 链接`);
  }

  // auth：v2 必填；v1 允许只有 authType。
  const auth = provider.auth;
  if (v2 || auth !== undefined) {
    if (!isObject(auth)) {
      errors.push(`${ctx} auth 必须是对象`);
    } else {
      if (!Object.hasOwn(AUTH_MODES, auth.mode)) {
        errors.push(`${ctx} auth.mode 必须是 ${Object.keys(AUTH_MODES).join(' / ')}`);
      }
      if (!Object.hasOwn(AUTH_TYPES, auth.scheme)) {
        errors.push(`${ctx} auth.scheme 必须是 ${Object.keys(AUTH_TYPES).join(' / ')}`);
      }
      if (auth.scheme !== provider.authType) {
        errors.push(`${ctx} auth.scheme(${auth.scheme}) 必须与顶层 authType(${provider.authType}) 一致`);
      }
      if (auth.mode === 'api-key') {
        if (!CREDENTIAL_SCHEMES.has(auth.scheme)) {
          errors.push(`${ctx} auth.mode=api-key 时 auth.scheme 必须是凭证类（${[...CREDENTIAL_SCHEMES].join(' / ')}）`);
        }
      }
      if (auth.mode === 'oauth' || auth.mode === 'device-code') {
        if (!isObject(auth.oauth)) {
          errors.push(`${ctx} auth.mode=${auth.mode} 必须提供 auth.oauth`);
        } else {
          const hasFlowUrl = ['authUrl', 'initiateUrl', 'pollUrlBase', 'tokenUrl'].some(
            (key) => isNonEmptyString(auth.oauth[key]),
          );
          if (!hasFlowUrl) {
            errors.push(`${ctx} auth.oauth 至少需要 authUrl / initiateUrl / pollUrlBase / tokenUrl 之一`);
          }
          for (const key of ['authUrl', 'initiateUrl', 'pollUrlBase', 'tokenUrl', 'refreshUrl']) {
            const value = auth.oauth[key];
            if (value !== undefined && !isHttpUrl(value)) {
              errors.push(`${ctx} auth.oauth.${key} 必须是 http(s) 链接`);
            }
          }
        }
      }
      if (auth.mode === 'browser-cookie' && auth.scheme !== 'cookie') {
        errors.push(`${ctx} auth.mode=browser-cookie 时 auth.scheme 必须是 cookie`);
      }
      if (auth.mode === 'none' && auth.scheme !== 'none') {
        errors.push(`${ctx} auth.mode=none 时 auth.scheme 必须是 none`);
      }
      if (auth.mode === 'local-session' && !['jwt-session', 'none', 'bearer'].includes(auth.scheme)) {
        warnings.push(`${ctx} auth.mode=local-session 通常使用 jwt-session / none / bearer`);
      }
    }
  }

  // 端点：v2 至少一个；旧版允许用 baseURL / endpoints 二选一。
  if (v2 || provider.endpoints !== undefined) {
    if (!Array.isArray(provider.endpoints) || provider.endpoints.length === 0) {
      errors.push(`${ctx} endpoints 必须是非空数组（v2 要求至少一个接入面）`);
    } else {
      const endpointIds = new Set();
      let defaultCount = 0;
      provider.endpoints.forEach((endpoint, endpointIndex) => {
        const res = validateEndpoint(endpoint, ctx, endpointIndex);
        errors.push(...res.errors);
        warnings.push(...res.warnings);
        if (endpoint?.id) {
          if (endpointIds.has(endpoint.id)) errors.push(`${ctx} endpoint id 重复：${endpoint.id}`);
          endpointIds.add(endpoint.id);
        }
        if (endpoint?.default === true) defaultCount += 1;
      });
      if (defaultCount === 0) errors.push(`${ctx} endpoints 必须恰好有一个 default: true`);
      if (defaultCount > 1) errors.push(`${ctx} endpoints 只能有一个 default: true`);
      const defaultEndpoint = provider.endpoints.find((endpoint) => endpoint.default === true);
      if (
        defaultEndpoint &&
        provider.baseURL !== null &&
        provider.baseURL !== undefined &&
        defaultEndpoint.baseURL !== provider.baseURL
      ) {
        warnings.push(`${ctx} 顶层 baseURL 与 default endpoint.baseURL 不一致（旧字段应投影到默认端点）`);
      }
    }
  } else if (provider.baseURL !== null && provider.baseURL !== undefined) {
    if (!isNonEmptyString(provider.baseURL)) {
      errors.push(`${ctx} baseURL 必须是字符串或 null`);
    } else if (provider.baseURL.includes('{')) {
      if (!isNonEmptyString(provider.baseURLTemplate)) {
        warnings.push(`${ctx} baseURL 含占位符，建议同时提供 baseURLTemplate`);
      }
    } else if (!isHttpUrl(provider.baseURL)) {
      errors.push(`${ctx} baseURL 不是合法 http(s) 地址`);
    }
  } else if (provider.kind !== 'session') {
    warnings.push(`${ctx} baseURL 为 null，确认是否真的没有固定端点`);
  }

  // 本地运行时
  if (provider.kind === 'local') {
    if (provider.authType !== 'none' && provider.authType !== 'bearer') {
      warnings.push(`${ctx} 本地运行时通常使用 none / bearer`);
    }
    if (provider.baseURL && !isLocalHostUrl(provider.baseURL) && !provider.baseURL.includes('{')) {
      warnings.push(`${ctx} kind=local 但 baseURL 不是本机地址`);
    }
  }

  // 会话型：仍然要求没有公开固定端点，但允许订阅/本地登录两种额度。
  if (provider.kind === 'session') {
    if (provider.authType !== 'jwt-session' && provider.authType !== 'cookie' && provider.authType !== 'none') {
      errors.push(`${ctx} kind=session 必须使用 authType=jwt-session / cookie / none`);
    }
    if (provider.baseURL !== null) {
      errors.push(`${ctx} kind=session 不允许声明公开固定 baseURL（应显式写 null）`);
    }
    if (!isObject(provider.session)) {
      errors.push(`${ctx} kind=session 缺少 session 元信息`);
    } else {
      if (typeof provider.session.refreshable !== 'boolean') {
        errors.push(`${ctx} session.refreshable 必须是布尔值`);
      }
      if (typeof provider.session.desktopOnly !== 'boolean') {
        errors.push(`${ctx} session.desktopOnly 必须是布尔值`);
      }
      if (!isNonEmptyString(provider.session.note)) {
        errors.push(`${ctx} session.note 必填（说明为什么不能只用 API Key）`);
      }
    }
    if (!isObject(provider.quota) || !['session', 'subscription'].includes(provider.quota.type)) {
      errors.push(`${ctx} kind=session 的 quota.type 必须是 session / subscription`);
    }
    const hasApiKeyField = (provider.fields ?? []).some(
      (f) => typeof f?.key === 'string' && f.key.toLowerCase() === 'apikey',
    );
    if (hasApiKeyField) {
      errors.push(`${ctx} 会话型 Provider 不应提供名为 apiKey 的字段（会误导为静态 Key 可用）`);
    }
  }

  // 额度 + 计费
  if (!isObject(provider.quota)) {
    errors.push(`${ctx} 缺少 quota`);
  } else if (!Object.hasOwn(QUOTA_TYPES, provider.quota.type)) {
    errors.push(`${ctx} quota.type 必须是 ${Object.keys(QUOTA_TYPES).join(' / ')}`);
  }
  if (v2 || provider.billing !== undefined) {
    if (!isObject(provider.billing)) {
      errors.push(`${ctx} billing 必须是对象`);
    } else {
      if (!Object.hasOwn(BILLING_MODES, provider.billing.mode)) {
        errors.push(`${ctx} billing.mode 必须是 ${Object.keys(BILLING_MODES).join(' / ')}`);
      }
      const allowedQuota = BILLING_TO_QUOTA[provider.billing.mode];
      if (allowedQuota && provider.quota?.type && !allowedQuota.includes(provider.quota.type)) {
        warnings.push(
          `${ctx} billing.mode=${provider.billing.mode} 与 quota.type=${provider.quota.type} 语义不一致`,
        );
      }
      if (provider.billing.note !== undefined && !isNonEmptyString(provider.billing.note)) {
        warnings.push(`${ctx} billing.note 建议填写非空说明`);
      }
    }
  }

  // 探测信息
  if (provider.probe !== undefined) {
    if (!isObject(provider.probe)) {
      errors.push(`${ctx} probe 必须是对象`);
    } else {
      for (const key of ['modelsUrl', 'authTestUrl']) {
        const value = provider.probe[key];
        if (value !== undefined && !(isHttpUrl(value) || isNonEmptyString(value))) {
          errors.push(`${ctx} probe.${key} 必须是 URL 或相对路径`);
        }
      }
      if (provider.probe.method !== undefined && !['GET', 'POST'].includes(provider.probe.method)) {
        errors.push(`${ctx} probe.method 只支持 GET / POST`);
      }
    }
  }

  // 风险元数据
  if (provider.risk !== undefined) {
    if (!isObject(provider.risk)) {
      errors.push(`${ctx} risk 必须是对象`);
    } else {
      if (!Object.hasOwn(RISK_LEVELS, provider.risk.level)) {
        errors.push(`${ctx} risk.level 必须是 ${Object.keys(RISK_LEVELS).join(' / ')}`);
      }
      if (!Object.hasOwn(RISK_VARIANTS, provider.risk.variant)) {
        errors.push(`${ctx} risk.variant 必须是 ${Object.keys(RISK_VARIANTS).join(' / ')}`);
      }
      if (!isNonEmptyString(provider.risk.note)) {
        errors.push(`${ctx} risk.note 必填`);
      }
      if (provider.risk.variant === 'browser-cookie' && provider.risk.level !== 'high') {
        warnings.push(`${ctx} browser-cookie 通常应标记 risk.level=high`);
      }
    }
  } else if (v2 && (provider.kind === 'session' || provider.quota?.type === 'subscription')) {
    warnings.push(`${ctx} 会话 / 订阅型建议声明 risk（说明额度边界或账号风险）`);
  }

  // 外部 ID 映射
  if (provider.externalIds !== undefined) {
    if (!isObject(provider.externalIds)) {
      errors.push(`${ctx} externalIds 必须是对象`);
    } else {
      for (const [key, value] of Object.entries(provider.externalIds)) {
        if (!isNonEmptyString(key) || !isNonEmptyString(value)) {
          errors.push(`${ctx} externalIds.${key} 必须是非空字符串`);
        }
      }
    }
  }

  // 运行时怪癖（WorkBuddy / CodeBuddy 这类网关会用到）
  if (provider.runtime !== undefined) {
    if (!isObject(provider.runtime)) {
      errors.push(`${ctx} runtime 必须是对象`);
    } else {
      for (const key of ['forceStream', 'strictChatHistory', 'passthroughModels', 'requiresReasoningEcho']) {
        if (provider.runtime[key] !== undefined && typeof provider.runtime[key] !== 'boolean') {
          errors.push(`${ctx} runtime.${key} 必须是布尔值`);
        }
      }
      const replacements = provider.runtime.bodyStringReplacements;
      if (replacements !== undefined) {
        if (!Array.isArray(replacements)) {
          errors.push(`${ctx} runtime.bodyStringReplacements 必须是数组`);
        } else {
          for (const [pairIndex, pair] of replacements.entries()) {
            if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(isNonEmptyString)) {
              errors.push(`${ctx} runtime.bodyStringReplacements[${pairIndex}] 必须是两个非空字符串`);
            }
          }
        }
      }
    }
  }

  // 图标
  if (!isObject(provider.icon)) {
    errors.push(`${ctx} 缺少 icon`);
  } else {
    if (!isNonEmptyString(provider.icon.slug)) errors.push(`${ctx} icon.slug 必填`);
    if (!['lobe-icons', 'favicon'].includes(provider.icon.source)) {
      errors.push(`${ctx} icon.source 只支持 lobe-icons / favicon`);
    }
    if (provider.icon.source === 'favicon' && !isNonEmptyString(provider.icon.url)) {
      errors.push(`${ctx} icon.source=favicon 时必须提供 icon.url`);
    }
  }

  // 能力
  if (!isObject(provider.capabilities)) {
    errors.push(`${ctx} 缺少 capabilities`);
  } else {
    for (const key of Object.keys(provider.capabilities)) {
      if (!CAPABILITY_KEYS.includes(key)) {
        warnings.push(`${ctx} capabilities.${key} 不是已登记的能力项，会被忽略`);
      }
      if (typeof provider.capabilities[key] !== 'boolean') {
        errors.push(`${ctx} capabilities.${key} 必须是布尔值`);
      }
    }
  }

  // 字段
  if (!Array.isArray(provider.fields) || provider.fields.length === 0) {
    errors.push(`${ctx} fields 至少需要一个字段`);
  } else {
    const keys = new Set();
    for (const field of provider.fields) {
      const res = validateField(field, ctx);
      errors.push(...res.errors);
      warnings.push(...res.warnings);
      if (field?.key) {
        if (keys.has(field.key)) errors.push(`${ctx} 字段 key 重复：${field.key}`);
        keys.add(field.key);
      }
    }

    const authField = provider.fields.find(
      (f) => (f?.group === 'auth' || SECRET_KEY_RE.test(f?.key ?? '')) && f?.secret === true,
    );
    if (provider.authType === 'none' || provider.auth?.mode === 'none') {
      const secretCount = provider.fields.filter((f) => f?.secret === true).length;
      if (secretCount > 0) warnings.push(`${ctx} authType=none 却存在 secret 字段`);
    } else if (
      CREDENTIAL_SCHEMES.has(provider.authType) &&
      !authField &&
      (provider.auth?.mode === undefined || provider.auth?.mode === 'api-key')
    ) {
      errors.push(`${ctx} authType=${provider.authType} 但没有任何 secret 鉴权字段`);
    }
    if (provider.auth?.mode === 'api-key' && !authField) {
      errors.push(`${ctx} auth.mode=api-key 但没有任何 secret 鉴权字段`);
    }
    if (provider.auth?.mode === 'oauth' || provider.auth?.mode === 'device-code') {
      const secretCount = provider.fields.filter((f) => f?.secret === true).length;
      if (secretCount > 0) {
        warnings.push(`${ctx} auth.mode=${provider.auth.mode} 通常不应该要求用户粘贴静态密钥`);
      }
    }
  }

  // 审计日期（仅作记录，不参与分类、筛选或徽标）
  if (provider.verifiedAt !== undefined) {
    if (!isNonEmptyString(provider.verifiedAt) || !DATE_RE.test(provider.verifiedAt)) {
      errors.push(`${ctx} verifiedAt 必须是 YYYY-MM-DD`);
    } else {
      const d = new Date(`${provider.verifiedAt}T00:00:00Z`);
      if (Number.isNaN(d.getTime())) {
        errors.push(`${ctx} verifiedAt 不是合法日期`);
      } else if (d.getTime() > Date.now() + 86400000) {
        errors.push(`${ctx} verifiedAt 不能是未来日期`);
      }
    }
  }

  // 备注：会话 / 订阅型必须有说明
  if (
    provider.kind === 'session' ||
    (isObject(provider.quota) && ['session', 'subscription'].includes(provider.quota.type))
  ) {
    if (!Array.isArray(provider.notes) || provider.notes.length === 0) {
      warnings.push(`${ctx} 会话 / 订阅型建议写 notes，说明额度与 API 余额的区别`);
    }
  }

  return { errors, warnings };
}

/**
 * 校验整个注册表（providers + agents 可分别传入）。
 */
export function validateRegistry(raw) {
  const errors = [];
  const warnings = [];

  if (!isObject(raw)) {
    return { errors: ['注册表根节点必须是对象（{ schemaVersion, providers }）'], warnings };
  }
  if (![1, 2].includes(raw.schemaVersion)) {
    errors.push('schemaVersion 只支持 1 / 2');
  }
  if (!isNonEmptyString(raw.updatedAt) || !DATE_RE.test(raw.updatedAt)) {
    errors.push('updatedAt 必须是 YYYY-MM-DD');
  }
  if (!Array.isArray(raw.providers) || raw.providers.length === 0) {
    errors.push('providers 必须是非空数组');
    return { errors, warnings };
  }

  const ids = new Set();
  const aliases = new Map();
  const externalIds = new Map();

  raw.providers.forEach((provider, index) => {
    const res = validateProvider(provider, index, { schemaVersion: raw.schemaVersion });
    errors.push(...res.errors);
    warnings.push(...res.warnings);

    if (provider?.id) {
      if (ids.has(provider.id)) errors.push(`provider id 重复：${provider.id}`);
      ids.add(provider.id);
    }
    for (const alias of provider?.aliases ?? []) {
      if (aliases.has(alias)) {
        errors.push(`alias "${alias}" 同时出现在 ${aliases.get(alias)} 与 ${provider.id}`);
      } else {
        aliases.set(alias, provider.id);
      }
    }
    for (const [source, value] of Object.entries(provider?.externalIds ?? {})) {
      const key = `${source}:${value}`;
      if (externalIds.has(key) && externalIds.get(key) !== provider.id) {
        warnings.push(`externalIds.${source}="${value}" 同时映射到 ${externalIds.get(key)} 与 ${provider.id}`);
      } else {
        externalIds.set(key, provider.id);
      }
    }
  });

  return { errors, warnings };
}

/**
 * 校验 agents.json（Agent / 运行时清单）。
 */
export function validateAgents(raw) {
  const errors = [];
  const warnings = [];

  if (!isObject(raw)) return { errors: ['agents 注册表根节点必须是对象'], warnings };
  if (![1, 2].includes(raw.schemaVersion)) {
    errors.push('agents schemaVersion 只支持 1 / 2');
  }
  if (!Array.isArray(raw.agents) || raw.agents.length === 0) {
    errors.push('agents 必须是非空数组');
    return { errors, warnings };
  }

  const v2 = raw.schemaVersion >= 2;
  const ids = new Set();
  const kinds = new Set(['cli', 'desktop', 'runtime', 'panel']);
  const legacyProtocols = new Set(['acp', 'mcp', 'stdio', 'http', 'ssh']);

  raw.agents.forEach((agent, index) => {
    const at = `agents[${index}]`;
    if (!isObject(agent)) {
      errors.push(`${at} 不是对象`);
      return;
    }
    if (!isNonEmptyString(agent.id) || !ID_RE.test(agent.id)) {
      errors.push(`${at}.id 必须是小写 kebab-case`);
    } else if (ids.has(agent.id)) {
      errors.push(`agent id 重复：${agent.id}`);
    } else {
      ids.add(agent.id);
    }
    if (!isNonEmptyString(agent.name)) errors.push(`${at}.name 必填`);
    if (!kinds.has(agent.kind)) errors.push(`${at}.kind 必须是 ${[...kinds].join(' / ')}`);

    // transports：v2 必填；兼容单数 transport。
    if (v2 || agent.transports !== undefined || agent.transport !== undefined) {
      const transports = agent.transports ?? (agent.transport ? [agent.transport] : null);
      if (!Array.isArray(transports) || transports.length === 0) {
        errors.push(`${at}.transports 必须是非空数组`);
      } else {
        for (const transport of transports) {
          if (!Object.hasOwn(AGENT_TRANSPORTS, transport)) {
            errors.push(`${at}.transports 含未知传输：${transport}`);
          }
        }
      }
    }

    // protocols：只放应用层协议，不再混 stdio/http/ssh。
    if (!Array.isArray(agent.protocols)) {
      errors.push(`${at}.protocols 必须是数组`);
    } else if (agent.protocols.length === 0 && !v2) {
      warnings.push(`${at}.protocols 为空：确认该 Agent 确实不对外暴露协议`);
    } else {
      for (const protocol of agent.protocols) {
        if (v2 && !Object.hasOwn(AGENT_PROTOCOLS, protocol)) {
          if (legacyProtocols.has(protocol)) {
            errors.push(`${at}.protocols 里的 "${protocol}" 是传输层，应放到 transports`);
          } else {
            warnings.push(`${at}.protocols 含未知协议：${protocol}`);
          }
        } else if (!v2 && !legacyProtocols.has(protocol) && !Object.hasOwn(AGENT_PROTOCOLS, protocol)) {
          warnings.push(`${at}.protocols 含未知协议：${protocol}`);
        }
      }
    }

    if (agent.runtime !== undefined) {
      if (!isObject(agent.runtime)) {
        errors.push(`${at}.runtime 必须是对象`);
      } else {
        if (agent.runtime.binary !== undefined && !isNonEmptyString(agent.runtime.binary)) {
          errors.push(`${at}.runtime.binary 必须是非空字符串`);
        }
        for (const key of ['versionArgs', 'spawnArgs']) {
          if (agent.runtime[key] !== undefined) {
            if (!Array.isArray(agent.runtime[key]) || !agent.runtime[key].every((v) => typeof v === 'string')) {
              errors.push(`${at}.runtime.${key} 必须是字符串数组`);
            }
          }
        }
        if (agent.runtime.backendMode !== undefined && !Object.hasOwn(AGENT_BACKEND_MODES, agent.runtime.backendMode)) {
          errors.push(`${at}.runtime.backendMode 必须是 ${Object.keys(AGENT_BACKEND_MODES).join(' / ')}`);
        }
      }
    }

    if (agent.configure !== undefined) {
      if (!isObject(agent.configure)) {
        errors.push(`${at}.configure 必须是对象`);
      } else {
        if (agent.configure.paths !== undefined) {
          if (!isObject(agent.configure.paths)) {
            errors.push(`${at}.configure.paths 必须是对象`);
          } else {
            for (const [platform, paths] of Object.entries(agent.configure.paths)) {
              if (!['linux', 'darwin', 'win32'].includes(platform)) {
                errors.push(`${at}.configure.paths.${platform} 只支持 linux / darwin / win32`);
              }
              if (!Array.isArray(paths) || !paths.every((v) => typeof v === 'string' && v.length > 0)) {
                errors.push(`${at}.configure.paths.${platform} 必须是字符串数组`);
              }
            }
          }
        }
        if (agent.configure.recipe !== undefined && !isNonEmptyString(agent.configure.recipe)) {
          errors.push(`${at}.configure.recipe 必须是非空字符串`);
        }
      }
    }

    if (agent.providerAlias !== undefined && !isNonEmptyString(agent.providerAlias)) {
      errors.push(`${at}.providerAlias 必须是非空字符串`);
    }

    if (agent.surfaces !== undefined) {
      if (!Array.isArray(agent.surfaces) || !agent.surfaces.every((s) => AGENT_SURFACES.includes(s))) {
        errors.push(`${at}.surfaces 必须是 ${AGENT_SURFACES.join(' / ')} 的子集`);
      }
    }

    if (!Array.isArray(agent.notes)) warnings.push(`${at}.notes 建议填写（会话 / 额度注意事项）`);
  });

  return { errors, warnings };
}
