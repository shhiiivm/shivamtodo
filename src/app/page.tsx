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
      
      <section className="animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6rem 2rem'
      }}>
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: '1.5rem'
        }}>
          Shivam's <span className="gradient-text">Stash Utility</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          maxWidth: '700px',
          textAlign: 'center',
          opacity: 0.8,
          marginBottom: '3rem'
        }}>
          A raw, simple interface for dumping DSA problem strings, pasting important doc links, and gathering visual asset URLs. No fluff.
        </p>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '1000px'
        }}>
          <Link href="/notepad" style={{ textDecoration: 'none' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>
                <Edit3 size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>DSA Notepad</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                A huge textbox to paste and save multi-line algorithm names or notes directly to Firestore.
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Open Notepad <Send size={18} />
              </div>
            </div>
          </Link>

          <Link href="/links" style={{ textDecoration: 'none' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1.5rem', color: 'hsl(var(--accent))' }}>
                <LinkIcon size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Web Links</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Paste HTTPS URLs to create a simple, clickable directory of documentation and resources.
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))' }}>
                Open Links <Send size={18} />
              </div>
            </div>
          </Link>

          <Link href="/images" style={{ textDecoration: 'none' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1.5rem', color: 'var(--foreground)' }}>
                <ImageIcon size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Image Repo</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Paste direct remote image URLs to render system design schemas instantly.
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--foreground), hsl(var(--accent)))', color: '#000' }}>
                Open Images <Send size={18} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* SEO Boilerplate */}
      <section style={{ maxWidth: '900px', padding: '4rem 2rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Streamlined <span className="highlight">Utility Design</span></h2>
        <div style={{ lineHeight: 1.8, opacity: 0.9 }}>
          <p>
            When developers are in the zone solving complex architecture problems or tracing Data Structures and Algorithms, 
            heavy graphical interfaces are a distraction. Functionality, copy-paste efficiency, and data syncing take priority.
          </p>
          <br />
          <h3>Core Minimalist Principles</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>No forms, no dropdowns—just raw inputs.</li>
            <li>Constant time O(1) saving via Firebase.</li>
            <li>Instant rendering for visual problem tracking.</li>
          </ul>
        </div>
      </section>
      
      <section style={{ textAlign: 'center', paddingBottom: '4rem' }}>
          <h3>Directory Hub</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
             <Link href="/notepad" className="highlight">Notepad</Link>
             <span>|</span>
             <Link href="/links" className="highlight">Links</Link>
             <span>|</span>
             <Link href="/images" className="highlight">Images</Link>
          </div>
      </section>
    </>
  );
}
