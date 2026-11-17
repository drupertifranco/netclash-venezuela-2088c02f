-- Laboratorio post-charla VENOG: inscritos (por persona) y registro de correos enviados
CREATE TABLE postcharla_inscritos (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  creado           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  nombre           TEXT    NOT NULL CHECK (length(nombre) <= 120),
  correo           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  alias            TEXT    NOT NULL CHECK (length(alias) <= 40),
  organizacion     TEXT,
  experiencia      TEXT    NOT NULL CHECK (experiencia IN ('basico', 'intermedio', 'avanzado')),
  acepta_terminos  INTEGER NOT NULL CHECK (acepta_terminos = 1),
  version_terminos TEXT    NOT NULL,
  recibe_novedades INTEGER NOT NULL DEFAULT 0,
  -- Credencial del portal de laboratorios: se envía en el correo de acceso, nunca antes
  token            TEXT    NOT NULL UNIQUE,
  ip               TEXT
);

CREATE TABLE postcharla_envios (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  inscrito_id  INTEGER NOT NULL REFERENCES postcharla_inscritos (id) ON DELETE CASCADE,
  plantilla    TEXT    NOT NULL CHECK (plantilla IN ('confirmacion', 'acceso', 'recordatorio', 'resultados')),
  estado       TEXT    NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'error')),
  intentos     INTEGER NOT NULL DEFAULT 0,
  ultimo_error TEXT,
  creado       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  actualizado  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (inscrito_id, plantilla)
);

CREATE INDEX postcharla_envios_estado ON postcharla_envios (estado);
