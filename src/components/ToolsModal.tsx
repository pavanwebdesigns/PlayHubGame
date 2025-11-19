import React, { useState, useEffect, useRef } from 'react';

// --- Reaction Time Game ---
const ReactionGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [message, setMessage] = useState('Click to Start');
  const [startTime, setStartTime] = useState(0);
  const [ , setScore] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleStart = () => {
    setGameState('waiting');
    setMessage('Wait for Green...');
    setScore(null);
    
    const randomDelay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setMessage('CLICK NOW!');
      setStartTime(Date.now());
    }, randomDelay);
  };

  const handleClick = () => {
    if (gameState === 'idle' || gameState === 'finished') {
      handleStart();
    } else if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('finished');
      setMessage('Too early! Try again.');
    } else if (gameState === 'ready') {
      const endTime = Date.now();
      const reactionTime = endTime - startTime;
      setScore(reactionTime);
      setGameState('finished');
      setMessage(`${reactionTime} ms`);
    }
  };

  let bgColor = 'bg-secondary';
  if (gameState === 'waiting') bgColor = 'bg-danger';
  if (gameState === 'ready') bgColor = 'bg-success';
  if (gameState === 'finished') bgColor = 'bg-primary';

  return (
    <div 
      className={`p-4 rounded-3 text-center text-white cursor-pointer shadow-sm mb-3 ${bgColor}`}
      style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'background-color 0.2s' }}
      onMouseDown={handleClick}
    >
      <h4 className="fw-bold">⚡ Reaction Test</h4>
      <h2 className="fw-bold">{message}</h2>
      {gameState === 'idle' && <small className="opacity-75">Click to start</small>}
    </div>
  );
};

// --- CPS Test (Clicks Per Second) ---
const CpsTest = () => {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const [isActive, setIsActive] = useState(false);
    const [result, setResult] = useState<number | null>(null);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setResult(clicks / 5);
            if(interval) clearInterval(interval);
        }
        return () => { if(interval) clearInterval(interval); };
    }, [isActive, timeLeft, clicks]);

    const handleClick = () => {
        if (timeLeft === 0) {
            // Reset
            setClicks(0);
            setTimeLeft(5);
            setResult(null);
            setIsActive(true);
            return;
        }
        if (!isActive) setIsActive(true);
        setClicks(prev => prev + 1);
    };

    return (
        <div className="bg-dark bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-25 text-center mb-3">
            <h5 className="mb-3">🖱️ CPS Test (5s)</h5>
            <button 
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '100px', height: '100px', fontSize: '1.2rem', userSelect: 'none' }}
                onMouseDown={handleClick}
            >
               {timeLeft === 0 ? "Retry" : "CLICK!"}
            </button>
            <div className="d-flex justify-content-around">
                <div><strong>{clicks}</strong> <span className="small opacity-75">Clicks</span></div>
                <div><strong>{timeLeft}s</strong> <span className="small opacity-75">Time</span></div>
            </div>
            {result !== null && <div className="mt-2 text-success fw-bold">{result} CPS</div>}
        </div>
    );
};

// --- System Info ---
const SystemInfo = () => {
    const [info, setInfo] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setInfo({ width: window.screen.width, height: window.screen.height });
    }, []);

    return (
        <div className="bg-dark bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-25 text-center">
            <h5 className="mb-2">🖥️ Your Specs</h5>
            <div className="d-flex justify-content-between px-3 small">
                <span>Res:</span> <span className="fw-bold text-primary">{info.width}x{info.height}</span>
            </div>
            <div className="d-flex justify-content-between px-3 small">
                <span>Win:</span> <span className="fw-bold text-primary">{window.innerWidth}x{window.innerHeight}</span>
            </div>
        </div>
    );
};

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">🛠️ Gamer Tools</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <ReactionGame />
            <div className="row g-3">
                <div className="col-6"><CpsTest /></div>
                <div className="col-6"><SystemInfo /></div>
            </div>
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsModal;