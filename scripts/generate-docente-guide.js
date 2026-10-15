import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const LOGO_PATH = path.join(ROOT_DIR, 'public/Logo Colegual_dark.png');
const EMBLEM_PATH = path.join(ROOT_DIR, 'public/emblema_colegual_circular.png');

const OUTPUT_PDF = path.join(ROOT_DIR, 'Guia_Docente_Banco_Colegual.pdf');
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function toBase64(filePath, mime = 'image/png') {
  if (!fs.existsSync(filePath)) return '';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

async function generateGuide() {
  console.log('📘 Generando Guía de Uso para Docentes (Banco Colegual)...');

  const logoBase64 = toBase64(LOGO_PATH);
  const emblemBase64 = toBase64(EMBLEM_PATH);

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Guía de Uso para Docentes y Funcionarios - Banco Colegual</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.42;
      font-size: 9pt;
    }

    .page {
      page-break-after: always;
      clear: both;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Encabezados y pies de página */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #0f2b48;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }

    .header-table td {
      vertical-align: middle;
      border: none;
      padding: 0;
    }

    .inst-tag {
      font-size: 7.5pt;
      font-weight: 800;
      color: #0f2b48;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .doc-tag {
      font-size: 7.8pt;
      color: #64748b;
      font-weight: 600;
      text-align: right;
    }

    .footer-table {
      width: 100%;
      border-collapse: collapse;
      border-top: 1px solid #e2e8f0;
      margin-top: 14px;
      padding-top: 5px;
      font-size: 7.5pt;
      color: #64748b;
    }

    .footer-table td {
      border: none;
      padding: 4px 0 0 0;
    }

    .footer-table .left {
      font-weight: 600;
      color: #0f2b48;
    }

    .footer-table .right {
      text-align: right;
      font-weight: 700;
      color: #059669;
    }

    /* Títulos de sección */
    h1, h2, h3, h4 {
      font-weight: 800;
      color: #0f2b48;
    }

    .section-title {
      font-size: 13pt;
      color: #0f2b48;
      border-left: 4px solid #059669;
      padding-left: 8px;
      margin-bottom: 3px;
      margin-top: 8px;
    }

    .section-subtitle {
      font-size: 8.2pt;
      color: #64748b;
      margin-bottom: 10px;
    }

    /* Tablas de diagramación */
    .layout-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px 0;
      margin: 8px -10px;
    }

    .layout-table td {
      vertical-align: top;
      border: none;
      padding: 0;
    }

    /* Cajas y tarjetas */
    .card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      padding: 9px 11px;
      margin-bottom: 9px;
    }

    .card-accent {
      background: #f8fafc;
      border-left: 3.5px solid #059669;
      border-color: #cbd5e1;
    }

    .card-gold {
      background: #fffbeb;
      border-left: 3.5px solid #d97706;
      border-color: #fde68a;
    }

    .card-blue {
      background: #f0f7ff;
      border-left: 3.5px solid #2563eb;
      border-color: #bfdbfe;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.2pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-gold { background: #fef3c7; color: #b45309; }
    .badge-red { background: #fee2e2; color: #b91c1c; }

    /* Tablas de datos */
    .table-data {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.2pt;
      margin: 6px 0 10px 0;
    }

    .table-data th {
      background: #0f2b48;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      font-size: 7.8pt;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .table-data td {
      padding: 5px 8px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .table-data tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Portada */
    .cover-box {
      border: 2px solid #cbd5e1;
      border-radius: 10px;
      padding: 16px 14px;
      background: #ffffff;
      text-align: center;
    }

    .cover-header {
      font-size: 8.2pt;
      font-weight: 800;
      color: #0f2b48;
      letter-spacing: 0.06em;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .cover-title {
      font-size: 21pt;
      color: #0f2b48;
      font-weight: 900;
      line-height: 1.15;
      margin: 14px 0 6px 0;
    }

    .cover-title span {
      display: block;
      color: #059669;
      font-size: 17pt;
      margin-top: 4px;
    }

    .cover-meta-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 8.2pt;
      margin-top: 18px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .cover-meta-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #e2e8f0;
    }

    .cover-meta-table td.lbl {
      font-weight: 700;
      color: #0f2b48;
      width: 170px;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1: PORTADA ==================== -->
  <div class="page">
    <div class="cover-box">
      <div class="cover-header">
        ESCUELA RURAL COLEGUAL
      </div>

      <div style="margin: 18px 0 12px 0;">
        <img src="${logoBase64}" style="height: 82px; max-width: 290px; object-fit: contain;" alt="Logo Escuela Rural Colegual" />
      </div>

      <h1 class="cover-title">
        GUÍA PRÁCTICA PARA DOCENTES
        <span>Sistema Escolar de Refuerzo Positivo "Banco Colegual"</span>
      </h1>

      <p style="font-size: 9.8pt; color: #475569; max-width: 530px; margin: 10px auto; line-height: 1.45;">
        Manual de inducción pedagógica, pautas formativas y uso operativo de la plataforma web de <strong>ColegualCoins (CC)</strong> para docentes y asistentes de la educación.
      </p>

      <div style="margin: 14px 0;">
        <span class="badge badge-green" style="font-size: 8pt; padding: 4px 9px;">🪙 Refuerzo Positivo</span>
        <span class="badge badge-blue" style="font-size: 8pt; padding: 4px 9px;">📱 Acceso Celular y PC</span>
        <span class="badge badge-gold" style="font-size: 8pt; padding: 4px 9px;">⭐ Convivencia Escolar</span>
        <span class="badge badge-green" style="font-size: 8pt; padding: 4px 9px;">🎓 Pre-Kínder a 6° Básico</span>
      </div>

      <table class="cover-meta-table">
        <tr>
          <td class="lbl">🏫 Establecimiento:</td>
          <td><strong>Escuela Rural Colegual</strong> (Comuna de Llanquihue)</td>
        </tr>
        <tr>
          <td class="lbl">🌟 Coordinación & Autoría:</td>
          <td><strong>Janine Díaz Calixto</strong> — Coordinación de la Vida Escolar</td>
        </tr>
        <tr>
          <td class="lbl">👥 Destinatarios:</td>
          <td>Docentes de Aula, Educadoras de Párvulo y Diferenciales, Asistentes de la Educación, Inspectores y Equipo Directivo.</td>
        </tr>
        <tr>
          <td class="lbl">💡 Moneda Institucional:</td>
          <td><strong>ColegualCoins (CC)</strong> — Cada estudiante inicia con <strong>10 CC de apertura</strong> en su libreta escolar.</td>
        </tr>
        <tr>
          <td class="lbl">📅 Año de Aplicación:</td>
          <td>Año Escolar 2026 — Edición Oficial para el Equipo Docente</td>
        </tr>
      </table>

      <div style="margin-top: 25px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: left; font-size: 8pt; color: #166534; line-height: 1.45;">
        <strong>Propósito Formativo del Proyecto:</strong><br>
        El Banco Colegual es una herramienta formativa de convivencia escolar basada en la psicología del refuerzo positivo y la economía de fichas adaptada al contexto rural. Su objetivo es visibilizar, celebrar y modelar las conductas prosociales, la perseverancia académica, el cuidado del entorno y el respeto mutuo, involucrando activamente a las familias.
      </div>

      <div style="margin-top: 25px; font-size: 7.5pt; color: #64748b; font-style: italic;">
        "Reconocer a tiempo el esfuerzo y las buenas acciones de un niño transforma positivamente su historia escolar."
      </div>
    </div>

    <table class="footer-table">
      <tr>
        <td class="left">Escuela Rural Colegual &bull; Guía de Uso Docente</td>
        <td class="right">Página 1 de 6</td>
      </tr>
    </table>
  </div>

  <!-- ==================== PÁGINA 2: ACCESO Y FUNCIONARIOS ==================== -->
  <div class="page">
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <img src="${logoBase64}" style="height: 24px; vertical-align: middle; margin-right: 8px;" alt="Logo" />
          <span class="inst-tag">Escuela Rural Colegual</span>
        </td>
        <td style="width: 50%;" class="doc-tag">Módulo 1: Acceso, Perfiles y Seguridad</td>
      </tr>
    </table>

    <h2 class="section-title">1. ¿Cómo Ingresar a la Plataforma?</h2>
    <p class="section-subtitle">El sistema está optimizado para funcionar en cualquier pantalla con sincronización permanente en la nube.</p>

    <table class="layout-table">
      <tr>
        <td style="width: 50%;">
          <div class="card card-accent" style="min-height: 105px; padding: 11px 13px;">
            <div style="font-size: 1.5rem; margin-bottom: 2px;">🌐</div>
            <strong style="font-size: 9pt; color: #065f46;">1. Web Oficial en la Nube</strong>
            <p style="font-size: 8pt; color: #475569; margin-top: 4px; line-height: 1.4;">
              Ingresa desde cualquier computador o notebook en tu navegador a:<br>
              <code style="font-size: 8pt; background:#e2e8f0; color:#0f2b48; padding:2px 6px; border-radius:4px; font-weight:700;">banco-colegual.onrender.com</code>
            </p>
            <p style="font-size: 7.5pt; color: #64748b; margin-top: 4px;">
              Acceso universal permanente con sincronización inmediata en la nube.
            </p>
          </div>
        </td>
        <td style="width: 50%;">
          <div class="card card-gold" style="min-height: 105px; padding: 11px 13px;">
            <div style="font-size: 1.5rem; margin-bottom: 2px;">📱</div>
            <strong style="font-size: 9pt; color: #b45309;">2. Teléfono Celular (App Móvil)</strong>
            <p style="font-size: 8pt; color: #475569; margin-top: 4px; line-height: 1.4;">
              Abre el enlace en tu teléfono y toca <em>"Agregar a pantalla de inicio"</em> para instalar la App directa con ícono institucional.
            </p>
            <p style="font-size: 7.5pt; color: #78350f; margin-top: 4px;">
              Ideal para docentes y asistentes en patios, pasillos, recreos y salidas a terreno.
            </p>
          </div>
        </td>
      </tr>
    </table>

    <h2 class="section-title">2. Activación de Funcionario Responsable</h2>
    <p class="section-subtitle">Cada docente o asistente de la educación debe activar su sesión para firmar sus asignaciones de puntos.</p>

    <table class="layout-table">
      <tr>
        <td style="width: 50%;">
          <div class="card" style="border-left: 3.5px solid #0f2b48;">
            <h4 style="font-size: 8.5pt; margin-bottom: 3px;">Paso 1: Selecciona tu Nombre</h4>
            <p style="font-size: 7.8pt; color: #475569;">
              En el encabezado superior, haz clic en el botón <strong>"👤 Funcionario Responsable"</strong> y selecciona tu nombre de la nómina escolar oficial.
            </p>
          </div>
        </td>
        <td style="width: 50%;">
          <div class="card" style="border-left: 3.5px solid #059669;">
            <h4 style="font-size: 8.5pt; margin-bottom: 3px;">Paso 2: Ingresa tu Contraseña</h4>
            <p style="font-size: 7.8pt; color: #475569;">
              Escribe tu clave personal: tu <strong>primer nombre + 7967</strong> (ej: <code>Janine7967</code>, <code>Bonny7967</code>, <code>Karla7967</code>, etc.), tu RUT o el PIN maestro <code>7967</code>.
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="width: 50%;">
          <div class="card" style="border-left: 3.5px solid #2563eb;">
            <h4 style="font-size: 8.5pt; margin-bottom: 3px;">Paso 3: Verificación Visual</h4>
            <p style="font-size: 7.8pt; color: #475569;">
              El indicador superior cambiará a <span style="color:#16a34a; font-weight:700;">🟢 Activo</span> con tu nombre. Todas tus asignaciones quedarán registradas a tu cargo.
            </p>
          </div>
        </td>
        <td style="width: 50%;">
          <div class="card" style="border-left: 3.5px solid #d97706;">
            <h4 style="font-size: 8.5pt; margin-bottom: 3px;">Paso 4: Cambio de Turno</h4>
            <p style="font-size: 7.8pt; color: #475569;">
              Si compartes un computador o tablet en sala de profesores, haz clic en <em>"(Cambiar)"</em> para que el siguiente colega active su propio perfil.
            </p>
          </div>
        </td>
      </tr>
    </table>

    <div class="card card-accent" style="margin-top: 4px;">
      <h4 style="color: #065f46; font-size: 8.5pt; margin-bottom: 3px;">🔒 Protección de Datos y Privacidad de los Estudiantes:</h4>
      <p style="font-size: 7.8pt; color: #047857; line-height: 1.4;">
        Por normativa de protección a la infancia y seguridad digital escolar, <strong>los números de RUT de los alumnos se encuentran estrictamente ocultos</strong> en todas las pantallas de consulta, kioscos y carnets. Cada niño cuenta con un <strong>N° de Cuenta Escolar Oficial</strong> (ej: <code>7967-1B-4521-0001</code>) para toda interacción bancaria.
      </p>
    </div>

    <div class="card" style="margin-top: 6px; background:#f8fafc;">
      <h4 style="font-size: 8.5pt; color: #0f2b48; margin-bottom: 4px;">💡 ¿Por qué es importante activar tu perfil?</h4>
      <p style="font-size: 7.8pt; color: #334155; line-height: 1.4;">
        &bull; <strong>Transparencia con el hogar:</strong> En la cartola mensual, las familias podrán leer con orgullo: <em>"Felicitado por Profesora Nicole Andrea por excelente compañerismo"</em>.<br>
        &bull; <strong>Reconocimiento institucional:</strong> Permite visibilizar la labor pedagógica de todos los estamentos (docentes de aula, educadoras PIE, asistentes y equipo de patio).<br>
        &bull; <strong>Seguridad:</strong> Impide que estudiantes manipulen saldos o canjeen premios sin supervisión docente.
      </p>
    </div>

    <table class="footer-table">
      <tr>
        <td class="left">Escuela Rural Colegual &bull; Guía de Uso Docente</td>
        <td class="right">Página 2 de 6</td>
      </tr>
    </table>
  </div>

  <!-- ==================== PÁGINA 3: ASIGNACIÓN DE PUNTOS ==================== -->
  <div class="page">
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <img src="${logoBase64}" style="height: 24px; vertical-align: middle; margin-right: 8px;" alt="Logo" />
          <span class="inst-tag">Escuela Rural Colegual</span>
        </td>
        <td style="width: 50%;" class="doc-tag">Módulo 2: Cómo Asignar ColegualCoins (Refuerzo Positivo)</td>
      </tr>
    </table>

    <h2 class="section-title">3. Las 3 Formas de Entregar Puntos</h2>
    <p class="section-subtitle">Elige la modalidad más cómoda según el espacio y la situación pedagógica.</p>

    <table class="layout-table">
      <tr>
        <td style="width: 33.3%;">
          <div class="card card-accent" style="min-height: 105px;">
            <strong style="color: #065f46; font-size: 8.3pt;">👤 1. Alumno Individual</strong>
            <p style="font-size: 7.6pt; color: #475569; margin-top: 3px;">
              Filtra por curso o escribe su nombre. Presiona <strong>"➕ Abonar CC"</strong> en la tarjeta del estudiante. Elige la conducta y confirma.
            </p>
          </div>
        </td>
        <td style="width: 33.3%;">
          <div class="card card-blue" style="min-height: 105px;">
            <strong style="color: #1e40af; font-size: 8.3pt;">👥 2. Bono a Todo el Curso</strong>
            <p style="font-size: 7.6pt; color: #475569; margin-top: 3px;">
              Para premiar el esfuerzo colectivo, orden de sala o trabajo en equipo. Haz clic en <strong>"🎁 Bono a Curso"</strong>; todos los niños recibirán sus puntos al mismo tiempo.
            </p>
          </div>
        </td>
        <td style="width: 33.3%;">
          <div class="card card-gold" style="min-height: 105px;">
            <strong style="color: #b45309; font-size: 8.3pt;">📷 3. Escáner QR (Cámara)</strong>
            <p style="font-size: 7.6pt; color: #475569; margin-top: 3px;">
              Abre el lector en tu celular y enfoca la tarjeta del alumno. En 1 segundo se abre su ficha personal para registrar los puntos en el patio o pasillo.
            </p>
          </div>
        </td>
      </tr>
    </table>

    <h2 class="section-title">4. Categorías Oficiales y Conductas Observables</h2>
    <p class="section-subtitle">Tabla orientadora para estandarizar los criterios de refuerzo entre todos los funcionarios.</p>

    <table class="table-data">
      <thead>
        <tr>
          <th style="width: 30%;">Categoría Formativa</th>
          <th style="width: 15%;">Monto Sugerido</th>
          <th style="width: 55%;">Conductas Observables en Aula y Patio</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>🌟 Buena Convivencia y Respeto</strong></td>
          <td><span class="badge badge-green">+5 o +10 CC</span></td>
          <td>Trato cordial, saludar amablemente, resolver diferencias dialogando, respetar turnos.</td>
        </tr>
        <tr>
          <td><strong>📚 Esfuerzo Académico y Tareas</strong></td>
          <td><span class="badge badge-green">+5 o +10 CC</span></td>
          <td>Superación personal, perseverancia, traer cuadernos al día, participación constructiva.</td>
        </tr>
        <tr>
          <td><strong>🤝 Solidaridad y Compañerismo</strong></td>
          <td><span class="badge badge-green">+5 o +10 CC</span></td>
          <td>Ayudar a un compañero con dudas, compartir materiales, acoger a quien esté solo.</td>
        </tr>
        <tr>
          <td><strong>♻️ Cuidado del Medio Ambiente</strong></td>
          <td><span class="badge badge-green">+5 o +10 CC</span></td>
          <td>Mantener la sala limpia, recoger papeles en el patio, cuidar plantas, huerto y agua.</td>
        </tr>
        <tr>
          <td><strong>⏱️ Puntualidad y Asistencia</strong></td>
          <td><span class="badge badge-green">+5 o +10 CC</span></td>
          <td>Llegar a la hora después del recreo, asistencia continua y preparación a tiempo.</td>
        </tr>
        <tr>
          <td><strong>⚽ Deporte y Recreo Entretenido</strong></td>
          <td><span class="badge badge-green">+5 o +10 CC</span></td>
          <td>Juego limpio, compartir la cancha deportiva, cuidar balones y juegos de mesa.</td>
        </tr>
        <tr>
          <td><strong>🎭 Arte, Cultura y Participación</strong></td>
          <td><span class="badge badge-green">+5 o +10 CC</span></td>
          <td>Participar con entusiasmo en actos, exposiciones, bailes folclóricos y aniversarios.</td>
        </tr>
        <tr>
          <td><strong>🎁 Reconocimiento Especial Docente</strong></td>
          <td><span class="badge badge-gold">Monto Libre</span></td>
          <td>Acciones excepcionales de valor civil o progreso individual con motivo redactado.</td>
        </tr>
      </tbody>
    </table>

    <div class="card card-accent" style="margin-top: 6px;">
      <h4 style="color: #065f46; font-size: 8.5pt; margin-bottom: 2px;">💬 Clave Metodológica: El Refuerzo con Sentido</h4>
      <p style="font-size: 7.8pt; color: #047857; line-height: 1.4;">
        Para que el estímulo tenga verdadero valor pedagógico, <strong>comunica verbalmente el motivo al estudiante</strong>: <em>"Te felicito, hoy ganaste 10 CC por tu gran solidaridad al explicarle el ejercicio a tu compañero"</em>. El niño debe asociar el mérito a su esfuerzo personal y no al azar.
      </p>
    </div>

    <table class="footer-table">
      <tr>
        <td class="left">Escuela Rural Colegual &bull; Guía de Uso Docente</td>
        <td class="right">Página 3 de 6</td>
      </tr>
    </table>
  </div>

  <!-- ==================== PÁGINA 4: DESCUENTO Y TIENDA ==================== -->
  <div class="page">
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <img src="${logoBase64}" style="height: 24px; vertical-align: middle; margin-right: 8px;" alt="Logo" />
          <span class="inst-tag">Escuela Rural Colegual</span>
        </td>
        <td style="width: 50%;" class="doc-tag">Módulo 3: Descuento Formativo y Tienda Escolar</td>
      </tr>
    </table>

    <h2 class="section-title">5. La Opción de Quitar CC (Carácter Reparatorio)</h2>
    <p class="section-subtitle">Cómo aplicar deducciones con criterio pedagógico, evitando el castigo punitivo desmedido.</p>

    <table class="layout-table">
      <tr>
        <td style="width: 50%;">
          <div class="card card-gold" style="min-height: 120px;">
            <h4 style="color: #92400e; font-size: 8.5pt; margin-bottom: 4px;">⚠️ ¿Cuándo aplicar un descuento?</h4>
            <p style="font-size: 7.8pt; color: #78350f; line-height: 1.38;">
              El descuento formativo es una <strong>consecuencia reparatoria</strong> ante faltas reiteradas o daños a la convivencia y entorno:
            </p>
            <ul style="font-size: 7.5pt; margin-left: 14px; margin-top: 3px; color: #78350f; line-height: 1.35;">
              <li>Faltas reiteradas al respeto entre compañeros (-10 CC).</li>
              <li>Daño deliberado o descuido de mobiliario escolar (-10 CC).</li>
              <li>Incumplimiento de normas de transporte escolar (-10 CC).</li>
              <li>Desorden persistente tras acuerdos de aula previos (-5 CC).</li>
            </ul>
          </div>
        </td>
        <td style="width: 50%;">
          <div class="card card-blue" style="min-height: 120px;">
            <h4 style="color: #1e40af; font-size: 8.5pt; margin-bottom: 4px;">🛡️ Principios Institucionales de Protección</h4>
            <ul style="font-size: 7.6pt; margin-left: 14px; color: #1e3a8a; line-height: 1.4;">
              <li><strong>Protección en Saldo Cero (0 CC):</strong> El sistema nunca permite saldos negativos. Si un alumno tiene 5 CC y se descuentan 10 CC, su saldo queda en 0 CC, evitando frustración insalvable.</li>
              <li><strong>Diálogo y Reflexión Previa:</strong> No descuentes en caliente; conversa con el alumno sobre cómo reparar la falta.</li>
              <li><strong>Transparencia:</strong> El descuento queda registrado con fecha, motivo y tu nombre en la cartola oficial.</li>
            </ul>
          </div>
        </td>
      </tr>
    </table>

    <h2 class="section-title">6. La Tienda Escolar y Canje de Recompensas</h2>
    <p class="section-subtitle">El incentivo que moviliza el esfuerzo: privilegios simbólicos y estímulos tangibles.</p>

    <table class="layout-table">
      <tr>
        <td style="width: 48%;">
          <div class="card card-accent" style="min-height: 145px;">
            <h4 style="color: #065f46; font-size: 8.5pt; margin-bottom: 4px;">👑 Privilegios y Recompensas Simbólicas:</h4>
            <p style="font-size: 7.7pt; color: #047857; line-height: 1.38;">
              Son las más valoradas por los estudiantes y refuerzan su autonomía:<br>
              &bull; <strong>Ayudante del Profesor (15 CC):</strong> Ser colaborador oficial del docente durante una jornada completa.<br>
              &bull; <strong>Elección de Asiento (25 CC):</strong> Escoger puesto preferido en la sala durante una semana.<br>
              &bull; <strong>Capitán de Recreo (20 CC):</strong> Escoger el juego colectivo en el recreo entretenido.<br>
              &bull; <strong>Tiempo Libre de Lectura (10 CC):</strong> 15 minutos en el rincón de biblioteca escolar.
            </p>
          </div>
        </td>
        <td style="width: 52%;">
          <div class="card card-blue" style="min-height: 145px;">
            <h4 style="color: #1e40af; font-size: 8.5pt; margin-bottom: 4px;">🎁 Recompensas Tangibles y Reconocimientos:</h4>
            <p style="font-size: 7.7pt; color: #1e3a8a; line-height: 1.38;">
              Estímulos materiales gestionados por el colegio:<br>
              &bull; <strong>Stickers Conmemorativos Colegual (10 CC):</strong> Emblemas coleccionables para su cuaderno o estuche.<br>
              &bull; <strong>Útiles Escolares Especiales (20 CC):</strong> Lápices decorativos, destacadores o gomas con figuras.<br>
              &bull; <strong>Diploma de Mérito y Honor (30 CC):</strong> Reconocimiento oficial entregado en formación escolar frente a la comunidad educativa.
            </p>
          </div>
        </td>
      </tr>
    </table>

    <div class="card" style="background:#f8fafc; border-left: 3.5px solid #0f2b48;">
      <h4 style="font-size: 8.5pt; color: #0f2b48; margin-bottom: 3px;">Paso a Paso para Ejecutar un Canje Seguro:</h4>
      <p style="font-size: 7.8pt; color: #334155; line-height: 1.4;">
        1. El estudiante revisa su saldo y solicita canjear una recompensa disponible en el catálogo.<br>
        2. El docente ingresa a la pestaña <strong>"Tienda"</strong>, selecciona el artículo y busca al estudiante.<br>
        3. El sistema solicitará la <strong>contraseña de funcionario</strong> para autorizar la deducción de puntos.<br>
        4. El saldo se descuenta automáticamente y se entrega el beneficio o material al estudiante.
      </p>
    </div>

    <table class="footer-table">
      <tr>
        <td class="left">Escuela Rural Colegual &bull; Guía de Uso Docente</td>
        <td class="right">Página 4 de 6</td>
      </tr>
    </table>
  </div>

  <!-- ==================== PÁGINA 5: HERRAMIENTAS DOCENTES ==================== -->
  <div class="page">
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <img src="${logoBase64}" style="height: 24px; vertical-align: middle; margin-right: 8px;" alt="Logo" />
          <span class="inst-tag">Escuela Rural Colegual</span>
        </td>
        <td style="width: 50%;" class="doc-tag">Módulo 4: Inclusión, Familia y Reconocimiento</td>
      </tr>
    </table>

    <h2 class="section-title">7. Alerta de Alumnos "Invisibilizados" (Inclusión Real)</h2>
    <p class="section-subtitle">Una herramienta pedagógica diseñada para asegurar que ningún niño pase desapercibido en la escuela.</p>

    <div class="card card-gold">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 45px; vertical-align: top; border:none;">
            <div style="font-size: 2rem;">🔔</div>
          </td>
          <td style="vertical-align: top; border:none;">
            <h4 style="color:#b45309; font-size: 8.8pt; margin-bottom: 2px;">¿Qué detecta esta herramienta inteligente?</h4>
            <p style="font-size: 7.9pt; color:#78350f; line-height: 1.4;">
              En toda comunidad escolar existen alumnos muy participativos que captan la atención rápidamente, mientras otros estudiantes tímidos o silenciosos rara vez reciben felicitaciones, aunque tengan excelente conducta y cumplan con todo.
              <br><br>
              El sistema analiza automáticamente las cuentas y <strong>alerta al profesor jefe sobre aquellos estudiantes que llevan más de 7 o 14 días sin recibir ningún refuerzo positivo</strong>. El objetivo no es regalar puntos, sino recordar al equipo docente la importancia de observar y valorar los talentos discretos de cada niño.
            </p>
          </td>
        </tr>
      </table>
    </div>

    <h2 class="section-title">8. Generador de Diplomas Imprimibles</h2>
    <p class="section-subtitle">Reconocimientos físicos oficiales con el escudo de la Escuela Rural Colegual.</p>

    <table class="layout-table">
      <tr>
        <td style="width: 50%;">
          <div class="card card-blue" style="min-height: 100px;">
            <strong style="color: #1e40af; font-size: 8.3pt;">📜 ¿Cómo emitir un Diploma?</strong>
            <ol style="font-size: 7.7pt; margin-left: 14px; margin-top: 3px; color: #1e3a8a; line-height: 1.38;">
              <li>En la lista de alumnos, haz clic en el botón <strong>"🎓 Generar Diploma"</strong>.</li>
              <li>Selecciona el mérito: <em>"Mejor Compañero", "Superación Personal", "Espíritu Colegual"</em>, etc.</li>
              <li>Se descargará un PDF listo para imprimir en hoja de diploma o cartulina con fecha y firma.</li>
            </ol>
          </div>
        </td>
        <td style="width: 50%;">
          <div class="card card-accent" style="min-height: 100px;">
            <strong style="color: #065f46; font-size: 8.3pt;">🎉 Momentos sugeridos de entrega:</strong>
            <ul style="font-size: 7.7pt; margin-left: 14px; margin-top: 3px; color: #047857; line-height: 1.38;">
              <li>Actos cívicos de los lunes frente a la escuela.</li>
              <li>Cierres de proyectos pedagógicos o bimestres.</li>
              <li>En reuniones de apoderados (sorprender positivamente a la familia).</li>
              <li>Reconocimiento espontáneo en la sala frente a sus pares.</li>
            </ul>
          </div>
        </td>
      </tr>
    </table>

    <h2 class="section-title">9. Cartola Mensual para la Libreta de Comunicaciones</h2>
    <p class="section-subtitle">El puente de comunicación y orgullo entre la escuela y el hogar.</p>

    <div class="card" style="border: 1.5px dashed #059669; background: #f0fdf4;">
      <h4 style="color:#065f46; font-size: 9pt; margin-bottom: 3px;">📋 Reporte Formativo Recortable para Apoderados:</h4>
      <p style="font-size: 7.9pt; color:#064e3b; line-height: 1.4;">
        A fin de mes, el profesor jefe puede presionar <strong>"🖨️ Cartola para Libreta"</strong>. Se genera un informe personalizado con el tamaño exacto de la libreta de comunicaciones que contiene:
      </p>
      <table class="layout-table" style="margin-top: 5px;">
        <tr>
          <td style="width: 33.3%;">
            <div style="background:#ffffff; border:1px solid #bbf7d0; border-radius:6px; padding:6px; font-size:7.5pt; color:#166534;">
              <strong>💰 Balance de Cuenta:</strong> Saldo actual, puntos ganados y canjes realizados en el periodo.
            </div>
          </td>
          <td style="width: 33.3%;">
            <div style="background:#ffffff; border:1px solid #bbf7d0; border-radius:6px; padding:6px; font-size:7.5pt; color:#166534;">
              <strong>🌟 Méritos Destacados:</strong> Detalle de las conductas positivas reconocidas por los profesores.
            </div>
          </td>
          <td style="width: 33.3%;">
            <div style="background:#ffffff; border:1px solid #bbf7d0; border-radius:6px; padding:6px; font-size:7.5pt; color:#166534;">
              <strong>✍️ Talón de Firma:</strong> Espacio para que el apoderado firme felicitando el compromiso de su hijo.
            </div>
          </td>
        </tr>
      </table>
    </div>

    <table class="footer-table">
      <tr>
        <td class="left">Escuela Rural Colegual &bull; Guía de Uso Docente</td>
        <td class="right">Página 5 de 6</td>
      </tr>
    </table>
  </div>

  <!-- ==================== PÁGINA 6: DECÁLOGO Y COORDINACIÓN ==================== -->
  <div class="page">
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <img src="${logoBase64}" style="height: 24px; vertical-align: middle; margin-right: 8px;" alt="Logo" />
          <span class="inst-tag">Escuela Rural Colegual</span>
        </td>
        <td style="width: 50%;" class="doc-tag">Módulo 5: Decálogo Docente y Red de Acompañamiento</td>
      </tr>
    </table>

    <h2 class="section-title">10. Decálogo del Docente Banco Colegual</h2>
    <p class="section-subtitle">Diez pautas formativas esenciales para potenciar el refuerzo positivo en nuestros estudiantes.</p>

    <table class="layout-table" style="font-size: 8.1pt; color: #334155; line-height: 1.45; margin-bottom: 12px;">
      <tr>
        <td style="width: 50%;">
          <div class="card" style="border-left: 3.5px solid #059669; padding: 11px 13px;">
            <p><strong>1. ⚡ Refuerzo Oportuno:</strong> Reconoce la buena acción en el momento preciso; el impacto emocional formativo es inmediato y duradero.</p>
            <p style="margin-top: 8px;"><strong>2. 🎯 Sé Concreto y Específico:</strong> Explica con claridad qué actitud o conducta meritoria motivó las ColegualCoins otorgadas.</p>
            <p style="margin-top: 8px;"><strong>3. 🌱 Premia la Superación Personal:</strong> Valora el esfuerzo continuo, la perseverancia y el progreso individual con el mismo entusiasmo que la excelencia.</p>
            <p style="margin-top: 8px;"><strong>4. 🤝 Cohesión Grupal y Bonos de Curso:</strong> Utiliza los reconocimientos colectivos para premiar la colaboración, el cuidado de la sala y el compañerismo.</p>
            <p style="margin-top: 8px;"><strong>5. 🌈 Equidad y Foco Inclusivo:</strong> Asegúrate de que todos los niños del curso reciban reconocimientos periódicos, visibilizando sus talentos particulares.</p>
          </div>
        </td>
        <td style="width: 50%;">
          <div class="card" style="border-left: 3.5px solid #0f2b48; padding: 11px 13px;">
            <p><strong>6. 🕊️ Carácter Reparatorio y Reflexivo:</strong> Si excepcionalmente descuentas puntos, que sea una instancia reflexiva y formativa, nunca punitiva ni humillante.</p>
            <p style="margin-top: 8px;"><strong>7. 🔐 Resguardo de Contraseñas:</strong> Protege tu clave personal de funcionario; jamás delegues en estudiantes la administración de cuentas escolares.</p>
            <p style="margin-top: 8px;"><strong>8. 🏫 Comunidad Educativa Activa:</strong> Docentes y asistentes comparten la misma facultad formativa para felicitar tanto en el aula como en los recreos y patios.</p>
            <p style="margin-top: 8px;"><strong>9. 🏡 Alianza con las Familias:</strong> Comparte las cartolas de mérito en las reuniones de apoderados como puente de orgullo y motivación en el hogar.</p>
            <p style="margin-top: 8px;"><strong>10. ☀️ Clima Escolar Cálido y Feliz:</strong> El Banco Colegual es un juego formativo para construir una escuela rural protectora, acogedora y alegre.</p>
          </div>
        </td>
      </tr>
    </table>

    <div class="card card-accent" style="padding: 12px 16px; margin-bottom: 14px; background: #f0fdf4; border-color: #86efac;">
      <h3 style="color: #065f46; font-size: 9.2pt; margin-bottom: 4px;">🌿 Compromiso de Nuestra Comunidad Educativa</h3>
      <p style="font-size: 8.1pt; color: #166534; line-height: 1.48;">
        Cada ColegualCoin otorgada representa una palabra de aliento, una oportunidad pedagógica y una señal clara de que en la <strong>Escuela Rural Colegual</strong> cada niña y niño es valorado, escuchado y estimulado a ser su mejor versión cada día.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #0f2b48 0%, #1e3a8a 100%); color: #ffffff; padding: 14px 18px; border-radius: 8px; margin-top: 6px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle; border: none;">
            <strong style="color: #38bdf8; font-size: 10pt; letter-spacing: 0.02em;">Coordinación y Soporte de Convivencia Escolar</strong>
            <p style="font-size: 8.2pt; color: #e2e8f0; line-height: 1.45; margin-top: 4px;">
              Para dudas pedagógicas, inducción a nuevos funcionarios o reimpresión de carnets institucionales:<br>
              <strong>Janine Díaz Calixto</strong> — Coordinación de la Vida Escolar<br>
              📧 <em>janine.diaz@slepllanquihue.cl</em> &bull; 🏫 Escuela Rural Colegual (RBD 7967, Comuna de Llanquihue)
            </p>
          </td>
          <td style="width: 65px; text-align: center; vertical-align: middle; border: none;">
            <img src="${emblemBase64}" style="height: 52px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" alt="Emblema Colegual">
          </td>
        </tr>
      </table>
    </div>

    <table class="footer-table">
      <tr>
        <td class="left">Escuela Rural Colegual &bull; Guía de Uso Docente</td>
        <td class="right">Página 6 de 6</td>
      </tr>
    </table>
  </div>

</body>
</html>
`;

  // Dividir en 2 bloques (Páginas 1-4 y Páginas 5-6) para garantizar un renderizado óptimo en Chromium sin límites de IPC
  const headMatch = htmlContent.match(/<head>[\s\S]*?<\/head>/i)[0];
  const pageSplit = htmlContent.split('<!-- ==================== PÁGINA 5:');
  const part1Html = pageSplit[0] + '</body></html>';
  const part2Html = `<!DOCTYPE html><html lang="es">${headMatch}<body><!-- ==================== PÁGINA 5:${pageSplit[1]}`;

  const tempHtmlPath1 = path.join(ROOT_DIR, 'data/temp_guia_docente_part1.html');
  const tempHtmlPath2 = path.join(ROOT_DIR, 'data/temp_guia_docente_part2.html');
  const tempPdf1 = '/tmp/guia_docente_part1.pdf';
  const tempPdf2 = '/tmp/guia_docente_part2.pdf';

  fs.writeFileSync(tempHtmlPath1, part1Html, 'utf-8');
  fs.writeFileSync(tempHtmlPath2, part2Html, 'utf-8');

  console.log('🖨️ Compilando Bloque 1 (Páginas 1 a 4) con Google Chrome...');
  const profileDir1 = `/tmp/chrome-guide-p1-${Date.now()}`;
  const url1 = pathToFileURL(tempHtmlPath1).href;
  const cmd1 = `"${CHROME_BIN}" --headless=new --disable-gpu --no-pdf-header-footer --user-data-dir="${profileDir1}" --crash-dumps-dir="/tmp" --print-to-pdf="${tempPdf1}" "${url1}"`;
  execSync(cmd1, { stdio: 'pipe' });

  console.log('🖨️ Compilando Bloque 2 (Páginas 5 y 6) con Google Chrome...');
  const profileDir2 = `/tmp/chrome-guide-p2-${Date.now()}`;
  const url2 = pathToFileURL(tempHtmlPath2).href;
  const cmd2 = `"${CHROME_BIN}" --headless=new --disable-gpu --no-pdf-header-footer --user-data-dir="${profileDir2}" --crash-dumps-dir="/tmp" --print-to-pdf="${tempPdf2}" "${url2}"`;
  execSync(cmd2, { stdio: 'pipe' });

  console.log('📑 Ensamblando y unificando PDF final de 6 páginas...');
  const mergeScriptPath = '/tmp/merge_guide.py';
  const mergePy = `
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
writer.append('${tempPdf1}')
writer.append('${tempPdf2}')
with open('${OUTPUT_PDF}', 'wb') as f:
    writer.write(f)

reader = PdfReader('${OUTPUT_PDF}')
print(f"Total páginas ensambladas: {len(reader.pages)}")
`;
  fs.writeFileSync(mergeScriptPath, mergePy, 'utf-8');
  execSync(`python3 "${mergeScriptPath}"`, { stdio: 'inherit' });

  // Limpiar temporales
  try {
    fs.unlinkSync(tempHtmlPath1);
    fs.unlinkSync(tempHtmlPath2);
    fs.unlinkSync(tempPdf1);
    fs.unlinkSync(tempPdf2);
    fs.unlinkSync(mergeScriptPath);
    fs.rmSync(profileDir1, { recursive: true, force: true });
    fs.rmSync(profileDir2, { recursive: true, force: true });
  } catch {}

  if (fs.existsSync(OUTPUT_PDF)) {
    const sizeMb = (fs.statSync(OUTPUT_PDF).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ [ÉXITO TOTAL] Documento generado exitosamente:`);
    console.log(`📍 Archivo: ${OUTPUT_PDF}`);
    console.log(`⚖️ Tamaño: ${sizeMb} MB (6 páginas completas en formato A4)`);
  } else {
    console.error('❌ OUTPUT_PDF no fue generado.');
  }
}

generateGuide().catch(err => {
  console.error('❌ Error generando guía PDF:', err);
  process.exit(1);
});
