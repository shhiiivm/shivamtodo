"use client";
import Link from 'next/link';
import { Home, ListTodo, Image, Link as LinkIcon, Menu, X, Film } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'DASHBOARD', href: '/', icon: <Home size={18} /> },
    { name: 'NOTEPAD', href: '/notepad', icon: <ListTodo size={18} /> },
    { name: 'LINKS', href: '/links', icon: <LinkIcon size={18} /> },
    { name: 'IMAGES', href: '/images', icon: <Image size={18} /> },
    { name: 'VIDEOS', href: '/videos', icon: <Film size={18} /> },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">
            SHIVAM
          </Link>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-item">
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="mobile-overlay" onClick={() => setIsOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mobile-nav-item"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #1a1a1a;
          height: 64px;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
        }
        .logo {
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 3px;
          color: white;
          text-decoration: none;
        }
        .desktop-menu {
          display: flex;
          gap: 2rem;
        }
        .nav-item {
          color: white;
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0.5;
          letter-spacing: 1px;
          transition: all 0.2s;
        }
        .nav-item:hover {
          opacity: 1;
        }
        .mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
        }
        .mobile-overlay {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: flex;
          justify-content: flex-end;
        }
        .mobile-menu {
          width: 250px;
          background: #0a0a0a;
          height: 100%;
          border-left: 1px solid #1a1a1a;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 1rem;
          border-radius: 8px;
          background: #111;
          border: 1px solid #1a1a1a;
        }
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
