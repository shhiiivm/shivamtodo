"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Link as LinkIcon, Trash2, ExternalLink, Pin } from 'lucide-react';
import Link from 'next/link';

interface SavedLink {
  id: string;
  url: string;
  createdAt: string;
  isPinned?: boolean;
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

  const togglePin = async (id: string, isPinned: boolean) => {
    await setDoc(doc(db, 'saved-links', id), { isPinned: !isPinned }, { merge: true });
  };

  const sortedLinks = [...links].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>LINKS</h1>

      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="PASTE URL..."
            className="input-glass"
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            ADD
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>LOADING...</div>
        ) : links.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>EMPTY</div>
        ) : (
          sortedLinks.map(item => (
            <div key={item.id} className="glass-card" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem',
                borderColor: item.isPinned ? 'rgba(255,255,255,0.3)' : undefined,
                background: item.isPinned ? 'rgba(255,255,255,0.05)' : undefined
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden', flex: 1 }}>
                {item.isPinned ? <Pin size={16} fill="white" /> : <LinkIcon size={16} />}
                <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontSize: '0.9rem' }}>
                  {item.url}
                </a>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
                <Pin 
                    size={16} 
                    style={{ 
                        cursor: 'pointer', 
                        opacity: item.isPinned ? 1 : 0.4, 
                        color: item.isPinned ? '#44ff44' : 'inherit' 
                    }} 
                    onClick={() => togglePin(item.id, !!item.isPinned)} 
                />
                <a href={item.url} target="_blank" rel="noreferrer" style={{ opacity: 0.5 }}>
                  <ExternalLink size={16} />
                </a>
                <Trash2 size={16} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => deleteLink(item.id)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
