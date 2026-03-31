"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import VideosClient from '@/app/videos/VideosClient';

export default function VideosPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <VideosClient />
    </main>
  );
}
