#!/usr/bin/env node
/**
 * llm-provider-kit CLI（零依赖）。bin 别名：provider-registry。
 *
 *   llm-provider-kit list --category china
 *   llm-provider-kit show volcengine-ark
 *   llm-provider-kit fields zai-coding-plan
 *   llm-provider-kit validate
 *   llm-provider-kit export --format ts --out dist/providers.ts
 */
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  loadRegistry,
  validateAll,
  toTypeScriptModule,
  REPO_ROOT,
} from '../src/node.mjs';
import { getFormFields, groupFormFields, buildRequestConfig, getRequestURL } from '../src/fields.mjs';
import { getQuotaWarning, providerStats } from '../src/registry.mjs';

const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  dim: (s) => (USE_COLOR ? `\x1b[2m${s}\x1b[0m` : s),
  bold: (s) => (USE_COLOR ? `\x1b[1m${s}\x1b[0m` : s),
  green: (s) => (USE_COLOR ? `\x1b[32m${s}\x1b[0m` : s),
  yellow: (s) => (USE_COLOR ? `\x1b[33m${s}\x1b[0m` : s),
  red: (s) => (USE_COLOR ? `\x1b[31m${s}\x1b[0m` : s),
  cyan: (s) => (USE_COLOR ? `\x1b[36m${s}\x1b[0m` : s),
};

function width(text) {
  let w = 0;
  for (const char of text) {
    w += /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/.test(char)
      ? 2
      : 1;
  }
  return w;
}

function pad(text, target) {
  const gap = target - width(text);
  return gap > 0 ? text + ' '.repeat(gap) : text;
}

function printProviderList(providers) {
  if (providers.length === 0) {
    console.log('没有匹配的 Provider。');
    return;
  }
  const rows = providers.map((p) => ({
    id: p.id,
    name: p.name,
    meta: `${p.kind}/${p.auth?.mode ?? p.authType}`,
    quota: p.billing?.mode ?? p.quota?.type ?? '-',
  }));
  const w1 = Math.max(...rows.map((r) => width(r.id)), 4);
  const w2 = Math.max(...rows.map((r) => width(r.name)), 4);
  const w3 = Math.max(...rows.map((r) => width(r.meta)), 6);

  for (const row of rows) {
    console.log(
      `${c.cyan(pad(row.id, w1))}  ${pad(row.name, w2)}  ${c.dim(pad(row.meta, w3))}  ${pad(
        row.quota,
        11,
      )}`,
    );
  }
  console.log(c.dim(`\n共 ${providers.length} 条`));
}

