import { describe, expect, it } from "vitest"
import { buildWeeklyActivityData } from "./weekly-activity"

const FROM = new Date(2026, 4, 4)
const TO = new Date(2026, 5, 22)

describe("buildWeeklyActivityData", () => {
  it("devuelve las semanas del rango rellenadas con ceros", () => {
    const data = buildWeeklyActivityData([], FROM, TO)

    expect(data).toHaveLength(8)
    expect(data[0]).toEqual({ label: "04 may", created: 0, completed: 0 })
    expect(data[7]).toEqual({ label: "22 jun", created: 0, completed: 0 })
  })

  it("fusiona los datos del backend en la semana correspondiente", () => {
    const data = buildWeeklyActivityData(
      [
        { week: "2026-06-08T00:00:00.000Z", created: 3, completed: 1 },
        { week: "2026-06-22", created: 2, completed: 0 },
      ],
      FROM,
      TO,
    )

    expect(data[5]).toEqual({ label: "08 jun", created: 3, completed: 1 })
    expect(data[7]).toEqual({ label: "22 jun", created: 2, completed: 0 })
  })
})
