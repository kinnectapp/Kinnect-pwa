import { api } from "@/api/axios"
import { endpoints } from "@/api/endpoints"

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post(endpoints.auth.login, payload)

    return data.data
  }
}
