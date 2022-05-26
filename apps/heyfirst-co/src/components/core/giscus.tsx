import Script from "next/script";
import { useMounted } from "src/lib/use-mounted";

const Giscus: React.FC = () => {
  const mounted = useMounted();

  return !mounted ? null : (
    <>
      <Script
        src="https://giscus.app/client.js"
        data-repo="heyfirst/heyfirst.co"
        data-repo-id="MDEwOlJlcG9zaXRvcnkyMjY1NjkxNTQ="
        data-category="General"
        data-category-id="DIC_kwDODYErws4B-QE2"
        data-mapping="title"
        data-reactions-enabled="1"
        data-theme="light"
        crossOrigin="anonymous"
        async
      />
      <div className="giscus" />
    </>
  );
};

export default Giscus;
