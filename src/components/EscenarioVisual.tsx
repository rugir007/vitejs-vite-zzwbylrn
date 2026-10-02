import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TotalImagenes = 27;
// CAMBIAR TIEMPO: Por ahora en 3 minutos para producción.
const INTERVALO_TIEMPO = 3 * 60 * 1000;

export default function EscenarioVisual() {
  const [sorteo, setSorteo] = useState<any>(null);
  const [imagenActual, setImagenActual] = useState(1);
  const [imagenSiguiente, setImagenSiguiente] = useState(2);
  const [mostrandoSiguiente, setMostrandoSiguiente] = useState(false);

  // Cargar datos del sorteo desde Supabase
  useEffect(() => {
    const fetchSorteo = async () => {
      try {
        const { data, error } = await supabase
          .from('sorteos')
          .select('*')
          .eq('estado', 'activo')
          .order('fecha_cierre', { ascending: true })
          .limit(1);

        if (!error && data && data.length > 0) {
          setSorteo(data[0]);
        } else {
          const { data: dataAll } = await supabase
            .from('sorteos')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);
          if (dataAll && dataAll.length > 0) {
            setSorteo(dataAll[0]);
          }
        }
      } catch (err) {
        console.error("Error al cargar los premios dinámicos:", err);
      }
    };

    fetchSorteo();
  }, []);

  // Lógica del fondo rotativo aleatorio con crossfade cruzado y suave
  useEffect(() => {
    const inicial1 = Math.floor(Math.random() * TotalImagenes) + 1;
    let inicial2;
    do {
      inicial2 = Math.floor(Math.random() * TotalImagenes) + 1;
    } while (inicial2 === inicial1);

    setImagenActual(inicial1);
    setImagenSiguiente(inicial2);

    const intervalo = setInterval(() => {
      // 1. Alternamos la capa activa para iniciar el cruce suave
      setMostrandoSiguiente((prev) => !prev);

      // 2. Esperamos a que la transición visual termine (3.5 segundos) para preparar la siguiente foto en la capa oculta
      setTimeout(() => {
        setImagenActual((prevActual) => {
          let nueva;
          do {
            nueva = Math.floor(Math.random() * TotalImagenes) + 1;
          } while (nueva === prevActual);
          return nueva;
        });
      }, 3500); // Debe coincidir con la duración de la transición CSS

    }, INTERVALO_TIEMPO);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <>
      {/* CAPA DE FONDO 1 */}
      <img 
        src={`./playa${imagenActual}.jpg`} 
        alt="Fondo Base" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 0,
          opacity: mostrandoSiguiente ? 0 : 1,
          transition: 'opacity 3.5s ease-in-out'
        }} 
      />

      {/* CAPA DE FONDO 2 (CRUZADA) */}
      <img 
        src={`./playa${imagenSiguiente}.jpg`} 
        alt="Fondo Transición" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 1,
          opacity: mostrandoSiguiente ? 1 : 0,
          transition: 'opacity 3.5s ease-in-out'
        }} 
      />

      {/* --- LOGO SECUNDARIO (ABAJO DERECHA) --- */}
      <img 
        src="./logo.png" 
        alt="Logo" 
        style={{ 
          position: 'absolute', 
          top: '59%',       
          left: '73%',       
          width: '130px',    
          height: 'auto',
          transform: 'rotate(0deg)', 
          zIndex: 1002,      
          pointerEvents: 'none'
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

      {/* --- DRAGÓN ANIMADO --- */}
      <img 
        src="./dragon.png" 
        alt="Dragón" 
        className="dragon-animado" 
        style={{ 
          position: 'absolute', 
          bottom: '230px', 
          right: '-170px', 
          width: '300px', 
          height: 'auto',
          zIndex: 800,
          pointerEvents: 'none'
        }} 
      />

      {/* --- MOTOS CON EFECTO DE RESPIRACIÓN Y DESLUMBRAMIENTO TURQUESA --- */}
      <img 
        src="./motos.png" 
        alt="Motos" 
        className="motos-animadas-turquesa"
        style={{ 
          position: 'absolute', 
          top: '20%',      
          left: '24%',     
          width: '215px',  
          height: 'auto',
          zIndex: 4,      
          pointerEvents: 'none'
        }} 
      />
      
      {/* --- 1ER PREMIO --- */}
      <div
        style={{
          position: 'absolute',
          top: '47%',          
          left: '50%',         
          transform: 'translateX(-50%)', 
          zIndex: 15,
          fontSize: '12px',
          fontWeight: '900',
          fontFamily: "'Trebuchet MS', 'Arial Black', sans-serif",
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          background: 'linear-gradient(180deg, rgba(8, 25, 45, 0.95) 0%, rgba(2, 10, 20, 0.98) 100%)',
          border: '1px solid #FFD700',
          borderRadius: '20px',
          padding: '3px 18px',
          minWidth: '180px',
          textAlign: 'center',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.6), inset 0 0 6px rgba(255, 215, 0, 0.4)',
          textShadow: '0 0 6px #FFD700, 0 2px 3px #000',
          pointerEvents: 'none'
        }}
      >
        🏆 1er Premio: {sorteo?.premio1_texto || 'Una Moto Lineal'} 🏆
      </div>

      {/* --- 2° PREMIO --- */}
      <div
        style={{
          position: 'absolute',
          top: '52.5%',        
          left: '50%',         
          transform: 'translateX(-50%)', 
          zIndex: 15,
          fontSize: '9px',
          fontWeight: '900',
          fontFamily: "'Trebuchet MS', 'Arial Black', sans-serif",
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          background: 'linear-gradient(180deg, rgba(8, 25, 45, 0.95) 0%, rgba(2, 10, 20, 0.98) 100%)',
          border: '1px solid #FFD700',
          borderRadius: '20px',
          padding: '0.3px 14px',
          minWidth: '150px',
          textAlign: 'center',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.6), inset 0 0 6px rgba(255, 215, 0, 0.4)',
          textShadow: '0 0 6px #FFD700, 0 2px 3px #000',
          pointerEvents: 'none'
        }}
      >
        🏆 2° Premio: {sorteo?.premio2_texto || '200 soles'} 🏆
      </div>

      {/* --- 3ER PREMIO --- */}
      <div
        style={{
          position: 'absolute',
          top: '57%',          
          left: '50%',         
          transform: 'translateX(-50%)', 
          zIndex: 9,
          fontSize: '9px',
          fontWeight: '900',
          fontFamily: "'Trebuchet MS', 'Arial Black', sans-serif",
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#FFFFFF',
          background: 'linear-gradient(180deg, rgba(8, 25, 45, 0.95) 0%, rgba(2, 10, 20, 0.98) 100%)',
          border: '1px solid #FFD700',
          borderRadius: '20px',
          padding: '0.3px 14px',
          minWidth: '150px',
          textAlign: 'center',
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.6), inset 0 0 6px rgba(255, 215, 0, 0.4)',
          textShadow: '0 0 6px #FFD700, 0 2px 3px #000',
          pointerEvents: 'none'
        }}
      >
        🏆 3er Premio: {sorteo?.premio3_texto || 'Una Caja de Cerveza'} 🏆
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

        .motos-animadas-turquesa { 
          animation: respiracion-motos 5s infinite ease-in-out; 
        }
        @keyframes respiracion-motos {
          0%, 100% { 
            transform: scale(1); 
            filter: brightness(1) drop-shadow(0 0 6px rgba(0, 229, 255, 0.7)); 
          }
          50% { 
            transform: scale(1.07); 
            filter: brightness(1.15) drop-shadow(0 0 16px rgba(0, 229, 255, 1)); 
          }
        }
      `}</style>
    </>
  );
}