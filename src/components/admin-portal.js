import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

const COURSE_DEFAULTS = [
  { code: 'NT1', name: 'Pre-Kínder (NT1)', teacher: 'Fuentes Bolla Nicole Andrea' },
  { code: 'NT2', name: 'Kínder (NT2)', teacher: 'Fuentes Bolla Nicole Andrea' },
  { code: '1', name: '1° Básico', teacher: 'Docente de Aula' },
  { code: '2', name: '2° Básico', teacher: 'Docente de Aula' },
  { code: '3', name: '3° Básico', teacher: 'Henríquez Figueroa Karla Daniela' },
  { code: '4', name: '4° Básico', teacher: 'Henríquez Figueroa Karla Daniela' },
  { code: '5', name: '5° Básico', teacher: 'Meléndez Mansilla Paola Soledad' },
  { code: '6', name: '6° Básico', teacher: 'Meléndez Mansilla Paola Soledad' },
  { code: '7', name: '7° Básico', teacher: 'Altamirano Toelg Eduardo Javier' },
  { code: '8', name: '8° Básico', teacher: 'Altamirano Toelg Eduardo Javier' }
];

export class AdminPortalComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.filterType = 'ALL';
    this.studentCourseFilter = 'ALL';
    this.studentSearchQuery = '';
    this.editingStudentId = null;
  }

  init() {
    this.render();

    storage.subscribe((event) => {
      if (['TRANSACTION_ADDED', 'COURSE_BATCH_AWARDED', 'STUDENTS_UPDATED', 'DATA_RESET', 'YEAR_PROMOTED'].includes(event)) {
        this.renderStats();
        this.renderTransactions();
        this.renderLeaderboards();
        this.renderStudentTable();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="hero-banner" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%);">
        <div class="hero-text">
          <h2>📊 Panel General, Gestión Escolar y Auditoría</h2>
          <p>Supervisa ColegualCoins en circulación, gestiona la nómina de estudiantes, promueve cursos cada año y realiza respaldos de datos.</p>
          <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 0.35rem; font-weight: 600;">🌟 Recurso realizado por la Coordinadora de Vida Escolar Janine Díaz Calixto</div>
        </div>
        <div class="hero-stats" id="admin-kpis">
          <!-- KPIs inyectados aquí -->
        </div>
      </div>

      <!-- Herramientas de Respaldo y Acciones Críticas -->
      <div class="course-action-header" style="margin-bottom: 1.5rem;">
        <div>
          <h4 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; margin-bottom: 0.2rem;">
            💾 Gestión y Respaldo de Datos Escolares
          </h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">
            Exporta copias de seguridad en JSON o planillas CSV para Excel. El reinicio de fábrica requiere PIN de seguridad.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button id="btn-export-backup" class="btn btn-secondary btn-sm">
            📥 Descargar Respaldo (JSON)
          </button>
          <label class="btn btn-secondary btn-sm" style="margin: 0; cursor: pointer;">
            📤 Importar Respaldo
            <input type="file" id="input-import-backup" accept=".json" style="display: none;" />
          </label>
          <button id="btn-export-csv" class="btn btn-primary btn-sm">
            📊 Exportar Nómina (CSV/Excel)
          </button>
          <button id="btn-open-reset-modal" class="btn btn-danger btn-sm" title="Restablecer a valores de fábrica">
            ⚠️ Reiniciar Datos
          </button>
        </div>
      </div>

      <!-- Sección de Gestión de Estudiantes y Matrícula -->
      <div class="student-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              👨‍🎓 Matrícula y Alumnos del Banco Colegual
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
              Agrega nuevos estudiantes, edita sus datos, elimina registros o avanza el año escolar para todos los cursos.
            </p>
          </div>
          <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
            <button id="btn-open-add-student" class="btn btn-primary btn-sm" style="font-weight: 700;">
              ➕ Agregar Estudiante
            </button>
            <button id="btn-open-promote-modal" class="btn btn-gold btn-sm" style="font-weight: 800;">
              🎓 Avanzar Año Escolar
            </button>
          </div>
        </div>

        <!-- Filtros y Búsqueda de Estudiantes -->
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center;">
          <div class="search-input-wrapper" style="flex: 1; min-width: 240px;">
            <span class="search-icon">🔍</span>
            <input type="text" id="admin-student-search" class="search-input" placeholder="Buscar por nombre, RUN o n° cuenta..." />
          </div>
          <select id="admin-student-course-filter" class="form-select" style="width: auto; font-size: 0.85rem;">
            <option value="ALL">Todos los Cursos</option>
            <option value="NT1">Pre-Kínder (NT1)</option>
            <option value="NT2">Kínder (NT2)</option>
            <option value="1">1° Básico</option>
            <option value="2">2° Básico</option>
            <option value="3">3° Básico</option>
            <option value="4">4° Básico</option>
            <option value="5">5° Básico</option>
            <option value="6">6° Básico</option>
            <option value="7">7° Básico</option>
            <option value="8">8° Básico</option>
            <option value="EGRESADO">Egresados</option>
          </select>
        </div>

        <!-- Tabla de Estudiantes -->
        <div class="transactions-table-wrap" style="max-height: 480px; overflow-y: auto;">
          <table class="transactions-table">
            <thead>
              <tr>
                <th style="width: 40px;">N°</th>
                <th>RUN</th>
                <th>Nombre del Estudiante</th>
                <th>Curso</th>
                <th>Profesor Jefe</th>
                <th style="text-align: right;">Saldo CC</th>
                <th>Estado</th>
                <th style="text-align: center; width: 140px;">Acciones</th>
              </tr>
            </thead>
            <tbody id="admin-students-tbody">
              <!-- Filas de estudiantes -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Rankings y Cuadro de Honor -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
        <!-- Ranking por Curso -->
        <div class="student-card">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            🏫 Ranking de ColegualCoins por Curso
          </h3>
          <div id="course-leaderboard-list">
            <!-- Cursos ordenados por puntaje -->
          </div>
        </div>

        <!-- Top 5 Estudiantes Ahorristas -->
        <div class="student-card">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            🏆 Cuadro de Honor: Mejores Ahorristas
          </h3>
          <div id="top-students-list">
            <!-- Estudiantes top -->
          </div>
        </div>
      </div>

      <!-- Registro de Transacciones y Auditoría -->
      <div class="student-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800;">
            📜 Registro Auditor de Transacciones
          </h3>

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <select id="admin-tx-filter" class="form-select" style="font-size: 0.85rem; width: auto;">
              <option value="ALL">Todos los Tipos</option>
              <option value="DEPOSITO">Solo Depósitos</option>
              <option value="CANJE">Solo Canjes</option>
              <option value="CURSO_BONO">Solo Bonos de Curso</option>
            </select>
          </div>
        </div>

        <div class="transactions-table-wrap">
          <table class="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y Hora</th>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Motivo / Categoría</th>
                <th>Funcionario</th>
                <th style="text-align: right;">Monto</th>
                <th style="text-align: right;">Saldo</th>
              </tr>
            </thead>
            <tbody id="admin-tx-tbody">
              <!-- Filas de transacciones -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODALES DE GESTIÓN -->
      
      <!-- Modal Agregar / Editar Estudiante -->
      <div class="modal-overlay" id="modal-student-form">
        <div class="modal-container" style="max-width: 500px;">
          <div class="modal-header">
            <h3 id="modal-student-form-title">➕ Agregar Nuevo Estudiante</h3>
            <button class="modal-close" id="btn-close-student-form">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-student-save" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 0.85rem;">
              <div class="form-group">
                <label class="form-label">RUN (con guión):</label>
                <input type="text" id="sf-run" class="form-input" placeholder="Ej: 27200432-3" required />
              </div>
              <div class="form-group">
                <label class="form-label">Nombre Completo:</label>
                <input type="text" id="sf-nombre" class="form-input" placeholder="Ej: Berríos Ruiz Pía Antonella" required />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                  <label class="form-label">Curso:</label>
                  <select id="sf-curso" class="form-select">
                    ${COURSE_DEFAULTS.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">N° de Lista:</label>
                  <input type="number" id="sf-lista" class="form-input" min="1" max="99" value="1" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Profesor(a) Jefe:</label>
                <input type="text" id="sf-profesor" class="form-input" placeholder="Docente a cargo" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                <div class="form-group">
                  <label class="form-label">Edad (años):</label>
                  <input type="number" id="sf-edad" class="form-input" min="3" max="18" value="6" />
                </div>
                <div class="form-group" id="sf-saldo-group">
                  <label class="form-label">Saldo Inicial (CC):</label>
                  <input type="number" id="sf-saldo" class="form-input" min="0" value="10" />
                </div>
              </div>
              <div class="form-group" id="sf-retirado-group" style="display: none;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                  <input type="checkbox" id="sf-retirado" /> Marcar como Alumno Retirado / Inactivo
                </label>
              </div>
              <div class="form-group" id="sf-pin-group" style="background: #fefce8; border: 1.5px solid #fde047; padding: 0.75rem; border-radius: var(--radius-md); margin-top: 0.5rem;">
                <label class="form-label" style="font-weight: 800; color: #854d0e; display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.35rem; font-size: 0.85rem;">
                  🔒 Clave de Seguridad de Administrador:
                </label>
                <input type="password" id="sf-pin" class="form-input" maxlength="4" placeholder="••••" style="letter-spacing: 0.25em; font-weight: 800; text-align: center; font-size: 1.25rem; width: 140px; margin: 0 auto; display: block;" />
                <div style="font-size: 0.76rem; color: #713f12; text-align: center; margin-top: 4px;">
                  Acción restringida. Solo el personal directivo puede modificar la nómina escolar.
                </div>
              </div>
              <div id="sf-error-msg" style="color: #ef4444; font-size: 0.85rem; font-weight: 700; display: none;"></div>
            </form>
          </div>
          <div class="modal-footer" style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-cancel-student-form" style="flex: 1;">Cancelar</button>
            <button class="btn btn-primary" id="btn-submit-student-form" style="flex: 1;">💾 Guardar Estudiante</button>
          </div>
        </div>
      </div>

      <!-- Modal Avanzar Año Escolar con PIN 3834 -->
      <div class="modal-overlay" id="modal-promote-year">
        <div class="modal-container" style="max-width: 460px; text-align: center;">
          <div class="modal-header">
            <h3>🎓 Avanzar Año Escolar</h3>
            <button class="modal-close" id="btn-close-promote-year">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1.25rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎒</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--color-primary-dark); margin-bottom: 0.5rem;">
              Promoción General de Cursos
            </h4>
            <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1.25rem;">
              Todos los estudiantes avanzarán un nivel (Pre-Kínder a Kínder, 1° a 2°, etc.). Los alumnos de 8° Básico se registrarán como Egresados y sus saldos de ColegualCoins se mantendrán intactos.
            </p>
            <div style="background: #f8fafc; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 700; margin-bottom: 0.5rem; display: block;">
                Ingresa la clave de administrador para autorizar la promoción:
              </label>
              <input type="password" id="input-promote-pin" maxlength="4" placeholder="••••" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.3em; width: 140px; margin: 0 auto;" class="form-input" />
              <div id="promote-pin-error" style="color: #ef4444; font-size: 0.82rem; font-weight: 700; margin-top: 0.4rem; display: none;"></div>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-cancel-promote-year" style="flex: 1;">Cancelar</button>
            <button class="btn btn-gold" id="btn-confirm-promote-year" style="flex: 1; font-weight: 800;">🚀 Confirmar Promoción</button>
          </div>
        </div>
      </div>

      <!-- Modal Reinicio de Fábrica con PIN 3834 -->
      <div class="modal-overlay" id="modal-reset-factory">
        <div class="modal-container" style="max-width: 450px; text-align: center;">
          <div class="modal-header">
            <h3>⚠️ Reinicio de Fábrica del Banco</h3>
            <button class="modal-close" id="btn-close-reset-factory">&times;</button>
          </div>
          <div class="modal-body" style="padding: 1.25rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🚨</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #dc2626; margin-bottom: 0.5rem;">
              ¿Estás seguro de restablecer los datos?
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1.25rem;">
              Esta acción restablecerá todas las cuentas de los estudiantes a 10 ColegualCoins iniciales y borrará el historial de transacciones en todos los computadores y celulares conectados.
            </p>
            <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 700; color: #991b1b; margin-bottom: 0.5rem; display: block;">
                Ingresa el PIN de seguridad (4 dígitos):
              </label>
              <input type="password" id="input-factory-pin" maxlength="4" placeholder="••••" style="text-align: center; font-size: 1.5rem; letter-spacing: 0.3em; width: 140px; margin: 0 auto;" class="form-input" />
              <div id="factory-pin-error" style="color: #ef4444; font-size: 0.82rem; font-weight: 700; margin-top: 0.4rem; display: none;"></div>
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-cancel-reset-factory" style="flex: 1;">Cancelar</button>
            <button class="btn btn-danger" id="btn-confirm-reset-factory" style="flex: 1; font-weight: 800;">⚠️ Borrar y Reiniciar</button>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
    this.setupStudentManagement();
    this.renderStats();
    this.renderLeaderboards();
    this.renderTransactions();
    this.renderStudentTable();
  }

  setupEvents() {
    // Exportar Backup JSON
    this.container.querySelector('#btn-export-backup').addEventListener('click', () => {
      const json = storage.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `banco_colegual_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Importar Backup JSON
    this.container.querySelector('#input-import-backup').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const ok = storage.importBackup(event.target.result);
        if (ok) {
          alert('¡Respaldo importado correctamente!');
          this.renderStats();
          this.renderLeaderboards();
          this.renderTransactions();
          this.renderStudentTable();
        } else {
          alert('Error: El archivo no tiene un formato válido de respaldo.');
        }
      };
      reader.readAsText(file);
    });

    // Exportar CSV
    this.container.querySelector('#btn-export-csv').addEventListener('click', () => {
      const csv = storage.exportCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nomina_saldos_banco_colegual_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Filtro de transacciones
    this.container.querySelector('#admin-tx-filter').addEventListener('change', (e) => {
      this.filterType = e.target.value;
      this.renderTransactions();
    });

    // Modal de Reinicio con PIN 3834
    const resetModal = this.container.querySelector('#modal-reset-factory');
    const pinInput = this.container.querySelector('#input-factory-pin');
    const pinError = this.container.querySelector('#factory-pin-error');

    this.container.querySelector('#btn-open-reset-modal').addEventListener('click', () => {
      pinInput.value = '';
      pinError.style.display = 'none';
      resetModal.classList.add('open');
      setTimeout(() => pinInput.focus(), 150);
    });

    const closeResetModal = () => resetModal.classList.remove('open');
    this.container.querySelector('#btn-close-reset-factory').addEventListener('click', closeResetModal);
    this.container.querySelector('#btn-cancel-reset-factory').addEventListener('click', closeResetModal);

    const handleConfirmReset = async () => {
      const pin = pinInput.value.trim();
      if (pin !== '3834') {
        sound.playError();
        pinError.textContent = 'Clave incorrecta. Solo el administrador puede autorizar el reinicio.';
        pinError.style.display = 'block';
        pinInput.focus();
        return;
      }

      try {
        await storage.resetToDefault('3834');
        closeResetModal();
        sound.playSuccess();
        alert('✅ ¡Datos restablecidos con éxito a los valores de fábrica!');
      } catch (err) {
        sound.playError();
        pinError.textContent = err.message || 'Error al restablecer datos.';
        pinError.style.display = 'block';
      }
    };

    this.container.querySelector('#btn-confirm-reset-factory').addEventListener('click', handleConfirmReset);
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConfirmReset();
    });
  }

  setupStudentManagement() {
    // Búsqueda y Filtro de Estudiantes
    const searchInput = this.container.querySelector('#admin-student-search');
    const courseFilter = this.container.querySelector('#admin-student-course-filter');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.studentSearchQuery = e.target.value.toLowerCase().trim();
        this.renderStudentTable();
      });
    }

    if (courseFilter) {
      courseFilter.addEventListener('change', (e) => {
        this.studentCourseFilter = e.target.value;
        this.renderStudentTable();
      });
    }

    // Modal de Agregar / Editar Estudiante
    const formModal = this.container.querySelector('#modal-student-form');
    const formTitle = this.container.querySelector('#modal-student-form-title');
    const sfRun = this.container.querySelector('#sf-run');
    const sfNombre = this.container.querySelector('#sf-nombre');
    const sfCurso = this.container.querySelector('#sf-curso');
    const sfLista = this.container.querySelector('#sf-lista');
    const sfProfesor = this.container.querySelector('#sf-profesor');
    const sfEdad = this.container.querySelector('#sf-edad');
    const sfSaldo = this.container.querySelector('#sf-saldo');
    const sfSaldoGroup = this.container.querySelector('#sf-saldo-group');
    const sfRetirado = this.container.querySelector('#sf-retirado');
    const sfRetiradoGroup = this.container.querySelector('#sf-retirado-group');
    const sfPin = this.container.querySelector('#sf-pin');
    const sfErrorMsg = this.container.querySelector('#sf-error-msg');

    // Autocompletar profesor al cambiar curso
    sfCurso.addEventListener('change', () => {
      const def = COURSE_DEFAULTS.find(c => c.code === sfCurso.value);
      if (def && !sfProfesor.value) {
        sfProfesor.value = def.teacher;
      }
    });

    const closeForm = () => formModal.classList.remove('open');
    this.container.querySelector('#btn-close-student-form').addEventListener('click', closeForm);
    this.container.querySelector('#btn-cancel-student-form').addEventListener('click', closeForm);

    // Abrir modal Agregar
    this.container.querySelector('#btn-open-add-student').addEventListener('click', () => {
      this.editingStudentId = null;
      formTitle.textContent = '➕ Agregar Nuevo Estudiante';
      sfRun.value = '';
      sfNombre.value = '';
      sfCurso.value = '1';
      sfLista.value = '1';
      sfProfesor.value = 'Docente de Aula';
      sfEdad.value = '6';
      sfSaldo.value = '10';
      sfSaldoGroup.style.display = 'block';
      sfRetiradoGroup.style.display = 'none';
      if (sfPin) sfPin.value = '';
      sfErrorMsg.style.display = 'none';
      formModal.classList.add('open');
      setTimeout(() => sfRun.focus(), 150);
    });

    // Guardar Estudiante (Agregar o Editar)
    this.container.querySelector('#btn-submit-student-form').addEventListener('click', async () => {
      const run = sfRun.value.trim();
      const nombre = sfNombre.value.trim();
      const cursoCode = sfCurso.value;
      const cursoDef = COURSE_DEFAULTS.find(c => c.code === cursoCode);
      const cursoName = cursoDef ? cursoDef.name : cursoCode;
      const profesor = sfProfesor.value.trim() || (cursoDef ? cursoDef.teacher : '');
      const lista = parseInt(sfLista.value, 10) || 1;
      const edad = parseInt(sfEdad.value, 10) || 6;
      const pin = sfPin ? sfPin.value.trim() : '';

      if (!run || !nombre) {
        sfErrorMsg.textContent = 'Por favor completa el RUN y Nombre del estudiante.';
        sfErrorMsg.style.display = 'block';
        return;
      }

      if (pin !== '3834') {
        sound.playError();
        sfErrorMsg.textContent = '🔒 Clave incorrecta. No tienes permisos de administrador para modificar la nómina escolar.';
        sfErrorMsg.style.display = 'block';
        if (sfPin) sfPin.focus();
        return;
      }

      try {
        if (this.editingStudentId) {
          // Edición
          await storage.updateStudentServer({
            id: this.editingStudentId,
            run,
            nombre_completo: nombre,
            nombre_display: nombre,
            curso_codigo: cursoCode,
            curso: cursoName,
            profesor_jefe: profesor,
            nro_lista: lista,
            edad,
            retirado: sfRetirado.checked
          }, pin);
          sound.playSuccess();
        } else {
          // Creación
          const saldo = parseInt(sfSaldo.value, 10) || 10;
          await storage.addStudent({
            run,
            nombre_completo: nombre,
            nombre_display: nombre,
            curso_codigo: cursoCode,
            curso: cursoName,
            profesor_jefe: profesor,
            nro_lista: lista,
            edad,
            saldo_inicial: saldo
          }, pin);
          sound.playCoin();
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        }
        closeForm();
        this.renderStudentTable();
      } catch (err) {
        sound.playError();
        sfErrorMsg.textContent = err.message || 'Error al guardar estudiante.';
        sfErrorMsg.style.display = 'block';
      }
    });

    // Modal Promover Año Escolar
    const promoteModal = this.container.querySelector('#modal-promote-year');
    const promotePin = this.container.querySelector('#input-promote-pin');
    const promoteError = this.container.querySelector('#promote-pin-error');

    this.container.querySelector('#btn-open-promote-modal').addEventListener('click', () => {
      promotePin.value = '';
      promoteError.style.display = 'none';
      promoteModal.classList.add('open');
      setTimeout(() => promotePin.focus(), 150);
    });

    const closePromoteModal = () => promoteModal.classList.remove('open');
    this.container.querySelector('#btn-close-promote-year').addEventListener('click', closePromoteModal);
    this.container.querySelector('#btn-cancel-promote-year').addEventListener('click', closePromoteModal);

    const handleConfirmPromote = async () => {
      const pin = promotePin.value.trim();
      if (pin !== '3834') {
        sound.playError();
        promoteError.textContent = 'Clave incorrecta. Solo el administrador puede autorizar la promoción.';
        promoteError.style.display = 'block';
        promotePin.focus();
        return;
      }

      try {
        const res = await storage.promoteSchoolYear('3834');
        closePromoteModal();
        sound.playSuccess();
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
        alert(`🎉 ¡Año escolar avanzado con éxito! Promovidos: ${res.promotedCount} alumnos. Egresados: ${res.graduatedCount}.`);
        this.renderStudentTable();
      } catch (err) {
        sound.playError();
        promoteError.textContent = err.message || 'Error al avanzar año escolar.';
        promoteError.style.display = 'block';
      }
    };

    this.container.querySelector('#btn-confirm-promote-year').addEventListener('click', handleConfirmPromote);
    promotePin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConfirmPromote();
    });
  }

  renderStudentTable() {
    const tbody = this.container.querySelector('#admin-students-tbody');
    if (!tbody) return;

    let students = storage.getStudents();

    // Filtro de curso
    if (this.studentCourseFilter !== 'ALL') {
      students = students.filter(s => s.curso_codigo === this.studentCourseFilter);
    }

    // Filtro de búsqueda
    if (this.studentSearchQuery) {
      students = students.filter(s =>
        s.nombre_completo.toLowerCase().includes(this.studentSearchQuery) ||
        s.nombre_display.toLowerCase().includes(this.studentSearchQuery) ||
        s.run.toLowerCase().includes(this.studentSearchQuery) ||
        (s.nro_cuenta && s.nro_cuenta.toLowerCase().includes(this.studentSearchQuery))
      );
    }

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron estudiantes con los filtros seleccionados.</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map((s, idx) => `
      <tr style="${s.retirado ? 'opacity: 0.6; background: #f8fafc;' : ''}">
        <td style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">${s.nro_lista || (idx + 1)}</td>
        <td style="font-family: monospace; font-size: 0.85rem; font-weight: 700;">${s.run}</td>
        <td>
          <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main);">${s.nombre_display}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${s.nro_cuenta}</div>
        </td>
        <td><span class="badge-tx" style="background:#e0f2fe; color:#0369a1; font-weight: 700;">${s.curso}</span></td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${s.profesor_jefe || '—'}</td>
        <td style="text-align: right; font-weight: 800; color: var(--color-primary-dark); font-size: 0.95rem;">
          🪙 ${s.saldo || 0} CC
        </td>
        <td>
          ${s.retirado ? '<span style="color: #dc2626; font-size: 0.75rem; font-weight: 700; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">Retirado</span>' : '<span style="color: #16a34a; font-size: 0.75rem; font-weight: 700; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">Activo</span>'}
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 0.35rem; justify-content: center;">
            <button class="btn btn-secondary btn-sm btn-edit-student" data-sid="${s.id}" style="padding: 3px 8px; font-size: 0.76rem;" title="Editar estudiante">
              ✏️ Editar
            </button>
            <button class="btn btn-secondary btn-sm btn-delete-student" data-sid="${s.id}" data-sname="${s.nombre_display}" style="padding: 3px 8px; font-size: 0.76rem; color: #dc2626;" title="Eliminar estudiante">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Eventos de edición
    tbody.querySelectorAll('.btn-edit-student').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sid = e.currentTarget.dataset.sid;
        this.openEditStudentModal(sid);
      });
    });

    // Eventos de eliminación con PIN 3834
    tbody.querySelectorAll('.btn-delete-student').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const sid = e.currentTarget.dataset.sid;
        const sname = e.currentTarget.dataset.sname;
        const enteredPin = prompt(`🔒 ACCIÓN PROTEGIDA:\nPara eliminar permanentemente a "${sname}" de la nómina escolar, ingresa la clave de seguridad de administrador:`);
        if (enteredPin === null) return;
        if (enteredPin.trim() !== '3834') {
          sound.playError();
          alert('❌ Clave incorrecta. Acción cancelada por seguridad.');
          return;
        }
        try {
          await storage.deleteStudent(sid, enteredPin.trim());
          sound.playSuccess();
          alert(`✅ Estudiante "${sname}" eliminado permanentemente.`);
          this.renderStudentTable();
        } catch (err) {
          sound.playError();
          alert('Error eliminando estudiante: ' + err.message);
        }
      });
    });
  }

  openEditStudentModal(studentId) {
    const student = storage.getStudentById(studentId);
    if (!student) return;

    this.editingStudentId = student.id;
    const formModal = this.container.querySelector('#modal-student-form');
    const formTitle = this.container.querySelector('#modal-student-form-title');
    const sfRun = this.container.querySelector('#sf-run');
    const sfNombre = this.container.querySelector('#sf-nombre');
    const sfCurso = this.container.querySelector('#sf-curso');
    const sfLista = this.container.querySelector('#sf-lista');
    const sfProfesor = this.container.querySelector('#sf-profesor');
    const sfEdad = this.container.querySelector('#sf-edad');
    const sfSaldoGroup = this.container.querySelector('#sf-saldo-group');
    const sfRetirado = this.container.querySelector('#sf-retirado');
    const sfRetiradoGroup = this.container.querySelector('#sf-retirado-group');
    const sfErrorMsg = this.container.querySelector('#sf-error-msg');

    formTitle.textContent = `✏️ Editar Estudiante: ${student.nombre_display}`;
    sfRun.value = student.run;
    sfNombre.value = student.nombre_display;
    sfCurso.value = student.curso_codigo || '1';
    sfLista.value = student.nro_lista || 1;
    sfProfesor.value = student.profesor_jefe || '';
    sfEdad.value = student.edad || 6;
    sfSaldoGroup.style.display = 'none'; // Saldo se gestiona por transacciones
    sfRetiradoGroup.style.display = 'block';
    sfRetirado.checked = Boolean(student.retirado);
    const sfPin = this.container.querySelector('#sf-pin');
    if (sfPin) sfPin.value = '';
    sfErrorMsg.style.display = 'none';

    formModal.classList.add('open');
  }

  renderStats() {
    const students = storage.getStudents();
    const txs = storage.getTransactions();

    const totalCirculacion = students.reduce((acc, s) => acc + (s.saldo || 0), 0);
    const totalGanado = students.reduce((acc, s) => acc + (s.total_ganado || 0), 0);
    const totalCanjeado = students.reduce((acc, s) => acc + (s.total_canjeado || 0), 0);

    const kpiEl = this.container.querySelector('#admin-kpis');
    if (kpiEl) {
      kpiEl.innerHTML = `
        <div class="hero-stat-card">
          <span class="stat-num">${totalCirculacion}</span>
          <span class="stat-label">CC en Circulación</span>
        </div>
        <div class="hero-stat-card">
          <span class="stat-num">${totalGanado}</span>
          <span class="stat-label">Total Asignadas</span>
        </div>
        <div class="hero-stat-card">
          <span class="stat-num">${totalCanjeado}</span>
          <span class="stat-label">Total Canjeadas</span>
        </div>
        <div class="hero-stat-card">
          <span class="stat-num">${txs.length}</span>
          <span class="stat-label">Transacciones</span>
        </div>
      `;
    }
  }

  renderLeaderboards() {
    const students = storage.getStudents().filter(s => !s.retirado);

    // 1. Por curso
    const courseMap = {};
    students.forEach(s => {
      if (!courseMap[s.curso]) {
        courseMap[s.curso] = { nombre: s.curso, saldo: 0, alumnos: 0 };
      }
      courseMap[s.curso].saldo += s.saldo || 0;
      courseMap[s.curso].alumnos += 1;
    });

    const sortedCourses = Object.values(courseMap).sort((a, b) => b.saldo - a.saldo);

    const courseListEl = this.container.querySelector('#course-leaderboard-list');
    if (courseListEl) {
      courseListEl.innerHTML = sortedCourses.map((c, idx) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[idx] || `${idx + 1}°`;
        const avg = c.alumnos > 0 ? (c.saldo / c.alumnos).toFixed(1) : 0;
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-bottom: 1px solid var(--border-light); font-size: 0.9rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.15rem; width: 24px; text-align: center;">${medal}</span>
              <strong>${c.nombre}</strong>
              <span style="color: var(--text-muted); font-size: 0.75rem;">(${c.alumnos} alum.)</span>
            </div>
            <div style="text-align: right;">
              <span style="font-weight: 800; color: var(--color-primary-dark); font-family: var(--font-heading);">🪙 ${c.saldo} CC</span>
              <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Promedio: ${avg} CC</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. Top Estudiantes
    const sortedStudents = [...students].sort((a, b) => (b.saldo || 0) - (a.saldo || 0)).slice(0, 5);
    const topListEl = this.container.querySelector('#top-students-list');
    if (topListEl) {
      topListEl.innerHTML = sortedStudents.map((s, idx) => {
        const medals = ['🥇', '🥈', '🥉', '⭐', '⭐'];
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-bottom: 1px solid var(--border-light); font-size: 0.9rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.15rem; width: 24px; text-align: center;">${medals[idx]}</span>
              <div>
                <strong>${s.nombre_display}</strong>
                <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">${s.curso}</span>
              </div>
            </div>
            <span style="font-weight: 800; color: #b45309; font-family: var(--font-heading); font-size: 1.1rem;">🪙 ${s.saldo} CC</span>
          </div>
        `;
      }).join('');
    }
  }

  renderTransactions() {
    let txs = storage.getTransactions();

    if (this.filterType !== 'ALL') {
      txs = txs.filter(t => t.tipo === this.filterType);
    }

    const tbody = this.container.querySelector('#admin-tx-tbody');
    if (!tbody) return;

    if (txs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay transacciones registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = txs.slice(0, 50).map(t => `
      <tr>
        <td style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">${t.id.slice(0, 10)}</td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${t.fecha_display}</td>
        <td><strong>${t.estudiante_nombre}</strong></td>
        <td><span class="badge-tx" style="background:#f1f5f9;">${t.curso}</span></td>
        <td>${t.motivo}</td>
        <td style="font-size: 0.82rem;">${t.profesor}</td>
        <td style="text-align: right; font-weight: 800; color: ${t.monto > 0 ? 'var(--color-primary-dark)' : '#dc2626'};">
          ${t.monto > 0 ? `+${t.monto}` : t.monto} CC
        </td>
        <td style="text-align: right; font-weight: 700;">${t.saldo_resultante} CC</td>
      </tr>
    `).join('');
  }
}
