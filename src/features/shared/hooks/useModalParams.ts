import { useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export function useModalParams(paramName: string) {
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const paramValue = queryParams.get(paramName)
  const show = !!paramValue

  const close = useCallback(() => {
    navigate(location.pathname, { replace: true })
  }, [navigate, location.pathname])

  return { show, paramValue, close }
}
