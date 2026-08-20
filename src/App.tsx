import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import AdminPanel from './AdminPanel';
import CintaVideos from './components/CintaVideos';
import ModalCompra from './components/ModalCompra';

// =================================================================
// 0. PANEL DE ADMINISTRADOR (CENTRO DE MANDO)
// =================================================================
function BotonAccesoAdmin() {
  const [verAdmin, setVerAdmin] = useState(false);
  return (
    <>
      {/* Botón flotante dentro del contenedor */}
      {!verAdmin && (
        <button 
          onClick={() => setVerAdmin(true)}
          style={{ 
            position: 'absolute', top: '10px', right: '10px', 
            zIndex: 9999, background: '#FFD700', color: '#000', 
            border: 'none', padding: '6px 10px', borderRadius: '6px', 
            fontWeight: 'bold', cursor: 'pointer', fontSize: '10px'
          }}
        >
          ⚙️ Admin
        </button>
      )}

      {/* Panel de administración a pantalla completa */}
      {verAdmin && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          zIndex: 10000, background: '#121212', overflowY: 'auto' 
        }}>
         <AdminPanel onVolverApp={() => setVista('dashboard')} />
        </div>
      )}
    </>
  );
}
// =================================================================
// 1. ESTADOS Y CONFIGURACIÓN GENERAL
// =================================================================

export default function App() {

  const [timeLeft, setTimeLeft] = useState(12 * 3600 + 44 * 60 + 33);
  const [esModoEnVivo, setEsModoEnVivo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(null);

  // Estados generales de usuario y control
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefonoUsuario, setTelefonoUsuario] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

 // ================================================================
  // COMPONENTE DE COFRE CON DURACIÓN CONFIGURABLE Y PARTÍCULAS 3D DESDE EL CENTRO
  // =================================================================
  const CofreInteractvo = ({ label, onClick }) => {
    const [fase, setFase] = useState('cerrado'); // 'cerrado' | 'sacudiendo' | 'abierto'
    const procesandoRef = useRef(false);

    // ⚙️ Duración configurable en milisegundos (ej. 200ms = 0.2s)
    const duracionAperturaMs = 200; 

    // 🎵 Sonido integrado del cofre
    const reproducirNuevoSonidoCofre = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
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
                }}
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
  };
  const botones = [
    { t: '3.5%', l: '16%', w: '12.7%', h: '4.5%', label: 'SORTEOS' },
    { t: '3.5%', l: '30%', w: '12.7%', h: '4.5%', label: 'MIS TICKETS' },
    { t: '3.5%', l: '3.5%', l: '44%', w: '12.7%', h: '4.5%', label: 'GANADORES' },
    { t: '3.5%', l: '58%', w: '12.7%', h: '4.5%', label: 'NOSOTROS' },
    { t: '3.5%', l: '72%', w: '12.7%', h: '4.5%', label: 'CONTACTO' },
    {}, 
    {}, 
    {},
    { t: '82%', l: '23%', size: '11vw', label: 'TESORO' },
    { t: '82%', l: '45%', size: '11vw', isCamaleon: true },
    
      { 
        t: '82%', 
        l: '67%', 
        size: '11vw', 
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
      {/* ⚙️ AQUÍ DEBE IR EL BOTÓN UNA SOLA VEZ */}
    <BotonAccesoAdmin />
      {/* IMAGEN DE FONDO FIJA AL CONTENEDOR */}
      <img 
        src="./playa.jpg" 
        alt="Fondo" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }} 
      />
      
    {/* =================================================================
    2. CAPAS DE IMAGEN Y ESTRUCTURA VISUAL
    ================================================================= */}
<div style={{ position: 'absolute', top: '56%', left: '11%', display: 'flex', gap: '3.5%', width: '54%', zIndex: 3 }}>
  <div className="cofre-container"><CofreInteractvo label="PREMIO 1" onClick={setModalAbierto} /></div>
  <div className="cofre-container"><CofreInteractvo label="PREMIO 2" onClick={setModalAbierto} /></div>
  <div className="cofre-container"><CofreInteractvo label="PREMIO 3" onClick={setModalAbierto} /></div>
</div>

