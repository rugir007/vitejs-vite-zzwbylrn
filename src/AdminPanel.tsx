import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // <-- SIN LAS BARRAS ADELANTE

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    // Verificar si ya hay una sesión activa de Google
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setCargandoAuth(false);
      });

      // Escuchar cambios en la autenticación (login/logout)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setCargandoAuth(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLoginGoogle = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      alert('Error al iniciar sesión con Google: ' + error.message);
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

  // SI NO ESTÁ LOGUEADO: Mostrar pantalla de acceso exclusivo
  if (!session) {
    return (
      <div style={{ backgroundColor: '#1a1a1a', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ border: '2px solid #FFD700', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', background: '#222' }}>
          <h2 style={{ color: '#FFD700', marginBottom: '10px' }}>Panel de Administración</h2>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>
            Acceso restringido únicamente para el organizador del sorteo.
          </p>
          <button 
            onClick={handleLoginGoogle}
            style={{ 
              padding: '12px 20px', backgroundColor: '#fff', color: '#333', 
              fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', fontSize: '14px'
            }}
          >
            <span>🔐 Iniciar sesión con Google</span>
          </button>
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
        <p style={{ color: '#ccc', fontSize: '14px' }}>
          Aquí cargaremos la lista de las órdenes que los clientes vayan generando con sus códigos de 6 dígitos para que puedas aprobarlas.
        </p>
      </div>
    </div>
  );
}