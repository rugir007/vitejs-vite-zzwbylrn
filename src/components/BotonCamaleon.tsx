import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Asegúrate de que la ruta a tu cliente de Supabase sea correcta

interface BotonCamaleonProps {
  esModoEnVivo: boolean;
  onToggleModo: () => void;
  onAbrirModal: (tipo: string) => void;
  reproducirSonido: (tipo: 'agua_hover' | 'agua_click') => void;
}

export default function BotonCamaleon({ 
  esModoEnVivo, 
  onToggleModo, 
  onAbrirModal, 
  reproducirSonido 
}: BotonCamaleonProps) {
  
  const tamanoCirculo = '65px';

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: tamanoCirculo }}>
      <button
        onMouseEnter={() => reproducirSonido('agua_hover')}
        onClick={() => {
          reproducirSonido('agua_click');
          
          // Si está en vivo abre el modal EN VIVO, si no, abre COMUNIDAD
          const modalDestino = esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD';
          onAbrirModal(modalDestino);

          // NOTA: Quitamos el onToggleModo de aquí si hacía que el modal se redibuje 
          // o alterne el estado global mientras el usuario intenta escribir sus datos.
        }}
        className={`boton-base animacion-circulo-vivo ${esModoEnVivo ? 'camaleon-vivo latido-vivo' : ''}`}
        style={{
          width: tamanoCirculo,
          height: tamanoCirculo,
          borderRadius: '50%',
          margin: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 0
        }}
      >
        <img 
          src={esModoEnVivo ? "./envivo.png" : "./comunidad.png"} 
          alt="Camaleon Modo" 
          style={{ width: '120%', height: '120%', objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </button>

      <span style={{ 
        color: '#E0F7FA', 
        fontWeight: 'bold', 
        fontSize: '0.65rem', 
        textAlign: 'center', 
        pointerEvents: 'none', 
        whiteSpace: 'nowrap', 
        textShadow: '0 0 5px #000', 
        transform: 'translateY(2px)' 
      }}>
        {esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD'}
      </span>
    </div>
  );
}