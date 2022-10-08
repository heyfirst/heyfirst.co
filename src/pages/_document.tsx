import Document, {
  DocumentContext,
  DocumentInitialProps,
  Html,
  Head,
  Main,
  NextScript,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta http-equiv="content-type" content="text/html; charset=utf-8" />
          <link
            href="https://fonts.cdnfonts.com/css/jetbrains-mono?styles=60145,60142"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
