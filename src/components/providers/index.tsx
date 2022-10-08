import React from "react";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import reactQueryClient from "@/lib/react-query";
import { FathomAnalytic } from "./fathom-analytic";

const Providers = ({ children }) => (
  <>
    <FathomAnalytic />
    <QueryClientProvider client={reactQueryClient}>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      {children}
    </QueryClientProvider>
  </>
);

export default Providers;
