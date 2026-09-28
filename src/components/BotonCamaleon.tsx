import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface BotonCamaleonProps {
  onAbrirModal: (tipo: string) => void;
  reproducirSonido: (tipo: 'agua_hover' | 'agua_click') => void;
  onEstadoEnVivoChange?: (enVivo: boolean) => void; // Prop opcional para sincronizar con App.tsx si se requiere
}

export default function BotonCamaleon({ 
  onAbrirModal, 
  reproducirSonido,
  onEstadoEnVivoChange 
}: BotonCamaleonProps) {
  
  const [esModoEnVivo, setEsModoEnVivo] = useState(false);
  const tamanoCirculo = '65px';

  useEffect(() => {
    // Función de sondeo directo (Poller) ultrarrápida
    const verificarEstadoRadical = async () => {
      try {
        const { data, error } = await supabase
          .from('transmisiones_en_vivo')
          .select('activa')
          .eq('activa', true)
          .maybeSingle();

        const activo = !error && data ? Boolean(data.activa) : false;

        setEsModoEnVivo(activo);
        
        // Si el padre quiere saber el estado en tiempo real, se lo notificamos
        if (onEstadoEnVivoChange) {
          onEstadoEnVivoChange(activo);
        }
      } catch (err) {
        setEsModoEnVivo(false);
        if (onEstadoEnVivoChange) {
          onEstadoEnVivoChange(false);
        }
      }
    };

    // 1. Ejecutar inmediatamente al abrir
    verificarEstadoRadical();

    // 2. Comprobar automáticamente cada 1.5 segundos
    const intervalo = setInterval(() => {
      verificarEstadoRadical();
    }, 1500);

    return () => {
      clearInterval(intervalo);
    };
  }, [onEstadoEnVivoChange]);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: tamanoCirculo }}>
      <button
        onMouseEnter={() => reproducirSonido('agua_hover')}
        onClick={() => {
          reproducirSonido('agua_click');
          
          // ¡Aquí está la clave! Evaluamos en el preciso milisegundo del clic su estado actual
          const modalDestino = esModoEnVivo ? 'EN VIVO' : 'COMUNIDAD';
          onAbrirModal(modalDestino);
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
          src="./comunidad.png" 
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