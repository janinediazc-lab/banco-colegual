import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';

/**
 * Cuadro de diálogo modal de seguridad institucional.
 * Solicita una clave de funcionario/docente sin dar ningún indicio
 * de su formato, longitud o contenido.
 * 
 * @param {Object} options
 * @param {string} [options.title='🔒 Autorización Requerida']
 * @param {string} [options.actionLabel='continuar con esta acción']
 * @returns {Promise<boolean>} Resuelve a true si la clave es válida, o false si se cancela.
 */
export function requestStaffAuthorization({
  title = '🔒 Autorización Requerida',
  actionLabel = 'continuar'
} = {}) {
  return new Promise((resolve) => {
    // Si ya existe un modal previo, removerlo
    const existing = document.getElementById('security-auth-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'security-auth-modal';
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '999999';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 400px; width: 90%; text-align: center; padding: 2rem 1.75rem; border-radius: var(--radius-lg, 16px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e2e8f0);">
        <div style="width: 56px; height: 56px; margin: 0 auto 1rem auto; border-radius: 50%; background: #ecfdf5; border: 2px solid #a7f3d0; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
          🔐
        </div>
        <h3 style="font-family: var(--font-heading, inherit); font-size: 1.25rem; font-weight: 800; color: var(--text-main, #0f172a); margin: 0 0 0.35rem 0;">
          ${title}
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-muted, #64748b); margin: 0 0 1.35rem 0; line-height: 1.4;">
          Ingresa tu contraseña para ${actionLabel}:
        </p>

        <form id="sec-auth-form" onsubmit="return false;" style="margin-bottom: 1.25rem;">
          <input 
            type="password" 
            id="sec-auth-input" 
            class="form-input" 
            autocomplete="off"
            placeholder="••••••••" 
            style="text-align: center; font-size: 1.35rem; letter-spacing: 0.25em; font-weight: 700; width: 100%; box-sizing: border-box; padding: 0.75rem;" 
            required 
          />
          <div id="sec-auth-error" style="color: #dc2626; font-size: 0.82rem; font-weight: 700; margin-top: 0.6rem; display: none;"></div>
        </form>

        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button type="button" id="sec-auth-cancel" class="btn btn-secondary btn-sm" style="flex: 1; padding: 0.65rem; font-weight: 600;">
            Cancelar
          </button>
          <button type="button" id="sec-auth-confirm" class="btn btn-primary btn-sm" style="flex: 1; padding: 0.65rem; font-weight: 700;">
            Autorizar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector('#sec-auth-input');
    const errorDiv = overlay.querySelector('#sec-auth-error');
    const confirmBtn = overlay.querySelector('#sec-auth-confirm');
    const cancelBtn = overlay.querySelector('#sec-auth-cancel');

    setTimeout(() => input.focus(), 120);

    const cleanup = () => {
      overlay.classList.remove('open');
      setTimeout(() => overlay.remove(), 200);
    };

    const handleConfirm = () => {
      const val = input.value.trim();
      if (!val) {
        errorDiv.textContent = 'Debes ingresar una contraseña.';
        errorDiv.style.display = 'block';
        input.focus();
        return;
      }

      if (storage.verifyAnyStaffPassword(val)) {
        try { sound?.playSuccess?.(); } catch (_) {}
        cleanup();
        resolve(true);
      } else {
        try { sound?.playError?.(); } catch (_) {}
        errorDiv.textContent = 'Contraseña incorrecta.';
        errorDiv.style.display = 'block';
        input.value = '';
        input.focus();
      }
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cleanup();
        resolve(false);
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
  });
}
