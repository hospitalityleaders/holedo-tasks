import Head from "next/head";

interface PageHeadProps {
  title: string;
  description?: string;
  siteIconUrl?: string;
  openGraphImageUrl?: string;
}

export const PageHead = ({
  title,
  description,
  siteIconUrl = "/assets/branding/holedo-icon.png",
  openGraphImageUrl,
}: PageHeadProps) => {
  const versionedIconUrl = siteIconUrl
    ? `${siteIconUrl}${siteIconUrl.includes("?") ? "&" : "?"}holedo-icon=${encodeURIComponent(siteIconUrl)}`
    : "/assets/branding/holedo-icon.png";

  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      {openGraphImageUrl && (
        <>
          <meta property="og:image" content={openGraphImageUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={openGraphImageUrl} />
        </>
      )}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href={versionedIconUrl} />
      <link rel="apple-touch-icon" href={versionedIconUrl} />
    </Head>
  );
};
