import { Html5Qrcode } from 'html5-qrcode';
import { storage } from '../services/storage.js';
import { extractStudentIdentifier } from '../services/qr.js';
import { sound } from '../services/sound.js';
import confetti from 'canvas-confetti';

/**
 * Carga un archivo File/Blob en un objeto Image de forma asíncrona
 */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Decodifica un código QR desde un archivo de imagen (cámara o galería)
 * usando BarcodeDetector nativo y reescalado multi-ángulo optimizado para móviles (12MP - 48MP)
 */
async function decodeImageFile(file, html5QrCodeInstance) {
  // 1. Intentar BarcodeDetector nativo por hardware (super rápido, sin problemas de rotación)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (formats.includes('qr_code')) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const imgBitmap = await createImageBitmap(file);
        const barcodes = await detector.detect(imgBitmap);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          return barcodes[0].rawValue;
        }
      }
    } catch (e) {
      console.warn('Fallo BarcodeDetector nativo directo, pasando a método reescalado:', e);
    }
  }

  // 2. Reescalar a resolución óptima (~1000px) y probar rotaciones 0°, 90°, 180°, 270°
  // Resuelve fotos gigantes de celular (4000x3000) que bloquean o confunden al lector
  const img = await loadImageFromFile(file);
  const angles = [0, 90, 180, 270];

  for (const angle of angles) {
    const canvas = document.createElement('canvas');
    const maxDim = 1000;
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    if (angle === 90 || angle === 270) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);

    // Probar BarcodeDetector sobre el canvas rotado si está disponible
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(canvas);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          return barcodes[0].rawValue;
        }
      } catch (err) {}
    }

    // Probar ZXing de html5QrCode con el blob optimizado
    try {
      const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
      if (blob) {
        const fileFromBlob = new File([blob], `scan_${angle}.jpg`, { type: 'image/jpeg' });
        const result = await html5QrCodeInstance.scanFile(fileFromBlob, false);
        if (result) return result;
      }
    } catch (e) {
      // Probar siguiente rotación
    }
  }

  // 3. Fallback final al archivo original
  return await html5QrCodeInstance.scanFile(file, false);
}

