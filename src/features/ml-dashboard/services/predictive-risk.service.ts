import { mlDashboardMock } from "@/mocks/ml-dashboard.mock"
import type { PredictiveRiskData } from "@/features/ml-dashboard/types"

const MIN_LATENCY_MS = 300
const MAX_LATENCY_MS = 600

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/**
 * Mock service for the predictive dashboard.
 *
 * It deliberately has no HTTP dependency: the demo must work without the ML
 * backend (NestJS/FastAPI). Data is deterministic and only the artificial
 * latency changes between requests.
 */
export async function fetchPredictiveRisk(): Promise<PredictiveRiskData> {
  const latency =
    MIN_LATENCY_MS + Math.round(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS))

  await wait(latency)

  return structuredClone(mlDashboardMock)
}
