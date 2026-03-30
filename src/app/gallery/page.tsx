"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Video, Link as LinkIcon, Plus, Trash2, ExternalLink, Globe } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: string;
  createdAt: string;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('image');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery-items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase error or permissions issue:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    try {
      await addDoc(collection(db, 'gallery-items'), {
        title,
        url,
        type,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setUrl('');
    } catch (err) {
      console.error("Add Error:", err);
      alert("Make sure you configured Firebase!");
    }
  };

  const deleteItem = async (id: string) => {
    if (window.confirm("Delete this gallery item?")) {
      await deleteDoc(doc(db, 'gallery-items', id));
    }
  };

  const schema = {
     "@context": "https://schema.org",
     "@type": "WebApplication",
     "name": "Media Link Manager",
     "applicationCategory": "MultimediaApplication"
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900 }} className="gradient-text">Media & Resource Gallery</h1>
        <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>Curating the best of the web. Images, Videos, and Key Links.</p>
      </div>

      {/* Add Media Form */}
      <div className="glass-card" style={{ marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} className="highlight" /> Add Link/Media
          </h3>
          <form onSubmit={addItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
             <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Media Title</label>
                <input className="input-glass" placeholder="e.g. System Design Diagram" value={title} onChange={(e) => setTitle(e.target.value)} />
             </div>
             <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>URL</label>
                <input className="input-glass" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
             </div>
             <div>
                <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Type</label>
                <select className="input-glass" value={type} onChange={(e) => setType(e.target.value)}>
                   <option value="image">Image</option>
                   <option value="video">Video</option>
                   <option value="link">Link</option>
                </select>
             </div>
             <button type="submit" className="btn-primary">Save Entry</button>
          </form>
      </div>

      {/* Media Grid */}
      {loading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>Loading components...</div>
      ) : items.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
            <Globe size={40} style={{ marginBottom: '1rem' }} />
            <p>Your gallery is empty. Start adding your favorite resources!</p>
          </div>
      ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
             {items.map((item) => (
                <div key={item.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                   {item.type === 'image' && (
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                         <img 
                           src={item.url} 
                           alt={item.title} 
                           style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                           onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                           onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                           onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=300&h=200'; }}
                         />
                      </div>
                   )}
                   {item.type === 'video' && (
                      <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Video size={40} className="highlight" />
                      </div>
                   )}
                   {item.type === 'link' && (
                      <div style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(255,255,255,0.01)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <LinkIcon size={40} className="highlight" />
                      </div>
                   )}
                   <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <div>
                            <h4 style={{ marginBottom: '0.4rem' }}>{item.title}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--accent))', textTransform: 'capitalize' }}>
                               {item.type}
                            </span>
                         </div>
                         <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foreground)', opacity: 0.5 }}>
                               <ExternalLink size={18} />
                            </a>
                            <div onClick={() => deleteItem(item.id)} style={{ cursor: 'pointer', opacity: 0.3 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.3'}>
                               <Trash2 size={18} color="#ef4444" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
      )}

      {/* SEO Section */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Personal <span className="highlight">Resource Hub</span></h2>
          <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
            A Media Link Manager is an essential tool for engineers to curate high-quality learning resources, 
            documentation links, and system design diagrams. Organizing these in a visual gallery increases accessibility 
            and allows for quick referencing during complex tasks.
          </p>

          <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>How to use the Gallery?</h3>
          <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
            Simply input the URL of the image or video you want to save. For YouTube videos, use the direct watch link.
            For documentation, use the primary landing page URL.
          </p>

          <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Storage Calculation Algorithm</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>When managing links, we calculate the bandwidth efficiency using the following logic:</p>
            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'hsl(var(--accent))', marginBottom: '1rem' }}>
              Efficiency = (Content_Size / Registry_Cost) * 100
            </div>
            <p style={{ opacity: 0.7 }}>Saving only the registry (link) rather than the heavy file ensures 100% efficient storage utilization for your personal tracker.</p>
          </div>

          <div style={{ marginTop: '3rem' }}>
             <h3>Media Manager FAQ</h3>
             {[
               { q: "Can I save social media videos?", a: "Yes, you can save links to YouTube, Vimeo, or even direct video files hosted elsewhere." },
               { q: "What is a 'Registry Link'?", a: "It's the stored URL of the resource, which allows us to maintain a lightweight database while providing instant access to heavy content." },
               { q: "Is there a limit to how many items I can add?", a: "With Firebase Firestore, you can add thousands of links without any performance degradation." },
               { q: "How do I edit an entry?", a: "Currently, you can delete an entry and re-add it. More editing features are coming soon!" }
             ].map((item, i) => (
                <div key={i} className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', marginBottom: '1rem' }}>
                   <h4 style={{ color: 'hsl(var(--accent))', marginBottom: '0.4rem' }}>{item.q}</h4>
                   <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{item.a}</p>
                </div>
             ))}
          </div>
      </section>

      {/* Related Section (Premium Rule) */}
      <section style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
          <h3>Explore More Productivity</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
             <Link href="/" className="highlight">Dashboard</Link>
             <span>|</span>
             <Link href="/dsa-tracker" className="highlight">DSA Solver</Link>
             <span>|</span>
             <Link href="/gallery" className="highlight">Media Hub</Link>
             <span>|</span>
             <Link href="https://unsplash.com" target="_blank" className="highlight">Stock Resources</Link>
          </div>
      </section>
    </div>
  );
}
