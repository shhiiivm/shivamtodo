"use client";
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Film, Upload, Download, Loader2, LayoutGrid, List, Play, X, Pin } from 'lucide-react';

interface SavedVideo {
  id: string;
  url: string;
  createdAt: string;
  pinned?: boolean;
}

export default function VideosClient() {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME = "dvznt84hj";
  const UPLOAD_PRESET = "shivamtodo";

  useEffect(() => {
    const q = query(collection(db, 'saved-videos'), orderBy('pinned', 'desc'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedVideo)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getThumbnail = (videoUrl: string) => {
    if (videoUrl.includes('cloudinary.com')) {
      return videoUrl.replace(/\.[^/.]+$/, ".jpg").replace("/video/upload/", "/video/upload/c_fill,h_400,w_400,so_0/");
    }
    return null;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    try {
      await addDoc(collection(db, 'saved-videos'), { url, createdAt: new Date().toISOString(), pinned: false });
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
        await addDoc(collection(db, 'saved-videos'), { url: data.secure_url, createdAt: new Date().toISOString(), pinned: false });
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

  const togglePin = async (id: string, currentPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'saved-videos', id), { pinned: !currentPinned });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVideo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this video?")) {
      await deleteDoc(doc(db, 'saved-videos', id));
    }
  };

  const downloadVideo = async (e: React.MouseEvent, videoUrl: string, id: string) => {
    e.stopPropagation();
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
    <div className="container">
      <div className="header-actions">
        <h1 className="title">VIDEOS</h1>

        <div className="controls">
          <div className="glass-card mode-toggle">
            <button
              className={`icon-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`icon-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary"
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
          accept="video/*"
        />
      </div>

      <div className="glass-card url-form">
        <form onSubmit={handleAdd}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="PASTE VIDEO URL..."
            className="input-glass"
            required
          />
          <button type="submit" className="btn-primary">
            ADD
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="animate-spin" />
          <p>LOADING...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          NO VIDEOS YET
        </div>
      ) : viewMode === 'grid' ? (
        <div className="video-grid">
          {videos.map(item => {
            const thumb = getThumbnail(item.url);
            return (
              <div 
                key={item.id} 
                className={`grid-item ${item.pinned ? 'pinned' : ''}`} 
                onClick={() => setPlayingVideo(item.url)}
              >
                {thumb ? (
                  <img src={thumb} alt="Preview" />
                ) : (
                  <div className="video-placeholder">
                    <Play size={24} fill="white" />
                  </div>
                )}
                
                {item.pinned && (
                    <div className="pinned-badge">
                        <Pin size={14} fill="white" />
                    </div>
                )}

                <div className="grid-overlay">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Pin 
                        size={20} 
                        style={{ cursor: 'pointer', opacity: item.pinned ? 1 : 0.6 }} 
                        onClick={(e) => togglePin(item.id, !!item.pinned, e)} 
                    />
                    <Play size={30} fill="white" />
                    <Trash2 
                        size={20} 
                        style={{ cursor: 'pointer', opacity: 0.6, color: '#ff4444' }} 
                        onClick={(e) => deleteVideo(e, item.id)} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="video-list">
          {videos.map(item => {
            const thumb = getThumbnail(item.url);
            return (
              <div key={item.id} className="glass-card list-item" onClick={() => setPlayingVideo(item.url)} style={{ border: item.pinned ? '1px solid #444' : undefined }}>
                <div className="list-thumb">
                  {thumb ? (
                    <img src={thumb} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Play size={16} fill="white" />
                  )}
                  {item.pinned && <div style={{ position: 'absolute', top: '-5px', left: '-5px' }}><Pin size={8} fill="white" /></div>}
                </div>
                <div className="list-info">
                  <div className="list-url" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.pinned && <Pin size={14} fill="white" />}
                    {item.url}
                  </div>
                  <div className="list-date">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <div className="list-actions">
                  <Pin 
                    size={18} 
                    style={{ cursor: 'pointer', opacity: item.pinned ? 1 : 0.2 }} 
                    onClick={(e) => togglePin(item.id, !!item.pinned, e)} 
                  />
                  <Download size={18} className="icon-btn" onClick={(e) => downloadVideo(e, item.url, item.id)} />
                  <Trash2 size={18} className="icon-btn danger" onClick={(e) => deleteVideo(e, item.id)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="modal-overlay" onClick={() => setPlayingVideo(null)}>
          <button className="close-btn" onClick={() => setPlayingVideo(null)}>
            <X size={32} />
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <video src={playingVideo} controls autoPlay className="main-player" />
            <div className="modal-actions">
                <button className="btn-primary" onClick={(e) => {
                    const id = videos.find(v => v.url === playingVideo)?.id || 'download';
                    downloadVideo(e as any, playingVideo, id);
                }}>
                    <Download size={18} /> DOWNLOAD
                </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header-actions {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .mode-toggle {
          padding: 0.25rem;
          display: flex;
          gap: 0.25rem;
        }
        .icon-toggle {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 0.4rem;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        .icon-toggle.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .url-form {
          margin-bottom: 2rem;
        }
        .url-form form {
          display: flex;
          gap: 1rem;
        }
        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem;
          opacity: 0.5;
        }
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .grid-item {
          aspect-ratio: 1;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }
        .grid-item.pinned {
            border-color: #555;
        }
        .pinned-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 10;
            background: rgba(0,0,0,0.5);
            padding: 4px;
            border-radius: 4px;
        }
        .grid-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }
        .grid-item:hover .grid-overlay {
          opacity: 1;
          pointer-events: auto;
        }
        .video-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
        }

        .video-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .list-item {
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
        }
        .list-thumb {
          width: 80px;
          height: 45px;
          background: #111;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .list-info {
          flex: 1;
          min-width: 0;
        }
        .list-url {
          font-size: 0.9rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .list-date {
          font-size: 0.7rem;
          opacity: 0.3;
        }
        .list-actions {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }
        .icon-btn {
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .icon-btn:hover {
          opacity: 1;
        }
        .icon-btn.danger:hover {
          color: #ff4444;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .close-btn {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          z-index: 2001;
        }
        .modal-content {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .main-player {
          width: 100%;
          max-height: 80vh;
          background: #000;
          box-shadow: 0 0 50px rgba(0,0,0,0.5);
        }
        .modal-actions {
            display: flex;
            justify-content: center;
        }

        @media (max-width: 640px) {
          .container { padding: 1rem; }
          .title { font-size: 1.8rem; }
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2px;
          }
          .grid-item {
            border: none;
          }
          .grid-overlay { display: none; }
          .header-actions { margin-bottom: 1rem; }
          .pinned-badge {
            top: 5px;
            left: 5px;
            padding: 2px;
          }
        }
      `}</style>
    </div>
  );
}
