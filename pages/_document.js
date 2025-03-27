import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Admin dashboard for campaign management" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 