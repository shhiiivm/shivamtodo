import ImagesClient from '@/app/images/ImagesClient';

export const metadata = {
  title: 'Image Reference Stash | Raw Image Storage',
  description: 'A direct portal to paste and save image URLs for visual references without extra fluff.',
  alternates: {
    canonical: '/images',
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Developer Image Stash",
    "applicationCategory": "DesignApplication"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ImagesClient />
    </>
  );
}
