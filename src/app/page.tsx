import { Edit3, Link as LinkIcon, Image as ImageIcon, Send } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Shivam's Tool Hub",
    "description": "A very simple repository for pasting notes, links, and images.",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "author": {
      "@type": "Person",
      "name": "Shivam"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6rem 2rem'
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '1000px'
        }}>
          <Link href="/notepad" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1rem' }}>
                <Edit3 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>NOTEPAD</h3>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                OPEN
              </div>
            </div>
          </Link>

          <Link href="/links" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1rem' }}>
                <LinkIcon size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>LINKS</h3>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                OPEN
              </div>
            </div>
          </Link>

          <Link href="/images" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1rem' }}>
                <ImageIcon size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>IMAGES</h3>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                OPEN
              </div>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
