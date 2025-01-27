import { useState, useCallback } from "react"

interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  })

  const request = useCallback(async (url: string, options?: RequestInit) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error("API request failed")
      }
      const data = await response.json()
      setState({ data, error: null, loading: false })
      return data
    } catch (error) {
      setState({ data: null, error: "An error occurred. Please try again.", loading: false })
      throw error
    }
  }, [])

  return { ...state, request }
}

