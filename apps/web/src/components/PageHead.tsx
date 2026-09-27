import Head from "next/head";

interface PageHeadProps {
  title: string;
  description?: string;
}

export const PageHead = ({ title, description }: PageHeadProps) => {
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/assets/branding/holedo-icon.png" />
    </Head>
  );
};
