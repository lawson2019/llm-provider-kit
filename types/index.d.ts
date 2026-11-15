export type ProviderKind = 'api' | 'gateway' | 'local' | 'session';
export type ProviderCategory = 'global' | 'china' | 'aggregator' | 'local' | 'agent';
export type AuthMode = 'api-key' | 'oauth' | 'device-code' | 'browser-cookie' | 'local-session' | 'none';
export type AuthScheme =
  | 'bearer'
  | 'api-key-header'
  | 'query-param'
  | 'aws-sigv4'
  | 'azure-api-key'
  | 'cookie'
  | 'jwt-session'
  | 'none';
export type AuthType = AuthScheme;
export type BillingMode = 'payg' | 'subscription' | 'free' | 'mixed' | 'unknown';
export type Protocol =
  | 'openai-chat'
  | 'openai-responses'
  | 'anthropic-messages'
  | 'gemini-native'
  | 'native'
  | 'web-session'
  | 'local-session'
  | 'unknown';
export type FieldType = 'text' | 'password' | 'url' | 'select' | 'number' | 'boolean' | 'json' | 'textarea';
export type FieldGroup = 'auth' | 'endpoint' | 'model' | 'runtime' | 'advanced';
export type QuotaType = 'api-key' | 'subscription' | 'session' | 'free' | 'mixed';
export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskVariant =
  | 'official-api'
  | 'subscription'
  | 'oauth'
  | 'browser-cookie'
  | 'local-session'
  | 'deprecated'
  | 'unsupported';
export type AgentTransport = 'stdio' | 'http' | 'ssh' | 'desktop' | 'none';
export type AgentProtocol = 'acp' | 'mcp' | 'jsonl' | 'rest' | 'pty' | 'native';
export type AgentBackendMode = 'acp' | 'stdio-adapter' | 'native' | 'none';
export type AgentSurface = 'catalog' | 'detect' | 'run' | 'configure' | 'generate';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

export interface ProviderField {
  key: string;
  label: string;
  type: FieldType;
  group?: FieldGroup;
  required?: boolean;
  secret?: boolean;
  advanced?: boolean;
  order?: number;
  placeholder?: string;
  help?: string;
  default?: string | number | boolean;
  options?: SelectOption[];
  validate?: { pattern?: string; min?: number; max?: number; message?: string };
}

export interface ProviderCapabilities {
  streaming?: boolean;
  toolCalling?: boolean;
  vision?: boolean;
  embeddings?: boolean;
  audio?: boolean;
  reasoning?: boolean;
  promptCaching?: boolean;
}

export interface ProviderIcon {
  slug: string;
  source: 'lobe-icons';
  color?: string;
  url?: string;
}

export interface ProviderOAuth {
  authUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  initiateUrl?: string;
  pollUrlBase?: string;
}

export interface ProviderAuth {
  mode: AuthMode;
  scheme: AuthScheme;
  headerName?: string;
  queryName?: string;
  extraHeaders?: Record<string, string>;
  oauth?: ProviderOAuth;
}

/**
 * 接入面级鉴权覆盖：同一 Provider 的不同接入面可能要求不同 header
 * （例如 Anthropic 兼容面用 x-api-key、OpenAI 兼容面用 bearer）。缺省时继承 Provider 级 auth。
 */
export interface ProviderEndpointAuth {
  mode?: AuthMode;
  scheme: AuthScheme;
  headerName?: string;
  queryName?: string;
}

export interface ProviderEndpoint {
  id: string;
  label: string;
  value?: string;
  protocol: Protocol;
  baseURL: string | null;
  path?: string;
  billing: BillingMode;
  default?: boolean;
  headers?: Record<string, string>;
  auth?: ProviderEndpointAuth;
  note?: string;
}

export interface ProviderBilling {
  mode: BillingMode;
  note?: string;
}

export interface ProviderProbe {
  modelsUrl?: string;
  authTestUrl?: string;
  method?: 'GET' | 'POST';
}

export interface ProviderRisk {
  level: RiskLevel;
  variant: RiskVariant;
  note: string;
}

export interface ProviderRuntime {
  forceStream?: boolean;
  strictChatHistory?: boolean;
  passthroughModels?: boolean;
  requiresReasoningEcho?: boolean;
  bodyStringReplacements?: Array<[string, string]>;
}

export interface ProviderSession {
  refreshable: boolean;
  desktopOnly: boolean;
  note: string;
}

export interface Provider {
  schemaVersion?: number;
  id: string;
  name: string;
  aliases?: string[];
  kind: ProviderKind;
  category: ProviderCategory;
  authType: AuthType;
  baseURL: string | null;
  baseURLTemplate?: string;
  baseURLEditable?: boolean;
  endpoints: ProviderEndpoint[];
  docs: string;
  verifiedAt?: string;
  icon: ProviderIcon;
  brandColor?: string;
  auth: ProviderAuth;
  billing: ProviderBilling;
  capabilities: ProviderCapabilities;
  quota: { type: QuotaType; note?: string };
  session?: ProviderSession;
  probe?: ProviderProbe;
  risk?: ProviderRisk;
  runtime?: ProviderRuntime;
  externalIds?: Record<string, string>;
  fields: ProviderField[];
  notes?: string[];
  tags?: string[];
}

export interface AgentRuntime {
  binary?: string;
  versionArgs?: string[];
  spawnArgs?: string[];
  backendMode?: AgentBackendMode;
}

export interface AgentConfigure {
  paths?: Partial<Record<'linux' | 'darwin' | 'win32', string[]>>;
  recipe?: string;
}

