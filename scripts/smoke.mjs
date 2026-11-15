/**
 * 零依赖 smoke test：校验 Schema v2 的关键语义，而不是只数条数。
 * 用法：node scripts/smoke.mjs
 *
 * v0.3.2 起增加「导入条目全量契约」断言（不再抽样）：
 * - 每条 imported 的 requestURL 与 OmniRoute 源金标准逐一比对（scripts/omniroute-url-fixture.json）
 * - 导入项状态 / verifiedAt / baseURL 残留路径
 * - 鉴权：api-key-header 必须有 headerName（Provider 级或接入面级）
 * - anthropic-messages 接入面必须携带 anthropic-version
 * - 全表无 requestURL + 鉴权重复、externalIds 无一对多
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { loadRegistry } from '../src/node.mjs';
import { buildRequestConfig, resolveEndpoint } from '../src/fields.mjs';
import { getQuotaWarning } from '../src/registry.mjs';

const { registry } = await loadRegistry();
const tiersData = JSON.parse(readFileSync(new URL('../data/tiers.json', import.meta.url), 'utf8'));
const { resolveTierProviders } = await import('../src/tiers.mjs');

assert.equal(registry.providers.length, 120, 'Provider 数量应为 120');
assert.equal(registry.providers.filter((p) => p.tags?.includes('imported')).length, 96, 'OmniRoute 导入条目应为 96');
assert.equal(registry.agents.length, 8, 'Agent 数量应为 8');

// Z.ai：标准 API / Coding Plan OpenAI / Coding Plan Anthropic 三个接入面。
const zai = registry.getProvider('zai');
assert.equal(zai.endpoints.length, 3);
assert.equal(resolveEndpoint(zai, {}).id, 'payg');
assert.equal(resolveEndpoint(zai, { endpoint: 'coding-anthropic' }).protocol, 'anthropic-messages');

const zaiAnthropic = buildRequestConfig(zai, { endpoint: 'coding-anthropic', apiKey: 'test' });
assert.equal(zaiAnthropic.baseURL, 'https://api.z.ai/api/anthropic');
assert.equal(zaiAnthropic.requestURL, 'https://api.z.ai/api/anthropic/v1/messages');
assert.equal(zaiAnthropic.headers['anthropic-version'], '2023-06-01');
assert.equal(zaiAnthropic.missing.length, 0);

// Coding Plan 的 OpenAI 端点不应该带 Anthropic 版本头。
const zaiOpenAI = buildRequestConfig(zai, { endpoint: 'coding-openai', apiKey: 'test' });
assert.equal(zaiOpenAI.requestURL, 'https://api.z.ai/api/coding/paas/v4/chat/completions');
assert.equal(zaiOpenAI.headers['anthropic-version'], undefined);

// Z.ai Coding Plan 已合并进 zai 主条目，旧 ID 通过 alias 仍可解析。
const zaiPlan = registry.getProvider('zai-coding-plan');
assert.equal(zaiPlan.id, 'zai');
assert.equal(zaiPlan.auth.mode, 'api-key');
assert.equal(zaiPlan.kind, 'api');
assert.equal(resolveEndpoint(zaiPlan, { endpoint: 'coding-anthropic' }).baseURL, 'https://api.z.ai/api/anthropic');
assert.equal(buildRequestConfig(zaiPlan, { endpoint: 'coding-anthropic', apiKey: 'test' }).requestURL, 'https://api.z.ai/api/anthropic/v1/messages');

// 当前数据只保留 API Key 可直连条目；session-only 不应再混入。
for (const id of ['zai-coding-plan-session', 'doubao-desktop', 'workbuddy', 'codebuddy-cn', 'codebuddy-intl']) {
  assert.equal(registry.getProvider(id), null, `${id} 应从数据中移除`);
}
assert.equal(
  registry.providers.filter((p) => ['local-session', 'device-code', 'browser-cookie'].includes(p.auth?.mode)).length,
  0,
  '不应保留 session-only 鉴权条目',
);
assert.equal(getQuotaWarning(registry.getProvider('gitlawb')), null, '高风险提示不应与 provider.risk 重复渲染');

// 火山方舟：标准 API、Coding Plan、Agent Plan 合并为一条，三个接入面。
const ark = registry.getProvider('volcengine-ark');
assert.equal(ark.billing.mode, 'mixed');
assert.equal(resolveEndpoint(ark, { endpoint: 'coding' }).baseURL, 'https://ark.cn-beijing.volces.com/api/coding/v3');
assert.equal(resolveEndpoint(ark, { endpoint: 'agent' }).baseURL, 'https://ark.cn-beijing.volces.com/api/plan/v3');
assert.equal(registry.getProvider('volcengine-coding-plan').id, 'volcengine-ark');
assert.equal(registry.getProvider('volcengine-agent-plan').id, 'volcengine-ark');

// Agent manifest：transport 和 protocol 分开。
const claude = registry.getAgent('claude-code');
assert.deepEqual(claude.transports, ['stdio']);
assert.deepEqual(claude.protocols, ['mcp']);
assert.equal(claude.runtime.backendMode, 'stdio-adapter');
assert.equal(claude.configure.paths.linux[0], '.claude/settings.json');

const herdr = registry.getAgent('herdr');
assert.deepEqual(herdr.transports, ['ssh', 'http']);
assert.deepEqual(herdr.protocols, ['pty', 'rest']);

// ============ 导入条目全量契约（v0.3.1） ============
const imported = registry.providers.filter((p) => p.tags?.includes('imported'));

// 1) requestURL 与 OmniRoute 源金标准逐一比对（96 条全量，不是抽样）
const fixture = JSON.parse(readFileSync(new URL('./omniroute-url-fixture.json', import.meta.url), 'utf8'));
assert.equal(Object.keys(fixture).length, imported.length, 'requestURL 金标准条数应与导入条目一致');
for (const provider of imported) {
  assert.ok(fixture[provider.id], `${provider.id} 缺少 requestURL 金标准`);
  const url = buildRequestConfig(provider, { apiKey: 'test' }).requestURL;
  assert.equal(url, fixture[provider.id], `${provider.id} 的 requestURL 与源不一致`);
}

// 2) 状态：全部 reference，且没有伪造 verifiedAt
for (const provider of imported) {
  assert.equal(provider.status, 'reference', `${provider.id} 状态应为 reference`);
  assert.equal(provider.verifiedAt, undefined, `${provider.id} 不应带 verifiedAt`);
}

// 3) baseURL 不得残留端点路径（路径必须拆到 endpoint.path）
for (const provider of imported) {
  assert.ok(
    !/\/(chat\/completions|completions|messages|responses)$/.test(provider.baseURL),
    `${provider.id} 的 baseURL 仍残留端点路径：${provider.baseURL}`,
  );
}

// 4) 鉴权：api-key-header 必须能拿到 headerName（Provider 级或接入面级）
for (const provider of registry.providers) {
  for (const endpoint of provider.endpoints) {
    const scheme = endpoint.auth?.scheme ?? provider.auth?.scheme;
    if (scheme === 'api-key-header') {
      assert.ok(
        endpoint.auth?.headerName ?? provider.auth?.headerName,
        `${provider.id}/${endpoint.id} 的 api-key-header 缺少 headerName`,
      );
    }
  }
}

// 5) Anthropic Messages 接入面必须携带 anthropic-version（导入项；手工条目由维护者自行负责）
for (const provider of imported) {
  for (const endpoint of provider.endpoints) {
    if (endpoint.protocol !== 'anthropic-messages') continue;
    const headers = { ...(provider.auth?.extraHeaders ?? {}), ...(endpoint.headers ?? {}) };
    assert.ok(headers['anthropic-version'], `${provider.id}/${endpoint.id} 缺少 anthropic-version`);
  }
}

// 6) 全表不得出现 requestURL + 鉴权完全相同的重复条目
const seen = new Map();
for (const provider of registry.providers) {
  const cfg = buildRequestConfig(provider, { apiKey: 'test' });
  if (!cfg.requestURL) continue; // 会话型 Provider 无公开固定端点，不参与 URL 去重
  const key = `${cfg.requestURL}|${cfg.authMode}|${cfg.headers.Authorization === undefined ? '' : 'bearer'}${
    cfg.headers['x-api-key'] === undefined ? '' : ':x-api-key'
  }`;
  assert.equal(seen.has(key), false, `${provider.id} 与 ${seen.get(key)} 的 requestURL + 鉴权完全重复`);
  seen.set(key, provider.id);
}

// 7) externalIds 不得把一个源 ID 映射到两个条目
const extSeen = new Map();
for (const provider of registry.providers) {
  for (const [source, value] of Object.entries(provider.externalIds ?? {})) {
    const key = `${source}:${value}`;
    assert.equal(extSeen.has(key), false, `${key} 同时映射到 ${extSeen.get(key)} 与 ${provider.id}`);
    extSeen.set(key, provider.id);
  }
}

// 8) 接入面级鉴权覆盖生效：同一 Provider 的两个接入面可以发不同的头
const agentrouter = registry.getProvider('agentrouter');
assert.equal(buildRequestConfig(agentrouter, { apiKey: 'test' }).headers['x-api-key'], 'test');
assert.equal(buildRequestConfig(agentrouter, { endpoint: 'openai', apiKey: 'test' }).headers.Authorization, 'Bearer test');
assert.equal(
  buildRequestConfig(agentrouter, { endpoint: 'openai-responses', apiKey: 'test' }).requestURL,
  'https://agentrouter.org/v1/responses',
);

// 9) 审计修复回归点
assert.equal(
  buildRequestConfig(registry.getProvider('gitlawb'), { apiKey: 'test' }).requestURL,
  'https://opengateway.gitlawb.com/v1/xiaomi-mimo',
  'gitlawb 应保持裸 baseURL',
);
assert.equal(
  buildRequestConfig(registry.getProvider('gitlawb'), { endpoint: 'gmi-cloud', apiKey: 'test' }).requestURL,
  'https://opengateway.gitlawb.com/v1/gmi-cloud',
  'gitlawb GMI 上游应保持裸 baseURL',
);
assert.equal(
  buildRequestConfig(registry.getProvider('moonshot-kimi'), { endpoint: 'kimi-code', apiKey: 'test' }).requestURL,
  'https://api.kimi.com/coding/v1/messages?beta=true',
);
assert.equal(resolveEndpoint(registry.getProvider('moonshot-kimi'), { endpoint: 'kimi-code' }).auth.headerName, 'x-api-key');
assert.equal(registry.getProvider('kimi-coding-apikey').id, 'moonshot-kimi');
for (const removed of ['cline', 'kilocode', 'blackbox', 'sparkdesk']) {
  assert.equal(registry.providers.some((p) => p.id === removed), false, `${removed} 应已移除`);
}

// 10) 计费 / 风险 / 归类 / 映射语义
assert.equal(registry.getProvider('sensenova').billing.mode, 'subscription');
for (const id of ['apmix', 'openadapter', 'factory']) {
  assert.equal(registry.getProvider(id).billing.mode, 'subscription', `${id} 应为 subscription`);
  assert.equal(registry.getProvider(id).quota.type, 'subscription', `${id} quota 应同步`);
}
assert.equal(registry.getProvider('gitlawb').risk.level, 'high');
assert.equal(registry.getProvider('gitlawb-gmi').risk.variant, 'unsupported');
assert.equal(registry.getProvider('vercel-ai-gateway').risk.level, 'low');
assert.equal(registry.getProvider('tabitoken').category, 'aggregator');
assert.equal(registry.getProvider('tencent-hunyuan').externalIds.omniroute, 'tencent');
assert.equal(registry.getProvider('dashscope').externalIds.omniroute, 'alibaba-cn');

// 11) Provider 分层：Starter 全 verified；Mainstream 37；Full 等于全量
for (const tier of tiersData.tiers) {
  const selected = resolveTierProviders(registry.providers, tiersData, tier.id);
  assert.equal(selected.length, tier.count, `${tier.id} 条数`);
  if (tier.id === 'starter') {
    assert.equal(selected.filter((p) => p.status === 'verified').length, tier.count, 'starter 必须全 verified');
  }
}
assert.equal(resolveTierProviders(registry.providers, tiersData, 'starter').length, 12);
assert.equal(resolveTierProviders(registry.providers, tiersData, 'mainstream').length, 37);
assert.equal(resolveTierProviders(registry.providers, tiersData, 'full').length, registry.providers.length);

console.log(`smoke ok: ${registry.providers.length} providers / ${registry.agents.length} agents / ${imported.length} imported`);
