import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface ModalGeneralProps {
  modalAbierto: string | null;
  onClose: () => void;
  esModoEnVivo: boolean;
  setEsModoEnVivo: (valor: boolean) => void;
  onIrAComprarTicket?: (sorteo: Sorteo) => void;
  tiempoRestante: {
    dias: number | string;
    horas: number | string;
    minutos: number | string;
    segundos: number | string;
  };
}

interface Sorteo {
  id: string | number;
  nombre: string;
  precio: number;
  fecha_cierre: string;
  multimedia_url?: string;
  estado?: string;
  descripcion?: string;
  updated_at?: string;
  premio1_texto?: string;
  premio2_texto?: string;
  premio3_texto?: string;
  premio1_imagen?: string;
  premio2_imagen?: string;
  premio3_imagen?: string;
  imagen_premio1?: string;
  imagen_premio2?: string;
  imagen_premio3?: string;
  lugar_de_sorteo?: string;
  lugar?: string;
}

interface MensajeChat {
  id: string | number;
  nombre: string;
  mensaje: string;
  created_at?: string;
}

export default function ModalGeneral({
  modalAbierto,
  onClose,
  esModoEnVivo,
  setEsModoEnVivo,
  onIrAComprarTicket,
  tiempoRestante
}: ModalGeneralProps) {
  
  if (!modalAbierto || modalAbierto === 'COMPRAR TICKET') return null;

  const [accesoDirectoConcedido, setAccesoDirectoConcedido] = useState(false);

  // Estados para el registro de la comunidad (Nombre y Celular)
  const [nombreUsuarioComunidad, setNombreUsuarioComunidad] = useState('');
  const [celularUsuarioComunidad, setCelularUsuarioComunidad] = useState('');
  const [registradoEnComunidad, setRegistradoEnComunidad] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');

  useEffect(() => {
    if (modalAbierto === 'EN VIVO') {
      setAccesoDirectoConcedido(false);
    } else {
      setAccesoDirectoConcedido(true);
    }

    const guardadoNombre = sessionStorage.getItem('nombre_comunidad');
    const guardadoCelular = sessionStorage.getItem('celular_comunidad');
    if (guardadoNombre && guardadoCelular) {
      setNombreUsuarioComunidad(guardadoNombre);
      setCelularUsuarioComunidad(guardadoCelular);
      setRegistradoEnComunidad(true);
    } else {
      setRegistradoEnComunidad(false);
    }
    setErrorValidacion('');
  }, [modalAbierto]);

  const [sorteosLista, setSorteosLista] = useState<Sorteo[]>([]);
  const [cargandoSorteos, setCargandoSorteos] = useState(false);
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState<Sorteo | null>(null);

  const [sorteoCronometro, setSorteoCronometro] = useState<any>(null);
  const [mensajesChat, setMensajesChat] = useState<MensajeChat[]>([]);
  const [urlTransmisionEnVivo, setUrlTransmisionEnVivo] = useState<string>('');
  const [tiempoAnticipacion, setTiempoAnticipacion] = useState<string>('1 hora antes');

  useEffect(() => {
    if (modalAbierto === 'SORTEOS') {
      setSorteoSeleccionado(null);
      
      const fetchSorteos = async () => {
        setCargandoSorteos(true);
        try {
          const { data, error } = await supabase
            .from('sorteos')
            .select('*')
            .order('id', { ascending: false });
          
          if (!error && data) {
            const fechaActual = new Date();
            const sorteosFiltrados = data.filter(s => {
              if (s.estado !== 'finalizado') return true;
              if (!s.updated_at) return false; 
              const fechaFin = new Date(s.updated_at);
              const diferenciaDias = (fechaActual.getTime() - fechaFin.getTime()) / (1000 * 3600 * 24);
              return diferenciaDias <= 3;
            });
            setSorteosLista(sorteosFiltrados);
          }
        } catch (err) {
          console.error("Error al cargar sorteos:", err);
        } finally {
          setCargandoSorteos(false);
        }
      };

      fetchSorteos();
    }
  }, [modalAbierto]);

  useEffect(() => {
    const esEnVivoOVivoComunidad = modalAbierto === 'COMUNIDAD' || modalAbierto === 'EN VIVO';
    if (!esEnVivoOVivoComunidad) return;

    const cargarDatosComunidadYEnVivo = async () => {
      const { data: msgs } = await supabase
        .from('chat_comunidad')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (msgs) {
        setMensajesChat(msgs.reverse());
      }

      if (modalAbierto === 'EN VIVO') {
        const { data: vivoData, error: vivoErr } = await supabase
          .from('transmisiones_en_vivo')
          .select('url_video')
          .eq('activa', true)
          .limit(1);

        if (!vivoErr && vivoData && vivoData.length > 0) {
          setUrlTransmisionEnVivo(vivoData[0].url_video);
        }
      }
    };

    cargarDatosComunidadYEnVivo();
    const intervaloSync = setInterval(cargarDatosComunidadYEnVivo, 1500);

    return () => clearInterval(intervaloSync);
  }, [modalAbierto, accesoDirectoConcedido, registradoEnComunidad]);

  useEffect(() => {
    const modalesValidos = ['CRONOMETRO', 'ORO', 'PLATINUM', 'SILVER', 'PREMIO 1', 'PREMIO 2', 'PREMIO 3'];
    if (!modalesValidos.includes(modalAbierto || '')) return;

    const fetchProximoSorteo = async () => {
      try {
        const { data, error } = await supabase
          .from('sorteos')
          .select('*')
          .eq('estado', 'activo')
          .order('fecha_cierre', { ascending: true })
          .limit(1);

        if (!error && data && data.length > 0) {
          setSorteoCronometro(data[0]);
        }
      } catch (err) {
        console.error("Error al obtener sorteo:", err);
      }
    };

    fetchProximoSorteo();
  }, [modalAbierto]);

  const colorBorde = modalAbierto === 'EN VIVO' ? '#ffcc00' : '#FFD700';
  const tieneDestelloVerde = modalAbierto === 'EN VIVO' && !accesoDirectoConcedido;

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'rgba(5, 5, 5, 0.90)', 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden'
      }} 
      onClick={onClose}
    >
      <style>{`
        @keyframes borderGlowGreen { 
          0% { box-shadow: 0 0 12px #ffcc00, inset 0 0 10px rgba(255,204,0,0.3); } 
          50% { box-shadow: 0 0 28px #00ffcc, 0 0 12px #ffcc00, inset 0 0 15px rgba(0,255,204,0.4); } 
          100% { box-shadow: 0 0 12px #ffcc00, inset 0 0 10px rgba(255,204,0,0.3); } 
        }
        @keyframes latido-completo {
          0% { transform: scale(0.96); }
          50% { transform: scale(1.04); }
          100% { transform: scale(0.96); }
        }
        @keyframes latido-rojo-nido {
          0% { transform: scale(0.92); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(0.92); opacity: 0.85; }
        }
        .elemento-latiendo {
          animation: latido-completo 1.2s infinite ease-in-out;
        }
        .bloque-rojo-latido {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          animation: latido-rojo-nido 1.1s infinite ease-in-out;
        }
        .punto-rojo-nido {
          width: 8px;
          height: 8px;
          background-color: #ff0000;
          border-radius: 50%;
          display: inline-block;
        }
        .marco-con-brillo-verde {
          animation: borderGlowGreen 3s infinite ease-in-out;
        }
        .boton-cerrar-rojo:hover {
          background: #ff3300 !important;
          transform: scale(1.05);
        }
      `}</style>

      {/* CONTENEDOR PRINCIPAL */}
      <div 
        className={tieneDestelloVerde ? "marco-con-brillo-verde" : ""}
        style={{ 
          width: '92vw', 
          maxWidth: '580px', 
          maxHeight: '92vh', 
          border: `2px solid ${colorBorde}`, 
          borderRadius: '14px', 
          background: 'linear-gradient(145deg, #111113 0%, #08080a 100%)', 
          padding: '16px 20px', 
          color: '#FFF', 
          textAlign: 'center', 
          overflow: 'hidden',
          boxSizing: 'border-box', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          margin: '10px',
          boxShadow: !tieneDestelloVerde ? '0 0 15px rgba(255, 204, 0, 0.25)' : undefined
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* BOTÓN FLOTANTE DE CIERRE */}
        <button
          onClick={onClose}
          className="boton-cerrar-rojo"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(217, 30, 24, 0.9)',
            color: '#fff',
            border: '2px solid #ffcc00',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease'
          }}
          title="Cerrar modal"
        >
          ✕
        </button>

        {/* CABECERA */}
        {modalAbierto === 'EN VIVO' && !accesoDirectoConcedido ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', textAlign: 'center', gap: '6px' }}>
            <span style={{ color: '#ffcc00', fontSize: '1.45rem', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', textShadow: '0 0 12px rgba(255,204,0,0.5)' }}>
              PLAYA DORADA
            </span>
            <div className="bloque-rojo-latido">
              <span className="punto-rojo-nido"></span>
              <span style={{ color: '#ff0000', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                EN VIVO
              </span>
            </div>
          </div>
        ) : modalAbierto === 'EN VIVO' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '12px', paddingRight: '35px', textAlign: 'left', gap: '4px' }}>
            <span style={{ color: '#ffcc00', fontSize: '1.25rem', fontWeight: '900', letterSpacing: '1.2px', textTransform: 'uppercase', textShadow: '0 0 10px rgba(255,204,0,0.4)' }}>
              PLAYA DORADA
            </span>
            <div className="bloque-rojo-latido">
              <span className="punto-rojo-nido"></span>
              <span style={{ color: '#ff0000', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                EN VIVO
              </span>
            </div>
          </div>
        ) : modalAbierto === 'COMUNIDAD' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', paddingRight: '35px', textAlign: 'center', width: '100%' }}>
            <div style={{ color: colorBorde, fontSize: '0.95rem', fontWeight: 'bold', lineHeight: '1.2', width: '100%', textAlign: 'center' }}>
              ...tienes frio??? el chat esta que arde!!!
            </div>
            <div style={{ color: colorBorde, fontSize: '0.95rem', fontWeight: 'bold', lineHeight: '1.2', width: '100%', textAlign: 'center', marginTop: '2px' }}>
              ¡entra ya!
            </div>
          </div>
        ) : (
          <h2 style={{ color: colorBorde, marginBottom: '10px', fontSize: '1.2rem', paddingRight: '35px', fontWeight: 'bold' }}>
            {modalAbierto}
          </h2>
        )}

        {/* 1. MODO EN VIVO */}
        {modalAbierto === 'EN VIVO' && !accesoDirectoConcedido ? (
          <div style={{ textAlign: 'center', padding: '15px 10px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '18px' }}>
            
            <div style={{ 
              background: 'rgba(255, 204, 0, 0.05)', 
              border: '1.5px solid rgba(255, 204, 0, 0.25)', 
              borderRadius: '12px', 
              padding: '22px 18px', 
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
            }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🍀</span>
              <p style={{ color: '#ffcc00', fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                ¡Mucha suerte en el sorteo!
              </p>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: 0, lineHeight: '1.5' }}>
                Playa Dorada agradece tu preferencia. Disfruta de la transmisión y te deseamos muchísima suerte. ✨
              </p>
            </div>

            <button 
              onClick={() => setAccesoDirectoConcedido(true)}
              className="elemento-latiendo"
              style={{ 
                width: '100%', 
                maxWidth: '320px', 
                padding: '14px 20px', 
                background: 'linear-gradient(135deg, #ff9900 0%, #ffcc00 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                color: '#111', 
                fontWeight: '900', 
                cursor: 'pointer', 
                fontSize: '1rem', 
                textTransform: 'uppercase', 
                boxShadow: '0 0 20px rgba(255,204,0,0.5)',
                letterSpacing: '0.8px'
              }}
            >
              🎉 Únete a la fiesta 🚀
            </button>

          </div>
        ) : modalAbierto === 'EN VIVO' && accesoDirectoConcedido ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '540px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: '10px', overflow: 'hidden' }}>
              
              <div style={{ width: '100%', height: '240px', background: '#000', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid rgba(255, 204, 0, 0.4)', flexShrink: 0 }}>
                {urlTransmisionEnVivo ? (
                  <iframe
                    src={urlTransmisionEnVivo}
                    title="Transmisión en Vivo"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ffcc00', fontSize: '0.85rem', fontWeight: 'bold', padding: '10px', textAlign: 'center' }}>
                    ⚠️ Transmisión activa, pero falta configurar el enlace del video en Supabase.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '120px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    background: 'rgba(26, 26, 30, 0.75)', 
                    backdropFilter: 'blur(6px)',
                    padding: '8px', 
                    borderRadius: '8px', 
                    flex: 1, 
                    overflowY: 'auto', 
                    textAlign: 'left', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    marginBottom: '8px'
                  }}
                >
                  {mensajesChat.map((m) => {
                    const nombreMos = (m.nombre || 'Participante').substring(0, 15);
                    return (
                      <div key={m.id || Math.random()} style={{ background: 'rgba(45, 45, 52, 0.65)', padding: '5px 8px', borderRadius: '4px', borderLeft: '3px solid #ffcc00', wordBreak: 'break-word' }}>
                        <span style={{ color: '#ffcc00', fontSize: '0.78rem', fontWeight: 'bold', marginRight: '6px' }}>{nombreMos}:</span>
                        <span style={{ color: '#e2e8f0', fontSize: '0.80rem' }}>{m.mensaje}</span>
                      </div>
                    );
                  })}
                </div>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const inputEl = document.getElementById('inputMensajeChat') as HTMLInputElement;
                    const textoAEscriber = inputEl?.value.trim() || '';
                    if (!textoAEscriber) return;

                    const mensajeCortado = textoAEscriber.substring(0, 200);
                    const { error } = await supabase
                      .from('chat_comunidad')
                      .insert([{ nombre: 'Participante', celular: '', mensaje: mensajeCortado }]);

                    if (!error && inputEl) {
                      inputEl.value = '';
                      const { data } = await supabase.from('chat_comunidad').select('*').order('created_at', { ascending: false }).limit(500);
                      if (data) setMensajesChat(data.reverse());
                    }
                  }}
                  style={{ display: 'flex', gap: '6px', flexShrink: 0 }}
                >
                  <input 
                    id="inputMensajeChat"
                    type="text" 
                    placeholder="Escribe un mensaje..."
                    maxLength={200}
                    style={{ flex: 1, padding: '9px', borderRadius: '6px', background: 'rgba(30, 30, 36, 0.85)', color: '#fff', border: '1px solid rgba(255,204,0,0.3)', fontSize: '0.85rem' }}
                  />
                  <button 
                    type="submit"
                    style={{ padding: '9px 16px', background: 'linear-gradient(135deg, #ff9900 0%, #ffcc00 100%)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#111', fontSize: '0.85rem' }}
                  >
                    Enviar
                  </button>
                </form>
              </div>

            </div>
          </div>
        ) : modalAbierto === 'COMUNIDAD' && !registradoEnComunidad ? (
          /* 2A. MODAL DE REGISTRO COMUNIDAD */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '360px', width: '100%', boxSizing: 'border-box', padding: '10px' }}>
            <div style={{ background: 'rgba(255, 204, 0, 0.05)', border: '1.5px solid rgba(255, 204, 0, 0.35)', borderRadius: '12px', padding: '16px 18px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>💬</span>
              <h3 style={{ color: '#FFD700', fontSize: '1.05rem', margin: '0 0 12px 0', fontWeight: 'bold' }}>Playa Dorada te da la bienvenida</h3>
              
              {errorValidacion && (
                <div style={{ background: 'rgba(255, 50, 50, 0.15)', border: '1px solid #ff4d4d', color: '#ff9999', padding: '6px', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '10px', textAlign: 'center' }}>
                  ⚠️ {errorValidacion}
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const nombreLimpio = nombreUsuarioComunidad.trim();
                  const celularLimpio = celularUsuarioComunidad.trim();

                  if (!nombreLimpio || !celularLimpio) {
                    setErrorValidacion('Por favor completa todos los campos.');
                    return;
                  }
                  if (nombreLimpio.length > 15) {
                    setErrorValidacion('El nombre no debe superar los 15 caracteres.');
                    return;
                  }
                  if (!celularLimpio.startsWith('9') || celularLimpio.length !== 9 || !/^\d+$/.test(celularLimpio)) {
                    setErrorValidacion('El celular debe tener 9 dígitos y empezar obligatoriamente con 9.');
                    return;
                  }

                  setErrorValidacion('');
                  sessionStorage.setItem('nombre_comunidad', nombreLimpio);
                  sessionStorage.setItem('celular_comunidad', celularLimpio);
                  setRegistradoEnComunidad(true);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}
              >
                <div>
                  <label style={{ display: 'block', color: '#ffcc00', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '3px' }}>
                    Tu nombre
                  </label>
                  <input 
                    type="text"
                    placeholder="Escribe tu nombre..."
                    value={nombreUsuarioComunidad}
                    onChange={(e) => setNombreUsuarioComunidad(e.target.value.slice(0, 15))}
                    maxLength={15}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#1a1a20', color: '#fff', border: '1px solid rgba(255,204,0,0.4)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ffcc00', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '3px' }}>
                    Celular
                  </label>
                  <input 
                    type="tel"
                    placeholder="Escribe tu celular..."
                    value={celularUsuarioComunidad}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setCelularUsuarioComunidad(val);
                    }}
                    maxLength={9}
                    style={{ width: '100%', padding: '9px', borderRadius: '6px', background: '#1a1a20', color: '#fff', border: '1px solid rgba(255,204,0,0.4)', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <button 
                  type="submit"
                  className="elemento-latiendo"
                  style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg, #ff9900 0%, #ffcc00 100%)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#111', fontSize: '0.95rem', marginTop: '6px', textTransform: 'uppercase' }}
                >
                  🎉 Únete a la fiesta 🚀
                </button>
              </form>
            </div>
          </div>
        ) : modalAbierto === 'COMUNIDAD' && registradoEnComunidad ? (
          /* 2B. MODO COMUNIDAD (CHAT LIBRE) */
          <div style={{ display: 'flex', flexDirection: 'column', height: '400px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <p style={{ fontSize: '0.80rem', color: '#ffcc00', margin: 0 }}>
                🔥 Conectado como: <b>{nombreUsuarioComunidad}</b>
              </p>
              <button 
                onClick={() => {
                  sessionStorage.removeItem('nombre_comunidad');
                  sessionStorage.removeItem('celular_comunidad');
                  setRegistradoEnComunidad(false);
                }}
                style={{ background: 'transparent', border: 'none', color: '#ff6b6b', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Cambiar datos
              </button>
            </div>

            <div 
              style={{ 
                background: 'rgba(26, 26, 30, 0.75)', 
                backdropFilter: 'blur(6px)',
                padding: '6px', 
                borderRadius: '8px', 
                flex: 1, 
                overflowY: 'auto', 
                textAlign: 'left', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                marginBottom: '8px'
              }}
            >
              {mensajesChat.map((m) => {
                const nombreMos = (m.nombre || 'Participante').substring(0, 15);
                return (
                  <div key={m.id || Math.random()} style={{ background: 'rgba(45, 45, 52, 0.65)', padding: '4px 8px', borderRadius: '4px', borderLeft: '3px solid #ffcc00', wordBreak: 'break-word' }}>
                    <span style={{ color: '#ffcc00', fontSize: '0.78rem', fontWeight: 'bold', marginRight: '6px' }}>{nombreMos}:</span>
                    <span style={{ color: '#fff', fontSize: '0.80rem' }}>{m.mensaje}</span>
                  </div>
                );
              })}
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const inputEl = document.getElementById('inputMensajeChatComunidad') as HTMLInputElement;
                const textoAEscriber = inputEl?.value.trim() || '';
                if (!textoAEscriber) return;

                const mensajeCortado = textoAEscriber.substring(0, 200);
                const { error } = await supabase
                  .from('chat_comunidad')
                  .insert([{ nombre: nombreUsuarioComunidad, celular: celularUsuarioComunidad, mensaje: mensajeCortado }]);

                if (!error && inputEl) {
                  inputEl.value = '';
                  const { data } = await supabase.from('chat_comunidad').select('*').order('created_at', { ascending: false }).limit(500);
                  if (data) setMensajesChat(data.reverse());
                }
              }}
              style={{ display: 'flex', gap: '6px', flexShrink: 0 }}
            >
              <input 
                id="inputMensajeChatComunidad"
                type="text" 
                placeholder="Escribe tu mensaje..."
                maxLength={200}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', background: 'rgba(30, 30, 36, 0.85)', color: '#fff', border: '1px solid rgba(255,204,0,0.3)', fontSize: '0.80rem' }}
              />
              <button 
                type="submit"
                style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #ff9900 0%, #ffcc00 100%)', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#111', fontSize: '0.80rem' }}
              >
                Enviar
              </button>
            </form>
          </div>
        ) : modalAbierto === 'SORTEOS' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '400px', width: '100%', boxSizing: 'border-box', overflow: 'hidden', textAlign: 'left' }}>
            {cargandoSorteos ? (
              <p style={{ textAlign: 'center', color: '#ffcc00', marginTop: '40px' }}>Cargando sorteos...</p>
            ) : sorteoSeleccionado ? (
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                <button 
                  onClick={() => setSorteoSeleccionado(null)}
                  style={{ background: 'transparent', border: '1px solid #ffcc00', color: '#ffcc00', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px', fontSize: '0.8rem' }}
                >
                  ← Volver a la lista
                </button>
                <h3 style={{ color: '#FFD700', fontSize: '1.1rem', margin: '0 0 8px 0' }}>{sorteoSeleccionado.nombre}</h3>
                <p style={{ fontSize: '0.85rem', color: '#ccc', margin: '0 0 10px 0' }}>{sorteoSeleccionado.descripcion || 'Sorteo oficial autorizado.'}</p>
                <p style={{ fontSize: '0.85rem', color: '#ffcc00', margin: '0 0 15px 0' }}>Precio por ticket: S/ {sorteoSeleccionado.precio}</p>
                {onIrAComprarTicket && (
                  <button 
                    onClick={() => onIrAComprarTicket(sorteoSeleccionado)}
                    style={{ width: '100%', padding: '10px', background: '#25D366', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Comprar Ticket para este Sorteo
                  </button>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {sorteosLista.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#aaa', marginTop: '30px' }}>No hay sorteos disponibles en este momento.</p>
                ) : (
                  sorteosLista.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setSorteoSeleccionado(s)}
                      style={{ background: 'rgba(30, 30, 36, 0.8)', border: '1px solid rgba(255,204,0,0.3)', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <h4 style={{ margin: '0 0 4px 0', color: '#FFD700', fontSize: '0.95rem' }}>{s.nombre}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>Cierre: {new Date(s.fecha_cierre).toLocaleDateString()} - S/ {s.precio}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : modalAbierto === 'TESORO' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden', padding: '20px' }}>
            <h2 style={{ color: '#FFD700', margin: '0 0 10px 0', fontSize: '20px' }}>¡Tesoro Encontrado!</h2>
            <p style={{ color: '#cbd5e1', fontSize: '14px', textAlign: 'center', margin: '0 0 20px 0' }}>
              Has abierto el cofre del tesoro. ¡Pronto habrá más sorpresas aquí!
            </p>
          </div>
        ) : modalAbierto === 'ORO' || modalAbierto === 'PLATINUM' || modalAbierto === 'SILVER' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '340px', minHeight: '340px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden', padding: '15px 10px', textAlign: 'center', justifyContent: 'space-between' }}>
            
            <h2 style={{ color: '#FFD700', fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 10px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {modalAbierto === 'ORO' ? 'Gold Prize' :
               modalAbierto === 'PLATINUM' ? 'Platinum Prize' : 
               'Silver Prize'}
            </h2>
            <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '600', margin: '0 0 10px 0', textTransform: 'capitalize' }}>
                {modalAbierto === 'ORO' || modalAbierto === 'PREMIO 1' ? (sorteoCronometro?.premio1_texto || '') :
                 modalAbierto === 'PLATINUM' || modalAbierto === 'PREMIO 2' ? (sorteoCronometro?.premio2_texto || '') : 
                 (sorteoCronometro?.premio3_texto || '')}
              </p>

              {(() => {
                const urlBruta = modalAbierto === 'ORO' || modalAbierto === 'PREMIO 1' 
                                 ? (sorteoCronometro?.premio1_imagen || sorteoCronometro?.imagen_premio1) :
                                 modalAbierto === 'PLATINUM' || modalAbierto === 'PREMIO 2' 
                                 ? (sorteoCronometro?.premio2_imagen || sorteoCronometro?.imagen_premio2) : 
                                 (sorteoCronometro?.premio3_imagen || sorteoCronometro?.imagen_premio3);
                
                let urlLimpia = '';
                if (urlBruta && typeof urlBruta === 'string') {
                  if (urlBruta.includes('](')) {
                    urlLimpia = urlBruta.split('](')[0].replace('[', '').trim();
                  } else {
                    urlLimpia = urlBruta.trim();
                  }
                }

                if (!urlLimpia) return null;

                return (
                  <div className="animacion-premio" style={{ width: '100%', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={urlLimpia} 
                      alt="Premio del Sorteo" 
                      style={{ width: '100%', maxHeight: '190px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #FFD700', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }} 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                );
              })()}
            </div>
            <button 
              onClick={() => onClose()} 
              className="boton-destello" 
              style={{ width: '100%', padding: '12px', background: '#00B4D8', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }}
            >
              ¡Genial, continuar!
            </button>
          </div>
        ) : modalAbierto === 'WHATSAPP' ? (
          <div>
            <p style={{ marginBottom: '20px' }}>💬 Comunícate directamente con nuestro equipo de atención al cliente.</p>
            <button 
              onClick={() => window.open('https://wa.me/51976610071?text=Hola,%20deseo%20más%20información', '_blank')} 
              className="boton-destello" 
              style={{ width: '100%', padding: '14px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '1.0rem', cursor: 'pointer' }}
            >
              Abrir WhatsApp Oficial
            </button>
          </div>
        ) : modalAbierto === 'CRONOMETRO' ? (
          <div style={{ textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <p style={{ fontSize: '0.85rem', color: '#00d4ff', margin: '0 0 5px 0' }}>
                ⏳ SORTEO: <b style={{ color: '#FFD700' }}>{sorteoCronometro?.nombre || 'Gran Sorteo Oficial'}</b>
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', background: '#111', padding: '10px', borderRadius: '10px', border: '1px solid #FFD700' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', color: '#FFD700', fontWeight: 'bold' }}>{tiempoRestante?.dias ?? 0}</span>
                  <span style={{ fontSize: '0.65rem', display: 'block', color: '#aaa' }}>DÍAS</span>
                </div>
                <span style={{ fontSize: '1.2rem', color: '#FFD700' }}>:</span>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', color: '#FFD700', fontWeight: 'bold' }}>{tiempoRestante?.horas ?? 0}</span>
                  <span style={{ fontSize: '0.65rem', display: 'block', color: '#aaa' }}>HRS</span>
                </div>
                <span style={{ fontSize: '1.2rem', color: '#FFD700' }}>:</span>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', color: '#FFD700', fontWeight: 'bold' }}>{tiempoRestante?.minutos ?? 0}</span>
                  <span style={{ fontSize: '0.65rem', display: 'block', color: '#aaa' }}>MIN</span>
                </div>
                <span style={{ fontSize: '1.2rem', color: '#FFD700' }}>:</span>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.2rem', color: '#ff6b6b', fontWeight: 'bold' }}>{tiempoRestante?.segundos ?? 0}</span>
                  <span style={{ fontSize: '0.65rem', display: 'block', color: '#aaa' }}>SEG</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#161616', padding: '12px', borderRadius: '10px', border: '1px solid #444', fontSize: '0.9rem', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 6px 0' }}>📍 <strong>Lugar:</strong> {sorteoCronometro?.lugar_de_sorteo || sorteoCronometro?.lugar || 'Plaza Pecuaria, Bambamarca / Transmisión en Vivo'}</p>
              <p style={{ margin: '0 0 6px 0' }}>📅 <strong>Fecha Cierre:</strong> {sorteoCronometro?.fecha_cierre ? new Date(sorteoCronometro.fecha_cierre).toLocaleDateString() : 'Por definir'}</p>
              <p style={{ margin: 0 }}>⏰ <strong>Hora:</strong> {sorteoCronometro?.fecha_cierre ? new Date(sorteoCronometro.fecha_cierre).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '16:00 horas'}</p>
            </div>

            <h4 style={{ color: '#00d4ff', fontSize: '0.95rem', margin: '10px 0 8px 0' }}>🎁 PREMIOS PRINCIPALES</h4>
            
            <ul style={{ textAlign: 'left', fontSize: '0.88rem', color: '#ddd', paddingLeft: '20px', marginBottom: '15px' }}>
              <li>1er Premio: {sorteoCronometro?.premio1_texto || 'Motocicleta 0km'}</li>
              <li>2do Premio: {sorteoCronometro?.premio2_texto || 'Laptop Ingeniería'}</li>
              <li>3er Premio: {sorteoCronometro?.premio3_texto || 'Kit de Construcción'}</li>
            </ul>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '0.82rem', color: '#00d4ff', display: 'block', marginBottom: '5px' }}>
                🔔 ¿Cuándo deseas que te avisemos por WhatsApp?
              </label>
              <select 
                value={tiempoAnticipacion}
                onChange={(e) => setTiempoAnticipacion(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444', fontSize: '0.9rem', boxSizing: 'border-box' }}
              >
                <option value="1 hora antes">Avisarme 1 hora antes</option>
                <option value="20 minutos antes">Avisarme 20 minutos antes</option>
                <option value="10 minutos antes">Avisarme 10 minutos antes</option>
                <option value="Exactamente al inicio del evento">🔴 Exactamente al inicio del evento</option>
              </select>
            </div>

            <button 
              onClick={() => {
                const nombreSorteoActual = sorteoCronometro?.nombre || 'Gran Sorteo Oficial';
                const lugarActual = sorteoCronometro?.lugar_de_sorteo || sorteoCronometro?.lugar || 'Por definir';
                const premiosActuales = `1°: ${sorteoCronometro?.premio1_texto || ''}, 2°: ${sorteoCronometro?.premio2_texto || ''}, 3°: ${sorteoCronometro?.premio3_texto || ''}`;
                
                const textoMensaje = encodeURIComponent(
                  `Hola, deseo programar mi recordatorio para el sorteo: *${nombreSorteoActual}*.\n` +
                  `📍 Lugar: ${lugarActual}\n` +
                  `🎁 Premios: ${premiosActuales}\n` +
                  `⏰ Anticipación seleccionada: *${tiempoAnticipacion}*. ¡Quedo atento!`
                );
                window.open(`https://wa.me/51976610071?text=${textoMensaje}`, '_blank');
              }} 
              className="boton-destello" 
              style={{ width: '100%', padding: '12px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📱 PROGRAMAR RECORDATORIO WHATSAPP
            </button>
          </div>
        ) : modalAbierto === 'MIS TICKETS' ? (
          <MisTicketsBuscador />
        ) : modalAbierto === 'GANADORES' ? (
          <GanadoresSorteos />
        ) : modalAbierto === 'NOSOTROS' ? (
          <div style={{ textAlign: 'left', fontSize: '0.92rem', color: '#ddd' }}>
            <p style={{ color: '#FFD700', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
              🌟 ¿QUIÉNES SOMOS? - PLAYA DORADA
            </p>

            <div style={{ background: '#161616', border: '1px solid #444', borderRadius: '12px', padding: '16px', marginBottom: '15px', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 12px 0', textAlign: 'justify' }}>
                <b>Playa Dorada</b> es una iniciativa de entretenimiento y eventos promocionales impulsada por <b>Corporación Rodríguez</b>. Nacemos con el firme propósito de brindar momentos de alegría, sano esparcimiento y grandes experiencias a nuestra comunidad a través de eventos oficiales y sorteos presenciales y digitales.
              </p>
              <p style={{ margin: 0, textAlign: 'justify' }}>
                Respaldados por nuestros centros de recreación y espacios autorizados —como el <b>Recreo Campestre La Playa en Chota</b> y nuestra sede en <b>Bambamarca</b>— garantizamos total transparencia, seriedad y compromiso en cada una de nuestras actividades y sorteos oficiales.
              </p>
            </div>

            <h4 style={{ color: '#00d4ff', fontSize: '0.95rem', margin: '15px 0 8px 0' }}>🎯 Nuestra Misión y Compromiso</h4>
            <div style={{ background: '#161616', border: '1px solid #444', borderRadius: '12px', padding: '14px', marginBottom: '15px' }}>
              <p style={{ margin: 0, color: '#ccc', fontSize: '0.88rem', lineHeight: '1.4' }}>
                Fomentar la confianza y la legalidad en cada dinámica, premiando la fidelidad de nuestros participantes mediante eventos públicos, transparentes y debidamente respaldados por nuestra organización.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px dashed #FFD700', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '0.82rem', color: '#FFD700' }}>
              ✨ <i>¡Gracias por ser parte de la gran familia de Playa Dorada y Corporación Rodríguez!</i>
            </div>
          </div>
        ) : modalAbierto === 'CONTACTO' ? (
          <div style={{ textAlign: 'left', fontSize: '0.92rem', color: '#ddd' }}>
            <p style={{ color: '#FFD700', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
              🏢 CENTRO DE ATENCIÓN Y SOPORTE OFICIAL
            </p>

            <div style={{ background: '#161616', border: '1px solid #444', borderRadius: '12px', padding: '14px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 8px 0' }}>🏷️ <b>Nombre Comercial:</b> Playa Dorada</p>
              <p style={{ margin: '0 0 8px 0' }}>🛠️ <b>Sostén Empresarial:</b> Corporación Rodríguez</p>
              <p style={{ margin: '0 0 8px 0' }}>👤 <b>Responsable:</b> Ing. José A. Rodríguez Ortiz (Gerente General)</p>
              <p style={{ margin: '0 0 8px 0' }}>📧 <b>Correo Electrónico:</b> playadorada@gmail.com</p>
              <p style={{ margin: 0 }}>🌐 <b>Sitio Web:</b> www.playadorada.com.pe</p>
            </div>

            <h4 style={{ color: '#00d4ff', fontSize: '0.95rem', margin: '15px 0 8px 0' }}>📍 Locales y Puntos de Sorteo</h4>
            <div style={{ background: '#161616', border: '1px solid #444', borderRadius: '12px', padding: '14px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 8px 0' }}>🏖️ <b>Chota:</b> Recreo Campestre La Playa (Rosa Regalado 570)</p>
              <p style={{ margin: 0 }}>📍 <b>Bambamarca:</b> Av. Túpac Amaru S/N</p>
            </div>

            <h4 style={{ color: '#00d4ff', fontSize: '0.95rem', margin: '15px 0 8px 0' }}>⏰ Horarios de Atención</h4>
            <div style={{ background: '#161616', border: '1px solid #444', borderRadius: '12px', padding: '14px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 6px 0' }}>📅 <b>Lunes a Sábado:</b> 9:00 a.m. – 7:00 p.m.</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#aaa' }}>Domingos: Atención orientada a eventos y transmisiones en vivo de los sorteos.</p>
            </div>

            <h4 style={{ color: '#00d4ff', fontSize: '0.95rem', margin: '15px 0 8px 0' }}>📞 Teléfonos de Contacto</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              <button 
                onClick={() => window.open('https://wa.me/51976610071?text=Hola,%20deseo%20soporte%20o%20consultar%20sobre%20los%20sorteos', '_blank')}
                style={{ width: '100%', padding: '10px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                📱 Llamar / WhatsApp Principal: +51 976 610 071
              </button>
            </div>

            <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px dashed #FFD700', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '0.82rem', color: '#FFD700' }}>
              ✨ <i>Garantía, transparencia y seriedad en cada uno de nuestros sorteos oficiales.</i>
            </div>
          </div>
        ) : modalAbierto === 'SORTEOS' && !sorteoSeleccionado ? (
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.85rem', color: '#00d4ff', textAlign: 'center', marginBottom: '15px' }}>👇 Selecciona un sorteo para ver su información y premios:</p>
            {cargandoSorteos ? (
              <p style={{ textAlign: 'center', color: '#FFD700', padding: '20px' }}>Cargando sorteos...</p>
            ) : sorteosLista.length > 0 ? (
              sorteosLista.map((sorteo) => {
                const estadoSorteo = sorteo.estado ? sorteo.estado.toLowerCase() : 'activo';
                const colorEstado = 
                  estadoSorteo === 'activo' ? '#25D366' : 
                  estadoSorteo === 'finalizado' ? '#FFD700' : '#ff6b6b';

                return (
                  <div 
                    key={sorteo.id} 
                    className="tarjeta-sorteo"
                    onClick={() => setSorteoSeleccionado(sorteo)}
                    style={{ background: '#1a1a1a', border: '1px solid #444', borderRadius: '12px', padding: '12px', marginBottom: '15px', cursor: 'pointer' }}
                  >
                    {sorteo.multimedia_url && (
                      <img 
                        src={sorteo.multimedia_url} 
                        alt={sorteo.nombre} 
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} 
                      />
                    )}
                    <h3 style={{ color: '#FFD700', fontSize: '1.1rem', margin: '0 0 8px 0' }}>{sorteo.nombre}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ccc', marginBottom: '10px' }}>
                      <span>🎟️ Precio: <b>S/ {sorteo.precio}</b></span>
                      <span>⏳ Cierre: <b>{sorteo.fecha_cierre ? new Date(sorteo.fecha_cierre).toLocaleDateString() : 'Por definir'}</b></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: colorEstado, color: '#000' }}>
                        {estadoSorteo.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: 'bold' }}>Ver Información ➔</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#FFD700', marginBottom: '10px' }}>⚠️ No se encontraron registros en la tabla "sorteos".</p>
              </div>
            )}
          </div>
        ) : modalAbierto === 'SORTEOS' && sorteoSeleccionado ? (
          <div style={{ textAlign: 'left' }}>
            <button 
              onClick={() => setSorteoSeleccionado(null)}
              style={{ background: 'transparent', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '10px', padding: 0 }}
            >
              ⬅ Volver a la lista de sorteos
            </button>

            {sorteoSeleccionado.multimedia_url && (
              <img 
                src={sorteoSeleccionado.multimedia_url} 
                alt={sorteoSeleccionado.nombre} 
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px', border: '1px solid #444' }} 
              />
            )}

            <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '12px', border: '1px solid #333', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#ddd' }}>
                {sorteoSeleccionado.descripcion || "¡Participa por increíbles premios asegurados! Adquiere tu ticket digital y asegura tu número de la suerte."}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#FFD700', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                <span>Costo por ticket: <b>S/ {sorteoSeleccionado.precio}</b></span>
                <span>Cierre: <b>{sorteoSeleccionado.fecha_cierre ? new Date(sorteoSeleccionado.fecha_cierre).toLocaleDateString() : 'Por definir'}</b></span>
              </div>
            </div>

            {(!sorteoSeleccionado.estado || sorteoSeleccionado.estado === 'activo') ? (
              <button 
                onClick={() => {
                  if (onIrAComprarTicket) {
                    onIrAComprarTicket(sorteoSeleccionado);
                  } else {
                    alert(`Redirigiendo al flujo de compra para: ${sorteoSeleccionado.nombre}`);
                  }
                }} 
                className="boton-destello" 
                style={{ width: '100%', padding: '14px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer' }}
              >
                🎟️ COMPRAR TICKET AHORA
              </button>
            ) : (
              <div style={{ background: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c', padding: '12px', borderRadius: '8px', textAlign: 'center', color: '#ff8080', fontSize: '0.95rem', fontWeight: 'bold' }}>
                ⚠️ Este sorteo se encuentra <strong>{sorteoSeleccionado.estado.toUpperCase()}</strong>. Ya no acepta más compras.
              </div>
            )}
          </div>
        ) : modalAbierto === 'PREMIO 1' || modalAbierto === 'PREMIO 2' || modalAbierto === 'PREMIO 3' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden', padding: '10px', textAlign: 'center' }}>
            
            <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 10px 0' }}>
              {modalAbierto === 'PREMIO 1' ? (sorteoCronometro?.premio1_texto || 'Auto') :
               modalAbierto === 'PREMIO 2' ? (sorteoCronometro?.premio2_texto || 'Moto') : 
               (sorteoCronometro?.premio3_texto || 'Dinero')}
            </p>

            {(() => {
              const urlBruta = modalAbierto === 'PREMIO 1' ? (sorteoCronometro?.premio1_imagen || sorteoCronometro?.imagen_premio1) :
                               modalAbierto === 'PREMIO 2' ? (sorteoCronometro?.premio2_imagen || sorteoCronometro?.imagen_premio2) : 
                               (sorteoCronometro?.premio3_imagen || sorteoCronometro?.imagen_premio3);
              
              const urlLimpia = urlBruta && typeof urlBruta === 'string' && urlBruta.includes('](') ? urlBruta.split('](')[0].replace('[', '') : (urlBruta || '');

              return urlLimpia ? (
                <img 
                  src={urlLimpia} 
                  alt="Premio" 
                  style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #FFD700', marginBottom: '15px' }} 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : null;
            })()}

            <button 
              onClick={() => onClose()} 
              className="boton-destello" 
              style={{ width: '100%', padding: '12px', background: '#00B4D8', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
            >
              ¡Genial, continuar!
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// =================================================================
// Subcomponente "Mis Tickets"
// =================================================================
function MisTicketsBuscador() {
  const [dniInput, setDniInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [misTickets, setMisTickets] = useState<any[]>([]);
  const [sorteosInfo, setSorteosInfo] = useState<{ [key: string]: string }>({});
  const [buscado, setBuscado] = useState(false);

  const buscarTickets = async () => {
    if (!dniInput.trim() || dniInput.length < 6) {
      alert('Por favor ingresa un número de DNI válido.');
      return;
    }

    setCargando(true);
    setBuscado(true);
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets_ordenes')
        .select('*')
        .eq('dni', dniInput.trim());

      if (!ticketsError && ticketsData) {
        // Consultamos la tabla 'sorteos' para saber cuáles siguen vigentes/existiendo de verdad
        const nombresSorteos = [...new Set(ticketsData.map(t => t.sorteo).filter(Boolean))];

        let mapaEstados: { [key: string]: string } = {};
        let sorteosExistentesReales: string[] = [];

        if (nombresSorteos.length > 0) {
          const { data: sorteosData } = await supabase
            .from('sorteos')
            .select('nombre, estado')
            .in('nombre', nombresSorteos);

          if (sorteosData) {
            sorteosData.forEach(s => {
              const nombreLimpio = s.nombre ? s.nombre.trim() : '';
              mapaEstados[nombreLimpio] = s.estado ? s.estado.toLowerCase() : 'activo';
              sorteosExistentesReales.push(nombreLimpio);
            });
          }
        }

        setSorteosInfo(mapaEstados);

        // FILTRADO ESTRICTO: Solo guardamos los tickets cuyo sorteo REALMENTE exista en la base de datos de sorteos.
        // Esto descarta automáticamente los "sorteos fantasmas" que ya fueron eliminados.
        const ticketsValidos = ticketsData.filter(t => {
          const nombreSorteoTicket = (t.sorteo || '').trim();
          return sorteosExistentesReales.includes(nombreSorteoTicket);
        });

        setMisTickets(ticketsValidos);
      } else {
        setMisTickets([]);
      }
    } catch (err) {
      console.error("Error buscando tickets:", err);
      setMisTickets([]);
    } finally {
      setCargando(false);
    }
  };

  const ticketsAgrupados = misTickets.reduce((acc: any, ticket: any) => {
    const nombreSorteo = ticket.sorteo ? ticket.sorteo.trim() : 'Sorteo General';
    if (!acc[nombreSorteo]) {
      acc[nombreSorteo] = [];
    }
    acc[nombreSorteo].push(ticket);
    return acc;
  }, {});

  const totalTicketsGlobal = misTickets.reduce((acc, t) => acc + (Number(t.cantidad_tickets) || 1), 0);
  const totalMontoGlobal = misTickets.reduce((acc, t) => acc + (Number(t.monto) || 0), 0);

  const coloresSorteo = ['#FFD700', '#00d4ff', '#ff6b6b', '#25D366', '#da70d6'];

  return (
    <div style={{ textAlign: 'left', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
      <p style={{ fontSize: '0.9rem', color: '#00d4ff', textAlign: 'center', marginBottom: '15px' }}>
        🔍 Ingresa tu DNI para consultar tus códigos y sorteos inscritos:
      </p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <input 
          type="text" 
          value={dniInput} 
          onChange={(e) => setDniInput(e.target.value)}
          placeholder="Número de DNI"
          style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444', fontSize: '1rem' }}
        />
        <button 
          onClick={buscarTickets}
          style={{ padding: '0 20px', background: '#FFD700', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#000', fontSize: '0.95rem' }}
        >
          {cargando ? '...' : 'Buscar'}
        </button>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', color: '#FFD700', padding: '25px' }}>Buscando tus registros...</p>
      ) : buscado ? (
        misTickets.length > 0 ? (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #1f1f1f, #111)', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #444', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', color: '#25D366', margin: '0 0 6px 0' }}>
                ¡Hola, <b>{misTickets[0]?.nombre_cliente || 'Cliente'}</b>!
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#aaa', display: 'block' }}>TOTAL TICKETS</span>
                  <span style={{ fontSize: '1.1rem', color: '#FFD700', fontWeight: 'bold' }}>🎟️ {totalTicketsGlobal}</span>
                </div>
                <div style={{ borderLeft: '1px solid #333', paddingLeft: '15px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#aaa', display: 'block' }}>TOTAL PAGADO</span>
                  <span style={{ fontSize: '1.1rem', color: '#00d4ff', fontWeight: 'bold' }}>S/ {totalMontoGlobal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {Object.keys(ticketsAgrupados).map((nombreSorteo, index) => {
              const ticketsDelSorteo = ticketsAgrupados[nombreSorteo];
              const colorActual = coloresSorteo[index % coloresSorteo.length];
              
              const estadoSorteo = sorteosInfo[nombreSorteo] || 'activo';
              const colorBadgeEstado = 
                estadoSorteo === 'activo' ? '#25D366' : 
                estadoSorteo === 'finalizado' ? '#FFD700' : '#ff6b6b';

              const cantidadSorteo = ticketsDelSorteo.reduce((acc: number, t: any) => {
                return acc + (Number(t.cantidad_tickets) || 1);
              }, 0);

              const montoInvertidoSorteo = ticketsDelSorteo.reduce((acc: number, t: any) => {
                return acc + (Number(t.monto) || 0);
              }, 0);

              const precioUnitarioEstimado = cantidadSorteo > 0 ? (montoInvertidoSorteo / cantidadSorteo).toFixed(2) : '0.00';

              return (
                <div 
                  key={index} 
                  style={{ 
                    background: '#161616', 
                    border: `2px solid ${colorActual}`, 
                    borderRadius: '12px', 
                    padding: '16px', 
                    marginBottom: '20px', 
                    boxShadow: '0 6px 15px rgba(0,0,0,0.6)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                    <h4 style={{ color: colorActual, margin: 0, fontSize: '1.1rem' }}>🏆 {nombreSorteo}</h4>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.70rem', background: colorBadgeEstado, color: '#000', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {estadoSorteo.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.78rem', background: colorActual, color: '#000', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {cantidadSorteo} {cantidadSorteo === 1 ? 'ticket' : 'tickets'}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: '#111', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ddd', marginBottom: '12px', border: '1px solid #333' }}>
                    <span>💵 Precio por ticket: <b>S/ {precioUnitarioEstimado}</b></span>
                    <span>💳 Total pagado: <b style={{ color: '#25D366' }}>S/ {montoInvertidoSorteo.toFixed(2)}</b></span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    {ticketsDelSorteo.map((t: any, idx: number) => (
                      <div key={idx} style={{ background: '#202020', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: colorActual, fontWeight: 'bold' }}>🎟️ {t.codigo_ticket ? t.codigo_ticket : 'PENDIENTE DE CÓDIGO'}</span>
                        <span style={{ fontSize: '0.78rem', background: t.estado === 'verificado' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(255, 193, 7, 0.2)', color: t.estado === 'verificado' ? '#25D366' : '#FFC107', padding: '2px 8px', borderRadius: '4px' }}>
                          {t.estado ? t.estado.toUpperCase() : 'PENDIENTE'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#111', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', color: '#00d4ff', textAlign: 'center', border: '1px dashed #444' }}>
                    📺 <i>¡Sigue la transmisión en vivo por esta misma app! Mucha suerte 🍀</i>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#ff6b6b', padding: '20px' }}>
            No se encontraron tickets asociados a este DNI. Si ya realizaste tu pago, recuerda que el administrador debe validarlo.
          </p>
        )
      ) : null}
    </div>
  );
}

// =================================================================
// Subcomponente "Ganadores"
// =================================================================
function GanadoresSorteos() {
  const [listaGanadores, setListaGanadores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchGanadores = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from('tickets_ordenes')
          .select('*')
          .eq('estado', 'ganador')
          .order('id', { ascending: false });

        if (!error && data) {
          setListaGanadores(data);
        } else {
          console.error("Error en consulta de ganadores:", error);
        }
      } catch (err) {
        console.error("Error al cargar ganadores:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchGanadores();
  }, []);

  return (
    <div style={{ textAlign: 'left', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
      <p style={{ fontSize: '0.9rem', color: '#FFD700', textAlign: 'center', marginBottom: '15px' }}>
        🏆 ¡Conoce a los ganadores oficiales de nuestros sorteos!
      </p>

      {cargando ? (
        <p style={{ textAlign: 'center', color: '#00d4ff', padding: '20px' }}>Cargando galería de ganadores...</p>
      ) : listaGanadores.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {listaGanadores.map((g, index) => {
            const ticketOficial = g.ticket_ganador || g.codigo_ganador;
            const fotoGanador = g.foto_premio_url || g.foto_url || g.imagen;

            return (
              <div 
                key={index} 
                style={{ 
                  background: 'linear-gradient(135deg, #1f1f1f, #111)', 
                  border: '1px solid #FFD700', 
                  borderRadius: '12px', 
                  padding: '14px', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ color: '#FFD700', margin: 0, fontSize: '1rem' }}>🎉 {g.sorteo || 'Sorteo General'}</h4>
                  <span style={{ fontSize: '0.75rem', background: '#25D366', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                    GANADOR OFICIAL
                  </span>
                </div>
                
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.95rem', color: '#fff' }}>
                  👤 <b>{g.nombre_cliente || 'Ganador'}</b>
                </p>

                {fotoGanador && (
                  <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                    <img 
                      src={fotoGanador} 
                      alt="Foto del Ganador o Premio" 
                      style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' }}
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div style={{ background: '#141414', padding: '10px', borderRadius: '8px', border: '1px solid #FFD700', marginBottom: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#85c1e9', display: 'block', marginBottom: '4px' }}>
                    {g.puesto_premio ? `🏆 ${g.puesto_premio.toUpperCase()}` : '🏆 TICKET GANADOR OFICIAL:'}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '1.1rem', 
                      background: 'rgba(255, 215, 0, 0.15)', 
                      color: '#FFD700', 
                      border: '1px solid #FFD700', 
                      padding: '4px 12px', 
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}
                  >
                    🎟️ {ticketOficial || g.codigo_ticket}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.82rem', color: '#aaa', borderTop: '1px solid #333', paddingTop: '6px' }}>
                  <span>DNI: {g.dni ? `${g.dni.substring(0, 3)}****` : '***'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '30px', background: '#161616', borderRadius: '12px', border: '1px solid #333' }}>
          <p style={{ color: '#ccc', fontSize: '0.95rem', margin: 0 }}>
            ⏳ Aún no hay ganadores declarados en este momento. ¡Pronto publicaremos a los afortunados aquí! 🍀
          </p>
        </div>
      )}
    </div>
  );
}