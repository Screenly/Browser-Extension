/**
 * Core types and interfaces for the Browser Extension
 */

/**
 * User interface representing the authenticated user
 */
export interface User {
  token?: string;
}

/**
 * Request initialization interface for API calls
 */
export interface RequestInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Saved asset state interface for browser storage
 */
export interface SavedAssetState {
  assetId: string | null;
  withCookies: boolean;
  withBypass: boolean;
}

/**
 * Browser storage state type
 */
export type BrowserStorageState = Record<string, SavedAssetState>;

/**
 * Custom event interface for asset dashboard link
 */
export interface CustomEvent extends Event {
  detail: string;
}

/**
 * Error state interface for form validation
 */
export interface ErrorState {
  show: boolean;
  message: string;
}

/**
 * Button state type for form submission
 */
export type ButtonState = 'add' | 'update' | 'loading';

/**
 * Asset error interface for API error handling
 */
export interface AssetError {
  type?: string[];
}

/**
 * API error interface for error handling
 */
export interface ApiError {
  status?: number;
  statusCode?: number;
  json(): Promise<AssetError>;
}

/**
 * Cookie interface for browser cookies
 */
export interface Cookie {
  domain: string;
  name: string;
  value: string;
  hostOnly?: boolean;
}

/**
 * Proposal state interface for asset proposals
 */
export interface ProposalState {
  user: User;
  title: string;
  url: string;
  cookieJar: Cookie[];
  state?: SavedAssetState;
}