function printProvider(provider) {
  console.log(`${c.bold(provider.name)}  ${c.dim(`(${provider.id})`)}`);
  console.log(`  分类      ${provider.category} / ${provider.kind}`);
  console.log(`  鉴权      ${provider.auth?.mode ?? provider.authType} / ${provider.auth?.scheme ?? provider.authType}`);
  console.log(`  Base URL  ${provider.baseURL ?? '（会话型，无公开端点）'}`);
  console.log(`  计费      ${provider.billing?.mode ?? provider.quota?.type ?? '-'}${provider.billing?.note ? ` — ${provider.billing.note}` : ''}`);
  console.log(`  额度      ${provider.quota?.type ?? '-'}${provider.quota?.note ? ` — ${provider.quota.note}` : ''}`);
  if (provider.verifiedAt) console.log(`  审计日期  ${provider.verifiedAt}`);
  console.log(`  文档      ${provider.docs}`);
  console.log(`  图标      ${provider.icon.slug} (${provider.icon.source})`);

  if (provider.endpoints?.length) {
    console.log(`\n${c.bold('接入面')}${c.dim('（endpoints[]）')}`);
    for (const endpoint of provider.endpoints) {
      const mark = endpoint.default ? c.green(' default') : '';
      console.log(
        `  - ${pad(endpoint.id, 18)} ${pad(endpoint.protocol, 20)} ${endpoint.billing.padEnd(12)} ${getRequestURL(endpoint) ?? '本地会话'}${mark}`,
      );
    }
  }

  const caps = Object.entries(provider.capabilities ?? {})
    .filter(([, on]) => on)
    .map(([key]) => key);
  console.log(`  能力      ${caps.join(', ') || '-'}`);

  if (provider.aliases?.length) console.log(`  别名      ${provider.aliases.join(', ')}`);
  if (provider.externalIds && Object.keys(provider.externalIds).length) {
    console.log(`  外部 ID   ${Object.entries(provider.externalIds).map(([k, v]) => `${k}:${v}`).join(', ')}`);
  }
  if (provider.probe) {
    console.log(`  探测      ${provider.probe.method ?? 'GET'} ${provider.probe.modelsUrl ?? provider.probe.authTestUrl ?? '-'}`);
  }
  if (provider.risk) {
    console.log(`  风险      ${provider.risk.level} / ${provider.risk.variant} — ${provider.risk.note}`);
  }
  if (provider.auth?.oauth) {
    const oauth = provider.auth.oauth;
    console.log(
      `  OAuth     ${oauth.initiateUrl ?? oauth.authUrl ?? '-'} → ${oauth.pollUrlBase ?? oauth.tokenUrl ?? '-'}`,
    );
  }
  if (provider.runtime && Object.keys(provider.runtime).length) {
    const flags = Object.entries(provider.runtime)
      .filter(([, value]) => value === true)
      .map(([key]) => key);
    console.log(`  运行时    ${flags.join(', ') || '-'}`);
  }

  console.log(`\n${c.bold('表单字段')}${c.dim('（getFormFields 补齐后的渲染顺序）')}`);
  const fields = getFormFields(provider);
  const groups = groupFormFields(fields);
  for (const [group, list] of Object.entries(groups)) {
    console.log(`  ${c.cyan(group)}`);
    for (const field of list) {
      const marks = [
        field.required ? '必填' : null,
        field.secret ? '密钥' : null,
        field.advanced ? '高级' : null,
      ].filter(Boolean);
      console.log(
        `    - ${pad(field.key, 16)} ${field.type.padEnd(8)} ${field.label}${
          marks.length ? c.dim(` [${marks.join('/')}]`) : ''
        }`,
      );
    }
  }

  const warning = getQuotaWarning(provider);
  if (warning) {
    console.log(`\n${c.yellow('!')} ${warning.title}\n  ${warning.detail}`);
  }
  if (provider.notes?.length) {
    console.log(`\n${c.bold('备注')}`);
    for (const note of provider.notes) console.log(`  · ${note}`);
  }
}

