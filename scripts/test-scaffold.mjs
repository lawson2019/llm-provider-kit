#!/usr/bin/env node
/**
 * 生成器回归：在临时目录生成 starter / mainstream / full × react / vue / svelte /
 * vanilla / html 五个项目，验证条数、表单字段和请求 URL。不需要联网或安装依赖。
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = new URL('..', import.meta.url);
const tiers = JSON.parse(readFileSync(new URL('../data/tiers.json', import.meta.url), 'utf8')).tiers;
const scratch = mkdtempSync(join(tmpdir(), 'registry-scaffold-test-'));

const STACKS = ['react', 'vue', 'svelte', 'vanilla', 'html'];
const MODULE_STACKS = ['react', 'vue', 'svelte', 'vanilla'];

/**
 * 从生成物里取出注册表运行时与数据。模块栈走真实 ESM；html 单文件在 vm 里内联执行。
 */
async function loadGenerated(out, stack) {
  if (MODULE_STACKS.includes(stack)) {
    const payload = JSON.parse(readFileSync(join(out, 'src/data/providers.json'), 'utf8'));
    assert.ok(
      readFileSync(join(out, 'src/registry/infer.mjs'), 'utf8').includes('inferAuthMode'),
      '生成物必须带 infer.mjs',
    );
    assert.equal(readFileSync(join(out, 'src/data/tier.json'), 'utf8').includes('count'), true, '生成物必须带 tier 元信息');
    const registry = await import(pathToFileURL(join(out, 'src/registry/index.mjs')).href);
    return { registry, payload };
  }

  // html：单文件内联了运行时与数据。
  const html = readFileSync(join(out, 'index.html'), 'utf8');
  assert.ok(html.includes('inferAuthMode'), 'html 生成物必须内联注册表运行时');
  assert.ok(html.includes('buildRequestConfig'), 'html 生成物必须内联请求配置推导');

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.equal(scripts.length, 3, 'html 生成物应由运行时 / 数据 / 应用三段脚本组成');

  const noop = () => {};
  const elem = () => ({
    textContent: '', innerHTML: '', className: '', id: '', value: '', checked: false,
    replaceChildren: noop, appendChild: noop, replaceWith: noop, addEventListener: noop, setAttribute: noop,
  });
  const sandbox = { console, URLSearchParams, location: { search: '' }, document: { getElementById: elem, createElement: elem } };
  vm.createContext(sandbox);
  vm.runInContext(scripts[0], sandbox);
  vm.runInContext(scripts[1], sandbox);
  const registry = sandbox.Kit;
  const payload = sandbox.DATA;
  return { registry, payload };
}

try {
  for (const stack of STACKS) {
    for (const tier of tiers) {
      const out = join(scratch, `${stack}-${tier.id}`);
      const result = spawnSync(process.execPath, [
        'scripts/scaffold.mjs', '--tier', tier.id, '--stack', stack, '--out', out,
      ], { cwd: root, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr || result.stdout);

      const { registry, payload } = await loadGenerated(out, stack);
      assert.equal(payload.providers.length, tier.count, `${tier.id} 条数`);
      const meta = payload.tier ?? JSON.parse(readFileSync(join(out, 'src/data/tier.json'), 'utf8'));
      assert.equal(meta.count, tier.count);
      assert.equal(meta.unsupportedCount, payload.providers.filter((p) => p.risk?.variant === 'unsupported').length);

      const registryData = registry.createRegistry(payload);
      assert.equal(registryData.providers.length, tier.count);
      const tierIds = new Set(tier.providerIds ?? payload.providers.map((p) => p.id));
      for (const provider of registryData.providers) {
        assert.ok(tierIds.has(provider.id), `生成物包含不在 tier ${tier.id} 中的条目：${provider.id}`);
      }
      for (const provider of registryData.providers) {
        const fields = registry.getFormFields(provider);
        assert.ok(fields.length > 0, `${provider.id} 应有字段`);
        if (provider.auth?.mode !== 'none') {
          assert.ok(fields.some((field) => field.secret === true), `${provider.id} 应有密钥字段`);
        }
        const config = registry.buildRequestConfig(provider, provider.auth?.mode === 'none' ? {} : { apiKey: 'test' });
        assert.ok(config.requestURL, `${provider.id} 应有 requestURL`);
      }
      console.log(`${stack}/${tier.id}: ${payload.providers.length} providers ok`);
    }
  }
  console.log(`scaffold ok: ${STACKS.join(' + ')} / starter + mainstream + full`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
