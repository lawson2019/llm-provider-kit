#!/usr/bin/env node
/**
 * 生成器回归：在临时目录生成 starter / mainstream / full 三个项目，
 * 验证条数、状态、表单字段和请求 URL。不需要联网或安装依赖。
 */
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url);
const tiers = JSON.parse(readFileSync(new URL('../data/tiers.json', import.meta.url), 'utf8')).tiers;
const scratch = mkdtempSync(join(tmpdir(), 'registry-scaffold-test-'));

try {
  for (const stack of ['react', 'vanilla']) {
  for (const tier of tiers) {
    const out = join(scratch, `${stack}-${tier.id}`);
    const result = spawnSync(process.execPath, [
      'scripts/scaffold.mjs', '--tier', tier.id, '--stack', stack, '--out', out,
    ], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const payload = JSON.parse(readFileSync(join(out, 'src/data/providers.json'), 'utf8'));
    assert.ok(readFileSync(join(out, 'src/registry/infer.mjs'), 'utf8').includes('inferAuthMode'), '生成物必须带 infer.mjs');
    assert.equal(readFileSync(join(out, 'src/data/tier.json'), 'utf8').includes('verifiedCount'), true, '生成物必须带 tier 元信息');
    assert.equal(payload.providers.length, tier.count, `${tier.id} 条数`);
    const meta = JSON.parse(readFileSync(join(out, 'src/data/tier.json'), 'utf8'));
    assert.equal(meta.count, tier.count);
    assert.equal(meta.verifiedCount, payload.providers.filter((p) => p.status === 'verified').length);
    assert.equal(meta.referenceCount, payload.providers.filter((p) => p.status === 'reference').length);
    assert.equal(meta.unsupportedCount, payload.providers.filter((p) => p.risk?.variant === 'unsupported').length);

    const registry = await import(pathToFileURL(join(out, 'src/registry/index.mjs')).href);
    const registryData = registry.createRegistry(payload);
    assert.equal(registryData.providers.length, tier.count);
    if (tier.id === 'starter') {
      assert.equal(registryData.providers.filter((p) => p.status === 'verified').length, tier.count, 'starter 必须全 verified');
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
  console.log('scaffold ok: react + vanilla / starter + mainstream + full');
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
