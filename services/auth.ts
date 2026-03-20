export const DRIVE_SCOPE =
  "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email";

let gisLoaded = false;

export function loadGIS(): Promise<void> {
  if (gisLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Cannot load GIS in non-browser environment"));
      return;
    }

    const existing = document.querySelector(
      'script[src*="accounts.google.com/gsi/client"]',
    );
    if (existing) {
      gisLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export interface TokenResult {
  accessToken: string;
  expiresIn: number;
  email: string;
}

export async function requestAccessToken(
  clientId: string,
  hint?: string,
): Promise<TokenResult> {
  await loadGIS();

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      hint,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }

        // Fetch user email from Google
        try {
          const userInfo = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            { headers: { Authorization: `Bearer ${response.access_token}` } },
          );
          const data = (await userInfo.json()) as { email?: string };

          if (!data.email) {
            reject(new Error("Google did not return an email address"));
            return;
          }

          resolve({
            accessToken: response.access_token,
            expiresIn: response.expires_in,
            email: data.email,
          });
        } catch {
          reject(new Error("Failed to fetch user info"));
        }
      },
      error_callback: (error) => {
        reject(new Error(error.message));
      },
    });

    client.requestAccessToken();
  });
}

export async function silentReAuth(
  clientId: string,
  email: string,
): Promise<TokenResult | null> {
  await loadGIS();

  return new Promise((resolve) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      hint: email,
      prompt: "",
      callback: async (response) => {
        if (response.error) {
          resolve(null);
          return;
        }

        try {
          const userInfo = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            { headers: { Authorization: `Bearer ${response.access_token}` } },
          );
          const data = (await userInfo.json()) as { email: string };

          resolve({
            accessToken: response.access_token,
            expiresIn: response.expires_in,
            email: data.email,
          });
        } catch {
          resolve(null);
        }
      },
      error_callback: () => {
        resolve(null);
      },
    });

    client.requestAccessToken({ prompt: "" });
  });
}

export function isTokenExpired(tokenExpiry: number): boolean {
  // Consider expired 5 minutes before actual expiry for buffer
  return Date.now() >= tokenExpiry - 5 * 60 * 1000;
}
