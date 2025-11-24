import React, { useState, useEffect, useRef } from 'react';

// --- Tool Card Component ---
interface ToolCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  isReady: boolean;
  category: string;
  onLaunch: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, isReady, onLaunch, isFavorite, onToggleFavorite }) => (
  <div 
    className={`card h-100 border-0 bg-dark bg-opacity-25 text-white tool-card position-relative overflow-hidden group`}
    onClick={isReady ? onLaunch : undefined}
    style={{ 
      cursor: isReady ? 'pointer' : 'default', 
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.05)'
    }}
  >
    <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-br from-primary to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(60,100,255,0.15) 0%, transparent 70%)' }}></div>

    <button 
        className="btn position-absolute top-0 end-0 m-3 p-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-transform hover-scale z-2"
        style={{ 
          backgroundColor: isFavorite ? 'rgba(220, 53, 69, 0.9)' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.1)',
          width: '32px', 
          height: '32px',
          backdropFilter: 'blur(4px)'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill={isFavorite ? "white" : "none"} 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

    <div className="card-body p-4 d-flex flex-column align-items-start z-1 position-relative">
      <div className="mb-3 p-3 rounded-circle bg-black bg-opacity-25 d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '56px', height: '56px', fontSize: '1.75rem' }}>
        {icon}
      </div>
      
      <h5 className="card-title fw-bold mb-2 text-white group-hover:text-primary transition-colors pe-4">
        {title}
      </h5>
      
      <p className="card-text text-white-50 small mb-4 flex-grow-1" style={{ lineHeight: '1.4' }}>
        {description}
      </p>

      <div className="w-100 d-flex align-items-center justify-content-between mt-auto">
        {isReady ? (
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 d-flex align-items-center gap-2 group-hover:bg-primary group-hover:text-white transition-all">
             Launch
          </span>
        ) : (
          <span className="badge bg-secondary bg-opacity-10 text-white-50 border border-secondary border-opacity-25 rounded-pill px-3 py-2">
            Soon
          </span>
        )}
      </div>
    </div>
    
    <style>{`
      .tool-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        border-color: rgba(255,255,255,0.2) !important;
      }
      .group:hover .group-hover\\:text-primary { color: #0d6efd !important; }
      .group:hover .group-hover\\:bg-primary { background-color: #0d6efd !important; }
      .group:hover .group-hover\\:text-white { color: white !important; }
    `}</style>
  </div>
);

// -- Exporting Tool Components for Re-use in Full Pages --

export const ReactionGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [message, setMessage] = useState('Click to Start');
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleStart = () => {
    setGameState('waiting');
    setMessage('Wait for Green...');
    setScore(null);
    
    const randomDelay = Math.floor(Math.random() * 2000) + 1000; 
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
      setMessage('Too early!');
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
      className={`p-5 rounded-4 text-center text-white cursor-pointer shadow-lg transition-all ${bgColor}`}
      style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'background-color 0.2s' }}
      onMouseDown={handleClick}
    >
      <h2 className="display-3 fw-bold mb-4">⚡ Reaction Test</h2>
      <h3 className="display-1 fw-bold">{message}</h3>
      {gameState === 'finished' && score && (
         <p className="fs-4 mt-3">Your reaction time: {score}ms</p>
      )}
      {gameState === 'idle' && <p className="mt-3 opacity-75 fs-5">Click anywhere in this box to begin</p>}
    </div>
  );
};

export const CpsTest = () => {
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
        <div className="text-center py-5">
            <h3 className="mb-5 display-6 fw-bold text-white">🖱️ CPS Test (5s)</h3>
            <button 
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-5 shadow-lg active:scale-95 transition-transform"
                style={{ width: '200px', height: '200px', fontSize: '2.5rem', userSelect: 'none', borderWidth: '3px' }}
                onMouseDown={handleClick}
            >
               {timeLeft === 0 ? "Retry" : "CLICK!"}
            </button>
            <div className="row g-4 justify-content-center">
                <div className="col-auto px-5 border-end border-secondary border-opacity-25">
                    <div className="display-4 fw-bold text-white">{clicks}</div>
                    <div className="text-white-50 text-uppercase small letter-spacing-2">Clicks</div>
                </div>
                <div className="col-auto px-5">
                    <div className="display-4 fw-bold text-white">{timeLeft}s</div>
                    <div className="text-white-50 text-uppercase small letter-spacing-2">Time Left</div>
                </div>
            </div>
            {result !== null && (
                <div className="alert alert-success mt-5 mb-0 fs-3 d-inline-block px-5">
                    Your Speed: <strong>{result} CPS</strong>
                </div>
            )}
        </div>
    );
};

