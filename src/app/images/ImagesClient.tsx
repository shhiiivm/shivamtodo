"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SavedImage {
  id: string;
  url: string;
  createdAt: string;
}

export default function ImagesClient() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'saved-images'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedImage)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    try {
      await addDoc(collection(db, 'saved-images'), { url, createdAt: new Date().toISOString() });
      setUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteImage = async (id: string) => {
    await deleteDoc(doc(db, 'saved-images', id));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900 }} className="gradient-text">Image Repository</h1>
        <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>Just paste direct image links and preserve your visual assets.</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto 4rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste direct image URL (jpg, png, webp)..."
            className="input-glass"
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Store Asset
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>Loading assets...</div>
        ) : images.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>No images pasted yet.</div>
        ) : (
          images.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
               <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.url ? (
                     <img 
                        src={item.url} 
                        alt="Saved asset" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style="opacity:0.3">Broken Link</span>'; }}
                     />
                  ) : (
                     <ImageIcon size={40} className="highlight" />
                  )}
               </div>
               <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                 <Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => deleteImage(item.id)} />
               </div>
            </div>
          ))
        )}
      </div>

      {/* Basic SEO block below tool */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
        <h2>Visual Architecture <span className="highlight">Image App</span></h2>
        <p style={{ opacity: 0.8, lineHeight: 1.8 }}>An essential tool for saving direct URLs of images and media. Sometimes saving a link is much faster than downloading the file and uploading it to an external server manually.</p>
        
        <h3 style={{ marginTop: '2rem' }}>Resolution Capacity Algorithm</h3>
        <p style={{ opacity: 0.8, marginBottom: '1rem' }}>This lightweight protocol calculates direct source bindings instead of Blob conversion.</p>
        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'hsl(var(--accent))', marginBottom: '1rem' }}>
            Storage Bytes = Remote Node FileSize
        </div>

        <h3 style={{ marginTop: '3rem' }}>Image Manager FAQ</h3>
        {[
          { q: "Is the image hosted here?", a: "No, it's just hotlinking the URL you provided." },
          { q: "What formats do they support?", a: "Any direct browser-viewable link like JPEG or PNG." },
          { q: "How many images can I add?", a: "As many as you want in your personal stash." },
          { q: "Can I do raw paste?", a: "Yes, grab the URL from any site and paste it in." }
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
               <Link href="/links" className="highlight">Saved Links</Link>
            </div>
        </div>
      </section>
    </div>
  );
}
