import type {
  DimensionRisk,
  FeatureImportanceDatum,
  InsightFilter,
  ModelComparisonDatum,
  PredictiveRiskData,
  PredictiveTask,
  RiskFactor,
  RiskLevel,
  RiskSummary,
  RiskTrendPoint,
} from "@/features/ml-dashboard/types"
import { dimensionTotal, riskLevelForProbability } from "@/features/ml-dashboard/lib/risk"

const REFERENCE_DATE = "2026-10-27"
const TOTAL_TASKS = 627

const PROJECTS = [
  "Inplanner",
  "Interact",
  "Mini INBUK",
  "Chatbot Woztell",
  "InCalendar",
  "Proyecto Contabilidad",
]

const SEDES = ["INSALUD Hub", "INSALUD Sur", "INSALUD JM", "INSALUD Golf"]

const PROJECT_DELAY_RATE: Record<string, number> = {
  Inplanner: 0.34,
  Interact: 0.29,
  "Mini INBUK": 0.22,
  "Chatbot Woztell": 0.26,
  InCalendar: 0.42,
  "Proyecto Contabilidad": 0.37,
}

type TaskSeed = Omit<
  PredictiveTask,
  "risk" | "factors" | "suggestedAction" | "projectDelayRate"
>

function daysBetween(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number)
  const [toYear, toMonth, toDay] = to.split("-").map(Number)
  return Math.round(
    (Date.UTC(toYear, toMonth - 1, toDay) -
      Date.UTC(fromYear, fromMonth - 1, fromDay)) /
      86_400_000,
  )
}

function signedImpact(value: number): number {
  return value === 0 ? 1 : value
}

function buildFactors(seed: TaskSeed & { projectDelayRate: number }): RiskFactor[] {
  const dueInDays = daysBetween(REFERENCE_DATE, seed.dueDate)
  const projectRate = PROJECT_DELAY_RATE[seed.project] ?? 0.25
  const candidates: RiskFactor[] = []

  if (seed.daysSinceUpdate >= 7) {
    candidates.push({
      id: "inactivity",
      label: "Sin actualización reciente",
      detail: `${seed.daysSinceUpdate} días desde el último movimiento`,
      impactPp: Math.min(24, Math.round(6 + seed.daysSinceUpdate * 0.6)),
      direction: "increase",
    })
  } else {
    candidates.push({
      id: "inactivity",
      label: "Actividad reciente",
      detail: `Última actualización hace ${seed.daysSinceUpdate} ${
        seed.daysSinceUpdate === 1 ? "día" : "días"
      }`,
      impactPp: -Math.min(12, 2 + (7 - seed.daysSinceUpdate) * 1.2),
      direction: "reduce",
    })
  }

  if (seed.openDependencies > 0) {
    candidates.push({
      id: "dependencies",
      label: "Dependencias abiertas",
      detail: `${seed.openDependencies} ${
        seed.openDependencies === 1 ? "dependencia sin cerrar" : "dependencias sin cerrar"
      }`,
      impactPp: Math.min(18, 4 + seed.openDependencies * 3),
      direction: "increase",
    })
  } else {
    candidates.push({
      id: "dependencies",
      label: "Sin dependencias abiertas",
      detail: "No hay bloqueos externos registrados",
      impactPp: -5,
      direction: "reduce",
    })
  }

  if (seed.ownerLoad >= 6) {
    candidates.push({
      id: "owner-load",
      label: "Sobrecarga del responsable",
      detail: `${seed.ownerLoad} tareas activas asignadas`,
      impactPp: Math.min(15, Math.round(seed.ownerLoad * 1.4)),
      direction: "increase",
    })
  } else {
    candidates.push({
      id: "owner-load",
      label: "Carga del responsable controlada",
      detail: `${seed.ownerLoad} tareas activas asignadas`,
      impactPp: -Math.min(7, 2 + (6 - seed.ownerLoad)),
      direction: "reduce",
    })
  }

  if (seed.reassignments >= 2) {
    candidates.push({
      id: "reassignments",
      label: "Reasignaciones recientes",
      detail: `${seed.reassignments} cambios de responsable en 30 días`,
      impactPp: Math.min(12, 2 + seed.reassignments * 2),
      direction: "increase",
    })
  } else {
    candidates.push({
      id: "reassignments",
      label: "Responsable estable",
      detail: "Sin reasignaciones en los últimos 30 días",
      impactPp: -2,
      direction: "reduce",
    })
  }

  if (dueInDays <= 7) {
    const overdue = dueInDays < 0
    candidates.push({
      id: "due-date",
      label: overdue ? "Tarea vencida" : "Vencimiento próximo",
      detail: overdue
        ? `Vencida hace ${Math.abs(dueInDays)} ${
            Math.abs(dueInDays) === 1 ? "día" : "días"
          }`
        : dueInDays === 0
          ? "Vence hoy"
          : `Vence en ${dueInDays} ${dueInDays === 1 ? "día" : "días"}`,
      impactPp: Math.min(14, 5 + Math.max(0, 7 - dueInDays)),
      direction: "increase",
    })
  } else {
    candidates.push({
      id: "due-date",
      label: "Ventana de vencimiento amplia",
      detail: `Vence en ${dueInDays} días`,
      impactPp: -3,
      direction: "reduce",
    })
  }

  if (projectRate >= 0.28) {
    candidates.push({
      id: "project-rate",
      label: "Proyecto con retraso base alto",
      detail: `Tasa base del proyecto: ${Math.round(projectRate * 100)}%`,
      impactPp: Math.round(projectRate * 20),
      direction: "increase",
    })
  } else {
    candidates.push({
      id: "project-rate",
      label: "Proyecto con retraso base bajo",
      detail: `Tasa base del proyecto: ${Math.round(projectRate * 100)}%`,
      impactPp: -Math.max(1, Math.round((0.28 - projectRate) * 20)),
      direction: "reduce",
    })
  }

  return candidates
    .map((factor) => ({ ...factor, impactPp: signedImpact(factor.impactPp) }))
    .sort((a, b) => Math.abs(b.impactPp) - Math.abs(a.impactPp))
    .slice(0, 3)
}

