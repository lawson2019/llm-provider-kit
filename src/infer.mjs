/**
 * Schema v2 的兼容投影：旧字段 authType / quota 仍可用于推导，
 * 但 auth.mode / billing.mode 一旦存在就是权威值。
 */

export function inferAuthMode(provider) {
  if (provider.auth?.mode) return provider.auth.mode;
  if (provider.kind === 'session') return 'local-session';
  if (provider.authType === 'none') return 'none';
  return 'api-key';
}

export function inferBillingMode(provider) {
  if (provider.billing?.mode) return provider.billing.mode;
  const quota = provider.quota?.type;
  if (quota === 'subscription' || quota === 'session') return 'subscription';
  if (quota === 'free') return 'free';
  if (quota === 'mixed') return 'mixed';
  return 'payg';
}
