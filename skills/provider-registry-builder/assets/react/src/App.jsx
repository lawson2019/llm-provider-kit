import { useMemo, useState } from 'react';
import registryData from './data/providers.json';
import tierMeta from './data/tier.json';
import { createRegistry, getQuotaWarning } from './registry/index.mjs';
import ProviderForm from './ProviderForm.jsx';

const registry = createRegistry(registryData);

const CATEGORY_LABEL = {
  global: '海外',
  china: '国内',
  aggregator: '聚合 / 网关',
  local: '本地',
};

function StatusPill({ provider }) {
  return (
    <span className="status-line">
      <span className={`pill ${provider.status}`}>{provider.status}</span>
      {provider.risk?.variant === 'unsupported' && <span className="pill unsupported">unsupported</span>}
      {provider.risk?.level && (
        <span className={`pill risk-${provider.risk.level}`}>{provider.risk.level} risk</span>
      )}
    </span>
  );
}

export default function App() {
  const providers = registry.providers;
  const requestedId = new URLSearchParams(location.search).get('provider');
  const [providerId, setProviderId] = useState(
    requestedId && registry.getProvider(requestedId) ? requestedId : providers[0]?.id ?? '',
  );
  const [query, setQuery] = useState('');
  const [values, setValues] = useState({});
  const provider = registry.getProvider(providerId) ?? providers[0];
  const quotaWarning = getQuotaWarning(provider);
  const matchedProviders = providers.filter((item) => {
    const text = `${item.id} ${item.name}`.toLowerCase();
    return !query.trim() || text.includes(query.trim().toLowerCase());
  });
  // 搜索无结果时仍保留当前 Provider，避免 select 的 value 脱离选项。
  const visibleProviders = matchedProviders.length
    ? matchedProviders
    : providers.filter((item) => item.id === provider.id);

  const selectedValues = useMemo(() => values[provider.id] ?? {}, [values, provider.id]);

  function change(key, value) {
    setValues((prev) => ({
      ...prev,
      [provider.id]: { ...(prev[provider.id] ?? {}), [key]: value },
    }));
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <div className="eyebrow">Provider Registry · {tierMeta.label}</div>
          <h1>把 Key 配置页接进你的项目</h1>
          <p className="lede">
            {tierMeta.count} 个 Provider 来自 <code>data/providers.json</code>，
            表单字段由 <code>getFormFields()</code> 直接推导，没有手写字段。
          </p>
        </div>
        <div className="tier-card">
          <b>{tierMeta.count}</b>
          <span>{tierMeta.label} Providers</span>
          <small>{tierMeta.referenceCount ? 'reference ≠ verified' : '全部 verified'}</small>
        </div>
      </header>

      <section className="panel">
        <div className="provider-picker">
          <label className="provider-select">
            <span>Provider（{visibleProviders.length} / {providers.length}）</span>
            <input
              type="search"
              value={query}
              placeholder="搜索 id / 名称…"
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                const matches = providers.filter((item) =>
                  `${item.id} ${item.name}`.toLowerCase().includes(next.trim().toLowerCase()),
                );
                if (matches.length && !matches.some((item) => item.id === provider.id)) {
                  setProviderId(matches[0].id);
                }
              }}
            />
            <select value={provider.id} onChange={(event) => setProviderId(event.target.value)}>
              {visibleProviders.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {CATEGORY_LABEL[item.category] ?? item.category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="provider-head">
          <div>
            <h2>{provider.name}</h2>
            <p>{provider.id} · {CATEGORY_LABEL[provider.category] ?? provider.category} · {provider.endpoints?.length ?? 1} 个接入面</p>
          </div>
          <StatusPill provider={provider} />
        </div>

        {provider.risk?.note && !quotaWarning && <p className="risk-note">{provider.risk.note}</p>}

        <ProviderForm provider={provider} values={selectedValues} onChange={change} />
      </section>

      <footer>
        <span>数据源：data/providers.json</span>
        <span>生成器：provider-registry-builder</span>
      </footer>
    </main>
  );
}
