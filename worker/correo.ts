// Envío de correos del laboratorio post-charla (stub hasta la Tarea 4).
export type Plantilla = "confirmacion" | "acceso" | "recordatorio" | "resultados";

export async function encolarYEnviar(_env: Env, _inscritoId: number, _plantilla: Plantilla): Promise<void> {}

export async function reintentarPendientes(_env: Env): Promise<number> {
  return 0;
}
