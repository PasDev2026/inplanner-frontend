import { useQuery } from "@tanstack/react-query";
import { getUserApi } from "@/features/shared/actions/auth.api";


export const useAuth = () => {
    
    const {data, isError, isLoading, isFetching} = useQuery({
            queryKey: ['user'], 
            queryFn: getUserApi,
            retry: 1,
            refetchOnWindowFocus: false
        })

    return {data, isError, isLoading, isFetching}
}