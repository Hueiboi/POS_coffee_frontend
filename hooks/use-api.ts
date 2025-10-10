"use client"

import { useState, useCallback } from "react"
import { apiRequest } from "@/hooks/api-client"

export function useAPI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const request = useCallback(async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token") || undefined
      const data = await apiRequest<T>(endpoint, options, token)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      console.error("[API Error]", message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(<T>(endpoint: string) => request<T>(endpoint, { method: "GET" }), [request])
  const post = useCallback(<T>(endpoint: string, body: any) => request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }), [request])
  const put = useCallback(<T>(endpoint: string, body: any) => request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }), [request])
  const del = useCallback(<T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }), [request])

  return { loading, error, get, post, put, del }
}
