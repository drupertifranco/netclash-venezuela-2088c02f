-- Inscripciones a NETCLASH
CREATE TABLE registros (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  creado           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  nombre           TEXT    NOT NULL,
  correo           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  telefono         TEXT,
  ciudad           TEXT    NOT NULL,
  pais             TEXT    NOT NULL,
  perfil           TEXT    NOT NULL CHECK (perfil IN ('profesional', 'telecom', 'estudiante', 'profesor', 'otro')),
  organizacion     TEXT,
  experiencia      TEXT    NOT NULL CHECK (experiencia IN ('basico', 'intermedio', 'avanzado')),
  modalidad        TEXT    NOT NULL CHECK (modalidad IN ('equipo', 'individual')),
  equipo           TEXT,
  linkedin         TEXT,
  -- Consentimientos: versión de los términos aceptada y casillas opcionales
  acepta_terminos  INTEGER NOT NULL CHECK (acepta_terminos = 1),
  version_terminos TEXT    NOT NULL,
  comparte_perfil  INTEGER NOT NULL DEFAULT 0,
  recibe_novedades INTEGER NOT NULL DEFAULT 0,
  idioma           TEXT    NOT NULL DEFAULT 'es',
  estado           TEXT    NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'lista_espera', 'cancelado'))
);

CREATE INDEX registros_equipo ON registros (equipo);
