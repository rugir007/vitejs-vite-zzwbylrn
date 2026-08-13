import React, { useState, useEffect } from 'react';

// =================================================================
// 1. ESTADOS Y CONFIGURACIÓN (CON RULETA COMPLETA DE 360° Y DRAGÓN DE FUEGO)
// =================================================================
export default function App() {

  const [timeLeft, setTimeLeft] = useState(12 * 3600 + 44 * 60 + 33);
  const [esModoEnVivo, setEsModoEnVivo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(null);

  // Estados para Registro, Chat y Ruleta Interactiva Completa
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefonoUsuario, setTelefonoUsuario] = useState('');
  const [premioRuleta, setPremioRuleta] = useState(null);
  const [girandoRuleta, setGirandoRuleta] = useState(false);
  const [rotacionRuleta, setRotacionRuleta] = useState(0);

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

  // Lógica de Giro Real para la Ruleta Completa de 360°
  const girarRuletaCompleta = () => {
    if (girandoRuleta) return;
    setGirandoRuleta(true);
    setPremioRuleta(null);

    // 8 Secciones distribuidas uniformemente en 360 grados (45° cada una)
    const premiosDisponibles = [
      { texto: '¡Bono S/ 50!', angulo: 0 },
      { texto: '¡Doble Ticket!', angulo: 45 },
      { texto: '¡S/ 20 Consumo!', angulo: 90 },
      { texto: '¡Kit Sorpresa!', angulo: 135 },
      { texto: '¡Sigue Intentando!', angulo: 180 },
      { texto: '¡Entrada VIP!', angulo: 225 },
      { texto: '¡Super Premio!', angulo: 270 },
      { texto: '¡Premio Secreto!', angulo: 315 }
    ];

    const randomIndex = Math.floor(Math.random() * premiosDisponibles.length);
    const premioElegido = premiosDisponibles[randomIndex];

    // Mínimo 6 vueltas completas (2160°) + el ángulo exacto del premio
    const vueltasExtra = 360 * 6;
    const nuevaRotacion = rotacionRuleta + vueltasExtra + (360 - premioElegido.angulo);
    
    setRotacionRuleta(nuevaRotacion);

    setTimeout(() => {
      setPremioRuleta(premioElegido.texto);
      setGirandoRuleta(false);
    }, 3500); // Duración exacta de la transición
  };

  const CofreInteractvo = ({ label, onClick }) => {
    const [abierto, setAbierto] = useState(false);
    return (
      <img 
        src={abierto ? "./cofreabierto.png" : "./cofrecerrado.png"}
        onClick={() => {
          setAbierto(true);
          setTimeout(() => onClick(label), 500);
        }}
        style={{ width: '100px', cursor: 'pointer', transition: '0.3s' }}
        alt={label}
      />
    );
  };
  
  const botones = [
    { t: '3.5%', l: '16%', w: '12.7%', h: '4.5%', label: 'SORTEOS' },
    { t: '3.5%', l: '30%', w: '12.7%', h: '4.5%', label: 'MIS TICKETS' },
    { t: '3.5%', l: '44%', w: '12.7%', h: '4.5%', label: 'GANADORES' },
    { t: '3.5%', l: '58%', w: '12.7%', h: '4.5%', label: 'NOSOTROS' },
    { t: '3.5%', l: '72%', w: '12.7%', h: '4.5%', label: 'CONTACTO' },
    {}, 
    {}, 
    {},
    { t: '82%', l: '23%', size: '11vw', label: 'TESORO' },
    { t: '82%', l: '45%', size: '11vw', isCamaleon: true },
    { t: '82%', l: '67%', size: '11vw', label: 'WHATSAPP' },
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
    objectPosition: 'center center', // <--- Añade esta línea
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
{/* =================================================================
    CINTA DE VIDEOS CONECTADA A GOOGLE SHEETS (CONFIGURADA)
    ================================================================= */}
{(() => {
  const [modalVideoId, setModalVideoId] = React.useState(null);
  const [busqueda, setBusqueda] = React.useState("");
  const [listaDeVideos, setListaDeVideos] = React.useState([]);
  const [cargando, setCargando] = React.useState(true);

  // Carga automática desde tu hoja: Videos Playa Dorada
  React.useEffect(() => {
    const sheetId = "1Py5iakcY5MA3KKM3b7xtUM1Vg-P3LX2ecfc6IgQCTAs";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    fetch(url)
      .then(res => res.text())
      .then(data => {
        const json = JSON.parse(data.substring(47, data.length - 2));
        const filas = json.table.rows.map(row => ({
          titulo: row.c[0] ? row.c[0].v : "",
          id: row.c[1] ? row.c[1].v : ""
        })).filter(v => v.id && v.titulo);

        setListaDeVideos(filas);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al cargar:", err);
        setCargando(false);
      });
  }, []);

  const scrollRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

  // Lógica de Scroll
  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container || listaDeVideos.length === 0) return;

    const singleSetWidth = container.scrollWidth / 3;
    container.scrollLeft = singleSetWidth;

    let animationId;
    let isUserInteracting = false;
    
    const scroll = () => {
      if (!isUserInteracting && container) {
        container.scrollLeft += 0.5;
        const currentScroll = container.scrollLeft;
        const totalWidth = container.scrollWidth;
        const oneThird = totalWidth / 3;

        if (currentScroll >= oneThird * 2) {
          container.scrollLeft = currentScroll - oneThird;
        } else if (currentScroll <= 0) {
          container.scrollLeft = currentScroll + oneThird;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [listaDeVideos]);

  const onMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const onMouseLeaveOrUp = () => { isDraggingRef.current = false; };

  const onMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 4.0;
    const container = scrollRef.current;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const videosFiltrados = listaDeVideos.filter(v => 
    v.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <div style={{ 
        position: 'absolute', top: '89.5%', left: '0%', width: '100%', height: '60px', 
        backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTop: '1px solid #FFD700', 
        borderBottom: '1px solid #FFD700', zIndex: 998, display: 'flex', alignItems: 'center', overflow: 'hidden'
      }}>
        <style>{`.cinta-scroll-libre::-webkit-scrollbar { display: none; }`}</style>
        
        {cargando ? (
          <div style={{ color: '#FFD700', width: '100%', textAlign: 'center', fontSize: '12px' }}>Cargando videos...</div>
        ) : (
          <div 
            ref={scrollRef}
            className="cinta-scroll-libre"
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeaveOrUp}
            onMouseUp={onMouseLeaveOrUp}
            onMouseMove={onMouseMove}
            style={{ 
              display: 'flex', gap: '10px', padding: '0 10px', overflowX: 'auto', 
              width: '100%', height: '100%', alignItems: 'center', scrollbarWidth: 'none', cursor: 'grab', userSelect: 'none'
            }}
          >
            {[...Array(3)].map((_, groupIndex) => (
              <div key={groupIndex} style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
                {listaDeVideos.map((video, i) => (
                  <div 
                    key={i} 
                    onClick={() => { if (!isDraggingRef.current) setModalVideoId(video.id); }} 
                    style={{ 
                      width: '90px', height: '42px', backgroundColor: '#111', 
                      border: '1px solid #FFD700', borderRadius: '4px', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                      position: 'relative', overflow: 'hidden', flexShrink: 0
                    }}
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
                      alt="" 
                      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
                    />
                    <span style={{ fontSize: '10px', color: '#FFD700', fontWeight: 'bold', zIndex: 2 }}>▶</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalVideoId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
          <div style={{ width: '100%', maxWidth: '420px', height: '95vh', maxHeight: '850px', backgroundColor: '#111', border: '2px solid #FFD700', borderRadius: '16px', display: 'flex', flexDirection: 'column', padding: '15px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="🔍 Buscar video..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #555', background: '#222', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={() => setModalVideoId(null)} style={{ color: '#FFD700', background: 'transparent', border: '1px solid #FFD700', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕ CERRAR</button>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid #FFD700' }}>
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${modalVideoId}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {videosFiltrados.map((video, i) => (
                  <div key={i} onClick={() => setModalVideoId(video.id)} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '6px', backgroundColor: modalVideoId === video.id ? '#333' : '#181818', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer' }}>
                    <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} style={{ width: '85px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontSize: '12px', color: '#fff' }}>{video.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          DRAGONN
          ================================================================= */}
      <img 
        src="./dragon.png" 
        alt="Dragón" 
        className="dragon-animado" 
        style={{ 
          position: 'absolute', 
          bottom: '150px', 
          right: '-150px', 
          width: '470px', 
          height: 'auto',
          zIndex: 2 
        }} 
      />

      {/* =================================================================
          BARRA MARRÓN INFERIOR
          ================================================================= */}
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
        .cinta-social-container {
          position: absolute;
          bottom: 21vh;
        }
      `}</style>
    </>
  );
})()}
      
{/* =================================================================
    7. ESTILOS CSS GENERALES Y ANIMACIONES
    ================================================================= */}
    <style>{`
      /* =================================================================
         BLOQUEO GLOBAL DE ARRASTRE Y SELECCIÓN (SOLUCIÓN AL PROBLEMA)
         ================================================================= */
      img, .imagen-timon, .dragon-animado, .cofre-container {
        -webkit-user-drag: none;
        user-select: none;
        -webkit-user-select: none;
      }

      /* Hace que las imágenes y elementos de adorno dejen pasar el ratón sin atraparlos */
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
        transition: transform 0.25s ease, filter 0.25s ease;
        cursor: pointer;
        border-radius: 12px;
      }
      .cofre-container:hover {
        transform: scale(1.08);
        filter: drop-shadow(0 0 4px rgba(0, 255, 255, 1)) drop-shadow(0 0 10px rgba(0, 255, 255, 0.9));
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
              /* RULETA COMPLETA DE 360° CON ILUMINACIÓN, TIMÓN Y EFECTO DE DRAGÓN DE FUEGO */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
                <p style={{ marginBottom: '5px', fontSize: '0.85rem', color: '#FFD700', textAlign: 'center' }}>¡Gira la ruleta completa de 360° y activa el poder del dragón!</p>
                
                {/* Contenedor con la Ruleta Completa y Anillo de Fuego (Ajustado para no desbordar) */}
                <div className={`p-2 relative my-2 ${girandoRuleta ? 'fuego-activo' : ''}`} style={{ width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.3) 0%, rgba(0,0,0,0.9) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                  
                  {/* Puntero Superior Dorado */}
                  <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '20px solid #FFD700',
                    zIndex: 25,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))'
                  }} />
            
                  {/* Aro Exterior de Luces Decorativas (Ajustado al contenedor) */}
                  <div style={{
                    position: 'absolute',
                    width: '235px',
                    height: '235px',
                    borderRadius: '50%',
                    border: '5px dashed #FFD700',
                    zIndex: 10,
                    pointerEvents: 'none',
                    boxShadow: 'inset 0 0 12px rgba(255,215,0,0.6)',
                    boxSizing: 'border-box'
                  }} />
            
                  {/* Círculo Giratorio Completo de 360° (Simulación de 27 secciones / Estilo Timón con Brillos) */}
                  <div style={{
                    width: '210px',
                    height: '210px',
                    borderRadius: '50%',
                    border: '3px solid #fff',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: `rotate(${rotacionRuleta}deg)`,
                    transition: girandoRuleta ? 'transform 3.5s cubic-bezier(0.12, 0.85, 0.15, 1)' : 'none',
                    background: 'conic-gradient(#ff4757 0deg 40deg, #ffa502 40deg 80deg, #2ed573 80deg 120deg, #1e90ff 120deg 160deg, #9b59b6 160deg 200deg, #ff6b81 200deg 240deg, #2bcbba 240deg 280deg, #f1c40f 280deg 320deg, #3742fa 320deg 360deg)',
                    boxSizing: 'border-box'
                  }}>
                    {/* Destellos / Estrellas decorativas tipo timón */}
                    <span style={{ position: 'absolute', top: '10%', left: '50%', fontSize: '0.5rem', color: '#FFF', textShadow: '0 0 3px #FFD700' }}>✨</span>
                    <span style={{ position: 'absolute', top: '50%', left: '85%', fontSize: '0.5rem', color: '#FFF', textShadow: '0 0 3px #FFD700' }}>✨</span>
                    <span style={{ position: 'absolute', top: '85%', left: '50%', fontSize: '0.5rem', color: '#FFF', textShadow: '0 0 3px #FFD700' }}>✨</span>
                    <span style={{ position: 'absolute', top: '50%', left: '10%', fontSize: '0.5rem', color: '#FFF', textShadow: '0 0 3px #FFD700' }}>✨</span>
            
                    {/* Textos distribuidos */}
                    <span style={{ position: 'absolute', top: '18%', left: '52%', transform: 'rotate(20deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>Bono S/50</span>
                    <span style={{ position: 'absolute', top: '35%', left: '70%', transform: 'rotate(60deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>Doble Tick</span>
                    <span style={{ position: 'absolute', top: '62%', left: '68%', transform: 'rotate(100deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>S/ 20 Cons</span>
                    <span style={{ position: 'absolute', top: '78%', left: '50%', transform: 'rotate(140deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>Kit Sorp</span>
                    <span style={{ position: 'absolute', top: '78%', left: '30%', transform: 'rotate(180deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>Sigue Int</span>
                    <span style={{ position: 'absolute', top: '62%', left: '15%', transform: 'rotate(220deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>EntradaVIP</span>
                    <span style={{ position: 'absolute', top: '35%', left: '12%', transform: 'rotate(260deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>SuperPrem</span>
                    <span style={{ position: 'absolute', top: '18%', left: '30%', transform: 'rotate(300deg)', fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 2px #000' }}>Secreto</span>
                  </div>
            
                  {/* Centro Metálico del Timón (Brilloso) */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '50px',
                    height: '50px',
                    background: 'radial-gradient(circle, #ffffff 0%, #FFD700 60%, #b8860b 100%)',
                    border: '3px solid #111',
                    borderRadius: '50%',
                    zIndex: 20,
                    boxShadow: '0 0 12px rgba(255,215,0,0.9), inset 0 0 6px rgba(255,255,255,0.8)'
                  }} />
                </div>
            
                {/* Mensaje de Resultado */}
                <div style={{ minHeight: '28px', margin: '4px 0', textAlign: 'center' }}>
                  <h3 style={{ color: '#00d4ff', fontSize: '0.9rem', margin: 0 }}>
                    {girandoRuleta ? "🔥 ¡El dragón lanza fuego mientras gira la ruleta!" : (premioRuleta ? `¡Resultado: ${premioRuleta}!` : "¡Toca el botón para girar!")}
                  </h3>
                </div>
            
                {/* Botón de Acción Principal */}
                <button 
                  onClick={girarRuletaCompleta} 
                  disabled={girandoRuleta}
                  style={{ width: '100%', padding: '10px', background: 'linear-gradient(to right, #ff8c00, #ff4500)', border: '2px solid #FFD700', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 10px rgba(255,69,0,0.5)', fontSize: '0.9rem' }}
                >
                  {girandoRuleta ? "GIRANDO CON PODER..." : "GIRAR RULETA 360°"}
                </button>
              </div>
            ) : modalAbierto === 'WHATSAPP' ? (
              <div>
                <p style={{ marginBottom: '20px' }}>💬 Comunícate directamente con nuestro equipo de atención al cliente en Playa Dorada.</p>
                <button 
                  onClick={() => window.open('https://wa.me/51999999999?text=Hola,%20deseo%20más%20información%20sobre%20Playa%20Dorada', '_blank')} 
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
                <button onClick={() => window.open('https://wa.me/51999999999', '_blank')} className="boton-destello" style={{ width: '100%', padding: '12px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>🔔 RECIBIR RECORDATORIO</button>
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

      {/* =================================================================
          5. CRONÓMETRO Y BOTÓN COMPRAR PRINCIPAL (SEPARADOS)
          ================================================================= */}
      
      {/* --- CRONÓMETRO --- */}
      <div style={{ position: 'absolute', top: '9%', left: '50%', transform: 'translateX(-50%)', zIndex: 999 }}>
        <button onClick={() => setModalAbierto('CRONOMETRO')} className="boton-base cronometro-artistico" style={{ padding: '3px 12px', fontSize: '20px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {formatTime(timeLeft)}
        </button>
      </div>

      {/* --- BOTÓN COMPRAR TICKET --- */}
      <div style={{ position: 'absolute', top: '60%', left: '25%', transform: 'translateX(-50%)', zIndex: 999, width: '50%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setModalAbierto('COMPRAR TICKET')} className="boton-base btn-compra" style={{ width: '80%', maxWidth: '170px', height: '30px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          COMPRAR TICKET
        </button>
      </div>

      {/* =================================================================
          6. BOTONES DEL MENÚ
          ================================================================= */}
      {botones.map((b, i) => {
        // MODIFICA AQUÍ EL TAMAÑO DE LOS CÍRCULOS (este valor reemplazará al que traiga el arreglo)
        const tamanoCirculo = '50px'; 

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
              style={{ width: tamanoCirculo, height: tamanoCirculo, borderRadius: '50%', margin: 0, cursor: 'pointer' }} 
            />
            <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.7rem', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap', textShadow: '0 0 5px #000', transform: 'translateY(2px)' }}>
              {b.isCamaleon ? (esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD') : b.label}
            </span>
          </div>
        ) : (
          <button key={i} onClick={() => setModalAbierto(b.label || null)} className={`boton-base ${i < 5 ? 'anim-flotante' : 'ritmo-medio'}`} style={{ position: 'absolute', top: b.t, left: b.l, width: b.w, height: b.h, borderRadius: '8px', zIndex: 999, fontSize: i < 5 ? '0.50rem' : '0.7rem', cursor: 'pointer' }}>{b.label}</button>
        );
      })}
    </div>
  );
}
