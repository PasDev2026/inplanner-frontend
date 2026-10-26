const isManager = (managerId: string, userId: string) => {
    return managerId === userId
}

type RolLike = { rolCodigo: string }

type ProjectWithResponsibles = {
    manager_id: string
    responsibles?: { user_id: string }[]
}

export const isSuperAdmin = (user: { roles?: RolLike[] }) => {
    return (user.roles ?? []).some((rol) => rol.rolCodigo === 'SUPER_ADMINISTRADOR')
}

export const canManageProject = (
    managerId: string,
    user: { id: string; roles?: RolLike[] },
) => {
    return isManager(managerId, user.id) || isSuperAdmin(user)
}

export const isProjectResponsible = (
    project: ProjectWithResponsibles,
    userId: string,
) => {
    return (project.responsibles ?? []).some(
        (responsible) => responsible.user_id === userId,
    )
}

export const canAccessProjectActivities = (
    project: ProjectWithResponsibles,
    user: { id: string; roles?: RolLike[] },
) => {
    return canManageProject(project.manager_id, user) || isProjectResponsible(project, user.id)
}

export default isManager
