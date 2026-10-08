# 🌐 Guía: Cómo Trabajar con el Banco Colegual como Página Web

> 🌟 **Recurso pedagógico e institucional realizado por la Coordinadora de Vida Escolar Janine Díaz Calixto**  
> *Escuela Rural Colegual (RBD 7967, Llanquihue) — Sistema de Mérito y Convivencia ColegualCoins (CC)*

El **Banco Escolar Colegual** está diseñado para funcionar de manera versátil como una aplicación web moderna (PWA), tanto de manera local en la escuela como publicado en Internet.

---

## 🚀 Opción 1: Abrir en este computador con 1 solo clic (Recomendado)

En la carpeta principal del proyecto encontrarás el archivo:
👉 **`Abrir Banco Colegual.command`**

1. Haz **doble clic** sobre el archivo `Abrir Banco Colegual.command`.
2. Se iniciará el sistema automáticamente y se abrirá tu navegador (Chrome, Safari o Edge) en:
   ```
   http://localhost:5173
   ```
3. ¡Listo! Ya estás trabajando en la plataforma web. No necesitas usar la terminal ni escribir comandos.

---

## 📱 Opción 2: Usar desde celulares y tablets de Profesores y Asistentes (Wi-Fi Escolar)

Para que los profesores y asistentes puedan usar la cámara de sus teléfonos para escanear los carnets QR en el patio, salas o buses:

1. Asegúrate de que el computador y los teléfonos estén conectados al **mismo Wi-Fi de la escuela**.
2. En la plataforma, presiona el botón **🌐** ubicado en la esquina superior derecha del encabezado.
3. Se abrirá una ventana con un **código QR de Red** y el enlace:
   ```
   http://10.11.10.36:5173
   ```
4. Los profesores solo deben **apuntar la cámara de su celular al código QR** y la página se abrirá al instante en sus teléfonos.
5. Cada docente o asistente puede seleccionar su nombre en **"👤 Cambiar Funcionario Responsable"** y empezar a registrar ColegualCoins.

---

## 📲 Opción 3: Instalar como App en el Celular o Computador (PWA)

La plataforma cuenta con tecnología **Progressive Web App (PWA)**:
- **En Android (Chrome):** Toca los 3 puntos del navegador y elige **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
- **En iPhone / iPad (Safari):** Toca el botón de compartir (el cuadrado con la flecha hacia arriba) y selecciona **"Agregar al inicio"** (Add to Home Screen).
- **En el Computador (Chrome/Edge):** Aparecerá un botón dorado en la barra superior que dice **"📲 Instalar App"**, o el icono de instalación en la barra de direcciones.

Al instalarla, funcionará como una aplicación nativa con su propio ícono del Banco Colegual y pantalla completa sin barras de navegador.

---

## ☁️ Opción 4: Publicar en Internet con Sincronización en la Nube

Para que los profesores puedan abonar o quitar puntos desde sus celulares (incluso con datos móviles 4G/5G o desde sus casas) y se vea **reflejado de inmediato en el computador de la escuela**, la plataforma necesita un **servidor central con base de datos en la nube**.

### ⚠️ Aclaración Importante sobre Hosting Estático vs Servidor Completo:
* **Hosting solo Estático (GitHub Pages / Netlify Drop / Vercel sin Node):** Solo publica la interfaz visual. Cada teléfono guardaría sus puntos de forma aislada en su propia memoria (`localStorage`), por lo que **NO se sincronizarían** entre distintos celulares y el computador.
* **Servidor Node.js en la Nube (Render.com / Railway - Recomendado y Gratis):** Ejecuta tanto la página web como el motor de sincronización (`server.js` y `data/banco_colegual_db.json`). En este caso, **SÍ se sincronizan al instante 100% de los teléfonos con todos los computadores**.

