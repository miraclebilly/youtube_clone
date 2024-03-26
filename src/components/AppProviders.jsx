import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AuthProvider } from "../context/AuthContext";
import GlobalStyle from "../styles/GlobalStyle";
import { darkTheme } from "../styles/theme";
import ErrorFallback from "./ErrorFallback";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    }
  }
})

function AppProviders({children}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false}/>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider theme={darkTheme}>
              <GlobalStyle/>
                {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
    </QueryClientProvider>
  )
}

export default AppProviders;
