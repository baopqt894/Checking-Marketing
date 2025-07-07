export interface Token {
  id?: string;
  email: string;
  access_token: string;
  refresh_token: string;
  google_client_id: string;
  google_client_secret: string;
  google_redirect_uri: string;
  publisher_ids?: string[];
  currency_code?: string;
  reporting_time_zone?: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TokenEditableFields = Pick<
  Token,
  | "google_client_id"
  | "google_client_secret"
  | "google_redirect_uri"
  | "publisher_ids"
  | "currency_code"
  | "reporting_time_zone"
>;