### 🚀 Cómo publicarlo Gratis en Render.com (Con sincronización total en tiempo real):
1. Crea una cuenta gratuita en [render.com](https://render.com).
2. Presiona **New +** y selecciona **Web Service**.
3. Conecta el repositorio de GitHub de este proyecto (o súbelo a un repositorio privado de GitHub).
4. Configura los siguientes 2 campos:
   * **Build Command:** `npm run build`
   * **Start Command:** `npm start` (o `node server.js`)
5. Presiona **Create Web Service**.
6. ¡Listo! Render te entregará una dirección web permanente como:
   `https://banco-colegual.onrender.com`
   Al abrir esa URL en cualquier celular o computador, todos estarán conectados a la misma base de datos central en vivo.

---

## 🔐 Seguridad y Activación de Funcionarios con Contraseña
Para resguardar la asignación de **ColegualCoins (CC)** y garantizar que solo el funcionario autorizado registre puntos:
1. **Sin cargos ni funciones a la vista:** En toda la plataforma solo se muestran los nombres de los funcionarios (no se exhiben cargos ni títulos).
2. **Activación con Contraseña:** Al hacer clic en su nombre para activar su sesión o al intentar abonar puntos:
   - Se abrirá la ventana de **Validación de Contraseña**.
   - La contraseña de cada funcionario es su **primer nombre acompañado de 7967** (por ejemplo: `Janine7967`, `Nicole7967`, `Karla7967`, `Maria7967`, etc. — no distingue mayúsculas ni tildes).
3. **Confirmación Visual:** Al ingresar la contraseña correcta, el encabezado mostrará `🟢 Activo (Cambiar)` y quedará habilitado para abonar o descontar puntos tanto individualmente como a cursos completos y mediante escáner QR.

---

## ➖ Opción de Quitar o Descontar ColegualCoins (CC)
Para abordar formativamente situaciones de convivencia, daño material o correcciones administrativas:
1. **En la tarjeta de cada estudiante:**
   - Puedes hacer clic directo en el botón **`➖ Quitar CC`** o abrir la ventana y alternar entre las pestañas **`➕ Abonar ColegualCoins`** y **`➖ Quitar ColegualCoins`**.
2. **En el Escáner QR (Cámara de Celular o PC):**
   - Al escanear el carnet de un estudiante, aparece el selector inmediato para cambiar a **`➖ Quitar ColegualCoins`**.
3. **Motivos Formativos Predefinidos:**
   - ⚠️ *Falta a la Buena Convivencia Escolar* (-10 CC sugeridos).
   - 🗑️ *Descuido o Daño al Entorno y Mobiliario* (-10 CC sugeridos).
   - 📚 *Incumplimiento Reiterado de Deberes* (-10 CC sugeridos).
   - 🚌 *Infracción en Transporte Escolar* (-10 CC sugeridos).
   - ⚙️ *Corrección o Ajuste Administrativo de Saldo* (-10 CC sugeridos).
   - ❗ *Otra Falta Formativa o Conductual* (-5 CC sugeridos).
4. **Protección de Saldo Cero:** El sistema nunca permite saldos negativos; si un estudiante tiene 5 CC y se descuentan 10 CC, su saldo queda protegido en 0 CC.
5. **Registro Transparente en la Cartola:** Cada descuento queda registrado con fecha, hora, motivo, nombre del funcionario responsable y monto en rojo (`-10 CC`) en la libreta de ahorro del alumno.

---

## 👨‍🎓 Gestión de Alumnos y Avance de Año Escolar (Panel y Auditoría)
En la pestaña **📊 Panel y Auditoría**:
1. **➕ Agregar Estudiante:** Permite incorporar nuevos alumnos con su RUN, nombre completo, curso, edad y saldo inicial de bienvenida.
2. **✏️ Editar / 🗑️ Eliminar:** Modifica datos de cualquier estudiante o márcalo como retirado/inactivo.
3. **🎓 Avanzar Año Escolar:** Al iniciar un nuevo año académico, presiona este botón para promover automáticamente a todos los alumnos al curso siguiente (Pre-Kínder a Kínder, 1° a 2°, etc.). Los alumnos de 8° Básico quedan registrados como Egresados y los saldos se conservan intactos. Requiere el PIN de autorización **`3834`**.

---

## ⚠️ Reinicio de Fábrica con PIN de Seguridad
Para evitar borrados accidentales de los datos de los estudiantes y sus ColegualCoins:
- El botón **⚠️ Reiniciar Datos** en el Panel de Auditoría solicita obligatoriamente el PIN de seguridad: **`3834`**.
- Sin este PIN no es posible borrar la base de datos.
- Al ingresar el PIN `3834`, se restablecen las cuentas a 10 ColegualCoins de bienvenida y se actualizan al instante todos los dispositivos conectados.

---

## 💾 Respaldo y Sincronización en Tiempo Real
Todos los datos de estudiantes, funcionarios, transacciones y saldos de ColegualCoins se guardan centralizadamente en `data/banco_colegual_db.json` y se sincronizan al instante entre el computador y todos los celulares conectados:
- Al escanear o abonar desde el teléfono, el servidor recibe los datos en tiempo real y actualiza automáticamente la pantalla del computador sin necesidad de recargar la página.
- Puedes descargar un archivo de respaldo (**JSON**) para guardar en pendrive o nube desde **📊 Panel y Auditoría**.
- Exportar la nómina completa con saldos a **Excel (CSV)**.
- Restaurar respaldos anteriores en cualquier momento.
