import { storage } from '../services/storage.js';
import { generateQrCanvas, QR_PREFIX } from '../services/qr.js';

export class CardGeneratorComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedCourse = 'ALL';
    this.students = [];
    this.viewMode = 'front'; // 'front', 'both', 'back'
  }

  init() {
    this.students = storage.getStudents();
    this.render();

    // Suscribirse a cambios en storage
    storage.subscribe((event) => {
      if (event === 'STUDENTS_UPDATED' || event === 'DATA_RESET') {
        this.students = storage.getStudents();
        this.renderCardsGrid();
      }
    });
  }

  setCourse(courseCode) {
    this.selectedCourse = courseCode;
    this.renderCardsGrid();
  }

  render() {
    const courses = [
      { code: 'ALL', name: 'Todos los Cursos (68 Estudiantes)' },
      { code: 'NT1', name: 'Pre-Kínder (NT1)' },
      { code: 'NT2', name: 'Kínder (NT2)' },
      { code: '1°', name: '1° Básico' },
      { code: '2°', name: '2° Básico' },
      { code: '3°', name: '3° Básico' },
      { code: '4°', name: '4° Básico' },
      { code: '5°', name: '5° Básico' },
      { code: '6°', name: '6° Básico' },
      { code: '7°', name: '7° Básico' },
      { code: '8°', name: '8° Básico' },
    ];

    this.container.innerHTML = `
      <div class="cards-print-header" style="display: none;">
        <h2>ESCUELA RURAL COLEGUAL - BANCO ESCOLAR</h2>
        <p>Nómina de Tarjetas Bancarias Estudiantiles con Código QR de Identificación</p>
        <p style="font-size: 0.8rem; color: #475569; margin-top: 2px;">Recurso realizado por la Coordinadora de Vida Escolar Janine Díaz Calixto</p>
      </div>

      <div class="cards-gallery-controls">
        <div class="cards-filter-group">
          <label class="form-label" style="margin: 0;">Filtrar por Curso:</label>
          <select id="cards-course-select" class="form-select" style="width: auto; min-width: 200px;">
            ${courses.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
          </select>

          <label class="form-label" style="margin-left: 0.5rem;">Vista:</label>
          <select id="cards-view-mode" class="form-select" style="width: auto;">
            <option value="front">Anverso (Con QR)</option>
            <option value="both">Ambas Caras (Anverso y Reverso)</option>
            <option value="back">Solo Reverso</option>
          </select>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button id="btn-print-cards" class="btn btn-primary">
            🖨️ Imprimir Tarjetas (Para Laminar)
          </button>
        </div>
      </div>

      <div id="cards-container" class="cards-grid-container">
        <!-- Tarjetas renderizadas aquí -->
      </div>
    `;

    // Eventos
    const select = this.container.querySelector('#cards-course-select');
    select.addEventListener('change', (e) => {
      this.selectedCourse = e.target.value;
      this.renderCardsGrid();
    });

    const viewSelect = this.container.querySelector('#cards-view-mode');
    viewSelect.addEventListener('change', (e) => {
      this.viewMode = e.target.value;
      this.renderCardsGrid();
    });

    const printBtn = this.container.querySelector('#btn-print-cards');
    printBtn.addEventListener('click', () => {
      window.print();
    });

    this.renderCardsGrid();
  }

  getFilteredStudents() {
    if (this.selectedCourse === 'ALL') {
      return this.students;
    }
    return this.students.filter(s => s.curso_codigo === this.selectedCourse);
  }

  renderCardsGrid() {
    const grid = this.container.querySelector('#cards-container');
    const filtered = this.getFilteredStudents();

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No hay estudiantes para mostrar.</p>`;
      return;
    }

    grid.innerHTML = filtered.map(student => this.buildCardHtml(student)).join('');

    // Generar códigos QR en cada canvas
    filtered.forEach(student => {
      if (this.viewMode !== 'back') {
        const canvas = document.getElementById(`qr-canvas-${student.id}`);
        if (canvas) {
          // El payload incluye el prefijo y el RUN único
          const qrPayload = `${QR_PREFIX}${student.run}`;
          generateQrCanvas(canvas, qrPayload, { width: 160 });
        }
      }
    });

    // Asignar eventos de imprimir tarjeta individual
    grid.querySelectorAll('.btn-single-print').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.id;
        this.printSingleCard(studentId);
      });
    });
  }

  buildCardHtml(student) {
    const showFront = this.viewMode === 'front' || this.viewMode === 'both';
    const showBack = this.viewMode === 'back' || this.viewMode === 'both';

    return `
      <div class="bank-card-item">
        ${showFront ? `
          <div class="bank-card" id="card-elem-${student.id}">
            <div class="bank-card-front">
              <!-- Encabezado Limpio con Marca y Curso -->
              <div class="card-header-row">
                <div class="card-brand-pill">
                  <span class="card-bank-title">🏛️ BANCO COLEGUAL</span>
                  <span class="card-currency-tag">• 🪙 ColegualCoins</span>
                </div>
                <div class="card-badge-course">${student.curso}</div>
              </div>

              <!-- Fila Media: Código QR nítido a la derecha -->
              <div class="card-middle-row">
                <div class="card-qr-box">
                  <canvas id="qr-canvas-${student.id}" class="card-qr-canvas"></canvas>
                  <span class="card-qr-label">ESCANEAR</span>
                </div>
              </div>

              <!-- Fila Inferior: Nombre y Datos del Estudiante -->
              <div class="card-bottom-row">
                <div class="card-student-name" title="${student.nombre_display}">
                  ${student.nombre_display}
                </div>
                <div class="card-footer-meta">
                  <span class="card-run">RUN: ${student.run}</span>
                  <span class="card-account-number">CTA: ${student.nro_cuenta}</span>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${showBack ? `
          <div class="bank-card bank-card-back">
            <div class="card-magstripe"></div>
            <div class="card-back-body">
              <div class="card-signature-strip">
                <span class="card-signature-text">${student.nombre_display.split(' ')[0]} (Firma)</span>
                <span class="card-cvv">CVV 796</span>
              </div>
              <p class="card-terms-text">
                Tarjeta de ahorro <strong>ColegualCoins</strong> • Escuela Rural Colegual. Reconoce el esfuerzo, la responsabilidad y la buena convivencia escolar. Código SIGE: 7967.
              </p>
              <div style="display: flex; justify-content: space-between; font-size: 0.6rem; color: #a7f3d0;">
                <span>Prof. Jefe: ${student.profesor_jefe}</span>
                <span>Llanquihue, Los Lagos</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="card-actions-bar no-print">
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">
            N° Lista: ${student.nro_lista} • Saldo: <strong style="color: var(--color-primary-dark);">🪙 ${student.saldo} CC</strong>
          </span>
          <button class="btn btn-secondary btn-sm btn-single-print" data-id="${student.id}" title="Imprimir solo esta tarjeta">
            🖨️ Imprimir
          </button>
        </div>
      </div>
    `;
  }

  printSingleCard(studentId) {
    const student = storage.getStudentById(studentId);
    if (!student) return;

    // Crear ventana o vista temporal para imprimir solo esta tarjeta
    const printWindow = window.open('', '_blank', 'width=600,height=500');
    if (!printWindow) {
      window.print();
      return;
    }

    const qrPayload = `${QR_PREFIX}${student.run}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tarjeta Banco Colegual - ${student.nombre_display}</title>
        <link rel="stylesheet" href="/src/styles/main.css">
        <link rel="stylesheet" href="/src/styles/cards.css">
        <link rel="stylesheet" href="/src/styles/print.css">
        <style>
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; background: #fff; }
          .bank-card { width: 85.6mm !important; height: 53.98mm !important; box-shadow: none !important; }
        </style>
      </head>
      <body>
        <div class="bank-card">
          <div class="bank-card-front">
            <div class="card-header-row">
              <div class="card-brand-pill">
                <span class="card-bank-title">🏛️ BANCO COLEGUAL</span>
                <span class="card-currency-tag">• 🪙 ColegualCoins</span>
              </div>
              <div class="card-badge-course">${student.curso}</div>
            </div>
            <div class="card-middle-row">
              <div class="card-qr-box">
                <canvas id="single-qr" class="card-qr-canvas"></canvas>
                <span class="card-qr-label">ESCANEAR</span>
              </div>
            </div>
            <div class="card-bottom-row">
              <div class="card-student-name">${student.nombre_display}</div>
              <div class="card-footer-meta">
                <span class="card-run">RUN: ${student.run}</span>
                <span class="card-account-number">CTA: ${student.nro_cuenta}</span>
              </div>
            </div>
          </div>
        </div>

        <script type="module">
          import QRCode from '/node_modules/qrcode/build/qrcode.js';
          QRCode.toCanvas(document.getElementById('single-qr'), '${qrPayload}', { width: 160, margin: 1 }, () => {
            setTimeout(() => { window.print(); }, 500);
          });
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