function buildSuggestedAction(risk: RiskLevel, factors: RiskFactor[]): string {
  const primary = factors.find((factor) => factor.direction === "increase")

  if (!primary || risk === "bajo") {
    return "Mantener el monitoreo habitual; repetir la estimación si cambia el vencimiento o la actividad."
  }

  switch (primary.id) {
    case "inactivity":
      return "Pedir una actualización al responsable y acordar el siguiente paso en la próxima reunión de seguimiento."
    case "dependencies":
      return "Escalar las dependencias abiertas con el área dueña y fijar una fecha compromiso."
    case "owner-load":
      return "Rebalancear la carga del responsable o reasignar una tarea de menor criticidad."
    case "reassignments":
      return "Confirmar responsable y criterios de aceptación para evitar nuevos cambios de alcance."
    case "due-date":
      return "Adelantar una revisión de avance y validar el alcance mínimo viable antes del vencimiento."
    case "project-rate":
      return "Reforzar el seguimiento del proyecto y revisar el plan de recuperación con el líder."
    default:
      return "Revisar el caso con el líder del proyecto y definir un plan de acción esta semana."
  }
}

const taskSeeds: TaskSeed[] = [
  {
    id: "task-01",
    code: "INP-2041",
    title: "Cerrar migración de datos del portal legado a Inplanner",
    project: "Inplanner",
    sede: "INSALUD Hub",
    owner: "Mathias James Torres",
    dueDate: "2026-10-24",
    probability: 0.93,
    daysSinceUpdate: 23,
    openDependencies: 3,
    ownerLoad: 8,
    reassignments: 2,
  },
  {
    id: "task-02",
    code: "INP-2042",
    title: "Validar autenticación y permisos por rol en Inplanner",
    project: "Inplanner",
    sede: "INSALUD Sur",
    owner: "Fabián Alessandro Ocrosopoma",
    dueDate: "2026-10-28",
    probability: 0.9,
    daysSinceUpdate: 18,
    openDependencies: 2,
    ownerLoad: 7,
    reassignments: 1,
  },
  {
    id: "task-03",
    code: "INP-2043",
    title: "Integrar notificaciones de WhatsApp en Interact",
    project: "Interact",
    sede: "INSALUD JM",
    owner: "Andrés Arturo Ronceros",
    dueDate: "2026-10-26",
    probability: 0.88,
    daysSinceUpdate: 16,
    openDependencies: 4,
    ownerLoad: 6,
    reassignments: 2,
  },
  {
    id: "task-04",
    code: "INP-2044",
    title: "Conciliar asientos contables del cierre mensual",
    project: "Proyecto Contabilidad",
    sede: "INSALUD Golf",
    owner: "Ricardo García",
    dueDate: "2026-11-02",
    probability: 0.86,
    daysSinceUpdate: 21,
    openDependencies: 2,
    ownerLoad: 9,
    reassignments: 3,
  },
  {
    id: "task-05",
    code: "INP-2045",
    title: "Actualizar flujo de respuestas del chatbot Woztell",
    project: "Chatbot Woztell",
    sede: "INSALUD Hub",
    owner: "Gustavo Huamán",
    dueDate: "2026-10-25",
    probability: 0.84,
    daysSinceUpdate: 12,
    openDependencies: 3,
    ownerLoad: 7,
    reassignments: 1,
  },
  {
    id: "task-06",
    code: "INP-2046",
    title: "Sincronizar disponibilidad de agendas en InCalendar",
    project: "InCalendar",
    sede: "INSALUD Hub",
    owner: "Javier Enrique García",
    dueDate: "2026-10-30",
    probability: 0.82,
    daysSinceUpdate: 9,
    openDependencies: 2,
    ownerLoad: 8,
    reassignments: 2,
  },
  {
    id: "task-07",
    code: "INP-2047",
    title: "Configurar catálogo de servicios de Mini INBUK",
    project: "Mini INBUK",
    sede: "INSALUD Sur",
    owner: "Fiorella Inga",
    dueDate: "2026-10-29",
    probability: 0.8,
    daysSinceUpdate: 14,
    openDependencies: 2,
    ownerLoad: 5,
    reassignments: 1,
  },
  {
    id: "task-08",
    code: "INP-2048",
    title: "Corregir incidencias de carga en el módulo de reportes",
    project: "Inplanner",
    sede: "INSALUD JM",
    owner: "Rodrigo Edgardo Camacho",
    dueDate: "2026-11-04",
    probability: 0.78,
    daysSinceUpdate: 11,
    openDependencies: 1,
    ownerLoad: 6,
    reassignments: 2,
  },
  {
    id: "task-09",
    code: "INP-2049",
    title: "Revisar conciliación de pagos en Interact",
    project: "Interact",
    sede: "INSALUD Hub",
    owner: "Juan Ezequiel Espinoza",
    dueDate: "2026-11-03",
    probability: 0.76,
    daysSinceUpdate: 19,
    openDependencies: 3,
    ownerLoad: 4,
    reassignments: 1,
  },
  {
    id: "task-10",
    code: "INP-2050",
    title: "Automatizar conciliación bancaria del periodo",
    project: "Proyecto Contabilidad",
    sede: "INSALUD Hub",
    owner: "André Alexander Cuenca",
    dueDate: "2026-10-31",
    probability: 0.74,
    daysSinceUpdate: 8,
    openDependencies: 1,
    ownerLoad: 7,
    reassignments: 0,
  },
  {
    id: "task-11",
    code: "INP-2051",
    title: "Configurar alertas de vencimiento en InCalendar",
    project: "InCalendar",
    sede: "INSALUD Golf",
    owner: "Jaasiel Aguilar",
    dueDate: "2026-11-05",
    probability: 0.72,
    daysSinceUpdate: 15,
    openDependencies: 2,
    ownerLoad: 5,
    reassignments: 2,
  },
  {
    id: "task-12",
    code: "INP-2052",
    title: "Migrar base de conocimiento del chatbot al nuevo proveedor",
    project: "Chatbot Woztell",
    sede: "INSALUD Sur",
    owner: "Fabián Alessandro Ocrosopoma",
    dueDate: "2026-11-06",
    probability: 0.7,
    daysSinceUpdate: 7,
    openDependencies: 1,
    ownerLoad: 6,
    reassignments: 1,
  },
  {
    id: "task-13",
    code: "INP-2053",
    title: "Validar reglas de asignación automática de casos",
    project: "Mini INBUK",
    sede: "INSALUD JM",
    owner: "Andrés Arturo Ronceros",
    dueDate: "2026-11-09",
    probability: 0.62,
    daysSinceUpdate: 13,
    openDependencies: 1,
    ownerLoad: 4,
    reassignments: 1,
  },
  {
    id: "task-14",
    code: "INP-2054",
    title: "Documentar flujo de alta y baja de usuarios",
    project: "Inplanner",
    sede: "INSALUD Hub",
    owner: "Mathias James Torres",
    dueDate: "2026-11-08",
    probability: 0.56,
    daysSinceUpdate: 10,
    openDependencies: 2,
    ownerLoad: 6,
    reassignments: 1,
  },
  {
    id: "task-15",
    code: "INP-2055",
    title: "Actualizar plantillas de correo transaccional",
    project: "Interact",
    sede: "INSALUD Sur",
    owner: "Ricardo García",
    dueDate: "2026-11-10",
    probability: 0.54,
    daysSinceUpdate: 6,
    openDependencies: 1,
    ownerLoad: 5,
    reassignments: 1,
  },
  {
    id: "task-16",
    code: "INP-2056",
    title: "Revisar catálogo de respuestas rápidas de Mini INBUK",
    project: "Mini INBUK",
    sede: "INSALUD Hub",
    owner: "Fiorella Inga",
    dueDate: "2026-11-12",
    probability: 0.52,
    daysSinceUpdate: 9,
    openDependencies: 1,
    ownerLoad: 5,
    reassignments: 0,
  },
  {
    id: "task-17",
    code: "INP-2057",
    title: "Validar integración del chatbot con el CRM",
    project: "Chatbot Woztell",
    sede: "INSALUD Golf",
    owner: "Jaasiel Aguilar",
    dueDate: "2026-11-11",
    probability: 0.5,
    daysSinceUpdate: 8,
    openDependencies: 1,
    ownerLoad: 4,
    reassignments: 0,
  },
  {
    id: "task-18",
    code: "INP-2058",
    title: "Revisar reglas de recordatorios automáticos",
    project: "InCalendar",
    sede: "INSALUD JM",
    owner: "Juan Ezequiel Espinoza",
    dueDate: "2026-11-14",
    probability: 0.48,
    daysSinceUpdate: 5,
    openDependencies: 0,
    ownerLoad: 5,
    reassignments: 1,
  },
  {
    id: "task-19",
    code: "INP-2059",
    title: "Estandarizar centros de costo del periodo",
    project: "Proyecto Contabilidad",
    sede: "INSALUD Sur",
    owner: "Rodrigo Edgardo Camacho",
    dueDate: "2026-11-15",
    probability: 0.46,
    daysSinceUpdate: 6,
    openDependencies: 0,
    ownerLoad: 4,
    reassignments: 0,
  },
  {
    id: "task-20",
    code: "INP-2060",
    title: "Publicar guía de uso del panel de atención",
    project: "Interact",
    sede: "INSALUD Golf",
    owner: "Javier Enrique García",
    dueDate: "2026-11-18",
    probability: 0.43,
    daysSinceUpdate: 3,
    openDependencies: 0,
    ownerLoad: 3,
    reassignments: 0,
  },
  {
    id: "task-21",
    code: "INP-2061",
    title: "Actualizar directorio de responsables por sede",
    project: "Inplanner",
    sede: "INSALUD Sur",
    owner: "Jaasiel Aguilar",
    dueDate: "2026-11-20",
    probability: 0.38,
    daysSinceUpdate: 2,
    openDependencies: 0,
    ownerLoad: 3,
    reassignments: 0,
  },
  {
    id: "task-22",
    code: "INP-2062",
    title: "Revisar textos de ayuda del portal de clientes",
    project: "Mini INBUK",
    sede: "INSALUD JM",
    owner: "Ricardo García",
    dueDate: "2026-11-22",
    probability: 0.31,
    daysSinceUpdate: 4,
    openDependencies: 0,
    ownerLoad: 2,
    reassignments: 0,
  },
  {
    id: "task-23",
    code: "INP-2063",
    title: "Ordenar evidencias de capacitación del trimestre",
    project: "Chatbot Woztell",
    sede: "INSALUD Hub",
    owner: "Alejandro Toribio",
    dueDate: "2026-11-24",
    probability: 0.24,
    daysSinceUpdate: 2,
    openDependencies: 0,
    ownerLoad: 3,
    reassignments: 0,
  },
  {
    id: "task-24",
    code: "INP-2064",
    title: "Actualizar plantilla de actas de reunión",
    project: "InCalendar",
    sede: "INSALUD Golf",
    owner: "Fiorella Inga",
    dueDate: "2026-11-27",
    probability: 0.18,
    daysSinceUpdate: 1,
    openDependencies: 0,
    ownerLoad: 2,
    reassignments: 0,
  },
]

