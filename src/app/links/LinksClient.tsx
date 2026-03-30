"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Link as LinkIcon, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SavedLink {
  id: string;
  url: string;
  createdAt: string;
}

export default function LinksClient() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'saved-links'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedLink)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    try {
      await addDoc(collection(db, 'saved-links'), { url, createdAt: new Date().toISOString() });
      setUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteLink = async (id: string) => {
    await deleteDoc(doc(db, 'saved-links', id));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900 }} className="gradient-text">Saved Link Stash</h1>
        <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>A raw, no-nonsense repository for your internet findings and technical documentations.</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto 4rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any https:// link here..."
            className="input-glass"
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Store Link
          </button>
        </form>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>Loading links...</div>
        ) : links.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', opacity: 0.5 }}>Your stash is totally empty.</div>
        ) : (
          links.map(item => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                <LinkIcon className="highlight" size={20} />
                <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'var(--foreground)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {item.url}
                </a>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href={item.url} target="_blank" rel="noreferrer" style={{ opacity: 0.5, cursor: 'pointer' }}>
                  <ExternalLink size={18} />
                </a>
                <Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => deleteLink(item.id)} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Basic SEO section below the tool */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
        <h2>Web Link <span className="highlight">Manager Application</span></h2>
        <p style={{ opacity: 0.8, lineHeight: 1.8 }}>An engineer’s toolkit requires a rapid link repository. Bookmark tools get messy. This simple list lets you preserve pure URLs across your machines with instant Firebase ingestion.</p>
        
        <h3 style={{ marginTop: '2rem' }}>Storage Logic Formula</h3>
        <p style={{ opacity: 0.8, marginBottom: '1rem' }}>When organizing raw data strings, the system treats URL records securely while remaining purely O(1) in its retrieval capability.</p>
        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'hsl(var(--accent))', marginBottom: '1rem' }}>
          Fetch speed = O(1) Constant Time
        </div>
        
        <h3>Frequently Asked Questions</h3>
        {[
          { q: "Is it a fancy bookmark?", a: "No, it's just a place to copy and paste links." },
          { q: "Can I scrape metadata?", a: "Not on this page. Pure URLs only." },
          { q: "How do I use it?", a: "Paste, Enter, done." },
          { q: "Is it backed up?", a: "Automatically mirrored across Cloud Firestore nodes in real-time." }
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', marginBottom: '1rem', marginTop: '1rem' }}>
             <h4 style={{ color: 'hsl(var(--accent))', marginBottom: '0.4rem' }}>{item.q}</h4>
             <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{item.a}</p>
          </div>
        ))}
        
        <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
            <h3>Tool Network Directory</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
               <Link href="/notepad" className="highlight">DSA Notepad</Link>
               <span>|</span>
               <Link href="/images" className="highlight">Image Repository</Link>
            </div>
        </div>
      </section>
    </div>
  );
}
