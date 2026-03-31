"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Link as LinkIcon, Trash2, ExternalLink, Pin } from 'lucide-react';
import Link from 'next/link';

interface SavedLink {
  id: string;
  url: string;
  createdAt: string;
  pinned?: boolean;
}

export default function LinksClient() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'saved-links'), orderBy('pinned', 'desc'), orderBy('createdAt', 'desc'));
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
      await addDoc(collection(db, 'saved-links'), { url, createdAt: new Date().toISOString(), pinned: false });
      setUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    try {
      await updateDoc(doc(db, 'saved-links', id), { pinned: !currentPinned });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteLink = async (id: string) => {
    if (confirm("DELETE THIS LINK?")) {
      await deleteDoc(doc(db, 'saved-links', id));
    }
  };

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>LOADING...</div>
        ) : links.length === 0 ? (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>EMPTY</div>
        ) : (
          links.map(item => (
            <div key={item.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: item.pinned ? '1px solid #444' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden', flex: 1 }}>
                {item.pinned ? <Pin size={16} fill="white" /> : <LinkIcon size={16} style={{ opacity: 0.5 }} />}
                <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontSize: '0.9rem' }}>
                  {item.url}
                </a>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', marginLeft: '1rem', alignItems: 'center' }}>
                <Pin 
                  size={16} 
                  style={{ cursor: 'pointer', opacity: item.pinned ? 1 : 0.2 }} 
                  onClick={() => togglePin(item.id, !!item.pinned)} 
                />
                <a href={item.url} target="_blank" rel="noreferrer" style={{ opacity: 0.5 }}>
                  <ExternalLink size={16} />
                </a>
                <Trash2 size={16} style={{ cursor: 'pointer', opacity: 0.3 }} onClick={() => deleteLink(item.id)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
