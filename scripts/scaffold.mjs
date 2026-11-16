#!/usr/bin/env node
/**
 * 从注册表生成一个可运行的 Provider Key 配置页（五栈）。
 *
 * 用法：
 *   node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
 *   node scripts/scaffold.mjs --tier mainstream --stack vue  --out ../my-vue-page
 *   node scripts/scaffold.mjs --stack svelte --out ../my-svelte-page
 *   node scripts/scaffold.mjs --stack vanilla --out ../my-static-page
 *   node scripts/scaffold.mjs --stack html --out ../my-single-file
 *   node scripts/scaffold.mjs --data /path/to/providers.json --stack react --out ../x
 *
 * 字段、接入面、鉴权头与请求预览全部由注册表数据推导；生成器不联网、不写入真实密钥。
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

const STACKS = ['react', 'vue', 'svelte', 'vanilla', 'html'];
const MODULE_STACKS = ['react', 'vue', 'svelte', 'vanilla'];

if (args.includes('--help') || args.includes('-h')) {
  console.log(`用法：node scripts/scaffold.mjs [选项]

  --tier    starter / mainstream / full（分层定义见 data/tiers.json，默认 starter）
  --stack   react（默认）/ vue / svelte / vanilla / html
  --out     新目录或空目录；非空目录会被拒绝
  --name    带构建链项目的 package 名称，默认 provider-key-page
  --data    自定义 providers.json 路径（可指向刚从公开 URL 下载的快照）；
            同目录下若有 tiers.json 会一并使用
  --tiers   自定义 tiers.json 路径（覆盖 --data 同目录推断）

stack 说明：
  react     React 18 + Vite + JSX 组件
  vue       Vue 3 SFC + Vite
  svelte    Svelte 4 组件 + Vite
  vanilla   index.html + app.js + styles.css（ES Module，静态服务器打开）
  html      单文件静态 HTML，无构建链、无外部脚本，可直接 file:// 打开`);
  process.exit(0);
}

function option(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
}

const tierId = option('tier', 'starter');
const stack = option('stack', 'react');
const out = option('out');
const packageName = option('name', 'provider-key-page');
const dataPath = option('data');
const tiersPathOption = option('tiers');

if (!out) {
  console.error('缺少 --out。示例：node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page');
  process.exit(2);
}
if (!STACKS.includes(stack)) {
  console.error(`未知 stack：${stack}。可选：${STACKS.join(', ')}`);
  process.exit(2);
}

// ---------- 读取注册表数据（本地仓库优先；--data 可指向外部快照） ----------
function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

const providersData = dataPath
  ? readJson(resolve(process.cwd(), dataPath))
  : readJson(join(ROOT, 'data/providers.json'));

const dataDir = dataPath ? dirname(resolve(process.cwd(), dataPath)) : join(ROOT, 'data');
const resolveIfExists = (base, fileName, fallback) => {
  const candidate = join(base, fileName);
  return existsSync(candidate) ? candidate : fallback;
};
const tiersFile = tiersPathOption
  ? resolve(process.cwd(), tiersPathOption)
  : resolveIfExists(dataDir, 'tiers.json', join(ROOT, 'data/tiers.json'));

const tiersData = readJson(tiersFile);

const { getTierDefinition, resolveTierProviders } = await import(join(ROOT, 'src/tiers.mjs'));

const tier = getTierDefinition(tiersData, tierId);
if (!tier) {
  console.error(`未知 tier：${tierId}。可选：${tiersData.tiers.map((item) => item.id).join(', ')}`);
  process.exit(2);
}
const providers = resolveTierProviders(providersData.providers, tiersData, tierId);
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

const template = join(ROOT, 'skills/llm-provider-kit', 'assets', stack);

const providerPayload = {
  schemaVersion: providersData.schemaVersion,
  updatedAt: providersData.updatedAt,
  providers,
};
const unsupported = providers.filter((p) => p.risk?.variant === 'unsupported').length;
const tierMeta = {
  id: tier.id,
  label: tier.label,
  count: providers.length,
  unsupportedCount: unsupported,
  description: tier.description,
};

// ---------- 模块型栈：复制模板 + 注册表纯函数 + 数据快照 ----------
if (MODULE_STACKS.includes(stack)) {
  cpSync(template, target, { recursive: true });
  mkdirSync(join(target, 'src/data'), { recursive: true });
  mkdirSync(join(target, 'src/registry'), { recursive: true });

  for (const file of ['schema.mjs', 'infer.mjs', 'fields.mjs', 'registry.mjs', 'tiers.mjs', 'index.mjs']) {
    cpSync(join(ROOT, 'src', file), join(target, 'src/registry', file));
  }

  writeFileSync(join(target, 'src/data/providers.json'), JSON.stringify(providerPayload, null, 2) + '\n');
  writeFileSync(join(target, 'src/data/tier.json'), JSON.stringify(tierMeta, null, 2) + '\n');

  if (stack === 'vanilla') {
    // 静态页面用 JS 模块而不是 JSON import，避免浏览器对 import assertions 的差异。
    writeFileSync(
      join(target, 'src/data.js'),
      `const payload = ${JSON.stringify({ ...providerPayload, tier: tierMeta }, null, 2)};\nexport default payload;\n`,
    );
  }

  // 带构建链的栈：每个生成项目有自己的包名，避免 npm workspace 冲突。
  if (['react', 'vue', 'svelte'].includes(stack)) {
    const packagePath = join(target, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    packageJson.name = packageName;
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  }
} else {
  // ---------- html 栈：单文件，注册表运行时与数据全部内联 ----------
  const runtime = bundleRegistry(join(ROOT, 'src'));
  const styles = readFileSync(join(template, 'styles.css'), 'utf8');
  const app = readFileSync(join(template, 'app.js'), 'utf8');
  const dataScript = `globalThis.DATA = ${JSON.stringify({ ...providerPayload, tier: tierMeta }, null, 2)};`;

  let html = readFileSync(join(template, 'index.html'), 'utf8');
  html = html
    .replace('/*__STYLES__*/', () => styles)
    .replace('/*__RUNTIME__*/', () => runtime)
    .replace('/*__DATA__*/', () => dataScript)
    .replace('/*__APP__*/', () => app);
  writeFileSync(join(target, 'index.html'), html);
}

