import React from "react";
import ReactQueryProvider from "src/services/react-query/provider";
import { FathomAnalytic } from "src/services/analytics/fathom-analytic";
import { SEO } from "src/services/seo/provider";

const Providers = ({ children }) => (
  <ReactQueryProvider>
    <SEO />
    <FathomAnalytic />
    {children}
  </ReactQueryProvider>
);

export default Providers;
