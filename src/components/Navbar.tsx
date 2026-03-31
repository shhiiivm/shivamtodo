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
      padding: '0.75rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'black',
      borderBottom: '1px solid #333'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'white', fontSize: '1.2rem', fontWeight: 900 }}>
          SHIVAM
        </Link>
      </div>

      {/* Desktop Menu */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="desktop-nav">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.8rem',
              opacity: 0.6,
              transition: 'opacity 0.2s',
              textTransform: 'uppercase'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
