# 🏛️ Banco Escolar Colegual
### Sistema de Recompensas y Ahorro por Comportamiento Positivo
**Escuela Rural Colegual • Llanquihue, Región de Los Lagos**

Bienvenido al **Banco Escolar Colegual**, una plataforma web diseñada para promover la buena convivencia, la responsabilidad y la motivación en clases a través de un sistema de ahorro y mérito escolar que simula un banco real.

---

## 🌟 Características Principales

1. **Nómina Oficial SIGE Precargada (68 Estudiantes)**:
   - Se procesaron las nóminas oficiales en PDF de los 10 cursos:
     - **Educación Parvularia**: Pre-Kínder (NT1), Kínder (NT2).
     - **Enseñanza Básica**: 1° a 8° Básico.
   - Cada estudiante cuenta con su **RUN**, **N° de Lista**, **Curso**, **Profesor Jefe** y **Número de Cuenta Bancaria Colegual** único.

2. **🪪 Tarjetas Bancarias con Código QR Personalizado**:
   - Diseño idéntico a una tarjeta de débito real: Chip EMV dorado simulado, símbolo contactless, logo oficial de la Escuela Rural Colegual, tipografía bancaria y código QR de alta legibilidad.
   - **Módulo de Impresión Integrado**: Genera hojas listas para imprimir en papel carta/A4 y termolaminar, con líneas de corte para tijera o guillotina. Se puede imprimir por curso completo o de forma individual.
   - También se generó el PDF de muestra listo: `Tarjetas_Banco_Colegual_Muestra.pdf`.

3. **📷 Lector de Tarjetas QR en Tiempo Real**:
   - Funciona directamente con la cámara del computador, notebook, tablet o celular del docente.
   - Al mostrar la tarjeta del estudiante:
     - Emite un sonido de lectura (*beep*).
     - Despliega inmediatamente el nombre y saldo del alumno.
     - Permite asignar puntos (+5, +10, +15, +20, +50) en 1 solo clic.
   - Incluye **Simulador de Escaneo** para hacer pruebas sin necesidad de cámara.
   - Compatible con lectores de código de barras/QR USB o Bluetooth.

4. **👨‍🏫 Panel de Gestión Docente**:
   - Selección de docente activo (Nicole Fuentes, Patricia Gallardo, Karla Henríquez, Paola Meléndez, Eduardo Altamirano o Administración).
   - Categorías preconfiguradas de conducta escolar positiva:
     - 🌟 Participación activa en clase (+10 pts)
     - 🤝 Compañerismo y empatía (+15 pts)
     - 📚 Responsabilidad y tareas al día (+15 pts)
     - 🧹 Cuidado de la sala y medioambiente (+10 pts)
     - ⏱️ Puntualidad y asistencia (+10 pts)
     - 💡 Esfuerzo y superación personal (+20 pts)
     - 👂 Escucha atenta y respeto de normas (+15 pts)
     - 🏆 Mérito destacado (+25 pts)
   - **Bono Grupal para Todo el Curso**: Botón para premiar a todos los alumnos de una clase simultáneamente.
   - Efectos sonoros interactivos (sintetizados con Web Audio API, 100% offline) y lluvia de confeti.

5. **🎁 Tienda de Recompensas (Canjes Escolares)**:
   - Catálogo de privilegios escolares y premios (Ej: *Ayudante del profesor por 1 día*, *Elegir puesto en la sala*, *Tiempo libre de lectura/dibujo*, *Sticker Colegual*, *Diploma de Honor*).
   - Control de saldo en tiempo real para evitar canjes sin fondos.
   - Los docentes pueden crear o modificar nuevas recompensas fácilmente.

6. **🏧 Kiosco / Cajero Automático de Consulta (ATM)**:
   - Pantalla interactiva para que los estudiantes consulten su saldo y nivel de ahorro (Semilla 🌱, Bronce 🥉, Plata 🥈, Oro 🥇, Diamante 💎).
   - Permite imprimir un **Comprobante de Saldo** térmico/recibo como en un cajero real.

7. **📊 Panel de Estadísticas y Auditoría**:
   - Total de puntos en circulación y premios entregados.
   - Ranking de cursos con más puntos.
   - Cuadro de honor con los mejores ahorristas.
   - Historial completo de transacciones auditables.
   - **Copias de Seguridad**: Exportación/Importación de respaldos en JSON y descarga de planillas en CSV (compatibles con Microsoft Excel).

---

## 🚀 Cómo Iniciar la Aplicación

Para abrir y utilizar el sistema en cualquier computador:

1. Abrir la terminal en la carpeta del proyecto y ejecutar:
   ```bash
   npm run dev
   ```
2. Abrir en el navegador (Google Chrome, Edge, Safari):
   ```
   http://localhost:5173/
   ```

*(El servidor local ya se encuentra ejecutándose en segundo plano en el puerto 5173).*

---

## 📂 Estructura del Proyecto

- `Logo Colegual.png`: Logo oficial de la escuela.
- `Nómina de estudiantes por cursos/`: Documentos oficiales SIGE en PDF (NT1 a 8° básico).
- `Tarjetas_Banco_Colegual_Muestra.pdf`: Archivo PDF con las tarjetas de los 68 estudiantes listas para imprimir y laminar.
- `src/data/students.js`: Base de datos de los 68 alumnos extraída de los PDF.
- `src/data/teachers.js`: Lista de docentes jefes por curso.
- `src/data/categories.js`: Categorías de comportamiento y puntos sugeridos.
- `src/data/rewards.js`: Catálogo de premios y privilegios canjeables.
- `src/services/storage.js`: Almacenamiento local persistente (`localStorage`).
- `src/services/sound.js`: Efectos de sonido nativos (offline).
- `src/services/qr.js`: Generador y decodificador de códigos QR.
- `src/components/`: Módulos interactivos (Tarjetas, Escáner, Docentes, Tienda, Kiosco, Auditoría).
- `src/styles/`: Estilos CSS modernos con diseño responsivo y reglas de impresión.
