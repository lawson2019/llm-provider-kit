/**
 * Node 侧辅助：读取数据文件、校验、导出。
 * 浏览器侧请使用 src/index.mjs / src/registry.mjs。
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { validateRegistry, validateAgents } from './schema.mjs';
import { createRegistry } from './registry.mjs';

export const REPO_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

export async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${path.relative(REPO_ROOT, filePath)} 不是合法 JSON：${error.message}`);
  }
}

export async function loadRegistry(rootDir = REPO_ROOT) {
  const [providersData, agentsData] = await Promise.all([
    readJson(path.join(rootDir, 'data/providers.json')),
    readJson(path.join(rootDir, 'data/agents.json')),
  ]);

  return {
    registry: createRegistry({ providers: providersData.providers, agents: agentsData.agents }),
    providersData,
    agentsData,
  };
}

export async function validateAll(rootDir = REPO_ROOT) {
  const providersData = await readJson(path.join(rootDir, 'data/providers.json'));
  const agentsData = await readJson(path.join(rootDir, 'data/agents.json'));

  const providers = validateRegistry(providersData);
  const agents = validateAgents(agentsData);

  return {
    ok: providers.errors.length === 0 && agents.errors.length === 0,
    providers,
    agents,
    stats: {
      providers: providersData.providers.length,
      agents: agentsData.agents.length,
    },
  };
}

/**
 * 导出成 TypeScript 常量，方便前端直接 import 并获得字面量类型。
 */
export function toTypeScriptModule(providersData, agentsData) {
  const header = `// 由 llm-provider-kit 生成，请勿手改。\n// 数据版本：${providersData.updatedAt}\n\n`;
  return (
    header +
    `export const PROVIDERS = ${JSON.stringify(providersData.providers, null, 2)} as const;\n\n` +
    `export const AGENTS = ${JSON.stringify(agentsData.agents, null, 2)} as const;\n\n` +
    `export type ProviderId = (typeof PROVIDERS)[number]['id'];\n`
  );
}
