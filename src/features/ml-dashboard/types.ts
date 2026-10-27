export type RiskLevel = "alto" | "medio" | "bajo"

export type InsightTone = "critical" | "warning" | "positive" | "neutral"

export type InsightIcon = "alert" | "location" | "project" | "model" | "shield"

export type InsightFilter =
  | { type: "sede"; value: string }
  | { type: "project"; value: string }
  | { type: "risk"; value: RiskLevel }

export interface RiskFactor {
  id: string
  label: string
  detail: string
  impactPp: number
  direction: "increase" | "reduce"
}

export interface PredictiveTask {
  id: string
  code: string
  title: string
  project: string
  sede: string
  owner: string
  dueDate: string
  probability: number
  risk: RiskLevel
  daysSinceUpdate: number
  openDependencies: number
  ownerLoad: number
  reassignments: number
  projectDelayRate: number
  factors: RiskFactor[]
  suggestedAction: string
}

export interface RiskDistributionDatum {
  level: RiskLevel
  label: string
  count: number
  percentage: number
}

export interface RiskTrendPoint {
  week: string
  highRiskShare: number
  estimatedDelayShare: number
}

export interface DimensionRisk {
  name: string
  shortName: string
  alto: number
  medio: number
  bajo: number
  total: number
}

export interface FeatureImportanceDatum {
  feature: string
  importance: number
  description: string
}

export interface ModelComparisonDatum {
  metric: "ROC-AUC" | "PR-AUC" | "F1"
  xgboost: number
  baseline: number
}

export interface RiskInsight {
  id: string
  title: string
  description: string
  tone: InsightTone
  icon: InsightIcon
  metric?: string
  filter?: InsightFilter
  filterLabel?: string
}

export interface ConfusionMatrix {
  truePositive: number
  falsePositive: number
  falseNegative: number
  trueNegative: number
}

export interface ModelMetrics {
  rocAuc: number
  prAuc: number
  f1: number
  precision: number
  recall: number
  accuracy: number
}

export interface ModelInfo {
  name: string
  version: string
  algorithm: string
  trainedAt: string
  referenceDate: string
  generatedAt: string
  decisionThreshold: number
  highRiskThreshold: number
  mediumRiskThreshold: number
  proxyDays: number
  proxyRule: string
  datasetSize: number
  positiveCount: number
  negativeCount: number
  positiveRate: number
  featureCount: number
  validation: string
  period: string
  metrics: ModelMetrics
  confusionMatrix: ConfusionMatrix
  limitations: string[]
}

export interface RiskSummary {
  totalTasks: number
  estimatedDelayed: number
  estimatedDelayRate: number
  distribution: RiskDistributionDatum[]
  trend: RiskTrendPoint[]
  byProject: DimensionRisk[]
  bySede: DimensionRisk[]
  insights: RiskInsight[]
}

export interface PredictiveRiskData {
  model: ModelInfo
  summary: RiskSummary
  featureImportance: FeatureImportanceDatum[]
  modelComparison: ModelComparisonDatum[]
  tasks: PredictiveTask[]
  filterOptions: {
    sedes: string[]
    projects: string[]
  }
}

export type TaskSort =
  | "probability_desc"
  | "probability_asc"
  | "due_date_asc"
  | "project_asc"

export interface TaskFilters {
  search: string
  sede: string
  project: string
  risk: RiskLevel | "all"
}

export type DashboardTab = "general" | "ml"
