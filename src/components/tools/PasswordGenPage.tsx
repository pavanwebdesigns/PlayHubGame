import React, { useState, useEffect } from 'react';

interface PasswordGenPageProps {
  onBack: () => void;
}

const PasswordGenPage: React.FC<PasswordGenPageProps> = ({ onBack }) => {
  // --- State ---
  const [password, setPassword] = useState('Generating...');
  const [length, setLength] = useState(16);
  const [mustInclude, setMustInclude] = useState('');
  
  // Options
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [noSimilar, setNoSimilar] = useState(false);
  const [noDuplicates, setNoDuplicates] = useState(false);

  // Results
  const [strength, setStrength] = useState({ text: 'Calculating...', color: '#ef4444', width: '0%' });
  const [crackTime, setCrackTime] = useState('--');
  const [history, setHistory] = useState<string[]>([]);
  const [copyText, setCopyText] = useState('Copy');

  // Constants
  const CHARS = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      number: '0123456789',
      symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
  };
  const AMBIGUOUS = ['l', '1', 'I', 'O', '0'];

  // --- Logic ---
  
  const generate = () => {
      let pool = '';
      if (useUpper) pool += CHARS.upper;
      if (useLower) pool += CHARS.lower;
      if (useNumbers) pool += CHARS.number;
      if (useSymbols) pool += CHARS.symbol;

      if (noSimilar) {
          AMBIGUOUS.forEach(char => {
              pool = pool.split(char).join('');
          });
      }

      if (pool === '') {
          if(mustInclude === '') {
              setPassword('Select Options');
              setStrength({ text: '--', color: '#374151', width: '0%' });
              setCrackTime('');
              return;
          } else {
              pool = CHARS.lower + CHARS.number; // Fallback
          }
      }

      let finalLength = length;
      if (mustInclude.length > length) finalLength = mustInclude.length;
      
      let remainingLength = finalLength - mustInclude.length;
      let newPassword = '';
      
      if (noDuplicates && remainingLength > 0) {
          let poolArray = pool.split('');
          if (poolArray.length < remainingLength) {
               // Not enough unique chars, allow duplicates fallback
               for (let i = 0; i < remainingLength; i++) {
                  newPassword += pool[Math.floor(Math.random() * pool.length)];
              }
          } else {
              for (let i = 0; i < remainingLength; i++) {
                  const randomIndex = Math.floor(Math.random() * poolArray.length);
                  newPassword += poolArray[randomIndex];
                  poolArray.splice(randomIndex, 1);
              }
          }
      } else {
          for (let i = 0; i < remainingLength; i++) {
              newPassword += pool[Math.floor(Math.random() * pool.length)];
          }
      }

      if (mustInclude.length > 0) {
          const position = Math.floor(Math.random() * (newPassword.length + 1));
          newPassword = newPassword.slice(0, position) + mustInclude + newPassword.slice(position);
      }

      setPassword(newPassword);
      analyzeStrength(newPassword, pool.length || 26);
      addToHistory(newPassword);
  };

  const analyzeStrength = (pass: string, poolSize: number) => {
      const len = pass.length;
      const entropy = len * Math.log2(poolSize);
      
      let text = 'Weak';
      let color = '#ef4444'; // red
      let width = '10%';
      
      if (entropy > 120) { text = 'Unbreakable'; color = '#8b5cf6'; width = '100%'; } // violet
      else if (entropy > 80) { text = 'Very Strong'; color = '#10b981'; width = '85%'; } // emerald
      else if (entropy > 60) { text = 'Strong'; color = '#4ade80'; width = '65%'; } // green
      else if (entropy > 40) { text = 'Moderate'; color = '#facc15'; width = '40%'; } // yellow

      const guessesPerSecond = 1_000_000_000_000; 
      const secondsToCrack = Math.pow(2, entropy) / guessesPerSecond;
      
      setStrength({ text, color, width });
      setCrackTime(`Est. time to crack: ${formatTime(secondsToCrack)}`);
  };

  const formatTime = (seconds: number) => {
      if (seconds < 1) return "Instantly";
      if (seconds < 60) return "Seconds";
      if (seconds < 3600) return "Minutes";
      if (seconds < 86400) return "Hours";
      if (seconds < 31536000) return Math.round(seconds / 86400) + " Days";
      if (seconds < 3153600000) return Math.round(seconds / 31536000) + " Years";
      if (seconds < 315360000000) return Math.round(seconds / 31536000) + " Centuries";
      return "Millions of Years";
  };

  const addToHistory = (pass: string) => {
      if (pass === 'Select Options' || (history.length > 0 && history[0] === pass)) return;
      setHistory(prev => [pass, ...prev].slice(0, 5));
  };

  const copyToClipboard = (text: string) => {
      if (text === 'Select Options') return;
      navigator.clipboard.writeText(text).then(() => {
          setCopyText('Copied!');
          setTimeout(() => setCopyText('Copy'), 2000);
      });
  };

  // Initial generate
  useEffect(() => {
      generate();
  }, []); 

  // --- Styles ---
  const colors = {
      bg: '#0b0f19', 
      panel: 'rgba(31, 41, 55, 0.6)',
      border: 'rgba(75, 85, 99, 0.4)',
      textMain: '#f3f4f6',
      textMuted: '#9ca3af',
      violet: '#8b5cf6',
      violetDark: '#7c3aed'
  };

  return (
    <div className="fixed-top w-100 h-100 d-flex flex-column align-items-center" 
         style={{ 
             background: colors.bg, 
             zIndex: 2000, 
             overflowY: 'auto', 
             fontFamily: "'Inter', system-ui, sans-serif",
             color: colors.textMain
         }}>
       
       <style>{`
            .glass-panel {
                background: ${colors.panel};
                backdrop-filter: blur(12px);
                border: 1px solid ${colors.border};
                box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
            }
            input[type=range] {
                -webkit-appearance: none; 
                width: 100%; 
                background: transparent; 
                margin: 10px 0;
            }
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: ${colors.violet};
                cursor: pointer;
                margin-top: -8px; 
                box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
            }
            input[type=range]::-webkit-slider-runnable-track {
                width: 100%;
                height: 4px;
                cursor: pointer;
                background: #374151;
                border-radius: 2px;
            }
            /* Checkbox custom style */
            .custom-checkbox {
                width: 1.25rem;
                height: 1.25rem;
                border: 2px solid #4b5563;
                border-radius: 0.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                cursor: pointer;
            }
            .custom-checkbox.checked {
                background-color: ${colors.violet};
                border-color: ${colors.violet};
            }
            .slide-in {
                animation: slideIn 0.3s ease-out forwards;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
       `}</style>

       {/* Header */}
       <div className="w-100 border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
           <div className="container px-4 py-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-link text-white-50 p-0 text-decoration-none d-flex align-items-center gap-2 hover-text-white" style={{ fontSize: '0.9rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Tools
                    </button>
                    <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-3">
                        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: `linear-gradient(135deg, #a78bfa, #7c3aed)` }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                        </div>
                        <h1 className="h6 mb-0 fw-bold text-white tracking-tight">Fortress<span style={{ color: '#a78bfa' }}>Key</span></h1>
                    </div>
                </div>
           </div>
       </div>

       <div className="container py-4" style={{ maxWidth: '800px' }}>
            
            {/* Main Generator Card */}
            <div className="rounded-4 border border-secondary border-opacity-25 shadow-lg overflow-hidden mb-4" style={{ backgroundColor: '#111827' }}>
                
                {/* Output Section */}
                <div className="p-4 pb-3 border-bottom border-secondary border-opacity-25" style={{ backgroundColor: 'rgba(31, 41, 55, 0.3)' }}>
                    <div className="d-flex align-items-center justify-content-center mb-4 position-relative group">
                         <div className="font-monospace fw-bold text-white text-break text-center" style={{ fontSize: '1.8rem', letterSpacing: '1px', minHeight: '3rem' }}>
                             {password}
                         </div>
                    </div>

                    {/* Strength Meter */}
                    <div className="d-flex flex-column gap-1 mb-4">
                        <div className="d-flex justify-content-between small fw-bold text-uppercase" style={{ color: colors.textMuted, fontSize: '0.7rem', letterSpacing: '1px' }}>
                            <span>Strength</span>
                            <span style={{ color: '#d1d5db' }}>{strength.text}</span>
                        </div>
                        <div className="w-100 rounded-pill overflow-hidden" style={{ height: '6px', backgroundColor: '#374151' }}>
                            <div style={{ width: strength.width, backgroundColor: strength.color, height: '100%', transition: 'width 0.5s ease, background-color 0.5s ease' }}></div>
                        </div>
                        <div className="text-end small mt-1" style={{ color: colors.textMuted, fontSize: '0.7rem' }}>
                            {crackTime}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-3">
                        <button 
                            className="btn flex-grow-1 py-2 fw-bold text-white rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-lg transition-transform active-scale"
                            style={{ backgroundColor: colors.violet, border: 'none' }}
                            onClick={generate}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                            Generate
                        </button>
                        <button 
                            className="btn flex-grow-1 py-2 fw-bold text-white rounded-3 d-flex align-items-center justify-content-center gap-2 border border-secondary border-opacity-50 transition-colors hover-bg-white-5"
                            style={{ backgroundColor: '#1f2937' }}
                            onClick={() => copyToClipboard(password)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={copyText === 'Copied!' ? '#34d399' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            {copyText}
                        </button>
                    </div>
                </div>

                {/* Controls Panel */}
                <div className="p-4" style={{ backgroundColor: '#111827' }}>
                    
                    {/* Length */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="fw-bold" style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Password Length</label>
                            <span className="fw-bold font-monospace" style={{ fontSize: '1.2rem', color: '#a78bfa' }}>{length}</span>
                        </div>
                        <input 
                            type="range" 
                            min="6" max="64" 
                            value={length} 
                            onChange={(e) => { setLength(Number(e.target.value)); generate(); }}
                        />
                        <div className="d-flex justify-content-between font-monospace small" style={{ color: '#4b5563', fontSize: '0.7rem' }}>
                            <span>6</span><span>32</span><span>64</span>
                        </div>
                    </div>

                    {/* Must Include */}
                    <div className="mb-4">
                        <label className="text-uppercase small fw-bold mb-2 d-block" style={{ color: '#d1d5db', fontSize: '0.7rem', letterSpacing: '1px' }}>Must Include (Optional)</label>
                        <div className="position-relative">
                             <div className="position-absolute top-50 start-0 translate-middle-y ps-3 pointer-events-none text-muted">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                             </div>
                             <input 
                                type="text" 
                                className="form-control bg-black border-secondary border-opacity-50 text-white py-2 ps-5" 
                                style={{ backgroundColor: '#0b0f19', fontSize: '0.9rem' }}
                                placeholder="e.g. 2024, secure"
                                value={mustInclude}
                                onChange={(e) => { setMustInclude(e.target.value); generate(); }}
                             />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="row g-4">
                        <div className="col-12 col-md-6">
                            <p className="text-uppercase small fw-bold mb-2" style={{ color: '#6b7280', fontSize: '0.7rem', letterSpacing: '1px' }}>Character Sets</p>
                            
                            <div className="d-flex flex-column gap-2">
                                {[
                                    { label: 'ABC Uppercase', state: useUpper, set: setUseUpper },
                                    { label: 'abc Lowercase', state: useLower, set: setUseLower },
                                    { label: '123 Numbers', state: useNumbers, set: setUseNumbers },
                                    { label: '!@# Symbols', state: useSymbols, set: setUseSymbols },
                                ].map((item, idx) => (
                                    <div key={idx} className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => { item.set(!item.state); generate(); }}>
                                        <div className={`custom-checkbox ${item.state ? 'checked' : ''}`}>
                                            {item.state && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                        </div>
                                        <span className="text-gray-300 hover-text-white transition small">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <p className="text-uppercase small fw-bold mb-2" style={{ color: '#6b7280', fontSize: '0.7rem', letterSpacing: '1px' }}>Premium Filters</p>
                            
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => { setNoSimilar(!noSimilar); generate(); }}>
                                    <div className={`custom-checkbox ${noSimilar ? 'checked' : ''}`}>
                                        {noSimilar && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                    </div>
                                    <div>
                                        <span className="d-block text-gray-300 hover-text-white transition small">Easy to Read</span>
                                        <span className="d-block text-muted" style={{ fontSize: '0.65rem' }}>No ambiguous chars (l, 1, O, 0)</span>
                                    </div>
                                </div>

                                <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => { setNoDuplicates(!noDuplicates); generate(); }}>
                                    <div className={`custom-checkbox ${noDuplicates ? 'checked' : ''}`}>
                                        {noDuplicates && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                    </div>
                                    <div>
                                        <span className="d-block text-gray-300 hover-text-white transition small">No Duplicates</span>
                                        <span className="d-block text-muted" style={{ fontSize: '0.65rem' }}>Each character appears once</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* History */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                 <h6 className="text-uppercase small fw-bold mb-0" style={{ color: '#9ca3af', fontSize: '0.7rem', letterSpacing: '1px' }}>History (Last 5)</h6>
                 <button onClick={() => setHistory([])} className="btn btn-link p-0 text-decoration-none text-muted hover-text-danger" style={{ fontSize: '0.7rem' }}>Clear History</button>
            </div>
            
            <div className="d-flex flex-column gap-2">
                 {history.map((pass, idx) => (
                     <div key={idx} className="slide-in d-flex align-items-center justify-content-between p-3 rounded-3 border border-secondary border-opacity-10 hover-border-primary transition" style={{ backgroundColor: '#111827' }}>
                         <span className="font-monospace text-white-50 small text-truncate" style={{ maxWidth: '80%' }}>
                             {pass.length > 4 ? `${pass.substring(0, 2)}${'•'.repeat(pass.length - 4)}${pass.substring(pass.length - 2)}` : pass}
                         </span>
                         <button onClick={() => copyToClipboard(pass)} className="btn btn-link p-0 text-muted hover-text-white">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                         </button>
                     </div>
                 ))}
            </div>

       </div>
    </div>
  );
};

export default PasswordGenPage;