"use client";
import Link from 'next/link';
import { Home, ListTodo, Image, Link as LinkIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <Home size={20} /> },
    { name: 'Notepad', href: '/notepad', icon: <ListTodo size={20} /> },
    { name: 'Links', href: '/links', icon: <LinkIcon size={20} /> },
    { name: 'Images', href: '/images', icon: <Image size={20} /> },
  ];

  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          color: 'white'
        }}>S</div>
        <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>TODO Shivam</span>
      </div>

      {/* Desktop Menu */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'var(--foreground)', 
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              transition: 'color 0.2s',
              opacity: 0.8
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '0.8')}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Toggle (Simplified) */}
      <div className="mobile-only" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {isOpen ? <X color="#fff" /> : <Menu color="#fff" />}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
