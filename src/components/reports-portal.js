import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';
import { requestStaffAuthorization } from '../utils/auth-modal.js';

export const DIPLOMA_CATEGORIES = [
  {
    id: 'espiritu_colegual',
    icon: '🌟',
    title: 'Espíritu Colegual y Valores Institucionales',
    defaultText: 'Por encarnar los valores de compañerismo, alegría, respeto mutuo y alto sentido de pertenencia con la Escuela Rural Colegual.'
  },
  {
    id: 'mejor_companero',
    icon: '🤝',
    title: 'Mejor Compañero(a) y Solidaridad',
    defaultText: 'Por su permanente empatía, generosidad, paciencia y disposición incondicional para ayudar a sus compañeros de curso.'
  },
  {
    id: 'superacion_personal',
    icon: '🚀',
    title: 'Superación Personal y Esfuerzo',
    defaultText: 'Por su notable perseverancia, esfuerzo constante y entusiasmo diario para superar los desafíos escolares.'
  },
  {
    id: 'cuidado_ambiente',
    icon: '🌿',
    title: 'Guardián del Entorno y Medio Ambiente',
    defaultText: 'Por su ejemplar compromiso con la limpieza, el orden, el cuidado de la naturaleza y la conciencia ecológica de nuestra escuela.'
  },
  {
    id: 'liderazgo_positivo',
    icon: '👑',
    title: 'Liderazgo Positivo y Convivencia',
    defaultText: 'Por promover la resolución pacífica de diferencias, el diálogo constructivo y el buen trato entre todos los integrantes de la comunidad.'
  },
  {
    id: 'responsabilidad',
    icon: '📚',
    title: 'Responsabilidad y Compromiso Escolar',
    defaultText: 'Por su destacada puntualidad, orden, cumplimiento de tareas y ejemplar compromiso con su aprendizaje.'
  },
  {
    id: 'personalizado',
    icon: '✏️',
    title: 'Mención de Honor Personalizada',
    defaultText: 'Por su destacado compromiso, esfuerzo constante y valiosa contribución a la comunidad de la Escuela Rural Colegual.'
  }
];

