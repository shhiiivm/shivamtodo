"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function NotepadClient() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'notes', 'dsa-notepad'), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data().text || '');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'notes', 'dsa-notepad'), { text: content });
      setTimeout(() => setSaving(false), 1000);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>NOTEPAD</h1>
        <p style={{ opacity: 0.6 }}>RAW TEXT STORAGE</p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            placeholder="PASTE HERE..."
            className="input-glass"
            style={{ minHeight: '60vh', padding: '1.5rem', fontFamily: 'monospace', fontSize: '1rem', resize: 'vertical' }}
          />
          <button type="submit" className="btn-primary">
            {saving ? 'SAVED' : 'SAVE'}
          </button>
        </form>
      </div>
    </div>
  );
}