<img src="./playa.jpg" 
  alt="Fondo" 
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    zIndex: 0
  }} 
/>

{/* --- CONTENEDOR DE POSICIÓN --- */}
<div className="contenedor-giro-central">
    <div className="contenedor-rotacion">
        <img src="./timon.png" alt="Timón" className="imagen-timon" />
        <div className="destello-efecto color-rojo grupo-1" style={{ top: '15%', left: '50%' }}></div>
        <div className="destello-efecto color-verde grupo-1" style={{ top: '49%', left: '85%' }}></div>
        <div className="destello-efecto color-rojo grupo-1" style={{ top: '85%', left: '50%' }}></div>
        <div className="destello-efecto color-verde grupo-1" style={{ top: '49%', left: '14%' }}></div>
        <div className="destello-efecto color-celeste grupo-2" style={{ top: '21%', left: '31.5%' }}></div>
        <div className="destello-efecto color-amarillo grupo-2" style={{ top: '33.5%', left: '80.5%' }}></div>
        <div className="destello-efecto color-celeste grupo-2" style={{ top: '79%', left: '68%' }}></div>
        <div className="destello-efecto color-amarillo grupo-2" style={{ top: '66.5%', left: '19%' }}></div>
        <div className="destello-efecto color-morado grupo-3" style={{ top: '33%', left: '19%' }}></div>
        <div className="destello-efecto color-naranja grupo-3" style={{ top: '21%', left: '68%' }}></div>
        <div className="destello-efecto color-morado grupo-3" style={{ top: '67%', left: '80%' }}></div>
        <div className="destello-efecto color-naranja grupo-3" style={{ top: '79%', left: '31%' }}></div>
    </div>
</div>

{/* --- CINTA DE VIDEOS (COMPONENTE EXTERNO) --- */}
<CintaVideos />

