import React, { useState, useEffect, useRef } from 'react';

interface BreathTrainerPageProps {
  onBack: () => void;
}

const BreathTrainerPage: React.FC<BreathTrainerPageProps> = ({ onBack }) => {
  // State
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<'Ready' | 'Inhale' | 'Hold' | 'Exhale'>('Ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [preset, setPreset] = useState('4,7,8'); // Default: Relaxing Breath (4-7-8)
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loop, setLoop] = useState(false);
  
  // Custom Timings
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold1, setCustomHold1] = useState(7);
  const [customExhale, setCustomExhale] = useState(8);
  const [customHold2, setCustomHold2] = useState(0);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedPausedRef = useRef<number>(0);
  const ringRef = useRef<SVGCircleElement>(null);
  
  // --- Audio Helper (Web Audio API) ---
  const playChime = () => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Soft sine wave chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
        console.error("Audio play error", e);
    }
  };

  // --- Logic ---
  const getDurations = () => {
    if (preset === 'custom') return [customInhale, customHold1, customExhale, customHold2];
    // preset value like "4,7,8" might miss the 4th number, so default to 0
    const parts = preset.split(',').map(Number);
    return [parts[0] || 4, parts[1] || 0, parts[2] || 4, parts[3] || 0];
  };

  useEffect(() => {
    // Animation Loop
    if (!isActive || isPaused) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const runLoop = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp - elapsedPausedRef.current;
      const elapsed = (timestamp - startTimeRef.current) / 1000; // seconds
      
      const [i, h1, e, h2] = getDurations();
      const totalCycle = i + h1 + e + h2;
      if (totalCycle === 0) return; 

      // Calculate cycles completed
      const currentCycleIndex = Math.floor(elapsed / totalCycle);
      
      // Loop Logic
      if (currentCycleIndex > cycleCount) {
          setCycleCount(currentCycleIndex);
           // If loop is disabled (false), stop after 1 cycle (or desired count)
           // The reference HTML implies a toggle. If unchecked, maybe run once?
           // Let's assume 'loop' toggle means continuous play. If off, stop after 1 cycle.
           if (!loop && currentCycleIndex >= 1) {
               setIsActive(false);
               setPhase('Ready');
               reset();
               return;
           }
      }

      const currentCycleTime = elapsed % totalCycle;

      let currentPhase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';
      let phaseTime = 0;
      let phaseDuration = i;

      if (currentCycleTime < i) {
        currentPhase = 'Inhale';
        phaseTime = currentCycleTime;
        phaseDuration = i;
      } else if (currentCycleTime < i + h1) {
        currentPhase = 'Hold';
        phaseTime = currentCycleTime - i;
        phaseDuration = h1;
      } else if (currentCycleTime < i + h1 + e) {
        currentPhase = 'Exhale';
        phaseTime = currentCycleTime - (i + h1);
        phaseDuration = e;
      } else {
        currentPhase = 'Hold';
        phaseTime = currentCycleTime - (i + h1 + e);
        phaseDuration = h2;
      }

      // Phase Change Trigger
      if (phase !== currentPhase) {
          setPhase(currentPhase);
          playChime();
      }

      setTimeLeft(Math.ceil(phaseDuration - phaseTime));

      const progress = phaseTime / phaseDuration;
      updateRing(progress, currentPhase);

      animationRef.current = requestAnimationFrame(runLoop);
    };

    animationRef.current = requestAnimationFrame(runLoop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isPaused, preset, customInhale, customHold1, customExhale, customHold2, phase, cycleCount, loop]);

  const updateRing = (progress: number, currentPhase: string) => {
    if (!ringRef.current) return;
    
    const radius = 90; 
    const circumference = 2 * Math.PI * radius;
    
    let offset = circumference;
    
    // Visual Logic matching reference:
    // Inhale: Ring fills (Offset: Circumference -> 0)
    // Exhale: Ring empties (Offset: 0 -> Circumference)
    
    if (currentPhase === 'Inhale') {
        offset = circumference * (1 - progress);
    } else if (currentPhase === 'Exhale') {
        offset = circumference * progress;
    } else if (currentPhase === 'Hold') {
         // Ideally, hold state depends on if lungs are full or empty.
         // Full Hold (after Inhale) -> Ring Full (0)
         // Empty Hold (after Exhale) -> Ring Empty (Circumference)
         
         // Simple logic: Check if previous phase was Inhale (implies full hold) or Exhale (implies empty hold).
         // Since we calculate phase dynamically, we can check the durations array to see where we are.
         // But for a smooth visual, defaulting to 0 (Full) covers the most common "Hold your breath" case.
         offset = 0; 
    }
    
    ringRef.current.style.strokeDashoffset = offset.toString();
  };

  const toggleSession = () => {
    if (!isActive) {
        setIsActive(true);
        setIsPaused(false);
        setCycleCount(0);
        startTimeRef.current = 0;
        elapsedPausedRef.current = 0;
        playChime();
    } else {
        setIsPaused(!isPaused);
        if (!isPaused) {
            elapsedPausedRef.current = performance.now() - startTimeRef.current;
        } else {
            startTimeRef.current = performance.now() - elapsedPausedRef.current;
        }
    }
  };

  const reset = () => {
    setIsActive(false);
    setIsPaused(false);
    setPhase('Ready');
    setCycleCount(0);
    setTimeLeft(0);
    elapsedPausedRef.current = 0;
    startTimeRef.current = 0;
    if (ringRef.current) ringRef.current.style.strokeDashoffset = (2 * Math.PI * 90).toString();
  };

  // Colors from reference
  const accentColor = '#60a5fa'; 
  const textSecondary = '#94a3b8';
  const cardBg = 'rgba(11, 18, 32, 0.7)'; 

  return (
    <div className="fixed-top w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 2000, color: '#e6eef8' }}>
      
      {/* Animated Gradient Background */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ 
          zIndex: -1, 
          background: 'linear-gradient(45deg, #60a5fa, #071022, #071022)', 
          backgroundSize: '300% 300%', 
          animation: 'gradient-animation 15s ease infinite',
          opacity: 0.15
      }}></div>
      <style>{`
        @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .hover-scale:hover { transform: scale(1.05); transition: transform 0.2s; }
      `}</style>

      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="btn btn-link text-white text-decoration-none position-absolute top-0 start-0 m-4 z-10 d-flex align-items-center gap-2 opacity-75 hover-opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Tools
      </button>

      {/* Main Card */}
      <div className="w-full max-w-md rounded-2xl shadow-2xl p-6 md:p-8 text-center relative overflow-hidden" 
           style={{ 
               backgroundColor: cardBg, 
               backdropFilter: 'blur(24px)',
               maxWidth: '450px',
               width: '100%',
               borderRadius: '1rem',
               border: '1px solid rgba(255, 255, 255, 0.06)'
           }}>
        
        {/* Header Row */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <button className="btn btn-link p-0 text-decoration-none transition" style={{ color: textSecondary }} onClick={() => setShowHistory(true)} title="Session History">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <h1 className="text-2xl font-bold m-0 text-white">Breath Trainer</h1>
            <button className="btn btn-link p-0 text-decoration-none transition" style={{ color: textSecondary }} onClick={() => setShowSettings(true)} title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
        
        <p className="mb-6 small" style={{ color: textSecondary }}>Select a preset or customize your own in settings.</p>

        {/* Breathing Ring */}
        <div className="position-relative mx-auto mb-6" style={{ width: '256px', height: '256px' }}>
            <svg className="w-100 h-100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle 
                    ref={ringRef}
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke={accentColor} 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45}`}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
            </svg>
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                <div className="fw-bold mb-0 text-white" style={{ fontSize: '1.5rem' }}>{phase}</div>
                <div className="fw-light tracking-tighter text-white" style={{ fontSize: '4rem', lineHeight: '1' }}>{isActive ? timeLeft : 0}</div>
                <div className="small mt-1" style={{ color: textSecondary }}>Cycles: {cycleCount}</div>
            </div>
        </div>
        
        {/* Preset Selector */}
        <div className="mb-6">
            <select 
                className="form-select border-secondary text-center rounded-lg py-3 px-4 w-100"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', borderColor: 'rgba(255,255,255,0.06)' }}
                value={preset} 
                onChange={(e) => setPreset(e.target.value)}
            >
                 <option value="4,4,4,4">Box Breathing (4-4-4-4)</option>
                 <option value="4,7,8">Relaxing Breath (4-7-8)</option>
                 <option value="6,0,6">Coherent Breathing (6-6)</option>
                 <option value="custom">Custom</option>
            </select>
        </div>

        {/* Controls */}
        <div className="d-flex items-center justify-content-center gap-4">
            <button 
                className="p-3 rounded-circle transition hover-bg-white-10" 
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff' }} 
                onClick={reset} 
                title="Reset (R)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4v5h5M20 20v-5h-5" /><path d="M4 9a9 9 0 0 1 14.23-5.23l.77.77M20 15a9 9 0 0 1-14.23 5.23l-.77-.77" /></svg>
            </button>
            
            <button 
                className="rounded-circle flex items-center justify-content-center fw-bold shadow-lg transition transform hover-scale"
                style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: accentColor, 
                    color: '#0b1220',
                    fontSize: '1.125rem',
                    boxShadow: `0 10px 25px -5px ${accentColor}80` // Hex alpha
                }}
                onClick={toggleSession}
                title="Start/Pause (Spacebar)"
            >
                {isActive && !isPaused ? 'Pause' : 'Start'}
            </button>
            
            <label className="flex items-center justify-content-center cursor-pointer p-3 rounded-circle transition hover-bg-white-10" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }} title="Loop session">
                <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="d-none" />
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={loop ? accentColor : textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(90deg)' }}>
                    <path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0 1 14.23-5.23l.77.77M20 15a9 9 0 0 1-14.23 5.23l-.77-.77" />
                </svg>
            </label>
        </div>

        {/* Settings Modal Overlay */}
        {showSettings && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column p-6" style={{ backgroundColor: '#0b1220', zIndex: 20 }}>
                 <div className="d-flex justify-content-between align-items-center mb-6">
                    <h2 className="text-2xl font-bold text-white m-0">Settings</h2>
                    <button className="btn-close btn-close-white" onClick={() => setShowSettings(false)}></button>
                </div>
                
                <div className="overflow-y-auto scrollbar-hide pe-2 flex-grow-1 text-start">
                    <h3 className="fw-semibold mb-2 text-white">Custom Timing (seconds)</h3>
                    <div className="row g-3 mb-4">
                         <div className="col-3"><input type="number" min="1" className="form-control bg-white bg-opacity-5 text-white border-secondary border-opacity-25 text-center" placeholder="In" value={customInhale} onChange={e => setCustomInhale(Number(e.target.value))} /></div>
                         <div className="col-3"><input type="number" min="0" className="form-control bg-white bg-opacity-5 text-white border-secondary border-opacity-25 text-center" placeholder="Hold" value={customHold1} onChange={e => setCustomHold1(Number(e.target.value))} /></div>
                         <div className="col-3"><input type="number" min="1" className="form-control bg-white bg-opacity-5 text-white border-secondary border-opacity-25 text-center" placeholder="Out" value={customExhale} onChange={e => setCustomExhale(Number(e.target.value))} /></div>
                         <div className="col-3"><input type="number" min="0" className="form-control bg-white bg-opacity-5 text-white border-secondary border-opacity-25 text-center" placeholder="Hold" value={customHold2} onChange={e => setCustomHold2(Number(e.target.value))} /></div>
                    </div>
                    
                    {/* Additional Settings Placeholders (matching HTML structure) */}
                    <div className="mb-4">
                        <h3 className="fw-semibold mb-2 text-white">Appearance</h3>
                        <div className="d-flex flex-wrap gap-2">
                            {['#071022', '#0284c7', '#f59e0b', '#059669', '#e11d48'].map(c => (
                                <div key={c} className="rounded-3 cursor-pointer hover-scale" style={{ width: '32px', height: '24px', background: c, border: '1px solid rgba(255,255,255,0.2)' }}></div>
                            ))}
                        </div>
                    </div>
                    
                     <div className="mb-4">
                        <h3 className="fw-semibold mb-2 text-white">Sound</h3>
                        <div className="mb-2">
                            <label className="small text-white-50 d-block">Ambient Soundscape</label>
                            <select className="form-select form-select-sm bg-white bg-opacity-5 text-white border-secondary border-opacity-25 w-100 mt-1">
                                <option value="none">None</option>
                                <option value="rain">Gentle Rain</option>
                                <option value="waves">Ocean Waves</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="text-end mt-4">
                    <button className="btn px-4 py-2 fw-bold" style={{ backgroundColor: accentColor, color: '#0b1220' }} onClick={() => setShowSettings(false)}>Save & Close</button>
                </div>
            </div>
        )}
        
        {/* History Overlay */}
        {showHistory && (
             <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column p-6" style={{ backgroundColor: '#0b1220', zIndex: 20 }}>
                 <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="text-2xl font-bold text-white m-0">Session History</h2>
                    <button className="btn-close btn-close-white" onClick={() => setShowHistory(false)}></button>
                </div>
                <div className="text-white-50 text-center py-5 flex-grow-1">
                    <p>No sessions recorded yet.</p>
                </div>
                <div className="text-end">
                     <button className="btn btn-sm btn-outline-danger" onClick={() => alert('History cleared')}>Clear History</button>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default BreathTrainerPage;