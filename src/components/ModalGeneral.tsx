import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface ModalGeneralProps {
  modalAbierto: string | null;
  onClose: () => void;
  esModoEnVivo: boolean;
  setEsModoEnVivo: (valor: boolean) => void;
  onIrAComprarTicket?: (sorteo: Sorteo) => void;
}

interface Sorteo {
  id: string | number;
  nombre: string;
  precio: number;
  fecha_cierre: string;
  multimedia_url?: string;
  estado?: string;
  descripcion?: string;
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
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState<Sorteo | null>(null);

  useEffect(() => {
    if (modalAbierto === 'SORTEOS') {
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
          width: '92vw', 
          maxWidth: '580px', 
          maxHeight: '88vh', 
          border: `8px solid ${colorBorde}`, 
          borderRadius: '25px', 
          background: 'rgba(0,0,0,0.96)', 
          padding: '24px', 
          color: '#FFF', 
          textAlign: 'center', 
          overflowY: 'auto', 
          boxSizing: 'border-box', 
          boxShadow: modalAbierto === 'EN VIVO' ? '0 0 30px 10px rgba(255, 0, 0, 0.8)' : '0 0 20px 5px rgba(255, 215, 0, 0.3)', 
        }} 
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: colorBorde, marginBottom: '15px', fontSize: '1.4rem' }}>
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
        ) : modalAbierto === 'MIS TICKETS' ? (
          <MisTicketsBuscador />
        ) : modalAbierto === 'SORTEOS' && !sorteoSeleccionado ? (
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
            {modalAbierto === 'GANADORES' && "¡La historia la escriben los ganadores! Mira quienes ya celebran."}
            {modalAbierto === 'NOSOTROS' && "Construimos emociones y experiencias únicas en el corazón de Cajamarca."}
            {modalAbierto === 'CONTACTO' && "Tu opinión vale oro. Contacta directamente con soporte."}
            {modalAbierto === 'PREMIO 1' && "¡Un premio diseñado para un ganador excepcional!"}
            {modalAbierto === 'PREMIO 2' && "¡Atrévete a ir por más! Podría cambiar tu día."}
            {modalAbierto === 'PREMIO 3' && "¡La gran sorpresa! Podría ser tuya hoy mismo."}
          </p>
        )}
        
        <button onClick={onClose} style={{ marginTop: '20px', padding: '12px 20px', background: '#FFD700', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '1rem' }}>CERRAR</button>
      </div>
    </div>
  );
}

// Subcomponente con resumen financiero limpio y separación cromática por sorteo
function MisTicketsBuscador() {
  const [dniInput, setDniInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [misTickets, setMisTickets] = useState<any[]>([]);
  const [buscado, setBuscado] = useState(false);

  const buscarTickets = async () => {
    if (!dniInput.trim() || dniInput.length < 6) {
      alert('Por favor ingresa un número de DNI válido.');
      return;
    }

    setCargando(true);
    setBuscado(true);
    try {
      const { data, error } = await supabase
        .from('tickets_ordenes')
        .select('*')
        .eq('dni', dniInput.trim());

      if (!error && data) {
        setMisTickets(data);
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

  // Agrupamos los tickets por el campo 'sorteo'
  const ticketsAgrupados = misTickets.reduce((acc: any, ticket: any) => {
    const nombreSorteo = ticket.sorteo || 'Sorteo General';
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
    <div style={{ textAlign: 'left' }}>
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
            {/* Resumen global ejecutivo y ordenado */}
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

            {/* Recorremos cada grupo de sorteos con colores independientes */}
            {Object.keys(ticketsAgrupados).map((nombreSorteo, index) => {
              const ticketsDelSorteo = ticketsAgrupados[nombreSorteo];
              const colorActual = coloresSorteo[index % coloresSorteo.length];
              
              const cantidadSorteo = ticketsDelSorteo.reduce((acc: number, t: any) => {
                return acc + (Number(t.cantidad_tickets) || 1);
              }, 0);

              const montoInvertidoSorteo = ticketsDelSorteo.reduce((acc: number, t: any) => {
                return acc + (Number(t.monto) || 0);
              }, 0);

              // Calculamos el precio unitario estimado para mostrarlo limpiamente en el resumen del sorteo
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
                    <span style={{ fontSize: '0.78rem', background: colorActual, color: '#000', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {cantidadSorteo} {cantidadSorteo === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>

                  {/* Resumen financiero limpio del sorteo (Precio por ticket y Total pagado) */}
                  <div style={{ background: '#111', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ddd', marginBottom: '12px', border: '1px solid #333' }}>
                    <span>💵 Precio por ticket: <b>S/ {precioUnitarioEstimado}</b></span>
                    <span>💳 Total pagado: <b style={{ color: '#25D366' }}>S/ {montoInvertidoSorteo.toFixed(2)}</b></span>
                  </div>

                  {/* Lista limpia de códigos de tickets individuales */}
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