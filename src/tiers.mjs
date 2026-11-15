/**
 * Tier 解析：把展示分层与 Provider 数据解耦。
 * tiers.json 只保存 provider id 列表；不存在任何 Provider 事实副本。
 */
export function getTierDefinition(tiersData, tierId) {
  const tiers = tiersData?.tiers ?? tiersData ?? [];
  return tiers.find((tier) => tier.id === tierId) ?? null;
}

export function resolveTierProviders(providers, tiersData, tierId = 'starter') {
  const tier = getTierDefinition(tiersData, tierId);
  if (!tier) throw new Error(`Unknown provider tier: ${tierId}`);
  if (tier.allProviders) return [...providers];
  const byId = new Map(providers.map((provider) => [provider.id, provider]));
  const selected = (tier.providerIds ?? []).map((id) => byId.get(id)).filter(Boolean);
  if (selected.length !== (tier.providerIds ?? []).length) {
    const missing = (tier.providerIds ?? []).filter((id) => !byId.has(id));
    throw new Error(`Tier ${tierId} references missing providers: ${missing.join(', ')}`);
  }
  return selected;
}
