# Portal Manglar

Portal interno del **Colegio Integral El Manglar**. Docentes y Coordinación lo usan para planificar clases y enviarlas a revisión, registrar evaluaciones por lapso, y organizar horarios, guardias, proyectos de aula y salidas de campo.

## Ejecutar en local

Requisitos: Node.js 18 o superior.

```bash
npm install
npm run dev
```

La app queda en `http://localhost:3000`. Sin credenciales de Supabase funciona en **modo demo**, con datos de ejemplo y las cuentas de demostración de la pantalla de inicio.

## Configuración

Copia `.env.example` a `.env.local` y completa:

| Variable | Para qué sirve |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Inicio de sesión con Google y datos compartidos. |
| `APP_URL` | URL pública, usada en las redirecciones de inicio de sesión. |

`GEMINI_API_KEY` aparece en `.env.example` por la plantilla original, pero el código actual no lo usa.

La base de datos se crea con [`schema_completo.sql`](schema_completo.sql). Si tu base es anterior a la configuración de lapsos y a la planificación por día, vuelve a ejecutar el script o solo estas líneas:

```sql
ALTER TABLE public.school_years ADD COLUMN IF NOT EXISTS lapsos JSONB;
ALTER TABLE public.lesson_plans ADD COLUMN IF NOT EXISTS day_of_week TEXT
  CHECK (day_of_week IN ('Lunes','Martes','Miércoles','Jueves','Viernes'));
```

## Seguridad (permisos por rol)

Los permisos se aplican en la base de datos con Row Level Security, no solo en la interfaz. El archivo [`seguridad_rls.sql`](seguridad_rls.sql) define quién puede leer y escribir cada tabla; al inicio del archivo está la tabla completa de permisos. En resumen:

- **Sin sesión** no se lee ni se escribe nada.
- **Miembro**: sesión de Google con un correo registrado y activo en `users`. Puede leer el portal.
- **Docente**: escribe sus planificaciones, calificaciones y salidas de campo, agrega competencias y registra variaciones de horario. No puede aprobar, auditar ni editar lo ya aprobado.
- **Coordinación** puede todo.

**Orden de despliegue** (importante):

1. Publica primero esta versión de la app.
2. Comprueba que en `users` haya al menos un correo de Coordinación con `status = 'active'`.
3. En el SQL Editor de Supabase, ejecuta [`schema_completo.sql`](schema_completo.sql) (si la base es nueva) y después [`seguridad_rls.sql`](seguridad_rls.sql). Este último se puede volver a ejecutar sin problema.

A tener en cuenta:

- Las salidas de campo creadas antes de esta migración no tienen autor; solo Coordinación puede editarlas hasta asignarles uno (hay un ejemplo al final de `seguridad_rls.sql`).
- El modo demo funciona sin sesión, así que con estas reglas no guarda nada en Supabase: sus datos viven solo en el navegador.
- El editor SQL y la clave `service_role` no están sujetos a estas reglas. Nunca pongas la clave `service_role` en la app.

## Planificación

El docente planifica paso a paso: asignatura y grado, semana del lapso, día (lunes a viernes) y, si procede, el tema o unidad; después las competencias y los momentos de la clase. Cada día es una planificación propia.

## Año escolar y lapsos

Coordinación define en **Años escolares y lapsos** (menú del año escolar, en la cabecera) la semana de inicio y el número de semanas de cada lapso. Horarios, planificación, proyectos de aula, salidas de campo y la marea del lapso del panel usan esa configuración. Hasta que se configure, el portal propone fechas sugeridas (`src/utils/lapsoCalendar.ts`).

## Diseño

- **Tokens** (colores, tipografía, radios y sombras): `src/index.css`. Usa los nombres semánticos (`primary`, `success`, `warning`, `danger`, `info`, `attention`) y los de marca (`raiz`, `fango`, `manglar`, `hoja`, `salobre`, `polen`, `mangle`). No uses tonos sueltos de Tailwind.
- **Componentes base**: `src/components/ui/` (`Button`, `Badge`, `Panel`, `Field`, `Modal`, `Tabs`, `PageHeader`). Úsalos en vez de repetir clases a mano.
- **Tipografía**: Atkinson Hyperlegible Next. Los textos van en tipo oración, sin mayúsculas forzadas.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Compilación de producción en `dist/`. |
| `npm run lint` | Comprobación de tipos con TypeScript. |
