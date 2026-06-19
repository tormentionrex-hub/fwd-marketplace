'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { IconSpark, IconArrowR, IconFolder, IconCode } from '@/components/ui/fwd-icons';
import Image from 'next/image';

export function CrearConIaBanner() {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        background: 'linear-gradient(145deg, #070B14 0%, #0D1224 100%)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        marginBottom: 24,
      }}
    >
      {/* Glow background effects */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(236,0,140,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          right: 100,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(102,45,145,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left Content */}
      <div
        style={{
          padding: '40px 48px',
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          maxWidth: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(236,0,140,0.05)',
              border: '1px solid rgba(236,0,140,0.3)',
              boxShadow: 'inset 0 0 20px rgba(236,0,140,0.1), 0 0 15px rgba(236,0,140,0.2)',
              display: 'grid',
              placeItems: 'center',
              color: '#EC008C',
            }}
          >
            <IconSpark size={28} />
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#EC008C',
              margin: 0,
              letterSpacing: '-0.5px',
              textShadow: '0 0 20px rgba(236,0,140,0.4)',
            }}
          >
            CREAR CON IA
          </h2>
        </div>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 32,
            maxWidth: 480,
          }}
        >
          Describe tu idea en lenguaje natural y nuestro modelo la convierte en un proyecto estructurado al instante.
        </p>

        <div>
          <Link
            href="/empresario/nuevo-proyecto"
            className="btn"
            style={{
              background: '#EC008C',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              padding: '12px 32px',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 0 20px rgba(236,0,140,0.4)',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Empezar <IconArrowR size={18} />
          </Link>
        </div>
      </div>

      {/* Right Graphic Area */}
      <div
        style={{
          flex: '0 0 400px',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingRight: 40,
        }}
      >
        {/* Floating Icons background logic */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <path d="M 100,80 L 100,120 L 250,120 L 250,200" stroke="rgba(32,190,198,0.4)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                <path d="M 300,100 L 300,250 L 180,250" stroke="rgba(236,0,140,0.4)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                <path d="M 150,280 L 150,320 L 280,320" stroke="rgba(102,45,145,0.4)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            </svg>
        </div>

        {/* The Mascot */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            {/* If there's an image, we can put it here. Let's use the provided image if possible, or build a robust placeholder */}
            <div style={{ position: 'absolute', bottom: -20, right: -20, width: 380, height: 380 }}>
                {/* Fallback to image if it exists */}
                <Image 
                   src="/imagenes/fordy imagen ia.png" 
                   alt="Fordy Mascot" 
                   fill 
                   style={{ objectFit: 'contain' }}
                   onError={(e) => {
                       (e.currentTarget as HTMLImageElement).style.display = 'none';
                   }}
                />
            </div>
        </div>

        {/* Floating Badges */}
        <div style={{
            position: 'absolute', top: 40, left: 20, zIndex: 3,
            background: 'rgba(102,45,145,0.1)', border: '1px solid rgba(102,45,145,0.3)',
            borderRadius: 16, padding: '12px 16px', color: '#c4b5fd',
            boxShadow: '0 0 20px rgba(102,45,145,0.2)',
            display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18
        }}>
            AI <IconSpark size={16} />
        </div>

        <div style={{
            position: 'absolute', top: 30, right: 80, zIndex: 3,
            background: 'rgba(255,200,5,0.1)', border: '1px solid rgba(255,200,5,0.3)',
            borderRadius: 16, padding: '12px', color: '#FFC805',
            boxShadow: '0 0 20px rgba(255,200,5,0.2)'
        }}>
            <IconFolder size={24} />
        </div>

        <div style={{
            position: 'absolute', bottom: 120, right: 40, zIndex: 3,
            background: 'rgba(32,190,198,0.1)', border: '1px solid rgba(32,190,198,0.3)',
            borderRadius: 16, padding: '12px', color: '#20BEC6',
            boxShadow: '0 0 20px rgba(32,190,198,0.2)'
        }}>
            <IconCode size={24} />
        </div>
      </div>
    </div>
  );
}
