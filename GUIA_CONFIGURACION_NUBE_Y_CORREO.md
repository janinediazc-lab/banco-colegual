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
2. Haz clic en **"New Query"**, borra lo que haya en la pantalla y pega el siguiente código SQL *(asegúrate de copiar solo las líneas desde `create table...`, sin las comillas ni la palabra ```sql)*, luego presiona el botón verde **"Run"**:

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
1. En Supabase, ve a **Project Settings** (el engranaje abajo a la izquierda) -> **API** o **Data API**.
2. Copia:
   * **Project URL**: (Debe ser `https://[referencia].supabase.co`. *Nota:* Si termina en `/rest/v1`, bórralo para que termine solo en `.supabase.co`).
   * **Project API Keys** -> `anon` / `public`: (Una clave larga que empieza con `eyJ...`).
3. Entra a tu panel de **Render** ([dashboard.render.com](https://dashboard.render.com)):
   * Selecciona tu servicio web `banco-colegual`.
   * Ve a la pestaña **Environment** (Variables de entorno).
   * Agrega dos variables:
     * `SUPABASE_URL` = `https://[referencia].supabase.co`
     * `SUPABASE_KEY` = (Pega tu clave anon/public de Supabase)
   * Haz clic en **"Save Changes"**.

> 💡 **Nota sobre el error PGRST125 (404):** Si en Render colocaste la URL con `/rest/v1` al final, el sistema la duplicaba (`/rest/v1/rest/v1/`). Ya dejamos una protección en el código para limpiarla automáticamente, pero asegúrate en Render de que quede limpia como `https://xxxx.supabase.co`.

---

## ✉️ PARTE 2: Notificaciones Inmediatas a `janine.diaz@slepllanquihue.cl`

> ⚠️ **¿Por qué sale el error `connect ENETUNREACH ...:465` al probar Gmail?**
> **Render** (al igual que la gran mayoría de plataformas en la nube gratuitas) **bloquea por firewall las conexiones de correo tradicionales (puertos 25, 465 y 587)** para prevenir spam.
> Por esa razón, **la única forma 100% garantizada de enviar correos desde Render es a través de una API HTTP como Resend** (opera por el puerto web seguro HTTPS 443, el cual nunca es bloqueado).

---

### 🚀 Solución Definitiva: Activar Resend (Gratis y toma 1 minuto)

1. Ingresa a **[https://resend.com](https://resend.com)** y haz clic en **"Sign Up"** (puedes iniciar sesión con Google o tu correo institucional).
2. En el menú de la izquierda, entra a **"API Keys"** y haz clic en el botón negro **"Create API Key"**.
3. Ponle de nombre `Banco Colegual`, deja los permisos completos y pulsa **"Add"**.
4. Te mostrará tu clave secreta (empieza con `re_...`). **Cópiala**.
5. Abre tu panel de **Render** ([dashboard.render.com](https://dashboard.render.com)) -> servicio **`banco-colegual`** -> pestaña **Environment**:
   * Agrega la variable:
     * **`RESEND_API_KEY`** = `re_xxxxxxxxxxxx` *(tu clave copiada de Resend)*
     * **`NOTIFICATION_EMAIL`** = `janine.diaz@slepllanquihue.cl`
   * *(Opcional: puedes borrar `GMAIL_USER` y `GMAIL_APP_PASS` ya que no serán necesarias)*.
6. Haz clic en **"Save Changes"**. Render reiniciará el servicio con la nueva configuración en unos 60 segundos.

---

## 🧪 Cómo Probar que Todo Está Funcionando
1. Abre tu web en [https://banco-colegual.onrender.com](https://banco-colegual.onrender.com).
2. Entra al **Panel de Administración**.
3. En la nueva sección **"🌐 Infraestructura: Nube Supabase y Notificaciones"**, verás:
   * Si Supabase está en verde (🟢 Sincronizado).
   * Si el Correo está en verde (🟢 Activo).
4. Haz clic en el botón **"📧 Probar Notificación por Correo"**: te avisará de inmediato si el correo salió exitosamente a `janine.diaz@slepllanquihue.cl`.

---

## 🛡️ Doble Escudo de Seguridad Ya Activo
Incluso mientras configuras las variables anteriores, el **Escudo de Auto-Recuperación en el Navegador** ya está funcionando:
* En tus registros se confirmó: `[Auto-Restore] 🛡️ Restaurando estado desde el cliente (148 transacciones vs 68 en servidor)...`
* Si Render se reinicia, el navegador detecta las transacciones y re-sincroniza automáticamente los datos. Con Supabase activo, este respaldo será además eterno en la nube.
