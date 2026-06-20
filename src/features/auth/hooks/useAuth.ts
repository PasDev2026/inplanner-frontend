import { useAuthContext } from './useAuthContext'

export const useAuth = () => {
  const { user, isLoading, isAuthenticated } = useAuthContext()
  return {
    data: user,
    isError: !isLoading && !isAuthenticated,
    isLoading,
    isFetching: isLoading,
  }
}