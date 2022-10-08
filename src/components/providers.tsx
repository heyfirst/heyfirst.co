import React from "react";
import ReactQueryProvider from "src/services/react-query/provider";
import { FathomAnalytic } from "src/services/analytics/fathom-analytic";

const Providers = ({ children }) => (
  <ReactQueryProvider>
    <FathomAnalytic />
    {children}
  </ReactQueryProvider>
);

export default Providers;
