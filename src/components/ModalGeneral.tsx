import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface ModalGeneralProps {
  modalAbierto: string | null;
  onClose: () => void;
  esModoEnVivo: boolean;
  setEsModoEnVivo: (valor: boolean) => void;
  // Función opcional para conectar con tu modal/botón externo de comprar ticket si lo requieres
  onIrAComprarTicket?: (sorteo: Sorteo) => void;
}

interface Sorteo {
  id: string | number;
  nombre: string;
  precio: number;
  fecha_cierre: string;
  multimedia_url?: string;
  estado?: string;
  descripcion?: string; // Por si tienes una descripción en tu base de datos
}

export default function ModalGeneral({
  modalAbierto,
  onClose,
  esModoEnVivo,
  setEsModoEnVivo,
  onIrAComprarTicket
}: ModalGeneralProps) {
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefonoUsuario, setTelefonoUsuario] = useState('');

  const [sorteosLista, setSorteosLista] = useState<Sorteo[]>([]);
  const [cargandoSorteos, setCargandoSorteos] = useState(false);
  
  // Estado para controlar qué sorteo se seleccionó para ver sus detalles e información
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState<Sorteo | null>(null);

  useEffect(() => {
    if (modalAbierto === 'SORTEOS') {
      // Limpiamos la selección anterior al abrir el modal principal de sorteos
      setSorteoSeleccionado(null);
      
      const fetchSorteos = async () => {
        setCargandoSorteos(true);
        try {
          const { data, error } = await supabase
            .from('sorteos')
            .select('*');
          
          if (!error && data) {
            setSorteosLista(data);
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

  if (!modalAbierto || modalAbierto === 'COMPRAR TICKET') return null;

  const esEnVivoOVivoComunidad = modalAbierto === 'COMUNIDAD' || modalAbierto === 'EN VIVO';
  const colorBorde = modalAbierto === 'EN VIVO' ? '#FF0000' : '#FFD700';

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'rgba(0,0,0,0.9)', 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }} 
      onClick={onClose}
    >
      <style>{`
        @keyframes sparkle { 
          0% { box-shadow: 0 0 5px #25D366; } 
          50% { box-shadow: 0 0 20px #25D366, 0 0 40px #fff; } 
          100% { box-shadow: 0 0 5px #25D366; } 
        }
        .boton-destello { 
          animation: sparkle 1.5s infinite; 
        }
        .tarjeta-sorteo:hover {
          border-color: #FFD700 !important;
          transform: scale(1.02);
          transition: all 0.2s ease-in-out;
        }
      `}</style>

      <div 
        style={{ 
          width: '90vw', 
          maxWidth: '520px', 
          maxHeight: '85vh', 
          border: `8px solid ${colorBorde}`, 
          borderRadius: '25px', 
          background: 'rgba(0,0,0,0.95)', 
          padding: '20px', 
          color: '#FFF', 
          textAlign: 'center', 
          overflowY: 'auto', 
          boxSizing: 'border-box', 
          boxShadow: modalAbierto === 'EN VIVO' ? '0 0 30px 10px rgba(255, 0, 0, 0.8)' : '0 0 15px 4px rgba(255, 215, 0, 0.3)', 
        }} 
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: colorBorde, marginBottom: '15px' }}>
          {modalAbierto === 'SORTEOS' && sorteoSeleccionado ? sorteoSeleccionado.nombre : modalAbierto}
        </h2>
        
        {esEnVivoOVivoComunidad && !usuarioRegistrado ? (
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
        ) : esEnVivoOVivoComunidad && usuarioRegistrado ? (
          <div>
            {modalAbierto === 'EN VIVO' && <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #FF0000', borderRadius: '10px', color: '#FF0000', fontWeight: 'bold' }}>[ TRANSMISIÓN EN VIVO ACTIVA ]</div>}
            <p style={{ fontSize: '1.1rem', color: '#25D366' }}>¡Hola, {nombreUsuario}! Ya estás conectado al chat general.</p>
            <div style={{ background: '#111', padding: '15px', borderRadius: '8px', marginTop: '15px', height: '120px', overflowY: 'auto', textAlign: 'left', fontSize: '0.9rem', border: '1px solid #333' }}>
              <p style={{ margin: '5px 0' }}>🤖 <b>Sistema:</b> ¡Bienvenido a la comunidad!</p>
            </div>
          </div>
        ) : modalAbierto === 'TESORO' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden', padding: '20px' }}>
            <h2 style={{ color: '#FFD700', margin: '0 0 10px 0', fontSize: '20px' }}>¡Tesoro Encontrado!</h2>
            <p style={{ color: '#fff', fontSize: '14px', textAlign: 'center', margin: '0 0 20px 0' }}>
              Has abierto el cofre del tesoro. ¡Pronto habrá más sorpresas aquí!
            </p>
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
            <p>📍 <strong>Lugar:</strong> Plaza Pecuaria, Bambamarca</p>
            <p>📅 <strong>Fecha:</strong> 15 de Julio, 2026</p>
            <p>⏰ <strong>Hora:</strong> 16:00 horas</p>
            <h4 style={{ color: '#00d4ff', marginTop: '20px' }}>PREMIOS PRINCIPALES</h4>
            <ul style={{ textAlign: 'left' }}>
              <li>🎁 1er Premio: Motocicleta 0km</li>
              <li>🎁 2do Premio: Laptop Ingeniería</li>
              <li>🎁 3er Premio: Kit de Construcción</li>
            </ul>
            <button 
              onClick={() => window.open('https://wa.me/51976610071', '_blank')} 
              className="boton-destello" 
              style={{ width: '100%', padding: '12px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
            >
              🔔 RECIBIR RECORDATORIO
            </button>
          </div>
        ) : modalAbierto === 'SORTEOS' && !sorteoSeleccionado ? (
          /* VISTA 1: Lista general de todos los sorteos */
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.85rem', color: '#00d4ff', textAlign: 'center', marginBottom: '15px' }}>👇 Selecciona un sorteo para ver su información y premios:</p>
            {cargandoSorteos ? (
              <p style={{ textAlign: 'center', color: '#FFD700', padding: '20px' }}>Cargando sorteos activos...</p>
            ) : sorteosLista.length > 0 ? (
              sorteosLista.map((sorteo) => (
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
                    {sorteo.estado && (
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: sorteo.estado === 'activo' ? '#25D366' : '#555', color: '#000' }}>
                        {sorteo.estado.toUpperCase()}
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: 'bold' }}>Ver Información ➔</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#FFD700', marginBottom: '10px' }}>⚠️ No se encontraron registros en la tabla "sorteos".</p>
              </div>
            )}
          </div>
        ) : modalAbierto === 'SORTEOS' && sorteoSeleccionado ? (
          /* VISTA 2: Detalle completo, imágenes e información del sorteo seleccionado antes de comprar */
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

            {/* BOTÓN FINAL QUE REDIRECCIONA A COMPRAR TICKET */}
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
          </div>
        ) : (
          <p>
            {modalAbierto === 'MIS TICKETS' && "Tus números de la suerte están registrados aquí. ¡A ganar!"}
            {modalAbierto === 'GANADORES' && "¡La historia la escriben los ganadores! Mira quienes ya celebran."}
            {modalAbierto === 'NOSOTROS' && "Construimos emociones y experiencias únicas en el corazón de Cajamarca."}
            {modalAbierto === 'CONTACTO' && "Tu opinión vale oro. Contacta directamente con soporte."}
            {modalAbierto === 'PREMIO 1' && "¡Un premio diseñado para un ganador excepcional!"}
            {modalAbierto === 'PREMIO 2' && "¡Atrévete a ir por más! Podría cambiar tu día."}
            {modalAbierto === 'PREMIO 3' && "¡La gran sorpresa! Podría ser tuya hoy mismo."}
          </p>
        )}
        
        <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 20px', background: '#FFD700', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>CERRAR</button>
      </div>
    </div>
  );
}