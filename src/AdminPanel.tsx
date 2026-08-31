/**
 * 
 * ARCHIVO PRINCIPAL: AdminPanel.tsx
 * MÓDULO: Centro de Mando Pro - Panel de Administración (Playa Dorada)
 * 
 */
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

interface AdminPanelProps {
  onVolverApp?: () => void;
}

export default function AdminPanel({ onVolverApp }: AdminPanelProps) {
  // 1. ESTADOS GLOBALES Y DE AUTENTICACIÓN
  const [session, setSession] = useState<any>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [pagados, setPagados] = useState<any[]>([]);
  const [cancelados, setCancelados] = useState<any[]>([]);
  const [sorteos, setSorteos] = useState<any[]>([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(false);
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState<string>('todos');
  const [pestanaActiva, setPestanaActiva] = useState<'pendientes' | 'historial' | 'creador_sorteos' | 'comunicados' | 'anfora' | 'ganadores' | 'moderacion'>('pendientes');

  // Estados para el Creador de Sorteos
  const [nombreSorteo, setNombreSorteo] = useState("");
  const [precioSorteo, setPrecioSorteo] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [imagenUrl, setImagenUrl] = useState('');

  // Estados para Buscador, Comunicados, Moderación y Notificaciones
  const [busqueda, setBusqueda] = useState("");
  const [mensajeComunicado, setMensajeComunicado] = useState('');
  const [permitirComentarios, setPermitirComentarios] = useState(true);
  const [usuariosBloqueados, setUsuariosBloqueados] = useState<string[]>([]);
  const [usuarioBloquearInput, setUsuarioBloquearInput] = useState("");
  
  const [notificacion, setNotificacion] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  const mostrarAviso = (texto: string, tipo: 'exito' | 'error' = 'exito') => {
    setNotificacion({ texto, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  };

  const [email, setEmail] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // ESTADOS PARA MODALES DE CONFIRMACIÓN Y DECLARACIÓN DE GANADORES
  const [modalConfirmacion, setModalConfirmacion] = useState<{
    abierto: boolean;
    titulo: string;
    mensaje: string;
    onAceptar: () => void;
  }>({ abierto: false, titulo: "", mensaje: "", onAceptar: () => {} });

  // NUEVOS ESTADOS PARA CONFIGURAR EL GANADOR OFICIAL
  const [modalGanadorAbierto, setModalGanadorAbierto] = useState(false);
  const [ordenGanadoraObj, setOrdenGanadoraObj] = useState<any>(null);
  const [ticketGanadorElegido, setTicketGanadorElegido] = useState('');
  const [puestoPremioElegido, setPuestoPremioElegido] = useState('1er Puesto');
  const [fotoUrlElegida, setFotoUrlElegida] = useState('');

  // 2. EFECTOS Y CICLO DE VIDA (AUTH & CARGA)
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setCargandoAuth(false);
        if (session) {
          cargarDatosCompletosIniciales();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setCargandoAuth(false);
        if (session) {
          cargarDatosCompletosIniciales();
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const cargarDatosCompletosIniciales = async () => {
    const listaSorteos = await cargarSorteos();
    if (listaSorteos && listaSorteos.length > 0) {
      const primerId = String(listaSorteos[0].id);
      setSorteoSeleccionado(primerId);
      await cargarDatosParticipantes(primerId, listaSorteos);
    } else {
      await cargarDatosParticipantes('todos', []);
    }
  };

  const cargarDatosCompletos = async () => {
    const listaSorteos = await cargarSorteos();
    await cargarDatosParticipantes(sorteoSeleccionado, listaSorteos);
  };

  // 3. FUNCIONES DE CONEXIÓN Y DATOS (SUPABASE)
  const cargarSorteos = async () => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('sorteos')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      setSorteos(data || []);
      return data || [];
    } catch (error: any) {
      console.error('Error cargando sorteos:', error.message);
      return [];
    }
  };

  const cargarDatosParticipantes = async (sorteoIdVal: string = sorteoSeleccionado, listaSorteosRef: any[] = sorteos) => {
    if (!supabase) return;
    setCargandoPendientes(true);
    try {
      let queryPendientes = supabase.from('tickets_ordenes').select('*').eq('estado', 'pendiente');
      let queryPagados = supabase.from('tickets_ordenes').select('*').in('estado', ['pagado', 'ganador', 'verificado']);
      let queryCancelados = supabase.from('tickets_ordenes').select('*').eq('estado', 'cancelado');

      if (sorteoIdVal !== 'todos') {
        const sorteoObj = listaSorteosRef.find(s => String(s.id) === String(sorteoIdVal));
        if (sorteoObj) {
          const nombreSorteoFiltro = sorteoObj.nombre.trim();
          queryPendientes = queryPendientes.eq('sorteo', nombreSorteoFiltro);
          queryPagados = queryPagados.eq('sorteo', nombreSorteoFiltro);
          queryCancelados = queryCancelados.eq('sorteo', nombreSorteoFiltro);
        }
      }

      const [resPend, resPag, resCan] = await Promise.all([queryPendientes, queryPagados, queryCancelados]);

      if (resPend.error) throw resPend.error;
      if (resPag.error) throw resPag.error;
      if (resCan.error) throw resCan.error;

      setPendientes(resPend.data || []);
      setPagados(resPag.data || []);
      setCancelados(resCan.data || []);
    } catch (error: any) {
      console.error('Error cargando datos de participantes:', error.message);
    } finally {
      setCargandoPendientes(false);
    }
  };

  // 4. ACCIONES Y OPERACIONES DE GESTIÓN
  const crearSorteo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('sorteos')
        .insert([{
          nombre: nombreSorteo,
          precio: Number(precioSorteo),
          fecha_cierre: fechaCierre || null,
          multimedia_url: imagenUrl || null,
          estado: 'activo'
        }]);
      if (error) throw error;
      mostrarAviso('¡Sorteo creado con éxito y sincronizado!');
      setNombreSorteo("");
      setPrecioSorteo("");
      setFechaCierre("");
      setImagenUrl("");
      const nuevaLista = await cargarSorteos();
      if (nuevaLista && nuevaLista.length > 0) {
        const nuevoId = String(nuevaLista[0].id);
        setSorteoSeleccionado(nuevoId);
        await cargarDatosParticipantes(nuevoId, nuevaLista);
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      mostrarAviso('Error al crear el sorteo: ' + error.message, 'error');
    }
  };

  const cambiarEstadoSorteo = async (id: any, estadoActual: string) => {
    const nuevoEstado = estadoActual === 'activo' ? 'finalizado' : 'activo';
    try {
      const { error } = await supabase
        .from('sorteos')
        .update({ estado: nuevoEstado })
        .eq('id', id);
      if (error) throw error;
      await cargarSorteos();
      mostrarAviso('Estado del sorteo actualizado.');
    } catch (error: any) {
      console.error('Error al cambiar estado:', error.message);
      mostrarAviso('Error al cambiar el estado del sorteo.', 'error');
    }
  };

  const ejecutarEliminarSorteo = async (id: any) => {
    try {
      const { error } = await supabase
        .from('sorteos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await cargarSorteos();
      mostrarAviso('Sorteo eliminado correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar:', error.message);
      mostrarAviso('Error al eliminar el sorteo.', 'error');
    }
  };

  const ejecutarConfirmarPago = async (orden: any) => {
    try {
      const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);
      const nuevoCodigo = `TKT-${numeroAleatorio}`;
      const fechaActual = new Date().toLocaleString();
      
      const sorteoAsociado = sorteos.find(s => s.nombre.trim().toLowerCase() === (orden.sorteo || "").trim().toLowerCase());
      const fechaSorteoTexto = sorteoAsociado?.fecha_cierre
        ? new Date(sorteoAsociado.fecha_cierre).toLocaleString('es-PE', { dateStyle: 'full', timeStyle: 'short' })
        : 'Próximamente';

      const cantTickets = orden.cantidad_tickets || orden.cantidad_ticket || orden.cantidad || 1;

      const { error } = await supabase
        .from('tickets_ordenes')
        .update({
          estado: 'verificado',
          fecha_validacion: fechaActual,
          codigo_ticket: nuevoCodigo
        })
        .eq('id', orden.id);

      if (error) throw error;

      const celularCrudo = (orden.celular || "").toString().trim();
      const celularLimpio = celularCrudo.replace(/\D/g, "");
      const celularFinal = celularLimpio.startsWith('51') ? celularLimpio : `51${celularLimpio}`;
      
      const mensaje = `¡Hola *${orden.nombre_cliente}*!\n\nConfirmamos que tus *${cantTickets}* tickets para el sorteo *${orden.sorteo || 'General'}* han sido validados con éxito.\n\n*Tu código oficial es:* *${nuevoCodigo}*\n*Fecha del sorteo:* ${fechaSorteoTexto}\n\nRecuerda que no necesitas enviar una foto de tu boleto: puedes revisar todos tus tickets y seguir la transmisión en vivo directamente desde nuestra aplicación o plataforma web. ¡Mucha suerte!`;

      window.open(`https://wa.me/${celularFinal}?text=${encodeURIComponent(mensaje)}`, '_blank');
      
      mostrarAviso('¡Pago confirmado y mensaje optimizado preparado!');
      await cargarDatosParticipantes();
    } catch (error: any) {
      console.error('Error:', error.message);
      mostrarAviso('Error al confirmar el pago.', 'error');
    }
  };

  const ejecutarInvalidarCompra = async (idOrden: any) => {
    try {
      const { error } = await supabase
        .from('tickets_ordenes')
        .update({ estado: 'cancelado' })
        .eq('id', idOrden);
      if (error) throw error;
      mostrarAviso('Compra invalidada correctamente.');
      setModalAbierto(false);
      setOrdenSeleccionada(null);
      await cargarDatosParticipantes();
    } catch (error: any) {
      console.error('Error al invalidar:', error.message);
      mostrarAviso('Error al cancelar la compra.', 'error');
    }
  };

  const ejecutarRestaurarCompra = async (idOrden: any) => {
    try {
      const { error } = await supabase
        .from('tickets_ordenes')
        .update({
          estado: 'pendiente',
          codigo_ticket: null,
          fecha_validacion: null
        })
        .eq('id', idOrden);
      if (error) throw error;
      mostrarAviso('Ticket restaurado a estado pendiente correctamente.');
      setModalAbierto(false);
      setOrdenSeleccionada(null);
      await cargarDatosParticipantes();
    } catch (error: any) {
      console.error('Error al restaurar:', error.message);
      mostrarAviso('Error al restaurar la compra.', 'error');
    }
  };

  // FUNCIONES PARA ABRIR EL MODAL DE GANADOR
  const abrirModalDeclararGanador = (orden: any) => {
    setOrdenGanadoraObj(orden);
    const listaTickets = orden.codigo_ticket ? orden.codigo_ticket.split(',').map((t: string) => t.trim()) : [];
    setTicketGanadorElegido(listaTickets[0] || orden.codigo_ticket || '');
    setPuestoPremioElegido('1er Puesto');
    setFotoUrlElegida(orden.foto_premio_url || '');
    setModalGanadorAbierto(true);
  };

  const confirmarDeclararGanadorFinal = async () => {
    if (!ordenGanadoraObj) return;
    try {
      const { error } = await supabase
        .from('tickets_ordenes')
        .update({ 
          estado: 'ganador',
          ticket_ganador: ticketGanadorElegido,
          puesto_premio: puestoPremioElegido,
          foto_premio_url: fotoUrlElegida
        })
        .eq('id', ordenGanadoraObj.id);

      if (error) throw error;

      mostrarAviso('¡Ganador declarado y publicado con éxito!');
      setModalGanadorAbierto(false);
      setOrdenGanadoraObj(null);
      await cargarDatosParticipantes();
    } catch (error: any) {
      console.error('Error al declarar ganador:', error.message);
      mostrarAviso('Error al declarar ganador: ' + error.message, 'error');
    }
  };

  const exportarACSV = () => {
    if (pagados.length === 0) {
      mostrarAviso('No hay datos para exportar en este sorteo.', 'error');
      return;
    }
    const encabezados = "ID, Cliente, DNI, Celular, Sorteo, Cantidad, Monto, Codigo Ticket, Estado, Fecha Validacion\n";
    const filas = pagados.map(o => {
      const cant = o.cantidad_tickets || o.cantidad_ticket || o.cantidad || 1;
      return `"${o.id}","${o.nombre_cliente}","${o.dni}","${o.celular || ""}","${o.sorteo || ""}",${cant},${o.monto},"${o.codigo_ticket || ""}","${o.estado}","${o.fecha_validacion || ""}"`;
    }).join("\n");

    const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_pagos_validados.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const guardarComunicado = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('comunicado_activo', mensajeComunicado);
    mostrarAviso('¡Comunicado actualizado para los clientes!');
  };

  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");
    if (!supabase) return;
    const passwordValue = passwordRef.current?.value || "";
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwordValue });
    if (error) setErrorLogin('Correo o contraseña incorrectos.');
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  // 5. RENDERIZADO CONDICIONAL DE AUTENTICACIÓN
  if (cargandoAuth) {
    return (
      <div style={{ backgroundColor: '#1a1a1a', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ backgroundColor: '#1a1a1a', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ border: '2px solid #FFD700', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '100%', background: '#222' }}>
          <h2 style={{ color: '#FFD700', marginBottom: '10px' }}>Panel de Administración</h2>
          <form onSubmit={handleLoginEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Contraseña</label>
              <input type="password" ref={passwordRef} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>
            {errorLogin && <p style={{ color: '#ff4d4d', fontSize: '13px', margin: '0' }}>{errorLogin}</p>}
            <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#FFD700', color: '#111', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontSize: '14px', marginTop: '10px' }}>Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }

  // 6. VARIABLES AUXILIARES DE VISTA
  const sorteoObjActual = sorteos.find(s => String(s.id) === String(sorteoSeleccionado));
  const pagadosConBusqueda = pagados.filter(o =>
    o.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    o.dni?.includes(busqueda) ||
    o.codigo_ticket?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 7. RENDERIZADO PRINCIPAL DEL PANEL
  return (
    <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '20px', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* NOTIFICACIONES FLOTANTES */}
      {notificacion && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: notificacion.tipo === 'exito' ? '#1e3d2f' : '#3d1e1e',
          color: notificacion.tipo === 'exito' ? '#2ecc71' : '#e74c3c',
          border: `1px solid ${notificacion.tipo === 'exito' ? '#27ae60' : '#c0392b'}`,
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{notificacion.tipo === 'exito' ? '✅' : '⚠️'}</span>
          <span>{notificacion.texto}</span>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PERSONALIZADO */}
      {modalConfirmacion.abierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 11000 }}>
          <div style={{ background: '#1c2833', padding: '24px', borderRadius: '10px', width: '90%', maxWidth: '380px', border: '1px solid #FFD700', boxShadow: '0 8px 25px rgba(0,0,0,0.7)', textAlign: 'center' }}>
            <h3 style={{ color: '#FFD700', marginTop: 0, marginBottom: '12px' }}>{modalConfirmacion.titulo}</h3>
            <p style={{ color: '#ecf0f1', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>{modalConfirmacion.mensaje}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setModalConfirmacion({ ...modalConfirmacion, abierto: false })}
                style={{ flex: 1, padding: '10px', background: '#566573', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  modalConfirmacion.onAceptar();
                  setModalConfirmacion({ ...modalConfirmacion, abierto: false });
                }}
                style={{ flex: 1, padding: '10px', background: '#FFD700', color: '#111', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Sí, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CONFIGURAR GANADOR */}
      {modalGanadorAbierto && ordenGanadoraObj && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 12000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#1c2833', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '420px', border: '2px solid #FFD700', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', textAlign: 'left', boxSizing: 'border-box' }}>
            <h3 style={{ color: '#FFD700', marginTop: 0, marginBottom: '15px', textAlign: 'center' }}>🏆 Declarar Ganador Oficial</h3>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '15px' }}>
              Cliente: <strong style={{ color: '#fff' }}>{ordenGanadoraObj.nombre_cliente}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#85c1e9', marginBottom: '5px', fontWeight: 'bold' }}>Selecciona el Ticket Ganador:</label>
                <select
                  value={ticketGanadorElegido}
                  onChange={(e) => setTicketGanadorElegido(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#222', color: '#FFD700', borderRadius: '6px', border: '1px solid #444', fontWeight: 'bold' }}
                >
                  {(ordenGanadoraObj.codigo_ticket || '').split(',').map((t: string, i: number) => {
                    const ticketLimpio = t.trim();
                    return <option key={i} value={ticketLimpio}>{ticketLimpio}</option>;
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#85c1e9', marginBottom: '5px', fontWeight: 'bold' }}>Puesto del Premio:</label>
                <select
                  value={puestoPremioElegido}
                  onChange={(e) => setPuestoPremioElegido(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', borderRadius: '6px', border: '1px solid #444' }}
                >
                  <option value="1er Puesto">1er Puesto 🥇</option>
                  <option value="2do Puesto">2do Puesto 🥈</option>
                  <option value="3er Puesto">3er Puesto 🥉</option>
                  <option value="Ganador Especial">Ganador Especial 🎁</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#85c1e9', marginBottom: '5px', fontWeight: 'bold' }}>URL de la Foto del Ganador (Opcional):</label>
                <input
                  type="text"
                  placeholder="https://ejemplo.com/foto_ganador.jpg"
                  value={fotoUrlElegida}
                  onChange={(e) => setFotoUrlElegida(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#222', color: '#fff', borderRadius: '6px', border: '1px solid #444', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setModalGanadorAbierto(false)}
                style={{ flex: 1, padding: '10px', background: '#566573', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDeclararGanadorFinal}
                style={{ flex: 1, padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Publicar Ganador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '18px', marginBottom: '18px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ color: '#FFD700', margin: 0, fontSize: '30px', fontWeight: '900', letterSpacing: '0.5px' }}>Centro de Mando Pro</h1>
            <span style={{ color: '#5dade2', fontSize: '20px', fontWeight: 'bold' }}>• Playa Dorada</span>
          </div>
          <p style={{ color: '#aaa', margin: '6px 0 0 0', fontSize: '14px', fontStyle: 'italic' }}>
            Gestionando la emoción, la transparencia y los grandes premios que premian tu preferencia.
          </p>
          <p style={{ color: '#777', margin: '3px 0 0 0', fontSize: '12px' }}>Sesión activa: {session.user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {onVolverApp && (
            <button
              onClick={onVolverApp}
              style={{ padding: '10px 16px', background: '#2980b9', color: '#fff', border: '2px solid #5dade2', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            >
              ← Volver a la App
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{ padding: '10px 16px', background: '#c0392b', color: '#fff', border: '2px solid #e74c3c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* HERRAMIENTAS GLOBALES */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', background: '#17202a', padding: '12px', borderRadius: '10px', border: '1px solid #2e4053', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <button onClick={() => setPestanaActiva('creador_sorteos')}
          style={{ padding: '9px 16px', background: pestanaActiva === 'creador_sorteos' ? '#ffcc00' : '#d4ac0d', color: '#111', border: '1px solid #f1c40f', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          + Creador de Sorteos ({sorteos.length})
        </button>
        <button onClick={() => setPestanaActiva('historial')}
          style={{ padding: '9px 16px', background: pestanaActiva === 'historial' ? '#2980b9' : '#1b4f72', color: '#fff', border: '1px solid #5dade2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          Historial & Auditoría
        </button>
        <button onClick={() => setPestanaActiva('comunicados')}
          style={{ padding: '9px 16px', background: pestanaActiva === 'comunicados' ? '#8e44ad' : '#5b2c6f', color: '#fff', border: '1px solid #bb8fce', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          📢 Comunicados
        </button>
        <button onClick={() => setPestanaActiva('moderacion')}
          style={{ padding: '9px 16px', background: pestanaActiva === 'moderacion' ? '#e67e22' : '#ca6f1e', color: '#fff', border: '1px solid #f39c12', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          🛡️ Moderación de Live
        </button>
      </div>

      {/* SELECTOR PRINCIPAL DE SORTEO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', background: '#1b2631', padding: '18px', borderRadius: '10px', border: '2px solid #FFD700', boxShadow: '0 6px 12px rgba(0,0,0,0.4)' }}>
        <label style={{ display: 'block', color: '#FFD700', fontWeight: '900', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Seleccionar Sorteo:
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
          <select
            value={sorteoSeleccionado}
            onChange={async (e) => {
              const nuevoId = e.target.value;
              setSorteoSeleccionado(nuevoId);
              await cargarDatosParticipantes(nuevoId);
            }}
            style={{ flex: 1, padding: '14px', borderRadius: '8px', background: '#212f3d', color: '#FFD700', border: '2px solid #f1c40f', fontSize: '18px', fontWeight: 'bold', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            <option value="todos">-- Ver Todos / Sin Seleccionar --</option>
            {sorteos && sorteos.length > 0 && (
              sorteos.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} (S/ {s.precio})</option>
              ))
            )}
          </select>
          <button
            onClick={async () => {
              await cargarDatosCompletos();
              mostrarAviso('¡Datos y sorteos sincronizados con éxito!');
            }}
            title="Forzar actualización general"
            style={{ padding: '0 20px', background: '#2980b9', color: '#fff', border: '2px solid #5dade2', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* ACCIONES OPERATIVAS */}
      {sorteoSeleccionado !== 'todos' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', background: '#1a252f', padding: '12px', borderRadius: '10px', border: '1px solid #2980b9', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <button onClick={() => setPestanaActiva('pendientes')}
            style={{ padding: '9px 16px', background: pestanaActiva === 'pendientes' ? '#f39c12' : '#d68910', color: '#fff', border: '1px solid #f5b041', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            Participantes ({pendientes.length + pagados.length + cancelados.length})
          </button>
          <button onClick={() => setPestanaActiva('ganadores')}
            style={{ padding: '9px 16px', background: pestanaActiva === 'ganadores' ? '#27ae60' : '#1e8449', color: '#fff', border: '1px solid #52be80', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            🏆 Ganadores
          </button>
          <button onClick={() => setPestanaActiva('anfora')}
            style={{ padding: '9px 16px', background: pestanaActiva === 'anfora' ? '#E74C3C' : '#c0392b', color: '#fff', border: '1px solid #eb984e', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            🗳️ Vista Ánfora (Final)
          </button>
        </div>
      )}

      {/* CONTENEDOR DE PESTAÑAS */}
      <div style={{ background: '#1b2631', padding: '20px', borderRadius: '10px', border: '1px solid #34495e', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        
        {/* PESTAÑA: PARTICIPANTES */}
        {pestanaActiva === 'pendientes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: '#FFD700', margin: 0 }}>
                {sorteoObjActual ? `Participantes de: ${sorteoObjActual.nombre}` : 'Todos los Participantes'}
              </h3>
              <button onClick={async () => { await cargarDatosParticipantes(); mostrarAviso('Datos actualizados.'); }}
                style={{ padding: '8px 14px', background: '#2980b9', color: '#fff', border: '1px solid #5dade2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                Actualizar Lista
              </button>
            </div>

            {/* PANEL DE RESUMEN / KPIS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#17202a', border: '1px solid #5499c7', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#85c1e9', fontWeight: 'bold' }}>VALIDADOS</span>
                <span style={{ fontSize: '20px', color: '#2ecc71', fontWeight: 'bold' }}>{pagados.length}</span>
              </div>
              <div style={{ background: '#17202a', border: '1px solid #f39c12', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#f8c471', fontWeight: 'bold' }}>PENDIENTES</span>
                <span style={{ fontSize: '20px', color: '#f39c12', fontWeight: 'bold' }}>{pendientes.length}</span>
              </div>
              <div style={{ background: '#17202a', border: '1px solid #c0392b', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '12px', color: '#f1948a', fontWeight: 'bold' }}>ANULADOS</span>
                <span style={{ fontSize: '20px', color: '#e74c3c', fontWeight: 'bold' }}>{cancelados.length}</span>
              </div>
            </div>

            {cargandoPendientes ? (
              <p style={{ color: '#ccc' }}>Cargando participantes...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ...pendientes.map(o => ({ ...o, tipoLista: 'pendiente' })),
                  ...pagados.map(o => ({ ...o, tipoLista: 'pagado' })),
                  ...cancelados.map(o => ({ ...o, tipoLista: 'cancelado' }))
                ]
                  .sort((a, b) => (a.tipoLista === 'pendiente' ? -1 : 1))
                  .map((orden) => {
                    const cantTotal = orden.cantidad_tickets || orden.cantidad_ticket || orden.cantidad || 1;
                    const esPendiente = orden.estado === 'pendiente';
                    const esCancelado = orden.estado === 'cancelado';
                    const esValidado = ['verificado', 'pagado', 'ganador'].includes(orden.estado);

                    return (
                      <div key={orden.id} onClick={() => { setOrdenSeleccionada(orden); setModalAbierto(true); }}
                        style={{
                          background: esPendiente ? '#2c2200' : esCancelado ? '#2b1d1d' : '#222',
                          padding: '12px',
                          borderRadius: '6px',
                          border: `1px solid ${esPendiente ? '#FFD700' : esCancelado ? '#922b21' : '#444'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 'bold', color: esPendiente ? '#FFD700' : esCancelado ? '#e74c3c' : '#fff' }}>
                            {orden.nombre_cliente} {esPendiente ? '(PENDIENTE)' : esCancelado ? '(ANULADO)' : ''}
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#aaa' }}>
                            Tickets: {cantTotal} | Monto: S/ {orden.monto} | Op: {orden.codigo_operacion || 'N/A'}
                          </p>
                        </div>
                        <div>
                          {esPendiente && (
                            <button onClick={(e) => {
                              e.stopPropagation();
                              setModalConfirmacion({
                                abierto: true,
                                titulo: 'Validar Pago y Enviar WhatsApp',
                                mensaje: `¿Estás seguro de confirmar el pago de ${orden.nombre_cliente}, generar su código de ticket y abrir el mensaje de WhatsApp enriquecido?`,
                                onAceptar: () => ejecutarConfirmarPago(orden)
                              });
                            }}
                              style={{ padding: '8px 12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                              Validar
                            </button>
                          )}
                          {esValidado && (
                            <span style={{ padding: '6px 12px', background: '#1e3d2f', color: '#2ecc71', border: '1px solid #27ae60', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block' }}>
                              ✓ Validado
                            </span>
                          )}
                          {esCancelado && (
                            <span style={{ padding: '6px 12px', background: '#3d1e1e', color: '#e74c3c', border: '1px solid #c0392b', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block' }}>
                              Ticket Cancelado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* MODAL DE DETALLES */}
            {modalAbierto && ordenSeleccionada && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px', boxSizing: 'border-box' }}>
                <div style={{ background: '#18222c', padding: '28px 24px', borderRadius: '12px', width: '100%', maxWidth: '480px', border: '2px solid #FFD700', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', textAlign: 'left', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ color: '#FFD700', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #34495e', paddingBottom: '12px', fontSize: '18px', textAlign: 'center', letterSpacing: '0.5px' }}>
                    Detalles del Participante
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px', paddingTop: '2px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Nombre:</span>
                      <span style={{ color: '#FFD700', fontWeight: 'bold', textAlign: 'left', width: '55%', fontSize: '16px', textTransform: 'uppercase' }}>
                        {ordenSeleccionada.nombre_cliente || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>DNI:</span>
                      <span style={{ color: '#fff', textAlign: 'left', width: '55%' }}>{ordenSeleccionada.dni || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Celular:</span>
                      <span style={{ color: '#fff', textAlign: 'left', width: '55%' }}>{ordenSeleccionada.celular || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Lugar / Ciudad:</span>
                      <span style={{ color: '#f39c12', fontWeight: 'bold', textAlign: 'left', width: '55%' }}>
                        {ordenSeleccionada.lugar || ordenSeleccionada.ciudad || ordenSeleccionada.provincia || ordenSeleccionada.ubicacion || 'No especificado'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Sorteo:</span>
                      <span style={{ color: '#fff', textAlign: 'left', width: '55%' }}>{ordenSeleccionada.sorteo || 'General'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Cantidad de Tickets:</span>
                      <span style={{ color: '#FFD700', fontWeight: 'bold', textAlign: 'left', width: '55%' }}>
                        {ordenSeleccionada.cantidad_tickets || ordenSeleccionada.cantidad_ticket || ordenSeleccionada.cantidad || '1'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Monto Pagado:</span>
                      <span style={{ color: '#2ecc71', fontWeight: 'bold', textAlign: 'left', width: '55%' }}>S/ {ordenSeleccionada.monto || '0.00'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Fecha de Compra:</span>
                      <span style={{ color: '#ccc', textAlign: 'left', width: '55%', fontSize: '13px' }}>
                        {(() => {
                          const fechaCruda = ordenSeleccionada.fecha_compra || ordenSeleccionada.created_at || ordenSeleccionada.fecha || ordenSeleccionada.inserted_at;
                          return fechaCruda ? new Date(fechaCruda).toLocaleString() : 'No registrada';
                        })()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Estado:</span>
                      <span style={{ color: ordenSeleccionada.estado === 'ganador' ? '#FFD700' : '#52be80', fontWeight: 'bold', textAlign: 'left', width: '55%' }}>
                        {ordenSeleccionada.estado?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #243342', paddingBottom: '8px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Validado el:</span>
                      <span style={{ color: '#ccc', textAlign: 'left', width: '55%', fontSize: '13px' }}>{ordenSeleccionada.fecha_validacion || 'Pendiente'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '4px' }}>
                      <span style={{ color: '#85c1e9', fontWeight: 'bold', width: '45%' }}>Código Ticket:</span>
                      <span style={{ color: '#FFD700', fontWeight: 'bold', textAlign: 'left', width: '55%' }}>{ordenSeleccionada.codigo_ticket || 'No generado'}</span>
                    </div>
                  </div>

                  {/* BOTONES DE ACCIÓN DENTRO DEL MODAL */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '22px', flexWrap: 'wrap' }}>
                    {['verificado', 'pagado'].includes(ordenSeleccionada.estado) && (
                      <button
                        onClick={() => {
                          setModalConfirmacion({
                            abierto: true,
                            titulo: '¿Anular/Invalidar esta Compra?',
                            mensaje: `Estás a punto de invalidar el ticket de ${ordenSeleccionada.nombre_cliente}. Esto retirará su código del ánfora y ya no participará del sorteo.`,
                            onAceptar: () => ejecutarInvalidarCompra(ordenSeleccionada.id)
                          });
                        }}
                        style={{ flex: 1, padding: '12px', background: '#922b21', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#fff', fontSize: '13px' }}
                      >
                        ❌ Invalidar Compra
                      </button>
                    )}
                    {ordenSeleccionada.estado === 'cancelado' && (
                      <button
                        onClick={() => {
                          setModalConfirmacion({
                            abierto: true,
                            titulo: '¿Revertir Anulación?',
                            mensaje: `Estás a punto de quitar la anulación a ${ordenSeleccionada.nombre_cliente} y pasarlo a estado pendiente para que puedas validarlo nuevamente.`,
                            onAceptar: () => ejecutarRestaurarCompra(ordenSeleccionada.id)
                          });
                        }}
                        style={{ flex: 1, padding: '12px', background: '#27ae60', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#fff', fontSize: '13px' }}
                      >
                        Revertir anulación
                      </button>
                    )}
                    <button
                      onClick={() => setModalAbierto(false)}
                      style={{ flex: 1, padding: '12px', background: '#FFD700', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#111', fontSize: '14px' }}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* PESTAÑA: GANADORES */}
        {pestanaActiva === 'ganadores' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>Módulo de Declaración de Ganadores</h3>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '15px' }}>Selecciona al participante ganador para destacarlo oficialmente asignando su ticket, puesto y foto.</p>
            {pagados.length === 0 ? <p style={{ color: '#888' }}>No hay participantes aprobados aún.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pagados.map((orden) => {
                  const cantTotal = orden.cantidad_tickets || orden.cantidad_ticket || orden.cantidad || 1;
                  return (
                    <div key={orden.id} style={{ background: orden.estado === 'ganador' ? '#2c2200' : '#222', padding: '15px', borderRadius: '6px', border: orden.estado === 'ganador' ? '2px solid #FFD700' : '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: orden.estado === 'ganador' ? '#FFD700' : '#fff' }}>
                          {orden.nombre_cliente} - DNI: {orden.dni} {orden.estado === 'ganador' ? `[${orden.puesto_premio || 'GANADOR'}]` : ''}
                        </p>
                        <p style={{ margin: '0', fontSize: '13px', color: '#aaa' }}>Tickets: {cantTotal} | S/ {orden.monto} | Código: {orden.codigo_ticket || 'N/A'}</p>
                        {orden.estado === 'ganador' && orden.ticket_ganador && (
                          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#2ecc71' }}>🏆 <strong>Ticket Ganador:</strong> {orden.ticket_ganador}</p>
                        )}
                      </div>
                      
                      {orden.estado !== 'ganador' ? (
                        <button onClick={() => abrirModalDeclararGanador(orden)}
                          style={{ padding: '8px 14px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                          Marcar Ganador
                        </button>
                      ) : (
                        <button onClick={() => abrirModalDeclararGanador(orden)}
                          style={{ padding: '8px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                          Editar Ganador
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* PESTAÑA: ÁNFORA */}
        {pestanaActiva === 'anfora' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#FFD700', margin: 0 }}>Vista para Impresión (Ánfora / Tómbola Física)</h3>
              <button onClick={() => window.print()} style={{ padding: '8px 14px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Imprimir Lista
              </button>
            </div>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '15px' }}>Esta vista está optimizada para listar los participantes validados que ingresarán al sorteo físico.</p>
            {pagados.length === 0 ? <p style={{ color: '#888' }}>No hay participantes aprobados todavía.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pagados.map((orden, index) => {
                  const cantTotal = orden.cantidad_tickets || orden.cantidad_ticket || orden.cantidad || 1;
                  return (
                    <div key={orden.id} style={{ background: '#222', padding: '10px 15px', borderRadius: '4px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#ccc' }}>#{index + 1} - <strong>{orden.nombre_cliente}</strong> (DNI: {orden.dni})</span>
                      <span style={{ fontSize: '13px', color: '#FFD700', fontWeight: 'bold' }}>{cantTotal} Tickets (S/ {orden.monto}) {orden.codigo_ticket ? `(${orden.codigo_ticket})` : ''}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* PESTAÑA: HISTORIAL */}
        {pestanaActiva === 'historial' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: '#FFD700', margin: 0 }}>Historial, Reportes y Auditoría</h3>
              <button onClick={exportarACSV} style={{ padding: '8px 14px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Descargar Reporte CSV
              </button>
            </div>
            <input type="text" placeholder="Buscar por Nombre, DNI o Código de Ticket..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', marginBottom: '15px', boxSizing: 'border-box' }} />
            {pagadosConBusqueda.length === 0 ? <p style={{ color: '#888' }}>No se encontraron registros.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pagadosConBusqueda.map((orden) => {
                  const cantTotal = orden.cantidad_tickets || orden.cantidad_ticket || orden.cantidad || 1;
                  const fechaCruda = orden.fecha_compra || orden.created_at || orden.fecha || orden.inserted_at;
                  return (
                    <div key={orden.id} style={{ background: '#222', padding: '12px', borderRadius: '6px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#27ae60' }}>{orden.nombre_cliente} - DNI: {orden.dni}</p>
                        <p style={{ margin: '0', fontSize: '13px', color: '#aaa' }}>Sorteo: {orden.sorteo || 'General'} | Tickets: {cantTotal} | S/ {orden.monto}</p>
                        {orden.codigo_ticket && <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#FFD700' }}><strong>Código:</strong> {orden.codigo_ticket}</p>}
                        <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#777' }}>Compra: {fechaCruda ? new Date(fechaCruda).toLocaleString() : 'N/A'} | Validación: {orden.fecha_validacion || 'N/A'}</p>
                      </div>
                      <span style={{ color: orden.estado === 'ganador' ? '#FFD700' : '#52b788', fontSize: '12px', fontWeight: 'bold' }}>{orden.estado.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* PESTAÑA: CREADOR DE SORTEOS */}
        {pestanaActiva === 'creador_sorteos' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>Gestión y Creación de Sorteos</h3>
            <form onSubmit={crearSorteo} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', background: '#222', padding: '15px', borderRadius: '6px' }}>
              <input type="text" placeholder="Nombre del Sorteo" value={nombreSorteo}
                onChange={(e) => setNombreSorteo(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
              <input type="number" step="0.01" placeholder="Precio (S/)" value={precioSorteo}
                onChange={(e) => setPrecioSorteo(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
              <input type="datetime-local" value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
              <input type="text" placeholder="URL de la Imagen o Multimedia (Opcional)"
                value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
              <button type="submit" style={{ padding: '10px', backgroundColor: '#FFD700', color: '#111', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Crear Sorteo</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sorteos.map((s) => (
                <div key={s.id} style={{ background: '#222', padding: '12px', borderRadius: '6px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#FFD700' }}>{s.nombre} (S/ {s.precio})</p>
                    <p style={{ margin: '0', fontSize: '12px', color: s.estado === 'activo' ? '#27ae60' : '#e74c3c' }}>Estado: {s.estado}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => cambiarEstadoSorteo(s.id, s.estado)}
                      style={{ padding: '7px 14px', background: s.estado === 'activo' ? '#c0392b' : '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      {s.estado === 'activo' ? 'Finalizar' : 'Activar'}
                    </button>
                    <button onClick={() => {
                      setModalConfirmacion({
                        abierto: true,
                        titulo: 'Eliminar Sorteo',
                        mensaje: `¿Estás seguro de eliminar el sorteo "${s.nombre}"? Esta acción no se puede deshacer.`,
                        onAceptar: () => ejecutarEliminarSorteo(s.id)
                      });
                    }}
                      style={{ padding: '7px 14px', background: '#512e5f', color: '#ff8080', border: '1px solid #7d3c98', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PESTAÑA: COMUNICADOS */}
        {pestanaActiva === 'comunicados' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>Enviar Comunicado al Cliente</h3>
            <form onSubmit={guardarComunicado} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea placeholder="Escribe un anuncio importante que verán los clientes..."
                value={mensajeComunicado} onChange={(e) => setMensajeComunicado(e.target.value)}
                rows={4} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '10px 16px', background: '#FFD700', color: '#111', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Guardar Comunicado</button>
            </form>
          </>
        )}

        {/* PESTAÑA: MODERACIÓN DE LIVE / COMENTARIOS */}
        {pestanaActiva === 'moderacion' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>🛡️ Moderación de Comentarios en Vivo</h3>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '20px' }}>
              Controla la interacción del público durante las transmisiones en vivo de los sorteos. Habilita o deshabilita el chat y bloquea usuarios malintencionados.
            </p>
            <div style={{ background: '#222', padding: '16px', borderRadius: '8px', border: '1px solid #444', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>Estado del Chat en Vivo</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                  {permitirComentarios ? 'El chat está actualmente abierto para todos los participantes.' : 'El chat está bloqueado / desactivado temporalmente.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setPermitirComentarios(!permitirComentarios);
                  mostrarAviso(permitirComentarios ? 'Chat desactivado para los usuarios.' : 'Chat habilitado correctamente.');
                }}
                style={{ padding: '10px 18px', background: permitirComentarios ? '#c0392b' : '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                {permitirComentarios ? 'Desactivar Chat' : 'Permitir Comentarios'}
              </button>
            </div>
            <div style={{ background: '#222', padding: '16px', borderRadius: '8px', border: '1px solid #444' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#FFD700' }}>Bloquear Usuario Inapropiado</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Nombre o ID del usuario a bloquear..."
                  value={usuarioBloquearInput}
                  onChange={(e) => setUsuarioBloquearInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff', boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => {
                    if (!usuarioBloquearInput.trim()) return;
                    setUsuariosBloqueados([...usuariosBloqueados, usuarioBloquearInput.trim()]);
                    setUsuarioBloquearInput("");
                    mostrarAviso('Usuario bloqueado de los comentarios con éxito.');
                  }}
                  style={{ padding: '10px 16px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Bloquear
                </button>
              </div>
              <h5 style={{ color: '#ccc', marginBottom: '8px' }}>Usuarios Bloqueados Actuales ({usuariosBloqueados.length}):</h5>
              {usuariosBloqueados.length === 0 ? (
                <p style={{ color: '#777', fontSize: '13px', margin: 0 }}>No hay usuarios bloqueados en este momento.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {usuariosBloqueados.map((usr, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '8px 12px', borderRadius: '4px', border: '1px solid #333' }}>
                      <span style={{ fontSize: '13px', color: '#ff8080' }}>{usr}</span>
                      <button
                        onClick={() => {
                          setUsuariosBloqueados(usuariosBloqueados.filter((_, i) => i !== idx));
                          mostrarAviso('Usuario desbloqueado / permitido nuevamente.');
                        }}
                        style={{ padding: '4px 8px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}