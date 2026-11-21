import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DocumentAccessSocketSync } from "@/features/documents/components/DocumentAccessSocketSync"
import { SocketProvider } from "@/features/shared/socket/socket.provider"
import { ThemeProvider } from "./ThemeProvider"
import { ThemedToaster } from "./ThemedToaster"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <ThemeProvider>
          <TooltipProvider>
            <DocumentAccessSocketSync />
            {children}
            <ThemedToaster />
          </TooltipProvider>
        </ThemeProvider>
      </SocketProvider>
    </QueryClientProvider>
  )
}
