import React, { useState, useEffect } from 'react';
import LlaveMaestra from './components/LlaveMaestra';
import CintaVideos from './components/CintaVideos';
import ModalCompra from './components/ModalCompra';
import CofreInteractivo from './components/CofreInteractivo';
import ModalGeneral from './components/ModalGeneral';
import EscenarioVisual from './components/EscenarioVisual';
import MenuFlotante from './components/botones/menu_superior/MenuFlotante';

// =================================================================
// 1. COMPONENTE PRINCIPAL APP
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

  // 🔊 SINTETIZADOR TEMÁTICO: FUEGO, DRAGONES, AGUA Y TRAGAMONEDAS MODERNOS
  const reproducirSonidoTematico = (tipo: 'fuego_hover' | 'menu_click_nuevo' | 'reliquia_hover' | 'reliquia_click' | 'slot_hover' | 'slot_jackpot' | 'tesoro_hover' | 'tesoro_click' | 'agua_hover' | 'agua_click') => {
    try {
      const AudioContextWindow = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextWindow) return;
      const ctx = new AudioContextWindow();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      switch (tipo) {
        // --- 1. MENÚ SUPERIOR (Fuego / Dragones) ---
        case 'fuego_hover':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(450, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.03);
          gain.gain.setValueAtTime(0.01, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
          break;
        case 'menu_click_nuevo':
          // ✨ NUEVO CLIC: Sonido limpio, cristalino y elegante para el menú superior
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
          break;

        // --- 2. CRONÓMETRO (Reliquia Mágica) ---
        case 'reliquia_hover':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(550, ctx.currentTime);
          osc.frequency.setValueAtTime(750, ctx.currentTime + 0.025);
          gain.gain.setValueAtTime(0.012, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
          break;
        case 'reliquia_click':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17);
          break;

        // --- 3. COMPRAR TICKET (Tragamonedas / Jackpot Moderno) ---
        case 'slot_hover':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.02);
          gain.gain.setValueAtTime(0.01, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);
          break;
        case 'slot_jackpot':
          osc.type = 'square';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.setValueAtTime(900, ctx.currentTime + 0.05);
          osc.frequency.setValueAtTime(1300, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          break;

        // --- 4. TESORO / PREMIOS (Cofre Mágico) ---
        case 'tesoro_hover':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(700, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1050, ctx.currentTime + 0.03);
          gain.gain.setValueAtTime(0.015, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
          break;
        case 'tesoro_click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(380, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.18);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          break;

        // --- 5. WHATSAPP (Agua Cristalina) ---
        case 'agua_hover':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(950, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.03);
          gain.gain.setValueAtTime(0.012, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
          break;
        case 'agua_click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.07, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17);
          break;
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // Prevenir bloqueos del navegador
    }
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
      maxHeight: '100vh',
      overflow: 'hidden',
      backgroundColor: '#000',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent'
    }}>
      {/* 🔐 LLAVE MAESTRA */}
      <LlaveMaestra />
      
      {/* 🌴 ESCENARIO VISUAL */}
      <EscenarioVisual />
      
      {/* 🧭 MENÚ SUPERIOR FLOTANTE CON NUEVO CLIC */}
      <MenuFlotante 
        onHover={() => reproducirSonidoTematico('fuego_hover')}
        onNavegar={(seccion) => { 
          reproducirSonidoTematico('menu_click_nuevo'); 
          setModalAbierto(seccion.toUpperCase()); 
        }} 
      />
      
      {/* =================================================================
      2. CAPAS INTERACTIVAS Y COFRES
      ================================================================= */}
      <div style={{ position: 'absolute', top: '56%', left: '11%', display: 'flex', gap: '3.5%', width: '54%', zIndex: 3 }}>
        <div className="cofre-container"><CofreInteractivo label="PREMIO 1" onClick={setModalAbierto} modalAbiertoGlobal={modalAbierto} /></div>
        <div className="cofre-container"><CofreInteractivo label="PREMIO 2" onClick={setModalAbierto} modalAbiertoGlobal={modalAbierto} /></div>
        <div className="cofre-container"><CofreInteractivo label="PREMIO 3" onClick={setModalAbierto} modalAbiertoGlobal={modalAbierto} /></div>
      </div>

      {/* --- CINTA DE VIDEOS --- */}
      <CintaVideos />

      <style>{`
        * { -webkit-tap-highlight-color: transparent !important; }
        button, input, div, span { -webkit-tap-highlight-color: transparent !important; }

        img {
          -webkit-user-drag: none;
          user-drag: none;
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        .cofre-container {
          position: relative;
          cursor: pointer;
          border-radius: 12px;
          -webkit-touch-callout: none;
          pointer-events: auto !important;
        }

        .cofre-container img {
          pointer-events: auto !important;
          -webkit-user-drag: none;
          user-select: none;
        }

        .cinta-social-container {
          position: absolute;
          bottom: 21vh;
          left: 0;
          width: 100%;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.85);
          border-top: 1px solid rgba(0, 180, 216, 0.4);
          border-bottom: 1px solid rgba(0, 180, 216, 0.4);
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
        .cinta-social-track span { margin-right: 50px; }
        @keyframes desplazar-cinta {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .cofre-container:hover img {
          filter: drop-shadow(0 0 4px rgba(0, 180, 216, 1)) drop-shadow(0 0 10px rgba(0, 140, 186, 0.9));
        }

        .boton-base { 
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; 
          border: 1.5px solid #00B4D8; 
          background: linear-gradient(135deg, rgba(8, 28, 45, 0.92), rgba(10, 95, 125, 0.92)); 
          color: #E0F7FA; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: bold; 
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent !important; 
          box-shadow: 0 0 10px rgba(0, 180, 216, 0.35), inset 0 0 6px rgba(0, 210, 230, 0.15);
        }

        @media (hover: hover) and (pointer: fine) {
          .boton-base:hover { 
            transform: scale(1.08) translateY(-2px) !important; 
            box-shadow: 0 0 22px rgba(0, 180, 216, 0.85) !important; 
            border-color: #90E0EF !important; 
            color: #FFFFFF !important; 
            background: rgba(0, 0, 0, 0.15) !important; 
            backdrop-filter: blur(2px);
          }
        }

        .boton-base:active { 
          transform: scale(0.90) translateY(3px) !important; 
          background: linear-gradient(135deg, rgba(0, 80, 110, 0.98), rgba(0, 150, 195, 0.98)) !important;
          border-color: #90E0EF !important;
          color: #FFFFFF !important;
          box-shadow: 0 0 18px rgba(0, 180, 216, 0.95), inset 0 0 12px rgba(255, 255, 255, 0.4) !important;
          transition: transform 0.2s ease !important; 
        }

        .camaleon-vivo { border-color: #ff3333 !important; color: #ff3333 !important; background: rgba(255, 0, 0, 0.2) !important; }
        @keyframes pulso-rojo-intenso { 0% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } 50% { transform: scale(1.2); box-shadow: 0 0 30px 10px #ff0000; } 100% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } }
        
        @media (hover: hover) and (pointer: fine) {
          .camaleon-vivo:hover { border-color: #ff3333 !important; color: #ff3333 !important; animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; background: rgba(255, 0, 0, 0.1) !important; }
        }
        .latido-vivo { animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; }

        @keyframes respiracionCirculo {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 180, 216, 0.4), inset 0 0 5px rgba(0, 180, 216, 0.3); border-color: #00B4D8; }
          50% { transform: scale(1.06); box-shadow: 0 0 20px rgba(0, 180, 216, 0.75), inset 0 0 10px rgba(114, 221, 247, 0.5); border-color: #48CAE4; }
        }
        .animacion-circulo-vivo { animation: respiracionCirculo 3s infinite ease-in-out; }
      `}</style>

      {/* MODAL GENERAL */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: modalAbierto ? 'auto' : 'none' }}>
        <ModalGeneral 
          modalAbierto={modalAbierto} 
          onClose={() => setModalAbierto(null)} 
          esModoEnVivo={esModoEnVivo}
          setEsModoEnVivo={setEsModoEnVivo}
        />
      </div>

      {/* CRONÓMETRO */}
      <div style={{ position: 'absolute', top: '9%', left: '50%', transform: 'translateX(-50%)', zIndex: 99 }}>
        <button 
          onMouseEnter={() => reproducirSonidoTematico('reliquia_hover')}
          onClick={() => { reproducirSonidoTematico('reliquia_click'); setModalAbierto('CRONOMETRO'); }} 
          className="boton-base cronometro-artistico" 
          style={{ padding: '4px 16px', fontSize: '20px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {formatTime(timeLeft)}
        </button>
      </div>

      {/* BOTÓN COMPRAR TICKET */}
      <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', zIndex: 99, width: '50%', display: 'flex', justifyContent: 'center' }}>
        <button 
          onMouseEnter={() => reproducirSonidoTematico('slot_hover')}
          onClick={() => { reproducirSonidoTematico('slot_jackpot'); setModalAbierto('COMPRAR TICKET'); }} 
          className="boton-base" 
          style={{ width: '80%', maxWidth: '170px', height: '32px', fontSize: '15px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          COMPRAR TICKET
        </button>
      </div>

      {/* BOTONES INFERIORES FLOTANTES */}
      {botonesFlotantesInferiores.map((b) => {
        const tamanoCirculo = '70px'; 
        const esWhatsapp = b.id === 10;
        const tipoHover = esWhatsapp ? 'agua_hover' : 'tesoro_hover';
        const tipoClick = esWhatsapp ? 'agua_click' : 'tesoro_click';

        return (
          <div key={b.id} style={{ position: 'absolute', top: b.t, left: b.l, transform: 'translateX(-50%)', width: tamanoCirculo, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', zIndex: 99 }}>
            <button 
              onMouseEnter={() => reproducirSonidoTematico(tipoHover)}
              onClick={() => { 
                reproducirSonidoTematico(tipoClick);
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