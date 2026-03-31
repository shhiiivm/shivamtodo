import NotepadClient from '@/app/notepad/NotepadClient';

export const metadata = {
  title: 'Shivam',
  description: 'A dedicated notepad to easily copy, paste, and track your data structures and algorithms (DSA) problems.',
  alternates: {
    canonical: '/notepad',
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DSA Problem Notepad",
    "applicationCategory": "EducationalApplication"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <NotepadClient />
    </>
  );
}
