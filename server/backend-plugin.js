import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import defaultStudents from '../src/data/students.js';
import defaultStaff from '../src/data/staff.js';
import defaultRewards from '../src/data/rewards.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../data/banco_colegual_db.json');

// Clientes conectados por SSE (Server-Sent Events)
const sseClients = new Set();

function broadcast(eventType, payload) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
      if (typeof client.flush === 'function') client.flush();
    } catch {
      sseClients.delete(client);
    }
  }
}

// Mantener conexiones SSE vivas contra desconexiones de routers Wi-Fi escolares
const pingInterval = setInterval(() => {
  if (sseClients.size === 0) return;
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
      if (typeof client.flush === 'function') client.flush();
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

if (typeof pingInterval.unref === 'function') {
  pingInterval.unref();
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

function getInitialDb() {
  const initialStudents = defaultStudents.map(s => ({
    ...s,
    saldo: 10,
    total_ganado: 10,
    total_canjeado: 0
  }));

  const now = new Date();
  const dateStr = formatDate(now);

  const initialTransactions = initialStudents.map(s => ({
    id: `tx_init_${s.id}`,
    timestamp: now.toISOString(),
    fecha_display: dateStr,
    estudiante_id: s.id,
    estudiante_run: s.run,
    estudiante_nombre: s.nombre_display,
    curso: s.curso,
    profesor: 'Banco Escolar Colegual',
    tipo: 'BONO',
    monto: 10,
    motivo: '🎁 Bono de apertura de cuenta Banco Colegual',
    categoria_id: 'bienvenida',
    saldo_resultante: 10
  }));

  return {
    students: initialStudents,
    staff: defaultStaff,
    rewards: defaultRewards,
    transactions: initialTransactions,
    lastUpdated: new Date().toISOString()
  };
}

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initDb = getInitialDb();
      saveDatabase(initDb);
      return initDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.students || !Array.isArray(parsed.students)) {
      throw new Error('Formato inválido');
    }
    return parsed;
  } catch (err) {
    console.error('[DB] Error cargando base de datos, creando inicial:', err);
    const initDb = getInitialDb();
    saveDatabase(initDb);
    return initDb;
  }
}