const tasks: PredictiveTask[] = taskSeeds.map((seed) => {
  const factors = buildFactors({
    ...seed,
    projectDelayRate: PROJECT_DELAY_RATE[seed.project] ?? 0.25,
  })
  const risk = riskLevelForProbability(seed.probability)

  return {
    ...seed,
    projectDelayRate: PROJECT_DELAY_RATE[seed.project] ?? 0.25,
    risk,
    factors,
    suggestedAction: buildSuggestedAction(risk, factors),
  }
})

const byProject: DimensionRisk[] = [
  dimensionTotal({
    name: "Inplanner",
    shortName: "Inplanner",
    alto: 34,
    medio: 55,
    bajo: 60,
  }),
  dimensionTotal({
    name: "Interact",
    shortName: "Interact",
    alto: 26,
    medio: 45,
    bajo: 47,
  }),
  dimensionTotal({
    name: "Mini INBUK",
    shortName: "Mini INBUK",
    alto: 18,
    medio: 33,
    bajo: 34,
  }),
  dimensionTotal({
    name: "Chatbot Woztell",
    shortName: "Woztell",
    alto: 22,
    medio: 32,
    bajo: 38,
  }),
  dimensionTotal({
    name: "InCalendar",
    shortName: "InCalendar",
    alto: 37,
    medio: 17,
    bajo: 35,
  }),
  dimensionTotal({
    name: "Proyecto Contabilidad",
    shortName: "Contabilidad",
    alto: 35,
    medio: 17,
    bajo: 42,
  }),
]

