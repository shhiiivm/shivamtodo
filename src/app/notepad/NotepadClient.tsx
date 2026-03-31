"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, ChevronLeft, Save } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  updatedAt: any;
}

export default function NotepadClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number>(1);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load all notes list
  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesData);
      if (notesData.length > 0 && !activeId) {
        // Don't auto-select to avoid overwriting content
      }
      setLoading(false);
    }, (error) => {
      console.error("FIRESTORE ERROR:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [activeId]);

  // Load active note content
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

  return (
    <div className="notepad-container">
      {/* Sidebar - desktop only, hidden on mobile */}
      <div className={`sidebar hidden-mobile`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">NOTES</h2>
          <button className="new-note-btn" onClick={createNote}>
            <Plus size={16} />
            <span className="new-note-label">NEW</span>
          </button>
        </div>

        <div className="notes-list">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveId(note.id)}
              className={`note-item ${activeId === note.id ? 'active' : ''}`}
            >
              <span className="note-title">
                {note.id.replace(/-/g, ' ')}
              </span>
              <Trash2 size={14} className="delete-icon" onClick={(e) => deleteNote(note.id, e)} />
            </div>
          ))}
          {loading && <p style={{ opacity: 0.5, fontSize: '0.75rem', padding: '0.5rem' }}>LOADING...</p>}
          {!loading && notes.length === 0 && (
            <div className="empty-state">
              <p>No notes yet</p>
              <button className="new-note-btn" onClick={createNote} style={{ marginTop: '0.5rem' }}>
                <Plus size={14} />
                <span>Create one</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`editor ${activeId ? '' : ''}`}>
        {!activeId ? (
          <div className="editor-inner">
            <div className="editor-header">
              <div className="desktop-only" style={{ visibility: 'hidden' }}>spacer</div>
              <div style={{ textAlign: 'center' }}>
                <h1 className="recent-title">RECENT</h1>
                <p className="recent-subtitle">SELECT A NOTE OR CREATE A NEW ONE</p>
              </div>
              <div className="desktop-only view-toggles">
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

            <div className="notes-grid" style={{
              gridTemplateColumns: viewCount > 1 ? `repeat(${viewCount}, 1fr)` : undefined,
              maxWidth: viewCount > 1 ? '100%' : '1200px',
            }}>
              {notes.slice(0, viewCount > 1 ? viewCount : 10).map(note => (
                <div
                  key={note.id}
                  className="note-card"
                  style={{
                    minHeight: viewCount > 1 ? '70vh' : undefined,
                  }}
                  onClick={() => setActiveId(note.id)}
                >
                  <div className="note-card-header">
                    <h3 className="note-card-title">{note.id.replace(/-/g, ' ')}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Trash2
                        size={14}
                        className="delete-icon-card"
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id, e); }}
                        style={{ opacity: 0.4 }}
                      />
                      <div
                        onClick={(e) => { e.stopPropagation(); setActiveId(note.id); }}
                        className="btn-primary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.6rem' }}
                      >
                        OPEN
                      </div>
                    </div>
                  </div>

                  {viewCount > 1 ? (
                    <textarea
                      defaultValue={note.text}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={async (e) => {
                        const newText = e.target.value;
                        if (newText !== note.text) {
                          await setDoc(doc(db, 'notes', note.id), { text: newText, updatedAt: new Date() });
                        }
                      }}
                      placeholder="EMPTY..."
                      className="input-glass note-textarea"
                    />
                  ) : (
                    <div className="note-preview">
                      <p>{note.text || 'EMPTY NOTE...'}</p>
                    </div>
                  )}
                </div>
              ))}

              {viewCount === 1 && (
                <div
                  onClick={createNote}
                  className="note-card new-card"
                >
                  <Plus size={28} style={{ marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>NEW NOTE</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="active-editor">
            <div className="active-editor-header">
              <div className="header-left">
                <button
                  onClick={() => setActiveId(null)}
                  className="back-btn"
                >
                  <ChevronLeft size={18} />
                  <span className="back-label">BACK</span>
                </button>
                <h1 className="active-note-title">{activeId.replace(/-/g, ' ')}</h1>
              </div>
              <button onClick={handleSave} className="save-btn" disabled={saving}>
                <Save size={16} />
                <span className="save-label">{saving ? 'SAVING...' : 'SAVE'}</span>
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="TYPE HERE..."
              className="input-glass main-textarea"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .notepad-container {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: calc(100vh - 80px);
        }

        /* Sidebar */
        .sidebar {
          border-right: 1px solid #1a1a1a;
          padding: 1.25rem;
          background: #050505;
          overflow-y: auto;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .sidebar-title {
          font-size: 0.85rem;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
        }
        .new-note-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid #333;
          color: white;
          padding: 0.4rem 0.7rem;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .new-note-btn:hover {
          background: rgba(255,255,255,0.12);
        }
        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .note-item {
          padding: 0.7rem 0.75rem;
          border: 1px solid #1a1a1a;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1px;
          transition: all 0.15s ease;
        }
        .note-item:hover {
          border-color: #444;
          background: rgba(255,255,255,0.03);
        }
        .note-item.active {
          border-color: white;
          background: #111;
        }
        .note-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 0.5rem;
        }
        .delete-icon {
          opacity: 0.3;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .delete-icon:hover {
          opacity: 0.8;
          color: #ff4444;
        }
        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          opacity: 0.5;
          font-size: 0.8rem;
        }

        /* Editor */
        .editor {
          background: black;
          overflow-y: auto;
        }
        .editor-inner {
          padding: 2rem;
        }
        .editor-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .recent-title {
          font-size: 2.4rem;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
        }
        .recent-subtitle {
          opacity: 0.5;
          font-size: 0.8rem;
          margin: 0.25rem 0 0;
        }
        .view-toggles {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .view-btn {
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 0.3rem 0.6rem;
          font-size: 0.8rem;
          font-weight: 900;
          cursor: pointer;
        }
        .view-btn.active {
          background: white;
          color: black;
        }

        /* Notes Grid */
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin: 0 auto;
        }
        .note-card {
          display: flex;
          flex-direction: column;
          background: rgba(255,255,255,0.03);
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          padding: 1.25rem;
          cursor: pointer;
          transition: border-color 0.2s;
          min-height: 140px;
        }
        .note-card:hover {
          border-color: #444;
        }
        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .note-card-title {
          font-size: 0.85rem;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0;
        }
        .note-textarea {
          flex: 1;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.9rem;
          resize: none;
          background-color: rgba(255,255,255,0.03);
          border: 1px solid #222;
          line-height: 1.4;
        }
        .note-preview p {
          opacity: 0.4;
          font-size: 0.85rem;
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          margin: 0;
        }
        .new-card {
          align-items: center;
          justify-content: center;
          border-style: dashed;
          border-color: #333;
          opacity: 0.6;
          min-height: 140px;
        }
        .new-card:hover {
          opacity: 1;
          border-color: #666;
        }

        /* Active Editor */
        .active-editor {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
        }
        .active-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: 1px solid #333;
          color: white;
          padding: 0.45rem 0.7rem;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          border-radius: 4px;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }
        .back-btn:hover {
          border-color: #666;
        }
        .active-note-title {
          font-size: 1.3rem;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: white;
          color: black;
          border: none;
          padding: 0.5rem 1.2rem;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          border-radius: 4px;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .save-btn:disabled {
          opacity: 0.5;
        }
        .main-textarea {
          flex: 1;
          min-height: 65vh;
          padding: 1.5rem;
          font-family: monospace;
          font-size: 1rem;
          resize: none;
          background-color: #0a0a0a;
          color: white;
          border: 1px solid #222;
          line-height: 1.6;
          border-radius: 6px;
        }
        .mobile-only-btn {
          display: none;
        }

        /* ============ MOBILE ============ */
        @media (max-width: 768px) {
          .notepad-container {
            grid-template-columns: 1fr;
          }
          .hidden-mobile {
            display: none !important;
          }
          .visible-mobile {
            display: flex !important;
            flex-direction: column;
            width: 100%;
          }

          /* Sidebar mobile */
          .sidebar {
            padding: 1rem;
            min-height: auto;
            border-right: none;
          }
          .sidebar-header {
            margin-bottom: 1rem;
          }
          .note-item {
            padding: 0.85rem 0.75rem;
            font-size: 0.8rem;
          }

          /* Editor mobile */
          .editor {
            padding: 0;
          }
          .editor-inner {
            padding: 1rem !important;
          }
          .editor-header {
            justify-content: center;
            margin-bottom: 1.25rem;
          }
          .recent-title {
            font-size: 1.6rem;
            letter-spacing: 2px;
          }
          .recent-subtitle {
            font-size: 0.7rem;
          }
          .view-toggles {
            display: none !important;
          }
          .desktop-only {
            display: none !important;
          }

          /* Notes grid mobile */
          .notes-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem;
          }
          .note-card {
            min-height: 100px !important;
            padding: 1rem;
          }
          .new-card {
            min-height: 80px !important;
          }

          /* Active editor mobile */
          .active-editor {
            padding: 0.75rem;
          }
          .active-editor-header {
            margin-bottom: 0.75rem;
          }
          .back-btn {
            padding: 0.4rem 0.5rem;
          }
          .back-label {
            display: none;
          }
          .active-note-title {
            font-size: 1rem;
          }
          .save-btn {
            padding: 0.45rem 0.8rem;
          }
          .save-label {
            font-size: 0.7rem;
          }
          .main-textarea {
            min-height: calc(100vh - 160px);
            padding: 1rem;
            font-size: 0.9rem;
            border-radius: 4px;
          }
          .mobile-only-btn {
            display: inline-block;
          }
          .new-note-label {
            display: none;
          }
        }

        /* Small mobile */
        @media (max-width: 400px) {
          .active-note-title {
            font-size: 0.85rem;
          }
          .main-textarea {
            padding: 0.75rem;
            font-size: 0.85rem;
          }
          .note-card {
            padding: 0.75rem;
          }
        }

        .delete-icon-card {
            opacity: 0.4;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .delete-icon-card:hover {
            opacity: 1 !important;
            color: #ff4444;
        }
      `}</style>
    </div>
  );
}
