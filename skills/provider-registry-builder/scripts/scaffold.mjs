#!/usr/bin/env node
/**
 * Skill-local wrapper：定位仓库根目录，再把参数透传给根目录生成器。
 * 这样 AI 编程助手可以直接从 skill 目录执行，不必先找到仓库根。
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const result = spawnSync(process.execPath, [resolve(root, 'scripts/scaffold.mjs'), ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
