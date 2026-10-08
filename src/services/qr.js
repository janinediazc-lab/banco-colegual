import QRCode from 'qrcode';

/**
 * Servicio de Generación y Decodificación de Códigos QR
 */

export const QR_PREFIX = 'COLEGUAL:';

export async function generateQrCanvas(canvasElement, text, options = {}) {
  const defaultOpts = {
    width: options.width || 180,
    margin: options.margin || 1,
    color: {
      dark: options.darkColor || '#0f172a',
      light: options.lightColor || '#ffffff'
    },
    errorCorrectionLevel: 'M'
  };

  try {
    await QRCode.toCanvas(canvasElement, text, defaultOpts);
    return true;
  } catch (err) {
    console.error('Error generando QR en canvas', err);
    return false;
  }
}

export async function generateQrDataUrl(text, options = {}) {
  const defaultOpts = {
    width: options.width || 250,
    margin: options.margin || 1,
    color: {
      dark: options.darkColor || '#0f172a',
      light: options.lightColor || '#ffffff'
    },
    errorCorrectionLevel: 'M'
  };

  try {
    return await QRCode.toDataURL(text, defaultOpts);
  } catch (err) {
    console.error('Error generando QR DataURL', err);
    return null;
  }
}

/**
 * Normaliza y extrae el RUN o ID a partir del texto leído por el escáner
 */
export function extractStudentIdentifier(rawText) {
  if (!rawText) return null;
  let str = String(rawText).trim();

  // Si viene con prefijo COLEGUAL:27200432-3
  if (str.startsWith(QR_PREFIX)) {
    str = str.replace(QR_PREFIX, '').trim();
  }

  // Si viene como URL hash e.g. #estudiante=27200432-3
  if (str.includes('#estudiante=')) {
    str = str.split('#estudiante=')[1].split('&')[0];
  }

  // Si viene formato JSON
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const obj = JSON.parse(str);
      if (obj.run) return obj.run;
      if (obj.id) return obj.id;
    } catch {
      // Ignorar
    }
  }

  // Limpiar caracteres extraños
  return str;
}
