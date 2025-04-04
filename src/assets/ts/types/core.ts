export interface User {
  token?: string;
}

export interface RequestInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface SavedAssetState {
  assetId: string | null;
  withCookies: boolean;
  withBypass: boolean;
}

export type BrowserStorageState = Record<string, SavedAssetState>;

export interface CustomEvent extends Event {
  detail: string;
}

export interface ErrorState {
  show: boolean;
  message: string;
}

export type ButtonState = 'add' | 'update' | 'loading';

export interface AssetError {
  type?: string[];
}

export interface ApiError {
  status?: number;
  statusCode?: number;
  json(): Promise<AssetError>;
}

export interface Cookie {
  domain: string;
  name: string;
  value: string;
  hostOnly?: boolean;
}

export interface ProposalState {
  user: User;
  title: string;
  url: string;
  cookieJar: Cookie[];
  state?: SavedAssetState;
}
