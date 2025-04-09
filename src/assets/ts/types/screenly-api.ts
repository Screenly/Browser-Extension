export interface ApiResponseData {
  id: string;
}

export interface AssetResponse extends ApiResponseData {
  team_id: string;
  status: string;
  headers: Record<string, string>;
  disable_verification: boolean;
}

export interface UserResponse extends ApiResponseData {
  company: string;
}

export interface TeamResponse extends ApiResponseData {
  domain: string;
}
