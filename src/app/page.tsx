import { Send, ListTodo, Image as ImageIcon, Link as LinkIcon, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // Structured Data (JSON-LD)
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TODO Shivam | Personal DSA Tracker & Media Gallery",
    "description": "A high-performance dashboard for tracking DSA problems and managing personal media/links.",
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
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', display: 'none' }}>
        STATUS: TODO
        TOOL: Dashboard
        CATEGORY: Productivity Tools
        PRIMARY KEYWORD: personal dashboard shivam
        SEO INTENT: Manage DSA and media
      </div>

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
          Personal <span className="gradient-text">Efficiency</span> <br />
          Tracker for Shivam
        </h1>
        <p style={{
          fontSize: '1.25rem',
          maxWidth: '700px',
          textAlign: 'center',
          opacity: 0.8,
          marginBottom: '3rem'
        }}>
          A unified dashboard for mastering DSA problems, organizing premium media, and keeping track of important links—all synced with Firebase.
        </p>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '1000px'
        }}>
          <Link href="/dsa-tracker" style={{ textDecoration: 'none' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>
                <ListTodo size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>DSA Problem Tracker</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Track your progress on LeetCode, Codeforces, and HackerRank problems with interactive status logs.
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Tracker <Send size={18} />
              </div>
            </div>
          </Link>

          <Link href="/gallery" style={{ textDecoration: 'none' }}>
            <div className="glass-card">
              <div style={{ marginBottom: '1.5rem', color: 'hsl(var(--accent))' }}>
                <ImageIcon size={40} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Media & Link Gallery</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Upload images, save videos, and organize curated web resources in a sleek masonry gallery.
              </p>
              <div className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))' }}>
                Explore Gallery <LinkIcon size={18} />
              </div>
            </div>
          </Link>

          <div className="glass-card" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <div style={{ marginBottom: '1.5rem', color: 'gray' }}>
              <Clock size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Analytics (Soon)</h3>
            <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
              Visual insights into your learning curve and media collection frequency and patterns.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Section (Premium Rule) */}
      <section style={{ maxWidth: '900px', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Why use a <span className="highlight">Personal Tracker?</span></h2>
        <div style={{ lineHeight: 1.8, opacity: 0.9 }}>
          <p>
            Tracking DSA (Data Structures and Algorithms) problems is essential for continuous growth in software engineering. 
            By maintaining a personal record of solved patterns and hard problems, you ensure better retention and efficiency 
            during technical interviews.
          </p>
          <br />
          <h3>Core Features of TODO Shivam app</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
            <li>Real-time database sync using Firebase Firestore.</li>
            <li>Media cloud storage for important diagram snapshots and resource videos.</li>
            <li>Responsive design optimized for both desktop and mobile view.</li>
            <li>Premium Glassmorphism UI for a futuristic productivity experience.</li>
          </ul>
        </div>
      </section>

      {/* FAQ Section (Premium Rule) */}
      <section style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { q: "Is this app connected to Firebase?", a: "Yes, all data including your todo list and media links are securely stored and synced with Firebase Firestore." },
              { q: "Can I upload videos directly?", a: "Currently, you can save video links and upload smaller clips directly to Firebase Storage." },
              { q: "How do I mark a DSA problem as completed?", a: "Navigate to the DSA Tracker page and use the interactive checkboxes next to each problem entry." },
              { q: "Is the design responsive?", a: "Absolutely. The dashboard is built with a mobile-first approach using sleek CSS Grid and Flexbox layouts." }
            ].map((item, i) => (
              <div key={i} className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                <h4 style={{ color: 'hsl(var(--accent))', marginBottom: '0.5rem' }}>{item.q}</h4>
                <p style={{ opacity: 0.8 }}>{item.a}</p>
              </div>
            ))}
          </div>
      </section>

      {/* Related Section (Premium Rule) */}
      <section style={{ textAlign: 'center' }}>
          <h3>Related Productivity Tools</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
             <Link href="/dsa-tracker" className="highlight">DSA Solver</Link>
             <span>|</span>
             <Link href="/gallery" className="highlight">Resource Hub</Link>
             <span>|</span>
             <Link href="/" className="highlight">Dashboard</Link>
          </div>
      </section>
    </>
  );
}
