import React from 'react';

export default function EscenarioVisual() {
  return (
    <>
      {/* IMAGEN DE FONDO FIJA */}
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
          objectPosition: 'center center',
          zIndex: 0
        }} 
      />

      {/* --- CONTENEDOR DE POSICIÓN DEL TIMÓN Y DESTELLOS --- */}
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

      {/* --- DRAGÓN ANIMADO (Efectos intactos) --- */}
      <img 
        src="./dragon.png" 
        alt="Dragón" 
        className="dragon-animado" 
        style={{ 
          position: 'absolute', 
          bottom: '140px', 
          right: '-180px', 
          width: '400px', 
          height: 'auto',
          zIndex: 800,
          pointerEvents: 'none'
        }} 
      />

      {/* --- BARRA INFERIOR --- */}
      
      {/* --- IMAGEN: MOTOS --- */}
      <img 
        src="./motos.png" 
        alt="Motos" 
        style={{ 
          position: 'absolute', 
          top: '23.5%',      /* Modifica aquí la posición vertical */
          left: '25%',     /* Modifica aquí la posición horizontal */
          width: '215px',  /* Modifica aquí el tamaño de las motos */
          height: 'auto',
          zIndex: 4,       /* Z-index alto para que esté bien al frente */
          pointerEvents: 'none'
        }} 
      />

      {/* --- NUEVO TEXTO DEL PREMIO (Ubicado debajo de las motos) --- */}
      <div
        style={{
          position: 'absolute',
          top: '52.5%',      /* Modifica aquí si deseas subirlo o bajarlo */
          left: '28%',     /* Modifica aquí la posición horizontal */
          zIndex: 15,
          fontSize: '10px',
          fontWeight: '900',
          fontFamily: "'Trebuchet MS', sans-serif",
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          background: 'linear-gradient(180deg, rgba(8, 25, 45, 0.95) 0%, rgba(2, 10, 20, 0.98) 100%)',
          border: '1px solid #FFD700',
          borderRadius: '20px',
          padding: '1px 12px',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.6), inset 0 0 6px rgba(255, 215, 0, 0.4)',
          textShadow: '0 0 6px #FFD700, 0 2px 3px #000',
          pointerEvents: 'none'
        }}
      >
        🏆 2° premio 200 soles 🏆
      </div>
      <div
        style={{
          position: 'absolute',
          top: '47%',      /* Modifica aquí si deseas subirlo o bajarlo */
          left: '19%',     /* Modifica aquí la posición horizontal */
          zIndex: 15,
          fontSize: '12px',
          fontWeight: '900',
          fontFamily: "'Trebuchet MS', sans-serif",
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          background: 'linear-gradient(180deg, rgba(8, 25, 45, 0.95) 0%, rgba(2, 10, 20, 0.98) 100%)',
          border: '1px solid #FFD700',
          borderRadius: '20px',
          padding: '3px 12px',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.6), inset 0 0 6px rgba(255, 215, 0, 0.4)',
          textShadow: '0 0 6px #FFD700, 0 2px 3px #000',
          pointerEvents: 'none'
        }}
      >
        🏆 1er Premio: Una Moto Lineal 🏆
      </div>
      <div
        style={{
          position: 'absolute',
          top: '57.5%',      /* Modifica aquí si deseas subirlo o bajarlo */
          left: '23%',     /* Modifica aquí la posición horizontal */
          zIndex: 9,
          fontSize: '9px',
          fontWeight: '900',
          fontFamily: "'Trebuchet MS', sans-serif",
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          background: 'linear-gradient(180deg, rgba(8, 25, 45, 0.95) 0%, rgba(2, 10, 20, 0.98) 100%)',
          border: '1px solid #FFD700',
          borderRadius: '20px',
          padding: '0.5px 12px',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.6), inset 0 0 6px rgba(255, 215, 0, 0.4)',
          textShadow: '0 0 6px #FFD700, 0 2px 3px #000',
          pointerEvents: 'none'
        }}
      >
        🏆3er Premio: Una Caja de cerveza🏆
      </div>
      

      {/* --- LOGO EN TEXTO EDITABLE: PLAYA DORADA (Configurado en 2 renglones) --- */}
      <div
        style={{
          position: 'absolute',
          top: '8%',         /* Modifica aquí la posición vertical general */
          left: '3%',        /* Modifica aquí la posición horizontal */
          zIndex: 30,
          fontFamily: "'Impact', 'Arial Black', sans-serif",
          fontSize: '22px',  /* Modifica el tamaño general de la letra */
          lineHeight: '1.1', /* Espaciado ajustable entre los dos renglones */
          letterSpacing: '2px',
          textTransform: 'uppercase',
          background: 'linear-gradient(180deg, #FFF6B7 0%, #F6D365 40%, #FDA085 70%, #A85507 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(2px 3px 4px rgba(0, 0, 0, 0.9)) drop-shadow(0px 0px 8px rgba(255, 215, 0, 0.5))',
          userSelect: 'none',
          pointerEvents: 'none',
          textAlign: 'left'
        }}
      >
        <div>PLAYA</div>
        <div>DORADA</div>
      </div>

      {/* ESTILOS EXCLUSIVOS DEL ESCENARIO VISUAL */}
      <style>{`
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
        .imagen-timon { width: 100%; height: 100%; display: block; object-fit: contain; pointer-events: none; }
            
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
      `}</style>
    </>
  );
}