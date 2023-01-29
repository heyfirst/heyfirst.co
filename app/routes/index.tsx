import HomepageContent from "@/contents/homepage.mdx";

// TODO: add playwright test to check that the homepage renders (smoketest)
// https://github.com/kentcdodds/kentcdodds.com/blob/main/playwright.config.ts
// TODO: add prettier auto format
export default function Index() {
  return (
    <article className="prose mb-4">
      <HomepageContent />
    </article>
  );
}
