"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, ChevronRight } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  updatedAt: any;
}

export default function NotepadClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
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
      {/* Sidebar */}
      <div className={`sidebar ${activeId ? 'hidden-mobile' : 'visible-mobile'}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '2px' }}>STASH</h2>
          <Plus size={18} style={{ cursor: 'pointer' }} onClick={createNote} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {notes.map(note => (
            <div 
              key={note.id} 
              onClick={() => setActiveId(note.id)}
              className={`note-item ${activeId === note.id ? 'active' : ''}`}
            >
              <span className="note-title">
                {note.id.replace(/-/g, ' ')}
              </span>
              <Trash2 size={12} style={{ opacity: 0.4 }} onClick={(e) => deleteNote(note.id, e)} />
            </div>
          ))}
          {loading && <p style={{ opacity: 0.5, fontSize: '0.7rem' }}>LOADING...</p>}
        </div>
      </div>

      {/* Editor */}
      <div className={`editor ${!activeId ? 'hidden-mobile' : 'visible-mobile'}`}>
        {!activeId ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
             <h1 style={{ fontSize: '3rem', fontWeight: 900 }}>SELECT</h1>
             <ChevronRight size={32} />
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setActiveId(null)} 
                    className="mobile-only-btn"
                    style={{ background: 'none', border: '1px solid #333', color: 'white', padding: '0.4rem 0.6rem' }}
                  >
                    BACK
                  </button>
                  <h1 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>{activeId.replace(/-/g, ' ')}</h1>
               </div>
               <button onClick={handleSave} className="btn-primary" disabled={saving} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                 {saving ? '...' : 'SAVE'}
               </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="TYPE HERE..."
              className="input-glass"
              style={{ 
                flex: 1,
                minHeight: '60vh', 
                padding: '1rem', 
                fontFamily: 'monospace', 
                fontSize: '1rem', 
                resize: 'none',
                backgroundColor: 'black',
                color: 'white',
                border: '1px solid #333',
                lineHeight: '1.4'
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .notepad-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: calc(100vh - 80px);
        }
        .sidebar {
          border-right: 1px solid #222;
          padding: 1.5rem;
          background: #050505;
        }
        .note-item {
          padding: 0.75rem;
          border: 1px solid #111;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1px;
        }
        .note-item.active {
          border-color: white;
          background: #111;
        }
        .note-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .editor {
          padding: 1.5rem;
          background: black;
        }
        .mobile-only-btn {
          display: none;
        }

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
          .sidebar, .editor {
            padding: 1rem;
            min-height: calc(100vh - 80px);
          }
          .mobile-only-btn {
            display: inline-block;
          }
        }
      `}</style>
    </div>
  );
}
