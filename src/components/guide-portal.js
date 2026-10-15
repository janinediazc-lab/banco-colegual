/**
 * Portal Interactivo de la Guía Docente - Banco Escolar Colegual
 * Escuela Rural Colegual • Llanquihue
 * Coordinación de la Vida Escolar: Janine Díaz Calixto
 */

export class GuidePortalComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentView = 'interactive'; // 'interactive' | 'pdf'
    this.searchTerm = '';
    this.activeChapter = null; // null = all
  }

  init() {
    this.render();
  }

  setSearchTerm(term) {
    this.searchTerm = term.toLowerCase().trim();
    this.renderChapterCards();
  }

  scrollToChapter(chapterId) {
    this.currentView = 'interactive';
    this.render();
    setTimeout(() => {
      const el = document.getElementById(chapterId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.style.boxShadow = '0 0 0 3px var(--color-gold), 0 8px 20px rgba(245, 158, 11, 0.25)';
        setTimeout(() => {
          el.style.boxShadow = '';
        }, 1800);
      }
    }, 100);
  }

  toggleView(view) {
    this.currentView = view;
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="guide-portal-wrapper">
        <!-- Hero Banner Principal -->
        <div class="hero-banner" style="background: linear-gradient(135deg, #0f2b48 0%, #064e3b 100%);">
          <div class="hero-text">
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(255, 255, 255, 0.15); padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.76rem; font-weight: 700; color: #a7f3d0; margin-bottom: 0.5rem;">
              <span>📘</span> Documento Oficial • Escuela Rural Colegual
            </div>
            <h2 style="font-size: 1.65rem; line-height: 1.25; margin-bottom: 0.4rem;">
              📘 Guía Práctica para Docentes y Funcionarios
            </h2>
            <p style="font-size: 0.92rem; color: #e2e8f0; max-width: 720px; line-height: 1.45;">
              Manual pedagógico y operativo del <strong>Banco Escolar Colegual</strong> para asignación de ColegualCoins, inclusión, refuerzo positivo y articulación con las familias.
            </p>
            <div style="font-size: 0.8rem; color: #fde68a; margin-top: 0.5rem; font-weight: 700;">
              🌟 Recurso realizado por Janine Díaz Calixto — Coordinación de la Vida Escolar
            </div>
          </div>

          <div class="hero-stats" style="display: flex; flex-direction: column; gap: 0.5rem; justify-content: center;">
            <a href="./Guia_Docente_Banco_Colegual.pdf" target="_blank" download="Guia_Docente_Banco_Colegual.pdf" class="btn btn-gold" style="text-decoration: none; font-size: 0.88rem; font-weight: 800; padding: 0.55rem 1rem; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; box-shadow: var(--shadow-md);">
              <span>📥</span> Descargar PDF Oficial (6 Págs)
            </a>
            <button id="btn-toggle-guide-view" class="btn btn-secondary" style="font-size: 0.82rem; font-weight: 700; padding: 0.45rem 0.85rem; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.35);">
              <span>${this.currentView === 'pdf' ? '📖 Cambiar a Lectura Interactiva' : '📑 Ver Documento PDF Integrado'}</span>
            </button>
            <a href="./Guia_Docente_Banco_Colegual.pdf" target="_blank" class="btn btn-outline" style="font-size: 0.78rem; text-decoration: none; color: #a7f3d0; border-color: rgba(167, 243, 208, 0.4); text-align: center; padding: 0.3rem 0.6rem; border-radius: 6px;">
              🖨️ Abrir PDF para Imprimir
            </a>
          </div>
        </div>

        ${this.currentView === 'pdf' ? this.renderPdfView() : this.renderInteractiveView()}
      </div>
    `;

    this.attachEvents();
  }

  renderPdfView() {
    return `
      <div style="margin-top: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
          <button id="btn-back-to-interactive" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <span>👈</span> Volver a Guía Interactiva
          </button>
          <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">
            Mostrando: <strong>Guia_Docente_Banco_Colegual.pdf</strong> (Documento Oficial A4)
          </span>
        </div>

        <div style="background: white; border-radius: 12px; border: 1px solid var(--border-light); overflow: hidden; box-shadow: var(--shadow-md);">
          <iframe 
            src="./Guia_Docente_Banco_Colegual.pdf#toolbar=1&navpanes=0" 
            style="width: 100%; height: 850px; border: none; display: block;"
            title="Visor PDF Guía Docente">
          </iframe>
        </div>
      </div>
    `;
  }

  renderInteractiveView() {
    return `
      <!-- Barra de Navegación Rápida e Índice por Capítulos -->
      <div style="background: white; padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--border-light); margin-top: 1.25rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
          <div style="font-size: 0.88rem; font-weight: 800; color: #0f2b48; display: flex; align-items: center; gap: 0.4rem;">
            <span>📑</span> Índice Rápido de Contenidos:
          </div>
          <div class="search-input-wrapper" style="min-width: 260px; max-width: 380px; flex: 1;">
            <span class="search-icon">🔍</span>
            <input type="text" id="guide-search-input" class="search-input" placeholder="Buscar tema o palabra clave (ej: contraseñas, bonos, invisibilizados...)" value="${this.searchTerm}" />
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
          <button class="guide-nav-pill" data-target="cap-1">1. Ingreso a la Plataforma</button>
          <button class="guide-nav-pill" data-target="cap-2">2. Clave de Funcionario</button>
          <button class="guide-nav-pill" data-target="cap-3">3. 3 Formas de Premiar</button>
          <button class="guide-nav-pill" data-target="cap-4">4. Conductas y Puntos</button>
          <button class="guide-nav-pill" data-target="cap-5">5. Quitar CC (Reparatorio)</button>
          <button class="guide-nav-pill" data-target="cap-6">6. Tienda de Premios</button>
          <button class="guide-nav-pill" data-target="cap-7">7. Alumnos Invisibilizados</button>
          <button class="guide-nav-pill" data-target="cap-8">8. Diplomas Imprimibles</button>
          <button class="guide-nav-pill" data-target="cap-9">9. Cartola para Libreta</button>
          <button class="guide-nav-pill" data-target="cap-10" style="background: #fef3c7; color: #92400e; border-color: #fde68a;">10. Decálogo Docente</button>
        </div>
      </div>

      <!-- Contenedor Dinámico de Capítulos -->
      <div id="guide-chapters-container" style="margin-top: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
        ${this.getChaptersHtml()}
      </div>
    `;
  }

  getChaptersHtml() {
    const term = this.searchTerm;

    const chapters = [
      {
        id: 'cap-1',
        num: '1',
        title: '¿Cómo Ingresar a la Plataforma?',
        badge: '🌐 Conectividad y Acceso',
        badgeColor: '#dbeafe',
        textColor: '#1e40af',
        content: `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 0.75rem;">
            <div class="behavior-category-card" style="padding: 1rem; border-left: 4px solid #059669;">
              <div style="font-size: 1.35rem; margin-bottom: 0.35rem;">🌐</div>
              <strong style="color: #065f46; font-size: 0.95rem;">1. Web Oficial en la Nube (Acceso Universal)</strong>
              <p style="font-size: 0.85rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                Ingresa desde cualquier computador o notebook en tu navegador a:<br>
                <code style="font-size: 0.85rem; background: #f1f5f9; color: #0f2b48; padding: 2px 6px; border-radius: 4px; font-weight: 700;">banco-colegual.onrender.com</code>
              </p>
              <div style="font-size: 0.78rem; color: #059669; font-weight: 600; margin-top: 0.35rem;">
                ✓ Sincronización automática e indestructible en la nube.
              </div>
            </div>

            <div class="behavior-category-card" style="padding: 1rem; border-left: 4px solid #d97706;">
              <div style="font-size: 1.35rem; margin-bottom: 0.35rem;">📱</div>
              <strong style="color: #b45309; font-size: 0.95rem;">2. Teléfono Celular (App Móvil PWA)</strong>
              <p style="font-size: 0.85rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                Abre el enlace en tu celular (Chrome o Safari) y toca <em>"Agregar a pantalla de inicio"</em> o <em>"Instalar App"</em>. Se crea un ícono institucional como una App nativa.
              </p>
              <div style="font-size: 0.78rem; color: #78350f; font-weight: 600; margin-top: 0.35rem;">
                ✓ Ideal para docentes y asistentes en patios, pasillos, recreos y salidas a terreno.
              </div>
            </div>
          </div>
        `
      },
      {
        id: 'cap-2',
        num: '2',
        title: 'Activación de Funcionario Responsable y Seguridad',
        badge: '🔐 Protección de Datos',
        badgeColor: '#fef3c7',
        textColor: '#92400e',
        content: `
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            Cada docente o asistente de la educación debe activar su sesión personal para firmar y autorizar sus asignaciones de puntos:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
            <div style="background: #f8fafc; border: 1px solid var(--border-light); border-left: 3.5px solid #0f2b48; padding: 0.75rem; border-radius: 8px;">
              <strong style="font-size: 0.85rem; color: #0f2b48;">Paso 1: Selecciona tu Nombre</strong>
              <p style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
                En la barra superior, haz clic en el botón <strong>"👤 Funcionario Responsable"</strong> y selecciona tu nombre de la nómina escolar oficial.
              </p>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-light); border-left: 3.5px solid #059669; padding: 0.75rem; border-radius: 8px;">
              <strong style="font-size: 0.85rem; color: #065f46;">Paso 2: Ingresa tu Contraseña</strong>
              <p style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
                Escribe tu clave: tu <strong>primer nombre + 7967</strong> (ej: <code>Janine7967</code>, <code>Nicole7967</code>, <code>Karla7967</code>), tu RUT o el PIN maestro <code>7967</code>.
              </p>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-light); border-left: 3.5px solid #2563eb; padding: 0.75rem; border-radius: 8px;">
              <strong style="font-size: 0.85rem; color: #1e40af;">Paso 3: Verificación Visual</strong>
              <p style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
                El encabezado superior cambiará a <strong style="color: #16a34a;">🟢 Activo</strong> con tu nombre. Todas tus asignaciones quedarán registradas a tu cargo.
              </p>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-light); border-left: 3.5px solid #d97706; padding: 0.75rem; border-radius: 8px;">
              <strong style="font-size: 0.85rem; color: #b45309;">Paso 4: Cambio de Turno</strong>
              <p style="font-size: 0.8rem; color: #475569; margin-top: 0.25rem;">
                Al compartir un computador en la sala de profesores, haz clic en <em>"(Cambiar)"</em> para que el siguiente colega active su propio perfil.
              </p>
            </div>
          </div>

          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 0.85rem; margin-top: 0.85rem; font-size: 0.82rem; color: #065f46; line-height: 1.45;">
            <strong>🛡️ Privacidad Infantil Estricta:</strong> Por normativa de protección escolar a la infancia, <strong>los números de RUT de los alumnos se encuentran estrictamente ocultos</strong> en todas las pantallas de consulta, kioscos y carnets. Cada niño utiliza su <strong>N° de Cuenta Escolar Oficial</strong> (ej: <code>7967-1B-4521-0001</code>).
          </div>
        `
      },
      {
        id: 'cap-3',
        num: '3',
        title: 'Las 3 Formas de Entregar Puntos',
        badge: '⚡ Metodología de Entrega',
        badgeColor: '#dcfce7',
        textColor: '#15803d',
        content: `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem; margin-top: 0.5rem;">
            <div style="background: white; border: 1px solid var(--border-light); border-top: 4px solid #059669; border-radius: 10px; padding: 1rem; box-shadow: var(--shadow-sm);">
              <div style="font-size: 1.35rem; margin-bottom: 0.25rem;">👤</div>
              <strong style="color: #065f46; font-size: 0.92rem;">1. Alumno Individual</strong>
              <p style="font-size: 0.82rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                Filtra por curso o escribe el nombre del estudiante en el buscador. Presiona <strong>"➕ Abonar CC"</strong> en su tarjeta, elige la conducta positiva observada y confirma.
              </p>
            </div>

            <div style="background: white; border: 1px solid var(--border-light); border-top: 4px solid #2563eb; border-radius: 10px; padding: 1rem; box-shadow: var(--shadow-sm);">
              <div style="font-size: 1.35rem; margin-bottom: 0.25rem;">👥</div>
              <strong style="color: #1e40af; font-size: 0.92rem;">2. Bono a Todo el Curso</strong>
              <p style="font-size: 0.82rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                Para premiar el esfuerzo colectivo, orden de la sala, respeto o trabajo grupal en clases. Presiona <strong>"🎁 Bono a Curso"</strong>: todos los alumnos matriculados reciben el puntaje en simultáneo con lluvia de confeti.
              </p>
            </div>

            <div style="background: white; border: 1px solid var(--border-light); border-top: 4px solid #d97706; border-radius: 10px; padding: 1rem; box-shadow: var(--shadow-sm);">
              <div style="font-size: 1.35rem; margin-bottom: 0.25rem;">📷</div>
              <strong style="color: #b45309; font-size: 0.92rem;">3. Escáner QR (Cámara de Celular)</strong>
              <p style="font-size: 0.82rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                Abre la pestaña <strong>"Escanear Tarjeta QR"</strong> en tu celular y enfoca el carnet del estudiante. En 1 segundo se reconoce su cuenta con un sonido y permite abonar puntos al instante en el patio o pasillo.
              </p>
            </div>
          </div>
        `
      },
      {
        id: 'cap-4',
        num: '4',
        title: 'Categorías Oficiales y Conductas Observables',
        badge: '⭐ Pauta Pedagógica',
        badgeColor: '#ecfdf5',
        textColor: '#047857',
        content: `
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            Criterios estandarizados para que todos los funcionarios reconozcan el mérito con coherencia formativa:
          </p>

          <div style="overflow-x: auto;">
            <table class="table-data" style="margin: 0; background: white; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-light);">
              <thead>
                <tr>
                  <th style="padding: 0.6rem 0.85rem;">Categoría Formativa</th>
                  <th style="padding: 0.6rem 0.85rem; width: 120px;">Puntos Sugeridos</th>
                  <th style="padding: 0.6rem 0.85rem;">Conductas Observables en Aula, Patio y Entorno</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">🌟 Buena Convivencia y Respeto</td>
                  <td><span class="badge badge-green">+5 o +10 CC</span></td>
                  <td>Trato cordial con compañeros y tíos/as, saludar amablemente, resolver diferencias dialogando, respetar turnos de palabra.</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">📚 Esfuerzo Académico y Tareas</td>
                  <td><span class="badge badge-green">+5 o +10 CC</span></td>
                  <td>Superación personal, perseverancia frente a dificultades, traer cuadernos al día, participación constructiva en clases.</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">🤝 Solidaridad y Compañerismo</td>
                  <td><span class="badge badge-green">+5 o +10 CC</span></td>
                  <td>Ayudar a un compañero con dudas, compartir materiales escolares, acoger a quien esté jugando solo en el recreo.</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">♻️ Cuidado del Medio Ambiente</td>
                  <td><span class="badge badge-green">+5 o +10 CC</span></td>
                  <td>Mantener la sala impecable, recoger papeles en el patio, cuidar plantas, huerto escolar y no desperdiciar el agua.</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">⏱️ Puntualidad y Asistencia</td>
                  <td><span class="badge badge-green">+5 o +10 CC</span></td>
                  <td>Llegar a la hora a la sala tras el toque de campana, asistencia continua y preparación a tiempo de sus materiales.</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">⚽ Deporte y Recreo Entretenido</td>
                  <td><span class="badge badge-green">+5 o +10 CC</span></td>
                  <td>Juego limpio, compartir la cancha deportiva con otros cursos, cuidar balones y juegos de mesa institucionales.</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">🎭 Arte, Cultura y Participación</td>
                  <td><span class="badge badge-green">+5 o +10 CC</span></td>
                  <td>Participar con entusiasmo en actos cívicos, exposiciones, bailes folclóricos, efemérides y aniversarios de la escuela.</td>
                </tr>
                <tr>
                  <td style="font-weight: 700; color: #064e3b;">🎁 Reconocimiento Especial Docente</td>
                  <td><span class="badge badge-gold">Monto Libre</span></td>
                  <td>Acciones excepcionales de valor civil, honestidad (devolver objetos perdidos) o progreso individual notable con motivo personalizado.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.85rem; margin-top: 0.85rem; font-size: 0.82rem; color: #92400e; line-height: 1.45;">
            <strong>💬 Clave Metodológica — El Refuerzo con Sentido:</strong> Para que el estímulo genere aprendizaje duradero, <strong>comunica verbalmente el motivo al estudiante</strong>: <em>"Te felicito, hoy ganaste 10 CC por tu gran solidaridad al explicarle el ejercicio a tu compañero"</em>. El niño debe asociar el mérito a su esfuerzo personal y no al azar.
          </div>
        `
      },
      {
        id: 'cap-5',
        num: '5',
        title: 'La Opción de Quitar CC (Carácter Reparatorio)',
        badge: '⚖️ Criterio Formativo',
        badgeColor: '#fee2e2',
        textColor: '#b91c1c',
        content: `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem;">
            <div style="background: white; border: 1px solid var(--border-light); border-left: 4px solid #ef4444; border-radius: 8px; padding: 1rem;">
              <strong style="color: #b91c1c; font-size: 0.92rem;">⚠️ ¿Cuándo aplicar una deducción?</strong>
              <p style="font-size: 0.82rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                El descuento formativo es una <strong>consecuencia reparatoria</strong> ante faltas reiteradas o daños a la convivencia y al entorno:
              </p>
              <ul style="font-size: 0.8rem; margin: 0.4rem 0 0 1.2rem; color: #475569; line-height: 1.4;">
                <li>Faltas reiteradas al respeto entre compañeros (-10 CC).</li>
                <li>Daño deliberado o descuido de mobiliario escolar (-10 CC).</li>
                <li>Incumplimiento de normas en furgones de transporte (-10 CC).</li>
                <li>Desorden persistente tras acuerdos de aula previos (-5 CC).</li>
              </ul>
            </div>

            <div style="background: white; border: 1px solid var(--border-light); border-left: 4px solid #0f2b48; border-radius: 8px; padding: 1rem;">
              <strong style="color: #0f2b48; font-size: 0.92rem;">🛡️ Principios Institucionales de Protección:</strong>
              <ul style="font-size: 0.82rem; margin: 0.4rem 0 0 1.2rem; color: #334155; line-height: 1.45;">
                <li><strong>Protección en Saldo Cero (0 CC):</strong> El sistema nunca permite saldos negativos; si un alumno tiene 5 CC y se descuentan 10 CC, su saldo queda protegido en 0 CC para evitar desmotivación extrema.</li>
                <li><strong>Diálogo y Reflexión Previa:</strong> No descuentes en caliente; conversa con el alumno sobre cómo reparar la falta.</li>
                <li><strong>Transparencia Auditada:</strong> El descuento queda registrado con fecha, motivo y nombre del docente responsable.</li>
              </ul>
            </div>
          </div>
        `
      },
      {
        id: 'cap-6',
        num: '6',
        title: 'La Tienda Escolar y Canje de Recompensas',
        badge: '🎁 Premios y Privilegios',
        badgeColor: '#f3e8ff',
        textColor: '#6b21a8',
        content: `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem;">
            <div style="background: white; border: 1px solid var(--border-light); border-radius: 8px; padding: 1rem; border-top: 3.5px solid #059669;">
              <strong style="color: #065f46; font-size: 0.92rem;">👑 Privilegios y Recompensas Simbólicas</strong>
              <p style="font-size: 0.82rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                Son las más valoradas por los alumnos y refuerzan su autonomía:<br>
                &bull; <strong>Ayudante del Profesor (15 CC):</strong> Ser colaborador oficial del docente en la jornada.<br>
                &bull; <strong>Elección de Asiento (25 CC):</strong> Escoger puesto preferido en la sala por 1 semana.<br>
                &bull; <strong>Capitán de Recreo (20 CC):</strong> Escoger el juego colectivo en el patio.<br>
                &bull; <strong>Tiempo Libre de Lectura (10 CC):</strong> 15 minutos en el rincón de biblioteca.
              </p>
            </div>

            <div style="background: white; border: 1px solid var(--border-light); border-radius: 8px; padding: 1rem; border-top: 3.5px solid #2563eb;">
              <strong style="color: #1e40af; font-size: 0.92rem;">🎁 Recompensas Tangibles y Reconocimientos</strong>
              <p style="font-size: 0.82rem; color: #475569; margin-top: 0.35rem; line-height: 1.45;">
                Estímulos gestionados por la escuela:<br>
                &bull; <strong>Stickers Conmemorativos Colegual (10 CC):</strong> Emblemas coleccionables.<br>
                &bull; <strong>Útiles Escolares Especiales (20 CC):</strong> Lápices decorativos, destacadores o gomas.<br>
                &bull; <strong>Diploma de Mérito y Honor (30 CC):</strong> Reconocimiento oficial entregado en formación escolar frente a toda la escuela.
              </p>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.85rem; font-size: 0.82rem; color: #334155; line-height: 1.45;">
            <strong>Paso a paso para ejecutar un canje:</strong> El estudiante revisa su saldo en el Kiosco ATM &bull; Solicita el canje al profesor en la pestaña "Tienda" &bull; El sistema solicita la clave de funcionario para autorizar &bull; El saldo se descuenta automáticamente y se entrega el incentivo.
          </div>
        `
      },
      {
        id: 'cap-7',
        num: '7',
        title: 'Alerta de Alumnos "Invisibilizados" (Inclusión Real)',
        badge: '🔔 Equidad Escolar',
        badgeColor: '#fef3c7',
        textColor: '#b45309',
        content: `
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 1.25rem;">
            <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
              <div style="font-size: 2.2rem; line-height: 1;">🔔</div>
              <div>
                <h4 style="color: #92400e; font-size: 1rem; margin-bottom: 0.35rem; font-weight: 800;">
                  ¿Qué detecta esta herramienta inteligente?
                </h4>
                <p style="font-size: 0.85rem; color: #78350f; line-height: 1.5;">
                  En toda comunidad escolar existen alumnos muy participativos que captan la atención rápidamente, mientras otros estudiantes tímidos o silenciosos rara vez reciben felicitaciones, aunque tengan excelente conducta y cumplan con todas sus responsabilidades.
                  <br><br>
                  El sistema analiza automáticamente las cuentas y <strong>alerta al profesor jefe sobre aquellos estudiantes que llevan más de 7 o 14 días sin recibir ningún refuerzo positivo</strong>. El objetivo no es regalar puntos, sino recordar al equipo docente la importancia de observar y valorar los talentos discretos de cada niña y niño.
                </p>
              </div>
            </div>
          </div>
        `
      },
      {
        id: 'cap-8',
        num: '8',
        title: 'Generador de Diplomas Imprimibles',
        badge: '🎓 Certificación Oficial',
        badgeColor: '#dbeafe',
        textColor: '#1d4ed8',
        content: `
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            Reconocimientos físicos en alta resolución con el escudo oficial de la Escuela Rural Colegual:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem;">
            <div style="background: white; border: 1px solid var(--border-light); border-left: 3.5px solid #2563eb; border-radius: 8px; padding: 0.85rem;">
              <strong style="color: #1e40af; font-size: 0.88rem;">📜 ¿Cómo emitir un Diploma?</strong>
              <ol style="font-size: 0.8rem; margin: 0.35rem 0 0 1.2rem; color: #1e3a8a; line-height: 1.45;">
                <li>Entra a la pestaña <strong>"Diplomas y Reportes"</strong>.</li>
                <li>Selecciona al alumno y el mérito: <em>"Mejor Compañero", "Superación Personal", "Espíritu Colegual"</em>, etc.</li>
                <li>Presiona <strong>"🖨️ Imprimir Diploma"</strong>: se genera el documento listo en tamaño carta/A4 con fecha y firma.</li>
              </ol>
            </div>

            <div style="background: white; border: 1px solid var(--border-light); border-left: 3.5px solid #059669; border-radius: 8px; padding: 0.85rem;">
              <strong style="color: #065f46; font-size: 0.88rem;">🎉 Momentos sugeridos de entrega:</strong>
              <ul style="font-size: 0.8rem; margin: 0.35rem 0 0 1.2rem; color: #065f46; line-height: 1.45;">
                <li>Actos cívicos de los días lunes frente a toda la comunidad.</li>
                <li>Cierre de bimestres o proyectos pedagógicos.</li>
                <li>En reuniones de apoderados (reconocimiento frente a su familia).</li>
                <li>Espontáneamente en la sala de clases frente a sus pares.</li>
              </ul>
            </div>
          </div>
        `
      },
      {
        id: 'cap-9',
        num: '9',
        title: 'Cartola Mensual para la Libreta de Comunicaciones',
        badge: '🏡 Alianza con Familias',
        badgeColor: '#ecfdf5',
        textColor: '#047857',
        content: `
          <div style="background: #f0fdf4; border: 1.5px dashed #059669; border-radius: 10px; padding: 1.25rem;">
            <h4 style="color: #065f46; font-size: 0.95rem; margin-bottom: 0.35rem; font-weight: 800;">
              📋 Reporte Formativo Recortable para Apoderados
            </h4>
            <p style="font-size: 0.85rem; color: #064e3b; line-height: 1.45;">
              A fin de mes, el profesor jefe puede emitir la <strong>Cartola Mensual para Libreta</strong> desde la pestaña <em>"Diplomas y Reportes"</em>. Este informe viene dimensionado para el tamaño exacto de la libreta escolar e incluye:
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-top: 0.75rem;">
              <div style="background: white; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.6rem; font-size: 0.78rem; color: #166534;">
                <strong>💰 Balance de Cuenta:</strong> Saldo actual, total de puntos ganados y canjes realizados en el periodo.
              </div>
              <div style="background: white; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.6rem; font-size: 0.78rem; color: #166534;">
                <strong>🌟 Méritos Destacados:</strong> Detalle de las conductas positivas reconocidas por cada docente y asistente.
              </div>
              <div style="background: white; border: 1px solid #bbf7d0; border-radius: 6px; padding: 0.6rem; font-size: 0.78rem; color: #166534;">
                <strong>✍️ Talón de Firma:</strong> Espacio para que el apoderado firme felicitando el compromiso escolar de su hijo.
              </div>
            </div>
          </div>
        `
      },
      {
        id: 'cap-10',
        num: '10',
        title: 'Decálogo del Docente Banco Colegual',
        badge: '☀️ 10 Principios de Oro',
        badgeColor: '#fef3c7',
        textColor: '#92400e',
        content: `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 0.85rem;">
            <div style="background: white; border: 1px solid var(--border-light); border-left: 4px solid #059669; border-radius: 8px; padding: 1rem; font-size: 0.83rem; color: #334155; line-height: 1.5;">
              <p><strong>1. ⚡ Refuerzo Oportuno:</strong> Reconoce la buena acción en el momento preciso; el impacto formativo es inmediato y duradero.</p>
              <p style="margin-top: 0.6rem;"><strong>2. 🎯 Sé Concreto y Específico:</strong> Explica con claridad qué actitud o conducta motivó las ColegualCoins otorgadas.</p>
              <p style="margin-top: 0.6rem;"><strong>3. 🌱 Premia la Superación Personal:</strong> Valora el esfuerzo continuo y la perseverancia con el mismo entusiasmo que la excelencia.</p>
              <p style="margin-top: 0.6rem;"><strong>4. 🤝 Cohesión Grupal y Bonos de Curso:</strong> Utiliza los reconocimientos colectivos para fomentar la colaboración y el compañerismo.</p>
              <p style="margin-top: 0.6rem;"><strong>5. 🌈 Equidad y Foco Inclusivo:</strong> Asegúrate de que todos los niños del curso reciban reconocimientos periódicos.</p>
            </div>

            <div style="background: white; border: 1px solid var(--border-light); border-left: 4px solid #0f2b48; border-radius: 8px; padding: 1rem; font-size: 0.83rem; color: #334155; line-height: 1.5;">
              <p><strong>6. 🕊️ Carácter Reparatorio y Reflexivo:</strong> Si descuentas puntos, que sea reflexivo y formativo, nunca punitivo ni humillante.</p>
              <p style="margin-top: 0.6rem;"><strong>7. 🔐 Resguardo de Contraseñas:</strong> Protege tu clave personal de funcionario; jamás delegues la administración de cuentas.</p>
              <p style="margin-top: 0.6rem;"><strong>8. 🏫 Comunidad Educativa Activa:</strong> Docentes y asistentes comparten la misma facultad para premiar en aula y patios.</p>
              <p style="margin-top: 0.6rem;"><strong>9. 🏡 Alianza con las Familias:</strong> Comparte las cartolas de mérito como puente de orgullo y motivación en el hogar.</p>
              <p style="margin-top: 0.6rem;"><strong>10. ☀️ Clima Escolar Cálido y Feliz:</strong> El Banco Colegual es un juego formativo para construir una escuela rural protectora y acogedora.</p>
            </div>
          </div>
        `
      }
    ];

    let filtered = chapters;
    if (term) {
      filtered = chapters.filter(c => 
        c.title.toLowerCase().includes(term) ||
        c.content.toLowerCase().includes(term) ||
        c.badge.toLowerCase().includes(term)
      );
    }

    if (filtered.length === 0) {
      return `
        <div style="background: white; padding: 3rem 1.5rem; border-radius: 12px; text-align: center; border: 1px solid var(--border-light); color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 0.35rem;">No se encontraron resultados para "${this.searchTerm}"</h3>
          <p style="font-size: 0.85rem;">Prueba con términos como <em>contraseñas, invisibilizados, tienda, escáner, cartola o decálogo</em>.</p>
          <button id="btn-clear-search" class="btn btn-secondary btn-sm" style="margin-top: 0.85rem;">Limpiar Búsqueda</button>
        </div>
      `;
    }

    return filtered.map(c => `
      <section id="${c.id}" class="guide-chapter-card" style="background: white; border-radius: 12px; border: 1px solid var(--border-light); padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm); scroll-margin-top: 100px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.6rem;">
          <h3 style="font-size: 1.18rem; font-weight: 800; color: #0f2b48; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <span style="background: #0f2b48; color: white; border-radius: 6px; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.82rem;">${c.num}</span>
            <span>${c.title}</span>
          </h3>
          <span style="background: ${c.badgeColor}; color: ${c.textColor}; padding: 0.22rem 0.65rem; border-radius: 99px; font-size: 0.75rem; font-weight: 800;">
            ${c.badge}
          </span>
        </div>
        <div>
          ${c.content}
        </div>
      </section>
    `).join('') + `
      <!-- Tarjeta Institucional de Soporte y Coordinación -->
      <div style="background: linear-gradient(135deg, #0f2b48 0%, #1e3a8a 100%); color: #ffffff; padding: 1.25rem 1.5rem; border-radius: 12px; margin-top: 0.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong style="color: #38bdf8; font-size: 1.05rem;">Coordinación y Soporte de Convivencia Escolar</strong>
          <p style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.45; margin-top: 0.35rem;">
            Para dudas pedagógicas, inducción a nuevos funcionarios o consultas del sistema:<br>
            <strong>Janine Díaz Calixto</strong> — Coordinación de la Vida Escolar<br>
            📧 <em>janine.diaz@slepllanquihue.cl</em> &bull; 🏫 Escuela Rural Colegual (RBD 7967, Comuna de Llanquihue)
          </p>
        </div>
        <div>
          <a href="./Guia_Docente_Banco_Colegual.pdf" download="Guia_Docente_Banco_Colegual.pdf" class="btn btn-gold" style="text-decoration: none; font-size: 0.85rem; font-weight: 800; padding: 0.5rem 0.95rem; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.4rem;">
            <span>📥</span> Descargar PDF Completo
          </a>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const toggleBtn = document.getElementById('btn-toggle-guide-view');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleView(this.currentView === 'interactive' ? 'pdf' : 'interactive');
      });
    }

    const backBtn = document.getElementById('btn-back-to-interactive');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.toggleView('interactive');
      });
    }

    const searchInput = document.getElementById('guide-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setSearchTerm(e.target.value);
      });
    }

    const clearSearchBtn = document.getElementById('btn-clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        this.searchTerm = '';
        this.render();
      });
    }

    const pills = this.container.querySelectorAll('.guide-nav-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.target;
        if (targetId) {
          this.scrollToChapter(targetId);
        }
      });
    });
  }

  renderChapterCards() {
    const container = document.getElementById('guide-chapters-container');
    if (container) {
      container.innerHTML = this.getChaptersHtml();
      const clearSearchBtn = document.getElementById('btn-clear-search');
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          this.searchTerm = '';
          const searchInput = document.getElementById('guide-search-input');
          if (searchInput) searchInput.value = '';
          this.renderChapterCards();
        });
      }
    }
  }
}
