import { endpoints } from "@/api/endpoints"
import { http } from "@/api/http"
import { LoginApiData } from "@/lib/types/auth"

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await http.post(endpoints.auth.login, payload)

    return data.data as LoginApiData
  }
}
