/**
 * 把 data/*.json + 表单推导结果注入 demo/template.html，产出可直接打开的单文件 demo。
 * 用法：node scripts/build-demo.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadRegistry, REPO_ROOT } from '../src/node.mjs';
import { getFormFields } from '../src/fields.mjs';
import { getQuotaWarning, providerStats } from '../src/registry.mjs';

const { registry, providersData } = await loadRegistry();
const tiersData = JSON.parse(await readFile(path.join(REPO_ROOT, 'data/tiers.json'), 'utf8'));

// 构建时把 favicon 内嵌成 data URI，避免 icon.horse 等外部图源在浏览器里挂起。
let iconEmbeds = {};
try {
  iconEmbeds = JSON.parse(await readFile(path.join(REPO_ROOT, 'data/icon-embeds.json'), 'utf8'));
} catch {
  console.warn('未找到 data/icon-embeds.json，favicon 仍使用外部 URL');
}

const providers = registry.providers.map((provider) => ({
  ...provider,
  icon: iconEmbeds[provider.id]
    ? { ...provider.icon, url: iconEmbeds[provider.id] }
    : provider.icon,
  formFields: getFormFields(provider),
  quotaWarning: getQuotaWarning(provider),
}));

const payload = {
  updatedAt: providersData.updatedAt,
  stats: providerStats(registry.providers),
  providers,
  tiers: tiersData.tiers,
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
const embeddedCount = providers.filter((p) => iconEmbeds[p.id]).length;
console.log(
  `demo/index.html 已生成：${providers.length} providers，` +
    `${embeddedCount} 个图标已内嵌，${(html.length / 1024).toFixed(1)} KB`,
);
