"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, ChevronLeft, Save, Search, Pin } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  updatedAt: any;
  isPinned?: boolean;
}

export default function NotepadClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number>(1);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesData);
      setLoading(false);
    }, (error) => {
      console.error("FIRESTORE ERROR:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setContent('');
      return;
    }
    const activeNote = notes.find(n => n.id === activeId);
    if (activeNote) {
      setContent(activeNote.text);
    }
  }, [activeId, notes]);

  const createNote = async () => {
    const title = prompt("NEW NOTE NAME:");
    if (!title) return;
    const id = title.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(db, 'notes', id), { text: '', updatedAt: new Date() });
    setActiveId(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'notes', activeId), { text: content, updatedAt: new Date() });
      setTimeout(() => setSaving(false), 1000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("DELETE THIS NOTE?")) {
      await deleteDoc(doc(db, 'notes', id));
      if (activeId === id) setActiveId(null);
    }
  };

  const togglePin = async (id: string, e: React.MouseEvent, isPinned: boolean) => {
    e.stopPropagation();
    await setDoc(doc(db, 'notes', id), { isPinned: !isPinned }, { merge: true });
  };

  const filteredNotes = notes.filter(n => 
    n.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="notepad-container">
      {/* Sidebar - Desktop Only */}
      <div className="sidebar desktop-only">
        <div className="sidebar-header">
          <h2 className="sidebar-title">SHIVAM</h2>
          <Plus size={18} className="icon-btn" onClick={createNote} />
        </div>
        <div className="search-container">
            <Search size={14} style={{ opacity: 0.4 }} />
            <input 
                type="text" 
                placeholder="SEARCH..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />
        </div>
        <div className="notes-list">
          {sortedNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveId(note.id)}
              className={`note-item ${activeId === note.id ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  {note.isPinned && <Pin size={10} fill="white" style={{ flexShrink: 0 }} />}
                  <span className="note-title">{note.id.replace(/-/g, ' ')}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Pin 
                    size={12} 
                    className={`pin-icon ${note.isPinned ? 'active' : ''}`} 
                    onClick={(e) => togglePin(note.id, e, !!note.isPinned)} 
                />
                <Trash2 size={12} className="delete-icon" onClick={(e) => deleteNote(note.id, e)} />
              </div>
            </div>
          ))}
          {loading && <p className="loading-text">LOADING...</p>}
        </div>
      </div>

      {/* Main Area */}
      <div className="main-content">
        {!activeId ? (
          <div className="grid-view">
            <div className="grid-header">
               <div className="mobile-header">
                  <h1 className="mobile-title">SHIVAM</h1>
                  <button className="new-note-btn-mobile" onClick={createNote}>
                    <Plus size={18} />
                  </button>
               </div>
               
               <div className="desktop-header desktop-only">
                  <h1 className="recent-title">RECENT</h1>
                  <div className="view-toggles">
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>VIEW:</span>
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setViewCount(num)}
                        className={`view-btn ${viewCount === num ? 'active' : ''}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="search-container-mobile mobile-only">
                <Search size={18} style={{ opacity: 0.4 }} />
                <input 
                    type="text" 
                    placeholder="SEARCH NOTES..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input-mobile"
                />
            </div>

            <div className="notes-grid" style={{
              gridTemplateColumns: viewCount > 1 ? `repeat(${viewCount}, 1fr)` : undefined,
            }}>
              {sortedNotes.map(note => (
                <div
                  key={note.id}
                  className={`note-card ${note.isPinned ? 'pinned-card' : ''}`}
                  onClick={() => setActiveId(note.id)}
                >
                  <div className="note-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {note.isPinned && <Pin size={14} fill="white" />}
                        <h3 className="note-card-title">{note.id.replace(/-/g, ' ')}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <Pin
                            size={16}
                            className={`pin-icon-card ${note.isPinned ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); togglePin(note.id, e, !!note.isPinned); }}
                        />
                        <Trash2
                            size={16}
                            className="delete-icon-card"
                            onClick={(e) => { e.stopPropagation(); deleteNote(note.id, e); }}
                        />
                    </div>
                  </div>
                  <div className="note-preview">
                    <p>{note.text || 'EMPTY NOTE...'}</p>
                  </div>
                </div>
              ))}
              <div onClick={createNote} className="note-card new-card">
                <Plus size={32} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem' }}>NEW NOTE</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="editor-view">
            <div className="editor-header-bar">
              <div className="header-left">
                <button onClick={() => setActiveId(null)} className="back-btn">
                  <ChevronLeft size={20} />
                  <span className="back-text">BACK</span>
                </button>
                <h1 className="active-note-title">{activeId.replace(/-/g, ' ')}</h1>
              </div>
              <button onClick={handleSave} className="save-btn" disabled={saving}>
                <Save size={18} />
                <span>{saving ? '...' : 'SAVE'}</span>
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="TYPE SOMETHING..."
              className="main-editor-textarea"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .notepad-container {
          display: flex;
          height: calc(100vh - 64px);
          background: black;
          color: white;
          overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          border-right: 1px solid #1a1a1a;
          display: flex;
          flex-direction: column;
          background: #050505;
        }
        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sidebar-title {
          font-size: 0.9rem;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
        }
        .icon-btn {
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .icon-btn:hover {
          opacity: 1;
        }

        /* Search */
        .search-container {
          padding: 0 1.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid #1a1a1a;
        }
        .search-input {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          width: 100%;
          outline: none;
        }

        .notes-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .note-item {
          padding: 0.75rem;
          border: 1px solid #111;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }
        .note-item:hover {
          background: #111;
          border-color: #333;
        }
        .note-item.active {
          background: #151515;
          border-color: white;
        }
        .note-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .delete-icon, .pin-icon {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .note-item:hover .delete-icon, .note-item:hover .pin-icon {
          opacity: 0.4;
        }
        .pin-icon.active {
            opacity: 1 !important;
            color: #44ff44;
        }
        .delete-icon:hover {
          opacity: 1 !important;
          color: #ff4444;
        }
        .pin-icon:hover {
            opacity: 1 !important;
            color: white;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          overflow-y: auto;
          position: relative;
        }

        /* Grid View */
        .grid-view {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .desktop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .recent-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: 4px;
        }
        .view-toggles {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .view-btn {
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
          font-weight: 900;
          cursor: pointer;
        }
        .view-btn.active {
          background: white;
          color: black;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .note-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          min-height: 180px;
        }
        .note-card:hover {
          border-color: #444;
          transform: translateY(-2px);
          background: #0d0d0d;
        }
        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .note-card-title {
          font-size: 0.9rem;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0;
          letter-spacing: 1px;
        }
        .delete-icon-card, .pin-icon-card {
           opacity: 0.3;
           transition: opacity 0.2s;
        }
        .note-card:hover .delete-icon-card, .note-card:hover .pin-icon-card {
            opacity: 0.6;
        }
        .pin-icon-card.active {
            opacity: 1 !important;
            color: #44ff44;
        }
        .delete-icon-card:hover {
            opacity: 1 !important;
            color: #ff4444;
        }
        .pin-icon-card:hover {
            opacity: 1 !important;
            color: white;
        }
        .pinned-card {
            border-color: rgba(255, 255, 255, 0.3) !important;
            background: #0f0f0f !important;
        }
        .note-preview p {
          font-size: 0.85rem;
          opacity: 0.5;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .new-card {
          border-style: dashed;
          border-color: #333;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
        }
        .new-card:hover {
          opacity: 1;
        }

        /* Editor View */
        .editor-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .editor-header-bar {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1a1a1a;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .back-btn {
          background: transparent;
          border: 1px solid #333;
          color: white;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 0.75rem;
          cursor: pointer;
          border-radius: 6px;
        }
        .active-note-title {
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0;
        }
        .save-btn {
          background: white;
          color: black;
          border: none;
          padding: 0.6rem 1.5rem;
          font-weight: 900;
          font-size: 0.8rem;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .main-editor-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 3rem;
          font-size: 1.1rem;
          font-family: inherit;
          line-height: 1.8;
          resize: none;
          outline: none;
        }

        .mobile-header, .mobile-only, .search-container-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          .mobile-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .mobile-title {
            font-size: 1.5rem;
            font-weight: 900;
            letter-spacing: 2px;
          }
          .new-note-btn-mobile {
            background: #111;
            border: 1px solid #333;
            color: white;
            padding: 0.6rem;
            border-radius: 50%;
            cursor: pointer;
          }
          .mobile-only {
            display: flex;
          }
          .search-container-mobile {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: #111;
            padding: 0.8rem 1.2rem;
            border-radius: 8px;
            margin: 0 1rem 1.5rem 1rem;
            border: 1px solid #222;
          }
          .search-input-mobile {
            background: transparent;
            border: none;
            color: white;
            font-size: 1rem;
            width: 100%;
            outline: none;
          }
          .grid-view {
            padding: 1rem;
          }
          .notes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .note-card {
            min-height: 120px;
            padding: 1.25rem;
          }
          .editor-header-bar {
            padding: 1rem;
          }
          .header-left {
            gap: 0.75rem;
          }
          .back-btn {
            padding: 0.45rem;
          }
          .back-text {
            display: none;
          }
          .active-note-title {
            font-size: 1rem;
          }
          .main-editor-textarea {
            padding: 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
