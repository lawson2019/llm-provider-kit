<script>
  import registryData from './data/providers.json';
  import tierMeta from './data/tier.json';
  import { createRegistry, getQuotaWarning } from './registry/index.mjs';
  import ProviderForm from './ProviderForm.svelte';

  const registry = createRegistry(registryData);
  const providers = registry.providers;

  const CATEGORY_LABEL = {
    global: '海外',
    china: '国内',
    aggregator: '聚合 / 网关',
    local: '本地',
  };

  const requestedId = new URLSearchParams(location.search).get('provider');
  let providerId = requestedId && registry.getProvider(requestedId) ? requestedId : providers[0]?.id ?? '';
  let query = '';
  let values = {};

  $: provider = registry.getProvider(providerId) ?? providers[0];
  $: quotaWarning = getQuotaWarning(provider);
  $: matchedProviders = providers.filter((item) => {
    const text = `${item.id} ${item.name}`.toLowerCase();
    return !query.trim() || text.includes(query.trim().toLowerCase());
  });
  // 搜索无结果时仍保留当前 Provider，避免 select 的 value 脱离选项。
  $: visibleProviders = matchedProviders.length
    ? matchedProviders
    : providers.filter((item) => item.id === provider.id);
  $: selectedValues = values[provider.id] ?? {};

  function change(event) {
    const { key, value } = event.detail;
    values = {
      ...values,
      [provider.id]: { ...(values[provider.id] ?? {}), [key]: value },
    };
  }

  function onSearch(event) {
    const next = event.target.value;
    query = next;
    const matches = providers.filter((item) =>
      `${item.id} ${item.name}`.toLowerCase().includes(next.trim().toLowerCase()),
    );
    if (matches.length && !matches.some((item) => item.id === provider.id)) {
      providerId = matches[0].id;
    }
  }
</script>

<main class="shell">
  <header class="hero">
    <div>
      <div class="eyebrow">Provider Registry · {tierMeta.label}</div>
      <h1>把 Key 配置页接进你的项目</h1>
      <p class="lede">
        {tierMeta.count} 个 Provider 来自 <code>data/providers.json</code>，
        表单字段由 <code>getFormFields()</code> 直接推导，没有手写字段。
      </p>
    </div>
    <div class="tier-card">
      <b>{tierMeta.count}</b>
      <span>{tierMeta.label} Providers</span>
      <small>{tierMeta.description ?? ''}</small>
    </div>
  </header>

  <section class="panel">
    <div class="provider-picker">
      <label class="provider-select">
        <span>Provider（{visibleProviders.length} / {providers.length}）</span>
        <input type="search" value={query} placeholder="搜索 id / 名称…" on:input={onSearch} />
        <select value={provider.id} on:change={(e) => (providerId = e.target.value)}>
          {#each visibleProviders as item (item.id)}
            <option value={item.id}>{item.name} · {CATEGORY_LABEL[item.category] ?? item.category}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="provider-head">
      <div>
        <h2>{provider.name}</h2>
        <p>{provider.id} · {CATEGORY_LABEL[provider.category] ?? provider.category} · {provider.endpoints?.length ?? 1} 个接入面</p>
      </div>
      <div class="pill-line">
        {#if provider.risk?.variant === 'unsupported'}<span class="pill unsupported">unsupported</span>{/if}
        {#if provider.risk?.level}<span class={`pill risk-${provider.risk.level}`}>{provider.risk.level} risk</span>{/if}
      </div>
    </div>

    {#if provider.risk?.note && !quotaWarning}
      <p class="risk-note">{provider.risk.note}</p>
    {/if}

    <ProviderForm {provider} values={selectedValues} on:change={change} />
  </section>

  <footer>
    <span>数据源：data/providers.json</span>
    <span>生成器：llm-provider-kit</span>
  </footer>
</main>
