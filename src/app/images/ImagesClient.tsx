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
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>IMAGES</h1>
        <p style={{ opacity: 0.6 }}>VISUAL STASH</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="PASTE IMAGE URL..."
            className="input-glass"
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            ADD
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>LOADING...</div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>EMPTY</div>
        ) : (
          images.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
               <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.url ? (
                     <img 
                        src={item.url} 
                        alt="Saved asset" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style="opacity:0.3; font-size: 0.8rem;">ERROR</span>'; }}
                     />
                  ) : (
                     <ImageIcon size={24} style={{ opacity: 0.2 }} />
                  )}
               </div>
               <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                 <Trash2 size={14} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => deleteImage(item.id)} />
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
