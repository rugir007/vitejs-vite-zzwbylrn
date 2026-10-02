import React, { useState } from 'react';

interface MenuFlotanteProps {
  onNavegar: (seccion: string) => void;
  onHover?: () => void;
}

export default function MenuFlotante({ onNavegar, onHover }: MenuFlotanteProps) {
  const listaBotones = ['SORTEOS', 'MIS TICKETS', 'GANADORES', 'NOSOTROS', 'CONTACTO'];
  const [isHoveredBar, setIsHoveredBar] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handlePress = (nombreBtn: string) => {
    setTimeout(() => {
      onNavegar(nombreBtn);
    }, 180);
  };

  return (
    <>
      <style>
        {`
          @keyframes destelloLuz {
            0% { transform: translateX(-100%); opacity: 0; }
            20% { opacity: 0.6; }
            40% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          .barra-destello {
            position: relative;
            overflow: hidden;
          }
          .barra-destello::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            background: linear-gradient(
              90deg, 
              transparent, 
              rgba(255, 255, 255, 0.25), 
              transparent
            );
            transform: translateX(-100%);
            animation: destelloLuz 5s infinite;
            pointer-events: none;
          }

          .btn-menu-interactivo:active {
            transform: scale(0.92) !important;
            background: linear-gradient(135deg, #0a3d5e, #00E5FF) !important;
            border-color: #FFFFFF !important;
            color: #FFFFFF !important;
            box-shadow: 0 0 15px rgba(0, 229, 255, 0.9) !important;
            transition: transform 0.12s ease, background 0.12s ease !important;
          }
        `}
      </style>

      <div 
        onMouseEnter={() => setIsHoveredBar(true)}
        onMouseLeave={() => setIsHoveredBar(false)}
        className={isHoveredBar ? '' : 'barra-destello'}
        style={{
          position: 'absolute',
          top: '12px',
          left: '0',
          width: '100%',
          zIndex: 30,
          background: isHoveredBar ? 'transparent' : 'rgba(3, 12, 24, 0.78)',
          backdropFilter: isHoveredBar ? 'none' : 'blur(12px)',
          WebkitBackdropFilter: isHoveredBar ? 'none' : 'blur(12px)',
          borderBottom: isHoveredBar ? '1.5px solid rgba(255, 255, 255, 1)' : '1px solid rgba(0, 229, 255, 0.35)',
          borderTop: isHoveredBar ? '1.5px solid rgba(255, 255, 255, 0.9)' : 'none',
          padding: '6px 4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          boxShadow: isHoveredBar ? '0 0 22px rgba(255, 255, 255, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.2)' : '0 8px 22px rgba(0, 0, 0, 0.6)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          display: 'flex',
          gap: '2.5px',
          width: '100%',
          maxWidth: '430px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {listaBotones.map((nombreBtn, index) => {
            const isCurrentHovered = hoveredIndex === index;

            return (
              <button
                key={index}
                onClick={() => handlePress(nombreBtn)}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  if (onHover) onHover();
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                className="btn-menu-interactivo"
                style={{
                  flex: 1,
                  background: isCurrentHovered ? 'transparent' : 'linear-gradient(135deg, #071930, #0a3d5e)',
                  border: isCurrentHovered ? '1.5px solid #FFFFFF' : '1.5px solid #00E5FF',
                  color: isCurrentHovered ? '#FFFFFF' : '#E0F7FA',
                  fontFamily: "Georgia, serif", // Tipografía Georgia seleccionada
                  fontSize: '8.5px',                  // Tamaño más legible y cómodo
                  fontWeight: '700',
                  letterSpacing: '0.3px',
                  textShadow: isCurrentHovered 
                    ? '0 0 8px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 1)' 
                    : '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px rgba(0, 0, 0, 0.8)',
                  cursor: 'pointer',
                  padding: '7px 1px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  borderRadius: '16px',
                  boxShadow: isCurrentHovered 
                    ? '0 0 14px rgba(255, 255, 255, 0.7), inset 0 0 4px rgba(255, 255, 255, 0.4)' 
                    : '0 2px 5px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(0, 229, 255, 0.3)',
                  transform: isCurrentHovered ? 'scale(1.04) translateY(-1px)' : 'scale(1) translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none'
                }}
              >
                {nombreBtn}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}