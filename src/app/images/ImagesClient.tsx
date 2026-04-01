"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Trash2, ImageIcon, Upload, Download, Loader2, LayoutGrid, List, Pin } from 'lucide-react';

interface SavedImage {
  id: string;
  url: string;
  createdAt: string;
  isPinned?: boolean;
}

export default function ImagesClient() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME = "dvznt84hj";
  const UPLOAD_PRESET = "shivamtodo";

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

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        await addDoc(collection(db, 'saved-images'), { url: data.secure_url, createdAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            uploadFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadFile]);

  const deleteImage = async (id: string) => {
    if (window.confirm("Delete this image?")) {
      await deleteDoc(doc(db, 'saved-images', id));
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    await setDoc(doc(db, 'saved-images', id), { isPinned: !isPinned }, { merge: true });
  };

  const sortedImages = [...images].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const downloadImage = async (imgUrl: string, id: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${id.slice(0, 5)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(imgUrl, '_blank');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.5rem',
                background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                borderRadius: '0.4rem',
                color: viewMode === 'grid' ? '#fff' : '#666',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem',
                background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                borderRadius: '0.4rem',
                color: viewMode === 'list' ? '#fff' : '#666',
                cursor: 'pointer'
              }}
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'UPLOADING...' : 'UPLOAD'}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          accept="image/*"
        />
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="OR PASTE DIRECT IMAGE URL..."
            className="input-glass"
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            ADD URL
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '4rem' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} />
          <div style={{ marginTop: '1rem' }}>LOADING...</div>
        </div>
      ) : images.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '4rem', border: '1px dashed #333', borderRadius: '1rem' }}>
          NO IMAGES YET
        </div>
      ) : viewMode === 'grid' ? (
        <div className="image-grid">
          {sortedImages.map(item => (
            <div key={item.id} className="glass-card grid-item" style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              borderColor: item.isPinned ? 'rgba(255,255,255,0.3)' : undefined
            }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={item.url}
                  alt="Saved asset"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.innerHTML = '<div style="opacity:0.3; font-size:0.7rem; text-align:center;">URL EXPIRED OR INVALID</div>';
                  }}
                />
                {item.isPinned && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '50%' }}>
                    <Pin size={12} fill="white" />
                  </div>
                )}
              </div>
              <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <Pin
                    size={16}
                    style={{ cursor: 'pointer', opacity: item.isPinned ? 1 : 0.4, color: item.isPinned ? '#44ff44' : 'inherit' }}
                    onClick={() => togglePin(item.id, !!item.isPinned)}
                  />
                  <Download
                    size={16}
                    style={{ cursor: 'pointer', opacity: 0.6 }}
                    onClick={() => downloadImage(item.url, item.id)}
                  />
                  <Trash2
                    size={16}
                    style={{ cursor: 'pointer', opacity: 0.6, color: '#ff4444' }}
                    onClick={() => deleteImage(item.id)}
                  />
                </div>
                <span style={{ fontSize: '0.6rem', opacity: 0.3 }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sortedImages.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', background: item.isPinned ? 'rgba(255,255,255,0.05)' : undefined }}>
              <img
                src={item.url}
                alt="Thumbnail"
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: '#000' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.isPinned && <Pin size={10} fill="white" />}
                  {item.url}
                </div>
                <div style={{ fontSize: '0.65rem', opacity: 0.3 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Pin
                  size={16}
                  style={{ cursor: 'pointer', opacity: item.isPinned ? 1 : 0.4, color: item.isPinned ? '#44ff44' : 'inherit' }}
                  onClick={() => togglePin(item.id, !!item.isPinned)}
                />
                <Download
                  size={16}
                  style={{ cursor: 'pointer', opacity: 0.6 }}
                  onClick={() => downloadImage(item.url, item.id)}
                />
                <Trash2
                  size={16}
                  style={{ cursor: 'pointer', opacity: 0.6, color: '#ff4444' }}
                  onClick={() => deleteImage(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .image-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.2rem;
          }
          .grid-item {
            border-radius: 2px !important;
          }
          .card-actions {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
