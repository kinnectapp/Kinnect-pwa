import { endpoints } from "@/api/endpoints"
import { http } from "@/api/http"
import { encodeBase64 } from "@/lib/base64"
import { LoginApiData } from "@/lib/types/auth"

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await http.post(endpoints.auth.login, {
      ...payload,
      password: encodeBase64(payload.password),
    })

    return data.data as LoginApiData
  }
}
