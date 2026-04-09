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

  const fallbackUser =
    data.user ||
    (((data as any)?.id && (data as any)?.email
      ? { id: (data as any).id, email: (data as any).email }
      : null) as any);

  if (!fallbackUser) {
    throw new Error("Login succeeded but user data was not returned.");
  }

  await loginToStore(fallbackUser, accessToken, data.refreshToken);
};

  return {
    login: mutate,
    isLoggingIn: isPending,
    persistSession,
  }
}