const bySede: DimensionRisk[] = [
  dimensionTotal({
    name: "INSALUD Hub",
    shortName: "Hub",
    alto: 74,
    medio: 88,
    bajo: 103,
  }),
  dimensionTotal({
    name: "INSALUD Sur",
    shortName: "Sur",
    alto: 47,
    medio: 56,
    bajo: 61,
  }),
  dimensionTotal({
    name: "INSALUD JM",
    shortName: "JM",
    alto: 31,
    medio: 35,
    bajo: 46,
  }),
  dimensionTotal({
    name: "INSALUD Golf",
    shortName: "Golf",
    alto: 20,
    medio: 20,
    bajo: 46,
  }),
]

const trend: RiskTrendPoint[] = [
  { week: "24 ago", highRiskShare: 19.8, estimatedDelayShare: 47.9 },
  { week: "31 ago", highRiskShare: 20.6, estimatedDelayShare: 49.6 },
  { week: "07 sep", highRiskShare: 21.7, estimatedDelayShare: 51.2 },
  { week: "14 sep", highRiskShare: 20.9, estimatedDelayShare: 50.4 },
  { week: "21 sep", highRiskShare: 23.1, estimatedDelayShare: 53.8 },
  { week: "28 sep", highRiskShare: 24.4, estimatedDelayShare: 55.1 },
  { week: "05 oct", highRiskShare: 25.6, estimatedDelayShare: 56.4 },
  { week: "12 oct", highRiskShare: 24.9, estimatedDelayShare: 55.7 },
  { week: "19 oct", highRiskShare: 27.2, estimatedDelayShare: 58.8 },
  { week: "26 oct", highRiskShare: 27.4, estimatedDelayShare: 59.2 },
]

