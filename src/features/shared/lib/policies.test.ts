import { describe, expect, it } from "vitest"
import {
  canAccessProjectActivities,
  canManageProject,
  isProjectResponsible,
  isSuperAdmin,
} from "./policies"

type TestUser = { id: string; roles?: { rolCodigo: string }[] }

const user = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: "user-1",
  roles: [],
  ...overrides,
})

const project = {
  manager_id: "manager-1",
  responsibles: [{ user_id: "responsable-1" }],
}

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

describe("canAccessProjectActivities", () => {
  it("permite al manager", () => {
    expect(canAccessProjectActivities(project, { id: "manager-1" })).toBe(true)
  })

  it("permite al superadmin", () => {
    expect(
      canAccessProjectActivities(project, {
        id: "otro-usuario",
        roles: [{ rolCodigo: "SUPER_ADMINISTRADOR" }],
      }),
    ).toBe(true)
  })

  it("permite al responsable del proyecto", () => {
    expect(
      canAccessProjectActivities(project, { id: "responsable-1" }),
    ).toBe(true)
  })

  it("rechaza a un usuario ajeno", () => {
    expect(canAccessProjectActivities(project, { id: "otro-usuario" })).toBe(
      false,
    )
  })

  it("rechaza si el proyecto no tiene responsables", () => {
    expect(
      canAccessProjectActivities(
        { manager_id: "manager-1" },
        { id: "responsable-1" },
      ),
    ).toBe(false)
  })
})

describe("isProjectResponsible", () => {
  it("detecta al responsable", () => {
    expect(isProjectResponsible(project, "responsable-1")).toBe(true)
    expect(isProjectResponsible(project, "otro-usuario")).toBe(false)
    expect(isProjectResponsible({ manager_id: "manager-1" }, "manager-1")).toBe(
      false,
    )
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
