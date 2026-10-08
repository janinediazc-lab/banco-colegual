import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export class TeacherPortalComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedCourse = '1°'; // default
    this.searchTerm = '';
    this.activeTeacher = null;
    this.selectedStudentForPoints = null;
  }

  init() {
    this.activeTeacher = storage.getActiveTeacher();
    this.render();

    storage.subscribe((event) => {
      if (['STUDENTS_UPDATED', 'TRANSACTION_ADDED', 'COURSE_BATCH_AWARDED', 'DATA_RESET', 'TEACHER_CHANGED'].includes(event)) {
        this.activeTeacher = storage.getActiveTeacher();
        this.renderStudents();
        this.updateHeaderStats();
      }
    });
  }

  setCourse(code) {
    this.selectedCourse = code;
    this.renderCoursePills();
    this.renderStudents();
    this.updateHeaderStats();
  }

  render() {
    this.container.innerHTML = `
      <!-- Banner Resumen de Gestión Docente y Funcionarios -->
      <div class="hero-banner">
        <div class="hero-text">
          <h2>👨‍🏫 Panel de Funcionarios y Recompensas</h2>
          <p>Asigna <strong>ColegualCoins (CC)</strong> a tus estudiantes por buena convivencia, esfuerzo, compañerismo y hábitos positivos.</p>
          <div style="font-size: 0.8rem; color: #a7f3d0; margin-top: 0.35rem; font-weight: 600;">🌟 Recurso realizado por la Coordinadora de Vida Escolar Janine Díaz Calixto</div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat-card">
            <span class="stat-num" id="stat-course-students">0</span>
            <span class="stat-label">Alumnos</span>
          </div>
          <div class="hero-stat-card">
            <span class="stat-num" id="stat-course-points">0</span>
            <span class="stat-label">ColegualCoins</span>
          </div>
          <div class="hero-stat-card">
            <span class="stat-num" id="stat-total-school">68</span>
            <span class="stat-label">Escuela Total</span>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros de Curso -->
      <div class="course-filter-bar" id="teacher-course-pills">
        <!-- Pills inyectados por JS -->
      </div>

      <!-- Barra de Cabecera del Curso y Búsqueda -->
      <div class="course-action-header">
        <div class="course-meta">
          <h3 id="current-course-title">1° Básico</h3>
          <span class="course-teacher-tag" id="current-course-teacher">Docente de Aula</span>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="teacher-student-search" class="search-input" placeholder="Buscar por nombre o RUN..." />
          </div>

          <button id="btn-batch-course" class="btn btn-gold">
            ⭐ Bono Grupal (+10 ColegualCoins)
          </button>
        </div>
      </div>

      <!-- Grilla de Estudiantes -->
      <div class="students-grid" id="teacher-students-grid">
        <!-- Renderizado dinámico -->
      </div>

      <!-- Modal Asignar Puntos -->
      <div class="modal-overlay" id="modal-deposit-points">
        <div class="modal-container">
          <div class="modal-header">
            <h3>🪙 Asignar ColegualCoins</h3>
            <button class="modal-close" id="btn-close-deposit">&times;</button>
          </div>
          <div class="modal-body" id="modal-deposit-body">
            <!-- Contenido dinámico del modal -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-deposit">Cancelar</button>
            <button class="btn btn-primary" id="btn-confirm-deposit">¡Abonar ColegualCoins! 💰</button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación de Abono Exitoso -->
      <div class="modal-overlay" id="modal-deposit-success">
        <div class="modal-container" style="max-width: 480px; text-align: center;">
          <div class="modal-header" style="background: linear-gradient(135deg, #064e3b, #047857); color: white;">
            <h3 style="color: white; margin: 0;">🎉 ¡Abono Confirmado con Éxito!</h3>
            <button class="modal-close" id="btn-close-deposit-success-x" style="color: white;">&times;</button>
          </div>
          <div class="modal-body" id="modal-deposit-success-body">
            <!-- Detalles del abono -->
          </div>
          <div class="modal-footer" style="justify-content: center;">
            <button class="btn btn-primary btn-lg" id="btn-done-deposit-success" style="width: 100%;">
              ¡Continuar! 👍
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Cartola / Historial del Estudiante -->
      <div class="modal-overlay" id="modal-passbook">
        <div class="modal-container" style="max-width: 720px;">
          <div class="modal-header">
            <h3>📜 Libreta de Ahorro y Cartola Bancaria</h3>
            <button class="modal-close" id="btn-close-passbook">&times;</button>
          </div>
          <div class="modal-body" id="modal-passbook-body">
            <!-- Contenido dinámico -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-close-passbook-footer">Cerrar</button>
            <button class="btn btn-primary" id="btn-print-passbook">🖨️ Imprimir Cartola</button>
          </div>
        </div>
      </div>
    `;

    this.renderCoursePills();
    this.setupEvents();
    this.renderStudents();
    this.updateHeaderStats();
  }

  renderCoursePills() {
    const courses = [
      { code: 'ALL', name: 'Todos los Cursos' },
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

    const pillsContainer = this.container.querySelector('#teacher-course-pills');
    pillsContainer.innerHTML = courses.map(c => `
      <button class="course-pill ${c.code === this.selectedCourse ? 'active' : ''}" data-code="${c.code}">
        ${c.name}
      </button>
    `).join('');

    pillsContainer.querySelectorAll('.course-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setCourse(e.currentTarget.dataset.code);
      });
    });
  }

  setupEvents() {
    // Buscador
    const searchInput = this.container.querySelector('#teacher-student-search');
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase().trim();
      this.renderStudents();
    });

    // Bono curso completo
    const batchBtn = this.container.querySelector('#btn-batch-course');
    batchBtn.addEventListener('click', () => {
      this.openBatchCourseModal();
    });

    // Cierre de modales
    this.container.querySelector('#btn-close-deposit').addEventListener('click', () => this.closeDepositModal());
    this.container.querySelector('#btn-cancel-deposit').addEventListener('click', () => this.closeDepositModal());
    this.container.querySelector('#btn-close-passbook').addEventListener('click', () => this.closePassbookModal());
    this.container.querySelector('#btn-close-passbook-footer').addEventListener('click', () => this.closePassbookModal());

    // Imprimir cartola
    this.container.querySelector('#btn-print-passbook').addEventListener('click', () => {
      window.print();
    });
  }

  getRank(saldo = 0) {
    if (saldo >= 300) return { title: 'Diamante', icon: '💎', color: '#06b6d4' };
    if (saldo >= 150) return { title: 'Oro', icon: '🥇', color: '#eab308' };
    if (saldo >= 75) return { title: 'Plata', icon: '🥈', color: '#94a3b8' };
    if (saldo >= 30) return { title: 'Bronce', icon: '🥉', color: '#d97706' };
    return { title: 'Semilla', icon: '🌱', color: '#10b981' };
  }

  getFilteredStudents() {
    let list = storage.getStudents();
    if (this.selectedCourse !== 'ALL') {
      list = list.filter(s => s.curso_codigo === this.selectedCourse);
    }
    if (this.searchTerm) {
      list = list.filter(s => 
        s.nombre_completo.toLowerCase().includes(this.searchTerm) ||
        s.nombre_display.toLowerCase().includes(this.searchTerm) ||
        s.run.toLowerCase().includes(this.searchTerm)
      );
    }
    return list;
  }

  updateHeaderStats() {
    const all = storage.getStudents();
    const filtered = this.getFilteredStudents();

    const totalCoursePoints = filtered.reduce((acc, s) => acc + (s.saldo || 0), 0);
    const totalSchoolStudents = all.length;

    const elCourseStudents = this.container.querySelector('#stat-course-students');
    const elCoursePoints = this.container.querySelector('#stat-course-points');
    const elTotalSchool = this.container.querySelector('#stat-total-school');

    if (elCourseStudents) elCourseStudents.textContent = filtered.length;
    if (elCoursePoints) elCoursePoints.textContent = totalCoursePoints;
    if (elTotalSchool) elTotalSchool.textContent = totalSchoolStudents;

    // Actualizar título y profesor
    const titleEl = this.container.querySelector('#current-course-title');
    const profEl = this.container.querySelector('#current-course-teacher');

    if (this.selectedCourse === 'ALL') {
      if (titleEl) titleEl.textContent = 'Todos los Cursos';
      if (profEl) profEl.textContent = 'Toda la Escuela Colegual';
    } else {
      const firstStudent = filtered[0];
      if (titleEl) titleEl.textContent = firstStudent ? firstStudent.curso : `${this.selectedCourse} Básico`;
      if (profEl) profEl.textContent = firstStudent ? `Prof. Jefe: ${firstStudent.profesor_jefe}` : 'Docente';
    }
  }

  renderStudents() {
    const grid = this.container.querySelector('#teacher-students-grid');
    const students = this.getFilteredStudents();

    if (students.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <p style="font-weight: 700; font-size: 1.1rem;">No se encontraron estudiantes</p>
          <p style="font-size: 0.9rem;">Prueba cambiando el curso o el término de búsqueda.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = students.map(student => {
      const rank = this.getRank(student.saldo);
      const initials = student.nombre_display.split(' ').map(w => w[0]).slice(0, 2).join('');

      return `
        <div class="student-card ${student.retirado ? 'retirado' : ''}" id="student-card-${student.id}">
          <div class="student-card-top">
            <div class="student-avatar" style="background: linear-gradient(135deg, ${rank.color}, #064e3b);">
              ${initials}
            </div>
            <div class="student-card-details">
              <div class="student-card-name">${student.nombre_display}</div>
              <div class="student-card-meta">
                <span class="student-badge-run">${student.run}</span>
                <span>N° ${student.nro_lista}</span>
                <span>• ${student.curso}</span>
                ${student.retirado ? '<span style="color:#ef4444; font-weight:700;">(Retirado)</span>' : ''}
              </div>
            </div>
          </div>

          <div class="student-card-balance">
            <div>
              <div class="balance-title">Saldo en Cuenta</div>
              <div style="font-size: 0.72rem; color: ${rank.color}; font-weight: 700;">
                ${rank.icon} Nivel ${rank.title}
              </div>
            </div>
            <div class="balance-points">
              <span class="coin-icon">🪙</span>
              <span>${student.saldo || 0}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">CC</span>
            </div>
          </div>

          <div class="student-card-actions">
            <button class="btn btn-primary btn-sm btn-action-deposit" data-id="${student.id}" title="Abonar ColegualCoins">
              ➕ Abonar CC
            </button>
            <button class="btn btn-danger-soft btn-sm btn-action-deduct" data-id="${student.id}" title="Quitar o Descontar ColegualCoins">
              ➖ Quitar CC
            </button>
            <button class="btn btn-secondary btn-sm btn-action-passbook" data-id="${student.id}" title="Ver Cartola Bancaria">
              📜 Historial
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Asignar eventos de botones
    grid.querySelectorAll('.btn-action-deposit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stId = e.currentTarget.dataset.id;
        this.openDepositModal(stId, 'ADD');
      });
    });

    grid.querySelectorAll('.btn-action-deduct').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stId = e.currentTarget.dataset.id;
        this.openDepositModal(stId, 'DEDUCT');
      });
    });

    grid.querySelectorAll('.btn-action-passbook').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stId = e.currentTarget.dataset.id;
        this.openPassbookModal(stId);
      });
    });
  }

  openDepositModal(studentId, initialMode = 'ADD') {
    const student = storage.getStudentById(studentId);
    if (!student) return;

    const activeStaff = storage.getActiveStaff();
    if (!storage.isStaffAuthenticated(activeStaff.id)) {
      if (typeof window.promptStaffAuth === 'function') {
        window.promptStaffAuth(activeStaff, () => {
          this.openDepositModal(studentId, initialMode);
        });
        return;
      }
    }

    this.selectedStudentForPoints = student;
    const addCategories = storage.getCategories();
    const deductCategories = storage.getDeductionCategories();

    let currentMode = initialMode; // 'ADD' | 'DEDUCT'
    let selectedPts = 10;
    let selectedCat = currentMode === 'ADD' ? addCategories[0] : deductCategories[0];
    let noteText = '';

    const modal = this.container.querySelector('#modal-deposit-points');
    const body = this.container.querySelector('#modal-deposit-body');
    const modalTitle = modal.querySelector('.modal-header h3');
    const confirmBtn = this.container.querySelector('#btn-confirm-deposit');

    const updateView = () => {
      const isAdd = currentMode === 'ADD';
      const categories = isAdd ? addCategories : deductCategories;

      if (modalTitle) {
        modalTitle.textContent = isAdd ? '🪙 Abonar ColegualCoins' : '🔻 Quitar / Descontar ColegualCoins';
      }

      if (confirmBtn) {
        confirmBtn.className = isAdd ? 'btn btn-primary' : 'btn btn-danger';
        confirmBtn.textContent = isAdd ? '¡Abonar ColegualCoins! 💰' : '🔻 Confirmar Descuento de CC';
      }

      body.innerHTML = `
        <!-- Funcionario responsable -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: ${isAdd ? 'rgba(5, 150, 105, 0.08)' : 'rgba(239, 68, 68, 0.08)'}; border: 1px solid ${isAdd ? 'rgba(5, 150, 105, 0.25)' : 'rgba(239, 68, 68, 0.25)'}; padding: 0.65rem 0.85rem; border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span style="font-size: 1.4rem;">${activeStaff.icono || '👤'}</span>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Funcionario Responsable:</div>
              <div style="font-size: 0.88rem; font-weight: 800; color: ${isAdd ? 'var(--color-primary-dark)' : '#dc2626'};">${activeStaff.nombre}</div>
            </div>
          </div>
          <button type="button" id="btn-modal-change-staff" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 3px 8px;">
            Cambiar
          </button>
        </div>

        <!-- Ficha de Alumno -->
        <div style="display: flex; align-items: center; gap: 1rem; background: var(--bg-card-subtle); padding: 0.9rem 1rem; border-radius: var(--radius-md);">
          <div class="student-avatar" style="width: 48px; height: 48px;">
            ${student.nombre_display.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </div>
          <div style="flex: 1;">
            <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800;">${student.nombre_display}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${student.curso} • RUN: ${student.run}</p>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Saldo Actual</span>
            <span style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: ${student.saldo > 0 ? 'var(--color-primary-dark)' : '#94a3b8'};">
              🪙 ${student.saldo || 0} CC
            </span>
          </div>
        </div>

        <!-- Selector de Acción: Abonar vs Quitar -->
        <div>
          <label class="form-label" style="margin-bottom: 0.4rem; display: block; font-size: 0.82rem;">Selecciona la acción a realizar:</label>
          <div class="point-mode-selector">
            <button type="button" class="point-mode-tab ${isAdd ? 'active-add' : ''}" id="tab-mode-add">
              ➕ Abonar ColegualCoins
            </button>
            <button type="button" class="point-mode-tab ${!isAdd ? 'active-deduct' : ''}" id="tab-mode-deduct">
              ➖ Quitar ColegualCoins
            </button>
          </div>
        </div>

        <!-- Advertencia preventiva si está en modo descuento -->
        ${!isAdd && (student.saldo || 0) === 0 ? `
          <div style="background: #fff1f2; border: 1px solid #fecaca; color: #991b1b; padding: 0.6rem 0.85rem; border-radius: var(--radius-md); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>ℹ️</span>
            <span>El estudiante tiene actualmente <strong>0 CC</strong>. El saldo no bajará a números negativos.</span>
          </div>
        ` : (!isAdd && (student.saldo || 0) < selectedPts ? `
          <div style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 0.6rem 0.85rem; border-radius: var(--radius-md); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚠️</span>
            <span>El saldo actual es de <strong>${student.saldo || 0} CC</strong>. Al descontar ${selectedPts} CC quedará en <strong>0 CC</strong>.</span>
          </div>
        ` : '')}

        <!-- 1. Cantidad de Puntos -->
        <div class="form-group">
          <label class="form-label">
            ${isAdd ? '1. Selecciona la Cantidad de ColegualCoins a Abonar:' : '1. Selecciona la Cantidad de ColegualCoins a Quitar:'}
          </label>
          <div class="quick-points-row">
            ${[5, 10, 15, 20, 50].map(pts => `
              <button type="button" class="quick-point-btn ${!isAdd ? 'deduct-btn' : ''} ${selectedPts === pts ? 'selected' : ''}" data-pts="${pts}">
                ${isAdd ? `+${pts}` : `-${pts}`} CC
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 2. Motivo o Conducta -->
        <div class="form-group">
          <label class="form-label">
            ${isAdd ? '2. Motivo o Conducta Positiva Destacada:' : '2. Motivo del Descuento Formativo o Corrección:'}
          </label>
          <div class="behavior-categories-grid">
            ${categories.map(c => `
              <div class="behavior-category-card ${!isAdd ? 'deduct-card' : ''} ${selectedCat?.id === c.id ? 'selected' : ''}" data-catid="${c.id}">
                <span class="category-icon">${c.icono}</span>
                <div class="category-info">
                  <span class="category-title">${c.nombre}</span>
                  <span class="category-sub">${isAdd ? `+${c.puntos} CC sugeridos` : `-${c.puntos} CC sugeridos`}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. Nota u Observación Opcional -->
        <div class="form-group">
          <label class="form-label">3. Nota u Observación Opcional:</label>
          <input type="text" id="deposit-custom-note" class="form-input" 
            placeholder="${isAdd ? 'Ej: Excelente respuesta en matemáticas / Muy solidario...' : 'Ej: Falta de respeto en recreo / Corrección de duplicación...'}" 
            value="${noteText}" />
        </div>
      `;

      // Eventos pestañas de modo
      body.querySelector('#tab-mode-add').onclick = () => {
        if (currentMode !== 'ADD') {
          const noteEl = body.querySelector('#deposit-custom-note');
          if (noteEl) noteText = noteEl.value;
          currentMode = 'ADD';
          selectedCat = addCategories[0];
          selectedPts = selectedCat?.puntos || 10;
          updateView();
        }
      };

      body.querySelector('#tab-mode-deduct').onclick = () => {
        if (currentMode !== 'DEDUCT') {
          const noteEl = body.querySelector('#deposit-custom-note');
          if (noteEl) noteText = noteEl.value;
          currentMode = 'DEDUCT';
          selectedCat = deductCategories[0];
          selectedPts = selectedCat?.puntos || 10;
          updateView();
        }
      };

      // Eventos selección de puntos
      body.querySelectorAll('.quick-point-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          body.querySelectorAll('.quick-point-btn').forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          selectedPts = parseInt(e.currentTarget.dataset.pts, 10);
          updateWarning();
        });
      });

      // Eventos selección de categorías
      body.querySelectorAll('.behavior-category-card').forEach(card => {
        card.addEventListener('click', (e) => {
          body.querySelectorAll('.behavior-category-card').forEach(c => c.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          const catId = e.currentTarget.dataset.catid;
          selectedCat = categories.find(c => c.id === catId);

          if (selectedCat && selectedCat.puntos) {
            const matchBtn = Array.from(body.querySelectorAll('.quick-point-btn')).find(b => parseInt(b.dataset.pts, 10) === selectedCat.puntos);
            if (matchBtn) {
              body.querySelectorAll('.quick-point-btn').forEach(b => b.classList.remove('selected'));
              matchBtn.classList.add('selected');
              selectedPts = selectedCat.puntos;
              updateWarning();
            }
          }
        });
      });

      // Botón cambiar funcionario
      const changeStaffBtn = body.querySelector('#btn-modal-change-staff');
      if (changeStaffBtn) {
        changeStaffBtn.addEventListener('click', () => {
          const profileBadge = document.getElementById('btn-switch-teacher');
          if (profileBadge) profileBadge.click();
        });
      }
    };

    const updateWarning = () => {
      // Re-evaluar mensaje preventivo si es descuento
      if (currentMode === 'DEDUCT') {
        const noteEl = body.querySelector('#deposit-custom-note');
        if (noteEl) noteText = noteEl.value;
      }
    };

    updateView();

    // Evento confirmar acción
    confirmBtn.onclick = () => {
      try {
        const staff = storage.getActiveStaff();
        const noteInput = body.querySelector('#deposit-custom-note');
        const note = noteInput ? noteInput.value.trim() : '';
        const isAdd = currentMode === 'ADD';
        const motivo = note ? `${selectedCat.nombre}: ${note}` : selectedCat.nombre;

        if (isAdd) {
          const result = storage.addTransaction({
            estudiante_id: student.id,
            monto: selectedPts,
            motivo: `${selectedCat.icono} ${motivo}`,
            profesor: staff.nombre,
            tipo: 'DEPOSITO',
            categoria_id: selectedCat.id
          });

          sound.playCoin();
          confetti({
            particleCount: 65,
            spread: 75,
            origin: { y: 0.6 }
          });

          this.closeDepositModal();
          this.showSuccessModal(student, selectedPts, motivo, staff, result.student.saldo, 'ADD');
          this.showToast(`¡+${selectedPts} ColegualCoins abonadas a ${student.nombre_display}! 🪙`, 'gold');
        } else {
          // Descontar ColegualCoins
          const result = storage.addTransaction({
            estudiante_id: student.id,
            monto: -selectedPts,
            motivo: `${selectedCat.icono} ${motivo}`,
            profesor: staff.nombre,
            tipo: 'DESCUENTO',
            categoria_id: selectedCat.id
          });

          sound.playDeduct();
          this.closeDepositModal();
          this.showSuccessModal(student, selectedPts, motivo, staff, result.student.saldo, 'DEDUCT');
          this.showToast(`🔻 Se han descontado ${selectedPts} ColegualCoins a ${student.nombre_display}`, 'error');
        }
      } catch (err) {
        console.error('Error al procesar ColegualCoins:', err);
        alert('Hubo un error al procesar la operación: ' + err.message);
      }
    };

    modal.classList.add('open');
  }

  showSuccessModal(student, monto, motivo, staff, nuevoSaldo, mode = 'ADD') {
    const successModal = this.container.querySelector('#modal-deposit-success');
    const successBody = this.container.querySelector('#modal-deposit-success-body');
    if (!successModal || !successBody) return;

    const isAdd = mode === 'ADD';
    const headerTitle = isAdd ? '🎉 ¡Abono Confirmado con Éxito!' : '🔻 Descuento Registrado Correctamente';
    const headerBg = isAdd ? 'linear-gradient(135deg, #064e3b, #047857)' : 'linear-gradient(135deg, #7f1d1d, #b91c1c)';

    const modalHeader = successModal.querySelector('.modal-header');
    if (modalHeader) {
      modalHeader.style.background = headerBg;
      const h3 = modalHeader.querySelector('h3');
      if (h3) h3.textContent = headerTitle;
    }

    successBody.innerHTML = `
      <div style="padding: 0.5rem 0.25rem;">
        <div style="font-size: 3.5rem; margin-bottom: 0.25rem; animation: bounce 0.6s ease;">
          ${isAdd ? '🪙' : '📉'}
        </div>
        <h3 style="font-family: var(--font-heading); color: ${isAdd ? 'var(--color-primary-dark)' : '#b91c1c'}; font-size: 1.35rem; font-weight: 800; margin-bottom: 0.25rem;">
          ${isAdd ? '¡ColegualCoins Acreditadas!' : '¡Descuento de ColegualCoins Aplicado!'}
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem;">
          ${isAdd ? 'La transacción se ha registrado correctamente en el banco escolar.' : 'El descuento ha sido registrado correctamente en la libreta del estudiante.'}
        </p>

        <div style="background: ${isAdd ? '#f0fdf4' : '#fef2f2'}; border: 1.5px solid ${isAdd ? '#86efac' : '#fecaca'}; border-radius: var(--radius-lg); padding: 1rem 1.25rem; text-align: left; margin-bottom: 1.25rem; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isAdd ? '#bbf7d0' : '#fee2e2'}; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 0.85rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 600;">Estudiante:</span>
            <strong style="font-size: 1rem; color: ${isAdd ? '#064e3b' : '#7f1d1d'}; text-align: right;">${student.nombre_display}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isAdd ? '#bbf7d0' : '#fee2e2'}; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 0.85rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 600;">Curso / RUN:</span>
            <span style="font-size: 0.85rem; color: ${isAdd ? '#064e3b' : '#7f1d1d'}; font-weight: 700;">${student.curso} • ${student.run}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isAdd ? '#bbf7d0' : '#fee2e2'}; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 0.85rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 600;">${isAdd ? 'Abono:' : 'Descuento:'}</span>
            <strong style="font-size: 1.3rem; color: ${isAdd ? '#15803d' : '#dc2626'}; font-family: var(--font-heading);">
              ${isAdd ? `+${monto} CC 🪙` : `-${monto} CC 🔻`}
            </strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.25rem;">
            <span style="font-size: 0.88rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 700;">Nuevo Saldo Disponible:</span>
            <strong style="font-size: 1.4rem; color: #b45309; font-family: var(--font-heading);">🪙 ${nuevoSaldo} CC</strong>
          </div>
          <div style="margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px dashed ${isAdd ? '#86efac' : '#fca5a5'}; font-size: 0.76rem; color: ${isAdd ? '#15803d' : '#991b1b'}; line-height: 1.4;">
            📌 <strong>Motivo:</strong> ${motivo}<br>
            👤 <strong>Funcionario:</strong> ${staff.nombre}
          </div>
        </div>
      </div>
    `;

    const closeSuccess = () => successModal.classList.remove('open');
    const closeBtnX = this.container.querySelector('#btn-close-deposit-success-x');
    const doneBtn = this.container.querySelector('#btn-done-deposit-success');
    if (closeBtnX) closeBtnX.onclick = closeSuccess;
    if (doneBtn) doneBtn.onclick = closeSuccess;
    successModal.onclick = (e) => {
      if (e.target === successModal) closeSuccess();
    };

    successModal.classList.add('open');
  }

  closeDepositModal() {
    const modal = this.container.querySelector('#modal-deposit-points');
    modal.classList.remove('open');
  }

  openPassbookModal(studentId) {
    const student = storage.getStudentById(studentId);
    if (!student) return;

    const txs = storage.getTransactions({ estudiante_id: student.id });
    const rank = this.getRank(student.saldo);

    const body = this.container.querySelector('#modal-passbook-body');
    body.innerHTML = `
      <div style="background: linear-gradient(135deg, #064e3b, #047857); color: white; padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a7f3d0;">BANCO ESCOLAR COLEGUAL</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; margin: 0.2rem 0;">${student.nombre_display}</h3>
            <p style="font-size: 0.85rem; color: #d1fae5;">${student.curso} • Cuenta N° ${student.nro_cuenta}</p>
          </div>
          <div style="text-align: right; background: rgba(255,255,255,0.15); padding: 0.75rem 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; color: #fef08a; text-transform: uppercase;">Saldo en Cuenta</div>
            <div style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800;">🪙 ${student.saldo} CC</div>
            <div style="font-size: 0.72rem; color: #a7f3d0;">${rank.icon} Nivel ${rank.title}</div>
          </div>
        </div>
      </div>

      <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.75rem;">Historial de Movimientos</h4>
      
      <div class="transactions-table-wrap">
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Movimiento / Motivo</th>
              <th>Funcionario</th>
              <th style="text-align: right;">Monto</th>
              <th style="text-align: right;">Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${txs.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Sin movimientos registrados.</td></tr>
            ` : txs.map(t => `
              <tr>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${t.fecha_display}</td>
                <td>
                  <strong>${t.motivo}</strong>
                </td>
                <td style="font-size: 0.82rem;">${t.profesor}</td>
                <td style="text-align: right; font-weight: 800; color: ${t.monto > 0 ? 'var(--color-primary-dark)' : '#dc2626'};">
                  ${t.monto > 0 ? `+${t.monto}` : t.monto} CC
                </td>
                <td style="text-align: right; font-weight: 700;">${t.saldo_resultante} CC</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const modal = this.container.querySelector('#modal-passbook');
    modal.classList.add('open');
  }

  closePassbookModal() {
    const modal = this.container.querySelector('#modal-passbook');
    modal.classList.remove('open');
  }

  openBatchCourseModal() {
    if (this.selectedCourse === 'ALL') {
      alert('Por favor selecciona un curso específico en la barra de arriba antes de otorgar un bono grupal.');
      return;
    }

    const activeStaff = storage.getActiveStaff();
    if (!storage.isStaffAuthenticated(activeStaff.id)) {
      if (typeof window.promptStaffAuth === 'function') {
        window.promptStaffAuth(activeStaff, () => {
          this.openBatchCourseModal();
        });
        return;
      }
    }

    const students = storage.getStudents().filter(s => s.curso_codigo === this.selectedCourse && !s.retirado);
    if (students.length === 0) return;

    const courseName = students[0]?.curso || this.selectedCourse;

    const confirmReward = confirm(
      `¿Deseas asignar un Bono Grupal de +10 ColegualCoins a todos los ${students.length} estudiantes de ${courseName} por buen comportamiento colectivo?`
    );

    if (confirmReward) {
      const staff = storage.getActiveStaff();
      storage.addCourseBatchPoints({
        curso_codigo: this.selectedCourse,
        monto: 10,
        motivo: 'Excelente comportamiento grupal y trabajo colaborativo de la clase',
        profesor: staff.nombre,
        categoria_id: 'grupal'
      });

      sound.playSuccess();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      this.showToast(`🎉 ¡Bono de +10 ColegualCoins asignado a ${students.length} alumnos de ${courseName}!`, 'gold');
    }
  }

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-box');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-box';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}