console.log(`已生成 ${target}`);
console.log(`tier=${tier.id} stack=${stack} providers=${providers.length}`);

const nextSteps = {
  react: `cd ${out} && npm install && npm run dev`,
  vue: `cd ${out} && npm install && npm run dev`,
  svelte: `cd ${out} && npm install && npm run dev`,
  vanilla: `cd ${out} && python3 -m http.server 4173（或任意静态服务器）`,
  html: `直接用浏览器打开 ${join(out, 'index.html')}（无需构建链）`,
};
console.log(`下一步：${nextSteps[stack]}`);

/**
 * 把 src/ 纯函数打包成一段浏览器经典脚本：去掉 import / export 语法，
 * 统一挂到全局 Kit 上。只做语法级剥离，不改动函数语义。
 */
function bundleRegistry(srcDir) {
  const order = ['schema.mjs', 'infer.mjs', 'tiers.mjs', 'fields.mjs', 'registry.mjs'];
  let code = '';
  for (const file of order) {
    let text = readFileSync(join(srcDir, file), 'utf8');
    text = text
      .split('\n')
      .filter((line) => !/^\s*import\s/.test(line))
      .join('\n');
    text = text.replace(/^export\s+(function|const|let|class)\s/gm, '$1 ');
    code += `\n// === ${file} ===\n${text}\n`;
  }
  code += `
const Kit = {
  createRegistry,
  filterProviders,
  providerStats,
  getQuotaWarning,
  getEndpoints,
  getDefaultEndpoint,
  getEndpointPath,
  getRequestURL,
  resolveEndpoint,
  getFormFields,
  groupFormFields,
  getSecretFieldKeys,
  buildRequestConfig,
};
globalThis.Kit = Kit;
`;
  return code;
}
