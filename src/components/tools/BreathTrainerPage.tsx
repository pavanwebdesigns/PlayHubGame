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
  const [preset, setPreset] = useState('4,7,8,0'); // Default: Relax
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Custom Timings
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold1, setCustomHold1] = useState(7);
  const [customExhale, setCustomExhale] = useState(8);
  const [customHold2, setCustomHold2] = useState(0);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);

  // Animation Refs
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedPausedRef = useRef<number>(0);

  // --- Audio Helper ---
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
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
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
    return preset.split(',').map(Number);
  };

  useEffect(() => {
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

      if (phase !== currentPhase) {
          setPhase(currentPhase);
          playChime();
      }

      setTimeLeft(Math.ceil(phaseDuration - phaseTime));

      const progress = phaseTime / phaseDuration;
      updateRing(progress, currentPhase);

      const newCycleCount = Math.floor(elapsed / totalCycle);
      if (newCycleCount !== cycleCount) setCycleCount(newCycleCount);

      animationRef.current = requestAnimationFrame(runLoop);
    };

    animationRef.current = requestAnimationFrame(runLoop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isPaused, preset, customInhale, customHold1, customExhale, customHold2, phase, cycleCount]);

  const updateRing = (progress: number, currentPhase: string) => {
    const ring = document.getElementById('breath-progress-ring-page');
    if (!ring) return;
    
    const radius = 90; // Larger radius for full page
    const circumference = 2 * Math.PI * radius;
    
    let offset = circumference;
    if (currentPhase === 'Inhale') {
        offset = circumference - (progress * circumference);
    } else if (currentPhase === 'Hold') {
         offset = 0; 
    } else if (currentPhase === 'Exhale') {
        offset = progress * circumference;
    }
    
    ring.style.strokeDashoffset = offset.toString();
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
    const ring = document.getElementById('breath-progress-ring-page');
    if (ring) ring.style.strokeDashoffset = (2 * Math.PI * 90).toString();
  };

  const accentColor = '#60a5fa'; 
  const textSecondary = '#94a3b8';

  return (
    <div className="fixed-top w-100 h-100 d-flex align-items-center justify-content-center p-0 m-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', zIndex: 2000 }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="btn btn-link text-white text-decoration-none position-absolute top-0 start-0 m-4 z-3 d-flex align-items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Tools
      </button>

      {/* Main App Card (Full Screen Style) */}
      <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden">
        
        {/* Settings Modal Overlay */}
        {showSettings && (
            <div className="position-absolute top-0 end-0 h-100 d-flex flex-column p-4 bg-dark border-start border-secondary border-opacity-25 shadow-lg" style={{ width: '350px', maxWidth: '100%', zIndex: 20, backdropFilter: 'blur(20px)', background: 'rgba(11, 18, 32, 0.95)' }}>
                 <div className="d-flex justify-content-between align-items-center mb-5">
                    <h3 className="fw-bold m-0 text-white">Settings</h3>
                    <button className="btn-close btn-close-white" onClick={() => setShowSettings(false)}></button>
                </div>
                
                <div className="mb-4">
                    <label className="form-label small text-white-50 text-uppercase fw-bold">Breathing Technique</label>
                    <select 
                        className="form-select bg-black text-white border-secondary"
                        value={preset} 
                        onChange={(e) => setPreset(e.target.value)}
                    >
                        <option value="4,7,8,0">Relaxing Breath (4-7-8)</option>
                        <option value="4,4,4,4">Box Breathing (4-4-4-4)</option>
                        <option value="6,0,6,0">Coherent Breathing (6-6)</option>
                        <option value="custom">Custom Rhythm</option>
                    </select>
                </div>

                {preset === 'custom' && (
                    <div className="row g-2 mb-4">
                        <div className="col-3"><label className="small text-white-50 text-center w-100 d-block">In</label><input type="number" className="form-control form-control-sm bg-black text-white border-secondary text-center" value={customInhale} onChange={e => setCustomInhale(Number(e.target.value))} /></div>
                        <div className="col-3"><label className="small text-white-50 text-center w-100 d-block">Hold</label><input type="number" className="form-control form-control-sm bg-black text-white border-secondary text-center" value={customHold1} onChange={e => setCustomHold1(Number(e.target.value))} /></div>
                        <div className="col-3"><label className="small text-white-50 text-center w-100 d-block">Out</label><input type="number" className="form-control form-control-sm bg-black text-white border-secondary text-center" value={customExhale} onChange={e => setCustomExhale(Number(e.target.value))} /></div>
                        <div className="col-3"><label className="small text-white-50 text-center w-100 d-block">Hold</label><input type="number" className="form-control form-control-sm bg-black text-white border-secondary text-center" value={customHold2} onChange={e => setCustomHold2(Number(e.target.value))} /></div>
                    </div>
                )}
                
                <button className="btn btn-primary w-100 mt-auto fw-bold py-3" onClick={() => setShowSettings(false)}>Save Changes</button>
            </div>
        )}
        
        {/* Top Controls */}
        <div className="position-absolute top-0 end-0 m-4 d-flex gap-3 z-2">
             <button className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center hover-bg-white-10" style={{ width: '48px', height: '48px', color: textSecondary, borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => setShowHistory(!showHistory)} title="History">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 8v4l3 3"/></svg>
            </button>
            <button className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center hover-bg-white-10" style={{ width: '48px', height: '48px', color: textSecondary, borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => setShowSettings(!showSettings)} title="Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
        </div>

        {/* Large Ring Visualization */}
        <div className="position-relative mb-5" style={{ width: '400px', height: '400px' }}>
             {/* Background Circle */}
             <svg className="w-100 h-100" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                {/* Progress Circle */}
                <circle 
                    id="breath-progress-ring-page"
                    cx="100" cy="100" r="90" 
                    fill="none" 
                    stroke={phase === 'Hold' ? '#f59e0b' : accentColor} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90}`}
                    style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s ease' }}
                />
             </svg>
             
             {/* Center Content */}
             <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                <div className="display-1 fw-bold mb-2 text-white tracking-tight text-uppercase" style={{ fontSize: '4rem', textShadow: '0 0 30px rgba(96, 165, 250, 0.3)' }}>{phase}</div>
                
                <div className={`display-1 fw-light my-3 ${isActive ? 'text-white' : 'text-white-50'}`} style={{ fontFamily: 'monospace', fontSize: '6rem', lineHeight: '1' }}>
                    {isActive ? timeLeft : 0}
                </div>
                
                <div className="fs-5 text-white-50 text-uppercase letter-spacing-2">
                    Cycles: <span className="text-white">{cycleCount}</span>
                </div>
             </div>
        </div>

        {/* Preset Display */}
        <div className="mb-5">
             <span className="badge rounded-pill px-4 py-2 bg-white bg-opacity-10 text-white fs-6 fw-normal border border-white border-opacity-10">
                {preset === 'custom' ? 'Custom Rhythm' : preset === '4,4,4,4' ? 'Box Breathing' : preset === '4,7,8,0' ? 'Relaxing Breath' : 'Coherent Breathing'}
             </span>
        </div>

        {/* Bottom Controls */}
        <div className="d-flex gap-4 align-items-center justify-content-center w-100">
            <button 
                className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center hover-bg-white-10 transition-colors" 
                style={{ width: '64px', height: '64px', borderColor: 'rgba(255,255,255,0.1)', color: textSecondary }} 
                onClick={reset} 
                title="Reset"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            
            <button 
                className={`btn rounded-circle d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale border-0`} 
                style={{ 
                    width: '96px', 
                    height: '96px', 
                    backgroundColor: isActive && !isPaused ? '#ef4444' : accentColor, 
                    color: '#0b1220',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    boxShadow: isActive && !isPaused ? '0 0 40px rgba(239, 68, 68, 0.5)' : '0 0 40px rgba(96, 165, 250, 0.5)'
                }}
                onClick={toggleSession}
            >
                {isActive && !isPaused ? 'PAUSE' : 'START'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default BreathTrainerPage;