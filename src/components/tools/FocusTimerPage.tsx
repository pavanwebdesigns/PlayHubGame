import React, { useState, useEffect, useRef } from 'react';

interface FocusTimerPageProps {
  onBack: () => void;
}

const FocusTimerPage: React.FC<FocusTimerPageProps> = ({ onBack }) => {
  // State
  const [mode, setMode] = useState<'Focus' | 'Short Break' | 'Long Break'>('Focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25m
  const [isActive, setIsActive] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Settings State
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  // Refs
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(25 * 60);
  const elapsedRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const circleRef = useRef<SVGCircleElement>(null); // Ref for direct DOM manipulation

  // Initialize timer on mode change or settings change
  useEffect(() => {
    setIsActive(false);
    elapsedRef.current = 0;
    setShowAlert(false);
    
    let newDuration = 25 * 60;
    if (mode === 'Focus') newDuration = focusDuration * 60;
    else if (mode === 'Short Break') newDuration = shortBreakDuration * 60;
    else if (mode === 'Long Break') newDuration = longBreakDuration * 60;
    
    setTimeLeft(newDuration);
    durationRef.current = newDuration;
    
    // Reset visual progress
    if (circleRef.current) {
        const radius = 120;
        const circumference = 2 * Math.PI * radius;
        circleRef.current.style.strokeDashoffset = '0';
        circleRef.current.style.strokeDasharray = `${circumference}`;
    }

  }, [mode, focusDuration, shortBreakDuration, longBreakDuration]);

  // Timer Logic
  useEffect(() => {
    if (!isActive) {
       if (animationRef.current) cancelAnimationFrame(animationRef.current);
       return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      
      const currentElapsed = (timestamp - startTimeRef.current) / 1000 + elapsedRef.current;
      const remaining = Math.max(0, durationRef.current - currentElapsed);
      
      setTimeLeft(Math.ceil(remaining));

      // Update Circle Progress directly for smoothness
      if (circleRef.current) {
          const radius = 120;
          const circumference = 2 * Math.PI * radius;
          // Calculate progress: 0 to 1
          // We want it to empty out as time passes.
          // At start (remaining = duration), progress should be 0 (offset 0).
          // At end (remaining = 0), progress should be 1 (offset circumference).
          const progress = 1 - (remaining / durationRef.current);
          const offset = circumference * progress;
          circleRef.current.style.strokeDashoffset = offset.toString();
      }

      if (remaining <= 0) {
        handleTimerComplete();
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive]);

  const handleTimerComplete = () => {
      setIsActive(false);
      elapsedRef.current = 0;
      playAlarm();
      setShowAlert(true);
      setTimeout(() => {
          setShowAlert(false);
          if (mode === 'Focus') setMode('Short Break');
          else setMode('Focus');
      }, 2000);
  };

  // Audio Helper
  const playAlarm = () => {
    try {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if(ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
        
        osc.start();
        osc.stop(ctx.currentTime + 1);
    } catch (e) { console.error(e); }
  };

  const toggleTimer = () => {
      if (isActive) {
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          elapsedRef.current = durationRef.current - timeLeft;
      } else {
          startTimeRef.current = 0;
      }
      setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    elapsedRef.current = 0;
    const newDuration = mode === 'Focus' ? focusDuration * 60 : mode === 'Short Break' ? shortBreakDuration * 60 : longBreakDuration * 60;
    setTimeLeft(newDuration);
    durationRef.current = newDuration;
    
    if (circleRef.current) {
        // const radius = 120;
        // const circumference = 2 * Math.PI * radius;
        circleRef.current.style.strokeDashoffset = '0';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const accentColor = mode === 'Focus' ? '#ef4444' : mode === 'Short Break' ? '#22c55e' : '#3b82f6';

  return (
    <div className="fixed-top w-100 h-100 d-flex align-items-center justify-content-center p-0 m-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', zIndex: 2000 }}>
       
       {/* Alert Overlay */}
       {showAlert && (
           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-black bg-opacity-75" style={{ zIndex: 3000 }}>
               <div className="text-center animate-bounce">
                   <div className="display-1 mb-3">🎉</div>
                   <h2 className="display-4 fw-bold text-white">Time's Up!</h2>
               </div>
           </div>
       )}

       {/* Back Button */}
      <button 
        onClick={onBack} 
        className="btn btn-link text-white text-decoration-none position-absolute top-0 start-0 m-4 z-3 d-flex align-items-center gap-2 opacity-75 hover-opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Tools
      </button>

      {/* Main Container */}
      <div className="position-relative w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        
        {/* Settings Modal Overlay */}
        {showSettings && (
            <div className="position-absolute top-50 start-50 translate-middle p-4 bg-dark border border-secondary border-opacity-25 rounded-4 shadow-lg" style={{ width: '320px', zIndex: 20, backdropFilter: 'blur(10px)', background: 'rgba(15, 23, 42, 0.95)' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="m-0 text-white">Timer Settings</h5>
                    <button className="btn-close btn-close-white" onClick={() => setShowSettings(false)}></button>
                </div>
                <div className="mb-3">
                    <label className="form-label text-white-50 small">Focus (min)</label>
                    <input type="number" className="form-control bg-black text-white border-secondary" value={focusDuration} onChange={(e) => setFocusDuration(Number(e.target.value))} />
                </div>
                <div className="mb-3">
                    <label className="form-label text-white-50 small">Short Break (min)</label>
                    <input type="number" className="form-control bg-black text-white border-secondary" value={shortBreakDuration} onChange={(e) => setShortBreakDuration(Number(e.target.value))} />
                </div>
                <div className="mb-4">
                    <label className="form-label text-white-50 small">Long Break (min)</label>
                    <input type="number" className="form-control bg-black text-white border-secondary" value={longBreakDuration} onChange={(e) => setLongBreakDuration(Number(e.target.value))} />
                </div>
                <button className="btn btn-primary w-100" onClick={() => setShowSettings(false)}>Save</button>
            </div>
        )}

        {/* Mode Switcher Pills */}
        <div className="bg-white bg-opacity-10 p-1 rounded-pill d-inline-flex mb-5 border border-white border-opacity-10">
            {['Focus', 'Short Break', 'Long Break'].map((m) => (
                <button
                    key={m}
                    onClick={() => setMode(m as any)}
                    className={`btn rounded-pill px-4 py-2 text-sm fw-bold transition-all ${mode === m ? 'bg-white text-dark shadow' : 'text-white-50 hover-text-white'}`}
                    style={{ border: 'none' }}
                >
                    {m}
                </button>
            ))}
        </div>

        {/* Timer Display */}
        <div className="position-relative mb-5" style={{ width: '300px', height: '300px' }}>
             <svg className="w-100 h-100" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                {/* Indicator */}
                <circle 
                    ref={circleRef}
                    cx="130" cy="130" r="120" 
                    fill="none" 
                    stroke={accentColor} 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    // Initial static values, updated via ref in animation loop
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset="0"
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }} // Smooth transition for frames
                />
             </svg>
             
             <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-4">
                <div className="display-1 fw-bold text-white" style={{ fontFamily: 'monospace', letterSpacing: '-2px', fontSize: '4.5rem' }}>
                    {formatTime(timeLeft)}
                </div>
                <input 
                    type="text" 
                    placeholder="What are you focusing on?" 
                    className="form-control form-control-sm bg-transparent border-0 text-center text-white-50 placeholder-white-50 mt-2 w-100 focus:ring-0"
                    style={{ fontSize: '1rem', outline: 'none', boxShadow: 'none' }}
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                />
             </div>
        </div>

        {/* Controls */}
        <div className="d-flex gap-3 align-items-center">
            {/* Settings Button - Restored to bottom */}
            <button 
                className="btn btn-outline-secondary rounded-circle p-3 d-flex align-items-center justify-content-center hover-bg-white-10" 
                style={{ width: '64px', height: '64px', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }} 
                onClick={() => setShowSettings(!showSettings)} 
                title="Settings"
            >
                {/* Updated Settings Icon - Solid Gear */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84a.484.484 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.27.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
            </button>

            <button 
                className={`btn rounded-pill px-5 py-3 fw-bold fs-4 shadow-lg transition-transform hover-scale border-0 ${isActive ? 'btn-danger' : 'btn-primary'}`}
                style={{ minWidth: '180px' }}
                onClick={toggleTimer}
            >
                {isActive ? 'PAUSE' : 'START'}
            </button>

            <button className="btn btn-outline-secondary rounded-circle p-3 d-flex align-items-center justify-content-center hover-bg-white-10" style={{ width: '64px', height: '64px', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }} onClick={resetTimer} title="Reset">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
        </div>

      </div>
    </div>
  );
};

export default FocusTimerPage;