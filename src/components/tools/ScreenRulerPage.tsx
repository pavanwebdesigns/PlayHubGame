import React, { useState, useEffect, useRef } from 'react';

interface ScreenRulerPageProps {
  onBack: () => void;
}

const ScreenRulerPage: React.FC<ScreenRulerPageProps> = ({ onBack }) => {
  // --- State ---
  const [unit, setUnit] = useState<'px' | 'cm' | 'in'>('px');
  const [isVertical, setIsVertical] = useState(false);
  const [ppi, setPpi] = useState(96);
  const [showCalibration, setShowCalibration] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<{ id: number; val: string; unit: string; time: string; note: string }[]>([]);
  
  // Ruler Geometry
  const [rulerPos, setRulerPos] = useState({ x: 0, y: 0 });
  const [rulerSize, setRulerSize] = useState({ width: 500, height: 80 });
  
  const rulerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction Refs
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // --- Initialization ---
  useEffect(() => {
      const storedPPI = localStorage.getItem('ruler_ppi');
      if (storedPPI) setPpi(parseFloat(storedPPI));
      
      const storedHistory = localStorage.getItem('ruler_history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      
      // Center ruler on mount
      if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          setRulerPos({ x: (clientWidth - 500) / 2, y: (clientHeight - 80) / 2 });
      }
  }, []);

  // --- Interactions ---
  const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('resize-handle')) {
          isResizing.current = true;
          resizeStart.current = { 
              width: rulerSize.width, 
              height: rulerSize.height, 
              x: e.clientX, 
              y: e.clientY 
          };
      } else {
          isDragging.current = true;
          dragStart.current = { x: e.clientX, y: e.clientY };
          initialPos.current = { ...rulerPos };
      }
      e.stopPropagation();
      e.preventDefault();
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (isDragging.current) {
              const dx = e.clientX - dragStart.current.x;
              const dy = e.clientY - dragStart.current.y;
              setRulerPos({
                  x: initialPos.current.x + dx,
                  y: initialPos.current.y + dy
              });
          } else if (isResizing.current) {
              const dx = e.clientX - resizeStart.current.x;
              const dy = e.clientY - resizeStart.current.y;
              
              if (isVertical) {
                  const newHeight = Math.max(100, resizeStart.current.height + dy);
                  setRulerSize(prev => ({ ...prev, height: newHeight }));
              } else {
                  const newWidth = Math.max(100, resizeStart.current.width + dx);
                  setRulerSize(prev => ({ ...prev, width: newWidth }));
              }
          }
      };

      const handleMouseUp = () => {
          isDragging.current = false;
          isResizing.current = false;
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isVertical, rulerSize, rulerPos]);

  // --- Measurement & Logic ---
  const getMeasurementValue = () => {
      const lengthPx = isVertical ? rulerSize.height : rulerSize.width;
      if (unit === 'px') return Math.round(lengthPx).toString();
      if (unit === 'cm') return (lengthPx / (ppi / 2.54)).toFixed(2);
      if (unit === 'in') return (lengthPx / ppi).toFixed(2);
      return '0';
  };

  const recordMeasurement = () => {
      const val = getMeasurementValue();
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEntry = { id: Date.now(), val, unit, time: timestamp, note: '' };
      const newHistory = [newEntry, ...history];
      setHistory(newHistory);
      localStorage.setItem('ruler_history', JSON.stringify(newHistory));
      setShowHistory(true);
      
      // Flash effect logic could go here if needed via state
  };

  const deleteHistoryItem = (id: number) => {
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem('ruler_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
      setHistory([]);
      localStorage.removeItem('ruler_history');
  };

  const toggleRotation = () => {
      const wasVertical = isVertical;
      setIsVertical(!wasVertical);
      setRulerSize({ width: rulerSize.height, height: rulerSize.width });
  };

  const resetRuler = () => {
      if (containerRef.current) {
          const { clientWidth, clientHeight } = containerRef.current;
          setRulerPos({ x: (clientWidth - 500) / 2, y: (clientHeight - 80) / 2 });
          setRulerSize({ width: 500, height: 80 });
          setIsVertical(false);
      }
  };

  // --- Rendering Ticks (Matched to HTML logic) ---
  const renderTicks = () => {
      const lengthPx = isVertical ? rulerSize.height : rulerSize.width;
      let tickStepPx = 0;
      
      if (unit === 'px') tickStepPx = 10;
      else if (unit === 'cm') tickStepPx = (ppi / 2.54) / 10; 
      else if (unit === 'in') tickStepPx = ppi / 16; 

      const count = Math.floor(lengthPx / tickStepPx);
      const ticks = [];

      for (let i = 0; i <= count; i++) {
          const pos = i * tickStepPx;
          let isMajor = false;
          let isMid = false;

          if (unit === 'px') {
              isMajor = (i * 10) % 50 === 0;
          } else if (unit === 'cm') {
              isMajor = i % 10 === 0; 
              isMid = i % 5 === 0 && !isMajor; 
          } else if (unit === 'in') {
              isMajor = i % 16 === 0; 
              isMid = i % 8 === 0 && !isMajor; 
          }

          let height = '15%'; 
          if (isMajor) height = '40%';
          else if (isMid) height = '25%';

          const tickStyle: React.CSSProperties = isVertical 
              ? { top: pos, left: 0, width: height, height: 1, backgroundColor: 'rgba(255,255,255,0.6)' }
              : { left: pos, bottom: 0, width: 1, height: height, backgroundColor: 'rgba(255,255,255,0.6)' };

          ticks.push(<div key={`t-${i}`} className="position-absolute" style={tickStyle} />);

          if (isMajor) {
              let label = '';
              if (unit === 'px') label = (i * 10).toString();
              else if (unit === 'cm') label = (i / 10).toString();
              else if (unit === 'in') label = (i / 16).toString();

              const labelStyle: React.CSSProperties = isVertical
                  ? { top: pos, left: 25, transform: 'translateY(-50%)', fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }
                  : { left: pos, bottom: 25, transform: 'translateX(-50%)', fontSize: '10px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' };

              ticks.push(<div key={`l-${i}`} className="position-absolute pointer-events-none" style={labelStyle}>{label}</div>);
          }
      }
      return ticks;
  };

  // --- Colors from HTML ---
  const colors = {
      bg: '#0b0f19', // gray-950
      panel: 'rgba(31, 41, 55, 0.8)', // glass-panel
      border: 'rgba(75, 85, 99, 0.4)',
      textMain: '#f3f4f6',
      textMuted: '#9ca3af',
      amber: '#fbbf24', // amber-400
      amberDark: '#d97706', // amber-600
  };

  return (
    <div className="fixed-top w-100 h-100 d-flex flex-column" 
         style={{ background: colors.bg, zIndex: 2000, overflow: 'hidden', fontFamily: "'Inter', sans-serif", color: colors.textMain }}>
      
      {/* Header */}
      <div className="w-100 border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 50 }}>
           <div className="container px-4 py-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-link text-white-50 p-0 text-decoration-none d-flex align-items-center gap-2 hover-text-white" style={{ fontSize: '0.9rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Tools
                    </button>
                    <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-3">
                        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: `linear-gradient(135deg, #f59e0b, #d97706)` }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>
                        </div>
                        <h1 className="h6 mb-0 fw-bold text-white">Pixel<span style={{ color: colors.amber }}>Stick</span></h1>
                    </div>
                </div>
           </div>
      </div>

      {/* Workbench */}
      <main ref={containerRef} className="flex-grow-1 position-relative w-100 h-100 overflow-hidden" style={{ cursor: 'default' }}>
          
          {/* Grid Background */}
          <div className="position-absolute w-100 h-100 top-0 start-0 opacity-25 pointer-events-none" 
               style={{ 
                   backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', 
                   backgroundSize: '20px 20px' 
               }}>
          </div>

          {/* The Ruler */}
          <div 
            ref={rulerRef}
            onMouseDown={handleMouseDown}
            className="position-absolute rounded shadow-lg d-flex overflow-hidden"
            style={{ 
                left: rulerPos.x, 
                top: rulerPos.y, 
                width: rulerSize.width, 
                height: rulerSize.height, 
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                borderColor: '#4b5563',
                borderWidth: '1px',
                borderStyle: 'solid',
                cursor: 'move',
                alignItems: isVertical ? 'flex-start' : 'flex-end',
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5)',
                touchAction: 'none',
                userSelect: 'none'
            }}
          >
              {/* Ticks Container */}
              <div className="w-100 h-100 position-relative pointer-events-none">
                  {renderTicks()}
              </div>

              {/* Resize Handle */}
              <div 
                className="resize-handle position-absolute d-flex align-items-center justify-content-center"
                style={{ 
                    backgroundColor: colors.amber,
                    opacity: 0, // Hidden until hover (handled by CSS) or active
                    transition: 'opacity 0.2s',
                    cursor: isVertical ? 'ns-resize' : 'ew-resize',
                    ...(isVertical 
                        ? { bottom: 0, left: 0, width: '100%', height: '10px' } 
                        : { right: 0, top: 0, height: '100%', width: '10px' })
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                  {/* Handle Pill */}
                  <div className="bg-black bg-opacity-25 rounded-pill" style={isVertical ? { width: '20px', height: '4px' } : { width: '4px', height: '20px' }}></div>
              </div>

              {/* Measurement Tooltip */}
              <div className="position-absolute top-0 end-0 m-2 px-2 py-1 bg-black bg-opacity-50 rounded font-monospace small fw-bold pointer-events-none" style={{ color: colors.amber, backdropFilter: 'blur(4px)', fontSize: '13px' }}>
                 {getMeasurementValue()} {unit}
              </div>
          </div>

          {/* History Panel */}
          {showHistory && (
              <div className="position-absolute top-0 end-0 m-4 border border-secondary border-opacity-25 rounded-3 shadow-lg d-flex flex-column" style={{ width: '260px', maxHeight: '300px', backgroundColor: colors.panel, backdropFilter: 'blur(12px)', zIndex: 40 }}>
                   <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25 bg-dark bg-opacity-50">
                       <h6 className="mb-0 text-white-50 text-uppercase small fw-bold" style={{ fontSize: '0.7rem' }}>
                           <i className="fa-solid fa-clock-rotate-left text-amber-500 me-2"></i> History
                       </h6>
                       <button onClick={() => setShowHistory(false)} className="btn btn-sm text-white-50 hover-text-white border-0 p-0">✕</button>
                   </div>
                   <div className="overflow-auto p-0 flex-grow-1 scrollbar-hide">
                       {history.length === 0 ? (
                           <p className="text-center text-white-50 small py-4 fst-italic">No records yet</p>
                       ) : (
                           history.map(h => (
                               <div key={h.id} className="p-3 border-bottom border-secondary border-opacity-10 hover-bg-white-5">
                                   <div className="d-flex justify-content-between mb-1">
                                       <span className="font-monospace fw-bold small" style={{ color: colors.amber }}>{h.val} <span className="text-white-50">{h.unit}</span></span>
                                       <div className="d-flex gap-2 align-items-center">
                                           <span className="text-white-50" style={{ fontSize: '0.65rem' }}>{h.time}</span>
                                           <button onClick={() => deleteHistoryItem(h.id)} className="btn btn-link p-0 text-danger opacity-50 hover-opacity-100 border-0">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                           </button>
                                       </div>
                                   </div>
                               </div>
                           ))
                       )}
                   </div>
                   <div className="p-2 border-top border-secondary border-opacity-25 text-center bg-dark bg-opacity-50">
                       <button onClick={clearHistory} className="btn btn-sm text-danger small py-0 border-0" style={{ fontSize: '0.7rem' }}>Clear All</button>
                   </div>
              </div>
          )}

          {/* Floating Controls */}
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4 p-2 rounded-4 border border-secondary border-opacity-25 d-flex align-items-center gap-2 shadow-lg" style={{ backgroundColor: colors.panel, backdropFilter: 'blur(12px)' }}>
               
               {/* Rotate */}
               <button onClick={toggleRotation} className="btn btn-outline-light border-0 text-white-50 hover-text-white p-3 rounded-3" title="Rotate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
               </button>

               <div className="vr bg-secondary opacity-25 mx-1" style={{ height: '24px' }}></div>

               {/* Units */}
               <div className="btn-group btn-group-sm bg-black rounded-3 p-1 border border-secondary border-opacity-25">
                    <button onClick={() => setUnit('px')} className={`btn btn-sm rounded-2 px-3 py-1 border-0 ${unit === 'px' ? 'bg-warning text-dark fw-bold' : 'text-white-50'}`} style={{ backgroundColor: unit === 'px' ? colors.amber : 'transparent', color: unit === 'px' ? 'black' : '#9ca3af', fontSize: '0.75rem' }}>PX</button>
                    <button onClick={() => setUnit('cm')} className={`btn btn-sm rounded-2 px-3 py-1 border-0 ${unit === 'cm' ? 'bg-warning text-dark fw-bold' : 'text-white-50'}`} style={{ backgroundColor: unit === 'cm' ? colors.amber : 'transparent', color: unit === 'cm' ? 'black' : '#9ca3af', fontSize: '0.75rem' }}>CM</button>
                    <button onClick={() => setUnit('in')} className={`btn btn-sm rounded-2 px-3 py-1 border-0 ${unit === 'in' ? 'bg-warning text-dark fw-bold' : 'text-white-50'}`} style={{ backgroundColor: unit === 'in' ? colors.amber : 'transparent', color: unit === 'in' ? 'black' : '#9ca3af', fontSize: '0.75rem' }}>IN</button>
               </div>

               <div className="vr bg-secondary opacity-25 mx-1" style={{ height: '24px' }}></div>

               {/* Save */}
               <button onClick={recordMeasurement} className="btn p-3 rounded-3 d-flex align-items-center gap-2" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: colors.amber, border: `1px solid ${colors.amber}50` }} title="Record">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
               </button>

               {/* History */}
               <button onClick={() => setShowHistory(!showHistory)} className="btn btn-outline-light border-0 text-white-50 hover-text-white p-3 rounded-3" title="History">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
               </button>
               
               <div className="vr bg-secondary opacity-25 mx-1" style={{ height: '24px' }}></div>

               {/* Calibrate */}
               <button onClick={() => setShowCalibration(true)} className="btn btn-outline-light border-0 text-white-50 hover-text-white p-3 rounded-3" title="Calibrate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
               </button>

               {/* Reset */}
               <button onClick={resetRuler} className="btn btn-outline-light border-0 text-white-50 hover-text-white p-3 rounded-3" title="Center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
               </button>
               
               {/* Help - Hover for info */}
               <div className="position-relative group">
                  <button className="btn btn-outline-light border-0 text-white-50 hover-text-white p-3 rounded-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                  </button>
                  <div className="position-absolute bottom-100 start-50 translate-middle-x mb-2 bg-dark border border-secondary border-opacity-25 rounded-3 p-2 text-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ width: '180px', backgroundColor: colors.panel, backdropFilter: 'blur(12px)' }}>
                      <p className="small text-white-50 mb-0" style={{ fontSize: '0.7rem' }}>Drag ruler to move.<br/>Drag yellow edge to resize.<br/>Click Record to save.</p>
                  </div>
               </div>
               <style>{`.group:hover .group-hover\\:opacity-100 { opacity: 1; }`}</style>
          </div>

      </main>

      {/* Calibration Modal */}
      {showCalibration && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-90" style={{ zIndex: 60, backdropFilter: 'blur(5px)' }}>
               <div className="text-center p-4" style={{ maxWidth: '500px' }}>
                   <h2 className="text-white fw-bold mb-3">Screen Calibration</h2>
                   <p className="text-white-50 mb-5">Place a standard credit card on the screen and adjust the slider until the blue box matches its width.</p>
                   
                   {/* Card Reference */}
                   <div className="mx-auto mb-5 d-flex align-items-center justify-content-center rounded-3 shadow-lg position-relative transition-all" 
                        style={{ 
                            width: `${85.60 * (ppi / 25.4)}px`, 
                            height: `${53.98 * (ppi / 25.4)}px`, 
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }}>
                        <div className="text-white text-opacity-50 text-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                             <div className="small font-monospace">Standard Card</div>
                        </div>
                   </div>
                   
                   {/* Slider */}
                   <div className="bg-dark p-4 rounded-4 border border-secondary border-opacity-25">
                       <input 
                            type="range" 
                            min="50" max="300" step="0.1" 
                            value={ppi} 
                            onChange={(e) => setPpi(parseFloat(e.target.value))}
                            className="form-range w-100 mb-3"
                            style={{ accentColor: colors.amber }}
                       />
                       <div className="d-flex justify-content-between align-items-center">
                           <span className="text-white-50 small">Current PPI: <span className="text-white fw-bold font-monospace">{ppi.toFixed(1)}</span></span>
                           <button 
                                className="btn btn-warning fw-bold text-dark px-4 py-1 rounded-3"
                                style={{ backgroundColor: colors.amber }}
                                onClick={() => {
                                    localStorage.setItem('ruler_ppi', ppi.toString());
                                    setShowCalibration(false);
                                }}
                            >
                                Save
                           </button>
                       </div>
                   </div>
               </div>
          </div>
      )}

    </div>
  );
};

export default ScreenRulerPage;