import Admonition from "./Admonition.astro";
import Code from "./Code.astro";
import FootnoteMark from "./FootnoteMark.astro";
import Footer from "./Footer.astro";
import Heading from "./Heading.astro";
import Table from "./Table.astro";

export const components = {
	block: { h1: Heading, h2: Heading, h3: Heading, h4: Heading, h5: Heading, h6: Heading },
	type: { admonition: Admonition, code: Code, footer: Footer, table: Table },
	mark: { footnote: FootnoteMark },
};
