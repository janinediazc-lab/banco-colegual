# 🛡️ Guía de Configuración: Base de Datos Permanente y Notificaciones al Correo
## Banco Escolar Colegual • Escuela Rural Colegual (RBD 7967)

Esta guía explica cómo activar la **persistencia indestructible de datos hasta fin de año** y las **notificaciones inmediatas por correo electrónico** a `janine.diaz@slepllanquihue.cl`.

---

## 🏛️ PARTE 1: Persistencia Permanente en la Nube con Supabase (100% Gratuito)

Render en su plan gratuito utiliza discos temporales. Para que las transacciones y puntos **no se pierdan bajo ninguna circunstancia** (incluso si Render se suspende o se actualiza), conectamos el sistema a **Supabase** (base de datos en la nube gratuita).

### Paso 1: Crear una cuenta en Supabase
1. Ingresa a [https://supabase.com](https://supabase.com) y haz clic en **"Start your project"**.
2. Inicia sesión con GitHub o con tu correo electrónico institucional.
3. Haz clic en **"New Project"** (Nuevo Proyecto):
   * **Name**: `banco-colegual`
   * **Database Password**: Genera o escribe una contraseña segura (guárdala).
   * **Region**: Selecciona `South America (São Paulo)` o `US East`.
   * **Plan**: Free Tier (Gratuito, incluye 500 MB; nuestro banco ocupa menos de 1 MB).

### Paso 2: Crear la tabla de respaldo (1 solo clic)
1. En el menú lateral izquierdo de tu proyecto en Supabase, ve a **SQL Editor**.
2. Haz clic en **"New Query"**, pega el siguiente código SQL y presiona el botón verde **"Run"**:

```sql
create table if not exists banco_colegual_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Habilitar permisos de lectura y escritura
alter table banco_colegual_state enable row level security;

create policy "Acceso completo para Banco Colegual"
on banco_colegual_state for all
using (true)
with check (true);
```

### Paso 3: Copiar las credenciales a Render
1. En Supabase, ve a **Project Settings** (el engranaje abajo a la izquierda) -> **API**.
2. Copia:
   * **Project URL**: (Ejemplo: `https://abcdefghijklm.supabase.co`)
   * **Project API Keys** -> `anon` / `public`: (Una clave larga que empieza con `eyJ...`)
3. Entra a tu panel de **Render** ([dashboard.render.com](https://dashboard.render.com)):
   * Selecciona tu servicio web `banco-colegual`.
   * Ve a la pestaña **Environment** (Variables de entorno).
   * Agrega dos variables:
     * `SUPABASE_URL` = (Pega tu Project URL de Supabase)
     * `SUPABASE_KEY` = (Pega tu clave anon/public de Supabase)
   * Haz clic en **"Save Changes"**.

> ✨ **¡Listo!** A partir de ese momento, cada vez que un profesor abone puntos, se guardará en Supabase al instante. Cuando Render se reinicie, leerá los datos directamente desde Supabase y nada se perderá hasta fin de año.

---

## ✉️ PARTE 2: Notificaciones Inmediatas a `janine.diaz@slepllanquihue.cl`

Cada vez que un docente o directivo asigne puntos a un estudiante o canjee un premio, el sistema enviará un correo formal e institucional con todos los detalles.

### Opción Recomendada: Resend (Gratuito, moderno y confiable)
1. Ingresa a [https://resend.com](https://resend.com) y crea una cuenta gratuita.
2. En el panel principal, haz clic en **"API Keys"** -> **"Create API Key"**.
3. Copia la clave generada (empieza con `re_...`).
4. En **Render** ([dashboard.render.com](https://dashboard.render.com)) -> Servicio `banco-colegual` -> **Environment**:
   * Agrega la variable:
     * `RESEND_API_KEY` = (Pega tu clave `re_...`)
     * `NOTIFICATION_EMAIL` = `janine.diaz@slepllanquihue.cl`
   * Guarda los cambios.

### Opción Alternativa: Enviar mediante cuenta Gmail (SMTP)
Si prefieres que los correos salgan desde una cuenta Gmail de la escuela:
1. En tu cuenta de Google, activa la verificación en 2 pasos y genera una **Contraseña de Aplicación** (App Password).
2. En Render, agrega:
   * `GMAIL_USER` = `tu.correo.escuela@gmail.com`
   * `GMAIL_APP_PASS` = `tu_contraseña_de_aplicacion_de_16_letras`
   * `NOTIFICATION_EMAIL` = `janine.diaz@slepllanquihue.cl`

---

## 🛡️ Doble Escudo de Seguridad Ya Activo
Incluso mientras configuras las variables anteriores, he dejado activado un **Escudo de Auto-Recuperación en el Navegador**:
* Si Render se reinicia y el servidor se borra temporalmente, el navegador del docente o de la coordinadora que abra la aplicación detectará que su caché local tiene más transacciones y **re-subirá automáticamente los datos al servidor**.