export class ReportsPortalComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentSubTab = 'invisibilizados'; // 'invisibilizados' | 'diplomas' | 'cartolas'
    this.selectedCourseInclusion = 'ALL';
    this.daysThreshold = 7;

    // Estado del Diploma
    this.diplomaStudentId = null;
    this.diplomaCategory = DIPLOMA_CATEGORIES[0].id;
    this.diplomaCustomReason = DIPLOMA_CATEGORIES[0].defaultText;
    this.diplomaSigner1 = 'Profesor(a) Jefe';
    this.diplomaSigner2 = 'Janine Díaz Calixto (Coord. Vida Escolar)';
    this.diplomaDate = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

    // Estado de Cartolas
    this.cartolaCourse = '1°';
    this.cartolaStudentId = null;
  }

  init() {
    // Inicializar con el primer alumno disponible
    const students = storage.getStudents();
    if (students.length > 0) {
      this.diplomaStudentId = students[0].id;
      this.cartolaStudentId = students[0].id;
    }

    this.render();

    storage.subscribe((event) => {
      if (['STUDENTS_UPDATED', 'TRANSACTION_ADDED', 'COURSE_BATCH_AWARDED', 'DATA_RESET', 'TEACHER_CHANGED'].includes(event)) {
        this.renderSubTabContent();
      }
    });
  }

  setDiplomaStudent(studentId) {
    this.diplomaStudentId = studentId;
    this.currentSubTab = 'diplomas';
    this.render();
  }

  setCartolaStudent(studentId) {
    const st = storage.getStudentById(studentId);
    if (st) {
      this.cartolaCourse = st.curso_codigo || '1°';
      this.cartolaStudentId = studentId;
    }
    this.currentSubTab = 'cartolas';
    this.render();
  }

  setCartolaCourse(courseCode) {
    this.cartolaCourse = courseCode;
    this.cartolaStudentId = null;
    this.currentSubTab = 'cartolas';
    this.render();
  }

  switchSubTab(tabName) {
    this.currentSubTab = tabName;
    const buttons = this.container.querySelectorAll('.subtab-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === tabName);
    });
    this.renderSubTabContent();
  }

  render() {
    this.container.innerHTML = `
      <!-- Encabezado de Sección Diplomas y Reportes -->
      <div class="hero-banner" style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #1e3a8a 100%);">
        <div class="hero-text">
          <h2>🎓 Diplomas, Inclusión y Cartolas Escolares</h2>
          <p>Herramientas de reconocimiento pedagógico: emite <strong>Diplomas de Honor</strong> oficiales, supervisa la <strong>Alerta de Invisibilizados</strong> y genera <strong>Cartolas Mensuales para la Libreta de Comunicaciones</strong>.</p>
          <div style="font-size: 0.8rem; color: #a7f3d0; margin-top: 0.35rem; font-weight: 600;">
            🌟 Recurso realizado por Janine Díaz Calixto - Coordinación de la Vida Escolar
          </div>
        </div>
      </div>

      <!-- Barra de Sub-Navegación -->
      <div class="subtabs-bar" style="display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border-light); margin-bottom: 1.5rem; padding-bottom: 0.5rem; flex-wrap: wrap;">
        <button class="subtab-btn ${this.currentSubTab === 'invisibilizados' ? 'active' : ''}" data-subtab="invisibilizados">
          <span>🔔</span>
          <span>Alerta de Alumnos Invisibilizados</span>
          <span class="subtab-badge" id="badge-invisibilizados-count">0</span>
        </button>
        <button class="subtab-btn ${this.currentSubTab === 'diplomas' ? 'active' : ''}" data-subtab="diplomas">
          <span>🎓</span>
          <span>Generador de Diplomas Imprimibles</span>
        </button>
        <button class="subtab-btn ${this.currentSubTab === 'cartolas' ? 'active' : ''}" data-subtab="cartolas">
          <span>📋</span>
          <span>Cartolas para Libreta de Comunicaciones</span>
        </button>
      </div>

      <!-- Contenedor Dinámico de la Sub-Pestaña -->
      <div id="subtab-content-area"></div>
    `;

    // Eventos de Sub-Pestañas
    this.container.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchSubTab(e.currentTarget.dataset.subtab);
      });
    });

    this.renderSubTabContent();
  }

  renderSubTabContent() {
    const area = this.container.querySelector('#subtab-content-area');
    if (!area) return;

    this.updateInvisibilizadosCountBadge();

    if (this.currentSubTab === 'invisibilizados') {
      this.renderInvisibilizadosTab(area);
    } else if (this.currentSubTab === 'diplomas') {
      this.renderDiplomasTab(area);
    } else if (this.currentSubTab === 'cartolas') {
      this.renderCartolasTab(area);
    }
  }

  updateInvisibilizadosCountBadge() {
    const badge = this.container.querySelector('#badge-invisibilizados-count');
    if (badge) {
      const invis = storage.getInvisibilizedStudents('ALL', this.daysThreshold);
      badge.textContent = invis.length;
      badge.style.display = invis.length > 0 ? 'inline-block' : 'none';
    }
  }

  // =========================================================================
  // SUB-PESTAÑA 1: ALERTA DE INVISIBILIZADOS (INCLUSIÓN REAL)
  // =========================================================================
  renderInvisibilizadosTab(container) {
    const invis = storage.getInvisibilizedStudents(this.selectedCourseInclusion, this.daysThreshold);
    const totalEscuelaInvis = storage.getInvisibilizedStudents('ALL', this.daysThreshold);

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1.5px solid #fde68a;">
        <div style="display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap;">
          <div style="font-size: 2.5rem; line-height: 1;">🔔</div>
          <div style="flex: 1; min-width: 280px;">
            <h3 style="font-family: var(--font-heading); color: #92400e; font-size: 1.25rem; font-weight: 800; margin-bottom: 0.35rem;">
              Monitor de Inclusión: Alumnos sin Refuerzo Reciente
            </h3>
            <p style="font-size: 0.88rem; color: #78350f; line-height: 1.45; margin: 0;">
              En toda comunidad escolar existen niños participativos que captan la atención rápidamente, mientras otros <strong>estudiantes tímidos, silenciosos o de bajo perfil</strong> rara vez reciben felicitaciones, pese a tener excelente conducta y esfuerzo. Esta herramienta detecta automáticamente a quienes llevan más de <strong>${this.daysThreshold} días</strong> sin recibir ColegualCoins para visibilizar sus virtudes y fortalecer su autoestima.
            </p>
          </div>
          <div style="text-align: right; background: rgba(255,255,255,0.7); padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid #fcd34d;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #92400e; font-weight: 800;">Atención Prioritaria</div>
            <div style="font-size: 2rem; font-weight: 900; color: #b45309; font-family: var(--font-heading);">
              ${invis.length} <span style="font-size: 0.9rem; font-weight: 700;">estudiantes</span>
            </div>
            <div style="font-size: 0.75rem; color: #78350f;">En el filtro seleccionado</div>
          </div>
        </div>
      </div>

      <!-- Filtros de Control -->
      <div class="course-action-header" style="margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">Curso:</label>
          <select id="select-inclusion-course" class="form-input" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.88rem;">
            <option value="ALL" ${this.selectedCourseInclusion === 'ALL' ? 'selected' : ''}>Toda la Escuela (${totalEscuelaInvis.length} pendientes)</option>
            <option value="NT1" ${this.selectedCourseInclusion === 'NT1' ? 'selected' : ''}>Pre-Kínder (NT1)</option>
            <option value="NT2" ${this.selectedCourseInclusion === 'NT2' ? 'selected' : ''}>Kínder (NT2)</option>
            <option value="1°" ${this.selectedCourseInclusion === '1°' ? 'selected' : ''}>1° Básico</option>
            <option value="2°" ${this.selectedCourseInclusion === '2°' ? 'selected' : ''}>2° Básico</option>
            <option value="3°" ${this.selectedCourseInclusion === '3°' ? 'selected' : ''}>3° Básico</option>
            <option value="4°" ${this.selectedCourseInclusion === '4°' ? 'selected' : ''}>4° Básico</option>
            <option value="5°" ${this.selectedCourseInclusion === '5°' ? 'selected' : ''}>5° Básico</option>
            <option value="6°" ${this.selectedCourseInclusion === '6°' ? 'selected' : ''}>6° Básico</option>
            <option value="7°" ${this.selectedCourseInclusion === '7°' ? 'selected' : ''}>7° Básico</option>
            <option value="8°" ${this.selectedCourseInclusion === '8°' ? 'selected' : ''}>8° Básico</option>
          </select>

          <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-left: 0.5rem;">Criterio de Inactividad:</label>
          <select id="select-inclusion-days" class="form-input" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.88rem;">
            <option value="3" ${this.daysThreshold === 3 ? 'selected' : ''}>Más de 3 días sin refuerzo</option>
            <option value="7" ${this.daysThreshold === 7 ? 'selected' : ''}>Más de 7 días (1 semana)</option>
            <option value="14" ${this.daysThreshold === 14 ? 'selected' : ''}>Más de 14 días (2 semanas)</option>
            <option value="21" ${this.daysThreshold === 21 ? 'selected' : ''}>Más de 21 días (3 semanas)</option>
          </select>
        </div>

        <div style="font-size: 0.82rem; color: var(--text-muted);">
          Total en la Escuela: <strong>${totalEscuelaInvis.length}</strong> alumnos requieren un estímulo positivo
        </div>
      </div>

      <!-- Grilla / Lista de Alumnos Invisibilizados -->
      ${invis.length === 0 ? `
        <div class="card" style="text-align: center; padding: 3rem 1.5rem; background: #f0fdf4; border: 1.5px solid #86efac;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
          <h3 style="font-family: var(--font-heading); color: #166534; font-size: 1.35rem; font-weight: 800; margin-bottom: 0.25rem;">
            ¡Felicitaciones! Todos los estudiantes han recibido refuerzos recientes
          </h3>
          <p style="font-size: 0.9rem; color: #15803d; max-width: 600px; margin: 0 auto;">
            No hay estudiantes que superen los ${this.daysThreshold} días sin ColegualCoins. El equipo docente está reconociendo de manera equitativa a todo el grupo.
          </p>
        </div>
      ` : `
        <div class="students-grid">
          ${invis.map(st => {
            const daysColor = st.diasSinRefuerzo >= 14 ? '#dc2626' : (st.diasSinRefuerzo >= 7 ? '#d97706' : '#2563eb');
            const initials = st.nombre_display.split(' ').map(w => w[0]).slice(0, 2).join('');
            return `
              <div class="student-card" style="border: 1.5px solid #fcd34d; background: #fffdf7;">
                <div class="student-card-top">
                  <div class="student-avatar" style="background: linear-gradient(135deg, ${daysColor}, #0f172a);">
                    ${initials}
                  </div>
                  <div class="student-card-details">
                    <div class="student-card-name">${st.nombre_display}</div>
                    <div class="student-card-meta">
                      <span>Cta: ${st.nro_cuenta}</span>
                      <span>• ${st.curso}</span>
                      <span>• Prof. Jefe: ${st.profesor_jefe || 'Docente'}</span>
                    </div>
                  </div>
                </div>

                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; margin: 0.75rem 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.75rem; color: #92400e; font-weight: 700;">Tiempo sin refuerzo:</span>
                    <strong style="font-size: 0.85rem; color: ${daysColor}; font-weight: 800;">
                      ⏳ Hace ${st.diasSinRefuerzo} días
                    </strong>
                  </div>
                  <div style="font-size: 0.72rem; color: #78350f; margin-top: 3px;">
                    ${st.hasReceivedPositive ? `Último abono: ${st.ultimaFecha}` : '⚠️ Solo tiene el bono de bienvenida inicial'}
                  </div>
                </div>

                <div class="student-card-actions">
                  <button class="btn btn-primary btn-sm btn-invis-deposit" data-id="${st.id}" style="flex: 1.3;" title="Abonar ColegualCoins">
                    ➕ Abonar CC
                  </button>
                  <button class="btn btn-gold btn-sm btn-invis-diploma" data-id="${st.id}" style="flex: 1;" title="Otorgar Diploma de Honor">
                    🎓 Diploma
                  </button>
                  <button class="btn btn-secondary btn-sm btn-invis-cartola" data-id="${st.id}" style="flex: 1;" title="Ver Cartola de Libreta">
                    📋 Cartola
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    // Eventos de selección
    const courseSelect = container.querySelector('#select-inclusion-course');
    if (courseSelect) {
      courseSelect.addEventListener('change', (e) => {
        this.selectedCourseInclusion = e.target.value;
        this.renderInvisibilizadosTab(container);
      });
    }

    const daysSelect = container.querySelector('#select-inclusion-days');
    if (daysSelect) {
      daysSelect.addEventListener('change', (e) => {
        this.daysThreshold = Number(e.target.value);
        this.renderInvisibilizadosTab(container);
      });
    }

    // Botones de acción directa
    container.querySelectorAll('.btn-invis-deposit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.id;
        // Abrir pestaña teacher y abrir modal de abono
        if (window.app && window.app.components && window.app.components.teacher) {
          window.location.hash = 'teacher';
          window.app.switchTab('teacher');
          setTimeout(() => {
            window.app.components.teacher.openDepositModal(studentId, 'ADD');
          }, 100);
        }
      });
    });

    container.querySelectorAll('.btn-invis-diploma').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.id;
        this.setDiplomaStudent(studentId);
      });
    });

    container.querySelectorAll('.btn-invis-cartola').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.dataset.id;
        this.setCartolaStudent(studentId);
      });
    });
  }

  // =========================================================================
  // SUB-PESTAÑA 2: GENERADOR DE DIPLOMAS IMPRIMIBLES
  // =========================================================================
  renderDiplomasTab(container) {
    const students = storage.getStudents();
    const currentStudent = storage.getStudentById(this.diplomaStudentId) || students[0];
    const currentCategory = DIPLOMA_CATEGORIES.find(c => c.id === this.diplomaCategory) || DIPLOMA_CATEGORIES[0];
    const activeStaff = storage.getActiveStaff();

    container.innerHTML = `
      <div class="diploma-editor-layout" style="display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; align-items: start;">
        <!-- Panel Izquierdo: Configuración del Diploma -->
        <div class="card" style="padding: 1.25rem;">
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--color-primary-dark); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🎓</span> Configurar Diploma de Honor
          </h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Personaliza el reconocimiento oficial que se imprimirá en papel de diploma o cartulina con el escudo del colegio.
          </p>

          <!-- 1. Selección de Estudiante -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700;">Estudiante a Distinguir:</label>
            <select id="diploma-select-student" class="form-input" style="font-size: 0.9rem;">
              ${students.map(s => `
                <option value="${s.id}" ${s.id === currentStudent?.id ? 'selected' : ''}>
                  ${s.nombre_display} (${s.curso})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- 2. Categoría de Mérito -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700;">Categoría de Mérito y Convivencia:</label>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 220px; overflow-y: auto; padding-right: 4px;">
              ${DIPLOMA_CATEGORIES.map(cat => `
                <div class="behavior-category-card ${cat.id === this.diplomaCategory ? 'selected' : ''}" data-catid="${cat.id}" style="padding: 0.55rem 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border-radius: var(--radius-sm);">
                  <span style="font-size: 1.2rem;">${cat.icon}</span>
                  <div style="flex: 1;">
                    <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">${cat.title}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3. Motivo Detallado (Editable) -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700;">Texto del Motivo / Felicitación:</label>
            <textarea id="diploma-input-reason" class="form-input" rows="3" style="font-size: 0.82rem; resize: vertical;">${this.diplomaCustomReason}</textarea>
          </div>

          <!-- 4. Firmantes y Fecha -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700;">Firmante Principal (Izquierda):</label>
            <input type="text" id="diploma-input-signer1" class="form-input" style="font-size: 0.85rem;" value="${currentStudent?.profesor_jefe || this.diplomaSigner1} (Profesor Jefe)" />
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700;">Firmante Institucional (Derecha):</label>
            <input type="text" id="diploma-input-signer2" class="form-input" style="font-size: 0.85rem;" value="${this.diplomaSigner2}" />
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700;">Fecha de Otorgamiento:</label>
            <input type="text" id="diploma-input-date" class="form-input" style="font-size: 0.85rem;" value="${this.diplomaDate}" />
          </div>

          <button id="btn-print-diploma" class="btn btn-primary btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 800;">
            <span>🖨️</span>
            <span>Imprimir Diploma de Honor</span>
          </button>
        </div>

        <!-- Panel Derecho: Previsualización en Vivo del Diploma (Horizontal) -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
              👁️ Previsualización en Vivo (Formato Apaisado A4)
            </span>
            <span style="font-size: 0.78rem; color: #059669; font-weight: 700; background: #ecfdf5; padding: 2px 8px; border-radius: 99px;">
              ✓ Listo para imprimir en horizontal
            </span>
          </div>

          <div id="diploma-live-preview" class="diploma-frame">
            ${this.generateDiplomaHtml(currentStudent, currentCategory, this.diplomaCustomReason, this.diplomaSigner1, this.diplomaSigner2, this.diplomaDate)}
          </div>
        </div>
      </div>
    `;

    // Asignar eventos de edición
    const selectStudent = container.querySelector('#diploma-select-student');
    if (selectStudent) {
      selectStudent.addEventListener('change', (e) => {
        this.diplomaStudentId = e.target.value;
        const st = storage.getStudentById(this.diplomaStudentId);
        const signerInput = container.querySelector('#diploma-input-signer1');
        if (signerInput && st) {
          signerInput.value = `${st.profesor_jefe || 'Docente'} (Profesor Jefe)`;
        }
        this.updateDiplomaLivePreview();
      });
    }

    container.querySelectorAll('.behavior-category-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const catId = e.currentTarget.dataset.catid;
        this.diplomaCategory = catId;
        const cat = DIPLOMA_CATEGORIES.find(c => c.id === catId);
        if (cat) {
          this.diplomaCustomReason = cat.defaultText;
          const txtArea = container.querySelector('#diploma-input-reason');
          if (txtArea) txtArea.value = cat.defaultText;
        }
        container.querySelectorAll('.behavior-category-card').forEach(c => c.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        this.updateDiplomaLivePreview();
      });
    });

    const reasonInput = container.querySelector('#diploma-input-reason');
    if (reasonInput) {
      reasonInput.addEventListener('input', (e) => {
        this.diplomaCustomReason = e.target.value;
        this.updateDiplomaLivePreview();
      });
    }

    const signer1Input = container.querySelector('#diploma-input-signer1');
    if (signer1Input) {
      signer1Input.addEventListener('input', (e) => {
        this.diplomaSigner1 = e.target.value;
        this.updateDiplomaLivePreview();
      });
    }

    const signer2Input = container.querySelector('#diploma-input-signer2');
    if (signer2Input) {
      signer2Input.addEventListener('input', (e) => {
        this.diplomaSigner2 = e.target.value;
        this.updateDiplomaLivePreview();
      });
    }

    const dateInput = container.querySelector('#diploma-input-date');
    if (dateInput) {
      dateInput.addEventListener('input', (e) => {
        this.diplomaDate = e.target.value;
        this.updateDiplomaLivePreview();
      });
    }

    // Botón de Impresión del Diploma
    const printBtn = container.querySelector('#btn-print-diploma');
    if (printBtn) {
      printBtn.addEventListener('click', async () => {
        const authorized = await requestStaffAuthorization({
          title: '🎓 Autorización para Imprimir Diploma',
          actionLabel: 'emitir diploma oficial de honor'
        });
        if (authorized) {
          this.printDiploma();
        }
      });
    }
  }

  updateDiplomaLivePreview() {
    const previewContainer = this.container.querySelector('#diploma-live-preview');
    if (!previewContainer) return;
    const student = storage.getStudentById(this.diplomaStudentId);
    const category = DIPLOMA_CATEGORIES.find(c => c.id === this.diplomaCategory) || DIPLOMA_CATEGORIES[0];
    const signer1 = this.container.querySelector('#diploma-input-signer1')?.value || this.diplomaSigner1;
    const signer2 = this.container.querySelector('#diploma-input-signer2')?.value || this.diplomaSigner2;
    const dateStr = this.container.querySelector('#diploma-input-date')?.value || this.diplomaDate;
    previewContainer.innerHTML = this.generateDiplomaHtml(student, category, this.diplomaCustomReason, signer1, signer2, dateStr);
  }

  generateDiplomaHtml(student, category, reason, signer1, signer2, dateStr) {
    if (!student) return '<p>Selecciona un estudiante</p>';
    return `
      <div class="diploma-sheet">
        <!-- Borde ornamental doble -->
        <div class="diploma-border-outer">
          <div class="diploma-border-inner">
            
            <!-- Encabezado Institucional -->
            <div class="diploma-header">
              <div class="diploma-republic">
                🇨🇱 REPÚBLICA DE CHILE &bull; SERVICIO LOCAL DE EDUCACIÓN PÚBLICA LLANQUIHUE &bull; RBD 7967
              </div>
              <div class="diploma-brand-row">
                <img src="/Logo Colegual.png" class="diploma-logo-left" alt="Escuela Rural Colegual" />
                <div class="diploma-titles">
                  <div class="diploma-school-name">ESCUELA RURAL COLEGUAL</div>
                  <div class="diploma-program-sub">BANCO ESCOLAR &bull; SISTEMA DE REFUERZO POSITIVO Y CONVIVENCIA</div>
                  <h1 class="diploma-main-title">DIPLOMA DE HONOR</h1>
                </div>
                <img src="/emblema_colegual_circular.png" class="diploma-logo-right" alt="Emblema Colegual" />
              </div>
            </div>

            <!-- Cuerpo del Diploma -->
            <div class="diploma-body">
              <div class="diploma-conferral">
                Se otorga con orgullo y reconocimiento de la comunidad escolar a:
              </div>

              <div class="diploma-student-name">
                ${student.nombre_display}
              </div>

              <div class="diploma-student-course">
                Estudiante de <strong>${student.curso}</strong> &bull; Cuenta Bancaria N° ${student.nro_cuenta}
              </div>

              <div class="diploma-merit-badge">
                <span class="diploma-merit-icon">${category.icon}</span>
                <span class="diploma-merit-title">${category.title}</span>
              </div>

              <div class="diploma-reason-text">
                "${reason}"
              </div>
            </div>

            <!-- Pie de Diploma: Sello y Firmas -->
            <div class="diploma-footer">
              <div class="diploma-date">
                Colegual, Llanquihue, a ${dateStr}
              </div>

              <div class="diploma-signatures-row">
                <div class="diploma-sig-box">
                  <div class="diploma-sig-line"></div>
                  <div class="diploma-sig-name">${signer1}</div>
                  <div class="diploma-sig-cargo">Profesor(a) Jefe</div>
                </div>

                <div class="diploma-seal-center">
                  <div class="diploma-gold-seal">
                    <div class="seal-inner">
                      <span>🏛️</span>
                      <strong>BANCO COLEGUAL</strong>
                      <small>CONVIVENCIA</small>
                    </div>
                  </div>
                </div>

                <div class="diploma-sig-box">
                  <div class="diploma-sig-line"></div>
                  <div class="diploma-sig-name">${signer2}</div>
                  <div class="diploma-sig-cargo">Coordinación de la Vida Escolar</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  printDiploma() {
    const student = storage.getStudentById(this.diplomaStudentId);
    const category = DIPLOMA_CATEGORIES.find(c => c.id === this.diplomaCategory) || DIPLOMA_CATEGORIES[0];
    const signer1 = this.container.querySelector('#diploma-input-signer1')?.value || this.diplomaSigner1;
    const signer2 = this.container.querySelector('#diploma-input-signer2')?.value || this.diplomaSigner2;
    const dateStr = this.container.querySelector('#diploma-input-date')?.value || this.diplomaDate;

    const printContainer = document.getElementById('print-diploma-container');
    if (!printContainer) return;

    printContainer.innerHTML = this.generateDiplomaHtml(student, category, this.diplomaCustomReason, signer1, signer2, dateStr);

    document.body.classList.add('printing-diploma');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-diploma');
      }, 500);
    }, 150);
  }

  // =========================================================================
  // SUB-PESTAÑA 3: CARTOLAS PARA LA LIBRETA DE COMUNICACIONES
  // =========================================================================
  renderCartolasTab(container) {
    const students = storage.getStudents();
    const courseStudents = students.filter(s => s.curso_codigo === this.cartolaCourse);
    const currentStudent = this.cartolaStudentId ? storage.getStudentById(this.cartolaStudentId) : courseStudents[0];

    container.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem; background: #f0fdf4; border: 1.5px solid #bbf7d0;">
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <div style="font-size: 2.2rem;">📋</div>
          <div style="flex: 1; min-width: 280px;">
            <h3 style="font-family: var(--font-heading); color: #065f46; font-size: 1.2rem; font-weight: 800; margin: 0 0 0.25rem 0;">
              Cartolas de Mérito para la Libreta de Comunicaciones
            </h3>
            <p style="font-size: 0.85rem; color: #047857; margin: 0; line-height: 1.4;">
              Informe oficial recortable con formato exacto para pegar en la libreta escolar. Permite a las familias conocer el saldo de su hijo, las actitudes positivas reconocidas en el mes y devolver el <strong>talón de acuse de recibo firmado</strong>.
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button id="btn-print-course-cartolas" class="btn btn-primary" style="font-weight: 800; display: flex; align-items: center; gap: 0.4rem;">
              <span>🖨️</span>
              <span>Imprimir Cartolas del Curso (${courseStudents.length})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros de Curso y Alumno -->
      <div class="course-action-header" style="margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">Curso:</label>
          <select id="select-cartola-course" class="form-input" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.88rem;">
            <option value="NT1" ${this.cartolaCourse === 'NT1' ? 'selected' : ''}>Pre-Kínder (NT1)</option>
            <option value="NT2" ${this.cartolaCourse === 'NT2' ? 'selected' : ''}>Kínder (NT2)</option>
            <option value="1°" ${this.cartolaCourse === '1°' ? 'selected' : ''}>1° Básico</option>
            <option value="2°" ${this.cartolaCourse === '2°' ? 'selected' : ''}>2° Básico</option>
            <option value="3°" ${this.cartolaCourse === '3°' ? 'selected' : ''}>3° Básico</option>
            <option value="4°" ${this.cartolaCourse === '4°' ? 'selected' : ''}>4° Básico</option>
            <option value="5°" ${this.cartolaCourse === '5°' ? 'selected' : ''}>5° Básico</option>
            <option value="6°" ${this.cartolaCourse === '6°' ? 'selected' : ''}>6° Básico</option>
            <option value="7°" ${this.cartolaCourse === '7°' ? 'selected' : ''}>7° Básico</option>
            <option value="8°" ${this.cartolaCourse === '8°' ? 'selected' : ''}>8° Básico</option>
          </select>

          <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-left: 0.5rem;">Ver Alumno Individual:</label>
          <select id="select-cartola-student" class="form-input" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.88rem;">
            ${courseStudents.map(s => `
              <option value="${s.id}" ${s.id === currentStudent?.id ? 'selected' : ''}>
                ${s.nombre_display} (Cta: ${s.nro_cuenta})
              </option>
            `).join('')}
          </select>
        </div>

        <button id="btn-print-single-cartola" class="btn btn-secondary btn-sm" style="font-weight: 700;">
          🖨️ Imprimir Solo esta Cartola
        </button>
      </div>

      <!-- Previsualización de Cartola para Libreta -->
      <div style="background: #e2e8f0; padding: 1.5rem; border-radius: var(--radius-lg); display: flex; justify-content: center;">
        <div id="cartola-live-preview" style="max-width: 620px; width: 100%;">
          ${currentStudent ? this.generateCartolaUnitHtml(currentStudent) : '<p>No hay alumnos en este curso</p>'}
        </div>
      </div>
    `;

    // Eventos
    const courseSelect = container.querySelector('#select-cartola-course');
    if (courseSelect) {
      courseSelect.addEventListener('change', (e) => {
        this.cartolaCourse = e.target.value;
        this.cartolaStudentId = null;
        this.renderCartolasTab(container);
      });
    }

    const studentSelect = container.querySelector('#select-cartola-student');
    if (studentSelect) {
      studentSelect.addEventListener('change', (e) => {
        this.cartolaStudentId = e.target.value;
        const preview = container.querySelector('#cartola-live-preview');
        const st = storage.getStudentById(this.cartolaStudentId);
        if (preview && st) {
          preview.innerHTML = this.generateCartolaUnitHtml(st);
        }
      });
    }

    // Imprimir curso completo
    const batchBtn = container.querySelector('#btn-print-course-cartolas');
    if (batchBtn) {
      batchBtn.addEventListener('click', async () => {
        const authorized = await requestStaffAuthorization({
          title: '📋 Autorización para Imprimir Cartolas',
          actionLabel: `imprimir cartolas de libreta para ${courseStudents.length} estudiantes`
        });
        if (authorized) {
          this.printCourseCartolas(courseStudents);
        }
      });
    }

    // Imprimir individual
    const singleBtn = container.querySelector('#btn-print-single-cartola');
    if (singleBtn) {
      singleBtn.addEventListener('click', async () => {
        const st = storage.getStudentById(this.cartolaStudentId) || courseStudents[0];
        if (!st) return;
        const authorized = await requestStaffAuthorization({
          title: '📋 Autorización para Imprimir Cartola',
          actionLabel: `imprimir cartola de libreta de ${st.nombre_display}`
        });
        if (authorized) {
          this.printSingleCartola(st);
        }
      });
    }
  }

  generateCartolaUnitHtml(student) {
    const txs = storage.getTransactions({ estudiante_id: student.id });
    const recentPositive = txs
      .filter(t => Number(t.monto) > 0)
      .slice(0, 4);

    const rank = this.getRank(student.saldo);
    const currentDate = new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

    return `
      <div class="cartola-sheet-unit">
        <!-- Encabezado de la Cartola -->
        <table class="cartola-header-table">
          <tr>
            <td style="width: 48px; vertical-align: middle;">
              <img src="/Logo Colegual.png" style="height: 38px; object-fit: contain;" alt="Logo" />
            </td>
            <td style="vertical-align: middle; padding-left: 8px;">
              <div class="cartola-school-name">ESCUELA RURAL COLEGUAL &bull; RBD 7967</div>
              <div class="cartola-title">CARTOLA MENSUAL DE MÉRITO Y AHORRO</div>
              <div class="cartola-subtitle">ColegualCoins (CC) &bull; Período: ${currentDate.toUpperCase()}</div>
            </td>
            <td style="width: 45px; text-align: right; vertical-align: middle;">
              <img src="/emblema_colegual_circular.png" style="height: 36px; object-fit: contain;" alt="Emblema" />
            </td>
          </tr>
        </table>

        <!-- Datos del Estudiante -->
        <div class="cartola-student-info">
          <table style="width: 100%; border-collapse: collapse; font-size: 8.2pt;">
            <tr>
              <td><strong>Estudiante:</strong> ${student.nombre_display}</td>
              <td style="text-align: right;"><strong>Curso:</strong> ${student.curso}</td>
            </tr>
            <tr>
              <td><strong>Profesor(a) Jefe:</strong> ${student.profesor_jefe || 'Docente de Aula'}</td>
              <td style="text-align: right;"><strong>N° Cuenta:</strong> ${student.nro_cuenta}</td>
            </tr>
          </table>
        </div>

        <!-- Balance Financiero y Formativo -->
        <div class="cartola-balance-grid">
          <div class="cartola-balance-box">
            <span class="lbl">Saldo en Cuenta</span>
            <span class="val-gold">🪙 ${student.saldo || 0} CC</span>
          </div>
          <div class="cartola-balance-box">
            <span class="lbl">Total Ganado</span>
            <span class="val-green">+${student.total_ganado || 0} CC</span>
          </div>
          <div class="cartola-balance-box">
            <span class="lbl">Premios Canjeados</span>
            <span class="val-blue">${student.total_canjeado || 0} CC</span>
          </div>
          <div class="cartola-balance-box">
            <span class="lbl">Nivel Formativo</span>
            <span class="val-rank">${rank.icon} ${rank.title}</span>
          </div>
        </div>

        <!-- Lista de Reconocimientos Recientes -->
        <div class="cartola-tx-section">
          <div class="cartola-tx-title">🌟 Actitudes Positivas Reconocidas en el Período:</div>
          <table class="cartola-tx-table">
            <thead>
              <tr>
                <th style="width: 22%;">Fecha</th>
                <th>Conducta / Motivo del Reconocimiento</th>
                <th style="width: 16%; text-align: right;">Abono</th>
              </tr>
            </thead>
            <tbody>
              ${recentPositive.length === 0 ? `
                <tr><td colspan="3" style="text-align: center; color: #64748b; padding: 6px;">Saldo inicial de apertura activo (+10 CC).</td></tr>
              ` : recentPositive.map(t => `
                <tr>
                  <td>${t.fecha_display ? t.fecha_display.split(' ')[0] : 'Reciente'}</td>
                  <td><strong>${t.motivo}</strong></td>
                  <td style="text-align: right; color: #047857; font-weight: 800;">+${t.monto} CC</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mensaje Formativo para la Familia -->
        <div class="cartola-family-msg">
          <strong>Estimada Familia Colegualina:</strong><br>
          Las ColegualCoins reconocen el esfuerzo, la solidaridad, el compañerismo y el cuidado del entorno escolar. ¡Felicite a su hijo(a) en el hogar por sus logros y conversemos en familia sobre la importancia del respeto mutuo!
        </div>

        <!-- Línea de corte punteada -->
        <div class="cartola-cut-line">
          <span>✂️ Recortar por la línea de puntos y devolver firmado en la libreta escolar ✂️</span>
        </div>

        <!-- Talón Desprendible de Firma -->
        <div class="cartola-talon">
          <table style="width: 100%; border-collapse: collapse; font-size: 7.8pt;">
            <tr>
              <td colspan="2">
                <strong>TALÓN DE ACUSE DE RECIBO &bull; ESCUELA RURAL COLEGUAL</strong>
              </td>
              <td style="text-align: right; color: #64748b;">
                Período: ${currentDate}
              </td>
            </tr>
            <tr>
              <td style="padding-top: 4px;"><strong>Alumno:</strong> ${student.nombre_display}</td>
              <td style="padding-top: 4px;"><strong>Curso:</strong> ${student.curso}</td>
              <td style="padding-top: 4px; text-align: right;"><strong>Saldo Informado:</strong> ${student.saldo || 0} CC</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top: 10px;">
                <div style="font-size: 7.2pt; color: #64748b; margin-bottom: 2px;">Mensaje o Felicitación de los Padres para su hijo:</div>
                <div style="border-bottom: 1px dotted #94a3b8; height: 16px;"></div>
              </td>
              <td style="padding-top: 10px; width: 35%; text-align: center;">
                <div style="border-bottom: 1px solid #1e293b; width: 85%; margin: 0 auto; height: 16px;"></div>
                <div style="font-size: 6.8pt; color: #475569; margin-top: 2px;">Firma del Apoderado(a)</div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `;
  }

  printSingleCartola(student) {
    const printContainer = document.getElementById('print-cartolas-container');
    if (!printContainer) return;

    printContainer.innerHTML = `
      <div class="cartolas-print-page">
        ${this.generateCartolaUnitHtml(student)}
      </div>
    `;

    document.body.classList.add('printing-cartolas');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-cartolas');
      }, 500);
    }, 150);
  }

  printCourseCartolas(students) {
    const printContainer = document.getElementById('print-cartolas-container');
    if (!printContainer) return;

    // 2 cartolas por página impresa en papel carta/A4
    let pagesHtml = '';
    const chunkSize = 2;
    for (let i = 0; i < students.length; i += chunkSize) {
      const pair = students.slice(i, i + chunkSize);
      pagesHtml += `
        <div class="cartolas-print-page">
          ${pair.map(st => this.generateCartolaUnitHtml(st)).join('')}
        </div>
      `;
    }

    printContainer.innerHTML = pagesHtml;

    document.body.classList.add('printing-cartolas');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-cartolas');
      }, 500);
    }, 150);
  }

  getRank(saldo = 0) {
    if (saldo >= 300) return { title: 'Diamante', icon: '💎', color: '#06b6d4' };
    if (saldo >= 150) return { title: 'Oro', icon: '🥇', color: '#eab308' };
    if (saldo >= 75) return { title: 'Plata', icon: '🥈', color: '#94a3b8' };
    if (saldo >= 30) return { title: 'Bronce', icon: '🥉', color: '#d97706' };
    return { title: 'Semilla', icon: '🌱', color: '#10b981' };
  }
}
