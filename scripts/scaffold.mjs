#!/usr/bin/env node
/**
 * 从注册表生成一个可运行的 Provider Key 配置页。
 *
 * 用法：
 *   node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
 *
 * 只读取本仓库的 data/providers.json、data/tiers.json 和 src/ 模块；
 * 不联网、不写入任何真实密钥。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`用法：node scripts/scaffold.mjs --tier <starter|mainstream|full> --stack <react|vanilla> --out <dir> [--name <package-name>]

  --tier    starter（12，全部 verified）/ mainstream（37）/ full（120）
  --stack   react（默认，React + Vite）/ vanilla（静态 HTML + JS）
  --out     新目录或空目录；非空目录会被拒绝
  --name    React 项目的 package 名称，默认 provider-key-page`);
  process.exit(0);
}

function option(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
}

const tierId = option('tier', 'starter');
const stack = option('stack', 'react');
const stackTemplate = { react: 'assets/react', vanilla: 'assets/vanilla' };
const out = option('out');
const packageName = option('name', 'provider-key-page');

if (!out) {
  console.error('缺少 --out。示例：node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page');
  process.exit(2);
}
if (!stackTemplate[stack]) {
  console.error(`未知 stack：${stack}。可选：${Object.keys(stackTemplate).join(', ')}`);
  process.exit(2);
}

const data = JSON.parse(readFileSync(join(ROOT, 'data/providers.json'), 'utf8'));
const tiersData = JSON.parse(readFileSync(join(ROOT, 'data/tiers.json'), 'utf8'));
const { getTierDefinition, resolveTierProviders } = await import(join(ROOT, 'src/tiers.mjs'));

const tier = getTierDefinition(tiersData, tierId);
if (!tier) {
  console.error(`未知 tier：${tierId}。可选：${tiersData.tiers.map((item) => item.id).join(', ')}`);
  process.exit(2);
}
const providers = resolveTierProviders(data.providers, tiersData, tierId);
if (providers.length !== tier.count) {
  console.error(`Tier ${tierId} 应有 ${tier.count} 条，实际 ${providers.length} 条。`);
  process.exit(1);
}

const target = resolve(process.cwd(), out);
if (existsSync(target) && readdirSync(target).length > 0) {
  console.error(`目标目录非空，拒绝覆盖：${target}`);
  process.exit(2);
}
mkdirSync(target, { recursive: true });

const template = join(ROOT, 'skills/provider-registry-builder', stackTemplate[stack]);
cpSync(template, target, { recursive: true });
mkdirSync(join(target, 'src/data'), { recursive: true });
mkdirSync(join(target, 'src/registry'), { recursive: true });

for (const file of ['schema.mjs', 'infer.mjs', 'fields.mjs', 'registry.mjs', 'tiers.mjs', 'index.mjs']) {
  cpSync(join(ROOT, 'src', file), join(target, 'src/registry', file));
}

const providerPayload = {
  schemaVersion: data.schemaVersion,
  updatedAt: data.updatedAt,
  providers,
};
writeFileSync(join(target, 'src/data/providers.json'), JSON.stringify(providerPayload, null, 2) + '\n');
const verified = providers.filter((provider) => provider.status === 'verified').length;
const reference = providers.filter((provider) => provider.status === 'reference').length;
const unsupported = providers.filter((provider) => provider.risk?.variant === 'unsupported').length;
const tierMeta = {
  id: tier.id,
  label: tier.label,
  count: providers.length,
  verifiedCount: verified,
  referenceCount: reference,
  unsupportedCount: unsupported,
  description: tier.description,
};
writeFileSync(join(target, 'src/data/tier.json'), JSON.stringify(tierMeta, null, 2) + '\n');

if (stack === 'vanilla') {
  // 静态页面用 JS 模块而不是 JSON import，避免浏览器对 import assertions 的差异。
  writeFileSync(
    join(target, 'src/data.js'),
    `const payload = ${JSON.stringify({ ...providerPayload, tier: tierMeta }, null, 2)};\nexport default payload;\n`,
  );
}

// React 模板带 package.json；让每个生成项目有自己的包名，避免 npm workspace 冲突。
const packagePath = join(target, 'package.json');
if (stack === 'react') {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.name = packageName;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
}

console.log(`已生成 ${target}`);
console.log(`tier=${tier.id} stack=${stack} providers=${providers.length} verified=${verified} reference=${reference}`);
console.log(
  stack === 'react'
    ? '下一步：cd ' + out + ' && npm install && npm run dev'
    : '下一步：cd ' + out + ' && python3 -m http.server 4173（或任意静态服务器）',
);
