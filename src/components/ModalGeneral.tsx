import React, { useState } from 'react';

interface ModalGeneralProps {
  modalAbierto: string | null;
  onClose: () => void;
  esModoEnVivo: boolean;
  setEsModoEnVivo: (valor: boolean) => void;
}

export default function ModalGeneral({
  modalAbierto,
  onClose,
  esModoEnVivo,
  setEsModoEnVivo
}: ModalGeneralProps) {
  // Estados locales para el registro de la comunidad / en vivo
  const [usuarioRegistrado, setUsuarioRegistrado] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [telefonoUsuario, setTelefonoUsuario] = useState('');

  if (!modalAbierto || modalAbierto === 'COMPRAR TICKET') return null; // Si no hay modal o es el de compra (que ya está separado), no renderiza nada.

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
      {/* Estilo exacto de la animación sparkle recuperado del código original */}
      <style>{`
        @keyframes sparkle { 
          0% { box-shadow: 0 0 5px #25D366; } 
          50% { box-shadow: 0 0 20px #25D366, 0 0 40px #fff; } 
          100% { box-shadow: 0 0 5px #25D366; } 
        }
        .boton-destello { 
          animation: sparkle 1.5s infinite; 
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
          {modalAbierto}
        </h2>
        
        {/* REGISTRO OBLIGATORIO PARA CHAT / EN VIVO */}
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
            <p style={{ fontSize: '1.1rem', color: '#25D366' }}>¡Hola, {nombreUsuario}! Ya estás conectado al chat general de Playa Dorada.</p>
            <div style={{ background: '#111', padding: '15px', borderRadius: '8px', marginTop: '15px', height: '120px', overflowY: 'auto', textAlign: 'left', fontSize: '0.9rem', border: '1px solid #333' }}>
              <p style={{ margin: '5px 0' }}>🤖 <b>Sistema:</b> ¡Bienvenido a la comunidad!</p>
              <p style={{ margin: '5px 0' }}>👤 <b>Carlos M.:</b> ¡Listo para el gran sorteo en Bambamarca!</p>
            </div>
          </div>
        ) : modalAbierto === 'TESORO' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '320px', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden', padding: '20px' }}>
            <h2 style={{ color: '#FFD700', margin: '0 0 10px 0', fontSize: '20px' }}>¡Tesoro Encontrado!</h2>
            <p style={{ color: '#fff', fontSize: '14px', textAlign: 'center', margin: '0 0 20px 0' }}>
              Has abierto el cofre del tesoro. ¡Pronto habrá más sorpresas aquí!
            </p>
            <button 
              onClick={onClose} 
              style={{ backgroundColor: '#FFD700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', width: '100%' }}
            >
              CERRAR
            </button>
          </div>
        ) : modalAbierto === 'WHATSAPP' ? (
          <div>
            <p style={{ marginBottom: '20px' }}>💬 Comunícate directamente con nuestro equipo de atención al cliente en Playa Dorada.</p>
            <button 
              onClick={() => window.open('https://wa.me/51976610071?text=Hola,%20deseo%20más%20información%20sobre%20Playa%20Dorada', '_blank')} 
              className="boton-destello" 
              style={{ width: '100%', padding: '14px', background: '#25D366', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '1.0rem', cursor: 'pointer' }}
            >
              Abrir WhatsApp Oficial
            </button>
          </div>
        ) : modalAbierto === 'CRONOMETRO' ? (
          <div style={{ textAlign: 'left' }}>
            <p>📍 <strong>Lugar:</strong> Playa Dorada / Plaza Pecuaria, Bambamarca</p>
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
        ) : (
          <p>
            {modalAbierto === 'SORTEOS' && "Consulta nuestros sorteos vigentes. ¡Mucha Suerte!"}
            {modalAbierto === 'MIS TICKETS' && "Tus números de la suerte están registrados aquí. ¡A ganar!"}
            {modalAbierto === 'GANADORES' && "¡La historia la escriben los ganadores! Mira quienes ya celebran."}
            {modalAbierto === 'NOSOTROS' && "Construimos emociones y experiencias únicas en el corazón de Cajamarca."}
            {modalAbierto === 'CONTACTO' && "Tu opinión vale oro. Contacta directamente con soporte."}
            {modalAbierto === 'PREMIO 1' && "¡Un premio diseñado para un ganador excepcional!"}
            {modalAbierto === 'PREMIO 2' && "¡Atrévete a ir por más! Podría cambiar tu día."}
            {modalAbierto === 'PREMIO 3' && "¡La gran sorpresa! Podría ser tuya hoy mismo."}
          </p>
        )}
        
        <button onClick={onClose} style={{ marginTop: '20px', padding: '10px 20px', background: '#FFD700', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>CERRAR</button>
      </div>
    </div>
  );
}