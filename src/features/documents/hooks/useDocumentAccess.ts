import { useQuery } from '@tanstack/react-query'
import { getDocumentAccess } from '../actions/documents.api'
import { documentKeys } from '../lib/document-keys'

export function useDocumentAccess() {
  return useQuery({
    queryKey: documentKeys.access,
    queryFn: getDocumentAccess,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  })
}
