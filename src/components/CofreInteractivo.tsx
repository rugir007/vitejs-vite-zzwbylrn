import React, { useState, useRef } from 'react';

interface CofreProps {
  label: string;
  onClick: (label: string) => void;
}

export default function CofreInteractivo({ label, onClick }: CofreProps) {
  const [fase, setFase] = useState<'cerrado' | 'sacudiendo' | 'abierto'>('cerrado');
  const procesandoRef = useRef(false);

  // ⚙️ Duración configurable en milisegundos (ej. 200ms = 0.2s)
  const duracionAperturaMs = 200; 

  // 🎵 Sonido integrado del cofre
  const reproducirNuevoSonidoCofre = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const frecuenciasNuevo = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      frecuenciasNuevo.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + (index * 0.08));
        
        gain.gain.setValueAtTime(0.18, ctx.currentTime + (index * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (index * 0.08) + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + (index * 0.08));
        osc.stop(ctx.currentTime + (index * 0.08) + 0.35);
      });
    } catch (e) {
      console.log('Audio no soportado automáticamente', e);
    }
  };

  const handleClickCofre = () => {
    if (procesandoRef.current || fase === 'abierto' || fase === 'sacudiendo') return;
    procesandoRef.current = true;

    setFase('sacudiendo');

    setTimeout(() => {
      setFase('abierto');
      reproducirNuevoSonidoCofre();

      setTimeout(() => {
        onClick(label);
        procesandoRef.current = false;
      }, 500);
    }, duracionAperturaMs);
  };

  const estaAbierto = fase === 'abierto';
  const estaSacudiendo = fase === 'sacudiendo';

  const particulas3D = [
    { id: 1, icono: '💎', x: '-50px', y: '-55px', delay: '0s', rot: '140deg' },
    { id: 2, icono: '✨', x: '50px', y: '-65px', delay: '0.04s', rot: '-35deg' },
    { id: 3, icono: '🪙', x: '-80px', y: '-25px', delay: '0.08s', rot: '95deg' },
    { id: 4, icono: '⭐', x: '80px', y: '-35px', delay: '0.02s', rot: '210deg' },
    { id: 5, icono: '💎', x: '-25px', y: '-85px', delay: '0.07s', rot: '20deg' },
    { id: 6, icono: '✨', x: '25px', y: '-80px', delay: '0.03s', rot: '160deg' },
    { id: 7, icono: '💰', x: '-65px', y: '-75px', delay: '0.11s', rot: '-80deg' },
    { id: 8, icono: '💎', x: '65px', y: '-70px', delay: '0.05s', rot: '55deg' },
    { id: 9, icono: '⭐', x: '-95px', y: '-50px', delay: '0.14s', rot: '320deg' },
    { id: 10, icono: '🪙', x: '95px', y: '-55px', delay: '0.09s', rot: '170deg' },
    { id: 11, icono: '✨', x: '0px', y: '-95px', delay: '0.04s', rot: '85deg' },
    { id: 12, icono: '💎', x: '-40px', y: '-40px', delay: '0.1s', rot: '-110deg' }
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {estaAbierto && (
        <div style={{
          position: 'absolute',
          top: '50%', 
          left: '50%', 
          width: '0px',
          height: '0px',
          pointerEvents: 'none',
          zIndex: 30
        }}>
          {particulas3D.map((p) => (
            <span
              key={p.id}
              className="particula-diamante-3d"
              style={{
                '--dir-x': p.x,
                '--dir-y': p.y,
                '--rotacion-final': p.rot,
                animationDelay: p.delay
              } as React.CSSProperties}
            >
              {p.icono}
            </span>
          ))}
        </div>
      )}
      <img 
        src={estaAbierto ? "./cofreabierto.png" : "./cofrecerrado.png"}
        onClick={handleClickCofre}
        className={estaSacudiendo ? 'cofre-sacudida-ultrarapida' : ''}
        style={{ 
          width: '100px', 
          cursor: fase === 'cerrado' ? 'pointer' : 'default', 
          transform: estaAbierto ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.3s ease',
          display: 'block'
        }}
        alt={label}
      />
    </div>
  );
}