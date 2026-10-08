import './styles/main.css';
import './styles/cards.css';
import './styles/print.css';

import { storage } from './services/storage.js';
import { sound } from './services/sound.js';
import { generateQrCanvas } from './services/qr.js';
import { TeacherPortalComponent } from './components/teacher-portal.js';
import { ScannerComponent } from './components/scanner.js';
import { CardGeneratorComponent } from './components/card-generator.js';
import { StorePortalComponent } from './components/store-portal.js';
import { StudentPortalComponent } from './components/student-portal.js';
import { AdminPortalComponent } from './components/admin-portal.js';

class App {
  constructor() {
    this.currentTab = 'teacher';
    this.components = {};
    this.deferredPrompt = null;
  }

  init() {
    this.renderHeaderAndNav();
    this.setupTeacherSelector();
    this.setupSoundButton();
    this.setupPWA();
    this.setupNetworkShare();
    this.initComponents();
    this.setupTabNavigation();
  }

  renderHeaderAndNav() {
    const activeStaff = storage.getActiveStaff();
    const isAuth = storage.isStaffAuthenticated(activeStaff.id);
    const teacherNameEl = document.getElementById('header-teacher-name');
    const teacherRoleEl = document.getElementById('header-teacher-role');
    const teacherAvatarEl = document.getElementById('header-teacher-avatar');

    if (teacherNameEl) teacherNameEl.textContent = activeStaff.nombre;
    if (teacherRoleEl) {
      teacherRoleEl.textContent = isAuth ? '🟢 Activo (Cambiar)' : '🔒 Iniciar con clave';
    }
    if (teacherAvatarEl) {
      teacherAvatarEl.textContent = activeStaff.icono || activeStaff.nombre.charAt(0);
      teacherAvatarEl.style.fontSize = activeStaff.icono ? '1.25rem' : '1rem';
    }
  }

