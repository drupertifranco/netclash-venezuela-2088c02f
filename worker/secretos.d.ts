// Secretos que carga el usuario con `wrangler secret put` (no están en wrangler.jsonc).
declare namespace Cloudflare {
  interface Env {
    TURNSTILE_SECRET: string;
    RESEND_API_KEY?: string;
  }
}
