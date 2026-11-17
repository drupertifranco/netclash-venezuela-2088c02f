import { SELF } from "cloudflare:test";
import { expect, it } from "vitest";

it("registro_rechaza_no_json_415", async () => {
  const r = await SELF.fetch("https://netclash.org/api/registro", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "hola",
  });
  expect(r.status).toBe(415);
});
