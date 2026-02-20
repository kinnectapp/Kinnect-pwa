import { useMutation } from "@tanstack/react-query"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { LoginApiData } from "@/lib/types/auth"

export const useLogin = () => {
  const loginToStore = useAuthStore((state) => state.login)


const { mutate, isPending} = useMutation({
  mutationFn: authService.login
})

const persistSession = async (data: LoginApiData) => {
  const accessToken = data.accessToken || data.token;
  if (!accessToken || !data.refreshToken) {
    throw new Error("Login succeeded but tokens are missing.");
  }

  await loginToStore(data.user, accessToken, data.refreshToken);
};

  return {
    login: mutate,
    isLoggingIn: isPending,
    persistSession,
  }
}
