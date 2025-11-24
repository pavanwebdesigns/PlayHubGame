import { useState, useEffect, useRef } from 'react';

const HeartRateMonitor = () => {
  const [isActive, setIsActive] = useState(false);
  const [bpm, setBpm] = useState<number | null>(null);
  const [status, setStatus] = useState('Ready');
  const [ , setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Signal processing state
  const signalBuffer = useRef<number[]>([]);
  const lastPeakTime = useRef<number>(0);
  const peaks = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Request camera with torch if available (advanced, often mobile-only)
      // For desktop, we rely on user covering lens + ambient light
      const constraints = { video: { facingMode: 'environment', width: { ideal: 320 }, height: { ideal: 240 } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
           videoRef.current?.play();
           setStatus('Place finger gently over camera');
           setIsActive(true);
           processFrame();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus('Camera access denied or not found.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsActive(false);
    setStatus('Ready');
    setBpm(null);
    setProgress(0);
    signalBuffer.current = [];
    peaks.current = [];
    lastPeakTime.current = 0;
  };

  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw current video frame to canvas (small size for performance)
    const width = 50; 
    const height = 50;
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    // Get center pixel data (10x10 area)
    const frameData = ctx.getImageData(width / 2 - 5, height / 2 - 5, 10, 10).data;
    let redSum = 0;
    let count = 0;

    // Calculate average redness
    // Pixels are [R, G, B, A, R, G, B, A, ...]
    for (let i = 0; i < frameData.length; i += 4) {
      redSum += frameData[i];
      count++;
    }
    const avgRed = redSum / count;

    // Signal processing
    const now = Date.now();
    signalBuffer.current.push(avgRed);
    
    // Keep buffer manageable (last ~3 seconds at 30fps)
    if (signalBuffer.current.length > 90) signalBuffer.current.shift();

    // Detect if finger is likely present (High Red value)
    // This threshold might need tuning based on camera exposure
    if (avgRed < 40) { 
         setStatus('Place finger on camera');
         setBpm(null);
         // Reset signal if finger removed
         signalBuffer.current = []; 
    } else {
         setStatus('Measuring...');
         
         // Peak Detection Logic
         // We look for a local maximum in the signal
         if (signalBuffer.current.length > 10) {
             const len = signalBuffer.current.length;
             const current = signalBuffer.current[len - 1];
             const prev = signalBuffer.current[len - 2];
             const prev2 = signalBuffer.current[len - 3];
             
             // Simple peak check: verify if we just passed a crest
             // We need smoothing for real world, but this is a start
             if (prev > prev2 && prev > current) {
                 const timeSinceLastPeak = now - lastPeakTime.current;
                 
                 // Debounce: valid heart rates are usually 40-200 BPM
                 // 40 BPM = 1500ms gap, 200 BPM = 300ms gap
                 if (timeSinceLastPeak > 300 && timeSinceLastPeak < 1500) {
                     const instantBpm = 60000 / timeSinceLastPeak;
                     
                     peaks.current.push(instantBpm);
                     if (peaks.current.length > 5) peaks.current.shift();
                     
                     // Average recent peaks for stability
                     const avgBpm = Math.round(peaks.current.reduce((a, b) => a + b, 0) / peaks.current.length);
                     setBpm(avgBpm);
                 }
                 lastPeakTime.current = now;
             }
         }
    }

    // Visual progress bar for "Measuring" feedback loop
    setProgress(p => (p + 1) % 100);

    animationRef.current = requestAnimationFrame(processFrame);
  };

  return (
    <div className="text-center text-white d-flex flex-column align-items-center justify-content-center h-100 w-100">
      
      {/* Camera Feed Circle */}
      <div className="mb-4 position-relative overflow-hidden rounded-circle shadow-lg border border-secondary border-opacity-50" style={{ width: '220px', height: '220px', backgroundColor: '#000' }}>
        <video 
            ref={videoRef} 
            width="100" 
            height="100" 
            style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                opacity: isActive ? 0.6 : 0.2,
                transform: 'scale(1.5)' // Zoom in slightly to fill circle
            }} 
            playsInline 
            muted
        />
        
        {/* Overlay Heart Icon */}
        <div className="position-absolute top-50 start-50 translate-middle z-10 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className={`text-danger ${bpm ? 'animate-pulse' : ''}`} style={{ filter: 'drop-shadow(0 0 15px rgba(220, 53, 69, 0.9))', animationDuration: bpm ? `${60/bpm}s` : '1s' }}>
                <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
        </div>
        
        {/* Active State Pulse Ring */}
        {isActive && !bpm && (
             <div className="position-absolute top-0 start-0 w-100 h-100 border-4 border-danger rounded-circle opacity-50" style={{ animation: 'spin 2s linear infinite' }}></div>
        )}
      </div>
      
      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} width="50" height="50" className="d-none"></canvas>

      {/* BPM Display */}
      <div className="mb-4">
          <h2 className="display-1 fw-bold mb-0 font-monospace tracking-tighter text-white">
            {bpm ? bpm : '--'} 
          </h2>
          <span className="fs-4 text-white-50 text-uppercase letter-spacing-2">BPM</span>
      </div>
      
      <p className="lead text-white-50 mb-5" style={{ minHeight: '1.5em' }}>{status}</p>

      {/* Controls */}
      {!isActive ? (
        <button 
            className="btn btn-danger btn-lg rounded-pill px-5 py-3 shadow-lg fw-bold fs-4 d-flex align-items-center gap-2 hover-scale" 
            onClick={startCamera}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Start Measurement
        </button>
      ) : (
        <button 
            className="btn btn-outline-light btn-lg rounded-pill px-5 py-3 shadow-lg fw-bold fs-4 hover-scale" 
            onClick={stopCamera}
        >
            Stop
        </button>
      )}
      
      {/* Instructions */}
      <div className="mt-5 p-4 bg-white bg-opacity-5 rounded-4 text-start mx-auto border border-white border-opacity-10" style={{ maxWidth: '450px' }}>
         <h6 className="text-primary mb-3 d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
            How to use
         </h6>
         <ul className="small text-white-50 mb-0 ps-3 space-y-2">
             <li>Allow camera access when prompted.</li>
             <li>Gently place your fingertip <strong>fully over the camera lens</strong>.</li>
             <li>Don't press too hard, or blood flow will stop.</li>
             <li>Hold still in a well-lit room (or use a flashlight) for best results.</li>
         </ul>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hover-scale:hover { transform: scale(1.05); }
        .animate-pulse { animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .8; transform: scale(0.95); } }
      `}</style>
    </div>
  );
};

export default HeartRateMonitor;