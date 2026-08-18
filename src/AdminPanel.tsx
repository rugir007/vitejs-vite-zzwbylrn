import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [pagados, setPagados] = useState<any[]>([]);
  const [sorteos, setSorteos] = useState<any[]>([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(false);
  
  const [sorteoSeleccionado, setSorteoSeleccionado] = useState<string>('todos');
  const [pestanaActiva, setPestanaActiva] = useState<'pendientes' | 'historial' | 'creador_sorteos' | 'comunicados' | 'anfora' | 'ganadores'>('pendientes');
  
  const [nombreSorteo, setNombreSorteo] = useState('');
  const [precioSorteo, setPrecioSorteo] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [mensajeComunicado, setMensajeComunicado] = useState('');
  const [notificacion, setNotificacion] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  const mostrarAviso = (texto: string, tipo: 'exito' | 'error' = 'exito') => {
    setNotificacion({ texto, tipo });
    setTimeout(() => {
      setNotificacion(null);
    }, 4000);
  };

  const [email, setEmail] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setCargandoAuth(false);
        if (session) {
          cargarPendientes();
          cargarHistorialPagados();
          cargarSorteos();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setCargandoAuth(false);
        if (session) {
          cargarPendientes();
          cargarHistorialPagados();
          cargarSorteos();
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const cargarPendientes = async () => {
    if (!supabase) return;
    setCargandoPendientes(true);
    try {
      const { data, error } = await supabase
        .from('tickets_ordenes')
        .select('*')
        .eq('estado', 'pendiente');

      if (error) throw error;
      setPendientes(data || []);
    } catch (error: any) {
      console.error('Error cargando pendientes:', error.message);
    } finally {
      setCargandoPendientes(false);
    }
  };

  const cargarHistorialPagados = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('tickets_ordenes')
        .select('*')
        .in('estado', ['pagado', 'ganador']);

      if (error) throw error;
      setPagados(data || []);
    } catch (error: any) {
      console.error('Error cargando historial:', error.message);
    }
  };

  const cargarSorteos = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('sorteos')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setSorteos(data || []);
      return data;
    } catch (error: any) {
      console.error('Error cargando sorteos:', error.message);
      return [];
    }
  };

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
      setNombreSorteo('');
      setPrecioSorteo('');
      setFechaCierre('');
      setImagenUrl('');

      await cargarSorteos(); 
      setPestanaActiva('pendientes');
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
    }
  };

  const eliminarSorteo = async (id: any) => {
    if (!confirm('¿Estás seguro de eliminar este sorteo? Esta acción no se puede deshacer.')) return;
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

  const confirmarPagoYWhatsApp = async (orden: any) => {
    if (!confirm('¿Estás seguro de confirmar este pago, generar el código y enviar el WhatsApp?')) return;
    try {
      const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);
      const nuevoCodigo = `TKT-${numeroAleatorio}`;
      const fechaActual = new Date().toLocaleString();

      const { error } = await supabase
        .from('tickets_ordenes')
        .update({ 
          estado: 'pagado', 
          fecha_validacion: fechaActual,
          codigo_ticket: nuevoCodigo 
        })
        .eq('id', orden.id);

      if (error) throw error;

      const celularCrudo = (orden.celular || '').toString().trim();
      const celularLimpio = celularCrudo.replace(/\D/g, '');
      const celularFinal = celularLimpio.startsWith('51') ? celularLimpio : `51${celularLimpio}`;

      const mensaje = `¡Hola ${orden.nombre_cliente}! 🎉 Confirmamos que tus ${orden.cantidad_ticket} tickets han sido validados con éxito. Tu código oficial es: *${nuevoCodigo}*. ¡Mucha suerte!`;
      
      window.open(`https://wa.me/${celularFinal}?text=${encodeURIComponent(mensaje)}`, '_blank');

      mostrarAviso('¡Pago confirmado y mensaje preparado!');
      cargarPendientes();
      cargarHistorialPagados();
    } catch (error: any) {
      console.error('Error:', error.message);
      mostrarAviso('Error al confirmar el pago.', 'error');
    }
  };

  const declararGanador = async (idOrden: any) => {
    if (!confirm('¿CONFIRMAR GANADOR? Esta acción marcará al cliente como el ganador oficial.')) return;
    try {
      const { error } = await supabase
        .from('tickets_ordenes')
        .update({ estado: 'ganador' })
        .eq('id', idOrden);

      if (error) throw error;
      mostrarAviso('¡Ganador declarado con éxito!');
      cargarHistorialPagados();
    } catch (error: any) {
      console.error('Error al declarar ganador:', error.message);
    }
  };

  const exportarACSV = () => {
    if (pagadosFiltrados.length === 0) {
      mostrarAviso('No hay datos para exportar en este sorteo.', 'error');
      return;
    }
    const encabezados = "ID,Cliente,DNI,Celular,Sorteo,Cantidad,Monto,Codigo Ticket,Estado,Fecha Validacion\n";
    const filas = pagadosFiltrados.map(o => `"${o.id}","${o.nombre_cliente}","${o.dni}","${o.celular || ''}","${o.sorteo || ''}",${o.cantidad_ticket},${o.monto},"${o.codigo_ticket || ''}","${o.estado}","${o.fecha_validacion || ''}"`).join("\n");
    
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
    setErrorLogin('');
    if (!supabase) return;
    const passwordValue = passwordRef.current?.value || '';
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwordValue });
    if (error) setErrorLogin('Correo o contraseña incorrectos.');
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

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

  const pendientesFiltrados = sorteoSeleccionado === 'todos' 
    ? pendientes 
    : pendientes.filter(o => o.sorteo_id === sorteoSeleccionado || o.sorteo === sorteoSeleccionado);

  const pagadosFiltrados = sorteoSeleccionado === 'todos' 
    ? pagados 
    : pagados.filter(o => o.sorteo_id === sorteoSeleccionado || o.sorteo === sorteoSeleccionado);

  const pagadosConBusqueda = pagadosFiltrados.filter(o => o.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) || o.dni?.includes(busqueda) || o.codigo_ticket?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '20px', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* NOTIFICACIÓN FLOTANTE */}
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

      {/* CABECERA (ÚNICA) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFD700', margin: 0, fontSize: '24px' }}>Centro de Mando Pro</h1>
          <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '13px' }}>Bienvenido, {session.user.email}</p>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 16px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* CONTROLES (SELECTOR Y REFRESCAR) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end', marginBottom: '20px', background: '#1a1a1a', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#FFD700', fontWeight: 'bold', fontSize: '14px' }}>🎯 Seleccionar Sorteo Activo para Análisis:</label>
          <select 
            value={sorteoSeleccionado} 
            onChange={(e) => setSorteoSeleccionado(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444', fontSize: '14px' }}
          >
            <option value="todos">-- Ver Todos los Sorteos (Consolidado General) --</option>
            {sorteos && sorteos.length > 0 ? (
              sorteos.map(s => (
                <option key={s.id} value={s.id}>{s.nombre} (S/ {s.precio})</option>
              ))
            ) : (
              <option disabled>No hay sorteos cargados (Presiona 🔄)</option>
            )}
          </select>
        </div>

        <button 
          onClick={async () => {
            const data = await cargarSorteos();
            if (data && data.length > 0) {
              mostrarAviso(`¡Sincronizado! Se encontraron ${data.length} sorteos.`);
            } else {
              mostrarAviso('La base de datos devolvió 0 sorteos.', 'error');
            }
          }}
          title="Forzar actualización desde Supabase"
          style={{ padding: '10px 14px', background: '#333', color: '#FFD700', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
        >
          🔄
        </button>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button onClick={() => setPestanaActiva('pendientes')} style={{ padding: '10px 16px', background: pestanaActiva === 'pendientes' ? '#FFD700' : '#222', color: pestanaActiva === 'pendientes' ? '#111' : '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Pendientes ({pendientesFiltrados.length})</button>
        <button onClick={() => setPestanaActiva('historial')} style={{ padding: '10px 16px', background: pestanaActiva === 'historial' ? '#FFD700' : '#222', color: pestanaActiva === 'historial' ? '#111' : '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Historial & Auditoría</button>
        <button onClick={() => setPestanaActiva('ganadores')} style={{ padding: '10px 16px', background: pestanaActiva === 'ganadores' ? '#FFD700' : '#222', color: pestanaActiva === 'ganadores' ? '#111' : '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🏆 Ganadores</button>
        <button onClick={() => setPestanaActiva('creador_sorteos')} style={{ padding: '10px 16px', background: pestanaActiva === 'creador_sorteos' ? '#FFD700' : '#222', color: pestanaActiva === 'creador_sorteos' ? '#111' : '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>⚙️ Creador de Sorteos ({sorteos.length})</button>
        <button onClick={() => setPestanaActiva('comunicados')} style={{ padding: '10px 16px', background: pestanaActiva === 'comunicados' ? '#FFD700' : '#222', color: pestanaActiva === 'comunicados' ? '#111' : '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Comunicados</button>
        <button onClick={() => setPestanaActiva('anfora')} style={{ padding: '10px 16px', background: pestanaActiva === 'anfora' ? '#FFD700' : '#222', color: pestanaActiva === 'anfora' ? '#111' : '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Vista Ánfora (Imprimir)</button>
      </div>

      {/* CONTENEDOR DE CONTENIDO DE LAS PESTAÑAS */}
      <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        
        {pestanaActiva === 'pendientes' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>Órdenes Pendientes de Validación</h3>
            {cargandoPendientes ? <p style={{ color: '#ccc' }}>Cargando...</p> : pendientesFiltrados.length === 0 ? <p style={{ color: '#888' }}>No hay pagos pendientes para este filtro.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                {pendientesFiltrados.map((orden) => (
                  <div key={orden.id} style={{ background: '#222', padding: '15px', borderRadius: '6px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#FFD700' }}>Sorteo: {orden.sorteo || 'General'}</p>
                      <p style={{ margin: '0 0 3px 0', fontSize: '14px' }}><strong>Cliente:</strong> {orden.nombre_cliente}</p>
                      <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#aaa' }}><strong>DNI:</strong> {orden.dni} | <strong>Celular:</strong> {orden.celular || 'N/A'}</p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#aaa' }}><strong>Tickets:</strong> {orden.cantidad_ticket} | <strong>Monto:</strong> S/ {orden.monto}</p>
                    </div>
                    <button onClick={() => confirmarPagoYWhatsApp(orden)} style={{ padding: '10px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✓ Validar & WhatsApp</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {pestanaActiva === 'historial' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: '#FFD700', margin: 0 }}>Historial, Reportes y Auditoría</h3>
              <button onClick={exportarACSV} style={{ padding: '8px 14px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📥 Descargar Reporte CSV</button>
            </div>
            <input type="text" placeholder="Buscar por Nombre, DNI o Código de Ticket..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', marginBottom: '15px', boxSizing: 'border-box' }} />
            {pagadosConBusqueda.length === 0 ? <p style={{ color: '#888' }}>No se encontraron registros.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pagadosConBusqueda.map((orden) => (
                  <div key={orden.id} style={{ background: '#222', padding: '12px', borderRadius: '6px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: '#27ae60' }}>{orden.nombre_cliente} - DNI: {orden.dni}</p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#aaa' }}>Sorteo: {orden.sorteo || 'General'} | Tickets: {orden.cantidad_ticket} | S/ {orden.monto}</p>
                      {orden.codigo_ticket && <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#FFD700' }}><strong>Código:</strong> {orden.codigo_ticket}</p>}
                      <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#777' }}>Validado el: {orden.fecha_validacion || 'Sin registro histórico'}</p>
                    </div>
                    <span style={{ color: orden.estado === 'ganador' ? '#FFD700' : '#52b788', fontSize: '12px', fontWeight: 'bold' }}>{orden.estado.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {pestanaActiva === 'ganadores' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>Módulo de Declaración de Ganadores</h3>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '15px' }}>Selecciona al participante ganador para destacarlo oficialmente en el sistema.</p>
            {pagadosFiltrados.length === 0 ? <p style={{ color: '#888' }}>No hay participantes aprobados aún en este sorteo.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pagadosFiltrados.map((orden) => (
                  <div key={orden.id} style={{ background: orden.estado === 'ganador' ? '#2c2200' : '#222', padding: '15px', borderRadius: '6px', border: orden.estado === 'ganador' ? '2px solid #FFD700' : '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: orden.estado === 'ganador' ? '#FFD700' : '#fff' }}>
                        {orden.nombre_cliente} - DNI: {orden.dni} {orden.estado === 'ganador' ? '🏆 [GANADOR]' : ''}
                      </p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#aaa' }}>Tickets: {orden.cantidad_ticket} | Código: {orden.codigo_ticket || 'N/A'} | Celular: {orden.celular || 'N/A'}</p>
                    </div>
                    {orden.estado !== 'ganador' && (
                      <button onClick={() => declararGanador(orden.id)} style={{ padding: '8px 14px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        Marcar Ganador
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {pestanaActiva === 'creador_sorteos' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>Gestión y Creación de Sorteos</h3>
            <form onSubmit={crearSorteo} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', background: '#222', padding: '15px', borderRadius: '6px' }}>
              <input type="text" placeholder="Nombre del Sorteo" value={nombreSorteo} onChange={(e) => setNombreSorteo(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
              <input type="number" step="0.01" placeholder="Precio (S/)" value={precioSorteo} onChange={(e) => setPrecioSorteo(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
              <input type="datetime-local" value={fechaCierre} onChange={(e) => setFechaCierre(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
              <input type="text" placeholder="URL de la Imagen o Multimedia (Opcional)" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#fff' }} />
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
                    <button onClick={() => cambiarEstadoSorteo(s.id, s.estado)} style={{ padding: '6px 12px', background: s.estado === 'activo' ? '#c0392b' : '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      {s.estado === 'activo' ? 'Finalizar' : 'Activar'}
                    </button>
                    <button onClick={() => eliminarSorteo(s.id)} style={{ padding: '6px 12px', background: '#444', color: '#ff4d4d', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {pestanaActiva === 'comunicados' && (
          <>
            <h3 style={{ color: '#FFD700', marginTop: 0 }}>Enviar Comunicado al Cliente</h3>
            <form onSubmit={guardarComunicado} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea placeholder="Escribe un anuncio importante que verán los clientes..." value={mensajeComunicado} onChange={(e) => setMensajeComunicado(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#FFD700', color: '#111', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Publicar Comunicado</button>
            </form>
          </>
        )}

        {pestanaActiva === 'anfora' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#FFD700', margin: 0 }}>Vista para Impresión (Ánfora / Tómbola Física)</h3>
              <button onClick={() => window.print()} style={{ padding: '8px 14px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Imprimir Lista</button>
            </div>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '15px' }}>Esta vista está optimizada para listar los participantes validados que ingresarán al sorteo físico según el filtro actual.</p>
            {pagadosFiltrados.length === 0 ? <p style={{ color: '#888' }}>No hay participantes aprobados todavía para este sorteo.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pagadosFiltrados.map((orden, index) => (
                  <div key={orden.id} style={{ background: '#222', padding: '10px 15px', borderRadius: '4px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#ccc' }}>#{index + 1} - <strong>{orden.nombre_cliente}</strong> (DNI: {orden.dni})</span>
                    <span style={{ fontSize: '13px', color: '#FFD700', fontWeight: 'bold' }}>{orden.cantidad_ticket} Tickets {orden.codigo_ticket ? `(${orden.codigo_ticket})` : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}