export const SystemInfoTool = () => {
    const [info, setInfo] = useState<any>({ width: 0, height: 0, ua: '' });

    useEffect(() => {
        setInfo({
            width: window.screen.width,
            height: window.screen.height,
            ua: navigator.userAgent,
            os: navigator.platform,
            language: navigator.language,
            cores: navigator.hardwareConcurrency
        });
    }, []);

    return (
        <div className="py-4">
            <ul className="list-group list-group-flush bg-transparent">
                <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-4">
                    <span className="fs-5">Screen Resolution</span>
                    <span className="fw-bold text-primary fs-4 font-monospace">{info.width} x {info.height}</span>
                </li>
                <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-4">
                    <span className="fs-5">Window Size</span>
                    <span className="fw-bold text-primary fs-4 font-monospace">{window.innerWidth} x {window.innerHeight}</span>
                </li>
                 <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-4">
                    <span className="fs-5">Operating System</span>
                    <span className="fw-bold text-primary fs-4 font-monospace">{info.os}</span>
                </li>
                <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-4">
                    <span className="fs-5">Language</span>
                    <span className="fw-bold text-primary fs-4 font-monospace">{info.language}</span>
                </li>
                 <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 d-flex justify-content-between align-items-center py-4">
                    <span className="fs-5">CPU Cores</span>
                    <span className="fw-bold text-primary fs-4 font-monospace">{info.cores}</span>
                </li>
                <li className="list-group-item bg-transparent text-white border-secondary border-opacity-25 py-4">
                    <span className="d-block mb-2 fs-5">User Agent</span>
                    <code className="d-block p-4 bg-black bg-opacity-50 rounded-3 text-white-50" style={{ fontSize: '0.9rem' }}>{info.ua}</code>
                </li>
            </ul>
        </div>
    );
};

export const PasswordGenTool = () => {
    const [pass, setPass] = useState('');
    const generate = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let result = "";
        for (let i = 0; i < 16; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setPass(result);
    }
    return (
        <div className="text-center py-5">
            <div className="display-2 font-monospace mb-5 p-5 bg-black bg-opacity-50 rounded-4 text-break user-select-all text-white border border-white border-opacity-10">
                {pass || 'Click Generate'}
            </div>
            <button className="btn btn-primary btn-lg px-5 py-3 fs-3 rounded-pill shadow-lg" onClick={generate}>Generate Password</button>
        </div>
    )
}


interface ToolsPageProps {
  favoriteTools?: any[];
  onToggleFavorite?: (tool: any) => void;
  onNavigateToTool: (toolId: string) => void;
}

