// Textos de los correos del laboratorio post-charla. Sin datos de otras personas ni el token (salvo el de acceso, fase 2).
export interface Correo {
  asunto: string;
  html: string;
  texto: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function plantillaConfirmacion(i: { nombre: string; alias: string }): Correo {
  const nombre = i.nombre.trim().split(/\s+/)[0];
  const parrafos = [
    `Hola ${nombre}:`,
    "Quedaste inscrito en el laboratorio de NetClash que presentamos en VENOG.",
    "El 30 de noviembre te llega a este correo tu acceso personal. La ventana para hacer los laboratorios va del 1 al 7 de diciembre: entras cuando puedas.",
    "Son tres laboratorios, OSPF, BGP y DNS, de 30 minutos como máximo cada uno. Cada uno levanta tu propia red y un evaluador te dice cuándo lo resolviste.",
    `En el ranking vas a aparecer como «${i.alias}».`,
    "Si tienes dudas, responde a este correo.",
    "Domenico · NetClash",
  ];
  return {
    asunto: "Quedaste inscrito en el laboratorio de NetClash",
    texto: parrafos.join("\n\n"),
    html: `<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#10151F">${parrafos
      .map((p) => `<p>${esc(p)}</p>`)
      .join("")}</body></html>`,
  };
}
