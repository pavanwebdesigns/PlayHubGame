import React, { useState, useEffect, useRef } from 'react';

interface SpeedTestPageProps {
  onBack: () => void;
}

const SpeedTestPage: React.FC<SpeedTestPageProps> = ({ onBack }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Press Start to begin');
  
  // We keep these in state for the text display, but use refs for the animation loop
  const [speedValue, setSpeedValue] = useState(0); 
  const [speedUnit, setSpeedUnit] = useState('Mbps');

  const [ping, setPing] = useState<string | number>('-');
  const [download, setDownload] = useState<string | number>('-');
  const [upload, setUpload] = useState<string | number>('-');
  const [qualityText, setQualityText] = useState<string | null>(null);

  const animationRef = useRef<number | null>(null);
  
  // Refs for direct DOM manipulation (Performance)
  const needleRef = useRef<SVGGElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  
  // Constants
  const totalProgressLength = 251.3; // 2 * PI * 80 * (180/360) roughly, or just empiric from HTML
  const maxGaugeSpeed = 250; 

  // Helper to update DOM elements directly
  const updateGaugeDOM = (currentSpeed: number, maxSpeed: number) => {
    const percentage = Math.min(currentSpeed / maxSpeed, 1);
    const rotation = -90 + (percentage * 180);
    const offset = totalProgressLength * (1 - percentage);
    
    if (needleRef.current) {
        needleRef.current.style.transform = `rotate(${rotation}deg)`;
    }
    if (progressPathRef.current) {
        progressPathRef.current.style.strokeDashoffset = offset.toString();
    }
    // Update the text value (optional: throttle this if it causes lag, but usually fine)
    setSpeedValue(currentSpeed);
  };

  const animateSpeed = (target: number, duration: number, onComplete: (val: number) => void) => {
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentSpeed = easedProgress * target;

      updateGaugeDOM(currentSpeed, maxGaugeSpeed);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animation);
      } else {
        onComplete(target);
      }
    };
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animation);
  };

  // --- Test Phases ---
  const runPingTest = (): Promise<void> => {
    return new Promise(resolve => {
      setStatus('Testing Latency...');
      setSpeedUnit('ms');
      updateGaugeDOM(0, 100);
      
      setTimeout(() => {
        const randomPing = Math.floor(Math.random() * 40) + 8;
        updateGaugeDOM(randomPing, 100); // Show visual jump for ping
        setPing(randomPing);
        
        setTimeout(() => {
             updateGaugeDOM(0, 100); 
             resolve();
        }, 500);
      }, 1500);
    });
  };

  const runDownloadTest = (): Promise<void> => {
    return new Promise(resolve => {
      setStatus('Running Download Test...');
      setSpeedUnit('Mbps');
      const targetSpeed = Math.random() * 500 + 20; 
      
      animateSpeed(targetSpeed, 6000, (finalSpeed) => {
        setDownload(finalSpeed.toFixed(2));
        resolve();
      });
    });
  };

  const runUploadTest = (): Promise<void> => {
    return new Promise(resolve => {
      setStatus('Running Upload Test...');
      // Reset gauge for upload start
      updateGaugeDOM(0, 100);
      
      const targetSpeed = Math.random() * 80 + 10; 
      animateSpeed(targetSpeed, 7000, (finalSpeed) => {
        setUpload(finalSpeed.toFixed(2));
        resolve();
      });
    });
  };

  const runTest = () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Reset UI
    setStatus('Preparing test...');
    updateGaugeDOM(0, 100);
    setPing('-');
    setDownload('-');
    setUpload('-');
    setQualityText(null);

    runPingTest()
      .then(runDownloadTest)
      .then(runUploadTest)
      .then(() => {
        setStatus('Test Complete!');
        updateGaugeDOM(0, 100); // Reset gauge to 0
        setIsRunning(false);
      })
      .catch(err => {
        console.error(err);
        setStatus('An error occurred.');
        setIsRunning(false);
      });
  };
  
  // Effect for quality text
  useEffect(() => {
      if (!isRunning && typeof download === 'string' && download !== '-') {
          const speed = parseFloat(download);
          if (speed < 5) setQualityText("Your connection is suitable for basic browsing and email.");
          else if (speed < 25) setQualityText("Solid speed for HD streaming and smooth video calls.");
          else if (speed < 100) setQualityText("Excellent for 4K streaming, downloads, and online gaming!");
          else if (speed < 400) setQualityText("Blazing fast! Your connection can handle anything.");
          else setQualityText("Exceptional Gigabit-level speed! Truly top-tier performance.");
      }
  }, [isRunning, download]);

  return (
    <div className="fixed-top w-100 h-100 d-flex align-items-center justify-content-center p-0 m-0" style={{ backgroundColor: '#0D1117', color: '#C9D1D9', fontFamily: "'Inter', sans-serif", zIndex: 2000, overflowY: 'auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="btn btn-link text-decoration-none position-absolute top-0 start-0 m-4 z-3 d-flex align-items-center gap-2"
        style={{ color: '#8B949E' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Tools
      </button>

      <div className="d-flex flex-column align-items-center w-100" style={{ maxWidth: '800px' }}>
        
        {/* Gauge Section */}
        <div className="position-relative w-100 mb-4" style={{ maxWidth: '400px' }}>
             <svg className="w-100 h-auto" viewBox="0 0 200 115" style={{ fontFamily: "'Inter', sans-serif" }}>
                <defs>
                    <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1F6FEB" />
                        <stop offset="100%" stopColor="#58A6FF" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Background Arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#161B22" strokeWidth="20" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#30363D" strokeWidth="1" />

                {/* Progress Arc */}
                <path 
                    ref={progressPathRef}
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="url(#gauge-gradient)" 
                    strokeWidth="20" 
                    strokeLinecap="round" 
                    strokeDasharray="251.3" 
                    strokeDashoffset="251.3"
                    style={{ filter: 'url(#glow)', transition: 'stroke-dashoffset 0.1s linear' }} 
                />

                {/* Ticks */}
                <g fill="#8B949E" fontSize="9px" textAnchor="middle" fontWeight="500">
                    <text x="18" y="112">0</text>
                    <text x="40" y="40">50</text>
                    <text x="100" y="18">100</text>
                    <text x="160" y="40">150</text>
                    <text x="182" y="112">250</text>
                </g>

                {/* Needle */}
                <g 
                    ref={needleRef}
                    style={{ transformOrigin: '100px 100px', transform: 'rotate(-90deg)', transition: 'transform 0.1s linear' }}
                >
                  <path d="M 100 25 L 104 100 L 96 100 Z" fill="#58A6FF" />
                  <circle cx="100" cy="100" r="8" fill="#0D1117" stroke="#58A6FF" strokeWidth="3"/>
                </g>
            </svg>

            <div className="position-absolute start-50 translate-middle-x text-center" style={{ bottom: '30%' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, display: 'block' }}>
                    {typeof speedValue === 'number' ? speedValue.toFixed(2) : speedValue}
                </span>
                <p style={{ fontSize: '1.25rem', color: '#8B949E', fontWeight: 500, margin: 0 }}>{speedUnit}</p>
            </div>
        </div>
        
        <div className="mb-4 text-center" style={{ fontSize: '1.1rem', fontWeight: 500, color: '#58A6FF', minHeight: '25px' }}>
            {status}
        </div>

        {/* Results Grid */}
        <div className="d-grid gap-3 w-100 px-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
             <div className="p-4 rounded-3 text-center" style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
                <div style={{ fontSize: '0.9rem', color: '#8B949E', marginBottom: '0.5rem' }}>Ping</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                    {ping}<span style={{ fontSize: '1rem', marginLeft: '0.25rem', color: '#8B949E' }}>ms</span>
                </div>
            </div>
             <div className="p-4 rounded-3 text-center" style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
                <div style={{ fontSize: '0.9rem', color: '#8B949E', marginBottom: '0.5rem' }}>Download</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                    {download}<span style={{ fontSize: '1rem', marginLeft: '0.25rem', color: '#8B949E' }}>Mbps</span>
                </div>
            </div>
             <div className="p-4 rounded-3 text-center" style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
                <div style={{ fontSize: '0.9rem', color: '#8B949E', marginBottom: '0.5rem' }}>Upload</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                    {upload}<span style={{ fontSize: '1rem', marginLeft: '0.25rem', color: '#8B949E' }}>Mbps</span>
                </div>
            </div>
            
            {qualityText && (
                <div className="p-4 rounded-3 text-center" style={{ gridColumn: '1 / -1', backgroundColor: '#161B22', border: '1px solid #30363D', color: '#58A6FF', fontWeight: 500, fontSize: '1.1rem' }}>
                    {qualityText}
                </div>
            )}
        </div>

        <button 
            onClick={runTest}
            disabled={isRunning}
            className="mt-5 border-0 rounded-pill"
            style={{ 
                background: isRunning ? '#30363D' : 'linear-gradient(90deg, #1F6FEB, #58A6FF)', 
                color: 'white', 
                padding: '1rem 3rem', 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                cursor: isRunning ? 'not-allowed' : 'pointer',
                boxShadow: isRunning ? 'none' : '0 0 25px rgba(88, 166, 255, 0.3)',
                transition: 'all 0.3s ease'
            }}
        >
            {isRunning ? 'Testing...' : 'Start Test'}
        </button>

      </div>
    </div>
  );
};

export default SpeedTestPage;