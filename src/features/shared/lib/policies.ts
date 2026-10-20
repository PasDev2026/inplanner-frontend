const isManager = (managerId: string, userId: string) => {
    return managerId === userId
}

type RolLike = { rolCodigo: string }

export const isSuperAdmin = (user: { roles?: RolLike[] }) => {
    return (user.roles ?? []).some((rol) => rol.rolCodigo === 'SUPER_ADMINISTRADOR')
}

export const canManageProject = (
    managerId: string,
    user: { id: string; roles?: RolLike[] },
) => {
    return isManager(managerId, user.id) || isSuperAdmin(user)
}

export default isManager