  setupTeacherSelector() {
    const profileBadge = document.getElementById('btn-switch-teacher');
    const modal = document.getElementById('modal-teacher-select');
    const closeBtn = document.getElementById('btn-close-teacher-modal');
    const listContainer = document.getElementById('teacher-options-list');
    const searchInput = document.getElementById('staff-search-input');

    if (!profileBadge || !modal) return;

    let currentSearchTerm = '';

    const renderStaffList = () => {
      const allStaff = storage.getStaff();
      const active = storage.getActiveStaff();

      let filtered = allStaff;
      if (currentSearchTerm) {
        filtered = filtered.filter(s =>
          s.nombre.toLowerCase().includes(currentSearchTerm) ||
          s.run.toLowerCase().includes(currentSearchTerm)
        );
      }

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No se encontraron funcionarios con ese nombre.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filtered.map(s => {
        const isSelectedAndAuth = s.id === active.id && storage.isStaffAuthenticated(s.id);
        return `
          <div class="behavior-category-card ${s.id === active.id ? 'selected' : ''}" data-tid="${s.id}" style="cursor: pointer; padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.85rem;">
            <div class="teacher-avatar" style="width: 44px; height: 44px; font-size: 1.35rem; background: linear-gradient(135deg, var(--color-gold), var(--color-primary)); flex-shrink: 0;">
              ${s.icono || '👤'}
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 800; font-size: 0.98rem; color: var(--text-main); line-height: 1.2;">
                ${s.nombre}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">
                ${isSelectedAndAuth ? '🟢 Sesión activa' : '🔒 Requiere contraseña para activar'}
              </div>
            </div>
            ${isSelectedAndAuth ? '<span style="color: var(--color-primary-dark); font-weight: 800; font-size: 0.82rem; background: var(--color-primary-subtle); padding: 4px 10px; border-radius: 99px;">✓ Activo</span>' : '<span style="color: var(--color-primary); font-size: 0.82rem; font-weight: 700;">Activar 👉</span>'}
          </div>
        `;
      }).join('');

      listContainer.querySelectorAll('.behavior-category-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const tid = e.currentTarget.dataset.tid;
          const targetStaff = storage.getStaff().find(s => s.id === tid);
          modal.classList.remove('open');
          if (targetStaff) {
            this.openAuthModal(targetStaff);
          }
        });
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.toLowerCase().trim();
        renderStaffList();
      });
    }

    profileBadge.addEventListener('click', () => {
      currentSearchTerm = '';
      if (searchInput) searchInput.value = '';
      renderStaffList();
      modal.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });

    this.setupStaffAuthModal();
  }

  setupStaffAuthModal() {
    const authModal = document.getElementById('modal-staff-auth');
    const closeBtn = document.getElementById('btn-close-auth-modal');
    const cancelBtn = document.getElementById('btn-cancel-auth-modal');
    const submitBtn = document.getElementById('btn-submit-auth-modal');
    const pwdInput = document.getElementById('input-staff-password');
    const toggleVisBtn = document.getElementById('btn-toggle-pwd-vis');
    const errorMsg = document.getElementById('auth-error-msg');

    if (!authModal) return;

    let targetStaffToAuth = null;
    let authSuccessCallback = null;

    this.openAuthModal = (staff, onAuthSuccess = null) => {
      targetStaffToAuth = staff;
      authSuccessCallback = onAuthSuccess;
      const avatarEl = document.getElementById('auth-staff-avatar');
      const nameEl = document.getElementById('auth-staff-name');

      if (avatarEl) avatarEl.textContent = staff.icono || '👤';
      if (nameEl) nameEl.textContent = staff.nombre;

      if (pwdInput) {
        pwdInput.value = '';
        pwdInput.type = 'password';
      }
      if (toggleVisBtn) toggleVisBtn.textContent = '👁️';
      if (errorMsg) {
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
      }

      authModal.classList.add('open');
      setTimeout(() => pwdInput?.focus(), 150);
    };

    window.promptStaffAuth = (staff, callback) => {
      this.openAuthModal(staff, callback);
    };

    const handleAuth = () => {
      if (!targetStaffToAuth || !pwdInput) return;
      const pwd = pwdInput.value.trim();

      if (!pwd) {
        errorMsg.textContent = 'Por favor ingresa tu contraseña.';
        errorMsg.style.display = 'block';
        pwdInput.focus();
        return;
      }

      const res = storage.authenticateStaff(targetStaffToAuth.id, pwd);
      if (res.success) {
        authModal.classList.remove('open');
        this.renderHeaderAndNav();
        sound.playSuccess();
        this.showToast(`🎉 ¡Bienvenido(a), ${targetStaffToAuth.nombre}! Sesión activada para asignar ColegualCoins.`, 'gold');
        if (typeof authSuccessCallback === 'function') {
          const cb = authSuccessCallback;
          authSuccessCallback = null;
          cb(targetStaffToAuth);
        }
      } else {
        sound.playError();
        errorMsg.textContent = res.error || 'Contraseña incorrecta.';
        errorMsg.style.display = 'block';
        pwdInput.style.borderColor = '#ef4444';
        pwdInput.focus();
      }
    };

    if (submitBtn) submitBtn.addEventListener('click', handleAuth);
    if (pwdInput) {
      pwdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAuth();
      });
      pwdInput.addEventListener('input', () => {
        if (errorMsg) errorMsg.style.display = 'none';
        pwdInput.style.borderColor = '';
      });
    }

    if (toggleVisBtn && pwdInput) {
      toggleVisBtn.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        toggleVisBtn.textContent = isPwd ? '🙈' : '👁️';
      });
    }

    const closeAuth = () => authModal.classList.remove('open');
    if (closeBtn) closeBtn.addEventListener('click', closeAuth);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAuth);
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuth();
    });
  }

  setupSoundButton() {
    const btn = document.getElementById('btn-toggle-sound');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const muted = sound.toggleMute();
      btn.innerHTML = muted ? '🔇' : '🔊';
      btn.title = muted ? 'Activar Sonidos' : 'Silenciar Sonidos';
      if (!muted) sound.playCoin();
    });
  }

  setupPWA() {
    // Registro de Service Worker para soporte offline
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.log('ServiceWorker registration skipped:', err);
        });
      });
    }

    // Botón de instalación PWA en el header
    const installBtn = document.getElementById('btn-install-pwa');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
        installBtn.addEventListener('click', async () => {
          if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
              installBtn.style.display = 'none';
              this.showToast('✅ ¡Banco Colegual instalado con éxito!', 'gold');
            }
            this.deferredPrompt = null;
          }
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      if (installBtn) installBtn.style.display = 'none';
      this.deferredPrompt = null;
    });
  }

  setupNetworkShare() {
    const shareBtn = document.getElementById('btn-share-network');
    const modal = document.getElementById('modal-network-share');
    const closeBtn = document.getElementById('btn-close-network-modal');
    const doneBtn = document.getElementById('btn-done-network-modal');
    const copyBtn = document.getElementById('btn-copy-network-url');
    const urlInput = document.getElementById('network-url-input');
    const qrCanvas = document.getElementById('network-qr-canvas');

    if (!shareBtn || !modal) return;

    const openNetworkModal = () => {
      const port = window.location.port ? `:${window.location.port}` : '';
      let targetUrl = window.location.href;

      // Si está en localhost, sugerir la IP de red local para celulares
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        targetUrl = `http://10.11.10.36${port}/`;
      }

      if (urlInput) urlInput.value = targetUrl;
      if (qrCanvas) {
        generateQrCanvas(qrCanvas, targetUrl, {
          width: 180,
          darkColor: '#064e3b'
        });
      }

      modal.classList.add('open');
    };

    shareBtn.addEventListener('click', openNetworkModal);

    const closeModal = () => modal.classList.remove('open');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (doneBtn) doneBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (copyBtn && urlInput) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(urlInput.value);
          this.showToast('📋 ¡Enlace copiado al portapapeles! Envíalo a los profesores o ábrelo en tu celular.', 'success');
        } catch {
          urlInput.select();
          document.execCommand('copy');
          this.showToast('📋 ¡Enlace copiado!', 'success');
        }
      });
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

  initComponents() {
    this.components.teacher = new TeacherPortalComponent('tab-teacher');
    this.components.teacher.init();

    this.components.scanner = new ScannerComponent('tab-scanner');
    this.components.scanner.init();

    this.components.cards = new CardGeneratorComponent('tab-cards');
    this.components.cards.init();

    this.components.store = new StorePortalComponent('tab-store');
    this.components.store.init();

    this.components.kiosk = new StudentPortalComponent('tab-kiosk');
    this.components.kiosk.init();

    this.components.admin = new AdminPortalComponent('tab-admin');
    this.components.admin.init();
  }

  switchTab(targetTab) {
    if (!targetTab) return;
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === targetTab);
    });
    panes.forEach(p => {
      p.classList.toggle('active', p.id === `tab-${targetTab}`);
    });

    if (this.currentTab === 'scanner' && targetTab !== 'scanner') {
      if (this.components.scanner) this.components.scanner.stopCamera();
    }

    this.currentTab = targetTab;
  }

  setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.dataset.tab;
        window.location.hash = targetTab;
        this.switchTab(targetTab);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        this.switchTab(hash);
      }
    });

    // Revisar hash al cargar
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(`tab-${initialHash}`)) {
      this.switchTab(initialHash);
    }
  }
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