// --- Main Page Component ---
const ToolsPage: React.FC<ToolsPageProps> = ({ favoriteTools = [], onToggleFavorite = () => {}, onNavigateToTool }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const categories = [
    { id: 'health', name: 'Health', icon: '🧠' },
    { id: 'prod', name: 'Productivity', icon: '⚙️' },
    { id: 'web', name: 'Internet', icon: '📱' },
    { id: 'calc', name: 'Math', icon: '🧮' },
    { id: 'dev', name: 'Dev', icon: '🎨' },
    { id: 'data', name: 'Data', icon: '📊' },
    { id: 'fun', name: 'Personal', icon: '🧭' },
    { id: 'sys', name: 'System', icon: '🌍' },
  ];

  const tools = [
    // 1. Health
    { id: 'breath', category: 'health', icon: '🫁', title: 'Breath Trainer', description: 'Guided 4-7-8 breathing for calmness.', isReady: true },
    { id: 'heart', category: 'health', icon: '❤️', title: 'Heart Rate Monitor', description: 'Measure pulse via webcam (Coming Soon).', isReady: false }, 
    { id: 'focus', category: 'health', icon: '🧘', title: 'Focus Timer', description: 'Pomodoro timer with ambient sounds.', isReady: true },
    { id: 'sleep', category: 'health', icon: '🌙', title: 'Sleep Sounds', description: 'White noise generator.', isReady: true },
    { id: 'mood', category: 'health', icon: '☀️', title: 'Mood Journal', description: 'Local daily mood tracker.', isReady: true },
    { id: 'affirm', category: 'health', icon: '🧩', title: 'Affirmations', description: 'Daily positive quotes.', isReady: true },
    
    // 2. Productivity
    { id: 'todo', category: 'prod', icon: '📆', title: 'Daily Planner', description: 'Local storage task manager.', isReady: true },
    { id: 'timezone', category: 'prod', icon: '🕓', title: 'Time Converter', description: 'Compare global time zones.', isReady: true },
    { id: 'unit', category: 'prod', icon: '🔁', title: 'Unit Converter', description: 'Length, weight, temp, currency.', isReady: true },
    { id: 'stopwatch', category: 'prod', icon: '⏱️', title: 'Stopwatch', description: 'Precision timer with laps.', isReady: true },
    { id: 'ruler', category: 'prod', icon: '📏', title: 'Screen Ruler', description: 'Measure pixels on screen.', isReady: false },
    { id: 'screenshot', category: 'prod', icon: '📸', title: 'Screenshot Editor', description: 'Capture & annotate.', isReady: false },
    { id: 'age', category: 'prod', icon: '📅', title: 'Age Calculator', description: 'Calculate exact age & dates.', isReady: true },
    { id: 'sys-info', category: 'prod', icon: '💻', title: 'System Info', description: 'Detailed device specs.', isReady: true },

    // 3. Internet
    { id: 'speed', category: 'web', icon: '🚀', title: 'Speed Test', description: 'Measure connection latency.', isReady: true }, // ENABLED
    { id: 'ip', category: 'web', icon: '🔒', title: 'IP Finder', description: 'Show public IP & ISP.', isReady: true },
    { id: 'uptime', category: 'web', icon: '🌐', title: 'Uptime Checker', description: 'Check if a site is down.', isReady: false },
    { id: 'qr', category: 'web', icon: '🧩', title: 'QR Generator', description: 'Create & scan QR codes.', isReady: true },
    { id: 'password-gen', category: 'web', icon: '🧱', title: 'Password Gen', description: 'Create strong secure passwords.', isReady: true },
    
    // 4. Calc
    { id: 'emi', category: 'calc', icon: '🧾', title: 'EMI Calculator', description: 'Loan installment estimator.', isReady: true },
    { id: 'bmi', category: 'calc', icon: '📈', title: 'BMI Calculator', description: 'Body Mass Index check.', isReady: true },
    { id: 'gst', category: 'calc', icon: '🏠', title: 'GST Calculator', description: 'Quick tax calculations.', isReady: true },
    { id: 'percent', category: 'calc', icon: '⚖️', title: 'Percentage Calc', description: 'Discounts & margins.', isReady: true },
    
    // 5. Dev
    { id: 'palette', category: 'dev', icon: '🎨', title: 'Color Palette', description: 'Generate color schemes.', isReady: true },
    { id: 'compress', category: 'dev', icon: '🧩', title: 'Image Compressor', description: 'Shrink JPG/PNG locally.', isReady: false },
    { id: 'json', category: 'dev', icon: '🧱', title: 'JSON Formatter', description: 'Validate & beautify JSON.', isReady: true },
    { id: 'regex', category: 'dev', icon: '💡', title: 'Regex Tester', description: 'Test regular expressions.', isReady: true },
    
    // 6. Data
    { id: 'chat', category: 'data', icon: '🤖', title: 'AI Chat Bot', description: 'Personal AI assistant.', isReady: false },
    { id: 'text-speech', category: 'data', icon: '🎧', title: 'Text-to-Speech', description: 'Read text aloud.', isReady: true },
    { id: 'speech-text', category: 'data', icon: '🗣️', title: 'Speech-to-Text', description: 'Voice dictation.', isReady: true },
    
    // 7. Personal
    { id: 'goal', category: 'fun', icon: '🎯', title: 'Goal Tracker', description: 'Visual goal progress.', isReady: true },
    { id: 'water', category: 'fun', icon: '💧', title: 'Water Reminder', description: 'Daily hydration log.', isReady: true },
    { id: 'weather', category: 'fun', icon: '☀️', title: 'Weather', description: 'Local forecast.', isReady: false },
    
    // 8. System
    { id: 'ping', category: 'sys', icon: '🧭', title: 'Ping Checker', description: 'Test server latency.', isReady: true },
    { id: 'pass-strength', category: 'sys', icon: '🔐', title: 'Pass Strength', description: 'Analyze password entropy.', isReady: true },
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(search.toLowerCase()) || tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'All' || tool.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-grow-1 container-fluid py-4 px-4 px-lg-5" style={{ background: 'linear-gradient(to bottom, #000000, #000E30)' }}>
      
      {/* Compact Header Section - Reduced margins */}
      <div className="mb-2">
         <h1 className="display-5 fw-bold text-white mb-1">
            Ultimate <span className="text-primary">Tools</span> Suite
         </h1>
         <p className="text-white-50 mb-0 small">
            A collection of {tools.length}+ utilities for developers, designers, and everyday users.
         </p>
      </div>
        
      {/* Full Width Toolbar: Categories (Left) + Search (Right) */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4 sticky-top py-3 z-3" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', margin: '0 -1.5rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Categories - Scrollable Pills */}
            <div className="d-flex gap-2 overflow-auto scrollbar-hide w-100 order-2 order-lg-1 pb-1 pb-lg-0">
                <button 
                    className={`btn btn-sm rounded-pill px-3 whitespace-nowrap transition-all ${filter === 'All' ? 'btn-primary fw-bold' : 'btn-outline-secondary border-opacity-25 text-white-50 hover-white'}`}
                    onClick={() => setFilter('All')}
                >
                    All Tools
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        className={`btn btn-sm rounded-pill px-3 whitespace-nowrap d-flex align-items-center gap-2 transition-all ${filter === cat.id ? 'btn-primary fw-bold' : 'btn-outline-secondary border-opacity-25 text-white-50 hover-white'}`}
                        onClick={() => setFilter(cat.id)}
                    >
                        <span>{cat.icon}</span> {cat.name}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="input-group input-group-sm order-1 order-lg-2 shadow-sm" style={{ maxWidth: '320px', minWidth: '250px' }}>
                <span className="input-group-text bg-dark border-secondary border-opacity-50 text-white-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </span>
                <input 
                    type="text" 
                    className="form-control bg-dark border-secondary border-opacity-50 text-white placeholder-white-50 focus-ring focus-ring-primary" 
                    placeholder="Find a tool..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
      </div>

      {/* Tools Grid */}
      <div className="row g-3 g-md-4">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
            <ToolCard 
                {...tool} 
                onLaunch={() => onNavigateToTool(tool.id)}
                isFavorite={favoriteTools?.some(f => f.id === tool.id)}
                onToggleFavorite={() => onToggleFavorite(tool)}
            />
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-5 my-5">
            <div className="display-1 text-white-50 mb-3 opacity-25">🔍</div>
            <h3 className="text-white">No tools found</h3>
            <p className="text-white-50">Try adjusting your search criteria.</p>
            <button className="btn btn-outline-primary mt-2" onClick={() => {setSearch(''); setFilter('All');}}>Clear Filters</button>
        </div>
      )}
      
      <div className="mt-5 text-center">
        <p className="text-white-50">
            Don't see what you need? <a href="#" className="text-primary text-decoration-none border-bottom border-primary">Request a tool</a>.
        </p>
      </div>
    </div>
  );
};

export default ToolsPage;