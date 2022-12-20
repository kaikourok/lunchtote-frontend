import { Html, Head, Main, NextScript } from 'next/document';

function Document() {
  return (
    <Html lang="ja">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="format-detection"
          content="email=no,telephone=no,address=no"
        />
        <meta name="theme-color" content="#222222" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
