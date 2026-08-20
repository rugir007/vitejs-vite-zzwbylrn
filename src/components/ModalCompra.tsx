import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

// =================================================================
// COMPONENTE MODAL DE COMPRA CON PERSISTENCIA DE PAGO PENDIENTE (LOCALSTORAGE)
// =================================================================

export default function ModalCompra({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [nombre, setNombre] = useState('');
    const [dni, setDni] = useState('');
    const [celular, setCelular] = useState('');
    const [distrito, setDistrito] = useState('');
    const [region, setRegion] = useState('Lima');
    const [provincia, setProvincia] = useState('Lima');
    const [cantidad, setCantidad] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [ordenCreada, setOrdenCreada] = useState<any>(null);
    const [codigoOperacion, setCodigoOperacion] = useState('');
    const [pagoConfirmadoExito, setPagoConfirmadoExito] = useState(false);
    const [sorteos, setSorteos] = useState<any[]>([]);
    const [sorteoSeleccionadoId, setSorteoSeleccionadoId] = useState('');
  
    useEffect(() => {
      if (isOpen) {
        const cargarSorteosDisponibles = async () => {
          const { data, error } = await supabase
            .from('sorteos')
            .select('*')
            .eq('estado', 'activo')
            .order('id', { ascending: false });
  
          if (!error) {
            setSorteos(data || []);
          }
        };
        cargarSorteosDisponibles();
  
        // Verificar si el usuario ya tenía una orden pendiente guardada en su navegador
        const ordenGuardada = localStorage.getItem('sorteo_orden_pendiente');
        if (ordenGuardada) {
          try {
            const parsed = JSON.parse(ordenGuardada);
            setOrdenCreada(parsed);
          } catch (e) {
            localStorage.removeItem('sorteo_orden_pendiente');
          }
        }
      }
    }, [isOpen]);
  
    const sorteoActual = sorteos?.find(s => s.id.toString() === sorteoSeleccionadoId.toString());
    const precioUnitario = sorteoActual ? Number(sorteoActual.precio) : 5.00;
    const montoTotal = cantidad * precioUnitario;
  
    const PROVINCIAS_POR_REGION: { [key: string]: string[] } = {
      'Amazonas': ['Chachapoyas', 'Bagua', 'Bongará', 'Condorcanqui', 'Luya', 'Rodríguez de Mendoza', 'Utcubamba'],
      'Áncash': ['Huaraz', 'Aija', 'Antonio Raymondi', 'Asunción', 'Bolognesi', 'Carhuaz', 'Carlos Fermín Fitzcarrald', 'Casma', 'Corongo', 'Huari', 'Huarmey', 'Huaylas', 'Mariscal Luzuriaga', 'Ocros', 'Pallasca', 'Pomabamba', 'Recuay', 'Santa', 'Sihuas', 'Yungay'],
      'Apurímac': ['Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Chincheros', 'Grau', 'Cotabambas'],
      'Arequipa': ['Arequipa', 'Camaná', 'Caravelí', 'Castilla', 'Caylloma', 'Condesuyos', 'Islay', 'La Unión'],
      'Ayacucho': ['Huamanga', 'Cangallo', 'Huanca Sancos', 'Huanta', 'La Mar', 'Lucanas', 'Parinacochas', 'Páucar del Sara Sara', 'Sucre', 'Víctor Fajardo', 'Vilcas Huamán'],
      'Cajamarca': ['Cajamarca', 'Cajabamba', 'Celendín', 'Chota', 'Cutervo', 'Hualgayoc', 'Jaén', 'San Ignacio', 'San Marcos', 'San Miguel', 'San Pablo', 'Santa Cruz'],
      'Callao': ['Callao'],
      'Cusco': ['Cusco', 'Acomayo', 'Anta', 'Calca', 'Canas', 'Canchis', 'Chumbivilcas', 'Espinar', 'La Convención', 'Paruro', 'Paucartambo', 'Quispicanchi', 'Urubamba'],
      'Huancavelica': ['Huancavelica', 'Acobamba', 'Angaraes', 'Castrovirreyna', 'Churcampa', 'Huaytará', 'Tayacaja'],
      'Huánuco': ['Huánuco', 'Ambo', 'Dos de Mayo', 'Huacaybamba', 'Huamalíes', 'Leoncio Prado', 'Marañón', 'Pachitea', 'Puerto Inca', 'Lauricocha', 'Yarowilca'],
      'Ica': ['Ica', 'Chincha', 'Nasca', 'Palpa', 'Pisco'],
      'Junín': ['Huancayo', 'Concepción', 'Chanchamayo', 'Jauja', 'Junín', 'Satipo', 'Tarma', 'Yauli', 'Chupaca'],
      'La Libertad': ['Trujillo', 'Ascope', 'Bolívar', 'Chepén', 'Julcán', 'Otuzco', 'Pacasmayo', 'Pataz', 'Sánchez Carrión', 'Santiago de Chuco', 'Gran Chimú', 'Virú'],
      'Lambayeque': ['Chiclayo', 'Ferreñafe', 'Lambayeque'],
      'Lima': ['Lima', 'Barranca', 'Cajatambo', 'Canta', 'Cañete', 'Huaral', 'Huarochirí', 'Huaura', 'Oyón', 'Yauyos'],
      'Loreto': ['Maynas', 'Alto Amazonas', 'Loreto', 'Mariscal Ramón Castilla', 'Requena', 'Ucayali', 'Datem del Marañón', 'Putumayo'],
      'Madre de Dios': ['Tambopata', 'Manu', 'Tahuamanu'],
      'Moquegua': ['Mariscal Nieto', 'General Sánchez Cerro', 'Ilo'],
      'Pasco': ['Pasco', 'Daniel Alcides Carrión', 'Oxapampa'],
      'Piura': ['Piura', 'Ayabaca', 'Huancabamba', 'Morropón', 'Paita', 'Sullana', 'Talara', 'Sechura'],
      'Puno': ['Puno', 'Azángaro', 'Carabaya', 'Chucuito', 'El Collao', 'Huancané', 'Lampa', 'Melgar', 'Moho', 'San Antonio de Putina', 'San Román', 'Sandia', 'Yunguyo'],
      'San Martín': ['Moyobamba', 'Bellavista', 'El Dorado', 'Huallaga', 'Lamas', 'Mariscal Cáceres', 'Picota', 'San Martín', 'Tocache', 'Rioja'],
      'Tacna': ['Tacna', 'Candarave', 'Jorge Basadre', 'Tarata'],
      'Tumbes': ['Tumbes', 'Contralmirante Villar', 'Zarumilla'],
      'Ucayali': ['Coronel Portillo', 'Atalaya', 'Padre Abad', 'Purús']
    };
  
    const LISTA_REGIONES = Object.keys(PROVINCIAS_POR_REGION);
  
    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nuevaRegion = e.target.value;
      setRegion(nuevaRegion);
      const provinciasDisponibles = PROVINCIAS_POR_REGION[nuevaRegion] || [];
      setProvincia(provinciasDisponibles[0] || '');
    };
  
    const [codigoPedidoYape, setCodigoPedidoYape] = useState('');
  
    useEffect(() => {
      if (isOpen) {
        // Solo generamos un código nuevo si no hay una orden pendiente activa en el navegador
        const ordenGuardada = localStorage.getItem('sorteo_orden_pendiente');
        if (!ordenGuardada) {
          setCodigoPedidoYape(Math.floor(100000 + Math.random() * 900000).toString());
        }
      }
    }, [isOpen]);
  
    // Validaciones en tiempo real
    const partesNombre = nombre.trim().split(/\s+/).filter(Boolean);
    const esNombreValido = partesNombre.length >= 3 && nombre.trim().length >= 12;
    const esDniValido = /^\d{8}$/.test(dni) && !/^(\d)\1{7}$/.test(dni) && dni !== '12345678' && dni !== '87654321';
    const esCelularValido = /^9\d{8}$/.test(celular) && !/^(\d)\1{8}$/.test(celular);
    const invalidosOp = ['00000000', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999', '12345678', '87654321'];
    const esCodigoOpValido = /^\d{8}$/.test(codigoOperacion) && !invalidosOp.includes(codigoOperacion);
  
    const formularioCompleto = sorteoSeleccionadoId && esNombreValido && esDniValido && esCelularValido && distrito.trim().length > 2;
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formularioCompleto) return;
      
      const nuevaOrden = { id: codigoPedidoYape || Math.floor(100000 + Math.random() * 900000).toString(), monto: montoTotal };
      setOrdenCreada(nuevaOrden);
      // Guardar en el almacenamiento local del navegador por si se sale o se recarga
      localStorage.setItem('sorteo_orden_pendiente', JSON.stringify(nuevaOrden));
    };
  
    const confirmarPagoYape = async () => {
      if (!esCodigoOpValido) return;
  
      setCargando(true);
  
      try {
        const opTrim = codigoOperacion.trim();
        const { data: existente } = await supabase
          .from('tickets_ordenes')
          .select('id')
          .eq('codigo_operacion', opTrim)
          .maybeSingle();
  
        if (existente) {
          alert('Este código de operación ya ha sido registrado anteriormente.');
          setCargando(false);
          return;
        }
  
        const { error } = await supabase.from('tickets_ordenes').insert([
          {
            id_orden: ordenCreada?.id || codigoPedidoYape,
            sorteo: sorteoActual ? sorteoActual.nombre : 'Inauguración',
            estado: 'pendiente',
            nombre_cliente: nombre.trim().toUpperCase(),
            dni: dni.trim(),
            cantidad_tickets: cantidad,
            monto: montoTotal,
            celular: celular.trim(),
            distrito: distrito.trim().toUpperCase(),
            provincia: provincia,
            region: region,
            codigo_operacion: opTrim
          }
        ]);
  
        if (error) throw new Error(error.message);
  
        // Limpiar la orden pendiente del navegador al completar con éxito
        localStorage.removeItem('sorteo_orden_pendiente');
        setPagoConfirmadoExito(true);
      } catch (err: any) {
        console.error('Error al guardar:', err);
        alert('Error al registrar: ' + (err.message || 'Verifica la consola'));
      } finally {
        setCargando(false);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 9999, padding: '10px', overflowY: 'auto', boxSizing: 'border-box'
      }}>
        <div style={{
          backgroundColor: '#1a1a1a', border: '2px solid #FFD700', borderRadius: '12px',
          padding: '20px', width: '92%', maxWidth: '420px', color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box'
        }}>
          {!ordenCreada ? (
            <>
              <h2 style={{ color: '#FFD700', textAlign: 'center', marginBottom: '8px', fontSize: '20px' }}>COMPRAR TICKET</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ marginBottom: '4px', textAlign: 'left' }}>
                  <label style={{ display: 'block', marginBottom: '3px', color: '#FFD700', fontWeight: 'bold', fontSize: '12px' }}>
                    🎯 Selecciona el Sorteo:
                  </label>
                  <select 
                    value={sorteoSeleccionadoId} 
                    onChange={(e) => setSorteoSeleccionadoId(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444', fontSize: '13px', boxSizing: 'border-box' }}
                    required
                  >
                    <option value="">-- Selecciona un sorteo disponible --</option>
                    {sorteos && sorteos.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre} (S/ {s.precio})</option>
                    ))}
                  </select>
                </div>
  
                <div>
                  <label style={{ fontSize: '12px', color: '#aaa' }}>Nombre y Dos Apellidos:</label>
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value.toUpperCase())} 
                    required
                    style={{ 
                      width: '100%', padding: '8px', borderRadius: '6px', 
                      border: nombre.length > 0 && !esNombreValido ? '2px solid #ff4d4d' : '1px solid #444', 
                      background: '#222', color: '#fff', marginTop: '2px', boxSizing: 'border-box' 
                    }}
                    placeholder="Ej. Carlos Pérez Gómez"
                  />
                  {nombre.length > 0 && !esNombreValido && (
                    <span style={{ fontSize: '11px', color: '#ff4d4d', display: 'block', marginTop: '2px' }}>
                      ⚠️ Ingresa un nombre y tus dos apellidos completos.
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ fontSize: '12px', color: '#aaa' }}>DNI (8 dígitos):</label>
                  <input 
                    type="text" 
                    maxLength={8}
                    value={dni} 
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} 
                    required
                    style={{ 
                      width: '100%', padding: '8px', borderRadius: '6px', 
                      border: dni.length > 0 && !esDniValido ? '2px solid #ff4d4d' : '1px solid #444', 
                      background: '#222', color: '#fff', marginTop: '2px', boxSizing: 'border-box' 
                    }}
                    placeholder="Ej. 74839201"
                  />
                  {dni.length > 0 && !esDniValido && (
                    <span style={{ fontSize: '11px', color: '#ff4d4d', display: 'block', marginTop: '2px' }}>
                      ⚠️ El DNI debe tener exactamente 8 dígitos reales.
                    </span>
                  )}
                </div>
  
                <div>
                  <label style={{ fontSize: '12px', color: '#aaa' }}>Celular (9 dígitos, empieza con 9):</label>
                  <input 
                    type="text" 
                    maxLength={9}
                    value={celular} 
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))} 
                    required
                    style={{ 
                      width: '100%', padding: '8px', borderRadius: '6px', 
                      border: celular.length > 0 && !esCelularValido ? '2px solid #ff4d4d' : '1px solid #444', 
                      background: '#222', color: '#fff', marginTop: '2px', boxSizing: 'border-box' 
                    }}
                    placeholder="Ej. 987654321"
                  />
                  {celular.length > 0 && !esCelularValido && (
                    <span style={{ fontSize: '11px', color: '#ff4d4d', display: 'block', marginTop: '2px' }}>
                      ⚠️ Debe empezar con 9 y tener 9 dígitos.
                    </span>
                  )}
                </div>
  
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#aaa' }}>Región:</label>
                    <select
                      value={region}
                      onChange={handleRegionChange}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '2px', boxSizing: 'border-box' }}
                    >
                      {LISTA_REGIONES.map((reg) => (
                        <option key={reg} value={reg}>{reg}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#aaa' }}>Provincia:</label>
                    <select
                      value={provincia}
                      onChange={(e) => setProvincia(e.target.value)}
                      required
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '2px', boxSizing: 'border-box' }}
                    >
                      {(PROVINCIAS_POR_REGION[region] || []).map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                </div>
  
                <div>
                  <label style={{ fontSize: '12px', color: '#aaa' }}>Distrito:</label>
                  <input 
                    type="text" 
                    value={distrito} 
                    onChange={(e) => setDistrito(e.target.value.toUpperCase())} 
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '2px', boxSizing: 'border-box' }}
                    placeholder="Ej. Bambamarca"
                  />
                </div>
  
                <div>
                  <label style={{ fontSize: '12px', color: '#aaa' }}>Cantidad de tickets:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="50"
                    value={cantidad} 
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)} 
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#222', color: '#fff', marginTop: '2px', boxSizing: 'border-box' }}
                  />
                </div>
                
                <div style={{ background: '#2a2a2a', padding: '8px', borderRadius: '6px', textAlign: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#aaa' }}>Total a pagar: </span>
                  <strong style={{ color: '#FFD700', fontSize: '16px' }}>S/ {montoTotal.toFixed(2)}</strong>
                </div>
  
                {localStorage.getItem('sorteo_orden_pendiente') && (
                  <button
                    type="button"
                    onClick={() => {
                      const guardado = localStorage.getItem('sorteo_orden_pendiente');
                      if (guardado) setOrdenCreada(JSON.parse(guardado));
                    }}
                    style={{ width: '100%', padding: '8px', background: '#0284c7', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '2px' }}
                  >
                    ⚠️ Tienes un pago pendiente. Retomarlo aquí.
                  </button>
                )}
  
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={onClose}
                    style={{ flex: 1, padding: '9px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit" 
                    disabled={!formularioCompleto}
                    style={{ 
                      flex: 1, padding: '9px', 
                      background: formularioCompleto ? '#FFD700' : '#333', 
                      color: formularioCompleto ? '#000' : '#777', 
                      fontWeight: 'bold', border: 'none', borderRadius: '6px', 
                      cursor: formularioCompleto ? 'pointer' : 'not-allowed', fontSize: '13px' 
                    }}
                  >
                    Continuar al Pago
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {!pagoConfirmadoExito ? (
                <>
                  <h3 style={{ color: '#FFD700', marginBottom: '10px', fontSize: '18px' }}>Realiza tu Pago</h3>
                  <p style={{ fontSize: '13px', color: '#ddd', marginBottom: '12px' }}>
                    Yapea o Plinea el monto exacto de <strong style={{ color: '#FFD700' }}>S/ {ordenCreada?.monto?.toFixed(2)}</strong>.
                  </p>
                  <div style={{ background: '#2a2a2a', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px dashed #FFD700' }}>
                    <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 4px 0' }}>Tu código de pedido:</p>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFD700', letterSpacing: '3px' }}>
                      {ordenCreada?.id}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                      <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                        Código de operación de Yape/Plin (8 dígitos):
                      </label>
                      <input 
                        type="text" 
                        maxLength={8}
                        placeholder="Ej. 12345678"
                        value={codigoOperacion}
                        onChange={(e) => setCodigoOperacion(e.target.value.replace(/\D/g, ''))}
                        style={{ 
                          width: '100%', padding: '9px', borderRadius: '6px', 
                          border: codigoOperacion.length > 0 && !esCodigoOpValido ? '2px solid #ff4d4d' : '1px solid #444', 
                          background: '#222', color: '#fff', boxSizing: 'border-box' 
                        }}
                      />
                      {codigoOperacion.length > 0 && !esCodigoOpValido && (
                        <span style={{ fontSize: '11px', color: '#ff4d4d', display: 'block', marginTop: '2px' }}>
                          ⚠️ Ingresa un código de operación válido de 8 dígitos.
                        </span>
                      )}
                    </div>
  
                    <button 
                      onClick={confirmarPagoYape}
                      disabled={cargando || !esCodigoOpValido}
                      style={{ 
                        width: '100%', padding: '9px', 
                        background: esCodigoOpValido ? '#4CAF50' : '#333', 
                        color: esCodigoOpValido ? '#fff' : '#777', 
                        fontWeight: 'bold', border: 'none', borderRadius: '6px', 
                        cursor: esCodigoOpValido ? 'pointer' : 'not-allowed', 
                        fontSize: '13px', marginBottom: '8px'
                      }}
                    >
                      {cargando ? 'Verificando...' : (esCodigoOpValido ? 'Confirmar Pago' : 'Ingresa un código de 8 dígitos válido')}
                    </button>
                  </div>
  
                  <button
                    onClick={() => {
                      // Si deciden descartar o editar, limpiamos la orden guardada
                      localStorage.removeItem('sorteo_orden_pendiente');
                      setOrdenCreada(null);
                    }}
                    style={{ width: '100%', padding: '9px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Volver / Editar datos
                  </button>
                </>
              ) : (
                <div style={{ padding: '10px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>🎉</div>
                  <h3 style={{ color: '#4CAF50', marginBottom: '8px', fontSize: '18px' }}>¡Pago Registrado con Éxito!</h3>
                  <p style={{ fontSize: '13px', color: '#ddd', marginBottom: '12px' }}>
                    Estamos verificando tu transferencia y generaremos tus tickets.
                  </p>
                  <div style={{ background: '#2a2a2a', padding: '10px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #444' }}>
                    <p style={{ fontSize: '12px', color: '#FFD700', margin: 0 }}>
                      🎟️ En breve podrás visualizarlos en la sección <strong>"Mis Tickets"</strong>. ¡Muchísima suerte en el sorteo! 🍀
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOrdenCreada(null);
                      setCodigoOperacion('');
                      setPagoConfirmadoExito(false);
                      onClose();
                    }}
                    style={{ width: '100%', padding: '11px', background: '#FFD700', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Entendido y Cerrar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }