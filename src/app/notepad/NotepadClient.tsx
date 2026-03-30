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
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 300px) 1fr', minHeight: 'calc(100vh - 80px)' }}>
      {/* Sidebar */}
      <div style={{ borderRight: '1px solid #333', padding: '1.5rem', background: '#050505' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '2px' }}>STASH</h2>
          <Plus size={18} style={{ cursor: 'pointer' }} onClick={createNote} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveId(note.id)}
              style={{
                padding: '0.75rem',
                border: activeId === note.id ? '1px solid white' : '1px solid #222',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: activeId === note.id ? '#111' : 'transparent',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '1px'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {note.id.replace(/-/g, ' ')}
              </span>
              <Trash2 size={14} style={{ opacity: 0.4 }} onClick={(e) => deleteNote(note.id, e)} />
            </div>
          ))}
          {loading && <p style={{ opacity: 0.5, fontSize: '0.7rem' }}>LOADING...</p>}
        </div>
      </div>

      {/* Editor */}
      <div style={{ padding: '2rem' }}>
        {!activeId ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 900 }}>SELECT OR CREATE</h1>
            <ChevronRight size={48} />
          </div>
        ) : (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>{activeId.replace(/-/g, ' ')}</h1>
                <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>EDITING RAW TEXT</p>
              </div>
              <button onClick={handleSave} className="btn-primary" disabled={saving}>
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="TYPE HERE..."
              className="input-glass"
              style={{
                minHeight: '70vh',
                padding: '2rem',
                fontFamily: 'monospace',
                fontSize: '1rem',
                resize: 'none',
                backgroundColor: 'black',
                color: 'white',
                border: '1px solid #333',
                lineHeight: '1.6'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
