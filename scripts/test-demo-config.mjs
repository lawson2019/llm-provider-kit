#!/usr/bin/env node
/**
 * Demo 与核心库的请求配置一致性 + 脱敏回归。
 * Demo 是单文件，必须自带一份纯函数；这里从模板提取并逐 Provider/端点比对。
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFormFields, buildRequestConfig } from '../src/fields.mjs';
import { loadRegistry } from '../src/node.mjs';

const { registry } = await loadRegistry();
const template = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../demo/template.html'), 'utf8');
const start = template.indexOf('function interpolate');
const end = template.indexOf('function renderProviderDetail');
assert.ok(start > 0 && end > start, '无法从 demo/template.html 提取配置函数');

const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(
  `${template.slice(start, end)}\nglobalThis.__buildConfig = buildConfig;`,
  sandbox,
);

const demoBuildConfig = sandbox.__buildConfig;
const normalize = (value) => JSON.parse(JSON.stringify(value));
const secretValue = 'sk-live-DEMO-SECRET-1234567890';
const maskedValue = `${secretValue.slice(0, 4)}…${secretValue.slice(-4)}`;

function maskDeep(value) {
  if (typeof value === 'string') return value.replaceAll(secretValue, maskedValue);
  if (Array.isArray(value)) return value.map(maskDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, maskDeep(item)]));
  }
  return value;
}
let checked = 0;

for (const provider of registry.providers) {
  const fields = getFormFields(provider);
  const secretField = fields.find((field) => field.secret === true);
  const endpoints = provider.endpoints?.length ? provider.endpoints : [null];

  for (const endpoint of endpoints) {
    const values = { model: 'test-model', timeout: 60 };
    for (const field of fields) {
      if (field.default !== undefined) values[field.key] = field.default;
    }
    if (secretField) values[secretField.key] = secretValue;
    if (endpoint) values.endpoint = endpoint.id;

    const core = maskDeep(buildRequestConfig(provider, values));
    const demo = demoBuildConfig({ ...provider, formFields: fields }, values);
    for (const key of ['baseURL', 'endpoint', 'protocol', 'path', 'requestURL', 'headers', 'query', 'missing', 'authMode']) {
      if (key === 'headers' && (provider.auth?.scheme === 'aws-sigv4' || endpoint?.auth?.scheme === 'aws-sigv4')) continue;
      assert.deepEqual(normalize(demo[key]), normalize(core[key]), `${provider.id}/${endpoint?.id ?? 'default'} ${key}`);
    }
    assert.equal(
      JSON.stringify(demo).includes(secretValue),
      false,
      `${provider.id}/${endpoint?.id ?? 'default'} 的预览泄露了原始密钥`,
    );
    checked += 1;
  }
}

console.log(`demo config ok: ${checked} provider/endpoint combinations, secrets masked`);
