// ponytail: key solo para identidad de caché, tipo suelto basta
export const USERS_KEY = ["users"] as const
export const USERS_PAGINATED_KEY = (page: number, limit: number, filters?: Record<string, string | undefined>) => ["users", { page, limit, filters }] as const
export const USER_DETAIL_KEY = (id: number | string) => ["user", String(id)] as const