function printFields(provider, asJson) {
  const fields = getFormFields(provider);
  if (asJson) {
    console.log(JSON.stringify({ id: provider.id, fields, grouped: groupFormFields(fields) }, null, 2));
    return;
  }
  for (const field of fields) {
    console.log(
      `${pad(field.key, 16)} ${field.type.padEnd(8)} ${field.group.padEnd(9)} ${
        field.required ? 'required' : 'optional'
      }  ${field.label}`,
    );
  }
  console.log(`\n${c.dim('示例空值生成的请求配置：')}`);
  console.log(JSON.stringify(buildRequestConfig(provider, {}), null, 2));
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      json: { type: 'boolean', default: false },
      category: { type: 'string' },
      kind: { type: 'string' },
      auth: { type: 'string' },
      billing: { type: 'string' },
      quota: { type: 'string' },
      protocol: { type: 'string' },
      q: { type: 'string' },
      format: { type: 'string' },
      out: { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', default: false },
    },
  });

  const [command = 'list', arg] = positionals;

  if (values.help || command === 'help') {
    console.log(`llm-provider-kit <command> [options]
（别名：provider-registry）

命令
  list                     列出 Provider（默认）
  show <id|alias>          查看单条详情、表单字段与备注
  fields <id|alias>        只输出表单字段 / 示例请求配置
  validate                 校验 data/providers.json，CI 用
  stats                    统计分类 / 鉴权 / 额度分布
  export --format json|ts --out <path>   导出数据

过滤（list / stats）
  --category china|global|aggregator|local
  --kind api|gateway|local|session
  --auth api-key|oauth|device-code|browser-cookie|local-session|none
      也可以按 wire scheme 过滤：bearer|api-key-header|query-param|aws-sigv4|azure-api-key|cookie|jwt-session|none
  --billing payg|subscription|free|mixed|unknown
  --quota api-key|subscription|session|free|mixed
  --protocol openai-chat|openai-responses|anthropic-messages|gemini-native|native|web-session|local-session
  --q <关键词>
  --json`);
    return;
  }

  if (values.version) {
    const pkg = JSON.parse(
      await (await import('node:fs/promises')).readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'),
    );
    console.log(pkg.version);
    return;
  }

  const { registry, providersData } = await loadRegistry();
  const providers = registry.providers;

  switch (command) {
    case 'list': {
      const filtered = registry.listProviders({
        category: values.category,
        kind: values.kind,
        authType: values.auth,
        billing: values.billing,
        quota: values.quota,
        protocol: values.protocol,
        q: values.q,
      });
      if (values.json) console.log(JSON.stringify(filtered, null, 2));
      else printProviderList(filtered);
      break;
    }

    case 'show': {
      const provider = registry.getProvider(arg) ??
        providers.find((p) => (p.aliases ?? []).includes(arg));
      if (!provider) {
        console.error(`未找到 Provider：${arg ?? '(缺少 id)'}`);
        process.exitCode = 1;
        return;
      }
      if (values.json) console.log(JSON.stringify({ ...provider, formFields: getFormFields(provider) }, null, 2));
      else printProvider(provider);
      break;
    }

    case 'fields': {
      const provider = registry.getProvider(arg);
      if (!provider) {
        console.error(`未找到 Provider：${arg ?? '(缺少 id)'}`);
        process.exitCode = 1;
        return;
      }
      printFields(provider, values.json);
      break;
    }

    case 'validate': {
      const result = await validateAll();
      if (values.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(
          `${c.bold('校验')}  providers=${result.stats.providers}`,
        );
        for (const item of result.providers.errors) {
          console.log(`${c.red('error')}  ${item}`);
        }
        for (const item of result.providers.warnings) {
          console.log(`${c.yellow('warn')}   ${item}`);
        }
        console.log(result.ok ? c.green(`\n通过（${result.providers.warnings.length} 条提醒）`) : c.red('\n未通过'));
      }
      if (!result.ok) process.exitCode = 1;
      break;
    }

    case 'stats': {
      const stats = providerStats(
        registry.listProviders({
          category: values.category,
          kind: values.kind,
          authType: values.auth,
          billing: values.billing,
          quota: values.quota,
          protocol: values.protocol,
        }),
      );
      if (values.json) {
        console.log(JSON.stringify(stats, null, 2));
      } else {
        console.log(c.bold(`Provider 共 ${stats.total} 条`));
        const printMap = (label, map) => {
          console.log(`\n${c.cyan(label)}`);
          for (const [key, value] of Object.entries(map).sort((a, b) => b[1] - a[1])) {
            console.log(`  ${pad(key, 18)} ${value}`);
          }
        };
        printMap('按分类', stats.byCategory);
        printMap('按类型', stats.byKind);
        printMap('按凭证方式', stats.byAuthMode);
        printMap('按鉴权头', stats.byAuthType);
        printMap('按计费', stats.byBilling);
        printMap('按额度', stats.byQuota);
        printMap('按协议', stats.byProtocol);
      }
      break;
    }

    case 'export': {
      const format = values.format ?? 'json';
      if (!['json', 'ts'].includes(format)) {
        console.error('--format 只支持 json / ts');
        process.exitCode = 1;
        return;
      }
      const outPath = path.resolve(values.out ?? `dist/providers.${format}`);
      const payload =
        format === 'json'
          ? JSON.stringify(providersData, null, 2)
          : toTypeScriptModule(providersData);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, `${payload}\n`, 'utf8');
      console.log(`${c.green('已导出')} ${outPath}`);
      break;
    }

    default:
      console.error(`未知命令：${command}。用 --help 查看用法。`);
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
