import { describe, expect, it } from "vitest"
import { canManageProject, isSuperAdmin } from "./policies"

type TestUser = { id: string; roles?: { rolCodigo: string }[] }

const user = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: "user-1",
  roles: [],
  ...overrides,
})

describe("canManageProject", () => {
  it("permite al manager del proyecto", () => {
    expect(canManageProject("user-1", user())).toBe(true)
  })

  it("rechaza a un usuario que no es manager ni superadmin", () => {
    expect(canManageProject("otro-manager", user())).toBe(false)
  })

  it("permite a un superadmin aunque no sea manager", () => {
    const superAdmin = user({
      roles: [{ rolCodigo: "SUPER_ADMINISTRADOR" }],
    })
    expect(canManageProject("otro-manager", superAdmin)).toBe(true)
  })
})

describe("isSuperAdmin", () => {
  it("detecta el rol en cualquiera de las sedes", () => {
    expect(
      isSuperAdmin({ roles: [{ rolCodigo: "SUPER_ADMINISTRADOR" }] }),
    ).toBe(true)
    expect(isSuperAdmin({ roles: [{ rolCodigo: "PERSONAL" }] })).toBe(false)
    expect(isSuperAdmin({})).toBe(false)
  })
})
