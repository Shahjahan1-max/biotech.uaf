import { useCallback, useState } from 'react'

export function useRequestStatus(key: string) {
  const [state, setState] = useState({ key, isLoading: true, error: '' })

  const setError = useCallback((error: string) => {
    setState((current) => ({
      key,
      isLoading: current.key === key ? current.isLoading : true,
      error,
    }))
  }, [key])

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((current) => ({
      key,
      isLoading,
      error: current.key === key ? current.error : '',
    }))
  }, [key])

  return {
    isLoading: state.key !== key || state.isLoading,
    error: state.key === key ? state.error : '',
    setError,
    setIsLoading,
  }
}
