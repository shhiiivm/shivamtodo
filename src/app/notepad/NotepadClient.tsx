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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900 }} className="gradient-text">DSA Problem Notepad</h1>
        <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>Paste your algorithms and easily track raw text without any fancy interfaces.</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            placeholder={`👉 Goal: Apply recursion on nodes\n\n- Binary Tree Inorder Traversal\n- Maximum Depth of Binary Tree\n- Same Tree\n...`}
            className="input-glass"
            style={{ minHeight: '400px', padding: '1.5rem', fontFamily: 'monospace', fontSize: '1.1rem', resize: 'vertical' }}
          />
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', minWidth: '150px' }}>
            {saving ? 'Saved Successfully!' : 'Save Notepad'}
          </button>
        </form>
      </div>

      {/* SEO Section based on global rules */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Raw <span className="highlight">Tracker Application</span></h2>
        
        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
          <h3>What is this note application?</h3>
          <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
            Sometimes a developer just needs a raw, copy-paste friendly environment. This tool strips away all the UI overhead and gives you a single, massive textbox that syncs directly into Firebase Firestore to retain your problem lists perfectly.
          </p>
        </div>

        <h3>Binary Tree Calculation Example</h3>
        <p style={{ opacity: 0.8, marginBottom: '1rem' }}>If you are determining the Max Depth of a Binary Tree, the formula recursively computes the height.</p>
        <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'hsl(var(--accent))', marginBottom: '1rem' }}>
          Max(left_node_height, right_node_height) + 1
        </div>
        
        <div style={{ marginTop: '3rem' }}>
           <h3>Notepad Tool FAQ</h3>
           {[
             { q: "Can I paste an entire LeetCode list here?", a: "Yes. The notepad accepts raw text, making it perfect for unstructured lists." },
             { q: "Where does the text save?", a: "It is synced live to your private Firebase backend." },
             { q: "What should I track?", a: "Things like 'Invert Binary Tree', 'Symmetric Tree', or any other goal like 'Path Sum'." },
             { q: "Will I lose my formatting?", a: "No, standard newlines and raw text structures are preserved perfectly." }
           ].map((item, i) => (
              <div key={i} className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', marginBottom: '1rem' }}>
                 <h4 style={{ color: 'hsl(var(--accent))', marginBottom: '0.4rem' }}>{item.q}</h4>
                 <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{item.a}</p>
              </div>
           ))}
        </div>
      </section>

      {/* Related Session */}
      <section style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
          <h3>Explore Internal Tools</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
             <Link href="/" className="highlight">Dashboard</Link>
             <span>|</span>
             <Link href="/links" className="highlight">Saved Links</Link>
             <span>|</span>
             <Link href="/images" className="highlight">Image Stash</Link>
          </div>
      </section>
    </div>
  );
}
