import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactNode } from "react"
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { toast } from "sonner"
import { handleApiError } from "@/api/serviceUtils"

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Avoid duplicate toasts when the caller already handles onError.
      if (mutation.options.onError) {
        return
      }

      toast.error(handleApiError(error))
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(handleApiError(error))
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}
