import React, { useState, useEffect } from 'react';
import LlaveMaestra from './components/LlaveMaestra';
import CintaVideos from './components/CintaVideos';
import ModalCompra from './components/ModalCompra';
import CofreInteractivo from './components/CofreInteractivo';
import ModalGeneral from './components/ModalGeneral';
import EscenarioVisual from './components/EscenarioVisual';
import MenuFlotante from './components/botones/menu_superior/MenuFlotante';
import BotonCamaleon from './components/BotonCamaleon';
import AdminPanel from './AdminPanel';

// =================================================================
// 1. COMPONENTE PRINCIPAL APP
// =================================================================
export default function App() {
  const [tiempoRestante, setTiempoRestante] = useState({ dias: 0, hrs: 0, mins: 0, secs: 0 });
  const [esModoEnVivo, setEsModoEnVivo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState<string | null>(null);
  
  const [modalVideoId, setModalVideoId] = useState<string | null>(null);
  const [busquedaVideo, setBusquedaVideo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setModalAbierto('ADMIN');
    }
  }, []);

  useEffect(() => {
    // 🛠️ Formato corregido compatible con JavaScript (Año-Mes-DíaTHH:mm:ss)
    const fechaObjetivo = new Date('2026-09-03T21:17:00').getTime();

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
      // Prevenir bloqueos
    }
  };

  const esAdminAbierto = modalAbierto === 'ADMIN';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      maxWidth: esAdminAbierto ? '100vw' : '475px',
      maxHeight: esAdminAbierto ? '100vh' : '850px',
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
      boxShadow: esAdminAbierto ? 'none' : '0 0 30px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'row'
    }}>
      
      <div style={{
        flex: 1,
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {!esAdminAbierto && <LlaveMaestra />}
        {!esAdminAbierto && <EscenarioVisual />}
        
        {!modalVideoId && !esAdminAbierto && (
          <div style={{ position: 'relative', zIndex: 9, marginTop: '28px' }}>
            <MenuFlotante 
              onHover={() => reproducirSonidoTematico('fuego_hover')}
              onNavegar={(seccion) => { 
                reproducirSonidoTematico('menu_click_nuevo'); 
                setModalAbierto(seccion.toUpperCase()); 
              }} 
            />
          </div>
        )}

        {!modalVideoId && !esAdminAbierto && (
          <button
            onClick={() => {
              reproducirSonidoTematico('menu_click_nuevo');
              setModalAbierto('ADMIN');
            }}
            style={{
              position: 'absolute',
              bottom: '15px',
              left: '15px',
              zIndex: 99,
              background: 'linear-gradient(135deg, rgba(50, 35, 0, 0.95), rgba(150, 100, 0, 0.95))',
              color: '#FFF',
              border: '2px solid #FFD700',
              borderRadius: '10px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.7)',
              letterSpacing: '0.5px'
            }}
          >
            ⚙️ ADMIN
          </button>
        )}

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

          @keyframes respiracionCirculoDoradoFuerte {
            0%, 100% { transform: scale(1); box-shadow: 0 0 18px rgba(255, 215, 0, 0.75), inset 0 0 10px rgba(255, 215, 0, 0.5); border-color: #FFD700; }
            50% { transform: scale(1.06); box-shadow: 0 0 30px rgba(255, 215, 0, 1), inset 0 0 16px rgba(255, 245, 180, 0.8); border-color: #FFFFFF; }
          }
          .animacion-circulo-vivo { animation: respiracionCirculoDoradoFuerte 2.5s infinite ease-in-out; }

          @keyframes respiracionRojoVivo {
            0%, 100% { 
              transform: scale(1); 
              box-shadow: 0 0 15px rgba(255, 0, 0, 0.6), inset 0 0 8px rgba(255, 50, 50, 0.4); 
              border-color: transparent; 
            }
            50% { 
              transform: scale(1.16); 
              box-shadow: 0 0 45px rgba(255, 0, 0, 1), inset 0 0 22px rgba(255, 120, 120, 0.9); 
              border-color: transparent; 
            }
          }

          .camaleon-vivo.latido-vivo { 
            animation: respiracionRojoVivo 0.95s infinite ease-in-out !important; 
            background: linear-gradient(135deg, rgba(120, 0, 0, 0.95), rgba(220, 10, 10, 0.95)) !important;
            border-color: transparent !important;
            box-shadow: 0 0 25px rgba(255, 0, 0, 0.8), inset 0 0 12px rgba(255, 80, 80, 0.6) !important;
          }
        `}</style>

        {esAdminAbierto ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#111',
            zIndex: 99999,
            overflowY: 'auto'
          }}>
            <AdminPanel onVolverApp={() => setModalAbierto(null)} />
          </div>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: modalAbierto ? 'auto' : 'none' }}>
            <ModalGeneral 
              modalAbierto={modalAbierto} 
              onClose={() => setModalAbierto(null)} 
              esModoEnVivo={esModoEnVivo}
              setEsModoEnVivo={setEsModoEnVivo}
              tiempoRestante={tiempoRestante}
              onIrAComprarTicket={(sorteo) => {
                console.log("Sorteo seleccionado para comprar:", sorteo);
                setModalAbierto('COMPRAR TICKET');
              }}
            />
          </div>
        )}
     
        {!modalVideoId && !esAdminAbierto && (
          <div style={{ position: 'absolute', top: '92px', left: '50%', transform: 'translateX(-50%)', zIndex: 9, display: modalAbierto ? 'none' : 'block' }}>
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
        )}

        {!esAdminAbierto && (
          <div style={{
            position: 'absolute',
            bottom: '22px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            maxWidth: '340px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px', 
            zIndex: 9
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', zIndex: 9 }}>
              <button 
                onMouseEnter={() => reproducirSonidoTematico('slot_hover')}
                onClick={() => { reproducirSonidoTematico('slot_jackpot'); setModalAbierto('COMPRAR TICKET'); }} 
                className="boton-celeste-original" 
                style={{ 
                  width: '100%', 
                  maxWidth: '170px', 
                  height: '34px', 
                  fontSize: '13px', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  whiteSpace: 'nowrap', 
                  textShadow: '0 0 5px rgba(0,0,0,0.8)'
                }}
              >
                COMPRAR TICKET
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '85%', 
              maxWidth: '320px',
              zIndex: 9
            }}>
              {/* Botón Tesoro */}
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

              {/* Botón Camaleón */}
              <BotonCamaleon
                onEstadoEnVivoChange={(enVivo) => setEsModoEnVivo(enVivo)}
                onAbrirModal={(tipoForzado) => setModalAbierto(tipoForzado)}
                reproducirSonido={(tipo) => reproducirSonidoTematico(tipo)}
              />

              {/* Botón WhatsApp */}
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
          </div>
        )}
      </div>

      {/* Cinta lateral de videos (se oculta si hay admin, si está en vivo o si hay un video reproduciéndose) */}
      {!esAdminAbierto && !esModoEnVivo && !modalVideoId && (
        <div style={{
          width: '52px',
          height: '100%',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10
        }}>
          <CintaVideos onSeleccionarVideo={(id) => setModalVideoId(id)} />
        </div>
      )}

      <ModalCompra
        isOpen={modalAbierto === 'COMPRAR TICKET'}
        onClose={() => setModalAbierto(null)}
      />

      {modalVideoId && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: '#050505', 
          zIndex: 9999999, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '12px',
          boxSizing: 'border-box'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ 
            width: '100%', 
            maxWidth: '420px', 
            height: '92vh', 
            maxHeight: '850px', 
            backgroundColor: '#111', 
            border: '2px solid #FFD700', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '15px', 
            boxSizing: 'border-box',
            boxShadow: '0 0 50px rgba(0,0,0,1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="🔍 Buscar video..." 
                value={busquedaVideo}
                onChange={(e) => setBusquedaVideo(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #555', background: '#222', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <button 
                onClick={() => setModalVideoId(null)} 
                style={{ color: '#FFD700', background: 'transparent', border: '1px solid #FFD700', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
              >
                ✕ CERRAR
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid #FFD700' }}>
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${modalVideoId}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '10px' }}>
                  Reproductor activo. Cierra este modal para volver a la cinta lateral.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}