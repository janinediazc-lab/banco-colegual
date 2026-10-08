import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DB_FILE = path.join(ROOT_DIR, 'data/banco_colegual_db.json');
const BG_IMG_PATH = path.join(ROOT_DIR, 'public/fondo_colegual.jpg');
const LOGO_IMG_PATH = path.join(ROOT_DIR, 'public/Logo Colegual.png');
const OUTPUT_DUPLEX_PDF = path.join(ROOT_DIR, 'Tarjetas_Banco_Colegual_Muestra.pdf');
const OUTPUT_FOLDABLE_PDF = path.join(ROOT_DIR, 'Tarjetas_Banco_Colegual_Plegables.pdf');

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('🚀 Iniciando generación de Tarjetas Banco Colegual (Frente y Dorso)...');

  // 1. Cargar estudiantes
  const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const students = dbData.students;
  console.log(`📋 Total estudiantes cargados: ${students.length}`);

  // 2. Codificar imágenes en Base64
  const bgBase64 = `data:image/jpeg;base64,${fs.readFileSync(BG_IMG_PATH).toString('base64')}`;
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_IMG_PATH).toString('base64')}`;

  // 3. Generar códigos QR para cada estudiante
  console.log('📱 Generando códigos QR de alta resolución...');
  const studentQrs = {};
  for (const st of students) {
    const payload = `COLEGUAL:${st.run}`;
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 260,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    });
    studentQrs[st.id] = qrDataUrl;
  }

  // 4. Organizar cursos
  const courseOrder = [
    { name: 'Educación Parvularia (Pre-Kínder NT1 y Kínder NT2)', filter: s => s.curso_codigo === 'NT1' || s.curso_codigo === 'NT2' },
    { name: '1° Básico', filter: s => s.curso_codigo === '1°' },
    { name: '2° Básico', filter: s => s.curso_codigo === '2°' },
    { name: '3° Básico', filter: s => s.curso_codigo === '3°' },
    { name: '4° Básico', filter: s => s.curso_codigo === '4°' },
    { name: '5° Básico', filter: s => s.curso_codigo === '5°' },
    { name: '6° Básico', filter: s => s.curso_codigo === '6°' },
    { name: '7° Básico', filter: s => s.curso_codigo === '7°' },
    { name: '8° Básico', filter: s => s.curso_codigo === '8°' }
  ];

  // Helper para renderizar anverso (Frente)
  function renderCardFront(st) {
    const qr = studentQrs[st.id];
    return `
      <div class="card-container">
        <div class="bank-card bank-card-front" style="background-image: url('${bgBase64}');">
          <div class="front-overlay"></div>

          <!-- Cabecera -->
          <div class="card-header-row">
            <div class="card-brand-pill">
              <span class="card-bank-title">🏛️ BANCO COLEGUAL</span>
              <span class="card-currency-tag">• 🪙 ColegualCoins</span>
            </div>
            <div class="card-badge-course">${st.curso}</div>
          </div>

          <!-- Centro: QR a la derecha -->
          <div class="card-middle-row">
            <div class="card-qr-box">
              <img src="${qr}" class="card-qr-img" alt="QR" />
              <span class="card-qr-label">ESCANEAR</span>
            </div>
          </div>

          <!-- Pie: Nombre y Datos -->
          <div class="card-bottom-row">
            <div class="card-student-name">${st.nombre_display}</div>
            <div class="card-footer-meta">
              <span class="card-run">RUN: ${st.run}</span>
              <span class="card-account-number">CTA: ${st.nro_cuenta}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Helper para renderizar dorso (Reverso)
  function renderCardBack(st) {
    const firstName = st.nombre_display.split(' ')[0];
    return `
      <div class="card-container">
        <div class="bank-card bank-card-back">
          <!-- Cabecera institucional del dorso -->
          <div class="back-top-row">
            <div class="back-school-title">
              🏛️ ESCUELA RURAL COLEGUAL • BANCO ESCOLAR
            </div>
            <div class="back-rbd-tag">RBD 7967</div>
          </div>

          <!-- Banda Magnética -->
          <div class="back-magstripe"></div>

          <!-- Cuerpo del Dorso -->
          <div class="back-body">
            <!-- Tira de Firma y CVV -->
            <div class="back-signature-strip">
              <span class="back-signature-text">${firstName} (Firma Titular)</span>
              <span class="back-cvv-box">CVV 7967</span>
            </div>

            <!-- Términos pedagógicos -->
            <p class="back-terms-text">
              Esta tarjeta es personal e intransferible. Acredita la titularidad de ahorros <strong>ColegualCoins (CC)</strong> obtenidos por mérito, esfuerzo y buena convivencia escolar. Válida exclusivamente en la Escuela Rural Colegual.
            </p>

            <!-- Créditos Coordinadora de Vida Escolar -->
            <div class="back-credit-badge">
              🌟 Recurso institucional por Coordinadora de Vida Escolar Janine Díaz Calixto
            </div>

            <!-- Metadatos inferiores -->
            <div class="back-footer-row">
              <span>Prof. Jefe: ${st.profesor_jefe}</span>
              <span>Llanquihue, Los Lagos</span>
              <span>Cuenta N° ${st.nro_cuenta}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Base CSS compartida
  const sharedCss = `
    @page {
      size: letter portrait;
      margin: 8mm 6mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #0f172a;
    }
    .page-sheet {
      width: 100%;
      height: 100%;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      margin-bottom: 0;
    }
    .page-sheet:last-child {
      page-break-after: avoid;
    }
    .sheet-header {
      text-align: center;
      margin-bottom: 5mm;
      border-bottom: 1.5pt solid #064e3b;
      padding-bottom: 2mm;
    }
    .sheet-header h2 {
      font-size: 13pt;
      font-weight: 800;
      color: #064e3b;
      letter-spacing: 0.03em;
      margin-bottom: 1mm;
    }
    .sheet-header p {
      font-size: 8pt;
      color: #334155;
    }
    .sheet-header .credits-tag {
      font-size: 7.5pt;
      color: #047857;
      font-weight: 700;
      margin-top: 1mm;
    }
    .sheet-grid {
      display: grid;
      grid-template-columns: repeat(2, 85.6mm);
      gap: 5mm 8mm;
      justify-content: center;
    }
    .card-container {
      width: 85.6mm;
      height: 53.98mm;
      border: 1px dashed #94a3b8;
      border-radius: 4.5mm;
      padding: 0.5mm;
      display: flex;
      align-items: center;
      justify-content: center;
      break-inside: avoid;
    }
    .bank-card {
      width: 84.6mm;
      height: 52.98mm;
      border-radius: 4mm;
      position: relative;
      overflow: hidden;
    }

    /* ESTILOS DEL ANVERSO (FRENTE) */
    .bank-card-front {
      background-size: cover;
      background-position: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3mm 4mm;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.45);
    }
    .front-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, 
        rgba(15, 23, 42, 0.65) 0%, 
        rgba(15, 23, 42, 0.05) 30%, 
        rgba(15, 23, 42, 0.08) 65%, 
        rgba(15, 23, 42, 0.88) 100%);
      border-radius: 4mm;
      z-index: 1;
    }
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    .card-brand-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 99px;
      padding: 1.5px 7px;
    }
    .card-bank-title {
      font-size: 6.2pt;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.03em;
    }
    .card-currency-tag {
      font-size: 5.4pt;
      font-weight: 700;
      color: #fef08a;
    }
    .card-badge-course {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      padding: 1.5px 7px;
      border-radius: 99px;
      font-size: 5.8pt;
      font-weight: 800;
      letter-spacing: 0.03em;
      border: 1px solid rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
    }
    .card-middle-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      z-index: 2;
      margin: auto 0;
    }
    .card-qr-box {
      background: #ffffff;
      padding: 1.5mm;
      border-radius: 2.5mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1.5px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .card-qr-img {
      width: 19mm;
      height: 19mm;
      display: block;
    }
    .card-qr-label {
      font-size: 4.2pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.06em;
      margin-top: 0.8mm;
    }
    .card-bottom-row {
      position: relative;
      z-index: 2;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 2.2mm;
      padding: 1.5mm 3mm;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .card-student-name {
      font-size: 7.8pt;
      font-weight: 800;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-footer-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 5.8pt;
    }
    .card-run {
      font-family: monospace;
      font-weight: 700;
      color: #93c5fd;
    }
    .card-account-number {
      font-weight: 700;
      color: #fef08a;
    }

    /* ESTILOS DEL DORSO (REVERSO) */
    .bank-card-back {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5mm 3.5mm;
    }
    .back-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1mm;
    }
    .back-school-title {
      font-size: 5.2pt;
      font-weight: 800;
      color: #e2e8f0;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .back-rbd-tag {
      font-size: 5.2pt;
      font-weight: 800;
      color: #f59e0b;
      letter-spacing: 0.03em;
    }
    .back-magstripe {
      width: 100%;
      height: 7.5mm;
      background: #020617;
      margin: 1.5mm 0;
      border-radius: 1mm;
      border-top: 1px solid rgba(255,255,255,0.12);
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .back-body {
      display: flex;
      flex-direction: column;
      gap: 1.2mm;
    }
    .back-signature-strip {
      background: #f8fafc;
      height: 5.8mm;
      border-radius: 1.2mm;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.5mm;
      border: 1px solid #cbd5e1;
    }
    .back-signature-text {
      font-family: 'Brush Script MT', 'Apple Chancery', cursive, sans-serif;
      font-size: 7.8pt;
      color: #334155;
      font-style: italic;
    }
    .back-cvv-box {
      background: #ffffff;
      color: #0f172a;
      font-family: monospace;
      font-weight: 800;
      font-size: 5.8pt;
      padding: 1px 4px;
      border-radius: 1mm;
      border: 1px solid #94a3b8;
    }
    .back-terms-text {
      font-size: 4.6pt;
      color: #94a3b8;
      line-height: 1.25;
    }
    .back-credit-badge {
      font-size: 4.6pt;
      color: #a7f3d0;
      font-weight: 700;
      line-height: 1.2;
    }
    .back-footer-row {
      display: flex;
      justify-content: space-between;
      font-size: 4.8pt;
      color: #cbd5e1;
      border-top: 1px dashed rgba(255,255,255,0.2);
      padding-top: 1mm;
      font-weight: 600;
    }
  `;

  // =========================================================================
  // DOCUMENTO 1: FORMATO DÚPLEX (Hojas alternadas de Anverso y Dorso)
  // Con espejado horizontal en el dorso para coincidencia perfecta al imprimir
  // =========================================================================
  console.log('📄 Generando HTML para PDF Dúplex...');
  let duplexHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Tarjetas Banco Colegual - Dúplex</title>
      <style>${sharedCss}</style>
    </head>
    <body>
  `;

  for (const course of courseOrder) {
    const courseStudents = students.filter(course.filter);
    if (courseStudents.length === 0) continue;

    // Procesar en tandas de máximo 8 estudiantes por hoja
    const chunkSize = 8;
    for (let i = 0; i < courseStudents.length; i += chunkSize) {
      const chunk = courseStudents.slice(i, i + chunkSize);
      const pageNum = Math.floor(i / chunkSize) + 1;
      const totalPagesForCourse = Math.ceil(courseStudents.length / chunkSize);
      const subTitle = totalPagesForCourse > 1 ? ` (Parte ${pageNum} de ${totalPagesForCourse})` : '';

      // 1. Hoja de Anversos (Frentes)
      duplexHtml += `
        <div class="page-sheet">
          <div class="sheet-header">
            <h2>ESCUELA RURAL COLEGUAL • BANCO ESCOLAR</h2>
            <p><strong>ANVERSO (FRENTE CON QR)</strong> — ${course.name}${subTitle} • ${chunk.length} Estudiantes</p>
            <div class="credits-tag">🌟 Recurso institucional por Coordinadora de Vida Escolar Janine Díaz Calixto</div>
          </div>
          <div class="sheet-grid">
            ${chunk.map(st => renderCardFront(st)).join('')}
          </div>
        </div>
      `;

      // 2. Hoja de Dorsos (Reversos con espejado horizontal de columnas para dúplex)
      // Para cada fila de 2 tarjetas: [A, B] -> En el reverso debe ser [B, A]
      const mirroredChunk = [];
      for (let r = 0; r < chunk.length; r += 2) {
        const left = chunk[r];
        const right = chunk[r + 1];
        if (right) {
          mirroredChunk.push(right);
          mirroredChunk.push(left);
        } else {
          // Si es tarjeta impar sin pareja a la derecha, en el reverso debe ir a la derecha
          mirroredChunk.push(null); // espacio vacío a la izquierda
          mirroredChunk.push(left); // tarjeta a la derecha
        }
      }

      duplexHtml += `
        <div class="page-sheet">
          <div class="sheet-header" style="border-bottom-color: #1e293b;">
            <h2>ESCUELA RURAL COLEGUAL • BANCO ESCOLAR</h2>
            <p><strong>DORSO (REVERSO PARA DÚPLEX)</strong> — ${course.name}${subTitle} • Alineado para corte y plastificado</p>
            <div class="credits-tag">🌟 Recurso institucional por Coordinadora de Vida Escolar Janine Díaz Calixto</div>
          </div>
          <div class="sheet-grid">
            ${mirroredChunk.map(st => st ? renderCardBack(st) : '<div class="card-container" style="border: none;"></div>').join('')}
          </div>
        </div>
      `;
    }
  }

  duplexHtml += `
    </body>
    </html>
  `;

  const tempHtmlPath = path.join(ROOT_DIR, 'data/temp_tarjetas_duplex.html');
  fs.writeFileSync(tempHtmlPath, duplexHtml, 'utf-8');

  // Compilar a PDF con Chrome Headless
  console.log('🖨️ Compilando Tarjetas_Banco_Colegual_Muestra.pdf con Google Chrome...');
  const cmd = `"${CHROME_BIN}" --headless --disable-gpu --no-pdf-header-footer --user-data-dir="/tmp/chrome-cards-profile" --print-to-pdf="${OUTPUT_DUPLEX_PDF}" "file://${tempHtmlPath}"`;
  execSync(cmd, { stdio: 'pipe' });

  if (fs.existsSync(OUTPUT_DUPLEX_PDF)) {
    const sizeMb = (fs.statSync(OUTPUT_DUPLEX_PDF).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ [ÉXITO] ${OUTPUT_DUPLEX_PDF} generado (${sizeMb} MB)`);
  }

  // =========================================================================
  // DOCUMENTO 2: FORMATO PLEGABLE (Frente y Dorso juntos lado a lado)
  // Ideal para imprimir en hojas simples, cortar el rectángulo doble y doblar por el medio
  // =========================================================================
  console.log('📄 Generando HTML para PDF Plegable (Fold-over)...');
  const foldableCss = sharedCss + `
    .foldable-pair {
      display: flex;
      gap: 0;
      border: 1px dashed #94a3b8;
      border-radius: 4.5mm;
      padding: 0.5mm;
      position: relative;
      break-inside: avoid;
    }
    .foldable-fold-line {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      border-left: 1.5px dotted #f59e0b;
      z-index: 10;
    }
    .foldable-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 4mm;
      justify-content: center;
      max-width: 180mm;
      margin: 0 auto;
    }
  `;

  let foldableHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Tarjetas Banco Colegual - Plegables</title>
      <style>
        ${sharedCss}
        .foldable-sheet-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4mm;
          justify-content: center;
          align-items: center;
        }
        .foldable-unit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          border: 1px dashed #64748b;
          border-radius: 4.5mm;
          padding: 0.5mm;
          width: 172mm;
          margin: 0 auto;
          position: relative;
          background: #f8fafc;
        }
        .foldable-divider {
          width: 1px;
          height: 52.98mm;
          border-left: 1.5px dotted #d97706;
          margin: 0 1mm;
        }
      </style>
    </head>
    <body>
  `;

  for (const course of courseOrder) {
    const courseStudents = students.filter(course.filter);
    if (courseStudents.length === 0) continue;

    // 4 unidades plegables por página (cada unidad tiene frente + dorso)
    const chunkSize = 4;
    for (let i = 0; i < courseStudents.length; i += chunkSize) {
      const chunk = courseStudents.slice(i, i + chunkSize);
      const pageNum = Math.floor(i / chunkSize) + 1;
      const totalPagesForCourse = Math.ceil(courseStudents.length / chunkSize);
      const subTitle = totalPagesForCourse > 1 ? ` (Parte ${pageNum} de ${totalPagesForCourse})` : '';

      foldableHtml += `
        <div class="page-sheet">
          <div class="sheet-header">
            <h2>ESCUELA RURAL COLEGUAL • BANCO ESCOLAR</h2>
            <p><strong>TARJETAS PLEGABLES (DOBLAR POR LA LÍNEA PUNTEADA)</strong> — ${course.name}${subTitle}</p>
            <div class="credits-tag">🌟 Recurso institucional por Coordinadora de Vida Escolar Janine Díaz Calixto</div>
          </div>
          <div class="foldable-sheet-grid">
            ${chunk.map(st => `
              <div class="foldable-unit">
                <div style="width: 84.6mm;">${renderCardFront(st)}</div>
                <div class="foldable-divider" title="Línea de doblado"></div>
                <div style="width: 84.6mm;">${renderCardBack(st)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  foldableHtml += `
    </body>
    </html>
  `;

  const tempFoldableHtmlPath = path.join(ROOT_DIR, 'data/temp_tarjetas_plegables.html');
  fs.writeFileSync(tempFoldableHtmlPath, foldableHtml, 'utf-8');

  console.log('🖨️ Compilando Tarjetas_Banco_Colegual_Plegables.pdf con Google Chrome...');
  const cmdFoldable = `"${CHROME_BIN}" --headless --disable-gpu --no-pdf-header-footer --user-data-dir="/tmp/chrome-cards-profile" --print-to-pdf="${OUTPUT_FOLDABLE_PDF}" "file://${tempFoldableHtmlPath}"`;
  execSync(cmdFoldable, { stdio: 'pipe' });

  if (fs.existsSync(OUTPUT_FOLDABLE_PDF)) {
    const sizeMb = (fs.statSync(OUTPUT_FOLDABLE_PDF).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ [ÉXITO] ${OUTPUT_FOLDABLE_PDF} generado (${sizeMb} MB)`);
  }

  // Limpiar temporales
  try {
    fs.unlinkSync(tempHtmlPath);
    fs.unlinkSync(tempFoldableHtmlPath);
  } catch {}

  console.log('🎉 ¡Generación completada exitosamente!');
}

main().catch(err => {
  console.error('❌ Error generando PDFs:', err);
  process.exit(1);
});
