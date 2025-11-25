import React, { useState, useEffect, useRef } from 'react';

interface IpFinderPageProps {
  onBack: () => void;
}

const IpFinderPage: React.FC<IpFinderPageProps> = ({ onBack }) => {
  // --- State ---
  const [ipInput, setIpInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // --- Load Leaflet Dynamically ---
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
            fetchIPData(''); 
        };
        document.body.appendChild(script);
    } else {
        fetchIPData(''); 
    }
  }, []);

  // --- Fetch Logic ---
  const fetchIPData = async (ipAddress = '') => {
    setLoading(true);
    setError(null);
    
    try {
        const response = await fetch(`https://ipwho.is/${ipAddress}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Invalid IP');
        }

        setData(result);
        setTimeout(() => updateMap(result.latitude, result.longitude), 100);
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch IP data');
    } finally {
        setLoading(false);
    }
  };

  // --- Map Logic ---
  const updateMap = (lat: number, lon: number) => {
      if (!(window as any).L || !mapContainerRef.current) return;
      const L = (window as any).L;

      if (!mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapContainerRef.current, {
              zoomControl: false,
              attributionControl: false
          }).setView([lat, lon], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
          }).addTo(mapInstanceRef.current);
          
          L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);
      } else {
          mapInstanceRef.current.setView([lat, lon], 13);
          mapInstanceRef.current.invalidateSize();
      }

      if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
      }

      const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
                 </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
      });

      markerRef.current = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstanceRef.current);
  };
  
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchIPData(ipInput);
  };

  const copyToClipboard = (text: string) => {
      if(!text) return;
      navigator.clipboard.writeText(text);
  };

  // --- Colors ---
  const colors = {
      bg: '#0b0f19',
      panel: '#111827',
      border: '#1f2937',
      textMain: '#f3f4f6',
      textMuted: '#9ca3af',
      emerald: '#10b981',
      emeraldDark: '#059669',
      blue: '#60a5fa',
      purple: '#a78bfa'
  };

  return (
    <div className="fixed-top w-100 h-100 d-flex flex-column align-items-center" 
         style={{ 
             background: colors.bg, 
             zIndex: 2000, 
             overflowY: 'auto', 
             fontFamily: "'Inter', system-ui, sans-serif",
             color: colors.textMain,
             fontSize: '14px' // Reduced base font size from ~16px/0.9rem to 14px
         }}>
         
         <style>{`
            .leaflet-layer,
            .leaflet-control-zoom-in,
            .leaflet-control-zoom-out,
            .leaflet-control-attribution {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
            .glass-panel {
                background: rgba(17, 24, 39, 0.9);
                backdrop-filter: blur(12px);
            }
            .animate-pulse-fast {
                animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
            }
         `}</style>

       {/* Navigation Bar */}
       <div className="w-100 border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
           <div className="container px-4 py-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-link text-white-50 p-0 text-decoration-none d-flex align-items-center gap-2 hover-text-white" style={{ fontSize: '0.85rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Tools
                    </button>
                    <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-3">
                        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: '26px', height: '26px', background: `linear-gradient(135deg, ${colors.emerald}, ${colors.emeraldDark})`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                        </div>
                        <h1 className="h6 mb-0 fw-bold text-white tracking-tight" style={{ fontSize: '0.95rem' }}>IP<span style={{ color: colors.emerald }}>Scout</span></h1>
                    </div>
                </div>
           </div>
       </div>

       <div className="container py-4" style={{ maxWidth: '1100px' }}>
            
            {/* Search Bar */}
            <div className="mb-4 position-relative z-2">
                <form onSubmit={handleSearch} className="d-flex gap-2 p-1.5 rounded-4 border border-secondary border-opacity-25 shadow-lg" style={{ backgroundColor: colors.panel }}>
                    <div className="position-relative flex-grow-1">
                        <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-white-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </div>
                        <input 
                            type="text" 
                            className="form-control bg-transparent border-0 text-white ps-5 py-2 shadow-none"
                            style={{ fontSize: '0.85rem' }} // Reduced input font
                            placeholder="Enter IPv4 address (e.g., 8.8.8.8)..."
                            value={ipInput}
                            onChange={(e) => setIpInput(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-success fw-bold px-4 rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: colors.emeraldDark, borderColor: colors.emeraldDark, fontSize: '0.85rem' }}>
                        <span>Track</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                    </button>
                </form>
                {error && <p className="text-danger small mt-2 ms-2" style={{ fontSize: '0.75rem' }}><i className="fa-solid fa-circle-exclamation me-1"></i> {error}</p>}
            </div>

            {/* Content Grid */}
            <div className={`row g-3 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                
                {/* Left Column: Details */}
                <div className="col-12 col-lg-4 d-flex flex-column gap-3">
                    
                    {/* IP Card */}
                    <div className="p-4 rounded-4 border border-secondary border-opacity-25 shadow-sm position-relative overflow-hidden" style={{ backgroundColor: colors.panel }}>
                        <p className="text-uppercase fw-bold mb-1" style={{ color: colors.textMuted, fontSize: '0.65rem', letterSpacing: '1px' }}>Target IP Address</p>
                        <div className="d-flex align-items-center gap-3 mb-2">
                            <h2 className="fw-bold text-white font-monospace m-0 tracking-tight" style={{ fontSize: '1.6rem' }}>{data?.ip || '--'}</h2> {/* Reduced from 1.8rem */}
                            <button onClick={() => copyToClipboard(data?.ip)} className="btn btn-link p-0 text-white-50 hover-text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
                        </div>
                        <div className="d-flex gap-2">
                            <span className="badge bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-25 font-monospace" style={{ fontSize: '0.6rem', padding: '4px 8px' }}>{data?.type || 'IPv4'}</span>
                            <span className="badge bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-25 font-monospace" style={{ fontSize: '0.6rem', padding: '4px 8px' }}>Connection</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="p-4 rounded-4 border border-secondary border-opacity-25 shadow-sm" style={{ backgroundColor: colors.panel }}>
                        <div className="d-flex align-items-center gap-2 border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.emerald} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                            <h6 className="fw-bold m-0" style={{ fontSize: '0.85rem' }}>Location Info</h6>
                        </div>
                        <div className="mb-3">
                            <p className="text-uppercase fw-bold mb-1" style={{ color: colors.textMuted, fontSize: '0.6rem' }}>Country & City</p>
                            <div className="d-flex align-items-center gap-2">
                                {data?.flag?.img && <img src={data.flag.img} alt="Flag" className="rounded shadow-sm" style={{ width: '18px' }} />}
                                <p className="fw-medium m-0" style={{ fontSize: '0.95rem' }}>{data ? [data.city, data.region, data.country].filter(Boolean).join(', ') : '--'}</p>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-6">
                                <p className="text-uppercase fw-bold mb-0" style={{ color: colors.textMuted, fontSize: '0.6rem' }}>Latitude</p>
                                <p className="font-monospace text-success small" style={{ fontSize: '0.8rem' }}>{data?.latitude || '--'}</p>
                            </div>
                            <div className="col-6">
                                <p className="text-uppercase fw-bold mb-0" style={{ color: colors.textMuted, fontSize: '0.6rem' }}>Longitude</p>
                                <p className="font-monospace text-success small" style={{ fontSize: '0.8rem' }}>{data?.longitude || '--'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Network */}
                    <div className="p-4 rounded-4 border border-secondary border-opacity-25 shadow-sm" style={{ backgroundColor: colors.panel }}>
                        <div className="d-flex align-items-center gap-2 border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
                            <h6 className="fw-bold m-0" style={{ fontSize: '0.85rem' }}>Network Info</h6>
                        </div>
                        <div className="mb-3">
                            <p className="text-uppercase fw-bold mb-1" style={{ color: colors.textMuted, fontSize: '0.6rem' }}>ISP</p>
                            <p className="fw-medium m-0" style={{ fontSize: '0.9rem' }}>{data?.connection?.isp || '--'}</p>
                        </div>
                        <div>
                            <p className="text-uppercase fw-bold mb-1" style={{ color: colors.textMuted, fontSize: '0.6rem' }}>ASN</p>
                            <p className="font-monospace text-white-50 m-0 small" style={{ fontSize: '0.8rem' }}>{data?.connection?.asn ? `AS${data.connection.asn} (${data.connection.org})` : '--'}</p>
                        </div>
                    </div>

                     {/* Regional */}
                    <div className="p-4 rounded-4 border border-secondary border-opacity-25 shadow-sm" style={{ backgroundColor: colors.panel }}>
                        <div className="d-flex align-items-center gap-2 border-bottom border-secondary border-opacity-25 pb-2 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <h6 className="fw-bold m-0" style={{ fontSize: '0.85rem' }}>Regional Info</h6>
                        </div>
                        <div className="row g-3">
                            <div className="col-6">
                                <p className="text-uppercase fw-bold mb-1" style={{ color: colors.textMuted, fontSize: '0.6rem' }}>Timezone</p>
                                <p className="text-white m-0 small" style={{ fontSize: '0.8rem' }}>{data?.timezone?.id || '--'}</p>
                            </div>
                            <div className="col-6">
                                <p className="text-uppercase fw-bold mb-1" style={{ color: colors.textMuted, fontSize: '0.6rem' }}>Currency</p>
                                <p className="text-white m-0 small" style={{ fontSize: '0.8rem' }}>{data?.currency?.name ? `${data.currency.name} (${data.currency.symbol})` : '--'}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Map */}
                <div className="col-12 col-lg-8 d-flex flex-column">
                    <div className="rounded-4 border border-secondary border-opacity-25 bg-dark shadow-2xl overflow-hidden flex-grow-1 position-relative" style={{ minHeight: '450px' }}> {/* Reduced min height slightly */}
                        <div className="position-absolute top-0 end-0 m-3 z-3 bg-dark bg-opacity-75 backdrop-blur px-3 py-1 rounded-pill border border-secondary border-opacity-50 text-white-50 shadow pointer-events-none" style={{ fontSize: '0.65rem' }}>
                            <i className="fa-solid fa-crosshairs me-1 text-success"></i> Live View
                        </div>
                        <div id="map" ref={mapContainerRef} className="w-100 h-100 bg-secondary bg-opacity-10"></div>
                    </div>
                     <div className="text-center mt-2 text-white-50" style={{ fontSize: '0.7rem' }}>
                        Note: IP geolocation provides approximate location (City/Region level), not precise GPS coordinates.
                    </div>
                </div>

            </div>

            {/* Loader Overlay */}
            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-black bg-opacity-75 backdrop-blur z-50">
                    <div className="spinner-border text-success mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status"></div>
                    <p className="text-success font-monospace animate-pulse-fast small">Triangulating Signal...</p>
                </div>
            )}

       </div>
    </div>
  );
};

export default IpFinderPage;