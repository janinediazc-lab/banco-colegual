import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export class StudentPortalComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStudent = null;
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="kiosk-wrapper">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <img src="/Logo Colegual.png" alt="Logo Colegual" style="height: 52px; margin-bottom: 0.5rem; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));" />
          <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800; color: #fef08a;">
            🏧 Cajero Automático Banco Colegual
          </h2>
          <p style="font-size: 0.92rem; color: #cbd5e1;">
            Consulta tu saldo de puntos de conducta y revisa tu libreta de ahorro escolar.
          </p>
        </div>

        <div id="kiosk-login-area">
          <div style="background: rgba(255,255,255,0.08); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.15);">
            <label class="form-label" style="color: #f8fafc; font-size: 0.95rem; margin-bottom: 0.5rem; display: block;">
              Ingresa tu RUN o selecciona tu nombre:
            </label>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
              <input type="text" id="kiosk-run-input" class="form-input" placeholder="Ej: 27200432-3 o solo números..." style="font-size: 1.1rem; padding: 0.75rem 1rem;" />
              <button id="btn-kiosk-lookup" class="btn btn-gold btn-lg">
                Consultar Saldo
              </button>
            </div>

            <div style="text-align: center; color: #94a3b8; font-size: 0.85rem; margin: 0.5rem 0;">— o selecciona de la lista —</div>

            <select id="kiosk-student-dropdown" class="form-select" style="background: #1e293b; color: white; border-color: #475569;">
              <option value="">Selecciona tu nombre y curso...</option>
              ${storage.getStudents().map(s => `<option value="${s.run}">${s.nombre_display} (${s.curso})</option>`).join('')}
            </select>
          </div>
        </div>

        <div id="kiosk-screen-result" style="display: none;">
          <!-- Pantalla del cajero con saldo renderizada dinámicamente -->
        </div>
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    const runInput = this.container.querySelector('#kiosk-run-input');
    const lookupBtn = this.container.querySelector('#btn-kiosk-lookup');
    const dropdown = this.container.querySelector('#kiosk-student-dropdown');

    const doLookup = (val) => {
      const student = storage.getStudentByRun(val);
      if (student) {
        this.currentStudent = student;
        sound.playScan();
        this.renderKioskResult(student);
      } else {
        sound.playError();
        alert('Estudiante no encontrado. Verifica el RUN ingresado.');
      }
    };

    lookupBtn.addEventListener('click', () => {
      if (runInput.value.trim()) doLookup(runInput.value.trim());
    });

    runInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && runInput.value.trim()) {
        doLookup(runInput.value.trim());
      }
    });

    dropdown.addEventListener('change', () => {
      if (dropdown.value) doLookup(dropdown.value);
    });
  }

  getRankProgress(saldo = 0) {
    if (saldo >= 300) return { title: 'Diamante', icon: '💎', next: 500, percent: 100 };
    if (saldo >= 150) return { title: 'Oro', icon: '🥇', next: 300, percent: Math.round(((saldo - 150) / 150) * 100) };
    if (saldo >= 75) return { title: 'Plata', icon: '🥈', next: 150, percent: Math.round(((saldo - 75) / 75) * 100) };
    if (saldo >= 30) return { title: 'Bronce', icon: '🥉', next: 75, percent: Math.round(((saldo - 30) / 45) * 100) };
    return { title: 'Semilla', icon: '🌱', next: 30, percent: Math.round((saldo / 30) * 100) };
  }

  renderKioskResult(student) {
    const loginArea = this.container.querySelector('#kiosk-login-area');
    const resultArea = this.container.querySelector('#kiosk-screen-result');
    const rankInfo = this.getRankProgress(student.saldo);
    const txs = storage.getTransactions({ estudiante_id: student.id }).slice(0, 5);

    loginArea.style.display = 'none';
    resultArea.style.display = 'block';

    resultArea.innerHTML = `
      <div class="kiosk-atm-screen">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 1rem; margin-bottom: 1rem;">
          <div>
            <span style="font-size: 0.75rem; color: #a7f3d0; text-transform: uppercase; letter-spacing: 0.05em;">ESTADO DE CUENTA BANCARIA</span>
            <h3 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: #ffffff;">
              ¡Hola, ${student.nombre_display}! 👋
            </h3>
            <p style="font-size: 0.85rem; color: #d1fae5;">${student.curso} • Cuenta: ${student.nro_cuenta}</p>
          </div>
          <button id="btn-kiosk-exit" class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.15); color: white; border: none;">
            🚪 Salir / Nueva Consulta
          </button>
        </div>

        <!-- Pantalla de Saldo Gigante -->
        <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: var(--radius-lg); text-align: center; margin-bottom: 1.25rem;">
          <span style="font-size: 0.82rem; text-transform: uppercase; color: #fef08a; font-weight: 700; letter-spacing: 0.05em;">
            Tu Saldo de ColegualCoins Disponibles:
          </span>
          <div style="font-family: var(--font-heading); font-size: 3.2rem; font-weight: 800; color: #fef08a; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 0.25rem 0;">
            <span>🪙</span>
            <span>${student.saldo || 0}</span>
            <span style="font-size: 1.2rem; color: #a7f3d0; font-weight: 700;">ColegualCoins</span>
          </div>

          <!-- Barra de Rango -->
          <div style="max-width: 400px; margin: 0.75rem auto 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.35rem;">
              <span>Rango Actual: <strong>${rankInfo.icon} ${rankInfo.title}</strong></span>
              <span>Siguiente meta: ${rankInfo.next} CC</span>
            </div>
            <div style="background: rgba(255,255,255,0.2); height: 10px; border-radius: var(--radius-full); overflow: hidden;">
              <div style="background: linear-gradient(90deg, #10b981, #f59e0b); height: 100%; width: ${Math.min(100, rankInfo.percent)}%;"></div>
            </div>
          </div>
        </div>

        <!-- Últimos 5 Movimientos -->
        <h4 style="font-family: var(--font-heading); font-size: 1rem; color: #a7f3d0; margin-bottom: 0.5rem;">
          Últimos Movimientos en tu Cuenta:
        </h4>
        <div style="background: rgba(0,0,0,0.2); border-radius: var(--radius-md); overflow: hidden; font-size: 0.85rem; margin-bottom: 1.25rem;">
          ${txs.length === 0 ? `
            <p style="padding: 1rem; text-align: center; color: #94a3b8;">Aún no tienes movimientos.</p>
          ` : txs.map(t => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div>
                <span style="display: block; font-weight: 700; color: #ffffff;">${t.motivo}</span>
                <span style="font-size: 0.72rem; color: #94a3b8;">${t.fecha_display} • ${t.profesor}</span>
              </div>
              <div style="font-weight: 800; font-family: var(--font-heading); font-size: 1.05rem; color: ${t.monto > 0 ? '#34d399' : '#f87171'};">
                ${t.monto > 0 ? `+${t.monto}` : t.monto} CC
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-kiosk-print-receipt" class="btn btn-gold btn-lg" style="flex: 1;">
            🧾 Imprimir Comprobante de Saldo
          </button>
        </div>
      </div>
    `;

    resultArea.querySelector('#btn-kiosk-exit').addEventListener('click', () => {
      loginArea.style.display = 'block';
      resultArea.style.display = 'none';
      this.currentStudent = null;
    });

    resultArea.querySelector('#btn-kiosk-print-receipt').addEventListener('click', () => {
      this.printReceipt(student);
    });
  }

  printReceipt(student) {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const rankInfo = this.getRankProgress(student.saldo);
    const now = new Date().toLocaleString('es-CL');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante Banco Colegual - ${student.nombre_display}</title>
        <style>
          body { font-family: monospace; padding: 20px; font-size: 12px; line-height: 1.4; color: #000; }
          .center { text-align: center; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .bold { font-weight: bold; }
          .big { font-size: 18px; font-weight: bold; }
          .flex { display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="bold" style="font-size: 14px;">BANCO ESCOLAR COLEGUAL</div>
          <div>Escuela Rural Colegual - Llanquihue</div>
          <div>Código SIGE: 7967</div>
        </div>
        <div class="line"></div>
        <div>FECHA: ${now}</div>
        <div>TERMINAL: KIOSCO 01</div>
        <div class="line"></div>
        <div class="bold">DATOS DEL ESTUDIANTE:</div>
        <div>TITULAR: ${student.nombre_display}</div>
        <div>RUN: ${student.run}</div>
        <div>CURSO: ${student.curso}</div>
        <div>CUENTA: ${student.nro_cuenta}</div>
        <div class="line"></div>
        <div class="center">
          <div>SALDO TOTAL DISPONIBLE:</div>
          <div class="big">${student.saldo} COLEQUALCOINS (CC)</div>
          <div>NIVEL: ${rankInfo.icon} ${rankInfo.title}</div>
        </div>
        <div class="line"></div>
        <div class="center" style="font-size: 10px;">
          "El esfuerzo, el respeto y la buena convivencia construyen tu futuro."<br><br>
          ¡Sigue acumulando ColegualCoins en el Banco Colegual!
        </div>
        <script>
          setTimeout(() => { window.print(); }, 400);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