const featureImportance: FeatureImportanceDatum[] = [
  {
    feature: "Sin actualización reciente",
    importance: 22,
    description: "Días desde el último movimiento registrado en la tarea.",
  },
  {
    feature: "Dependencias vencidas",
    importance: 18,
    description: "Tareas o áreas externas que bloquean el avance.",
  },
  {
    feature: "Carga del responsable",
    importance: 15,
    description: "Tareas activas asignadas en la misma semana.",
  },
  {
    feature: "Antigüedad de la tarea",
    importance: 12,
    description: "Tiempo desde la creación frente al ciclo esperado.",
  },
  {
    feature: "Reasignaciones previas",
    importance: 10,
    description: "Cambios de responsable en los últimos 30 días.",
  },
  {
    feature: "Tasa base del proyecto",
    importance: 9,
    description: "Historial de retraso del proyecto.",
  },
  {
    feature: "Proximidad del vencimiento",
    importance: 8,
    description: "Días restantes frente al esfuerzo pendiente.",
  },
  {
    feature: "Cambios de alcance",
    importance: 6,
    description: "Variaciones en la descripción o entregables.",
  },
]

const modelComparison: ModelComparisonDatum[] = [
  { metric: "ROC-AUC", xgboost: 0.68, baseline: 0.61 },
  { metric: "PR-AUC", xgboost: 0.72, baseline: 0.58 },
  { metric: "F1", xgboost: 0.7, baseline: 0.6 },
]

