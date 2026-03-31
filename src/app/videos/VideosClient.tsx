"use client";
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, Film, Upload, Download, Loader2, LayoutGrid, List, Play } from 'lucide-react';

interface SavedVideo {
  id: string;
  url: string;
  createdAt: string;
}

export default function VideosClient() {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME = "dvznt84hj";
  const UPLOAD_PRESET = "shivamtodo";

  useEffect(() => {
    const q = query(collection(db, 'saved-videos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedVideo)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    try {
      await addDoc(collection(db, 'saved-videos'), { url, createdAt: new Date().toISOString() });
      setUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
        alert("File too large. Maximum size is 100MB.");
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        await addDoc(collection(db, 'saved-videos'), { url: data.secure_url, createdAt: new Date().toISOString() });
      } else {
          throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteVideo = async (id: string) => {
    if (window.confirm("Delete this video?")) {
      await deleteDoc(doc(db, 'saved-videos', id));
    }
  };

  const downloadVideo = async (videoUrl: string, id: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${id.slice(0, 5)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(videoUrl, '_blank');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '2px' }}>VIDEOS</h1>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem' }}>
            <button
               className="icon-toggle"
               onClick={() => setViewMode('grid')}
               style={{ background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#666' }}
            >
              <LayoutGrid size={18} />
            </button>
            <button
               className="icon-toggle"
               onClick={() => setViewMode('list')}
               style={{ background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent', color: viewMode === 'list' ? '#fff' : '#666' }}
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
            {uploading ? 'UPLOADING...' : 'UPLOAD VIDEO'}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          accept="video/*"
        />
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="OR PASTE VIDEO URL..."
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
      ) : videos.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '4rem', border: '1px dashed #333', borderRadius: '1rem' }}>
          NO VIDEOS YET
        </div>
      ) : viewMode === 'grid' ? (
        <div className="video-grid">
          {videos.map(item => (
            <div key={item.id} className="glass-card grid-item" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#000' }}>
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="card-actions" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Download
                    size={16}
                    style={{ cursor: 'pointer', opacity: 0.6 }}
                    onClick={() => downloadVideo(item.url, item.id)}
                  />
                  <Trash2
                    size={16}
                    style={{ cursor: 'pointer', opacity: 0.6, color: '#ff4444' }}
                    onClick={() => deleteVideo(item.id)}
                  />
                </div>
                <span style={{ fontSize: '0.6rem', opacity: 0.3, fontWeight: 700 }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {videos.map(item => (
            <div key={item.id} className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '45px', background: '#111', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                 <Play size={16} fill="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                  {item.url}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.3 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <Download
                  size={18}
                  style={{ cursor: 'pointer', opacity: 0.6 }}
                  onClick={() => downloadVideo(item.url, item.id)}
                />
                <Trash2
                  size={18}
                  style={{ cursor: 'pointer', opacity: 0.6, color: '#ff4444' }}
                  onClick={() => deleteVideo(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .icon-toggle {
          padding: 0.5rem;
          border: none;
          border-radius: 0.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        @media (max-width: 640px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.2rem;
            padding: 0.5rem;
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
