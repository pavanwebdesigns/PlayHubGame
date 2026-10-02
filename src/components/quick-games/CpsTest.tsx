import { useEffect, useState } from 'react';

interface CpsTestProps {
  onBack: () => void;
}

const CpsTest = ({ onBack }: CpsTestProps) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setResult(clicks / 5);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive, timeLeft, clicks]);

  const handleClick = () => {
    if (timeLeft === 0) {
      setClicks(0);
      setTimeLeft(5);
      setResult(null);
      setIsActive(true);
      return;
    }
    if (!isActive) setIsActive(true);
    setClicks((prev) => prev + 1);
  };

  return (
    <div className="container py-4 text-center" style={{ maxWidth: '760px' }}>
      <div className="text-start">
        <button type="button" className="btn btn-outline-light rounded-pill px-4 mb-4" style={{ minHeight: '44px' }} onClick={onBack}>
          Back to games
        </button>
      </div>
      <h1 className="text-white mb-4">CPS Test</h1>
      <p className="text-white-50">Click as many times as you can in 5 seconds.</p>
      <button
        type="button"
        className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
        style={{ width: '200px', height: '200px', fontSize: '2rem', userSelect: 'none' }}
        onMouseDown={handleClick}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          handleClick();
        }}
      >
        {timeLeft === 0 ? 'Retry' : 'Click'}
      </button>
      <div className="d-flex justify-content-center gap-5 text-white">
        <div>
          <div className="display-4 fw-bold">{clicks}</div>
          <div className="text-white-50">Clicks</div>
        </div>
        <div>
          <div className="display-4 fw-bold">{timeLeft}s</div>
          <div className="text-white-50">Time left</div>
        </div>
      </div>
      {result != null && (
        <p className="alert alert-success mt-4 mb-0 fs-4 d-inline-block px-4" role="status">
          Your speed: <strong>{result} CPS</strong>
        </p>
      )}
    </div>
  );
};

export default CpsTest;
