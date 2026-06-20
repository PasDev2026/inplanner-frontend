export const USERS_KEY = ["users"] as const
export const USERS_PAGINATED_KEY = (page: number, limit: number) => ["users", { page, limit }] as const
export const USER_DETAIL_KEY = (id: number | string) => ["user", String(id)] as const
