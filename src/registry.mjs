/**
 * 纯函数查询层：不读文件、不依赖 Node API，浏览器 / 打包器可直接用。
 */

import { inferAuthMode, inferBillingMode } from './infer.mjs';

export function getProviderEndpoints(provider) {
  if (Array.isArray(provider?.endpoints) && provider.endpoints.length > 0) {
    return provider.endpoints;
  }
  return provider?.baseURL
    ? [
        {
          id: 'default',
          label: '默认端点',
          protocol: 'unknown',
          baseURL: provider.baseURL,
          billing: inferBillingMode(provider),
          default: true,
        },
      ]
    : [];
}

export function createRegistry(data) {
  const providers = data?.providers ?? [];
  const agents = data?.agents ?? [];
  const byId = new Map(providers.map((p) => [p.id, p]));
  const byAlias = new Map(
    providers.flatMap((p) => (p.aliases ?? []).map((alias) => [alias, p])),
  );
  const agentsById = new Map(agents.map((a) => [a.id, a]));

  return {
    providers,
    agents,
    getProvider(id) {
      return byId.get(id) ?? byAlias.get(id) ?? null;
    },
    getAgent(id) {
      return agentsById.get(id) ?? null;
    },
    listProviders(filter = {}) {
      return filterProviders(providers, filter);
    },
    listAgents(filter = {}) {
      return filterAgents(agents, filter);
    },
    stats() {
      return providerStats(providers);
    },
  };
}

/**
 * @param {object[]} providers
 * @param {{ q?: string, category?: string, kind?: string, authType?: string,
 *           authMode?: string, capability?: string, quota?: string, billing?: string,
 *           protocol?: string }} filter
 */
export function filterProviders(providers, filter = {}) {
  const q = filter.q?.trim().toLowerCase();

  return providers.filter((provider) => {
    if (filter.category && provider.category !== filter.category) return false;
    if (filter.kind && provider.kind !== filter.kind) return false;
    if (filter.authMode && inferAuthMode(provider) !== filter.authMode) return false;
    if (filter.authType) {
      const authMatches =
        provider.authType === filter.authType ||
        provider.auth?.scheme === filter.authType ||
        inferAuthMode(provider) === filter.authType;
      if (!authMatches) return false;
    }
    if (filter.billing && inferBillingMode(provider) !== filter.billing) return false;
    if (filter.quota && provider.quota?.type !== filter.quota && inferBillingMode(provider) !== filter.quota) {
      return false;
    }
    if (filter.capability && provider.capabilities?.[filter.capability] !== true) return false;
    if (filter.protocol) {
      const endpoints = getProviderEndpoints(provider);
      if (!endpoints.some((endpoint) => endpoint.protocol === filter.protocol)) return false;
    }

    if (!q) return true;
    const haystack = [
      provider.id,
      provider.name,
      ...(provider.aliases ?? []),
      provider.kind,
      provider.category,
      provider.authType,
      provider.auth?.mode,
      provider.auth?.scheme,
      provider.billing?.mode,
      provider.quota?.type,
      ...getProviderEndpoints(provider).flatMap((endpoint) => [
        endpoint.id,
        endpoint.label,
        endpoint.protocol,
        endpoint.baseURL,
      ]),
      ...(provider.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function filterAgents(agents, filter = {}) {
  const q = filter.q?.trim().toLowerCase();
  return agents.filter((agent) => {
    if (filter.kind && agent.kind !== filter.kind) return false;
    if (filter.protocol && !(agent.protocols ?? []).includes(filter.protocol)) return false;
    if (filter.transport && !(agent.transports ?? []).includes(filter.transport)) return false;
    if (filter.surface && !(agent.surfaces ?? []).includes(filter.surface)) return false;
    if (!q) return true;
    const haystack = [
      agent.id,
      agent.name,
      agent.vendor,
      ...(agent.transports ?? []),
      ...(agent.protocols ?? []),
      ...(agent.surfaces ?? []),
      agent.runtime?.binary,
      ...(agent.notes ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function providerStats(providers) {
  const byCategory = {};
  const byKind = {};
  const byAuthType = {};
  const byAuthMode = {};
  const byBilling = {};
  const byQuota = {};
  const byProtocol = {};

  for (const provider of providers) {
    byCategory[provider.category] = (byCategory[provider.category] ?? 0) + 1;
    byKind[provider.kind] = (byKind[provider.kind] ?? 0) + 1;
    byAuthType[provider.authType] = (byAuthType[provider.authType] ?? 0) + 1;

    const authMode = inferAuthMode(provider);
    byAuthMode[authMode] = (byAuthMode[authMode] ?? 0) + 1;

    const billing = inferBillingMode(provider);
    byBilling[billing] = (byBilling[billing] ?? 0) + 1;

    const quota = provider.quota?.type ?? 'unknown';
    byQuota[quota] = (byQuota[quota] ?? 0) + 1;

    for (const endpoint of getProviderEndpoints(provider)) {
      const protocol = endpoint.protocol ?? 'unknown';
      byProtocol[protocol] = (byProtocol[protocol] ?? 0) + 1;
    }
  }

  return {
    total: providers.length,
    byCategory,
    byKind,
    byAuthType,
    byAuthMode,
    byBilling,
    byQuota,
    byProtocol,
  };
}

/**
 * 会话型 / 订阅型 Provider 的安全提示，供配置页顶部展示。
 */
export function getQuotaWarning(provider) {
  if (provider.kind === 'session') {
    return {
      level: 'warning',
      title: '会话型 Provider：不能用静态 API Key 配置',
      detail:
        provider.session?.note ??
        provider.risk?.note ??
        '额度绑定已登录客户端，JWT 会过期并刷新，不能长期保存。',
    };
  }
  if (inferAuthMode(provider) === 'local-session') {
    return {
      level: 'info',
      title: '本地登录态：可留空密钥，由本机客户端签发请求',
      detail:
        provider.risk?.note ??
        '如果填写了 API Key，则优先走静态 Key；否则需要保持本机客户端已登录。',
    };
  }
  if (inferBillingMode(provider) === 'subscription') {
    return {
      level: 'info',
      title: '订阅额度与 API 余额是两套账',
      detail:
        provider.billing?.note ??
        provider.quota?.note ??
        '订阅计划不一定会抵扣 API 调用；接入前确认端点与套餐。',
    };
  }
  return null;
}
