/**
 * Servicio de Persistencia en Base de Datos Externa en la Nube (Supabase REST)
 * Permite que los saldos, transacciones y datos de Banco Colegual sobrevivan
 * de forma permanente a reinicios, despliegues y mantenimiento de Render.
 * 
 * Utiliza HTTP REST nativo de Node.js (fetch), sin necesidad de binarios pesados.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE_NAME = 'banco_colegual_state';
const STATE_ID = 'colegual_state';

let lastCloudSyncTime = null;
let lastCloudError = null;

export function isCloudDbConfigured() {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}

/**
 * Consulta la base de datos externa para obtener el estado más reciente.
 * Se ejecuta al arrancar el servidor en Render.
 */
export async function pullFromCloud() {
  if (!isCloudDbConfigured()) {
    console.log('[CloudDB] Base de datos externa no configurada en variables de entorno (operando con banco_colegual_db.json local).');
    return null;
  }

  try {
    const cleanUrl = SUPABASE_URL.replace(/\/$/, '');
    const endpoint = `${cleanUrl}/rest/v1/${TABLE_NAME}?id=eq.${STATE_ID}&select=data,updated_at`;

    console.log(`[CloudDB] 🔄 Consultando base de datos permanente en Supabase: ${cleanUrl}...`);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[CloudDB] Respuesta no exitosa al leer Supabase (${res.status}):`, errText);
      lastCloudError = `HTTP ${res.status}: ${errText}`;
      return null;
    }

    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
      const cloudData = rows[0].data;
      lastCloudSyncTime = rows[0].updated_at || new Date().toISOString();
      console.log(`[CloudDB] ✅ Estado recuperado con éxito desde la nube. Estudiantes: ${cloudData.students?.length || 0}, Transacciones: ${cloudData.transactions?.length || 0}`);
      return cloudData;
    } else {
      console.log('[CloudDB] Tabla existente pero sin registro previo. Se inicializará con datos locales.');
      return null;
    }
  } catch (err) {
    console.error('[CloudDB] Error de conexión con Supabase:', err.message);
    lastCloudError = err.message;
    return null;
  }
}

/**
 * Guarda y sincroniza el estado completo en Supabase de forma asíncrona.
 * Se llama cada vez que un profesor asigna puntos o se modifica la base de datos.
 */
export async function pushToCloud(dbData) {
  if (!isCloudDbConfigured()) return false;

  try {
    const cleanUrl = SUPABASE_URL.replace(/\/$/, '');
    const endpoint = `${cleanUrl}/rest/v1/${TABLE_NAME}`;

    const payload = {
      id: STATE_ID,
      data: dbData,
      updated_at: new Date().toISOString()
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Upsert automático (inserta o actualiza)
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[CloudDB] Advertencia al sincronizar en Supabase (${res.status}):`, errText);
      lastCloudError = `HTTP ${res.status}: ${errText}`;
      return false;
    }

    lastCloudSyncTime = payload.updated_at;
    lastCloudError = null;
    return true;
  } catch (err) {
    console.error('[CloudDB] Error sincronizando a la nube:', err.message);
    lastCloudError = err.message;
    return false;
  }
}

export function getCloudStatus() {
  return {
    configured: isCloudDbConfigured(),
    provider: isCloudDbConfigured() ? 'Supabase' : 'Local File (banco_colegual_db.json)',
    lastCloudSyncTime,
    lastCloudError,
    supabaseUrl: SUPABASE_URL ? SUPABASE_URL.split('//')[1]?.split('.')[0] + '.supabase.co' : null
  };
}
