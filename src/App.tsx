import React, { useState, useEffect } from 'react';
import LlaveMaestra from './components/LlaveMaestra';
import CintaVideos from './components/CintaVideos';
import ModalCompra from './components/ModalCompra';
import CofreInteractivo from './components/CofreInteractivo';
import ModalGeneral from './components/ModalGeneral';
import EscenarioVisual from './components/EscenarioVisual';
import MenuFlotante from './components/botones/menu_superior/MenuFlotante';
import BotonCamaleon from './components/BotonCamaleon';

// =================================================================
// 1. COMPONENTE PRINCIPAL APP (Optimizado para Móviles)
// =================================================================
export default function App() {
  const [tiempoRestante, setTiempoRestante] = useState({ dias: 0, hrs: 0, mins: 0, secs: 0 });
  const [esModoEnVivo, setEsModoEnVivo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<string | null>(null);

  useEffect(() => {
    // Fecha objetivo del sorteo (3 de Septiembre de 2026, 16:00:00)
    const fechaObjetivo = new Date('2026-09-03T16:00:00').getTime();

    const actualizarContador = () => {
      const ahora = new Date().getTime();
      const diferencia = fechaObjetivo - ahora;

      if (diferencia > 0) {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diferencia % (1000 * 60)) / 1000);

        setTiempoRestante({ dias, hrs, mins, secs });
      } else {
        setTiempoRestante({ dias: 0, hrs: 0, mins: 0, secs: 0 });
      }
    };

    actualizarContador();
    const timer = setInterval(actualizarContador, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔊 SINTETIZADOR TEMÁTICO
  const reproducirSonidoTematico = (tipo: 'fuego_hover' | 'menu_click_nuevo' | 'reliquia_hover' | 'reliquia_click' | 'slot_hover' | 'slot_jackpot' | 'tesoro_hover' | 'tesoro_click' | 'agua_hover' | 'agua_click') => {
    try {
      const AudioContextWindow = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextWindow) return;
      const ctx = new AudioContextWindow();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      switch (tipo) {
        case 'fuego_hover':
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(450, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.03); gain.gain.setValueAtTime(0.01, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035); break;
        case 'menu_click_nuevo':
          osc.type = 'sine'; osc.frequency.setValueAtTime(520, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15); gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18); break;
        case 'reliquia_hover':
          osc.type = 'triangle'; osc.frequency.setValueAtTime(550, ctx.currentTime); osc.frequency.setValueAtTime(750, ctx.currentTime + 0.025); gain.gain.setValueAtTime(0.012, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03); break;
        case 'reliquia_click':
          osc.type = 'triangle'; osc.frequency.setValueAtTime(320, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17); break;
        case 'slot_hover':
          osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.02); gain.gain.setValueAtTime(0.01, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025); break;
        case 'slot_jackpot':
          osc.type = 'square'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.setValueAtTime(900, ctx.currentTime + 0.05); osc.frequency.setValueAtTime(1300, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22); break;
        case 'tesoro_hover':
          osc.type = 'sine'; osc.frequency.setValueAtTime(700, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1050, ctx.currentTime + 0.03); gain.gain.setValueAtTime(0.015, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035); break;
        case 'tesoro_click':
          osc.type = 'sine'; osc.frequency.setValueAtTime(380, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.18); gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); break;
        case 'agua_hover':
          osc.type = 'sine'; osc.frequency.setValueAtTime(950, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.03); gain.gain.setValueAtTime(0.012, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035); break;
        case 'agua_click':
          osc.type = 'sine'; osc.frequency.setValueAtTime(450, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.15); gain.gain.setValueAtTime(0.07, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17); break;
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // Prevenir bloqueos del navegador
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      maxWidth: '420px', 
      maxHeight: '850px',
      margin: 'auto',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
      backgroundColor: '#000',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 0 30px rgba(0,0,0,0.8)'
    }}>
      
      <LlaveMaestra />
      <EscenarioVisual />
      
      <MenuFlotante 
        onHover={() => reproducirSonidoTematico('fuego_hover')}
        onNavegar={(seccion) => { 
          reproducirSonidoTematico('menu_click_nuevo'); 
          setModalAbierto(seccion.toUpperCase()); 
        }} 
      />
      
      {/* 📦 COFRES COMPACTOS (SUBIDOS PARA EVITAR SCROLL) */}
      <div style={{ position: 'absolute', top: '510px', left: '11%', display: 'flex', gap: '3.5%', width: '54%', zIndex: 10033 }}>
        <div className="cofre-container"><CofreInteractivo label="ORO" onClick={setModalAbierto} modalAbiertoGlobal={modalAbierto} /></div>
        <div className="cofre-container"><CofreInteractivo label="PLATINUM" onClick={setModalAbierto} modalAbiertoGlobal={modalAbierto} /></div>
        <div className="cofre-container"><CofreInteractivo label="SILVER" onClick={setModalAbierto} modalAbiertoGlobal={modalAbierto} /></div>
      </div>

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
          width: 100%;
          height: auto;
        }

        .cinta-social-container {
          position: absolute;
          bottom: 25px;
          left: 50%;                                    /* 👈 Lo centra desde la mitad */
          transform: translateX(-50%);                  /* 👈 Asegura el centrado exacto */
          width: 100%;                                   /* 👈 ANCHURA: Cámbialo a 90%, 95% o 100% según prefieras que ocupe */
          max-width: 390px;                             /* 👈 ANCHURA MÁXIMA para que no se desborde */
          height: 32px;                                 /* 👈 ALTURA: Controla lo alto que es la barra completa */
          display: flex;
          align-items: center;                          /* 👈 Centra el texto verticalmente de manera perfecta */
          overflow: hidden;
          background: rgba(0, 0, 0, 0.85);
          border-top: 1px solid rgba(255, 215, 0, 0.7);
          border-bottom: 1px solid rgba(255, 215, 0, 0.7);
          border-radius: 6px;                           /* Opcional: le da un toque más estilizado en los bordes */
          z-index: 4;
          white-space: nowrap;
          user-select: none;
        }

        .cinta-social-track {
          display: inline-block;
          animation: desplazar-cinta 25s linear infinite;
          color: #FFF3B0;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .cinta-social-track span { margin-right: 50px; }
        
        @keyframes desplazar-cinta {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        /* 🌟 ESTILO CELESTE ORIGINAL PARA CRONÓMETRO Y COMPRAR TICKET */
        .boton-celeste-original {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; 
          border: 2px solid #00D2FF; 
          background: linear-gradient(135deg, rgba(0, 50, 80, 0.95), rgba(0, 120, 180, 0.95)); 
          color: #FFFFFF; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: bold; 
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent !important; 
          box-shadow: 0 0 18px rgba(0, 210, 255, 0.6), inset 0 0 10px rgba(100, 235, 255, 0.4);
        }

        @media (hover: hover) and (pointer: fine) {
          .boton-celeste-original:hover { 
            transform: scale(1.08) translateY(-2px) !important; 
            box-shadow: 0 0 35px rgba(0, 210, 255, 0.9) !important; 
            border-color: #FFFFFF !important; 
            color: #FFFFFF !important; 
            background: rgba(0, 80, 120, 0.6) !important; 
            backdrop-filter: blur(2px);
          }
        }

        .boton-celeste-original:active { 
          transform: scale(0.90) translateY(3px) !important; 
          background: linear-gradient(135deg, rgba(0, 120, 180, 0.98), rgba(0, 200, 255, 0.98)) !important;
          border-color: #FFFFFF !important;
          color: #FFFFFF !important;
          box-shadow: 0 0 30px rgba(0, 210, 255, 1), inset 0 0 15px rgba(255, 255, 255, 0.8) !important;
          transition: transform 0.2s ease !important; 
        }

        /* 🌟 EFECTO DORADO EXCLUSIVO PARA LOS BOTONES */
        .boton-base { 
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; 
          border: 2px solid #FFD700; 
          background: linear-gradient(135deg, rgba(50, 35, 0, 0.95), rgba(150, 100, 0, 0.95)); 
          color: #FFFFFF; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: bold; 
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent !important; 
          box-shadow: 0 0 18px rgba(255, 215, 0, 0.75), inset 0 0 10px rgba(255, 235, 100, 0.4);
        }

        @media (hover: hover) and (pointer: fine) {
          .boton-base:hover { 
            transform: scale(1.08) translateY(-2px) !important; 
            box-shadow: 0 0 35px rgba(255, 215, 0, 1) !important; 
            border-color: #FFFFFF !important; 
            color: #FFFFFF !important; 
            background: rgba(80, 50, 0, 0.6) !important; 
            backdrop-filter: blur(2px);
          }
        }

        .boton-base:active { 
          transform: scale(0.90) translateY(3px) !important; 
          background: linear-gradient(135deg, rgba(180, 120, 0, 0.98), rgba(255, 200, 0, 0.98)) !important;
          border-color: #FFFFFF !important;
          color: #FFFFFF !important;
          box-shadow: 0 0 30px rgba(255, 215, 0, 1), inset 0 0 15px rgba(255, 255, 255, 0.8) !important;
          transition: transform 0.2s ease !important; 
        }

        .camaleon-vivo { border-color: #ff3333 !important; color: #ff3333 !important; background: rgba(255, 0, 0, 0.2) !important; }
        @keyframes pulso-rojo-intenso { 0% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } 50% { transform: scale(1.2); box-shadow: 0 0 35px 12px #ff0000; } 100% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } }
        
        @media (hover: hover) and (pointer: fine) {
          .camaleon-vivo:hover { border-color: #ff3333 !important; color: #ff3333 !important; animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; background: rgba(255, 0, 0, 0.1) !important; }
        }
        .latido-vivo { animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; }

        @keyframes respiracionCirculoDoradoFuerte {
          0%, 100% { transform: scale(1); box-shadow: 0 0 18px rgba(255, 215, 0, 0.75), inset 0 0 10px rgba(255, 215, 0, 0.5); border-color: #FFD700; }
          50% { transform: scale(1.06); box-shadow: 0 0 30px rgba(255, 215, 0, 1), inset 0 0 16px rgba(255, 245, 180, 0.8); border-color: #FFFFFF; }
        }
        .animacion-circulo-vivo { animation: respiracionCirculoDoradoFuerte 2.5s infinite ease-in-out; }
      `}</style>

     {/* MODAL GENERAL */}
     <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: modalAbierto ? 'auto' : 'none' }}>
        <ModalGeneral 
          modalAbierto={modalAbierto} 
          onClose={() => setModalAbierto(null)} 
          esModoEnVivo={esModoEnVivo}
          setEsModoEnVivo={setEsModoEnVivo}
          onIrAComprarTicket={(sorteo) => {
            console.log("Sorteo seleccionado para comprar:", sorteo);
            setModalAbierto('COMPRAR TICKET');
          }}
        />
      </div>

      {/* CRONÓMETRO FIJO (UBICACIÓN COMPACTA EN PIXELES) */}
      <div style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 90000 }}>
        <button 
          onMouseEnter={() => reproducirSonidoTematico('reliquia_hover')}
          onClick={() => { reproducirSonidoTematico('reliquia_click'); setModalAbierto('CRONOMETRO'); }} 
          className="boton-celeste-original" 
          style={{ 
            padding: '5px 14px', 
            borderRadius: '14px', 
            cursor: 'pointer', 
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px'
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 'bold', lineHeight: '1.1', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
            {tiempoRestante.dias}d : {String(tiempoRestante.hrs).padStart(2, '0')}h : {String(tiempoRestante.mins).padStart(2, '0')}m : <span style={{ color: '#FF4D4D', textShadow: '0 0 8px rgba(255, 77, 77, 0.9)' }}>{String(tiempoRestante.secs).padStart(2, '0')}s</span>
          </span>
          <span style={{ color: '#FF4D4D', fontWeight: 'bold', fontSize: '0.5rem', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 6px rgba(255, 77, 77, 0.8)', letterSpacing: '0.8px' }}>
            CUENTA REGRESIVA
          </span>
        </button>
      </div>

      {/* 🎟️ BOTÓN COMPRAR TICKET (UBICACIÓN COMPACTA) */}
      <div style={{ position: 'absolute', top: '440px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '50%', display: 'flex', justifyContent: 'center' }}>
        <button 
          onMouseEnter={() => reproducirSonidoTematico('slot_hover')}
          onClick={() => { reproducirSonidoTematico('slot_jackpot'); setModalAbierto('COMPRAR TICKET'); }} 
          className="boton-celeste-original" 
          style={{ width: '80%', maxWidth: '160px', height: '30px', fontSize: '14px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap', textShadow: '0 0 5px rgba(0,0,0,0.8)' }}
        >
          COMPRAR TICKET
        </button>
      </div>

      {/* ================================================================= */}
      {/* 📍 BOTONES INFERIORES HORIZONTALES (SEPARADOS Y EQUILIBRADOS)      */}
      {/* ================================================================= */}
      <div style={{ 
        position: 'absolute', 
        bottom: '97px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '82%', 
        maxWidth: '320px',
        zIndex: 99 
      }}>
        
        {/* 1. Botón Tesoro */}
        <div style={{ width: '58px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button 
            onMouseEnter={() => reproducirSonidoTematico('tesoro_hover')}
            onClick={() => { reproducirSonidoTematico('tesoro_click'); setModalAbierto('TESORO'); }} 
            className="boton-base animacion-circulo-vivo"
            style={{ width: '58px', height: '58px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }} 
          >
            <img src="./tesoro.png" alt="Tesoro" style={{ width: '120%', height: '120%', objectFit: 'contain' }} />
          </button>
          <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.6rem', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 6px #000, 0 0 3px #000', transform: 'translateY(2px)' }}>
            TESORO
          </span>
        </div>

        {/* 2. Botón Camaleón / Comunidad (CENTRO) */}
        <BotonCamaleon
          onEstadoEnVivoChange={(enVivo) => setEsModoEnVivo(enVivo)}
          onAbrirModal={(tipoForzado) => {
            setModalAbierto(tipoForzado);
          }}
          reproducirSonido={(tipo) => reproducirSonidoTematico(tipo)}
        />

        {/* 3. Botón WhatsApp */}
        <div style={{ width: '58px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button 
            onMouseEnter={() => reproducirSonidoTematico('agua_hover')}
            onClick={() => { 
              reproducirSonidoTematico('agua_click');
              const numeroWhatsApp = "51976610071"; 
              const mensaje = encodeURIComponent("¡Hola, Playa Dorada! Deseo más información, por favor.");
              window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank');
            }} 
            className="boton-base animacion-circulo-vivo"
            style={{ width: '58px', height: '58px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }} 
          >
            <img src="./WhatsApp.png" alt="WhatsApp" style={{ width: '100%', height: '150%', objectFit: 'contain' }} />
          </button>
          <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.6rem', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 6px #000, 0 0 3px #000', transform: 'translateY(2px)' }}>
            WHATSAPP
          </span>
        </div>

      </div>

      <ModalCompra
        isOpen={modalAbierto === 'COMPRAR TICKET'}
        onClose={() => setModalAbierto(null)}
      />
    </div>
  );
}