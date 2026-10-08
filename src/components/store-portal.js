import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

export class StorePortalComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.rewards = [];
    this.selectedReward = null;
  }

  init() {
    this.rewards = storage.getRewards();
    this.render();

    storage.subscribe((event) => {
      if (['REWARDS_UPDATED', 'DATA_RESET'].includes(event)) {
        this.rewards = storage.getRewards();
        this.renderRewardsGrid();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="hero-banner" style="background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #064e3b 100%);">
        <div class="hero-text">
          <h2>🎁 Tienda de Recompensas y Canjes</h2>
          <p>Los estudiantes pueden canjear sus ColegualCoins (CC) por reconocimientos, privilegios escolares y premios especiales.</p>
        </div>
        <div>
          <button id="btn-new-reward" class="btn btn-gold">
            ➕ Crear Nueva Recompensa
          </button>
        </div>
      </div>

      <div class="students-grid" id="rewards-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        <!-- Recompensas renderizadas aquí -->
      </div>

      <!-- Modal Canjear Recompensa -->
      <div class="modal-overlay" id="modal-redeem">
        <div class="modal-container">
          <div class="modal-header">
            <h3>🎁 Canjear Recompensa</h3>
            <button class="modal-close" id="btn-close-redeem">&times;</button>
          </div>
          <div class="modal-body" id="modal-redeem-body">
            <!-- Contenido dinámico -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-redeem">Cancelar</button>
            <button class="btn btn-primary" id="btn-confirm-redeem">Confirmar Canje ✨</button>
          </div>
        </div>
      </div>

      <!-- Modal Nueva Recompensa -->
      <div class="modal-overlay" id="modal-create-reward">
        <div class="modal-container">
          <div class="modal-header">
            <h3>➕ Nueva Recompensa para la Tienda</h3>
            <button class="modal-close" id="btn-close-create-reward">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre del Premio / Privilegio:</label>
              <input type="text" id="new-rew-name" class="form-input" placeholder="Ej: Elegir juego del recreo..." required />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label class="form-label">Costo en ColegualCoins (CC):</label>
                <input type="number" id="new-rew-points" class="form-input" value="30" min="5" max="500" />
              </div>
              <div class="form-group">
                <label class="form-label">Ícono Emoji:</label>
                <input type="text" id="new-rew-icon" class="form-input" value="🎁" maxlength="4" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Categoría:</label>
              <select id="new-rew-cat" class="form-select">
                <option value="Privilegio de Clase">Privilegio de Clase</option>
                <option value="Recreativo">Recreativo</option>
                <option value="Premio Físico">Premio Físico</option>
                <option value="Reconocimiento">Reconocimiento</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Descripción:</label>
              <textarea id="new-rew-desc" class="form-textarea" rows="2" placeholder="Detalle de en qué consiste este premio..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-create-reward">Cancelar</button>
            <button class="btn btn-primary" id="btn-save-new-reward">Guardar Recompensa</button>
          </div>
        </div>
      </div>
    `;

    this.setupEvents();
    this.renderRewardsGrid();
  }

  setupEvents() {
    this.container.querySelector('#btn-new-reward').addEventListener('click', () => {
      this.container.querySelector('#modal-create-reward').classList.add('open');
    });

    this.container.querySelector('#btn-close-create-reward').addEventListener('click', () => {
      this.container.querySelector('#modal-create-reward').classList.remove('open');
    });
    this.container.querySelector('#btn-cancel-create-reward').addEventListener('click', () => {
      this.container.querySelector('#modal-create-reward').classList.remove('open');
    });

    this.container.querySelector('#btn-save-new-reward').addEventListener('click', () => {
      const name = this.container.querySelector('#new-rew-name').value.trim();
      const points = parseInt(this.container.querySelector('#new-rew-points').value, 10) || 30;
      const icon = this.container.querySelector('#new-rew-icon').value.trim() || '🎁';
      const cat = this.container.querySelector('#new-rew-cat').value;
      const desc = this.container.querySelector('#new-rew-desc').value.trim();

      if (!name) {
        alert('Por favor ingresa un nombre para la recompensa.');
        return;
      }

      storage.saveReward({
        nombre: name,
        puntos: points,
        icono: icon,
        categoria: cat,
        descripcion: desc
      });

      this.container.querySelector('#modal-create-reward').classList.remove('open');
      this.renderRewardsGrid();
    });

    this.container.querySelector('#btn-close-redeem').addEventListener('click', () => {
      this.container.querySelector('#modal-redeem').classList.remove('open');
    });
    this.container.querySelector('#btn-cancel-redeem').addEventListener('click', () => {
      this.container.querySelector('#modal-redeem').classList.remove('open');
    });
  }

  renderRewardsGrid() {
    const grid = this.container.querySelector('#rewards-grid');
    const rewards = storage.getRewards();

    grid.innerHTML = rewards.map(reward => `
      <div class="student-card" style="border-top: 4px solid var(--color-primary);">
        <div style="display: flex; align-items: flex-start; gap: 0.85rem;">
          <div style="font-size: 2.2rem; line-height: 1; background: var(--bg-card-subtle); padding: 0.5rem; border-radius: var(--radius-md);">
            ${reward.icono}
          </div>
          <div style="flex: 1;">
            <span style="font-size: 0.72rem; color: var(--color-accent-blue); font-weight: 700; text-transform: uppercase;">
              ${reward.categoria || 'Recompensa'}
            </span>
            <h4 style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: var(--text-main); line-height: 1.2; margin: 0.2rem 0;">
              ${reward.nombre}
            </h4>
          </div>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-muted); min-height: 2.4rem;">
          ${reward.descripcion}
        </p>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card-subtle); padding: 0.5rem 0.85rem; border-radius: var(--radius-sm);">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Precio de Canje</span>
          <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #b45309;">
            🪙 ${reward.puntos} CC
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary btn-sm btn-redeem-action" data-id="${reward.id}" style="flex: 1;">
            🎁 Canjear Premio
          </button>
          <button class="btn btn-secondary btn-sm btn-delete-reward" data-id="${reward.id}" title="Eliminar recompensa">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    // Eventos de canjear
    grid.querySelectorAll('.btn-redeem-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rewId = e.currentTarget.dataset.id;
        this.openRedeemModal(rewId);
      });
    });

    // Eventos de eliminar
    grid.querySelectorAll('.btn-delete-reward').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rewId = e.currentTarget.dataset.id;
        if (confirm('¿Eliminar esta recompensa de la tienda?')) {
          storage.deleteReward(rewId);
          this.renderRewardsGrid();
        }
      });
    });
  }

  openRedeemModal(rewardId) {
    const rewards = storage.getRewards();
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    this.selectedReward = reward;
    const allStudents = storage.getStudents().filter(s => !s.retirado);

    const body = this.container.querySelector('#modal-redeem-body');
    body.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; background: #fef3c7; padding: 1rem; border-radius: var(--radius-md); border: 1px solid #fde68a;">
        <span style="font-size: 2.2rem;">${reward.icono}</span>
        <div style="flex: 1;">
          <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #78350f;">${reward.nombre}</h4>
          <p style="font-size: 0.82rem; color: #92400e;">${reward.descripcion}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.72rem; color: #92400e; font-weight: 700;">Costo</span>
          <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: #b45309;">
            🪙 ${reward.puntos} CC
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Selecciona al Estudiante Beneficiario:</label>
        <select id="redeem-student-select" class="form-select">
          <option value="">-- Buscar por nombre o curso --</option>
          ${allStudents.map(s => `
            <option value="${s.id}">
              ${s.nombre_display} (${s.curso}) - Saldo: ${s.saldo} CC
            </option>
          `).join('')}
        </select>
      </div>

      <div id="redeem-balance-status" style="display: none; padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600;">
        <!-- Estado de saldo del estudiante seleccionado -->
      </div>
    `;

    const select = body.querySelector('#redeem-student-select');
    const statusBox = body.querySelector('#redeem-balance-status');
    const confirmBtn = this.container.querySelector('#btn-confirm-redeem');
    confirmBtn.disabled = true;

    select.addEventListener('change', () => {
      const stId = select.value;
      if (!stId) {
        statusBox.style.display = 'none';
        confirmBtn.disabled = true;
        return;
      }

      const st = storage.getStudentById(stId);
      if (!st) return;

      statusBox.style.display = 'block';
      if (st.saldo >= reward.puntos) {
        statusBox.style.background = '#ecfdf5';
        statusBox.style.color = '#065f46';
        statusBox.style.border = '1px solid #a7f3d0';
        statusBox.innerHTML = `
          ✅ Saldo suficiente: ${st.saldo} ColegualCoins.
          <br>Saldo restante tras el canje: <strong>${st.saldo - reward.puntos} CC</strong>.
        `;
        confirmBtn.disabled = false;
      } else {
        statusBox.style.background = '#fef2f2';
        statusBox.style.color = '#991b1b';
        statusBox.style.border = '1px solid #fecaca';
        statusBox.innerHTML = `
          ❌ Saldo insuficiente: ${st.saldo} ColegualCoins disponibles. Faltan <strong>${reward.puntos - st.saldo} CC</strong> para este premio.
        `;
        confirmBtn.disabled = true;
      }
    });

    confirmBtn.onclick = () => {
      const stId = select.value;
      const st = storage.getStudentById(stId);
      if (!st || st.saldo < reward.puntos) return;

      const teacher = storage.getActiveTeacher();
      storage.addTransaction({
        estudiante_id: st.id,
        monto: -reward.puntos,
        motivo: `🎁 Canje de Recompensa: ${reward.nombre}`,
        profesor: teacher.nombre,
        tipo: 'CANJE',
        categoria_id: 'canje'
      });

      sound.playRedeem();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

      alert(`🎉 ¡Canje exitoso para ${st.nombre_display}! Se descontaron ${reward.puntos} puntos.`);
      this.container.querySelector('#modal-redeem').classList.remove('open');
    };

    this.container.querySelector('#modal-redeem').classList.add('open');
  }
}
