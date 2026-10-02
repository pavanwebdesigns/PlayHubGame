import React, { useState, useEffect, useRef } from 'react';

interface PingCheckerPageProps {
  onBack: () => void;
}

const PingCheckerPage: React.FC<PingCheckerPageProps> = ({ onBack }) => {
  // --- State ---
  const [targetUrl, setTargetUrl] = useState('www.google.com');
  const [isRunning, setIsRunning] = useState(false);
  const [currentPing, setCurrentPing] = useState<number | null>(null);
  const [stats, setStats] = useState({ min: '--', max: '--', avg: '--', jitter: '--' });
  const [grade, setGrade] = useState({ letter: '--', color: '#9ca3af' }); 
  const [services, setServices] = useState([
    { id: 'google', name: 'Google', desc: 'US Backbone', url: 'https://www.google.com', status: '-- ms', color: '#6b7280' },
    { id: 'cloudflare', name: 'Cloudflare', desc: 'Global CDN', url: 'https://www.cloudflare.com', status: '-- ms', color: '#6b7280' },
    { id: 'opendns', name: 'OpenDNS', desc: 'DNS Resolver', url: 'https://www.opendns.com', status: '-- ms', color: '#6b7280' },
    { id: 'aws', name: 'Amazon AWS', desc: 'Cloud Infra', url: 'https://aws.amazon.com', status: '-- ms', color: '#6b7280' }
  ]);
  const [showPulse, setShowPulse] = useState(false);

  // Refs
  const pingHistoryRef = useRef<(number | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | null>(null);
  const maxHistory = 40;

  // --- Logic ---

  useEffect(() => {
      testAllServices();
      window.addEventListener('resize', drawGraph);
      return () => {
          window.removeEventListener('resize', drawGraph);
          stopPing();
      };
  }, []);

  const togglePing = () => {
      if (isRunning) stopPing();
      else startPing();
  };

  const startPing = () => {
      setIsRunning(true);
      pingHistoryRef.current = [];
      setGrade({ letter: '...', color: '#fb7185' });
      runPingLoop();
  };

  const stopPing = () => {
      setIsRunning(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowPulse(false);
  };

  // --- Core Ping Function (Image Trick) ---
  const pingUrl = (url: string): Promise<number> => {
      return new Promise((resolve, reject) => {
          const start = performance.now();
          const img = new Image();
          const timeout = setTimeout(() => {
              img.src = "";
              reject('timeout');
          }, 5000);

          img.onload = () => {
              clearTimeout(timeout);
              resolve(Math.round(performance.now() - start));
          };
          
          img.onerror = () => {
              clearTimeout(timeout);
              // Even an error means we reached the server (404 etc), so it counts as a ping response
              resolve(Math.round(performance.now() - start));
          };

          // Use favicon or a small image to minimize bandwidth
          // Strip protocol if present to ensure we use https
          let cleanUrl = url.replace(/^https?:\/\//, '');
          // Remove trailing slash
          cleanUrl = cleanUrl.replace(/\/$/, '');
          
          img.src = `https://${cleanUrl}/favicon.ico?t=${Date.now()}`;
      });
  };

  const runPingLoop = async () => {
      if (!isRunning) return;

      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 200);

      let latency: number | null = null;
      try {
          latency = await pingUrl(targetUrl);
      } catch (e) {
          latency = null;
      }

      if (isRunning) { 
          updateData(latency);
          timerRef.current = window.setTimeout(() => runPingLoop(), 1000);
      }
  };

  const updateData = (latency: number | null) => {
      pingHistoryRef.current.push(latency);
      if (pingHistoryRef.current.length > maxHistory) {
          pingHistoryRef.current.shift();
      }
      setCurrentPing(latency);
      calculateStats();
      drawGraph();
  };

  const calculateStats = () => {
      const history = pingHistoryRef.current;
      const validPings = history.filter((p): p is number => p !== null);

      if (validPings.length === 0) return;

      const min = Math.min(...validPings);
      const max = Math.max(...validPings);
      const avg = Math.round(validPings.reduce((a, b) => a + b, 0) / validPings.length);

      let jitterSum = 0;
      let jitterCount = 0;
      for(let i = 1; i < validPings.length; i++) {
          jitterSum += Math.abs(validPings[i] - validPings[i-1]);
          jitterCount++;
      }
      const jitter = jitterCount > 0 ? Math.round(jitterSum / jitterCount) : 0;

      setStats({
          min: `${min} ms`,
          max: `${max} ms`,
          avg: `${avg} ms`,
          jitter: `${jitter} ms`
      });

      // Grade Logic
      let g = 'F';
      let c = '#e11d48'; 

      if (avg < 30 && jitter < 5) { g = 'A+'; c = '#22c55e'; }
      else if (avg < 50 && jitter < 10) { g = 'A'; c = '#4ade80'; }
      else if (avg < 80) { g = 'B'; c = '#60a5fa'; }
      else if (avg < 150) { g = 'C'; c = '#facc15'; }
      else if (avg < 300) { g = 'D'; c = '#f97316'; }
      
      const timeouts = history.filter(p => p === null).length;
      if (timeouts > 2) { g = 'Unstable'; c = '#dc2626'; }

      setGrade({ letter: g, color: c });
  };

  const drawGraph = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const parent = canvas.parentElement;
      if (parent) {
          canvas.width = parent.offsetWidth;
          canvas.height = parent.offsetHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const padding = 10;
      const bottom = h - padding;
      const top = padding;
      const step = w / (maxHistory - 1);
      const history = pingHistoryRef.current;

      ctx.clearRect(0, 0, w, h);

      if (history.length < 2) return;

      ctx.beginPath();
      // Dynamic scaling, minimum 100ms to keep graph looking reasonable
      const maxVal = Math.max(100, ...(history.filter(p => p !== null) as number[])) * 1.2;
      
      let hasStarted = false;
      
      for (let i = 0; i < history.length; i++) {
          const latency = history[i];
          if (latency === null) continue;

          const x = i * step;
          const ratio = latency / maxVal;
          const y = bottom - (ratio * (bottom - top));

          if (!hasStarted) {
              ctx.moveTo(x, y);
              hasStarted = true;
          } else {
              ctx.lineTo(x, y);
          }
      }

      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, '#3b82f6'); 
      gradient.addColorStop(1, '#fb7185'); 
      
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.stroke();

      if (hasStarted) {
        ctx.lineTo((history.length - 1) * step, bottom);
        ctx.lineTo(0, bottom);
        ctx.fillStyle = 'rgba(251, 113, 133, 0.1)';
        ctx.fill();
      }

      history.forEach((latency, i) => {
          const x = i * step;
          if (latency === null) {
              const y = bottom - 10;
              ctx.fillStyle = '#ef4444';
              ctx.font = 'bold 12px monospace';
              ctx.fillText('x', x - 4, y);
          } else {
              const ratio = latency / maxVal;
              const y = bottom - (ratio * (bottom - top));
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#1f2937';
              ctx.fill();
              ctx.strokeStyle = '#fb7185';
              ctx.lineWidth = 2;
              ctx.stroke();
          }
      });
  };

  const testAllServices = () => {
      setServices(prev => prev.map(s => ({ ...s, status: '...', color: '#6b7280' })));
      services.forEach(svc => checkService(svc));
  };

  const checkService = async (svc: any) => {
      try {
          const latency = await pingUrl(svc.url);
          
          let color = '#fb7185'; 
          if (latency < 50) color = '#4ade80'; 
          else if (latency < 150) color = '#facc15'; 
          
          updateServiceStatus(svc.id, `${latency} ms`, color);
      } catch (e) {
          updateServiceStatus(svc.id, 'Offline', '#9ca3af');
      }
  };

  const updateServiceStatus = (id: string, status: string, color: string) => {
      setServices(prev => prev.map(s => s.id === id ? { ...s, status, color } : s));
  };

  // --- Colors & Styles ---
  const colors = {
      bg: '#0b0f19',
      panel: '#111827',
      border: '#1f2937',
      rose: '#fb7185',
      roseDark: '#e11d48',
      textMain: '#f3f4f6',
      textMuted: '#9ca3af',
  };

  return (
    <div className="fixed-top w-100 h-100 d-flex flex-column align-items-center" 
         style={{ 
             background: colors.bg, 
             zIndex: 2000, 
             overflowY: 'auto', 
             fontFamily: "'Inter', system-ui, sans-serif",
             color: colors.textMain,
             fontSize: '14px'
         }}>
       
       <style>{`
            .glass-panel {
                background: rgba(17, 24, 39, 0.9);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(75, 85, 99, 0.4);
            }
            .animate-pulse-fast {
                animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: .5; transform: scale(0.95); }
            }
         `}</style>

       {/* Header */}
       <div className="w-100 border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
           <div className="container px-4 py-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-link text-white-50 p-0 text-decoration-none d-flex align-items-center gap-2 hover-text-white" style={{ fontSize: '0.85rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Tools
                    </button>
                    <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-3">
                        <div className="rounded-2 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${colors.rose}, #db2777)` }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.28 3.6-2.34 4.63-4.23C24.94 7.25 23.91 3.7 20.62 3.7c-2.63 0-4.49 1.7-6.62 3.4C11.89 5.4 10.03 3.7 7.39 3.7c-3.3 0-4.33 3.55-3.01 6.07 1.03 1.89 3.14 2.95 4.63 4.23L14 19l5-5z"/><path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M12 12l5 5"/></svg>
                        </div>
                        <h1 className="h6 mb-0 fw-bold text-white tracking-tight" style={{ fontSize: '1rem' }}>Ping<span style={{ color: colors.rose }}>Master</span></h1>
                    </div>
                </div>
           </div>
       </div>

       <div className="container py-4" style={{ maxWidth: '1100px' }}>
            
            {/* Top Control Bar */}
            <div className="row g-4 mb-4">
                
                {/* Target Input */}
                <div className="col-12 col-lg-8">
                    <div className="bg-dark border border-secondary border-opacity-25 rounded-4 p-1 shadow-lg d-flex align-items-center h-100" style={{ backgroundColor: colors.panel }}>
                        <div className="px-3 text-white-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <input 
                            type="text" 
                            className="form-control bg-transparent border-0 text-white py-2 shadow-none font-monospace"
                            style={{ fontSize: '0.9rem' }}
                            placeholder="Enter URL to ping (e.g., google.com)"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            disabled={isRunning}
                        />
                        <button 
                            onClick={togglePing}
                            className={`btn fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 transition-colors m-1 ${isRunning ? 'btn-secondary' : 'btn-danger'}`}
                            style={{ backgroundColor: isRunning ? '#374151' : colors.roseDark, border: 'none', fontSize: '0.85rem' }}
                        >
                            {isRunning ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                    Stop
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    Start
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Connection Grade */}
                <div className="col-12 col-lg-4">
                    <div className="bg-dark border border-secondary border-opacity-25 rounded-4 p-3 shadow-lg d-flex align-items-center justify-content-between position-relative overflow-hidden h-100" style={{ backgroundColor: colors.panel }}>
                         <div>
                             <p className="text-white-50 text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Connection Grade</p>
                             <h2 className="fw-bold m-0" style={{ fontSize: '1.8rem', color: grade.color }}>{grade.letter}</h2>
                         </div>
                         <div className={`rounded-circle border-4 d-flex align-items-center justify-content-center ${isRunning ? 'animate-pulse' : ''}`} 
                              style={{ width: '48px', height: '48px', borderColor: '#374151', color: grade.color }}>
                             <span className="fw-bold">{grade.letter.charAt(0)}</span>
                         </div>
                         {/* Pulse Indicator */}
                         <div className="position-absolute top-0 end-0 m-3 rounded-circle" 
                              style={{ 
                                  width: '8px', height: '8px', 
                                  backgroundColor: colors.rose, 
                                  opacity: showPulse ? 1 : 0, 
                                  transition: 'opacity 0.2s' 
                              }}>
                         </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard */}
            <div className="row g-4">
                
                {/* Left: Graph & Stats */}
                <div className="col-12 col-lg-8 d-flex flex-column gap-4">
                    
                    {/* Live Graph */}
                    <div className="bg-dark border border-secondary border-opacity-25 rounded-4 p-4 shadow-lg" style={{ backgroundColor: colors.panel }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                             <h3 className="h6 fw-bold text-white-50 m-0 d-flex align-items-center gap-2">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.rose} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h5l3 5 4-10 3 8 5-3"/></svg>
                                 Live Latency
                             </h3>
                             <span className="font-monospace fw-bold text-white fs-4">
                                 {currentPing !== null ? currentPing : '--'} <span className="fs-6 text-white-50 fw-normal">ms</span>
                             </span>
                        </div>
                        <div className="w-100 bg-black bg-opacity-25 rounded-3 border border-secondary border-opacity-25 overflow-hidden position-relative" style={{ height: '250px' }}>
                             <canvas ref={canvasRef} className="w-100 h-100"></canvas>
                             <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 pointer-events-none" 
                                  style={{ backgroundImage: 'linear-gradient(#4b5563 1px, transparent 1px), linear-gradient(90deg, #4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                             </div>
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="row g-3">
                        <div className="col-6 col-md-3">
                            <div className="bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 p-3 text-center">
                                <p className="text-white-50 text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Minimum</p>
                                <p className="fw-bold font-monospace" style={{ color: '#4ade80', fontSize: '1.1rem' }}>{stats.min}</p>
                            </div>
                        </div>
                         <div className="col-6 col-md-3">
                            <div className="bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 p-3 text-center">
                                <p className="text-white-50 text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Maximum</p>
                                <p className="fw-bold font-monospace" style={{ color: colors.rose, fontSize: '1.1rem' }}>{stats.max}</p>
                            </div>
                        </div>
                         <div className="col-6 col-md-3">
                            <div className="bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 p-3 text-center">
                                <p className="text-white-50 text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Average</p>
                                <p className="fw-bold font-monospace" style={{ color: '#60a5fa', fontSize: '1.1rem' }}>{stats.avg}</p>
                            </div>
                        </div>
                         <div className="col-6 col-md-3">
                            <div className="bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 p-3 text-center position-relative group">
                                <p className="text-white-50 text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Jitter</p>
                                <p className="fw-bold font-monospace" style={{ color: '#a78bfa', fontSize: '1.1rem' }}>{stats.jitter}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right: Global Services */}
                <div className="col-12 col-lg-4">
                    <div className="bg-dark border border-secondary border-opacity-25 rounded-4 shadow-lg overflow-hidden d-flex flex-column h-100" style={{ backgroundColor: colors.panel }}>
                        <div className="p-4 border-bottom border-secondary border-opacity-25" style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}>
                             <h3 className="h6 fw-bold text-white m-0 d-flex align-items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
                                Global Services
                            </h3>
                        </div>
                        <div className="flex-grow-1 p-2 overflow-auto">
                            <table className="table table-dark table-hover mb-0 small" style={{ background: 'transparent' }}>
                                <tbody>
                                    {services.map(svc => (
                                        <tr key={svc.id} className="border-bottom border-secondary border-opacity-10">
                                            <td className="ps-3 py-3 border-0">
                                                <div className="fw-medium text-white">{svc.name}</div>
                                                <div className="text-white-50" style={{ fontSize: '0.7rem' }}>{svc.desc}</div>
                                            </td>
                                            <td className="pe-3 py-3 text-end border-0 font-monospace" style={{ color: svc.color, fontSize: '0.85rem' }}>
                                                {svc.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-3 border-top border-secondary border-opacity-25 text-center bg-black bg-opacity-25">
                             <button onClick={testAllServices} className="btn btn-sm text-uppercase fw-bold" style={{ color: colors.rose, fontSize: '0.7rem', letterSpacing: '1px' }}>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                                 Refresh Services
                             </button>
                        </div>
                    </div>
                </div>

            </div>
       </div>
    </div>
  );
};

export default PingCheckerPage;