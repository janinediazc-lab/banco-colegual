import defaultStudents from '../data/students.js';
import defaultStaff from '../data/staff.js';
import defaultCategories, { DEDUCTION_CATEGORIES } from '../data/categories.js';
import defaultRewards from '../data/rewards.js';

const STORAGE_KEYS = {
  STUDENTS: 'banco_colegual_students_v1',
  STAFF: 'banco_colegual_staff_v4',
  TEACHERS: 'banco_colegual_staff_v4', // Compatibilidad
  CATEGORIES: 'banco_colegual_categories_v2',
  REWARDS: 'banco_colegual_rewards_v1',
  TRANSACTIONS: 'banco_colegual_transactions_v1',
  ACTIVE_STAFF: 'banco_colegual_active_staff_v2',
  ACTIVE_TEACHER: 'banco_colegual_active_staff_v2', // Compatibilidad
  PENDING_SYNC: 'banco_colegual_pending_sync_v2'
};

class StorageService {
  constructor() {
    this.listeners = new Set();
    this.eventSource = null;
    this.lastSyncedTimestamp = null;
    this.pollingTimer = null;
    this.isFlushingQueue = false;
    this.init();
    this.syncWithServer();
  }

  getPendingSyncQueue() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  savePendingSyncQueue(queue) {
    try {
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(queue));
    } catch {}
  }

  addToPendingSync(type, payload) {
    const queue = this.getPendingSyncQueue();
    // Evitar duplicados por tx_id si aplica
    if (payload.tx_id && queue.some(item => item.payload && item.payload.tx_id === payload.tx_id)) {
      return;
    }
    queue.push({
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload
    });
    this.savePendingSyncQueue(queue);
  }

  async flushPendingSyncQueue() {
    if (typeof window === 'undefined' || !window.fetch || this.isFlushingQueue) return;
    const queue = this.getPendingSyncQueue();
    if (queue.length === 0) return;

    this.isFlushingQueue = true;
    const remaining = [];

    for (const item of queue) {
      try {
        const url = item.type === 'BATCH' ? '/api/batch' : '/api/transactions';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
        if (!res.ok) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    this.savePendingSyncQueue(remaining);
    this.isFlushingQueue = false;
  }

  async fetchAndApplyServerData() {
    if (typeof window === 'undefined' || !window.fetch) return;
    try {
      // 1. Vaciar cualquier transacción pendiente antes de descargar el estado global
      await this.flushPendingSyncQueue();

      const res = await fetch('/api/data');
      if (res.ok) {
        const db = await res.json();
        if (db && Array.isArray(db.students)) {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(db.students));
          if (Array.isArray(db.transactions)) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(db.transactions));
          }
          if (Array.isArray(db.staff)) {
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(db.staff));
          }
          if (Array.isArray(db.rewards)) {
            localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(db.rewards));
          }
          this.lastSyncedTimestamp = db.lastUpdated || new Date().toISOString();
          this.notify('STUDENTS_UPDATED', db.students);
          this.notify('TRANSACTION_ADDED', db.transactions ? db.transactions[0] : null);
          return db;
        }
      }
    } catch (err) {
      console.warn('[Sync] Servidor offline, operando con almacenamiento local:', err);
    }
    return null;
  }

  async syncWithServer() {
    if (typeof window === 'undefined') return;

    // Sincronización inicial inmediata
    await this.fetchAndApplyServerData();

    // 1. Configurar SSE (Server-Sent Events) para actualizaciones instantáneas (<50ms)
    if (window.EventSource) {
      try {
        if (this.eventSource) this.eventSource.close();
        this.eventSource = new EventSource('/api/events');

        const handleUpdate = () => {
          this.fetchAndApplyServerData();
        };

        this.eventSource.addEventListener('DATA_UPDATED', handleUpdate);
        this.eventSource.addEventListener('message', handleUpdate);

        this.eventSource.onerror = () => {
          // Si SSE falla o la red se interrumpe, el polling de respaldo tomará el control
        };
      } catch (err) {
        console.warn('[Sync] SSE no disponible:', err);
      }
    }

    // 2. Polling inteligente de alta frecuencia (cada 2.5 segundos)
    // Compara la versión/timestamp del servidor para garantizar sincronización 100% infalible en Wi-Fi escolar
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(async () => {
      try {
        if (!window.fetch) return;
        const res = await fetch('/api/version');
        if (res.ok) {
          const ver = await res.json();
          if (ver && ver.lastUpdated && ver.lastUpdated !== this.lastSyncedTimestamp) {
            await this.fetchAndApplyServerData();
          }
        }
      } catch {
        // Red momentáneamente no disponible
      }
    }, 2500);

    // 3. Reactivación al volver a la pestaña o desbloquear celular
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.fetchAndApplyServerData();
        }
      });
      window.addEventListener('focus', () => {
        this.fetchAndApplyServerData();
      });
    }
  }

  init() {
    // Inicializar estudiantes si no existen
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      const initialStudents = defaultStudents.map(s => ({
        ...s,
        saldo: 10,
        total_ganado: 10,
        total_canjeado: 0
      }));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));

      // Crear transacciones iniciales de bienvenida
      const initialTransactions = initialStudents.map(s => ({
        id: `tx_init_${s.id}`,
        timestamp: new Date().toISOString(),
        fecha_display: this.formatDate(new Date()),
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
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
    }

    // Inicializar funcionarios (Docentes + Asistentes de la Educación)
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(defaultStaff));
    }

    // Inicializar categorías ampliadas
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));

    if (!localStorage.getItem(STORAGE_KEYS.REWARDS)) {
      localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(defaultRewards));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_STAFF)) {
      // Por defecto Janine Díaz (Inspectora General) o el primer directivo
      const janine = defaultStaff.find(s => s.nombre.includes('Janine'));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STAFF, janine?.id || defaultStaff[0]?.id || 'func_admin');
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(eventType, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(eventType, payload);
      } catch (err) {
        console.error('Error in storage listener', err);
      }
    });
  }

  formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // --- ESTUDIANTES ---
  getStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return defaultStudents;
    }
  }

  getStudentById(id) {
    const list = this.getStudents();
    return list.find(s => s.id === id);
  }

  getStudentByRun(rawRun) {
    if (!rawRun) return null;
    const clean = rawRun.toString().replace(/[^0-9kK]/g, '').toUpperCase();
    const list = this.getStudents();
    return list.find(s => {
      const sClean = s.run.replace(/[^0-9kK]/g, '').toUpperCase();
      return sClean === clean || s.nro_cuenta.includes(clean);
    });
  }

  saveStudents(students) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.notify('STUDENTS_UPDATED', students);
  }

  updateStudent(studentUpdate) {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.id === studentUpdate.id);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...studentUpdate };
      this.saveStudents(students);
      return students[idx];
    }
    return null;
  }

  // --- TRANSACCIONES & PUNTOS ---
  addTransaction({ estudiante_id, monto, motivo, profesor, tipo = 'DEPOSITO', categoria_id = 'otro' }) {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.id === estudiante_id);
    if (idx === -1) {
      throw new Error('Estudiante no encontrado');
    }

    const st = students[idx];
    const newSaldo = Math.max(0, (st.saldo || 0) + monto);
    const numMonto = Number(monto);

    if (numMonto > 0) {
      st.total_ganado = (st.total_ganado || 0) + numMonto;
    } else if (numMonto < 0) {
      if (tipo === 'CANJE') {
        st.total_canjeado = (st.total_canjeado || 0) + Math.abs(numMonto);
      }
    }
    st.saldo = newSaldo;

    const activeStaff = this.getActiveStaff();
    const staffDisplay = profesor || activeStaff.nombre;

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      fecha_display: this.formatDate(new Date()),
      estudiante_id: st.id,
      estudiante_run: st.run,
      estudiante_nombre: st.nombre_display,
      curso: st.curso,
      profesor: staffDisplay,
      tipo,
      monto: numMonto,
      motivo: motivo || (numMonto > 0 ? 'ColegualCoins por conducta positiva' : (tipo === 'DESCUENTO' ? 'Descuento de ColegualCoins' : 'Canje de recompensa')),
      categoria_id,
      saldo_resultante: newSaldo
    };

    const transactions = this.getTransactions();
    transactions.unshift(tx);

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    this.notify('TRANSACTION_ADDED', { transaction: tx, student: st });

    // Sincronizar inmediatamente con el servidor central para que todos los dispositivos se actualicen
    if (typeof window !== 'undefined' && window.fetch) {
      const payload = {
        estudiante_id: st.id,
        monto: numMonto,
        motivo,
        profesor: staffDisplay,
        tipo,
        categoria_id,
        tx_id: tx.id,
        timestamp: tx.timestamp
      };
      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) {
          this.addToPendingSync('TRANSACTION', payload);
          return null;
        }
        return res.json();
      }).then(data => {
        if (data && data.lastUpdated) this.lastSyncedTimestamp = data.lastUpdated;
      }).catch(err => {
        console.warn('[Sync] Transacción en cola para reintento automático:', err);
        this.addToPendingSync('TRANSACTION', payload);
      });
    }

    return { transaction: tx, student: st };
  }

  addCourseBatchPoints({ curso_codigo, monto, motivo, profesor, categoria_id }) {
    const students = this.getStudents();
    const affected = [];
    const transactions = this.getTransactions();
    const now = new Date();
    const dateStr = this.formatDate(now);

    const activeStaff = this.getActiveStaff();
    const staffDisplay = profesor || activeStaff.nombre;

    students.forEach(st => {
      if (st.curso_codigo === curso_codigo && !st.retirado) {
        st.saldo = (st.saldo || 0) + monto;
        st.total_ganado = (st.total_ganado || 0) + monto;
        affected.push(st);

        transactions.unshift({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: now.toISOString(),
          fecha_display: dateStr,
          estudiante_id: st.id,
          estudiante_run: st.run,
          estudiante_nombre: st.nombre_display,
          curso: st.curso,
          profesor: staffDisplay,
          tipo: 'CURSO_BONO',
          monto,
          motivo: `[Bono de Curso] ${motivo}`,
          categoria_id,
          saldo_resultante: st.saldo
        });
      }
    });

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    this.notify('COURSE_BATCH_AWARDED', { curso_codigo, affected, count: affected.length });

    // Sincronizar inmediatamente con el servidor central
    if (typeof window !== 'undefined' && window.fetch) {
      const payload = {
        curso_codigo,
        monto,
        motivo,
        profesor: staffDisplay,
        categoria_id
      };
      fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) {
          this.addToPendingSync('BATCH', payload);
          return null;
        }
        return res.json();
      }).then(data => {
        if (data && data.lastUpdated) this.lastSyncedTimestamp = data.lastUpdated;
      }).catch(err => {
        console.warn('[Sync] Bono de curso en cola para reintento automático:', err);
        this.addToPendingSync('BATCH', payload);
      });
    }

    return affected;
  }

  getTransactions(filter = {}) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      let list = data ? JSON.parse(data) : [];
      if (filter.estudiante_id) {
        list = list.filter(t => t.estudiante_id === filter.estudiante_id);
      }
      if (filter.curso) {
        list = list.filter(t => t.curso === filter.curso);
      }
      return list;
    } catch {
      return [];
    }
  }

  // --- FUNCIONARIOS (DOCENTES Y ASISTENTES DE LA EDUCACIÓN) ---
  getStaff() {
    const removedIds = ['func_78009268', 'func_173016948', 'func_187555523'];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      const list = data ? JSON.parse(data) : defaultStaff;
      return list.filter(s => !removedIds.includes(s.id));
    } catch {
      return defaultStaff.filter(s => !removedIds.includes(s.id));
    }
  }

  // Alias compatible
  getTeachers() {
    return this.getStaff();
  }

  getActiveStaff() {
    const staffList = this.getStaff();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_STAFF);
    return staffList.find(s => s.id === activeId) || staffList[0] || {
      id: 'func_admin',
      nombre: 'Equipo Directivo Colegual',
      cargo: '',
      cursos: ['Todos los cursos']
    };
  }

  getActiveTeacher() {
    return this.getActiveStaff();
  }

  setActiveStaff(staffId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STAFF, staffId);
    this.notify('STAFF_CHANGED', this.getActiveStaff());
    this.notify('TEACHER_CHANGED', this.getActiveStaff());
  }

  setActiveTeacher(teacherId) {
    this.setActiveStaff(teacherId);
  }

  // --- AUTENTICACIÓN CON CONTRASEÑA DE FUNCIONARIO ---
  getStaffFirstName(fullName) {
    if (!fullName) return '';
    return fullName.trim().split(' ')[0];
  }

  verifyStaffPassword(staff, inputPwd) {
    if (!staff || !inputPwd) return false;
    const firstName = this.getStaffFirstName(staff.nombre);
    const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const expected = normalize(firstName) + '7967';
    const input = normalize(inputPwd);
    return expected === input;
  }

  isStaffAuthenticated(staffId) {
    const activeStaff = this.getActiveStaff();
    const targetId = staffId || (activeStaff ? activeStaff.id : null);
    if (!targetId) return false;
    const authStaffId = sessionStorage.getItem('banco_colegual_auth_staff') || localStorage.getItem('banco_colegual_auth_staff');
    return authStaffId === targetId;
  }

  authenticateStaff(staffId, inputPwd) {
    const staff = this.getStaff().find(s => s.id === staffId);
    if (!staff) {
      return { success: false, error: 'Funcionario no encontrado.' };
    }

    if (!this.verifyStaffPassword(staff, inputPwd)) {
      return {
        success: false,
        error: 'Contraseña incorrecta. Inténtalo nuevamente.'
      };
    }

    localStorage.setItem('banco_colegual_auth_staff', staff.id);
    sessionStorage.setItem('banco_colegual_auth_staff', staff.id);
    this.setActiveStaff(staff.id);
    this.notify('STAFF_AUTHENTICATED', staff);
    return { success: true, staff };
  }

  // --- CATEGORIAS & RECOMPENSAS ---
  getCategories() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : defaultCategories;
    } catch {
      return defaultCategories;
    }
  }

  getDeductionCategories() {
    return DEDUCTION_CATEGORIES;
  }

  getRewards() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REWARDS);
      return data ? JSON.parse(data) : defaultRewards;
    } catch {
      return defaultRewards;
    }
  }

  saveReward(reward) {
    const rewards = this.getRewards();
    if (!reward.id) {
      reward.id = `rew_${Date.now()}`;
      rewards.push(reward);
    } else {
      const idx = rewards.findIndex(r => r.id === reward.id);
      if (idx !== -1) rewards[idx] = reward;
      else rewards.push(reward);
    }
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
    this.notify('REWARDS_UPDATED', rewards);
    return reward;
  }

  deleteReward(id) {
    let rewards = this.getRewards();
    rewards = rewards.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
    this.notify('REWARDS_UPDATED', rewards);
  }

  // --- EXPORTAR / IMPORTAR / RESTABLECER ---
  exportBackup() {
    const backup = {
      version: '2.0',
      escuela: 'Escuela Rural Colegual',
      exportDate: new Date().toISOString(),
      students: this.getStudents(),
      staff: this.getStaff(),
      categories: this.getCategories(),
      rewards: this.getRewards(),
      transactions: this.getTransactions()
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackup(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.students && Array.isArray(parsed.students)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(parsed.students));
      }
      if (parsed.staff && Array.isArray(parsed.staff)) {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(parsed.staff));
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(parsed.categories));
      }
      if (parsed.rewards && Array.isArray(parsed.rewards)) {
        localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(parsed.rewards));
      }
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed.transactions));
      }
      this.notify('DATA_RESET', null);
      return true;
    } catch (e) {
      console.error('Error importando respaldo', e);
      return false;
    }
  }

  exportCSV() {
    const students = this.getStudents();
    const headers = ['Nro Lista', 'RUN', 'Nombre Completo', 'Curso', 'Profesor Jefe', 'Saldo ColegualCoins (CC)', 'Total Ganado (CC)', 'Total Canjeado (CC)', 'Estado'];
    const rows = students.map(s => [
      s.nro_lista,
      s.run,
      `"${s.nombre_completo}"`,
      `"${s.curso}"`,
      `"${s.profesor_jefe}"`,
      s.saldo || 0,
      s.total_ganado || 0,
      s.total_canjeado || 0,
      s.retirado ? 'Retirado' : 'Activo'
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // --- GESTIÓN DE ESTUDIANTES Y MATRÍCULA ---
  async addStudent(studentData) {
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al agregar estudiante');
        await this.fetchAndApplyServerData();
        return result;
      } catch (err) {
        console.error('Error en addStudent API:', err);
        throw err;
      }
    }
  }

  async updateStudentServer(studentData) {
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const res = await fetch('/api/students/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al actualizar estudiante');
        await this.fetchAndApplyServerData();
        return result;
      } catch (err) {
        console.error('Error en updateStudentServer:', err);
        throw err;
      }
    }
  }

  async deleteStudent(studentId) {
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const res = await fetch('/api/students/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: studentId })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al eliminar estudiante');
        await this.fetchAndApplyServerData();
        return result;
      } catch (err) {
        console.error('Error en deleteStudent:', err);
        throw err;
      }
    }
  }

  async promoteSchoolYear(pin = '3834') {
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const res = await fetch('/api/students/promote-year', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al promover año escolar');
        await this.fetchAndApplyServerData();
        this.notify('YEAR_PROMOTED', result);
        return result;
      } catch (err) {
        console.error('Error en promoteSchoolYear:', err);
        throw err;
      }
    }
  }

  async resetToDefault(pin = '3834') {
    if (typeof window !== 'undefined' && window.fetch) {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'PIN incorrecto. Ingresa el PIN 3834.');
    }

    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.REWARDS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    this.init();
    await this.fetchAndApplyServerData();
    this.notify('DATA_RESET', null);
    return { success: true };
  }
}

export const storage = new StorageService();
