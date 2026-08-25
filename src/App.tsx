import React, { useState, useEffect } from 'react';
import LlaveMaestra from './components/LlaveMaestra';
import CintaVideos from './components/CintaVideos';
import ModalCompra from './components/ModalCompra';
import CofreInteractivo from './components/CofreInteractivo';
import ModalGeneral from './components/ModalGeneral';
import EscenarioVisual from './components/EscenarioVisual';
import MenuFlotante from './components/botones/menu_superior/MenuFlotante';

// =================================================================
// 1. COMPONENTES PRINCIPAL APP
// =================================================================
export default function App() {
  const [timeLeft, setTimeLeft] = useState(12 * 3600 + 44 * 60 + 33);
  const [esModoEnVivo, setEsModoEnVivo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const botonesFlotantesInferiores = [
    { id: 8, t: '77%', l: '20%', label: 'TESORO' },
    { id: 9, t: '77%', l: '50%', isCamaleon: true },
    { 
      id: 10, 
      t: '77%', 
      l: '80%', 
      label: 'WHATSAPP',
      onClick: () => {
        const numeroWhatsApp = "51976610071"; 
        const mensaje = encodeURIComponent("¡Hola, Playa Dorada! Deseo más información, por favor.");
        window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank');
      }
    },
  ];

  return (
    <div style={{
      maxWidth: '450px',
      width: '100%',
      margin: '0 auto',
      position: 'relative',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)'
    }}>
      {/* 🔐 LLAVE MAESTRA (Acceso exclusivo del dueño) */}
      <LlaveMaestra />
      
      {/* 🌴 ESCENARIO VISUAL (Fondo, Timón, Destellos, Dragón y Barra) */}
      <EscenarioVisual />
      
      {/* 🧭 MENÚ SUPERIOR FLOTANTE CON ESTILO TURQUESA */}
      <MenuFlotante onNavegar={(seccion) => setModalAbierto(seccion.toUpperCase())} />
      
      {/* =================================================================
      2. CAPAS INTERACTIVAS Y COFRES
      ================================================================= */}
      <div style={{ position: 'absolute', top: '56%', left: '11%', display: 'flex', gap: '3.5%', width: '54%', zIndex: 3 }}>
        <div className="cofre-container"><CofreInteractivo label="PREMIO 1" onClick={setModalAbierto} /></div>
        <div className="cofre-container"><CofreInteractivo label="PREMIO 2" onClick={setModalAbierto} /></div>
        <div className="cofre-container"><CofreInteractivo label="PREMIO 3" onClick={setModalAbierto} /></div>
      </div>

      {/* --- CINTA DE VIDEOS --- */}
      <CintaVideos />

      <style>{`
        img, .cofre-container {
          -webkit-user-drag: none;
          user-select: none;
          -webkit-user-select: none;
        }
        .cinta-social-container {
          position: absolute;
          bottom: 21vh;
          left: 0;
          width: 100%;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.85);
          border-top: 1px solid rgba(0, 229, 255, 0.3);
          border-bottom: 1px solid rgba(0, 229, 255, 0.3);
          padding: 6px 0;
          z-index: 4;
          white-space: nowrap;
          user-select: none;
        }
        .cinta-social-track {
          display: inline-block;
          animation: desplazar-cinta 25s linear infinite;
          color: #E0F7FA;
          font-size: 0.85rem;
          font-weight: bold;
        }
        .cinta-social-track span {
          margin-right: 50px;
        }
        @keyframes desplazar-cinta {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .cofre-container {
          position: relative;
          cursor: pointer;
          border-radius: 12px;
        }
        .cofre-container:hover img {
          filter: drop-shadow(0 0 4px rgba(0, 229, 255, 1)) drop-shadow(0 0 10px rgba(0, 229, 255, 0.9));
        }
        @keyframes sacudida-ultrarapida {
          0% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-6px, 3px) rotate(-10deg); }
          20% { transform: translate(6px, -3px) rotate(10deg); }
          30% { transform: translate(-6px, -2px) rotate(-8deg); }
          40% { transform: translate(6px, 2px) rotate(8deg); }
          50% { transform: translate(-5px, 3px) rotate(-6deg); }
          60% { transform: translate(5px, -3px) rotate(6deg); }
          70% { transform: translate(-4px, 1px) rotate(-4deg); }
          80% { transform: translate(4px, -1px) rotate(4deg); }
          90% { transform: translate(-2px, 0px) rotate(-2deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .cofre-sacudida-ultrarapida {
          animation: sacudida-ultrarapida 0.25s ease-in-out infinite;
        }
        
        @keyframes explosionDiamante3D {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0;
            filter: brightness(0.5);
          }
          25% {
            opacity: 1;
            filter: drop-shadow(0 0 8px #00ffff) drop-shadow(0 0 15px #ffff00) brightness(2.2);
          }
          75% {
            filter: drop-shadow(0 0 12px #ff00ff) drop-shadow(0 0 20px #00ffff) brightness(1.8);
          }
          100% {
            transform: translate(calc(-50% + var(--dir-x)), calc(-50% + var(--dir-y))) scale(1.3) rotate(var(--rotacion-final));
            opacity: 0;
            filter: brightness(1);
          }
        }

        .particula-diamante-3d {
          position: absolute;
          font-size: 15px;
          animation: explosionDiamante3D 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
          user-select: none;
          pointer-events: none;
          text-shadow: 0 2px 5px rgba(0,0,0,0.8), 0 0 10px rgba(0,229,255,0.8);
        }

        /* 💎 ESTILO UNIFICADO TURQUESA PARA TODOS LOS BOTONES */
        .boton-base { 
          transition: all 0.3s ease; 
          border: 1.5px solid #00E5FF; 
          background: linear-gradient(135deg, rgba(10, 25, 47, 0.9), rgba(13, 110, 139, 0.9)); 
          color: #E0F7FA; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: bold; 
          user-select: none;
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
        }
        .boton-base:hover { 
          transform: scale(1.08) translateY(-2px) !important; 
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.8) !important; 
          border-color: #FFFFFF !important; 
          color: #FFFFFF !important; 
          background: rgba(0, 229, 255, 0.25) !important;
        }
        .boton-base:active { 
          transform: scale(0.95) !important; 
          filter: brightness(0.7) !important; 
          transition: none !important; 
        }

        .camaleon-vivo { border-color: #ff0000 !important; color: #ff0000 !important; background: rgba(255, 0, 0, 0.2) !important; }
        @keyframes pulso-rojo-intenso { 0% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } 50% { transform: scale(1.2); box-shadow: 0 0 30px 10px #ff0000; } 100% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } }
        .camaleon-vivo:hover { border-color: #ff0000 !important; color: #ff0000 !important; animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; }
        .latido-vivo { animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; }

        /* ✨ ANIMACIÓN DE RESPIRACIÓN Y BRILLO PARA LOS CÍRCULOS INFERIORES */
        @keyframes respiracionCirculo {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.4), inset 0 0 5px rgba(0, 229, 255, 0.3);
            border-color: #00E5FF;
          }
          50% { 
            transform: scale(1.06); 
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.8), inset 0 0 10px rgba(0, 229, 255, 0.7);
            border-color: #80F2FF;
          }
        }
        .animacion-circulo-vivo {
          animation: respiracionCirculo 3s infinite ease-in-out;
        }
      `}</style>

      {/* MODAL GENERAL */}
      <ModalGeneral 
        modalAbierto={modalAbierto} 
        onClose={() => setModalAbierto(null)} 
        esModoEnVivo={esModoEnVivo}
        setEsModoEnVivo={setEsModoEnVivo}
      />

      {/* CRONÓMETRO */}
      <div style={{ position: 'absolute', top: '9%', left: '50%', transform: 'translateX(-50%)', zIndex: 999 }}>
        <button onClick={() => setModalAbierto('CRONOMETRO')} className="boton-base cronometro-artistico" style={{ padding: '4px 16px', fontSize: '20px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {formatTime(timeLeft)}
        </button>
      </div>

      {/* BOTÓN COMPRAR TICKET */}
      <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', zIndex: 999, width: '50%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setModalAbierto('COMPRAR TICKET')} className="boton-base" style={{ width: '80%', maxWidth: '170px', height: '32px', fontSize: '15px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          COMPRAR TICKET
        </button>
      </div>

      {/* BOTONES INFERIORES FLOTANTES (Tesoro, Comunidad, WhatsApp) */}
      {botonesFlotantesInferiores.map((b) => {
        const tamanoCirculo = '70px'; 
        return (
          <div key={b.id} style={{ position: 'absolute', top: b.t, left: b.l, transform: 'translateX(-50%)', width: tamanoCirculo, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', zIndex: 999 }}>
            <button 
              onClick={() => { 
                if (b.onClick) {
                  b.onClick();
                } else if (b.isCamaleon) { 
                  setModalAbierto(esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD');
                  setEsModoEnVivo(!esModoEnVivo);
                } else { 
                  setModalAbierto(b.label || null); 
                } 
              }} 
              className={`boton-base animacion-circulo-vivo ${b.isCamaleon && esModoEnVivo ? 'camaleon-vivo latido-vivo' : ''}`}
              style={{ 
                width: tamanoCirculo, 
                height: tamanoCirculo, 
                borderRadius: '50%', 
                margin: 0, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: 0
              }} 
            >
              {b.id === 8 && <img src="./tesoro.png" alt="Tesoro" style={{ width: '120%', height: '120%', objectFit: 'contain' }} />}
              {b.id === 9 && <img src="./comunidad.png" alt="Comunidad" style={{ width: '120%', height: '120%', objectFit: 'contain' }} />}
              {b.id === 10 && <img src="./WhatsApp.png" alt="WhatsApp" style={{ width: '100%', height: '150%', objectFit: 'contain' }} />}
            </button>
            <span style={{ color: '#E0F7FA', fontWeight: 'bold', fontSize: '0.7rem', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 5px #000', transform: 'translateY(2px)' }}>
              {b.isCamaleon ? (esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD') : b.label}
            </span>
          </div>
        );
      })}

      <ModalCompra
        isOpen={modalAbierto === 'COMPRAR TICKET'}
        onClose={() => setModalAbierto(null)}
      />
    </div>
  );
}