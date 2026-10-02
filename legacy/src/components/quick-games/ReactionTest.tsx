import { useEffect, useRef, useState } from 'react';

interface ReactionTestProps {
  onBack: () => void;
}

const ReactionTest = ({ onBack }: ReactionTestProps) => {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [message, setMessage] = useState('Click to start');
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const handleStart = () => {
    setGameState('waiting');
    setMessage('Wait for green...');
    setScore(null);
    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    timeoutRef.current = window.setTimeout(() => {
      setGameState('ready');
      setMessage('Click now');
      setStartTime(Date.now());
    }, randomDelay);
  };

  const handleClick = () => {
    if (gameState === 'idle' || gameState === 'finished') {
      handleStart();
    } else if (gameState === 'waiting') {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setGameState('finished');
      setMessage('Too early');
    } else if (gameState === 'ready') {
      const reactionTime = Date.now() - startTime;
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
    <div className="container py-4" style={{ maxWidth: '760px' }}>
      <button type="button" className="btn btn-outline-light rounded-pill px-4 mb-4" style={{ minHeight: '44px' }} onClick={onBack}>
        Back to games
      </button>
      <h1 className="text-white mb-4">Reaction Time Test</h1>
      <button
        type="button"
        className={`w-100 p-5 rounded-4 text-center text-white border-0 shadow-lg ${bgColor}`}
        style={{ minHeight: '320px', cursor: 'pointer' }}
        onMouseDown={handleClick}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          handleClick();
        }}
      >
        <span className="display-4 fw-bold d-block" aria-live="polite">{message}</span>
        {gameState === 'finished' && score != null && (
          <span className="fs-4 d-block mt-3">Your reaction time: {score} ms</span>
        )}
        {gameState === 'idle' && <span className="d-block mt-3 opacity-75 fs-5">Click this box to begin</span>}
      </button>
    </div>
  );
};

export default ReactionTest;
