/** Google Analytics gtag.js global type declarations */

type GtagConfigParams = {
  debug_mode?: boolean;
  send_page_view?: boolean;
  [key: string]: unknown;
};

type GtagEventParams = Record<string, string | number | boolean | undefined>;

interface Window {
  dataLayer: Array<unknown>;
  gtag: {
    (command: "config", targetId: string, params?: GtagConfigParams): void;
    (command: "event", eventName: string, params?: GtagEventParams): void;
    (command: "js", date: Date): void;
    (command: "set", params: Record<string, unknown>): void;
  };
}
