import { create } from "zustand"

type AuthState = {
  user: any
  token: string | null
  isAuthenticated: boolean
  login: (user: any, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))

    set({
      user,
      token,
      isAuthenticated: true
    })
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  }
}))
