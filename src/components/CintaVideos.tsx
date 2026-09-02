import React, { useState, useEffect, useRef } from 'react';

// =================================================================
// CINTA DE VIDEOS CONECTADA A GOOGLE SHEETS (CONFIGURADA Y CORREGIDA)
// =================================================================
export default function CintaVideos() {
  const [modalVideoId, setModalVideoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  
  // Lista vacía por defecto hasta que cargue la hoja real
  const [listaDeVideos, setListaDeVideos] = useState<{ titulo: string; id: string }[]>([]);
  const [cargando, setCargando] = useState(true);

  // Control de interacción del usuario para pausar el scroll automático
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  useEffect(() => {
    const sheetId = "1Py5iakcY5MA3KKM3b7xtUM1Vg-P3LX2ecfc6IgQCTAs";
    // Usamos el formato CSV directo de Google Sheets que es mucho más seguro y rápido de leer sin bloqueos gviz
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    fetch(url)
      .then(res => res.text())
      .then(csvText => {
        const lineas = csvText.split('\n');
        const videosCargados: { titulo: string; id: string }[] = [];

        for (let i = 1; i < lineas.length; i++) {
          const linea = lineas[i].trim();
          if (!linea) continue;

          // Separar por comas respetando posibles comillas del CSV
          const columnas = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (columnas.length >= 2) {
            let titulo = columnas[0].replace(/^["']|["']$/g, '').trim();
            let urlVideo = columnas[1].replace(/^["']|["']$/g, '').trim();

            // Extraer el ID de YouTube independientemente de si pegaron el enlace completo o solo el ID
            let videoId = urlVideo;
            if (urlVideo.includes('youtu.be/')) {
              videoId = urlVideo.split('youtu.be/')[1]?.split('?')[0];
            } else if (urlVideo.includes('watch?v=')) {
              videoId = urlVideo.split('watch?v=')[1]?.split('&')[0];
            } else if (urlVideo.includes('embed/')) {
              videoId = urlVideo.split('embed/')[1]?.split('?')[0];
            }

            if (videoId && videoId.length >= 5) {
              videosCargados.push({ titulo: titulo || "Video sin título", id: videoId });
            }
          }
        }

        if (videosCargados.length > 0) {
          setListaDeVideos(videosCargados);
        } else {
          // Respaldo de emergencia si la hoja estuviera vacía
          setListaDeVideos([
            { titulo: "Playa Dorada Oficial", id: "dQw4w9WgXcQ" }
          ]);
        }
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al leer Google Sheets:", err);
        setCargando(false);
      });
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || listaDeVideos.length === 0) return;

    let animationId: number;
    const scroll = () => {
      if (!isUserInteracting && !isDraggingRef.current && container) {
        container.scrollLeft += 0.8;
        const maxScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [listaDeVideos, isUserInteracting]);

  const videosFiltrados = listaDeVideos.filter(v => 
    v.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      {/* CINTA DE VIDEOS UBICADA ABAJO EN EL BORDE INFERIOR */}
      <div style={{ 
        position: 'absolute', 
        bottom: '4vh', 
        left: 0, 
        width: '120%', 
        height: '65px', 
        backgroundColor: 'rgba(0, 0, 0, 0.92)', 
        borderTop: '1px solid #00E5FF', 
        borderBottom: '1px solid #00E5FF', 
        zIndex: 4, 
        display: 'flex', 
        alignItems: 'center', 
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <style>{`.cinta-scroll-libre::-webkit-scrollbar { display: none; }`}</style>
        
        {cargando ? (
          <div style={{ width: '100%', textAlign: 'center', color: '#00E5FF', fontSize: '12px' }}>
            Cargando videos...
          </div>
        ) : (
          <div 
            ref={scrollRef}
            className="cinta-scroll-libre"
            onMouseDown={(e) => {
              isDraggingRef.current = true;
              setIsUserInteracting(true);
              if (scrollRef.current) {
                startXRef.current = e.pageX - scrollRef.current.offsetLeft;
                scrollLeftRef.current = scrollRef.current.scrollLeft;
              }
            }}
            onMouseLeave={() => { isDraggingRef.current = false; setIsUserInteracting(false); }}
            onMouseUp={() => { isDraggingRef.current = false; setIsUserInteracting(false); }}
            onMouseMove={(e) => {
              if (!isDraggingRef.current || !scrollRef.current) return;
              e.preventDefault();
              const x = e.pageX - scrollRef.current.offsetLeft;
              const walk = (x - startXRef.current) * 2;
              scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
            }}
            onMouseEnter={() => setIsUserInteracting(true)}
            style={{ 
              display: 'flex', 
              gap: '10px', 
              padding: '0 10px', 
              overflowX: 'auto', 
              width: '100%', 
              height: '100%', 
              alignItems: 'center', 
              scrollbarWidth: 'none', 
              cursor: 'grab', 
              userSelect: 'none', 
              whiteSpace: 'nowrap'
            }}
          >
            {[...listaDeVideos, ...listaDeVideos, ...listaDeVideos, ...listaDeVideos].map((video, i) => (
              <div 
                key={i} 
                onClick={() => { if (!isDraggingRef.current) setModalVideoId(video.id); }} 
                style={{ 
                  width: '85px', 
                  height: '38px', 
                  backgroundColor: '#111', 
                  border: '1px solid #00E5FF', 
                  borderRadius: '4px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  flexShrink: 0
                }}
              >
                <img 
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
                  alt="" 
                  style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                />
                <span style={{ fontSize: '12px', color: '#00E5FF', fontWeight: 'bold', zIndex: 2, textShadow: '0 0 3px #000' }}>▶</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL REPRODUCTOR DE VIDEO CON CAPA TOTAL */}
      {modalVideoId && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: '#050505', 
          zIndex: 999999, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '12px',
          boxSizing: 'border-box'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ 
            width: '100%', 
            maxWidth: '420px', 
            height: '92vh', 
            maxHeight: '850px', 
            backgroundColor: '#111', 
            border: '2px solid #FFD700', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '15px', 
            boxSizing: 'border-box',
            boxShadow: '0 0 50px rgba(0,0,0,1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="🔍 Buscar video..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #555', background: '#222', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <button 
                onClick={() => setModalVideoId(null)} 
                style={{ color: '#FFD700', background: 'transparent', border: '1px solid #FFD700', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
              >
                ✕ CERRAR
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid #FFD700' }}>
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${modalVideoId}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {videosFiltrados.map((video, i) => (
                  <div key={i} onClick={() => setModalVideoId(video.id)} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '6px', backgroundColor: modalVideoId === video.id ? '#333' : '#181818', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer' }}>
                    <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} style={{ width: '85px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                    <span style={{ fontSize: '12px', color: '#fff' }}>{video.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}