function saveDatabase(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[DB] Error guardando base de datos:', err);
    return false;
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Mapeo de cursos y profesores jefes para promoción anual
const COURSE_PROGRESSION = {
  'NT1': { nextCode: 'NT2', nextName: 'Kínder (NT2)', nextTeacher: 'Fuentes Bolla Nicole Andrea' },
  'NT2': { nextCode: '1', nextName: '1° Básico', nextTeacher: 'Docente de Aula' },
  '1': { nextCode: '2', nextName: '2° Básico', nextTeacher: 'Docente de Aula' },
  '2': { nextCode: '3', nextName: '3° Básico', nextTeacher: 'Henríquez Figueroa Karla Daniela' },
  '3': { nextCode: '4', nextName: '4° Básico', nextTeacher: 'Henríquez Figueroa Karla Daniela' },
  '4': { nextCode: '5', nextName: '5° Básico', nextTeacher: 'Meléndez Mansilla Paola Soledad' },
  '5': { nextCode: '6', nextName: '6° Básico', nextTeacher: 'Meléndez Mansilla Paola Soledad' },
  '6': { nextCode: '7', nextName: '7° Básico', nextTeacher: 'Altamirano Toelg Eduardo Javier' },
  '7': { nextCode: '8', nextName: '8° Básico', nextTeacher: 'Altamirano Toelg Eduardo Javier' },
  '8': { nextCode: 'EGRESADO', nextName: 'Egresados', nextTeacher: 'Dirección Colegual' }
};

export async function handleApiRequest(req, res) {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS' && req.url.startsWith('/api/')) {
    setCorsHeaders(res);
    res.statusCode = 204;
    res.end();
    return true;
  }

        // Endpoint SSE para sincronización en tiempo real entre computador y celulares
        if (req.url === '/api/events') {
          setCorsHeaders(res);
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
          });
          res.write('event: connected\ndata: {"status":"ok"}\n\n');
          if (typeof res.flushHeaders === 'function') res.flushHeaders();

          sseClients.add(res);

          req.on('close', () => {
            sseClients.delete(res);
          });
          return true;
        }

        // Endpoint GET /api/version (verificar si hay cambios para sincronización rápida)
        if (req.method === 'GET' && req.url === '/api/version') {
          setCorsHeaders(res);
          res.setHeader('Content-Type', 'application/json');
          const db = loadDatabase();
          res.end(JSON.stringify({
            lastUpdated: db.lastUpdated,
            txCount: db.transactions ? db.transactions.length : 0,
            studentCount: db.students ? db.students.length : 0
          }));
          return true;
        }

        // Endpoint GET /api/data (obtener estado central)
        if (req.method === 'GET' && req.url === '/api/data') {
          setCorsHeaders(res);
          res.setHeader('Content-Type', 'application/json');
          const db = loadDatabase();
          res.end(JSON.stringify(db));
          return true;
        }

        // Endpoint POST /api/transactions (abonar o canjear puntos)
        if (req.method === 'POST' && req.url === '/api/transactions') {
          setCorsHeaders(res);
          try {
            const body = await parseJsonBody(req);
            const { estudiante_id, monto, motivo, profesor, tipo = 'DEPOSITO', categoria_id = 'otro' } = body;

            const db = loadDatabase();
            const idx = db.students.findIndex(s => s.id === estudiante_id || s.run === estudiante_id);

            if (idx === -1) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Estudiante no encontrado' }));
              return true;
            }

            const st = db.students[idx];
            const numMonto = Number(monto);
            const newSaldo = Math.max(0, (st.saldo || 0) + numMonto);

            if (numMonto > 0) {
              st.total_ganado = (st.total_ganado || 0) + numMonto;
            } else if (numMonto < 0) {
              if (tipo === 'CANJE') {
                st.total_canjeado = (st.total_canjeado || 0) + Math.abs(numMonto);
              }
            }
            st.saldo = newSaldo;

            const now = new Date();
            const tx = {
              id: body.tx_id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              timestamp: body.timestamp || now.toISOString(),
              fecha_display: formatDate(now),
              estudiante_id: st.id,
              estudiante_run: st.run,
              estudiante_nombre: st.nombre_display,
              curso: st.curso,
              profesor: profesor || 'Funcionario Colegual',
              tipo,
              monto: numMonto,
              motivo: motivo || (numMonto > 0 ? 'ColegualCoins por conducta positiva' : (tipo === 'DESCUENTO' ? 'Descuento de ColegualCoins' : 'Canje de recompensa')),
              categoria_id,
              saldo_resultante: newSaldo
            };

            db.transactions.unshift(tx);
            saveDatabase(db);

            // Transmitir evento a todos los navegadores abiertos (computador y teléfonos)
            broadcast('DATA_UPDATED', {
              action: 'TRANSACTION_ADDED',
              student: st,
              transaction: tx,
              lastUpdated: db.lastUpdated
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, student: st, transaction: tx, lastUpdated: db.lastUpdated }));
          } catch (err) {
            console.error('[API] Error procesando transacción:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return true;
        }

        // Endpoint POST /api/batch (bono de curso)
        if (req.method === 'POST' && req.url === '/api/batch') {
          setCorsHeaders(res);
          try {
            const body = await parseJsonBody(req);
            const { curso_codigo, monto = 10, motivo, profesor, categoria_id = 'grupal' } = body;

            const db = loadDatabase();
            const now = new Date();
            const dateStr = formatDate(now);
            const numMonto = Number(monto);
            const affected = [];

            db.students.forEach(st => {
              if (st.curso_codigo === curso_codigo && !st.retirado) {
                st.saldo = (st.saldo || 0) + numMonto;
                st.total_ganado = (st.total_ganado || 0) + numMonto;
                affected.push(st);

                db.transactions.unshift({
                  id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                  timestamp: now.toISOString(),
                  fecha_display: dateStr,
                  estudiante_id: st.id,
                  estudiante_run: st.run,
                  estudiante_nombre: st.nombre_display,
                  curso: st.curso,
                  profesor: profesor || 'Docente de Curso',
                  tipo: 'CURSO_BONO',
                  monto: numMonto,
                  motivo: motivo || `Bono de Curso: +${numMonto} ColegualCoins`,
                  categoria_id,
                  saldo_resultante: st.saldo
                });
              }
            });

            saveDatabase(db);

            broadcast('DATA_UPDATED', {
              action: 'COURSE_BATCH_AWARDED',
              curso_codigo,
              count: affected.length,
              lastUpdated: db.lastUpdated
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: affected.length, lastUpdated: db.lastUpdated }));
          } catch (err) {
            console.error('[API] Error en bono grupal:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return true;
        }

        // Endpoint POST /api/students (crear nuevo estudiante)
        if (req.method === 'POST' && req.url === '/api/students') {
          setCorsHeaders(res);
          try {
            const body = await parseJsonBody(req);
            const {
              run,
              nombre_completo,
              nombre_display,
              curso_codigo,
              curso,
              profesor_jefe,
              nro_lista = 1,
              edad = 6,
              saldo_inicial = 10,
              comuna = 'Llanquihue'
            } = body;

            if (!run || !nombre_completo || !curso_codigo) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'RUN, nombre y curso son obligatorios.' }));
              return true;
            }

            const db = loadDatabase();
            const cleanRun = run.trim().replace(/\./g, '');
            const existing = db.students.find(s => s.run.replace(/\./g, '') === cleanRun);
            if (existing) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Ya existe un estudiante con ese RUN.' }));
              return true;
            }

            const cleanId = 'est_' + cleanRun.replace(/[^a-zA-Z0-9]/g, '');
            const runSuffix = cleanRun.slice(-4).replace(/[^a-zA-Z0-9]/g, '');
            const newNroCuenta = `7967-${curso_codigo}-${runSuffix}-${String(db.students.length + 1).padStart(4, '0')}`;

            const newStudent = {
              id: cleanId,
              run: cleanRun,
              nombre_completo: nombre_completo.trim().toUpperCase(),
              nombre_display: nombre_display ? nombre_display.trim() : nombre_completo.trim(),
              curso_codigo,
              curso: curso || curso_codigo,
              profesor_jefe: profesor_jefe || '',
              nro_lista: Number(nro_lista) || db.students.filter(s => s.curso_codigo === curso_codigo).length + 1,
              nro_cuenta: newNroCuenta,
              edad: Number(edad) || 6,
              fecha_incorporacion: formatDate(new Date()).split(' ')[0],
              comuna,
              retirado: false,
              saldo: Number(saldo_inicial) || 10,
              total_ganado: Number(saldo_inicial) || 10,
              total_canjeado: 0
            };

            db.students.push(newStudent);

            // Transacción inicial de bienvenida
            const now = new Date();
            db.transactions.unshift({
              id: `tx_init_${newStudent.id}`,
              timestamp: now.toISOString(),
              fecha_display: formatDate(now),
              estudiante_id: newStudent.id,
              estudiante_run: newStudent.run,
              estudiante_nombre: newStudent.nombre_display,
              curso: newStudent.curso,
              profesor: 'Banco Escolar Colegual',
              tipo: 'BONO',
              monto: Number(saldo_inicial) || 10,
              motivo: '🎁 Bono de apertura de cuenta Banco Colegual',
              categoria_id: 'bienvenida',
              saldo_resultante: Number(saldo_inicial) || 10
            });

            saveDatabase(db);

            broadcast('DATA_UPDATED', {
              action: 'STUDENT_ADDED',
              student: newStudent,
              lastUpdated: db.lastUpdated
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, student: newStudent, lastUpdated: db.lastUpdated }));
          } catch (err) {
            console.error('[API] Error agregando estudiante:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return true;
        }

        // Endpoint POST /api/students/update (editar estudiante existente)
        if (req.method === 'POST' && req.url === '/api/students/update') {
          setCorsHeaders(res);
          try {
            const body = await parseJsonBody(req);
            const { id, run, nombre_completo, nombre_display, curso_codigo, curso, profesor_jefe, nro_lista, edad, retirado } = body;

            const db = loadDatabase();
            const idx = db.students.findIndex(s => s.id === id);
            if (idx === -1) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Estudiante no encontrado.' }));
              return true;
            }

            const current = db.students[idx];
            db.students[idx] = {
              ...current,
              run: run ? run.trim().replace(/\./g, '') : current.run,
              nombre_completo: nombre_completo ? nombre_completo.trim().toUpperCase() : current.nombre_completo,
              nombre_display: nombre_display ? nombre_display.trim() : (nombre_completo ? nombre_completo.trim() : current.nombre_display),
              curso_codigo: curso_codigo || current.curso_codigo,
              curso: curso || current.curso,
              profesor_jefe: profesor_jefe !== undefined ? profesor_jefe : current.profesor_jefe,
              nro_lista: nro_lista !== undefined ? Number(nro_lista) : current.nro_lista,
              edad: edad !== undefined ? Number(edad) : current.edad,
              retirado: retirado !== undefined ? Boolean(retirado) : current.retirado
            };

            const updatedStudent = db.students[idx];
            saveDatabase(db);

            broadcast('DATA_UPDATED', {
              action: 'STUDENT_UPDATED',
              student: updatedStudent,
              lastUpdated: db.lastUpdated
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, student: updatedStudent, lastUpdated: db.lastUpdated }));
          } catch (err) {
            console.error('[API] Error editando estudiante:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return true;
        }

        // Endpoint POST /api/students/delete (eliminar estudiante)
        if (req.method === 'POST' && req.url === '/api/students/delete') {
          setCorsHeaders(res);
          try {
            const body = await parseJsonBody(req);
            const { id } = body;

            const db = loadDatabase();
            const idx = db.students.findIndex(s => s.id === id);
            if (idx === -1) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Estudiante no encontrado.' }));
              return true;
            }

            const removed = db.students.splice(idx, 1)[0];
            saveDatabase(db);

            broadcast('DATA_UPDATED', {
              action: 'STUDENT_DELETED',
              studentId: id,
              lastUpdated: db.lastUpdated
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, removed, lastUpdated: db.lastUpdated }));
          } catch (err) {
            console.error('[API] Error eliminando estudiante:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return true;
        }

        // Endpoint POST /api/students/promote-year (avanzar año escolar para todos los cursos)
        if (req.method === 'POST' && req.url === '/api/students/promote-year') {
          setCorsHeaders(res);
          try {
            const body = await parseJsonBody(req);
            if (String(body.pin).trim() !== '3834') {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'PIN incorrecto. Se requiere el PIN 3834 para avanzar el año escolar.' }));
              return true;
            }

            const db = loadDatabase();
            const now = new Date();
            const currentYear = now.getFullYear();
            const nextYear = currentYear + 1;
            const dateStr = formatDate(now);

            let promotedCount = 0;
            let graduatedCount = 0;

            db.students.forEach(st => {
              if (st.retirado) return;

              const prog = COURSE_PROGRESSION[st.curso_codigo];
              if (prog) {
                if (prog.nextCode === 'EGRESADO') {
                  st.curso_codigo = 'EGRESADO';
                  st.curso = 'Egresados (8° Básico Cumplido)';
                  st.retirado = true;
                  graduatedCount++;
                } else {
                  st.curso_codigo = prog.nextCode;
                  st.curso = prog.nextName;
                  st.profesor_jefe = prog.nextTeacher;
                  st.edad = (st.edad || 6) + 1;
                  promotedCount++;
                }

                // Registrar bono o hito de cambio de año
                db.transactions.unshift({
                  id: `tx_prom_${st.id}_${Date.now()}`,
                  timestamp: now.toISOString(),
                  fecha_display: dateStr,
                  estudiante_id: st.id,
                  estudiante_run: st.run,
                  estudiante_nombre: st.nombre_display,
                  curso: st.curso,
                  profesor: 'Dirección Escuela Rural Colegual',
                  tipo: 'BONO',
                  monto: 0,
                  motivo: `🎓 Promoción al Año Escolar ${nextYear} (${st.curso})`,
                  categoria_id: 'anual',
                  saldo_resultante: st.saldo
                });
              }
            });

            saveDatabase(db);

            broadcast('DATA_UPDATED', {
              action: 'YEAR_PROMOTED',
              promotedCount,
              graduatedCount,
              nextYear,
              lastUpdated: db.lastUpdated
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              promotedCount,
              graduatedCount,
              nextYear,
              lastUpdated: db.lastUpdated
            }));
          } catch (err) {
            console.error('[API] Error en promoción de año:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return true;
        }

        // Endpoint POST /api/reset (reinicio de fábrica con PIN 3834)
        if (req.method === 'POST' && req.url === '/api/reset') {
          setCorsHeaders(res);
          try {
            const body = await parseJsonBody(req);
            if (String(body.pin).trim() !== '3834') {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'PIN incorrecto. Ingresa el PIN 3834 para autorizar el reinicio.' }));
              return true;
            }

            const initDb = getInitialDb();
            saveDatabase(initDb);

            broadcast('DATA_UPDATED', { action: 'DATA_RESET', lastUpdated: initDb.lastUpdated });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, lastUpdated: initDb.lastUpdated }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
          return true;
        }

  if (req.url && req.url.startsWith('/api/')) {
    setCorsHeaders(res);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint API no encontrado' }));
    return true;
  }

  return false;
}

export function bancoColegualBackend() {
  return {
    name: 'banco-colegual-sync-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const handled = await handleApiRequest(req, res);
          if (handled) return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const handled = await handleApiRequest(req, res);
          if (handled) return;
        }
        next();
      });
    }
  };
}
