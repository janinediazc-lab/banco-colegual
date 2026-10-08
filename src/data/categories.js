export default [
  {
    "id": "part",
    "nombre": "Participación Activa en Clases",
    "puntos": 10,
    "icono": "🌟",
    "descripcion": "Participa en clases, responde preguntas y realiza sus actividades con entusiasmo",
    "color": "#10b981",
    "ambito": "Aula"
  },
  {
    "id": "comp",
    "nombre": "Compañerismo y Buena Convivencia",
    "puntos": 15,
    "icono": "🤝",
    "descripcion": "Ayuda a compañeros, demuestra empatía, solidaridad y buen trato",
    "color": "#3b82f6",
    "ambito": "Convivencia"
  },
  {
    "id": "resp",
    "nombre": "Responsabilidad y Deberes al Día",
    "puntos": 15,
    "icono": "📚",
    "descripcion": "Cumple oportunamente con sus tareas, cuadernos, guías y materiales",
    "color": "#8b5cf6",
    "ambito": "Aula"
  },
  {
    "id": "transporte",
    "nombre": "Conducta Ejemplar en Transporte Escolar",
    "puntos": 10,
    "icono": "🚌",
    "descripcion": "Usa cinturón, respeta al conductor, cuida el furgón y convive con tranquilidad",
    "color": "#f59e0b",
    "ambito": "Transporte"
  },
  {
    "id": "biblioteca",
    "nombre": "Cuidado y Lectura en Biblioteca CRA",
    "puntos": 10,
    "icono": "📖",
    "descripcion": "Respeta el silencio, cuida los libros, devuelve a tiempo y colabora con el CRA",
    "color": "#0284c7",
    "ambito": "Biblioteca"
  },
  {
    "id": "cuid",
    "nombre": "Cuidado del Entorno y Limpieza Escolar",
    "puntos": 10,
    "icono": "🧹",
    "descripcion": "Mantiene limpia su sala y el patio, cuida plantas, reciclaje y mobiliario",
    "color": "#059669",
    "ambito": "Espacios Comunes"
  },
  {
    "id": "casino",
    "nombre": "Buenos Hábitos en Casino y Comedor",
    "puntos": 10,
    "icono": "🍲",
    "descripcion": "Respeta su turno en la fila, agradece la alimentación y deja la mesa impecable",
    "color": "#ea580c",
    "ambito": "Espacios Comunes"
  },
  {
    "id": "recreo",
    "nombre": "Juego Limpio y Convivencia en Recreos",
    "puntos": 15,
    "icono": "⚽",
    "descripcion": "Comparte balones y juegos, resuelve desacuerdos mediante el diálogo y la alegría",
    "color": "#16a34a",
    "ambito": "Patio"
  },
  {
    "id": "apoyo",
    "nombre": "Compromiso en Apoyo PIE / Fono / Psico",
    "puntos": 15,
    "icono": "🧠",
    "descripcion": "Excelente disposición, asistencia y constancia en sus sesiones especializadas",
    "color": "#9333ea",
    "ambito": "Apoyo Profesional"
  },
  {
    "id": "punt",
    "nombre": "Puntualidad y Asistencia Destacada",
    "puntos": 10,
    "icono": "⏱️",
    "descripcion": "Llega a la hora a todas sus actividades y aprovecha al máximo la jornada",
    "color": "#0284c7",
    "ambito": "General"
  },
  {
    "id": "esf",
    "nombre": "Esfuerzo y Superación Personal",
    "puntos": 20,
    "icono": "💡",
    "descripcion": "Persevera ante dificultades, demuestra ganas de mejorar y actitud positiva",
    "color": "#eab308",
    "ambito": "General"
  },
  {
    "id": "merito",
    "nombre": "Mérito Destacado de Inspectoría / Dirección",
    "puntos": 25,
    "icono": "🏆",
    "descripcion": "Reconocimiento institucional por una acción ciudadana, valor cívico o honestidad",
    "color": "#b45309",
    "ambito": "Directivo"
  }
];

export const DEDUCTION_CATEGORIES = [
  {
    id: "falta_convivencia",
    nombre: "Falta a la Buena Convivencia Escolar",
    puntos: 10,
    icono: "⚠️",
    descripcion: "Burlas, apodos, falta de respeto o agresión verbal/física entre compañeros",
    color: "#dc2626",
    ambito: "Convivencia"
  },
  {
    id: "dano_entorno",
    nombre: "Descuido o Daño al Entorno y Mobiliario",
    puntos: 10,
    icono: "🗑️",
    descripcion: "Botar basura deliberada, rayar o dañar mobiliario, libros o áreas verdes",
    color: "#b91c1c",
    ambito: "Espacios Comunes"
  },
  {
    id: "incumplimiento_deberes",
    nombre: "Incumplimiento Reiterado de Deberes",
    puntos: 10,
    icono: "📚",
    descripcion: "No realizar actividades en clases, desatención persistente o falta de útiles",
    color: "#c026d3",
    ambito: "Aula"
  },
  {
    id: "infraccion_transporte",
    nombre: "Infracción en Transporte Escolar",
    puntos: 10,
    icono: "🚌",
    descripcion: "No respetar normas de seguridad, pararse con el bus en marcha o desorden",
    color: "#d97706",
    ambito: "Transporte"
  },
  {
    id: "ajuste_saldo",
    nombre: "Corrección o Ajuste Administrativo de Saldo",
    puntos: 10,
    icono: "⚙️",
    descripcion: "Corrección por error involuntario en abono previo de puntos o duplicación",
    color: "#475569",
    ambito: "Administrativo"
  },
  {
    id: "otra_falta",
    nombre: "Otra Falta Formativa o Conductual",
    puntos: 5,
    icono: "❗",
    descripcion: "Situación conductual o formativa que amerita descuento de ColegualCoins",
    color: "#ef4444",
    ambito: "General"
  }
];

