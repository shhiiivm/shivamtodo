"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle, Circle, ExternalLink, Activity, ListTodo } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  link: string;
  completed: boolean;
  createdAt: string;
}

export default function DSATracker() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'dsa-problems'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Problem));
      setProblems(data);
      setLoading(false);
    }, (error) => {
      console.error("Firebase error or permissions issue:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    try {
      await addDoc(collection(db, 'dsa-problems'), {
        title,
        difficulty,
        link,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setLink('');
    } catch (err) {
      console.error("Add Error:", err);
      alert("Make sure you configured Firebase!");
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'dsa-problems', id), { completed: !currentStatus });
  };

  const deleteProblem = async (id: string) => {
    if (window.confirm("Remove this problem?")) {
      await deleteDoc(doc(db, 'dsa-problems', id));
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DSA Problem Tracker",
    "applicationCategory": "EducationalApplication"
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900 }} className="gradient-text">DSA Problem Tracker</h1>
        <p style={{ opacity: 0.7, fontSize: '1.1rem' }}>Log your progress, master patterns, and nail technical interviews.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem' }} className="tracker-layout">

        {/* Tracker Form */}
        <div className="glass-card" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} className="highlight" /> Add New Problem
          </h3>
          <form onSubmit={addProblem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Problem Name</label>
              <input
                className="input-glass"
                placeholder="e.g. Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Difficulty</label>
              <select
                className="input-glass"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Problem URL (Optional)</label>
              <input
                className="input-glass"
                placeholder="LeetCode / GeeksForGeeks Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
              Add to List
            </button>
          </form>
        </div>

        {/* Tracker List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity className="highlight" size={20} /> Today&apos;s Task Log
            </h3>
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{problems.length} Problems Tracked</span>
          </div>

          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>Loading logic...</div>
          ) : problems.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
              <ListTodo size={40} style={{ marginBottom: '1rem' }} />
              <p>Your list is currently empty. Add your first DSA problem!</p>
            </div>
          ) : (
            problems.map((p) => (
              <div key={p.id} className="glass-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: p.completed ? '4px solid #10b981' : `4px solid ${p.difficulty === 'Hard' ? '#ef4444' : p.difficulty === 'Medium' ? '#f59e0b' : '#3b82f6'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div onClick={() => toggleComplete(p.id, p.completed)} style={{ cursor: 'pointer', transition: 'color 0.2s' }}>
                    {p.completed ? <CheckCircle color="#10b981" /> : <Circle style={{ opacity: 0.3 }} />}
                  </div>
                  <div>
                    <h4 style={{ textDecoration: p.completed ? 'line-through' : 'none', opacity: p.completed ? 0.5 : 1 }}>
                      {p.title}
                    </h4>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      color: p.difficulty === 'Hard' ? '#ef4444' : p.difficulty === 'Medium' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {p.difficulty}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', opacity: 0.7 }}>
                      <ExternalLink size={18} />
                    </a>
                  )}
                  <div onClick={() => deleteProblem(p.id)} style={{ cursor: 'pointer', opacity: 0.3 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'} onMouseOut={(e) => e.currentTarget.style.opacity = '0.3'}>
                    <Trash2 size={18} color="#ef4444" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SEO/Explanation Section (As per Global rules) */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>What is <span className="highlight">DSA Tracker?</span></h2>
        <p style={{ opacity: 0.8, lineHeight: 1.8 }}>
          A DSA Problem Tracker (Data Structures and Algorithms) is a tool used by software engineers to record their progress while solving algorithmic challenges.
          Effective tracking helps in identifying weak areas, reviewing previously solved concepts, and preparing for MAANG interviews.
        </p>

        <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>Why Track Your Progress?</h3>
        <ul style={{ paddingLeft: '1.5rem', opacity: 0.8, lineHeight: 1.8 }}>
          <li>Spaced Repetition: Record hard problems to revisit them later.</li>
          <li>Pattern Recognition: Group problems by type (e.g. Slidding Window, Dynamic Programming).</li>
          <li>Consistency Tracking: Visualizing your daily solve-count keeps you motivated.</li>
        </ul>

        <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Big O Complexity Calculation Formula</h3>
          <p style={{ opacity: 0.8, marginBottom: '1rem' }}>When analyzing an algorithm, the Big O formula represents the upper bound of the growth rate of an algorithm&apos;s execution time.</p>
          <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'hsl(var(--accent))', marginBottom: '1rem' }}>
            T(n) = O(f(n))
          </div>
          <p style={{ opacity: 0.7 }}>Where <strong>n</strong> is the input size and <strong>f(n)</strong> is the growth function (e.g., n², log n, etc.).</p>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h3>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div className="glass-card">
              <h4 style={{ marginBottom: '0.5rem' }}>How many DSA problems should I solve daily?</h4>
              <p style={{ opacity: 0.7 }}>Solve at least 2-3 quality problems daily from different topics like Strings, Arrays, and Linked Lists to maintain momentum.</p>
            </div>
            <div className="glass-card">
              <h4 style={{ marginBottom: '0.5rem' }}>What platforms are supported?</h4>
              <p style={{ opacity: 0.7 }}>You can add links from any platform like LeetCode, HackerRank, GeeksForGeeks, or CodeChef.</p>
            </div>
            <div className="glass-card">
              <h4 style={{ marginBottom: '0.5rem' }}>Is the dsa calculation formula real?</h4>
              <p style={{ opacity: 0.7 }}>Yes, the Big O formula is the mathematical foundation of algorithm analysis used in computer science.</p>
            </div>
            <div className="glass-card">
              <h4 style={{ marginBottom: '0.5rem' }}>Can I use this for other topics?</h4>
              <p style={{ opacity: 0.7 }}>Absolutely. While designed for DSA, you can track any task with title and difficulty scaling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Section (Premium Rule) */}
      <section style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
        <h3>Related Learning Tools</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Link href="/" className="highlight">Dashboard</Link>
          <span>|</span>
          <Link href="/gallery" className="highlight">Resource Hub</Link>
          <span>|</span>
          <Link href="/dsa-tracker" className="highlight">Tracker Home</Link>
          <span>|</span>
          <Link href="https://leetcode.com" target="_blank" className="highlight">LeetCode External</Link>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .tracker-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
