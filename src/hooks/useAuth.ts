import { useMutation } from "@tanstack/react-query"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"

export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login)


const { mutate, isPending} = useMutation({
  mutationFn: authService.login,
  onSuccess: (data) => {  
    loginToStore(data.user, data.token, data.refreshToken)
  }
})

  return {
    login: mutate,
    isLoggingIn: isPending
  }
}
