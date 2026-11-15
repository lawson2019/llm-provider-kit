/**
 * 把 data/*.json + 表单推导结果注入 demo/template.html，产出可直接打开的单文件 demo。
 * 用法：node scripts/build-demo.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadRegistry, REPO_ROOT } from '../src/node.mjs';
import { getFormFields } from '../src/fields.mjs';
import { getQuotaWarning, providerStats } from '../src/registry.mjs';

const { registry, providersData, agentsData } = await loadRegistry();

const providers = registry.providers.map((provider) => ({
  ...provider,
  formFields: getFormFields(provider),
  quotaWarning: getQuotaWarning(provider),
}));

const payload = {
  updatedAt: providersData.updatedAt,
  stats: providerStats(registry.providers),
  providers,
  agents: agentsData.agents,
};

const templatePath = path.join(REPO_ROOT, 'demo/template.html');
const outputPath = path.join(REPO_ROOT, 'demo/index.html');

const template = await readFile(templatePath, 'utf8');
const placeholder = '/*__REGISTRY__*/ {}';
if (!template.includes(placeholder)) {
  throw new Error('模板里找不到 /*__REGISTRY__*/ {} 占位符');
}

const json = JSON.stringify(payload).replaceAll('<', '\\u003c');
const html = template.replace(placeholder, json);

await writeFile(outputPath, html, 'utf8');
console.log(
  `demo/index.html 已生成：${providers.length} providers / ${registry.agents.length} agents，` +
    `${(html.length / 1024).toFixed(1)} KB`,
);
