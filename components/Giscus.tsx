import Head from "next/head";
import { useMounted } from "lib/use-mounted";

const Giscus: React.FC = () => {
  const mounted = useMounted();

  return !mounted ? null : (
    <>
      <Head>
        <script
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
      </Head>
      <div className="giscus" />
    </>
  );
};

export default Giscus;