const insights: RiskSummary["insights"] = [
  {
    id: "project-concentration",
    title: "3 proyectos concentran el 62% del riesgo alto",
    description:
      "InCalendar, Proyecto Contabilidad e Inplanner reúnen 106 de las 172 tareas en banda alta.",
    tone: "critical",
    icon: "alert",
    metric: "106 / 172",
  },
  {
    id: "sede-concentration",
    title: "Hub concentra el 43% del riesgo alto",
    description:
      "74 tareas están en banda alta, equivalentes al 28% de la cartera de la sede.",
    tone: "warning",
    icon: "location",
    metric: "74 casos",
    filter: { type: "sede", value: "INSALUD Hub" },
    filterLabel: "Ver tareas de Hub",
  },
  {
    id: "project-rate",
    title: "InCalendar: 42% de sus tareas en riesgo alto",
    description:
      "37 de 89 tareas están en banda alta. Es la tasa más alta entre los seis proyectos.",
    tone: "warning",
    icon: "project",
    metric: "42%",
    filter: { type: "project", value: "InCalendar" },
    filterLabel: "Ver tareas del proyecto",
  },
  {
    id: "low-risk-balance",
    title: "El 41% de la cartera sigue en riesgo bajo",
    description:
      "256 tareas mantienen monitoreo habitual; el foco puede concentrarse en los casos priorizados.",
    tone: "positive",
    icon: "shield",
    metric: "256 tareas",
  },
]

function makeInsightFilterLabel(filter: InsightFilter): string {
  if (filter.type === "sede") return "Ver tareas de esta sede"
  if (filter.type === "project") return "Ver tareas del proyecto"
  return "Ver tareas en este riesgo"
}

export const mlDashboardMock: PredictiveRiskData = {
  model: {
    name: "XGBoost · proxy 7 días",
    version: "xgb-proxy-v0.7.2",
    algorithm: "XGBoost (gradient boosting)",
    trainedAt: "2026-10-18",
    referenceDate: REFERENCE_DATE,
    generatedAt: "2026-10-27T09:30:00",
    decisionThreshold: 0.45,
    highRiskThreshold: 0.58,
    mediumRiskThreshold: 0.45,
    proxyDays: 7,
    proxyRule: "updated_at > due_date + 7 days",
    datasetSize: TOTAL_TASKS,
    positiveCount: 392,
    negativeCount: 235,
    positiveRate: 62.5,
    featureCount: 18,
    validation: "Validación cruzada estratificada · 5 folds",
    period: "ene – sep 2026",
    metrics: {
      rocAuc: 0.68,
      prAuc: 0.72,
      f1: 0.7,
      precision: 0.72,
      recall: 0.68,
      accuracy: 0.63,
    },
    confusionMatrix: {
      truePositive: 267,
      falsePositive: 104,
      falseNegative: 125,
      trueNegative: 131,
    },
    limitations: [
      "El target es un proxy: updated_at > due_date + 7 days. No mide incumplimiento exacto ni calidad de la tarea.",
      "Tareas y scores son sintéticos; las sedes y los responsables se tomaron del sistema de QA. El mock no consulta el servicio de ML, NestJS ni FastAPI.",
      "La tasa base histórica (62.5%) no debe compararse directamente con la cartera abierta actual.",
      "El score prioriza revisión humana. No debe usarse como sanción ni para decisiones disciplinarias.",
      "Puede degradarse ante cambios de asignación, feriados, dependencias externas o estacionalidad.",
    ],
  },
  summary: {
    totalTasks: TOTAL_TASKS,
    estimatedDelayed: 371,
    estimatedDelayRate: 59.2,
    distribution: [
      { level: "alto", label: "Riesgo alto", count: 172, percentage: 27.4 },
      { level: "medio", label: "Riesgo medio", count: 199, percentage: 31.7 },
      { level: "bajo", label: "Riesgo bajo", count: 256, percentage: 40.9 },
    ],
    trend,
    byProject,
    bySede,
    insights: insights.map((insight) => ({
      ...insight,
      filterLabel: insight.filter
        ? insight.filterLabel ?? makeInsightFilterLabel(insight.filter)
        : undefined,
    })),
  },
  featureImportance,
  modelComparison,
  tasks,
  filterOptions: {
    sedes: SEDES,
    projects: PROJECTS,
  },
}

export { REFERENCE_DATE, SEDES, PROJECTS }
