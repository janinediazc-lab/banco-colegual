import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LOGO_PATH = path.join(ROOT_DIR, 'public/Logo Colegual.png');
const EMBLEM_PATH = path.join(ROOT_DIR, 'public/emblema_colegual_circular.png');

const OUTPUT_PNG = path.join(ROOT_DIR, 'Infografia_Docente_Banco_Colegual.png');
const OUTPUT_PUBLIC_PNG = path.join(ROOT_DIR, 'public/Infografia_Docente_Banco_Colegual.png');
const OUTPUT_DIST_PNG = path.join(ROOT_DIR, 'dist/Infografia_Docente_Banco_Colegual.png');

const OUTPUT_PDF = path.join(ROOT_DIR, 'Infografia_Docente_Banco_Colegual.pdf');
const OUTPUT_PUBLIC_PDF = path.join(ROOT_DIR, 'public/Infografia_Docente_Banco_Colegual.pdf');
const OUTPUT_DIST_PDF = path.join(ROOT_DIR, 'dist/Infografia_Docente_Banco_Colegual.pdf');

function toBase64(filePath, mime = 'image/png') {
  if (!fs.existsSync(filePath)) return '';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

async function main() {
  console.log('🎨 Generando Infografía Oficial para Docentes y Asistentes (Banco Colegual)...');

  const logoBase64 = toBase64(LOGO_PATH);
  const emblemBase64 = toBase64(EMBLEM_PATH);

  // Infografía de 1280px x 2750px (Proporción vertical de afiche/infografía de alta fidelidad)
  const infographicHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Infografía Docente - Banco Escolar Colegual</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      width: 1280px;
      height: 2750px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #022019;
      color: #0f172a;
      position: relative;
      overflow: hidden;
    }

    /* Fondo Degradado Bosque Rural con Acentos Dorados y Partículas */
    .infographic-bg {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 50% 5%, rgba(16, 185, 129, 0.4) 0%, transparent 40%),
        radial-gradient(circle at 90% 25%, rgba(245, 158, 11, 0.22) 0%, transparent 40%),
        radial-gradient(circle at 10% 45%, rgba(5, 150, 105, 0.25) 0%, transparent 45%),
        radial-gradient(circle at 85% 70%, rgba(37, 99, 235, 0.2) 0%, transparent 45%),
        radial-gradient(circle at 50% 95%, rgba(245, 158, 11, 0.25) 0%, transparent 45%),
        linear-gradient(180deg, #021a14 0%, #064e3b 15%, #032b21 45%, #0a2e3a 75%, #021a14 100%);
      z-index: 0;
    }

    .infographic-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(rgba(255, 255, 255, 0.2) 1.2px, transparent 1.2px),
        radial-gradient(rgba(245, 158, 11, 0.25) 1.5px, transparent 1.5px);
      background-size: 40px 40px, 80px 80px;
      background-position: 0 0, 20px 20px;
      opacity: 0.35;
    }

    .container {
      position: relative;
      z-index: 1;
      width: 1280px;
      height: 2750px;
      padding: 44px 50px 36px 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* ================= CABECERA PRINCIPAL ================= */
    .header-box {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(14px);
      border: 1.5px solid rgba(245, 158, 11, 0.4);
      border-radius: 20px;
      padding: 24px 34px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    .header-logo-group {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-logo-img {
      height: 90px;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
    }

    .header-text h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.1rem;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.15;
      letter-spacing: -0.01em;
    }

    .header-text h1 span {
      background: linear-gradient(135deg, #fde68a, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
      font-size: 1.55rem;
      margin-top: 4px;
      font-weight: 800;
    }

    .header-meta {
      font-size: 0.92rem;
      color: #cbd5e1;
      margin-top: 5px;
      font-weight: 600;
    }

    .header-badge-col {
      text-align: right;
    }

    .header-pill {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-weight: 900;
      font-size: 0.85rem;
      padding: 6px 14px;
      border-radius: 99px;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    .author-pill {
      font-size: 0.85rem;
      color: #a7f3d0;
      font-weight: 700;
      margin-top: 6px;
    }

    /* ================= SECCIONES Y TARJETAS ================= */
    .section-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-family: 'Outfit', sans-serif;
      font-weight: 900;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      flex-shrink: 0;
    }

    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .section-subtitle {
      font-size: 0.86rem;
      color: #94a3b8;
      margin-left: 52px;
      margin-top: -8px;
      margin-bottom: 12px;
    }

    .card-white {
      background: #ffffff;
      border-radius: 16px;
      padding: 18px 22px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* ================= GRILLAS DE CONTENIDO ================= */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    /* Bloque 1: Ingreso y Claves */
    .access-step-card {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
    }

    .access-step-card strong {
      font-size: 0.92rem;
      color: #0f2b48;
      display: block;
      margin-bottom: 3px;
    }

    .access-step-card p {
      font-size: 0.81rem;
      color: #475569;
      line-height: 1.35;
    }

    /* Bloque 2: Las 3 formas */
    .method-card {
      background: #f8fafc;
      border-radius: 14px;
      padding: 14px 18px;
      border: 1.5px solid #e2e8f0;
      position: relative;
    }

    .method-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .method-icon {
      font-size: 1.6rem;
    }

    .method-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      color: #0f2b48;
    }

    .method-card p {
      font-size: 0.81rem;
      color: #475569;
      line-height: 1.4;
    }

    /* Tabla de Conductas */
    .conducts-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.83rem;
    }

    .conducts-table th {
      background: #0f2b48;
      color: #ffffff;
      padding: 8px 12px;
      text-align: left;
      font-weight: 800;
      font-size: 0.82rem;
      letter-spacing: 0.02em;
    }

    .conducts-table td {
      padding: 7px 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
      line-height: 1.35;
    }

    .conducts-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    .badge-pt {
      display: inline-block;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 99px;
      font-size: 0.74rem;
      text-align: center;
      white-space: nowrap;
    }

    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-gold { background: #fef3c7; color: #b45309; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-red { background: #fee2e2; color: #b91c1c; }

    /* Decálogo */
    .decalogo-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #059669;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 0.81rem;
      color: #334155;
      line-height: 1.35;
    }

    .decalogo-item strong {
      color: #064e3b;
      font-weight: 800;
    }

    /* Pie de Página */
    .footer-box {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(14px);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 18px;
      padding: 18px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #e2e8f0;
    }

    .footer-left strong {
      font-size: 1rem;
      color: #38bdf8;
      display: block;
      margin-bottom: 2px;
    }

    .footer-left p {
      font-size: 0.82rem;
      color: #94a3b8;
      line-height: 1.35;
    }

    .footer-credits {
      text-align: right;
      font-size: 0.82rem;
    }

    .footer-credits strong {
      color: #fde68a;
      font-size: 0.95rem;
    }
  </style>
</head>
<body>

  <div class="infographic-bg"></div>

  <div class="container">

    <!-- ================= CABECERA INSTITUCIONAL ================= -->
    <div class="header-box">
      <div class="header-logo-group">
        <img src="${logoBase64}" class="header-logo-img" alt="Logo Escuela Rural Colegual">
        <div class="header-text">
          <h1>
            INFOGRAFÍA PRÁCTICA DOCENTE
            <span>Sistema de Refuerzo Positivo "Banco Colegual"</span>
          </h1>
          <div class="header-meta">
            🏛️ Escuela Rural Colegual (RBD 7967, Llanquihue) &bull; Moneda Escolar: <strong>ColegualCoins (CC)</strong>
          </div>
        </div>
      </div>

      <div class="header-badge-col">
        <div class="header-pill">⭐ Guía Rápida de Acción</div>
        <div class="author-pill">🌟 Janine Díaz Calixto &bull; Coordinación de la Vida Escolar</div>
      </div>
    </div>

    <!-- ================= BLOQUE 1: INGRESO Y ACTIVACIÓN ================= -->
    <div>
      <div class="section-banner">
        <div class="step-circle">1</div>
        <div class="section-title">Ingreso a la Plataforma y Activación de Funcionario</div>
      </div>
      <div class="section-subtitle">
        Acceso rápido desde celulares, tablets y computadores para registrar y certificar el mérito de tus alumnos.
      </div>

      <div class="card-white">
        <div class="grid-4">
          <div class="access-step-card" style="border-left: 4px solid #059669;">
            <div style="font-size: 1.25rem; margin-bottom: 3px;">🌐</div>
            <strong>1. Web en la Nube</strong>
            <p>Ingresa en cualquier navegador a <code>banco-colegual.onrender.com</code> con sincronización en tiempo real.</p>
          </div>

          <div class="access-step-card" style="border-left: 4px solid #d97706;">
            <div style="font-size: 1.25rem; margin-bottom: 3px;">📱</div>
            <strong>2. App Móvil (PWA)</strong>
            <p>Toca <em>"Agregar a pantalla de inicio"</em> en tu teléfono. Ideal para patio, pasillos y salidas a terreno.</p>
          </div>

          <div class="access-step-card" style="border-left: 4px solid #2563eb;">
            <div style="font-size: 1.25rem; margin-bottom: 3px;">🔐</div>
            <strong>3. Tu Contraseña</strong>
            <p>Elige tu nombre en el encabezado y escribe tu clave: <strong>PrimerNombre7967</strong> o PIN <code>7967</code>.</p>
          </div>

          <div class="access-step-card" style="border-left: 4px solid #0f2b48;">
            <div style="font-size: 1.25rem; margin-bottom: 3px;">🟢</div>
            <strong>4. Sesión Activa</strong>
            <p>Verifica que diga <strong>🟢 Activo</strong>. Todos tus abonos quedarán transparentemente respaldados a tu nombre.</p>
          </div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 8px 14px; margin-top: 10px; font-size: 0.8rem; color: #065f46; display: flex; align-items: center; justify-content: space-between;">
          <span>🛡️ <strong>Privacidad Infantil Garantizada:</strong> Por protección de datos, los <strong>RUTs de los alumnos están 100% ocultos</strong> en la app. Se utiliza su N° de Cuenta Escolar Oficial.</span>
          <span style="font-weight: 800; background: #059669; color: white; padding: 2px 8px; border-radius: 99px; font-size: 0.72rem;">Cuenta Única</span>
        </div>
      </div>
    </div>

    <!-- ================= BLOQUE 2: LAS 3 FORMAS DE PREMIAR ================= -->
    <div>
      <div class="section-banner">
        <div class="step-circle">2</div>
        <div class="section-title">Las 3 Modalidades para Entregar ColegualCoins</div>
      </div>
      <div class="section-subtitle">
        Elige la vía más práctica y adecuada para tu contexto pedagógico del momento.
      </div>

      <div class="card-white">
        <div class="grid-3">
          <div class="method-card" style="border-top: 4px solid #059669;">
            <div class="method-header">
              <span class="method-icon">👤</span>
              <span class="method-title">1. Alumno Individual</span>
            </div>
            <p>
              Busca al estudiante por nombre o curso en la pestaña <strong>"Gestión Funcionarios"</strong>. Presiona <strong>"➕ Abonar CC"</strong>, selecciona la conducta positiva observada y confirma.
            </p>
            <div style="margin-top: 8px; font-size: 0.75rem; color: #059669; font-weight: 700;">
              ✓ Para reconocer esfuerzos específicos individuales.
            </div>
          </div>

          <div class="method-card" style="border-top: 4px solid #2563eb;">
            <div class="method-header">
              <span class="method-icon">👥</span>
              <span class="method-title">2. Bono a Todo el Curso</span>
            </div>
            <p>
              Haz clic en <strong>"⭐ Bono Grupal (+10 CC)"</strong>. Todos los niños del curso reciben sus puntos simultáneamente con lluvia de confeti en pantalla.
            </p>
            <div style="margin-top: 8px; font-size: 0.75rem; color: #1e40af; font-weight: 700;">
              ✓ Para orden de sala, compañerismo o trabajo en equipo.
            </div>
          </div>

          <div class="method-card" style="border-top: 4px solid #d97706;">
            <div class="method-header">
              <span class="method-icon">📷</span>
              <span class="method-title">3. Escáner QR en Celular</span>
            </div>
            <p>
              Abre <strong>"Escanear Tarjeta QR"</strong> en tu celular y enfoca el carnet del estudiante. En 1 segundo se reconoce su cuenta con un beep para registrar puntos en el patio.
            </p>
            <div style="margin-top: 8px; font-size: 0.75rem; color: #b45309; font-weight: 700;">
              ✓ Ágil para inspectores, patio y recreo entretenido.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= BLOQUE 3: PAUTA DE CONDUCTAS OBSERVABLES ================= -->
    <div>
      <div class="section-banner">
        <div class="step-circle">3</div>
        <div class="section-title">Pauta Oficial de Conductas Observables y Montos Sugeridos</div>
      </div>
      <div class="section-subtitle">
        Criterios unificados para que todo el equipo docente y de asistentes refuerce con equidad pedagógica.
      </div>

      <div class="card-white" style="padding: 12px 18px;">
        <table class="conducts-table">
          <thead>
            <tr>
              <th style="width: 28%;">Categoría Formativa</th>
              <th style="width: 14%; text-align: center;">Monto</th>
              <th style="width: 58%;">Conductas Observables en Aula, Patio y Transporte Escolar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>🌟 Buena Convivencia y Respeto</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-green">+5 o +10 CC</span></td>
              <td>Trato cordial, saludar amablemente, resolver diferencias dialogando, respetar turnos de palabra.</td>
            </tr>
            <tr>
              <td><strong>📚 Esfuerzo Académico y Tareas</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-green">+5 o +10 CC</span></td>
              <td>Superación personal, perseverancia frente a dificultades, traer cuadernos al día, participar activamente.</td>
            </tr>
            <tr>
              <td><strong>🤝 Solidaridad y Compañerismo</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-green">+5 o +10 CC</span></td>
              <td>Ayudar a un compañero con dudas, compartir materiales escolares, acoger a quien esté solo en recreos.</td>
            </tr>
            <tr>
              <td><strong>♻️ Cuidado del Medio Ambiente</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-green">+5 o +10 CC</span></td>
              <td>Mantener la sala impecable, recoger papeles en el patio, cuidar plantas, huerto escolar y cuidar el agua.</td>
            </tr>
            <tr>
              <td><strong>⏱️ Puntualidad y Asistencia</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-green">+5 o +10 CC</span></td>
              <td>Llegar a la hora a la sala tras el recreo, asistencia escolar constante y preparación oportuna de útiles.</td>
            </tr>
            <tr>
              <td><strong>⚽ Deporte y Recreo Entretenido</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-green">+5 o +10 CC</span></td>
              <td>Juego limpio, compartir la multicancha, acatar acuerdos deportivos y cuidar balones e implementos.</td>
            </tr>
            <tr>
              <td><strong>🎭 Arte, Cultura y Participación</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-green">+5 o +10 CC</span></td>
              <td>Entusiasmo en actos cívicos, bailes folclóricos, declamaciones, exposiciones y aniversarios de la escuela.</td>
            </tr>
            <tr>
              <td><strong>🎁 Reconocimiento Especial Docente</strong></td>
              <td style="text-align: center;"><span class="badge-pt badge-gold">Monto Libre</span></td>
              <td>Acciones excepcionales de honestidad (devolver objetos perdidos), valor civil o progreso individual notable.</td>
            </tr>
          </tbody>
        </table>

        <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 10px; padding: 10px 14px; margin-top: 10px; font-size: 0.82rem; color: #92400e; display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 1.5rem;">💡</div>
          <div>
            <strong>Clave Metodológica — El Refuerzo con Sentido:</strong> Para que el estímulo genere aprendizaje duradero, <strong>comunica verbalmente el motivo específico al alumno</strong>: <em>"Te felicito, hoy ganaste 10 CC por tu solidaridad al explicarle el ejercicio a tu compañero"</em>. El niño debe asociar el mérito a su esfuerzo personal y no al azar.
          </div>
        </div>
      </div>
    </div>

    <!-- ================= BLOQUE 4: QUITAR PUNTOS & TIENDA ================= -->
    <div class="grid-2">
      <!-- Columna Izquierda: Quitar Puntos -->
      <div>
        <div class="section-banner">
          <div class="step-circle">4</div>
          <div class="section-title">Quitar CC (Carácter Reparatorio)</div>
        </div>
        <div class="section-subtitle" style="margin-left: 52px;">
          Deducción reflexiva ante faltas reiteradas, evitando castigos punitivos.
        </div>

        <div class="card-white" style="height: calc(100% - 64px); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 0.82rem; color: #b91c1c; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span>⚠️</span> ¿Cuándo corresponde aplicar un descuento?
            </div>
            <ul style="font-size: 0.79rem; margin-left: 18px; color: #475569; line-height: 1.45;">
              <li>Falta reiterada al respeto o trato despectivo entre pares (-10 CC).</li>
              <li>Daño deliberado o descuido de mobiliario escolar (-10 CC).</li>
              <li>Incumplimiento de normas en furgones de transporte (-10 CC).</li>
              <li>Desorden persistente tras acuerdos de aula previos (-5 CC).</li>
            </ul>
          </div>

          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-left: 4px solid #0f2b48; border-radius: 8px; padding: 8px 12px; margin-top: 10px; font-size: 0.77rem; color: #1e293b; line-height: 1.4;">
            <strong>🛡️ Saldo Cero Protegido:</strong> El sistema nunca genera saldos negativos. Si un alumno tiene 5 CC y se descuentan 10 CC, queda protegido en <strong>0 CC</strong>.
            <div style="margin-top: 3px; color: #64748b; font-style: italic;">
              Dialoga y reflexiona antes de registrar; no descuentes en caliente.
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Tienda y Privilegios -->
      <div>
        <div class="section-banner">
          <div class="step-circle">5</div>
          <div class="section-title">Tienda Escolar y Recompensas</div>
        </div>
        <div class="section-subtitle" style="margin-left: 52px;">
          El incentivo que moviliza: privilegios simbólicos y estímulos tangibles.
        </div>

        <div class="card-white" style="height: calc(100% - 64px); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 0.82rem; color: #065f46; font-weight: 800; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span>👑</span> Privilegios Simbólicos (Los más valorados por los niños):
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.78rem;">
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 8px; border-radius: 6px; color: #166534;">
                <strong>Ayudante del Profesor:</strong> 15 CC
              </div>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 8px; border-radius: 6px; color: #166534;">
                <strong>Elegir Asiento (1 sem):</strong> 25 CC
              </div>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 8px; border-radius: 6px; color: #166534;">
                <strong>Capitán de Recreo:</strong> 20 CC
              </div>
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 8px; border-radius: 6px; color: #166534;">
                <strong>Tiempo Libre Lectura:</strong> 10 CC
              </div>
            </div>

            <div style="margin-top: 8px; font-size: 0.82rem; color: #1e40af; font-weight: 800;">
              🎁 Recompensas Físicas: Stickers Colegual (10 CC), Útiles especiales (20 CC) y Diplomas (30 CC).
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-top: 8px; font-size: 0.77rem; color: #475569;">
            <strong>Paso a Paso de Canje:</strong> El alumno consulta su saldo en el Kiosco ATM &bull; Solicita el premio al docente &bull; Se valida con clave personal y se entrega el incentivo.
          </div>
        </div>
      </div>
    </div>

    <!-- ================= BLOQUE 5: INCLUSIÓN Y FAMILIAS ================= -->
    <div class="grid-2">
      <!-- Columna Izquierda: Alerta de Invisibilizados -->
      <div>
        <div class="section-banner">
          <div class="step-circle">6</div>
          <div class="section-title">Alerta de Alumnos "Invisibilizados"</div>
        </div>
        <div class="section-subtitle" style="margin-left: 52px;">
          Herramienta pedagógica para garantizar una inclusión real en la sala.
        </div>

        <div class="card-white" style="border-left: 5px solid #f59e0b; background: #fffdf5;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="font-size: 1.8rem; line-height: 1;">🔔</div>
            <div>
              <strong style="color: #92400e; font-size: 0.88rem; display: block; margin-bottom: 4px;">
                ¿Qué detecta esta herramienta inteligente?
              </strong>
              <p style="font-size: 0.79rem; color: #78350f; line-height: 1.45;">
                Identifica a los estudiantes tímidos o silenciosos que <strong>llevan más de 7 o 14 días sin recibir ningún refuerzo positivo</strong>, a pesar de tener buena conducta y cumplir con sus deberes.
                <br><br>
                <em>El objetivo no es regalar puntos, sino recordar al equipo docente la importancia de observar y valorar los talentos discretos de cada niña y niño.</em>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Diplomas y Cartolas de Libreta -->
      <div>
        <div class="section-banner">
          <div class="step-circle">7</div>
          <div class="section-title">Diplomas y Alianza con el Hogar</div>
        </div>
        <div class="section-subtitle" style="margin-left: 52px;">
          Reconocimientos oficiales y comunicación de mérito para la familia.
        </div>

        <div class="card-white" style="border-left: 5px solid #2563eb; background: #f0f7ff;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="font-size: 1.8rem; line-height: 1;">🎓</div>
            <div>
              <strong style="color: #1e40af; font-size: 0.88rem; display: block; margin-bottom: 4px;">
                Diplomas Imprimibles y Cartola para la Libreta
              </strong>
              <p style="font-size: 0.79rem; color: #1e3a8a; line-height: 1.45;">
                &bull; <strong>Diplomas con Escudo Oficial:</strong> Genera reconocimientos personalizados para premiar en actos cívicos, bimestres o reuniones de apoderados.
                <br>
                &bull; <strong>Cartola Recortable para Libreta:</strong> Informe mensual con saldo, méritos detallados y <strong>talón de firma</strong> para que las familias celebren el esfuerzo de sus hijos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= BLOQUE 6: EL DECÁLOGO DOCENTE ================= -->
    <div>
      <div class="section-banner">
        <div class="step-circle">8</div>
        <div class="section-title">Decálogo Rápido del Docente Colegual</div>
      </div>
      <div class="section-subtitle">
        10 pautas de oro para construir una comunidad escolar cálida, respetuosa y protectora.
      </div>

      <div class="card-white" style="background: #f8fafc; border: 1.5px solid #cbd5e1;">
        <div class="grid-2" style="gap: 10px;">
          <div class="decalogo-item">
            <strong>1. ⚡ Refuerzo Oportuno:</strong> Reconoce la acción positiva en el momento; su huella formativa es inmediata.
          </div>
          <div class="decalogo-item">
            <strong>2. 🎯 Concreto y Específico:</strong> Explica con claridad qué actitud motivó las ColegualCoins entregadas.
          </div>
          <div class="decalogo-item">
            <strong>3. 🌱 Superación Personal:</strong> Premia el esfuerzo continuo y la perseverancia con el mismo valor que la excelencia.
          </div>
          <div class="decalogo-item">
            <strong>4. 🤝 Cohesión Grupal:</strong> Utiliza los bonos colectivos de curso para fomentar la ayuda mutua y el orden.
          </div>
          <div class="decalogo-item">
            <strong>5. 🌈 Equidad e Inclusión:</strong> Observa a los más silenciosos; asegúrate de que todos los niños sean visibilizados.
          </div>
          <div class="decalogo-item" style="border-left-color: #0f2b48;">
            <strong>6. 🕊️ Carácter Reparatorio:</strong> Si descuentas puntos, que sea reflexivo y formativo, nunca humillante.
          </div>
          <div class="decalogo-item" style="border-left-color: #0f2b48;">
            <strong>7. 🔐 Resguardo de Claves:</strong> Cuida tu contraseña; jamás delegues en estudiantes la administración de cuentas.
          </div>
          <div class="decalogo-item" style="border-left-color: #0f2b48;">
            <strong>8. 🏫 Comunidad Activa:</strong> Docentes y asistentes comparten la misma autoridad formativa para premiar.
          </div>
          <div class="decalogo-item" style="border-left-color: #0f2b48;">
            <strong>9. 🏡 Alianza con Familias:</strong> Comparte las cartolas de mérito como puente de orgullo y apoyo en el hogar.
          </div>
          <div class="decalogo-item" style="border-left-color: #0f2b48;">
            <strong>10. ☀️ Clima Escolar Feliz:</strong> El Banco Colegual es un juego formativo para construir una escuela alegre y segura.
          </div>
        </div>
      </div>
    </div>

    <!-- ================= PIE DE PÁGINA ================= -->
    <div class="footer-box">
      <div style="display: flex; align-items: center; gap: 16px;">
        <img src="${emblemBase64}" style="height: 52px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));" alt="Emblema">
        <div class="footer-left">
          <strong>Coordinación y Soporte de Convivencia Escolar</strong>
          <p>
            Janine Díaz Calixto &bull; Coordinación de la Vida Escolar<br>
            📧 <em>janine.diaz@slepllanquihue.cl</em> &bull; Escuela Rural Colegual (RBD 7967, Comuna de Llanquihue)
          </p>
        </div>
      </div>

      <div class="footer-credits">
        <p>🌟 Recurso pedagógico oficial desarrollado para la</p>
        <strong>Comunidad Educativa de la Escuela Rural Colegual</strong>
        <p style="color: #94a3b8; font-size: 0.75rem; margin-top: 2px;">Año Escolar 2026 &bull; Plataforma Banco ColegualCoins</p>
      </div>
    </div>

  </div>

</body>
</html>
`;

  const tempHtmlPath = path.join(ROOT_DIR, 'data/temp_infografia.html');
  fs.writeFileSync(tempHtmlPath, infographicHtml, 'utf-8');

  console.log('📸 Renderizando Imagen PNG de Alta Resolución (1280x2750 px)...');
  const profileDir = `/tmp/chrome-infografia-${Date.now()}`;
  const screenshotCmd = `"${CHROME_BIN}" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="${profileDir}" --crash-dumps-dir="/tmp" --window-size=1280,2750 --force-device-scale-factor=2 --screenshot="${OUTPUT_PNG}" "file://${tempHtmlPath}"`;
  execSync(screenshotCmd, { stdio: 'pipe' });

  console.log('🖨️ Compilando PDF Oficial de la Infografía para Imprimir...');
  // Generar PDF usando Chrome headless
  const pdfCmd = `"${CHROME_BIN}" --headless=new --disable-gpu --no-pdf-header-footer --user-data-dir="${profileDir}" --crash-dumps-dir="/tmp" --print-to-pdf="${OUTPUT_PDF}" "file://${tempHtmlPath}"`;
  execSync(pdfCmd, { stdio: 'pipe' });

  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch {}

  // Limpiar archivo temporal
  try {
    fs.unlinkSync(tempHtmlPath);
  } catch {}

  const pngStats = fs.statSync(OUTPUT_PNG);
  const pdfStats = fs.statSync(OUTPUT_PDF);
  const pngMb = (pngStats.size / (1024 * 1024)).toFixed(2);
  const pdfMb = (pdfStats.size / (1024 * 1024)).toFixed(2);

  console.log(`✅ [ÉXITO TOTAL] Infografía Docente generada con éxito:`);
  console.log(`   🖼️ PNG: ${OUTPUT_PNG} (${pngMb} MB, 2560x5500 px @ 2x)`);
  console.log(`   📑 PDF: ${OUTPUT_PDF} (${pdfMb} MB)`);
  console.log(`   🌐 Disponible en /public y /dist`);
}

main().catch(err => {
  console.error('❌ Error generando infografía docente:', err);
  process.exit(1);
});