export interface AgentEntry {
  id: string;
  name: string;
  vendor?: string;
  kind: 'cli' | 'desktop' | 'runtime' | 'panel';
  transports: AgentTransport[];
  protocols: AgentProtocol[];
  install?: { npm?: string; docs?: string };
  session?: {
    persistent: boolean;
    resumeAfterRestart: boolean;
    credential: 'none' | 'oauth' | 'jwt-session' | 'api-key';
  };
  runtime?: AgentRuntime;
  configure?: AgentConfigure;
  providerAlias?: string;
  surfaces?: AgentSurface[];
  quota?: { type: string; note?: string };
  notes?: string[];
  links?: Array<{ label: string; url: string }>;
}

export interface RegistryData {
  schemaVersion: number;
  updatedAt: string;
  providers: Provider[];
}

export interface AgentsData {
  schemaVersion: number;
  updatedAt: string;
  agents: AgentEntry[];
}

export interface Registry {
  providers: Provider[];
  agents: AgentEntry[];
  getProvider(id: string): Provider | null;
  getAgent(id: string): AgentEntry | null;
  listProviders(filter?: ProviderFilter): Provider[];
  listAgents(filter?: AgentFilter): AgentEntry[];
  stats(): RegistryStats;
}

export interface ProviderFilter {
  q?: string;
  category?: ProviderCategory;
  kind?: ProviderKind;
  authType?: AuthScheme;
  authMode?: AuthMode;
  capability?: keyof ProviderCapabilities;
  quota?: QuotaType | BillingMode;
  billing?: BillingMode;
  protocol?: Protocol;
}

export interface AgentFilter {
  q?: string;
  kind?: AgentEntry['kind'];
  protocol?: AgentProtocol;
  transport?: AgentTransport;
  surface?: AgentSurface;
}

export interface RegistryStats {
  total: number;
  byCategory: Record<string, number>;
  byKind: Record<string, number>;
  byAuthType: Record<string, number>;
  byAuthMode: Record<string, number>;
  byBilling: Record<string, number>;
  byQuota: Record<string, number>;
  byProtocol: Record<string, number>;
}

export interface RequestConfig {
  baseURL: string;
  endpoint: string;
  protocol: Protocol;
  path: string;
  requestURL: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  missing: string[];
  warnings: string[];
  quota?: QuotaType;
  billing: BillingMode;
  authMode: AuthMode;
  runtime: ProviderRuntime | null;
}

export interface QuotaWarning {
  level: 'warning' | 'info';
  title: string;
  detail: string;
}

export declare function inferAuthMode(provider: Provider): AuthMode;
export declare function inferBillingMode(provider: Provider): BillingMode;

export declare function createRegistry(data: {
  providers: Provider[];
  agents?: AgentEntry[];
}): Registry;

export declare function getProviderEndpoints(provider: Provider): ProviderEndpoint[];
export declare function filterProviders(providers: Provider[], filter?: ProviderFilter): Provider[];
export declare function filterAgents(agents: AgentEntry[], filter?: AgentFilter): AgentEntry[];
export declare function providerStats(providers: Provider[]): RegistryStats;
export declare function getQuotaWarning(provider: Provider): QuotaWarning | null;

export declare function getEndpoints(provider: Provider): ProviderEndpoint[];
export declare function getDefaultEndpoint(provider: Provider): ProviderEndpoint | null;
export declare function getEndpointPath(endpoint: ProviderEndpoint | null): string;
export declare function getRequestURL(endpoint: ProviderEndpoint | null): string | null;
export declare function resolveEndpoint(provider: Provider, values?: Record<string, unknown>): ProviderEndpoint | null;
export declare function getFormFields(provider: Provider): ProviderField[];
export declare function groupFormFields(fields: ProviderField[]): Record<string, ProviderField[]>;
export declare function getSecretFieldKeys(provider: Provider): string[];
export declare function buildRequestConfig(
  provider: Provider,
  values?: Record<string, unknown>,
): RequestConfig;

export interface ProviderTier {
  id: string;
  label: string;
  description?: string;
  count: number;
  providerIds?: string[];
  allProviders?: boolean;
}

export interface TiersData {
  schemaVersion: number;
  updatedAt?: string;
  tiers: ProviderTier[];
}

export declare function getTierDefinition(
  tiersData: TiersData | ProviderTier[],
  tierId: string,
): ProviderTier | null;
export declare function resolveTierProviders(
  providers: Provider[],
  tiersData: TiersData | ProviderTier[],
  tierId?: string,
): Provider[];

export declare const AUTH_TYPES: Record<AuthScheme, string>;
export declare const AUTH_MODES: Record<AuthMode, string>;
export declare const BILLING_MODES: Record<BillingMode, string>;
export declare const PROTOCOLS: Record<Protocol, string>;
export declare const KINDS: Record<ProviderKind, string>;
export declare const CATEGORIES: Record<ProviderCategory, string>;
export declare const FIELD_TYPES: FieldType[];
export declare const FIELD_GROUPS: Record<FieldGroup, string>;
export declare const QUOTA_TYPES: Record<QuotaType, string>;
export declare const RISK_LEVELS: Record<RiskLevel, string>;
export declare const RISK_VARIANTS: Record<RiskVariant, string>;
export declare const AGENT_TRANSPORTS: Record<AgentTransport, string>;
export declare const AGENT_PROTOCOLS: Record<AgentProtocol, string>;
export declare const AGENT_BACKEND_MODES: Record<AgentBackendMode, string>;
export declare const AGENT_SURFACES: AgentSurface[];
