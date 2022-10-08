import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import reactQueryClient from "src/services/react-query/react-query";

const ReactQueryProvider = ({ children }) => (
  <QueryClientProvider client={reactQueryClient}>
    {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    {children}
  </QueryClientProvider>
);

export default ReactQueryProvider;
