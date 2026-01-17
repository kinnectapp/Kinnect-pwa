export const endpoints = {
  auth: {
    login: "/auth/login"
  },
  users: {
    list: "/users",
    single: (id: string) => `/users/${id}`
  }
}
