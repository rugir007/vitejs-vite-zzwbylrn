import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AdminPanel from '../AdminPanel';

export default function LlaveMaestra() {
  const [session, setSession] = useState(null);
  const [verSistema, setVerSistema] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para el Enlace Mágico
  const [emailInput, setEmailInput] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState('');
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);

  // 📋 LISTA BLANCA DE ADMINISTRADORES
  const correosPermitidos = [
    "rugir007@gmail.com",          // Tu correo principal actual
    "playadorada@gmail.com"        // Futuro correo institucional
  ];

  useEffect(() => {
    // 1. Revisar sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // 3. DETECTOR SECRETO DE URL: Si entras con ?admin=true, se abre el modal automáticamente
    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get('admin') === 'true') {
      setMostrarModalLogin(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  // Función para enviar el Magic Link
  const handleEnviarMagicLink = async (e) => {
    e.preventDefault();
    setMensajeEstado('');
    
    // Validar si el correo está en la lista blanca
    if (!correosPermitidos.includes(emailInput.trim().toLowerCase())) {
      setMensajeEstado('❌ Acceso denegado: Este correo no está autorizado.');
      return;
    }

    setCargandoEnvio(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setCargandoEnvio(false);

    if (error) {
      setMensajeEstado('❌ Error al enviar el correo. Inténtalo de nuevo.');
    } else {
      setMensajeEstado('✅ ¡Listo! Revisa tu bandeja de entrada en Gmail.');
    }
  };

  if (loading) return null;

  const usuarioActual = session?.user?.email;
  const esAdmin = usuarioActual && correosPermitidos.includes(usuarioActual);

  // Si NO es admin, la pantalla está 100% limpia. Solo se abre el modal si usas ?admin=true en el navegador
  if (!esAdmin) {
    return (
      <>
        {mostrarModalLogin && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex',
            justifyContent: 'center', alignItems: 'center'
          }}>
            <form onSubmit={handleEnviarMagicLink} style={{
              background: '#1a1a1a', padding: '25px', borderRadius: '12px',
              border: '1px solid #FFD700', width: '90%', maxWidth: '320px',
              display: 'flex', flexDirection: 'column', gap: '12px', color: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
            }}>
              <h3 style={{ margin: 0, color: '#FFD700', textAlign: 'center', fontSize: '16px' }}>🔐 Acceso Propietario</h3>
              <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', margin: 0 }}>
                Ingresa tu correo autorizado para recibir tu enlace mágico.
              </p>

              {mensajeEstado && (
                <p style={{ fontSize: '11px', margin: 0, textAlign: 'center', color: mensajeEstado.includes('✅') ? '#00ffcc' : '#ff4d4d', fontWeight: 'bold' }}>
                  {mensajeEstado}
                </p>
              )}
              
              <input 
                type="email" 
                placeholder="tucorreo@gmail.com" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', fontSize: '14px' }}
                required
              />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button 
                  type="submit" 
                  disabled={cargandoEnvio}
                  style={{ flex: 1, padding: '10px', background: '#FFD700', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                  {cargandoEnvio ? 'Enviando...' : 'Enviar Enlace'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setMostrarModalLogin(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }} 
                  style={{ padding: '10px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        )}
      </>
    );
  }

  // Si SÍ es admin, aparece el botón dorado MASTER arriba a la derecha
  return (
    <>
      {!verSistema && (
        <button 
          onClick={() => setVerSistema(true)}
          title="Acceso de Propietario"
          style={{ 
            position: 'absolute', top: '8px', right: '8px', zIndex: 9999, 
            background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', 
            border: '1px solid rgba(0,0,0,0.3)', padding: '5px 9px', borderRadius: '6px', 
            fontWeight: '900', cursor: 'pointer', fontSize: '9px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)', letterSpacing: '0.5px'
          }}
        >
          🔐 MASTER
        </button>
      )}

      {verSistema && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          zIndex: 10000, background: '#121212', overflowY: 'auto' 
        }}>
          <AdminPanel onVolverApp={() => setVerSistema(false)} />
        </div>
      )}
    </>
  );
}