// Secretos que carga el usuario con `wrangler secret put` (no están en wrangler.jsonc).
// El código usa el Env global; los tests, Cloudflare.Env. Se declaran en ambos.
interface SecretosNetclash {
  TURNSTILE_SECRET: string;
  RESEND_API_KEY?: string;
}
interface Env extends SecretosNetclash {}
declare namespace Cloudflare {
  interface Env extends SecretosNetclash {}
}
