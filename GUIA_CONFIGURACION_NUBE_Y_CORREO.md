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

> ⚠️ **¿Por qué no llegó el correo de prueba?**
> En tus registros de Render apareció:
> `[Mailer Demo] 📬 [SIMULACIÓN] Correo para: janine.diaz@slepllanquihue.cl`
> `(Para habilitar el envío real en producción, configura RESEND_API_KEY o SMTP_USER/SMTP_PASS en Render)`
> Esto significa que el sistema **reconoció el correo**, pero al no tener las credenciales guardadas en las variables de entorno de Render, funcionó en **modo simulación (solo imprimiendo en pantalla)** para proteger la aplicación.

Para que los correos lleguen **realmente a tu bandeja de entrada**, elige una de estas dos opciones y agrégala en **Environment** de Render:

### Opción 1: Enviar mediante cuenta Gmail (Recomendada si tienes un correo Gmail)
Google no permite usar la contraseña normal de Gmail por seguridad; exige una **Contraseña de Aplicación de 16 letras**:
1. Entra a tu cuenta Google y ve directo a: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   *(Debes tener activa la "Verificación en 2 pasos" en tu cuenta)*.
2. Escribe como nombre "Banco Colegual" y haz clic en **Crear**.
3. Google te mostrará un código amarillo de 16 letras (ejemplo: `abcd efgh ijkl mnop`). Cópialo.
4. En **Render** ([dashboard.render.com](https://dashboard.render.com)) -> Servicio `banco-colegual` -> pestaña **Environment**, agrega:
   * `GMAIL_USER` = `tu.correo@gmail.com` (la cuenta desde donde se enviarán)
   * `GMAIL_APP_PASS` = `abcdefghijklmnop` (las 16 letras generadas)
   * `NOTIFICATION_EMAIL` = `janine.diaz@slepllanquihue.cl`
5. Haz clic en **"Save Changes"**.

### Opción 2: Usar Resend (Gratuito y sin configurar Google)
1. Ingresa a [https://resend.com](https://resend.com) y regístrate gratis.
2. Ve a **API Keys** -> **Create API Key**.
3. Copia tu clave (empieza con `re_...`).
4. En **Render** -> **Environment**, agrega:
   * `RESEND_API_KEY` = (Pega tu clave `re_...`)
   * `NOTIFICATION_EMAIL` = `janine.diaz@slepllanquihue.cl`
5. Haz clic en **"Save Changes"**.

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
