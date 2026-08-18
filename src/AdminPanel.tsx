import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(false);
  
  // Estado para el correo y error
  const [email, setEmail] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  // Referencia directa para leer la contraseña sin bloqueos
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setCargandoAuth(false);
        if (session) cargarPendientes();
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setCargandoAuth(false);
        if (session) cargarPendientes();
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

  const confirmarPago = async (idOrden: any) => {
    if (!confirm('¿Estás seguro de confirmar este pago?')) return;

    try {
      const { error } = await supabase
        .from('tickets_ordenes')
        .update({ estado: 'pagado' })
        .eq('id', idOrden);

      if (error) throw error;

      alert('¡Pago confirmado con éxito!');
      cargarPendientes();
    } catch (error: any) {
      console.error('Error al confirmar pago:', error.message);
      alert('Hubo un error al confirmar el pago.');
    }
  };

  // Función de inicio de sesión con diagnóstico en consola
  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    if (!supabase) return;

    const passwordValue = passwordRef.current?.value || '';

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordValue,
    });

    if (error) {
      console.error("Error detallado de Supabase:", error.message);
      setErrorLogin('Error: ' + error.message);
    } else {
      console.log("¡Logueado con éxito!", data);
    }
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

  // SI NO ESTÁ LOGUEADO: Mostrar formulario de Correo y Contraseña
  if (!session) {
    return (
      <div style={{ backgroundColor: '#1a1a1a', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ border: '2px solid #FFD700', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '100%', background: '#222' }}>
          <h2 style={{ color: '#FFD700', marginBottom: '10px' }}>Panel de Administración</h2>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>
            Acceso restringido únicamente para el organizador.
          </p>
          
          <form onSubmit={handleLoginEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Correo electrónico</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu_correo@gmail.com" 
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#ccc' }}>Contraseña</label>
              <input 
                type="password" 
                ref={passwordRef}
                placeholder="••••••••" 
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box', marginTop: '4px' }}
              />
            </div>
            {errorLogin && <p style={{ color: '#ff4d4d', fontSize: '13px', margin: '0' }}>{errorLogin}</p>}
            
            <button 
              type="submit"
              style={{ 
                padding: '12px 20px', backgroundColor: '#FFD700', color: '#111', 
                fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer',
                width: '100%', fontSize: '14px', marginTop: '10px'
              }}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // SI ESTÁ LOGUEADO: Mostrar el Centro de Mando
  return (
    <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFD700', margin: 0, fontSize: '24px' }}>Centro de Mando</h1>
          <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '13px' }}>Bienvenido, {session.user.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
        <h3 style={{ color: '#FFD700', marginTop: 0 }}>Órdenes Pendientes de Validación</h3>
        
        {cargandoPendientes ? (
          <p style={{ color: '#ccc', fontSize: '14px' }}>Cargando órdenes pendientes...</p>
        ) : pendientes.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px' }}>No hay pagos pendientes en este momento. ¡Todo al día!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            {pendientes.map((orden) => (
              <div key={orden.id} style={{ background: '#222', padding: '15px', borderRadius: '6px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#FFD700' }}>Sorteo: {orden.sorteo || 'General'}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '14px' }}><strong>Cliente:</strong> {orden.nombre_cliente}</p>
                  <p style={{ margin: '0 0 3px 0', fontSize: '13px', color: '#aaa' }}><strong>DNI:</strong> {orden.dni} | <strong>Celular:</strong> {orden.celular || 'No registrado'}</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#aaa' }}><strong>Cantidad:</strong> {orden.cantidad_ticket} tickets | <strong>Monto:</strong> S/ {orden.monto}</p>
                </div>
                <button 
                  onClick={() => confirmarPago(orden.id)}
                  style={{ padding: '10px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  ✓ Confirmar Pago
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}