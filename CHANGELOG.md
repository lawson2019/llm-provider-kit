# Changelog

## 0.3.3

### Security

- Demo 的请求预览和「复制 JSON」现在只输出脱敏后的配置，不再把原始 API Key / Token 写入 DOM 或剪贴板；React 参考组件与 skill 模板同步。
- Demo 的请求配置补齐 `endpoint.auth` 接入面级鉴权覆盖，和核心库 `buildRequestConfig()` 对齐；新增 142 个 provider/endpoint 组合的 parity 回归。

### Fixed

- CI 与 README 中的 `show workbuddy` 示例移除；该条已在 0.3.2 删除。CI 增加 `test:demo` 与 `test:scaffold`。
- `docs/integration.md` 的 tgz 版本从 0.2.0 更新为 0.3.3；`docs/omniroute-import.md` 的无 `probe.modelsUrl` 数字更新为 61/104。
- `inferAuthMode` / `inferBillingMode` 从 `registry.mjs`、`fields.mjs` 抽到共享 `src/infer.mjs`。
- 生成器复制模块清单补上 `infer.mjs`，避免生成的页面缺依赖。

### Added

- `provider-registry-builder` skill 增加 `--stack vanilla` 静态模板：`index.html + app.js + styles.css`，无需 React/Vite。
- 生成页增加 Provider 搜索、`?provider=` 深链、tier 状态统计和订阅提示去重。
- README 增加「Schema 能力 ≠ 当前数据覆盖」表，明确 oauth / device-code / browser-cookie / local-session / session 当前为 0 条。
- `test:demo`、`test:scaffold`、`test:all` 脚本。

## 0.3.2

- 删除 5 条 session-only Provider，统一为 131 条。
- README / 导入说明明确 `reference ≠ verified`；画廊加入状态徽标。

## 0.3.1

- 修复 OmniRoute 导入审计的 3 个 P0、6 个 P1；新增 `endpoint.auth`。

## 0.3.0

- 从 OmniRoute 导入 104 条 API Key Provider。
