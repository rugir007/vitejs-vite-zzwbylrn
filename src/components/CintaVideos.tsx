import React, { useState, useEffect, useRef } from 'react';

// =================================================================
// CINTA DE VIDEOS CONECTADA A GOOGLE SHEETS (CONFIGURADA)
// =================================================================

export default function CintaVideos() {
  const [modalVideoId, setModalVideoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [listaDeVideos, setListaDeVideos] = useState<{ titulo: string; id: string }[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sheetId = "1Py5iakcY5MA3KKM3b7xtUM1Vg-P3LX2ecfc6IgQCTAs";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    fetch(url)
      .then(res => res.text())
      .then(data => {
        const json = JSON.parse(data.substring(47, data.length - 2));
        const filas = json.table.rows.map((row: any) => ({
          titulo: row.c[0] ? row.c[0].v : "",
          id: row.c[1] ? row.c[1].v : ""
        })).filter((v: { id: string; titulo: string }) => v.id && v.titulo);

        setListaDeVideos(filas);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al cargar:", err);
        setCargando(false);
      });
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Efecto para movimiento continuo y fluido
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || listaDeVideos.length === 0) return;

    let animationId: number;
    let isUserInteracting = false;

    const scroll = () => {
      if (!isUserInteracting && container) {
        container.scrollLeft += 0.7; // Velocidad de desplazamiento
        const maxScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0; // Reinicio fluido para bucle infinito
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [listaDeVideos]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    if (scrollRef.current) {
      startXRef.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeftRef.current = scrollRef.current.scrollLeft;
    }
  };

  const onMouseLeaveOrUp = () => { isDraggingRef.current = false; };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const videosFiltrados = listaDeVideos.filter(v => 
    v.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="cinta-social-container" style={{ 
      position: 'absolute', bottom: '-2vh', left: 0, width: '100%', height: '60px', 
      backgroundColor: 'rgba(0, 0, 0, 0.85)', borderTop: '1px solid #FFD700', 
      borderBottom: '1px solid #FFD700', zIndex: 998, display: 'flex', alignItems: 'center', overflow: 'hidden'
    }}>
      <style>{`.cinta-scroll-libre::-webkit-scrollbar { display: none; }`}</style>
      
      {cargando ? (
        <div style={{ color: '#FFD700', width: '100%', textAlign: 'center', fontSize: '12px' }}>Cargando videos...</div>
      ) : (
        <div 
          ref={scrollRef}
          className="cinta-scroll-libre"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeaveOrUp}
          onMouseUp={onMouseLeaveOrUp}
          onMouseMove={onMouseMove}
          style={{ 
            display: 'flex', gap: '10px', padding: '0 10px', overflowX: 'auto', 
            width: '100%', height: '100%', alignItems: 'center', scrollbarWidth: 'none', cursor: 'grab', userSelect: 'none', whiteSpace: 'nowrap'
          }}
        >
          {/* Duplicamos la lista 4 veces para asegurar un bucle infinito continuo y sin saltos */}
          {[...listaDeVideos, ...listaDeVideos, ...listaDeVideos, ...listaDeVideos].map((video, i) => (
            <div 
              key={i} 
              onClick={() => { if (!isDraggingRef.current) setModalVideoId(video.id); }} 
              style={{ 
                width: '90px', height: '42px', backgroundColor: '#111', 
                border: '1px solid #FFD700', borderRadius: '4px', display: 'inline-flex', 
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                position: 'relative', overflow: 'hidden', flexShrink: 0
              }}
            >
              <img 
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
                alt="" 
                style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
              />
              <span style={{ fontSize: '10px', color: '#FFD700', fontWeight: 'bold', zIndex: 2 }}>▶</span>
            </div>
          ))}
        </div>
      )}

      {modalVideoId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '10%', height: '100%', backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
          <div style={{ width: '100%', maxWidth: '420px', height: '95vh', maxHeight: '850px', backgroundColor: '#111', border: '2px solid #FFD700', borderRadius: '16px', display: 'flex', flexDirection: 'column', padding: '15px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="🔍 Buscar video..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #555', background: '#222', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={() => setModalVideoId(null)} style={{ color: '#FFD700', background: 'transparent', border: '1px solid #FFD700', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕ CERRAR</button>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid #FFD700' }}>
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${modalVideoId}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {videosFiltrados.map((video, i) => (
                  <div key={i} onClick={() => setModalVideoId(video.id)} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '6px', backgroundColor: modalVideoId === video.id ? '#333' : '#181818', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer' }}>
                    <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} style={{ width: '85px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontSize: '12px', color: '#fff' }}>{video.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}