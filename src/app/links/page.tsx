import LinksClient from '@/app/links/LinksClient';

export const metadata = {
  title: 'Saved Links Stash | Developer Bookmark Manager',
  description: 'Easily store and track web URLs, documentation links, and essential internet resources.',
  alternates: {
    canonical: '/links',
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Developer Link Stash",
    "applicationCategory": "ProductivityApplication"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <LinksClient />
    </>
  );
}