{/* RENDERIZADO DEL MODAL DE PREMIOS DEL COFRE */}
{modalAbierto && (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: '#1a1a1a', border: '2px solid #FFD700', borderRadius: '16px', padding: '25px', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)' }}>
            <h2 style={{ color: '#FFD700', margin: '0 0 10px 0', fontSize: '20px' }}>¡Felicidades!</h2>
            <p style={{ color: '#fff', fontSize: '16px', margin: '0 0 20px 0' }}>Has abierto: <strong>{modalAbierto}</strong></p>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 20px 0' }}>¡Atrévete a ir por más! Podría tocarte el premio mayor del día.</p>
            <button onClick={() => setModalAbierto(null)} style={{ backgroundColor: '#FFD700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', width: '100%' }}>CERRAR</button>
        </div>
    </div>
)}

      <img 
        src="./dragon.png" 
        alt="Dragón" 
        className="dragon-animado" 
        style={{ 
          position: 'absolute', 
          bottom: '220px', 
          right: '-150px', 
          width: '470px', 
          height: 'auto',
          zIndex: 2 
        }} 
      />

      <img 
        src="./barramarron.png" 
        alt="Barra Inferior" 
        style={{ 
          position: 'absolute', 
          top: '72%',       
          left: '0%',        
          width: '100%',    
          height: '17vh',   
          zIndex: 2,        
          objectFit: 'fill' 
        }} 
      />

    <style>{`
      img, .imagen-timon, .dragon-animado, .cofre-container {
        -webkit-user-drag: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .imagen-timon, .dragon-animado, .destello-efecto {
        pointer-events: none;
      }
      .cinta-social-container {
        position: absolute;
        bottom: 21vh;
        left: 0;
        width: 100%;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.85);
        border-top: 1px solid rgba(255, 215, 0, 0.3);
        border-bottom: 1px solid rgba(255, 215, 0, 0.3);
        padding: 6px 0;
        z-index: 4;
        white-space: nowrap;
        user-select: none;
      }
      .cinta-social-track {
        display: inline-block;
        animation: desplazar-cinta 25s linear infinite;
        color: #FFD700;
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
        filter: drop-shadow(0 0 4px rgba(0, 255, 255, 1)) drop-shadow(0 0 10px rgba(0, 255, 255, 0.9));
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
      
      /* Animación 3D con destellos y brillo profundo tipo diamante */
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
        text-shadow: 0 2px 5px rgba(0,0,0,0.8), 0 0 10px rgba(255,215,0,0.8);
      }

      .contenedor-giro-central {
        position: absolute;
        z-index: 2;
        top: 9%; left: 50%;
        width: 350px; height: 350px;
        margin-left: -175px;
        pointer-events: none;
        display: block !important;
      }
      .contenedor-rotacion {
        width: 100%; height: 100%;
        animation: rotar-timon 20s linear infinite;
        transform-origin: center center;
        position: relative;
      }
      .imagen-timon { width: 100%; height: 100%; display: block; object-fit: contain; }
          
      .destello-efecto {
        position: absolute;
        width: 0px; height: 0px;
        opacity: 0;
        pointer-events: none;
      }
      .destello-efecto::before {
        content: "";
        position: absolute;
        width: 80px; height: 80px;
        left: -40px; top: -40px;
        background: 
          radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 15%),
          linear-gradient(to right, transparent, currentColor 45%, currentColor 55%, transparent),
          linear-gradient(to bottom, transparent, currentColor 45%, currentColor 55%, transparent);
        background-size: 100% 100%, 100% 3px, 3px 100%;
        background-position: center;
        background-repeat: no-repeat;
        mix-blend-mode: screen;
      }
      .destello-efecto::after {
        content: "";
        position: absolute;
        width: 15px; height: 15px;
        left: -7.5px; top: -7.5px;
        border-radius: 50%;
        box-shadow: 0 0 20px 10px currentColor;
        mix-blend-mode: screen;
      }
      .grupo-1 { animation: destello-diamante 3s infinite 0s; } 
      .grupo-2 { animation: destello-diamante 3s infinite 1s; } 
      .grupo-3 { animation: destello-diamante 3s infinite 2s; } 
      @keyframes destello-diamante {
        0%, 40%   { opacity: 0; transform: scale(0.3); }
        50%       { opacity: 1; transform: scale(1.0); filter: brightness(2.5); }
        60%, 100% { opacity: 0; transform: scale(0.3); }
      }
      .color-rojo { color: #ff0000; }
      .color-celeste { color: #00ffff; }
      .color-morado { color: #d000ff; }
      .color-verde { color: #00ff00; }
      .color-amarillo { color: #ffff00; }
      .color-naranja { color: #ff9900; }
      @keyframes rotar-timon {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .dragon-animado { animation: respiracion-total 6s infinite ease-in-out; }
      @keyframes respiracion-total {
        0%, 100% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 0px #FFD700); }
        50% { transform: scale(1.15); filter: brightness(1.2) drop-shadow(0 0 15px #FF8C00); }
      }
      .boton-base { transition: all 0.3s ease; border: 2px solid rgba(255, 215, 0, 0.4); background: rgba(0, 0, 0, 0.9); color: #FFD700; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; user-select: none; }
      .boton-base:hover { transform: scale(1.1) !important; box-shadow: 0 0 20px #FFD700 !important; border-color: #FFF !important; color: #FFF !important; }
      .boton-base:active { transform: scale(0.90) !important; filter: brightness(0.6) !important; transition: none !important; }
      .boton-destello { animation: sparkle 1.5s infinite; }
      .anim-flotante { animation: float 3s ease-in-out infinite; }
      .ritmo-medio { animation: spark 4s linear infinite; }
      .ritmo-rapido { animation: spark 3s linear infinite; }
      .btn-compra { border-color: #00d4ff !important; color: #00d4ff !important; }
      .camaleon-vivo { border-color: #ff0000 !important; color: #ff0000 !important; }
      @keyframes pulso-rojo-intenso { 0% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } 50% { transform: scale(1.2); box-shadow: 0 0 30px 10px #ff0000; } 100% { transform: scale(1); box-shadow: 0 0 0px #ff0000; } }
      .camaleon-vivo:hover { border-color: #ff0000 !important; color: #ff0000 !important; animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; }
      .latido-vivo { animation: pulso-rojo-intenso 0.8s infinite ease-in-out !important; }
      .boton-base:not(.camaleon-vivo):hover { border-color: #ffffff !important; color: #ffffff !important; }
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes spark { 0% { border-color: rgba(255, 215, 0, 0.4); } 50% { border-color: #FFF; box-shadow: 0 0 25px #FFF; } 100% { border-color: rgba(255, 215, 0, 0.4); } }
      @keyframes sparkle { 0% { box-shadow: 0 0 5px #25D366; } 50% { box-shadow: 0 0 20px #25D366, 0 0 40px #fff; } 100% { box-shadow: 0 0 5px #25D366; } }
      @keyframes fuego-giro {
        0% { filter: drop-shadow(0 0 5px #ff4500) brightness(1); }
        50% { filter: drop-shadow(0 0 25px #ff0000) drop-shadow(0 0 45px #ff8c00) brightness(1.4); }
        100% { filter: drop-shadow(0 0 5px #ff4500) brightness(1); }
      }
      .fuego-activo {
        animation: fuego-giro 0.6s infinite ease-in-out;
      }
    `}</style>


      {/* =================================================================
          4. MODAL CON RULETA COMPLETA DE 360° Y DRAGÓN DE FUEGO
          ================================================================= */}
      {modalAbierto && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModalAbierto(null)}>
         <div style={{ 
            width: '90vw', 
            maxWidth: '520px', 
            maxHeight: '85vh', 
            border: modalAbierto === 'EN VIVO' ? '8px solid #FF0000' : '8px solid #FFD700', 
            borderRadius: '25px', 
            background: 'rgba(0,0,0,0.95)', 
            padding: '20px', 
            color: '#FFF', 
            textAlign: 'center', 
            overflowY: 'auto', 
            boxSizing: 'border-box', 
            boxShadow: modalAbierto === 'EN VIVO' ? '0 0 30px 10px rgba(255, 0, 0, 0.8)' : '0 0 15px 4px rgba(255, 215, 0, 0.3)', 
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ 
              color: modalAbierto === 'EN VIVO' ? '#FF0000' : '#FFD700', 
              marginBottom: '15px' 
            }}>
              {modalAbierto}
            </h2>
            
            {/* REGISTRO OBLIGATORIO PARA CHAT / EN VIVO */}
            {(modalAbierto === 'COMUNIDAD' || modalAbierto === 'EN VIVO') && !usuarioRegistrado ? (
              <div style={{ textAlign: 'left', padding: '10px' }}>
                <p style={{ color: '#00d4ff', marginBottom: '15px', textAlign: 'center' }}>⚠️ Ingresa tus datos para unirte al chat interactivo:</p>
                <label style={{ fontSize: '0.85rem' }}>Nombre y Apellido:</label>
                <input 
                  type="text" 
                  value={nombreUsuario} 
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder="Tu nombre completo"
                  style={{ width: '100%', padding: '10px', margin: '5px 0 15px 0', borderRadius: '5px', background: '#222', color: '#fff', border: '1px solid #444', boxSizing: 'border-box' }}
                />
                <label style={{ fontSize: '0.85rem' }}>Celular / WhatsApp:</label>
                <input 
                  type="text" 
                  value={telefonoUsuario} 
                  onChange={(e) => setTelefonoUsuario(e.target.value)}
                  placeholder="Número de contacto"
                  style={{ width: '100%', padding: '10px', margin: '5px 0 20px 0', borderRadius: '5px', background: '#222', color: '#fff', border: '1px solid #444', boxSizing: 'border-box' }}
                />
                <button 
                  onClick={() => {
                    if(nombreUsuario.trim() && telefonoUsuario.trim()) {
                      setUsuarioRegistrado(true);
                    } else {
                      alert('Por favor completa ambos campos para ingresar.');
                    }
                  }} 
                  style={{ width: '100%', padding: '12px', background: '#FFD700', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  REGISTRARSE Y ENTRAR AL CHAT
                </button>
              </div>
            ) : (modalAbierto === 'COMUNIDAD' || modalAbierto === 'EN VIVO') && usuarioRegistrado ? (
              <div>
                {modalAbierto === 'EN VIVO' && <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #FF0000', borderRadius: '10px', color: '#FF0000', fontWeight: 'bold' }}>[ TRANSMISIÓN EN VIVO ACTIVA ]</div>}
                <p style={{ fontSize: '1.1rem', color: '#25D366' }}>¡Hola, {nombreUsuario}! Ya estás conectado al chat general de Playa Dorada.</p>
                <div style={{ background: '#111', padding: '15px', borderRadius: '8px', marginTop: '15px', height: '120px', overflowY: 'auto', textAlign: 'left', fontSize: '0.9rem', border: '1px solid #333' }}>
                  <p style={{ margin: '5px 0' }}>🤖 <b>Sistema:</b> ¡Bienvenido a la comunidad!</p>
                  <p style={{ margin: '5px 0' }}>👤 <b>Carlos M.:</b> ¡Listo para el gran sorteo en Bambamarca!</p>
                </div>
              </div>
          ) : modalAbierto === 'TESORO' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden', padding: '20px' }}>
              <h2 style={{ color: '#FFD700', margin: '0 0 10px 0', fontSize: '20px' }}>¡Tesoro Encontrado!</h2>
              <p style={{ color: '#fff', fontSize: '14px', textAlign: 'center', margin: '0 0 20px 0' }}>
                Has abierto el cofre del tesoro. ¡Pronto habrá más sorpresas aquí!
              </p>
              <button 
                onClick={() => setModalAbierto(null)} 
                style={{ backgroundColor: '#FFD700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', width: '100%' }}
              >
                CERRAR
              </button>
            </div>
            ) : modalAbierto === 'WHATSAPP' ? (
              <div>
                <p style={{ marginBottom: '20px' }}>💬 Comunícate directamente con nuestro equipo de atención al cliente en Playa Dorada.</p>
                <button 
                  onClick={() => window.open('https://wa.me/51976610071?text=Hola,%20deseo%20más%20información%20sobre%20Playa%20Dorada', '_blank')} 
                  className="boton-destello" 
                  style={{ width: '100%', padding: '14px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                >
                  Abrir WhatsApp Oficial
                </button>
              </div>
            ) : modalAbierto === 'CRONOMETRO' ? (
              <div style={{ textAlign: 'left' }}>
                <p>📍 <strong>Lugar:</strong> Playa Dorada / Plaza Pecuaria, Bambamarca</p>
                <p>📅 <strong>Fecha:</strong> 15 de Julio, 2026</p>
                <p>⏰ <strong>Hora:</strong> 16:00 horas</p>
                <h4 style={{ color: '#00d4ff', marginTop: '20px' }}>PREMIOS PRINCIPALES</h4>
                <ul style={{ textAlign: 'left' }}>
                  <li>🎁 1er Premio: Motocicleta 0km</li>
                  <li>🎁 2do Premio: Laptop Ingeniería</li>
                  <li>🎁 3er Premio: Kit de Construcción</li>
                </ul>
                <button onClick={() => window.open('https://wa.me/51976610071', '_blank')} className="boton-destello" style={{ width: '100%', padding: '12px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>🔔 RECIBIR RECORDATORIO</button>
              </div>
            ) : (
              <p>
                {modalAbierto === 'SORTEOS' && "Consulta nuestros sorteos vigentes. ¡Mucha Suerte!"}
                {modalAbierto === 'MIS TICKETS' && "Tus números de la suerte están registrados aquí. ¡A ganar!"}
                {modalAbierto === 'GANADORES' && "¡La historia la escriben los ganadores! Mira quienes ya celebran."}
                {modalAbierto === 'NOSOTROS' && "Construimos emociones y experiencias únicas en el corazón de Cajamarca."}
                {modalAbierto === 'CONTACTO' && "Tu opinión vale oro. Contacta directamente con soporte."}
                {modalAbierto === 'COMPRAR TICKET' && "Cada ticket es una puerta abierta a la fortuna."}
                {modalAbierto === 'PREMIO 1' && "¡Un premio diseñado para un ganador excepcional!"}
                {modalAbierto === 'PREMIO 2' && "¡Atrévete a ir por más! Podría cambiar tu día."}
                {modalAbierto === 'PREMIO 3' && "¡La gran sorpresa! Podría ser tuya hoy mismo."}
              </p>
            )}
            
            <button onClick={() => setModalAbierto(null)} style={{ marginTop: '20px', padding: '10px 20px', background: '#FFD700', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>CERRAR</button>
          </div>
        </div>
      )}

// =================================================================
// 5. CRONÓMETRO Y BOTÓN COMPRAR PRINCIPAL (SEPARADOS)
// =================================================================

      {/* --- CRONÓMETRO --- */}
      <div style={{ position: 'absolute', top: '9%', left: '50%', transform: 'translateX(-50%)', zIndex: 999 }}>
        <button onClick={() => setModalAbierto('CRONOMETRO')} className="boton-base cronometro-artistico" style={{ padding: '3px 12px', fontSize: '20px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {formatTime(timeLeft)}
        </button>
      </div>

      {/* --- BOTÓN COMPRAR TICKET --- */}
      <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translateX(-50%)', zIndex: 999, width: '50%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setModalAbierto('COMPRAR TICKET')} className="boton-base btn-compra" style={{ width: '80%', maxWidth: '170px', height: '30px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          COMPRAR TICKET
        </button>
      </div>

      {/* =================================================================
          6. BOTONES DEL MENÚ
          ================================================================= */}
      {botones.map((b, i) => {
        // MODIFICA AQUÍ EL TAMAÑO DE LOS CÍRCULOS (este valor reemplazará al que traiga el arreglo)
        const tamanoCirculo = '70px'; 

        // AQUÍ ESTÁN TUS COORDENADAS QUE YA FUNCIONAN PERFECTO
        let customTop = b.t;
        let customLeft = b.l;
        if (i === 8) { customTop = '77%'; customLeft = '20%'; } // Posición del primer círculo (TESORO)
        if (i === 9) { customTop = '77%'; customLeft = '50%'; } // Posición del segundo círculo (COMUNIDAD)
        if (i === 10) { customTop = '77%'; customLeft = '80%'; } // Posición del tercer círculo (WHATSAPP)

        return i >= 8 ? (
          <div key={i} style={{ position: 'absolute', top: customTop, left: customLeft, transform: 'translateX(-50%)', width: tamanoCirculo, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', zIndex: 999 }}>
            <button 
              onClick={() => { 
                if (b.isCamaleon) { 
                  setModalAbierto(esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD');
                  setEsModoEnVivo(!esModoEnVivo);
                } else { 
                  setModalAbierto(b.label || null); 
                } 
              }} 
              className={`boton-base ritmo-rapido ${b.isCamaleon && esModoEnVivo ? 'camaleon-vivo latido-vivo' : ''}`}
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
              {/* ASIGNACIÓN DE IMÁGENES SEGÚN EL BOTÓN USANDO RUTA ABSOLUTA */}
              {i === 8 && (
                <img src="./tesoro.png" alt="Tesoro" style={{ width: '120%', height: '120%', objectFit: 'contain' }} />
              )}
              {i === 9 && (
                <img src="./comunidad.png" alt="Comunidad" style={{ width: '120%', height: '120%', objectFit: 'contain' }} />
              )}
              {i === 10 && (
                <img src="./WhatsApp.png" alt="WhatsApp" style={{ width: '100%', height: '150%', objectFit: 'contain' }} />
              )}
            </button>
            <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.7rem', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 5px #000', transform: 'translateY(2px)' }}>
              {b.isCamaleon ? (esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD') : b.label}
            </span>
          </div>
        ) : (
          <button key={i} onClick={() => setModalAbierto(b.label || null)} className={`boton-base ${i < 5 ? 'anim-flotante' : 'ritmo-medio'}`} style={{ position: 'absolute', top: b.t, left: b.l, width: b.w, height: b.h, borderRadius: '8px', zIndex: 999, fontSize: i < 5 ? '0.50rem' : '0.7rem', cursor: 'pointer' }}>{b.label}</button>
        );
      })}

      {/* RENDERIZADO CONDICIONAL DEL MODAL DE COMPRA (YA NO REQUIERE PASARLE SORTEOS) */}
      <ModalCompra
        isOpen={modalAbierto === 'COMPRAR TICKET'}
        onClose={() => setModalAbierto(null)}
      />
    </div>
  );
}

