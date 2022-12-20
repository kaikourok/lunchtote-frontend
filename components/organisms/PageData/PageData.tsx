import Head from 'next/head';
import { useRouter } from 'next/router';

const title = process.env.NEXT_PUBLIC_TITLE!;
const url = process.env.NEXT_PUBLIC_URL!;
const defaultDescription = process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION!;
const defaultOgpImageUrl = process.env.NEXT_PUBLIC_DEFAULT_OGP_IMAGE_URL!;
const defaultOgpImageWidth = Number(
  process.env.NEXT_PUBLIC_DEFAULT_OGP_IMAGE_WIDTH!
);
const defaultOgpImageHeight = Number(
  process.env.NEXT_PUBLIC_DEFAULT_OGP_IMAGE_HEIGHT!
);

type OGPImage = {
  url: string;
  width: number;
  height: number;
};

type HeadProps = {
  title?: string;
  description?: string;
  ogpImage?: OGPImage;
};

const PageData = (props: HeadProps) => {
  const fullyPageTitle = props.title ? props.title + ' | ' + title : title;
  const router = useRouter();

  const ogpImage = props.ogpImage ?? {
    url: defaultOgpImageUrl,
    width: defaultOgpImageWidth,
    height: defaultOgpImageHeight,
  };

  return (
    <Head>
      <title>{fullyPageTitle}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta
        name="description"
        content={props.description ?? defaultDescription}
      />
      <meta property="og:url" content={url + router.pathname} />
      <meta property="og:title" content={props.title ? props.title : title} />
      <meta
        property="og:description"
        content={props.description ?? defaultDescription}
      />
      <meta property="og:site_name" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={url + ogpImage.url} />
      <meta property="og:image:width" content={String(ogpImage.width)} />
      <meta property="og:image:height" content={String(ogpImage.height)} />
    </Head>
  );
};

export default PageData;
