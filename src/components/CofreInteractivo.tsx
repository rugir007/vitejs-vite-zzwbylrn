import React, { useState, useEffect, useRef } from 'react';

interface CofreProps {
  label: string;
  onClick: (label: string) => void;
  modalAbiertoGlobal: string | null; // Recibe el estado actual del modal desde App.js
}

export default function CofreInteractivo({ label, onClick, modalAbiertoGlobal }: CofreProps) {
  const [fase, setFase] = useState<'cerrado' | 'sacudiendo' | 'abierto'>('cerrado');
  const [isHovered, setIsHovered] = useState(false);
  const procesandoRef = useRef(false);

  // 🔄 Cierre automático: Si el modal global se cierra (es null o es diferente a este cofre), el cofre vuelve a cerrarse
  useEffect(() => {
    if (modalAbiertoGlobal !== label) {
      setFase('cerrado');
      procesandoRef.current = false;
    }
  }, [modalAbiertoGlobal, label]);

  const duracionAperturaMs = 200; 

  const reproducirNuevoSonidoCofre = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const frecuenciasNuevo = [587.33, 739.99, 880.00, 1174.66];
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
      }, 150);

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
    { id: 12, icono: '💎', x: '-40px', y: '-40px', delay: '0.10s', rot: '-110deg' }
  ];

  let transformStyle = 'scale(1)';
  if (estaAbierto) {
    transformStyle = 'scale(1.08)';
  } else if (isHovered && !estaSacudiendo) {
    transformStyle = 'scale(1.10) translateY(-3px)';
  }

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <style>{`
        @keyframes cofreSacudidaInensa {
          0% { transform: translate(0, 0) rotate(0deg); }
          15% { transform: translate(-4px, 2px) rotate(-6deg); }
          30% { transform: translate(4px, -2px) rotate(6deg); }
          45% { transform: translate(-4px, -2px) rotate(-4deg); }
          60% { transform: translate(4px, 2px) rotate(4deg); }
          75% { transform: translate(-2px, 1px) rotate(-2deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        .cofre-sacudida-ultrarapida {
          animation: cofreSacudidaInensa 0.2s ease-in-out infinite alternate !important;
        }

        @keyframes explosionDiamante3D {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(0.3) rotate(0deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--dir-x), var(--dir-y)) scale(1.3) rotate(var(--rotacion-final));
          }
        }

        .particula-diamante-3d {
          position: absolute;
          font-size: 20px;
          animation: explosionDiamante3D 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
          pointer-events: none;
        }
      `}</style>

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
        src={estaAbierto || estaSacudiendo ? "./cofreabierto.png" : "./cofrecerrado.png"}
        onClick={handleClickCofre}
        onContextMenu={(e) => e.preventDefault()}
        className={estaSacudiendo ? 'cofre-sacudida-ultrarapida' : ''}
        style={{ 
          width: '100px', 
          cursor: fase === 'cerrado' ? 'pointer' : 'default', 
          transform: estaSacudiendo ? 'none' : transformStyle,
          transition: estaSacudiendo ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
          filter: isHovered && !estaAbierto && !estaSacudiendo ? 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.7))' : 'none',
          display: 'block'
        }}
        alt={label}
      />
    </div>
  );
}
