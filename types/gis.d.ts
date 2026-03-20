declare namespace google.accounts.oauth2 {
  interface TokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: { type: string; message: string }) => void;
    prompt?: "" | "none" | "consent" | "select_account";
    hint?: string;
  }

  interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    error?: string;
    error_description?: string;
    error_uri?: string;
  }

  interface TokenClient {
    requestAccessToken: (overrides?: {
      prompt?: string;
      hint?: string;
      scope?: string;
    }) => void;
  }

  function initTokenClient(config: TokenClientConfig): TokenClient;

  function revoke(
    accessToken: string,
    callback?: () => void,
  ): void;
}