export class ScannerComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.html5QrCode = null;
    this.isScanning = false;
    this.selectedStudent = null;
    this.selectedPoints = 10;
    this.selectedCategory = null;
    this.categories = [];
    this.cameras = [];
    this.currentCameraIndex = 0;
    this.torchEnabled = false;
  }

  init() {
    this.categories = storage.getCategories();
    this.selectedCategory = this.categories[0];
    this.render();
    this.setupEvents();
  }

  render() {
    const allStudents = storage.getStudents();

    this.container.innerHTML = `
      <div class="scanner-container">
        <!-- Columna Izquierda: Visor de Cámara y Controles -->
        <div class="scanner-viewfinder-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
              📷 Lector de Tarjetas QR en Vivo
            </h3>
            <span class="status-indicator-badge" id="scanner-status-badge">
              <span class="status-dot" id="scanner-status-dot" style="background: #94a3b8;"></span>
              <span id="scanner-status-text">Cámara apagada</span>
            </span>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-muted); margin: -0.25rem 0 0.5rem 0;">
            Apunta la tarjeta del estudiante hacia la cámara para cargar su cuenta al instante.
          </p>

          <div class="camera-wrapper">
            <div id="qr-reader"></div>
            <div class="scanner-overlay-target" id="scanner-overlay" style="display: none;"></div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
            <!-- Opción 1: Cámara en vivo -->
            <button id="btn-toggle-camera" class="btn btn-primary" style="flex: 1; min-width: 140px;">
              📹 Iniciar Cámara en Vivo
            </button>

            <!-- Botón Cambiar Lente (si el celular tiene cámara normal vs angular) -->
            <button id="btn-switch-camera" class="btn btn-secondary" style="display: none; padding: 0.5rem 0.75rem;" title="Cambiar lente / cámara trasera">
              🔄 Cambiar Lente
            </button>

            <!-- Botón Linterna (si el celular la soporta) -->
            <button id="btn-toggle-torch" class="btn btn-secondary" style="display: none; padding: 0.5rem 0.75rem;" title="Encender / Apagar linterna">
              🔦 Linterna
            </button>

            <!-- Opción 2: Foto directa con cámara de celular -->
            <label class="btn btn-gold" style="margin: 0; cursor: pointer; flex: 1; min-width: 150px; display: flex; align-items: center; justify-content: center; gap: 0.4rem; text-align: center;">
              📸 Tomar Foto QR
              <input type="file" id="input-phone-camera" accept="image/*" capture="environment" style="display: none;" />
            </label>

            <!-- Opción 3: Galería de imágenes -->
            <label class="btn btn-secondary" style="margin: 0; cursor: pointer;">
              📁 Galería
              <input type="file" id="input-qr-file" accept="image/*" style="display: none;" />
            </label>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-muted); background: rgba(0,0,0,0.03); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); line-height: 1.4;">
            💡 <strong>Consejos de escaneo en celulares:</strong> Mantén la tarjeta a unos 15 - 20 cm sin moverla. Si tu teléfono tiene varias cámaras y se ve desenfocado, pulsa <strong>🔄 Cambiar Lente</strong>.
          </div>

          <!-- Acceso Rápido / Búsqueda para Móviles y Pruebas -->
          <div style="background: var(--bg-card-subtle); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px dashed var(--border-light); margin-top: 0.5rem;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.35rem;">
              ⚡ Búsqueda y Selección Rápida de Alumno:
            </span>
            <div style="display: flex; gap: 0.5rem;">
              <select id="quick-student-select" class="form-select" style="font-size: 0.85rem; flex: 1;">
                <option value="">-- Buscar por Nombre o Curso... --</option>
                ${allStudents.map(s => `<option value="${s.run}">${s.nombre_display} (${s.curso})</option>`).join('')}
              </select>
              <button id="btn-quick-simulate" class="btn btn-primary btn-sm" style="white-space: nowrap;">
                Cargar Alumno 👉
              </button>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Tarjeta Detectada y Asignación Rápida -->
        <div class="scanner-result-panel" id="scanner-result-panel">
          <div class="scanner-empty-state" id="scanner-empty-state">
            <div class="icon">🪪</div>
            <h4 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700;">
              Ninguna tarjeta detectada aún
            </h4>
            <p style="font-size: 0.85rem; max-width: 320px;">
              Inicia la cámara o toma una foto a la tarjeta para abonar puntos en segundos.
            </p>
          </div>

          <div id="scanner-detected-card" style="display: none; flex-direction: column; gap: 1.25rem;">
            <!-- Contenido dinámico al detectar -->
          </div>
        </div>
      </div>
    `;
  }

  setupEvents() {
    const toggleCamBtn = this.container.querySelector('#btn-toggle-camera');
    toggleCamBtn.addEventListener('click', () => {
      if (this.isScanning) {
        this.stopCamera();
      } else {
        this.startCamera();
      }
    });

    const switchCamBtn = this.container.querySelector('#btn-switch-camera');
    if (switchCamBtn) {
      switchCamBtn.addEventListener('click', () => {
        this.switchCamera();
      });
    }

    const torchBtn = this.container.querySelector('#btn-toggle-torch');
    if (torchBtn) {
      torchBtn.addEventListener('click', () => {
        this.toggleTorch();
      });
    }

    const fileInput = this.container.querySelector('#input-qr-file');
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.scanFile(e.target.files[0]);
      }
    });

    const phoneCamInput = this.container.querySelector('#input-phone-camera');
    if (phoneCamInput) {
      phoneCamInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.scanFile(e.target.files[0]);
        }
      });
    }

    const quickSelect = this.container.querySelector('#quick-student-select');
    const simulateBtn = this.container.querySelector('#btn-quick-simulate');
    simulateBtn.addEventListener('click', () => {
      if (quickSelect.value) {
        this.handleSuccessfulScan(quickSelect.value);
      }
    });
  }

  async startCamera(specificDeviceId = null) {
    try {
      const qrReaderElem = document.getElementById('qr-reader');
      if (!qrReaderElem) return;

      if (this.isScanning) {
        await this.stopCamera();
      }

      this.html5QrCode = new Html5Qrcode('qr-reader', {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        verbose: false
      });

      const toggleCamBtn = this.container.querySelector('#btn-toggle-camera');
      const switchCamBtn = this.container.querySelector('#btn-switch-camera');
      const torchBtn = this.container.querySelector('#btn-toggle-torch');
      const statusDot = this.container.querySelector('#scanner-status-dot');
      const statusText = this.container.querySelector('#scanner-status-text');
      const overlay = this.container.querySelector('#scanner-overlay');

      if (statusText) statusText.textContent = 'Iniciando cámara...';
      if (statusDot) statusDot.style.background = '#f59e0b';

      // 1. Detectar cámaras si no se han enumerado
      if (!this.cameras || this.cameras.length === 0) {
        try {
          this.cameras = await Html5Qrcode.getCameras();
        } catch (e) {
          console.warn('No se pudieron enumerar las cámaras:', e);
          this.cameras = [];
        }
      }

      // 2. Seleccionar cámara adecuada
      let cameraConfig;
      if (specificDeviceId) {
        cameraConfig = { deviceId: { exact: specificDeviceId } };
      } else if (this.cameras && this.cameras.length > 0) {
        // Buscar cámara trasera principal
        const backIdx = this.cameras.findIndex(c => {
          const l = (c.label || '').toLowerCase();
          return l.includes('back') || l.includes('trasera') || l.includes('rear') || l.includes('environment');
        });
        this.currentCameraIndex = backIdx !== -1 ? backIdx : 0;
        cameraConfig = { deviceId: { exact: this.cameras[this.currentCameraIndex].id } };
      } else {
        cameraConfig = { facingMode: 'environment' };
      }

      // Si hay más de 1 cámara disponible, mostrar botón de cambio de lente
      if (this.cameras && this.cameras.length > 1 && switchCamBtn) {
        switchCamBtn.style.display = 'inline-flex';
      }

      // Configuración de escaneo responsive y de alto rendimiento
      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.max(200, Math.floor(minEdge * 0.85));
          return { width: size, height: size };
        },
        disableFlip: true
      };

      await this.html5QrCode.start(
        cameraConfig,
        config,
        async (decodedText) => {
          if (this.isScanning) {
            await this.stopCamera();
            this.handleSuccessfulScan(decodedText);
          }
        },
        () => {}
      );

      this.isScanning = true;
      if (toggleCamBtn) {
        toggleCamBtn.textContent = '⏹️ Detener Cámara';
        toggleCamBtn.className = 'btn btn-secondary';
      }
      if (statusDot) statusDot.style.background = '#10b981';
      if (statusText) statusText.textContent = 'Cámara activa (Escaneando)';
      if (overlay) overlay.style.display = 'block';

      // Verificar si la linterna está soportada
      try {
        const capabilities = this.html5QrCode.getRunningTrackCameraCapabilities();
        if (capabilities && capabilities.torchFeature && capabilities.torchFeature().isSupported()) {
          if (torchBtn) torchBtn.style.display = 'inline-flex';
        }
      } catch (e) {}

    } catch (err) {
      console.error('Error al encender cámara', err);
      const toggleCamBtn = this.container.querySelector('#btn-toggle-camera');
      const statusDot = this.container.querySelector('#scanner-status-dot');
      const statusText = this.container.querySelector('#scanner-status-text');
      if (toggleCamBtn) {
        toggleCamBtn.textContent = '📹 Iniciar Cámara en Vivo';
        toggleCamBtn.className = 'btn btn-primary';
      }
      if (statusDot) statusDot.style.background = '#ef4444';
      if (statusText) statusText.textContent = 'Cámara bloqueada o apagada';

      alert(
        '⚠️ No se pudo iniciar la cámara en vivo:\n\n' +
        '1. Permite el acceso a la cámara en los ajustes de tu navegador.\n' +
        '2. O pulsa el botón dorado "📸 Tomar Foto QR" para capturar la tarjeta directamente con tu teléfono.'
      );
    }
  }

  async switchCamera() {
    if (!this.cameras || this.cameras.length < 2) return;
    this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length;
    const nextCam = this.cameras[this.currentCameraIndex];
    await this.startCamera(nextCam.id);
  }

  async toggleTorch() {
    if (!this.html5QrCode || !this.isScanning) return;
    const torchBtn = this.container.querySelector('#btn-toggle-torch');
    try {
      this.torchEnabled = !this.torchEnabled;
      await this.html5QrCode.applyVideoConstraints({
        advanced: [{ torch: this.torchEnabled }]
      });
      if (torchBtn) {
        torchBtn.textContent = this.torchEnabled ? '🔦 Apagar Luz' : '🔦 Linterna';
        torchBtn.className = this.torchEnabled ? 'btn btn-gold' : 'btn btn-secondary';
      }
    } catch (err) {
      console.warn('Torch no compatible:', err);
    }
  }

  async stopCamera() {
    if (this.html5QrCode && this.isScanning) {
      try {
        await this.html5QrCode.stop();
      } catch (err) {
        console.error('Error al detener cámara', err);
      }
    }
    this.isScanning = false;
    this.torchEnabled = false;

    const toggleCamBtn = this.container.querySelector('#btn-toggle-camera');
    const switchCamBtn = this.container.querySelector('#btn-switch-camera');
    const torchBtn = this.container.querySelector('#btn-toggle-torch');
    const statusDot = this.container.querySelector('#scanner-status-dot');
    const statusText = this.container.querySelector('#scanner-status-text');
    const overlay = this.container.querySelector('#scanner-overlay');

    if (toggleCamBtn) {
      toggleCamBtn.textContent = '📹 Iniciar Cámara en Vivo';
      toggleCamBtn.className = 'btn btn-primary';
    }
    if (switchCamBtn) switchCamBtn.style.display = 'none';
    if (torchBtn) {
      torchBtn.style.display = 'none';
      torchBtn.textContent = '🔦 Linterna';
      torchBtn.className = 'btn btn-secondary';
    }
    if (statusDot) statusDot.style.background = '#94a3b8';
    if (statusText) statusText.textContent = 'Cámara apagada';
    if (overlay) overlay.style.display = 'none';
  }

  async scanFile(file) {
    const statusText = this.container.querySelector('#scanner-status-text');
    const statusDot = this.container.querySelector('#scanner-status-dot');
    if (statusText) statusText.textContent = 'Analizando foto con IA...';
    if (statusDot) statusDot.style.background = '#f59e0b';

    try {
      if (!this.html5QrCode) {
        this.html5QrCode = new Html5Qrcode('qr-reader', {
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          verbose: false
        });
      }

      const decodedText = await decodeImageFile(file, this.html5QrCode);
      if (statusText) statusText.textContent = '¡QR Detectado con éxito!';
      if (statusDot) statusDot.style.background = '#10b981';
      this.handleSuccessfulScan(decodedText);
    } catch (err) {
      console.error('Error procesando imagen QR:', err);
      sound.playError();
      if (statusText) statusText.textContent = 'No se detectó QR';
      if (statusDot) statusDot.style.background = '#ef4444';
      alert('No se detectó un código QR válido en la foto. Intenta acercarte un poco más, enfocar bien y verificar que haya buena iluminación.');
    }
  }

  handleSuccessfulScan(rawText) {
    sound.playScan();

    const cleanRun = extractStudentIdentifier(rawText);
    const student = storage.getStudentByRun(cleanRun);

    if (!student) {
      sound.playError();
      alert('Tarjeta escaneada pero no se encontró al estudiante en el sistema.');
      return;
    }

    this.selectedStudent = student;
    this.renderDetectedCard(student);
  }

  renderDetectedCard(student) {
    const emptyState = this.container.querySelector('#scanner-empty-state');
    const detectedContainer = this.container.querySelector('#scanner-detected-card');

    emptyState.style.display = 'none';
    detectedContainer.style.display = 'flex';

    this.currentMode = 'ADD'; // 'ADD' | 'DEDUCT'
    const addCategories = storage.getCategories();
    const deductCategories = storage.getDeductionCategories();
    this.selectedCategory = addCategories[0];
    this.selectedPoints = 10;
    let noteText = '';

    const updateCardView = () => {
      const isAdd = this.currentMode === 'ADD';
      const categories = isAdd ? addCategories : deductCategories;

      detectedContainer.innerHTML = `
        <!-- Cabecera de Tarjeta Encontrada -->
        <div style="background: ${isAdd ? 'linear-gradient(135deg, #064e3b, #047857)' : 'linear-gradient(135deg, #7f1d1d, #b91c1c)'}; color: white; padding: 1.25rem; border-radius: var(--radius-lg); box-shadow: 0 4px 12px ${isAdd ? 'rgba(6, 78, 59, 0.3)' : 'rgba(185, 28, 28, 0.3)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; color: ${isAdd ? '#a7f3d0' : '#fecaca'}; font-weight: 700; letter-spacing: 0.05em;">
                ¡TARJETA DETECTADA! ✅
              </span>
              <h3 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; margin: 0.15rem 0;">
                ${student.nombre_display}
              </h3>
              <p style="font-size: 0.82rem; color: ${isAdd ? '#d1fae5' : '#fee2e2'};">
                ${student.curso} • Cuenta: ${student.nro_cuenta}
              </p>
            </div>
            <div style="text-align: right; background: rgba(255,255,255,0.18); padding: 0.5rem 0.85rem; border-radius: var(--radius-md);">
              <span style="font-size: 0.7rem; color: #fef08a; font-weight: 600;">Saldo Actual</span>
              <div style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800;">
                🪙 ${student.saldo || 0} CC
              </div>
            </div>
          </div>
        </div>

        <!-- Funcionario que asigna / descuenta -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: ${isAdd ? 'rgba(5, 150, 105, 0.08)' : 'rgba(239, 68, 68, 0.08)'}; border: 1px solid ${isAdd ? 'rgba(5, 150, 105, 0.25)' : 'rgba(239, 68, 68, 0.25)'}; padding: 0.5rem 0.85rem; border-radius: var(--radius-md);">
          <span style="font-size: 0.78rem; font-weight: 700; color: ${isAdd ? 'var(--color-primary-dark)' : '#dc2626'};">
            👤 Funcionario responsable: <strong>${storage.getActiveStaff().nombre}</strong>
          </span>
        </div>

        <!-- Selector de Acción: Abonar vs Quitar -->
        <div>
          <label class="form-label" style="margin-bottom: 0.35rem; display: block; font-size: 0.82rem;">Selecciona la acción:</label>
          <div class="point-mode-selector">
            <button type="button" class="point-mode-tab ${isAdd ? 'active-add' : ''}" id="scanner-tab-add">
              ➕ Abonar ColegualCoins
            </button>
            <button type="button" class="point-mode-tab ${!isAdd ? 'active-deduct' : ''}" id="scanner-tab-deduct">
              ➖ Quitar ColegualCoins
            </button>
          </div>
        </div>

        <!-- Advertencia preventiva si está en modo descuento -->
        ${!isAdd && (student.saldo || 0) === 0 ? `
          <div style="background: #fff1f2; border: 1px solid #fecaca; color: #991b1b; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>ℹ️</span>
            <span>El estudiante tiene actualmente <strong>0 CC</strong>. El saldo no quedará en negativo.</span>
          </div>
        ` : (!isAdd && (student.saldo || 0) < this.selectedPoints ? `
          <div style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 0.55rem 0.8rem; border-radius: var(--radius-md); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚠️</span>
            <span>El saldo actual es de <strong>${student.saldo || 0} CC</strong>. Al descontar ${this.selectedPoints} CC quedará en <strong>0 CC</strong>.</span>
          </div>
        ` : '')}

        <!-- Selección Rápida de Puntos -->
        <div>
          <label class="form-label" style="margin-bottom: 0.35rem; display: block;">
            ${isAdd ? '1. ColegualCoins a Abonar:' : '1. ColegualCoins a Quitar:'}
          </label>
          <div class="quick-points-row">
            ${[5, 10, 15, 20, 50].map(pts => `
              <button type="button" class="quick-point-btn ${!isAdd ? 'deduct-btn' : ''} ${this.selectedPoints === pts ? 'selected' : ''}" data-pts="${pts}">
                ${isAdd ? `+${pts}` : `-${pts}`} CC
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Selección de Conducta / Motivo -->
        <div>
          <label class="form-label" style="margin-bottom: 0.35rem; display: block;">
            ${isAdd ? '2. Motivo o Conducta Destacada:' : '2. Motivo del Descuento Formativo o Corrección:'}
          </label>
          <div class="behavior-categories-grid" style="grid-template-columns: 1fr 1fr;">
            ${categories.map(c => `
              <div class="behavior-category-card ${!isAdd ? 'deduct-card' : ''} ${this.selectedCategory?.id === c.id ? 'selected' : ''}" data-catid="${c.id}">
                <span class="category-icon">${c.icono}</span>
                <div class="category-info">
                  <span class="category-title" style="font-size: 0.8rem;">${c.nombre}</span>
                  <span class="category-sub">${isAdd ? `+${c.puntos} CC` : `-${c.puntos} CC`}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Observación opcional -->
        <div>
          <input type="text" id="scanner-note-input" class="form-input" 
            placeholder="${isAdd ? 'Nota adicional opcional...' : 'Detalle del descuento opcional...'}" 
            value="${noteText}" />
        </div>

        <!-- Botón de Confirmación -->
        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-scanner-confirm" class="btn ${isAdd ? 'btn-primary' : 'btn-danger'} btn-lg" style="flex: 1;">
            ${isAdd ? '💰 Confirmar y Abonar ColegualCoins' : '🔻 Confirmar y Quitar ColegualCoins'}
          </button>
        </div>
      `;

      // Eventos pestañas
      detectedContainer.querySelector('#scanner-tab-add').onclick = () => {
        if (this.currentMode !== 'ADD') {
          const noteEl = detectedContainer.querySelector('#scanner-note-input');
          if (noteEl) noteText = noteEl.value;
          this.currentMode = 'ADD';
          this.selectedCategory = addCategories[0];
          this.selectedPoints = this.selectedCategory?.puntos || 10;
          updateCardView();
        }
      };

      detectedContainer.querySelector('#scanner-tab-deduct').onclick = () => {
        if (this.currentMode !== 'DEDUCT') {
          const noteEl = detectedContainer.querySelector('#scanner-note-input');
          if (noteEl) noteText = noteEl.value;
          this.currentMode = 'DEDUCT';
          this.selectedCategory = deductCategories[0];
          this.selectedPoints = this.selectedCategory?.puntos || 10;
          updateCardView();
        }
      };

      // Asignar eventos de puntos
      detectedContainer.querySelectorAll('.quick-point-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          detectedContainer.querySelectorAll('.quick-point-btn').forEach(b => b.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          this.selectedPoints = parseInt(e.currentTarget.dataset.pts, 10);
        });
      });

      // Asignar eventos de categorías
      detectedContainer.querySelectorAll('.behavior-category-card').forEach(card => {
        card.addEventListener('click', (e) => {
          detectedContainer.querySelectorAll('.behavior-category-card').forEach(c => c.classList.remove('selected'));
          e.currentTarget.classList.add('selected');
          const catId = e.currentTarget.dataset.catid;
          this.selectedCategory = categories.find(c => c.id === catId);

          if (this.selectedCategory && this.selectedCategory.puntos) {
            const matchBtn = Array.from(detectedContainer.querySelectorAll('.quick-point-btn')).find(b => parseInt(b.dataset.pts, 10) === this.selectedCategory.puntos);
            if (matchBtn) {
              detectedContainer.querySelectorAll('.quick-point-btn').forEach(b => b.classList.remove('selected'));
              matchBtn.classList.add('selected');
              this.selectedPoints = this.selectedCategory.puntos;
            }
          }
        });
      });

      // Botón confirmar
      const confirmBtn = detectedContainer.querySelector('#btn-scanner-confirm');
      confirmBtn.addEventListener('click', () => {
        this.executeQuickDeposit();
      });
    };

    updateCardView();
  }

  executeQuickDeposit() {
    if (!this.selectedStudent) return;

    try {
      const staff = storage.getActiveStaff();
      if (!storage.isStaffAuthenticated(staff.id)) {
        if (typeof window.promptStaffAuth === 'function') {
          window.promptStaffAuth(staff, () => {
            this.executeQuickDeposit();
          });
          return;
        }
      }

      const noteInput = this.container.querySelector('#scanner-note-input');
      const note = noteInput ? noteInput.value.trim() : '';
      const cat = this.selectedCategory;
      const pts = this.selectedPoints || 10;
      const isAdd = this.currentMode === 'ADD';
      const motivo = note ? `${cat.nombre}: ${note}` : cat.nombre;

      if (isAdd) {
        const result = storage.addTransaction({
          estudiante_id: this.selectedStudent.id,
          monto: pts,
          motivo: `${cat.icono} ${motivo}`,
          profesor: staff.nombre,
          tipo: 'DEPOSITO',
          categoria_id: cat.id
        });

        sound.playCoin();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });

        this.showScannerSuccessView(result.student, pts, motivo, staff, isAdd);
      } else {
        // Descuento
        const result = storage.addTransaction({
          estudiante_id: this.selectedStudent.id,
          monto: -pts,
          motivo: `${cat.icono} ${motivo}`,
          profesor: staff.nombre,
          tipo: 'DESCUENTO',
          categoria_id: cat.id
        });

        sound.playDeduct();
        this.showScannerSuccessView(result.student, pts, motivo, staff, isAdd);
      }
    } catch (err) {
      console.error('Error al procesar transacción en scanner:', err);
      alert('Error en la operación: ' + err.message);
    }
  }

  showScannerSuccessView(updatedStudent, pts, motivo, staff, isAdd) {
    const detectedContainer = this.container.querySelector('#scanner-detected-card');
    if (!detectedContainer) return;

    detectedContainer.innerHTML = `
      <div style="text-align: center; padding: 1.5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
        <div style="font-size: 3.5rem; animation: bounce 0.6s ease;">${isAdd ? '🎉' : '📉'}</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.45rem; font-weight: 800; color: ${isAdd ? 'var(--color-primary-dark)' : '#b91c1c'}; margin: 0;">
          ${isAdd ? `¡Abono de +${pts} ColegualCoins Exitoso!` : `¡Descuento de -${pts} ColegualCoins Exitoso!`}
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
          ${isAdd ? 'Se acreditaron a la cuenta del estudiante.' : 'Se descontaron de la cuenta del estudiante.'}
        </p>

        <div style="background: ${isAdd ? '#f0fdf4' : '#fef2f2'}; border: 1.5px solid ${isAdd ? '#86efac' : '#fecaca'}; border-radius: var(--radius-lg); padding: 1rem 1.25rem; text-align: left; width: 100%; max-width: 380px; box-shadow: var(--shadow-sm); margin-top: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isAdd ? '#bbf7d0' : '#fee2e2'}; padding-bottom: 0.45rem; margin-bottom: 0.45rem;">
            <span style="font-size: 0.82rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 600;">Estudiante:</span>
            <strong style="font-size: 0.95rem; color: ${isAdd ? '#064e3b' : '#7f1d1d'}; text-align: right;">${updatedStudent.nombre_display}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isAdd ? '#bbf7d0' : '#fee2e2'}; padding-bottom: 0.45rem; margin-bottom: 0.45rem;">
            <span style="font-size: 0.82rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 600;">Curso / Cuenta:</span>
            <span style="font-size: 0.82rem; color: ${isAdd ? '#064e3b' : '#7f1d1d'}; font-weight: 700;">${updatedStudent.curso} • Cta: ${updatedStudent.nro_cuenta}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isAdd ? '#bbf7d0' : '#fee2e2'}; padding-bottom: 0.45rem; margin-bottom: 0.45rem;">
            <span style="font-size: 0.82rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 600;">${isAdd ? 'Abono:' : 'Descuento:'}</span>
            <strong style="font-size: 1.25rem; color: ${isAdd ? '#15803d' : '#dc2626'}; font-family: var(--font-heading);">
              ${isAdd ? `+${pts} CC 🪙` : `-${pts} CC 🔻`}
            </strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.2rem;">
            <span style="font-size: 0.85rem; color: ${isAdd ? '#166534' : '#991b1b'}; font-weight: 700;">Nuevo Saldo:</span>
            <strong style="font-size: 1.4rem; color: #b45309; font-family: var(--font-heading);">🪙 ${updatedStudent.saldo} CC</strong>
          </div>
          <div style="margin-top: 0.65rem; padding-top: 0.5rem; border-top: 1px dashed ${isAdd ? '#86efac' : '#fca5a5'}; font-size: 0.74rem; color: ${isAdd ? '#15803d' : '#991b1b'}; line-height: 1.35;">
            📌 <strong>Motivo:</strong> ${motivo}<br>
            👤 <strong>Registrado por:</strong> ${staff.nombre}
          </div>
        </div>

        <button id="btn-scan-next" class="btn btn-primary btn-lg" style="margin-top: 0.75rem; width: 100%; max-width: 380px;">
          📷 Escanear o Cargar Siguiente Tarjeta
        </button>
      </div>
    `;

    detectedContainer.querySelector('#btn-scan-next').addEventListener('click', () => {
      this.resetScannerView();
    });
  }

  resetScannerView() {
    this.selectedStudent = null;
    const emptyState = this.container.querySelector('#scanner-empty-state');
    const detectedContainer = this.container.querySelector('#scanner-detected-card');
    if (emptyState) emptyState.style.display = 'flex';
    if (detectedContainer) detectedContainer.style.display = 'none';
  }
}
