import { useQuery } from "@tanstack/react-query"
import { getTemplate, getTemplates, getAllTemplates } from "../actions/template.api"
import { TEMPLATES_KEY, TEMPLATE_KEY } from "../lib/template-keys"
import { useAuthContext } from "@/features/auth/hooks/useAuthContext"

export function isSuperAdminUser(
  roles: { rolCodigo: string }[] | undefined,
): boolean {
  return roles?.some((r) => r.rolCodigo === "SUPER_ADMINISTRADOR") ?? false
}

export function useTemplates() {
    const { user } = useAuthContext()
    const isAdmin = isSuperAdminUser(user?.roles)

    return useQuery({
        queryKey: isAdmin ? [...TEMPLATES_KEY, "all"] : TEMPLATES_KEY,
        queryFn: isAdmin ? getAllTemplates : getTemplates,
    })
}

export function useTemplate(id: number | null) {
    return useQuery({
        queryKey: TEMPLATE_KEY(id ?? 0),
        queryFn: () => getTemplate(id as number),
        enabled: id !== null,
    })
}
