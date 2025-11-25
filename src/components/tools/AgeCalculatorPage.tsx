import React, { useState, useEffect, useRef } from 'react';

interface AgeCalculatorPageProps {
  onBack: () => void;
}

const AgeCalculatorPage: React.FC<AgeCalculatorPageProps> = ({ onBack }) => {
  // --- State ---
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('00:00');
  const [compareDate, setCompareDate] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Results
  const [age, setAge] = useState({ years: 0, months: 0, days: 0 });
  const [liveTime, setLiveTime] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [totals, setTotals] = useState({ weeks: '0', days: '0', hours: '0', breaths: '0' });
  const [nextBirthday, setNextBirthday] = useState({ days: 0, dateString: '--' });
  const [zodiac, setZodiac] = useState({ western: { name: 'Aries', symbol: '♈' }, indian: 'Mesha', chinese: { name: 'Dragon', icon: '🐉' } });
  
  const timerRef = useRef<number | null>(null);

  // --- Constants ---
  const PLANETS = [
    { name: "Mercury", ratio: 0.2408467, color: "#9ca3af" }, // gray-400
    { name: "Venus", ratio: 0.61519726, color: "#fef08a" }, // yellow-200
    { name: "Mars", ratio: 1.8808158, color: "#f87171" }, // red-400
    { name: "Jupiter", ratio: 11.862615, color: "#fed7aa" }, // orange-200
    { name: "Saturn", ratio: 29.447498, color: "#eab308" }, // yellow-500
    { name: "Uranus", ratio: 84.016846, color: "#67e8f9" }  // cyan-300
  ];

  const ZODIAC_SIGNS = [
    { name: "Capricorn", indian: "Makara", symbol: "♑", start: [12, 22], end: [1, 19] },
    { name: "Aquarius", indian: "Kumbha", symbol: "♒", start: [1, 20], end: [2, 18] },
    { name: "Pisces", indian: "Meena", symbol: "♓", start: [2, 19], end: [3, 20] },
    { name: "Aries", indian: "Mesha", symbol: "♈", start: [3, 21], end: [4, 19] },
    { name: "Taurus", indian: "Vrishabha", symbol: "♉", start: [4, 20], end: [5, 20] },
    { name: "Gemini", indian: "Mithuna", symbol: "♊", start: [5, 21], end: [6, 20] },
    { name: "Cancer", indian: "Karka", symbol: "♋", start: [6, 21], end: [7, 22] },
    { name: "Leo", indian: "Simha", symbol: "♌", start: [7, 23], end: [8, 22] },
    { name: "Virgo", indian: "Kanya", symbol: "♍", start: [8, 23], end: [9, 22] },
    { name: "Libra", indian: "Tula", symbol: "♎", start: [9, 23], end: [10, 22] },
    { name: "Scorpio", indian: "Vrishchika", symbol: "♏", start: [10, 23], end: [11, 21] },
    { name: "Sagittarius", indian: "Dhanu", symbol: "♐", start: [11, 22], end: [12, 21] }
  ];

  const CHINESE_ZODIAC = ["Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat"];
  const CHINESE_ICONS = ["🐒", "🐓", "🐕", "🐖", "🐀", "🐂", "🐅", "🐇", "🐉", "🐍", "🐎", "🐐"];

  // --- Logic ---

  const calculate = () => {
    if (!dob) return;
    const birthDate = new Date(`${dob}T${time}`);
    const targetDate = isCompareMode && compareDate ? new Date(`${compareDate}T00:00`) : new Date();

    if (birthDate > targetDate) {
      alert("Birth date cannot be in the future relative to the target date.");
      return;
    }

    setShowResults(true);
    updateStaticStats(birthDate, targetDate);
    updateZodiac(birthDate);
    
    if (!isCompareMode) {
        startLiveTimer(birthDate);
    } else {
        stopLiveTimer();
    }
  };

  const updateStaticStats = (birthDate: Date, targetDate: Date) => {
    // 1. Age Breakdown (Y/M/D)
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const prevMonthDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
        days += prevMonthDate.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    setAge({ years, months, days });

    // 2. Totals
    const diffTime = targetDate.getTime() - birthDate.getTime();
    const totalSeconds = Math.floor(diffTime / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);

    setTotals({
        weeks: totalWeeks.toLocaleString(),
        days: totalDays.toLocaleString(),
        hours: totalHours.toLocaleString(),
        breaths: (totalMinutes * 16).toLocaleString() // Avg 16 breaths/min
    });

    // 3. Next Birthday
    if (!isCompareMode) {
        const today = new Date();
        let nextBday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today > nextBday) {
            nextBday.setFullYear(today.getFullYear() + 1);
        }
        const diffBday = nextBday.getTime() - today.getTime();
        const daysToBday = Math.ceil(diffBday / (1000 * 60 * 60 * 24));
        
        setNextBirthday({
            days: daysToBday,
            dateString: nextBday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        });
    }
  };

  const updateZodiac = (date: Date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1; // 1-12
    const y = date.getFullYear();

    // Western
    let sign = ZODIAC_SIGNS.find(z => (m === z.start[0] && d >= z.start[1]) || (m === z.end[0] && d <= z.end[1]));
    if (!sign) sign = ZODIAC_SIGNS[0]; // Capricorn wrap-around
    
    // Chinese
    const offset = y % 12;
    
    setZodiac({
        western: { name: sign.name, symbol: sign.symbol },
        indian: sign.indian,
        chinese: { name: CHINESE_ZODIAC[offset], icon: CHINESE_ICONS[offset] }
    });
  };

  const startLiveTimer = (birthDate: Date) => {
    stopLiveTimer();
    const update = () => {
        const now = new Date();
        const diff = now.getTime() - birthDate.getTime();
        
        const sec = Math.floor((diff / 1000) % 60);
        const min = Math.floor((diff / (1000 * 60)) % 60);
        const hr = Math.floor((diff / (1000 * 60 * 60)) % 24);
        
        setLiveTime({
            hours: hr.toString().padStart(2, '0'),
            minutes: min.toString().padStart(2, '0'),
            seconds: sec.toString().padStart(2, '0')
        });
    };
    update();
    timerRef.current = window.setInterval(update, 1000);
  };

  const stopLiveTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => stopLiveTimer();
  }, []);

  // --- Styles ---
  const colors = {
      bg: '#0b0f19', // gray-950
      panel: 'rgba(31, 41, 55, 0.6)', // gray-800/60
      border: 'rgba(75, 85, 99, 0.4)', // gray-600/40
      textMain: '#f3f4f6',
      textMuted: '#9ca3af',
      gold: '#eab308', // gold-500
      goldLight: '#facc15', // gold-400
      goldDark: '#ca8a04', // gold-600
      indigo: '#818cf8',
      inputBg: '#111827', // gray-900
      inputBorder: '#374151', // gray-700
      emerald: '#34D399' 
      
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
            /* Custom Date Input Styling */
            input[type="date"], input[type="time"] {
                color-scheme: dark;
                background-color: ${colors.inputBg};
                border: 1px solid ${colors.inputBorder};
                color: white;
                border-radius: 0.75rem;
                padding: 0.75rem 1rem;
                width: 100%;
                outline: none;
                box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
            }
            input[type="date"]:focus, input[type="time"]:focus {
                border-color: ${colors.gold};
                box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.2);
            }
            .planet-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px -5px rgba(234, 179, 8, 0.15);
                border-color: rgba(234, 179, 8, 0.3) !important;
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
         `}</style>

       {/* Navigation Bar */}
       <div className="w-100 border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
           <div className="container px-4 py-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-link text-white-50 p-0 text-decoration-none d-flex align-items-center gap-2 hover-text-white" style={{ fontSize: '0.9rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Tools
                    </button>
                    <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-3">
                        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${colors.goldLight}, ${colors.goldDark})`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                        </div>
                        <h1 className="h6 mb-0 fw-bold text-white tracking-tight">Chronos<span style={{ color: colors.goldLight }}>Age</span> Pro</h1>
                    </div>
                </div>
           </div>
       </div>

       <div className="container py-4">
         <div className="row g-4">
            
            {/* Left Column: Controls */}
            <div className="col-12 col-lg-4">
                <div className="glass-panel p-4 rounded-4 position-relative overflow-hidden">
                    {/* Decorative Glow */}
                    <div className="position-absolute rounded-circle" style={{ width: '120px', height: '120px', background: `${colors.gold}15`, top: '-20px', right: '-20px', filter: 'blur(40px)' }}></div>

                    <h6 className="text-uppercase small fw-bold mb-4" style={{ color: colors.textMuted, letterSpacing: '1px', fontSize: '0.7rem' }}>Birth Details</h6>
                    
                    <div className="mb-4">
                        <label className="d-block text-white-50 small mb-2" style={{ fontSize: '0.75rem' }}>Date of Birth</label>
                        <input 
                            type="date" 
                            className="form-control bg-dark border-secondary border-opacity-50 text-white py-2" 
                            style={{ colorScheme: 'dark' }}
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="d-block text-white-50 small mb-2" style={{ fontSize: '0.75rem' }}>Time of Birth (Optional)</label>
                        <input 
                            type="time" 
                            className="form-control bg-dark border-secondary border-opacity-50 text-white py-2"
                            style={{ colorScheme: 'dark' }} 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="border-top border-secondary border-opacity-25 pt-4 mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="small text-white-50">Compare to Date</span>
                            <div className="form-check form-switch">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    role="switch" 
                                    checked={isCompareMode}
                                    onChange={(e) => setIsCompareMode(e.target.checked)}
                                    style={{ backgroundColor: isCompareMode ? colors.gold : '#374151', borderColor: isCompareMode ? colors.gold : '#374151', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                        {isCompareMode && (
                            <div className="animate-fade-in mt-2">
                                <label className="d-block text-white-50 small mb-2" style={{ fontSize: '0.75rem' }}>Target Date</label>
                                <input 
                                    type="date" 
                                    className="form-control bg-dark border-secondary border-opacity-50 text-white py-2" 
                                    style={{ colorScheme: 'dark' }}
                                    value={compareDate}
                                    onChange={(e) => setCompareDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <button 
                        className="btn w-100 py-3 fw-bold text-white rounded-3 shadow-lg d-flex align-items-center justify-content-center gap-2"
                        style={{ background: `linear-gradient(to right, ${colors.gold}, #ca8a04)`, border: 'none', boxShadow: '0 10px 15px -3px rgba(234, 179, 8, 0.2)' }}
                        onClick={calculate}
                    >
                        <span>Calculate</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                    </button>
                </div>

                {/* Zodiac Card (Visible after calc) */}
                {showResults && (
                    <div className="glass-panel p-4 rounded-4 mt-4 text-center position-relative overflow-hidden">
                         <div className="position-absolute inset-0" style={{ background: `linear-gradient(to bottom, ${colors.indigo}10, transparent)`, zIndex: 0 }}></div>
                         <h6 className="text-uppercase small fw-bold mb-3 position-relative" style={{ color: colors.indigo, letterSpacing: '1px', fontSize: '0.7rem', zIndex: 1 }}>Cosmic Profile</h6>
                         
                         <div className="d-flex justify-content-center gap-4 position-relative" style={{ zIndex: 1 }}>
                             {/* Western */}
                             <div className="text-center">
                                 <div className="rounded-circle bg-dark border border-secondary border-opacity-25 d-flex align-items-center justify-content-center mb-2 mx-auto shadow-sm" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>{zodiac.western.symbol}</div>
                                 <div className="text-uppercase text-white-50" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Western</div>
                                 <div className="fw-bold text-white small">{zodiac.western.name}</div>
                             </div>
                             <div className="border-start border-secondary border-opacity-25"></div>
                             {/* Indian */}
                             <div className="text-center">
                                 <div className="rounded-circle bg-dark border border-secondary border-opacity-25 d-flex align-items-center justify-content-center mb-2 mx-auto shadow-sm" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>🕉️</div>
                                 <div className="text-uppercase text-white-50" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Indian</div>
                                 <div className="fw-bold text-white small">{zodiac.indian}</div>
                             </div>
                             <div className="border-start border-secondary border-opacity-25"></div>
                             {/* Chinese */}
                             <div className="text-center">
                                 <div className="rounded-circle bg-dark border border-secondary border-opacity-25 d-flex align-items-center justify-content-center mb-2 mx-auto shadow-sm" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>{zodiac.chinese.icon}</div>
                                 <div className="text-uppercase text-white-50" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>Chinese</div>
                                 <div className="fw-bold text-white small">{zodiac.chinese.name}</div>
                             </div>
                         </div>
                    </div>
                )}
            </div>

            {/* Right Column: Results */}
            <div className="col-12 col-lg-8">
                
                {/* Main Age Display */}
                <div className="glass-panel p-3 rounded-4 text-center position-relative overflow-hidden mb-4 d-flex flex-column justify-content-center" style={{ minHeight: '240px' }}>
                     {!showResults ? (
                         <div className="text-white-50">
                             <div className="display-4 mb-3 opacity-25">🕰️</div>
                             <p>Enter your birth date to begin time travel.</p>
                         </div>
                     ) : (
                        <div className="position-relative z-1">
                            <p className="text-white-50 small text-uppercase fw-bold mb-3" style={{ letterSpacing: '2px', fontSize: '0.7rem' }}>You have been alive for</p>
                            
                            <div className="d-flex justify-content-center align-items-baseline gap-3 mb-4 flex-wrap">
                                <div className="text-center">
                                    <div className="fw-bold text-white tracking-tight" style={{ fontSize: '3.5rem', lineHeight: 1 }}>{age.years}</div>
                                    <div className="text-white-50 small text-uppercase fw-bold mt-1" style={{ fontSize: '0.7rem' }}>Years</div>
                                </div>
                                <span className="text-secondary fs-2 fw-light">/</span>
                                <div className="text-center">
                                    <div className="fw-bold text-white-50" style={{ fontSize: '2.5rem', lineHeight: 1 }}>{age.months}</div>
                                    <div className="text-white-50 small text-uppercase fw-bold mt-1" style={{ fontSize: '0.7rem' }}>Months</div>
                                </div>
                                <span className="text-secondary fs-2 fw-light">/</span>
                                <div className="text-center">
                                    <div className="fw-bold text-white-50" style={{ fontSize: '2.5rem', lineHeight: 1 }}>{age.days}</div>
                                    <div className="text-white-50 small text-uppercase fw-bold mt-1" style={{ fontSize: '0.7rem' }}>Days</div>
                                </div>
                            </div>

                            {!isCompareMode && (
                                <div className="d-inline-flex align-items-center gap-3 bg-black bg-opacity-50 px-4 py-2 rounded-pill border border-secondary border-opacity-25 shadow-inner">
                                    <div className="rounded-circle bg-danger" style={{ width: '8px', height: '8px', animation: 'pulse 1s infinite' }}></div>
                                    <p className="font-monospace text-white mb-0 small">
                                        <span className="fw-bold">{liveTime.hours}</span>h <span className="fw-bold">{liveTime.minutes}</span>m <span className="fw-bold" style={{ color: colors.gold }}>{liveTime.seconds}</span>s
                                    </p>
                                </div>
                            )}
                        </div>
                     )}
                </div>

                {/* Detailed Breakdown */}
                {showResults && (
                    <>
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                                <div className="glass-panel p-3 rounded-4 text-center h-100">
                                    <p className="text-white-50 small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Total Weeks</p>
                                    <p className="fw-bold mb-0" style={{ fontSize: '1.1rem', color: colors.indigo }}>{totals.weeks}</p>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="glass-panel p-3 rounded-4 text-center h-100">
                                    <p className="text-white-50 small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Total Days</p>
                                    <p className="fw-bold text-primary mb-0" style={{ fontSize: '1.1rem' }}>{totals.days}</p>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="glass-panel p-3 rounded-4 text-center h-100">
                                    <p className="text-white-50 small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Total Hours</p>
                                    <p className="fw-bold mb-0" style={{ fontSize: '1.1rem', color: colors.emerald }}>{totals.hours}</p>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="glass-panel p-3 rounded-4 text-center h-100">
                                    <p className="text-white-50 small text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Breaths Taken*</p>
                                    <p className="fw-bold text-danger mb-0" style={{ fontSize: '1.1rem' }}>{totals.breaths}</p>
                                </div>
                            </div>
                        </div>

                        {/* Next Birthday */}
                        {!isCompareMode && (
                            <div className="glass-panel p-4 rounded-4 mb-4 position-relative overflow-hidden" style={{ background: 'linear-gradient(to right, #111827, #1f2937)' }}>
                                <div className="d-flex align-items-center justify-content-between position-relative" style={{ zIndex: 1 }}>
                                    <div>
                                        <h3 className="fw-bold text-white h6 d-flex align-items-center gap-2 m-0">
                                            <span style={{ color: colors.gold }}>🎂</span> Next Birthday
                                        </h3>
                                        <p className="text-white-50 m-0 mt-1" style={{ fontSize: '16px' }}>{nextBirthday.dateString}</p>
                                    </div>
                                    <div className="text-end">
                                        <p className="fw-bold text-white font-monospace m-0" style={{ fontSize: '1.8rem', lineHeight: 1 }}>{nextBirthday.days}</p>
                                        <p className="small text-white-50 text-uppercase m-0" style={{ fontSize: '0.65rem' }}>Days Left</p>
                                    </div>
                                </div>
                                {/* Confetti */}
                                <div className="position-absolute top-0 end-0 opacity-25 display-3 pe-2 pt-0" style={{ transform: 'rotate(12deg)', pointerEvents: 'none' }}>🎉</div>
                            </div>
                        )}

                        {/* Planetary Ages */}
                        {!isCompareMode && (
                            <div>
                                <h3 className="text-white-50 small fw-bold text-uppercase mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5 15.5 15.5"/><path d="M15.5 8.5 8.5 15.5"/></svg>
                                    Galactic Age
                                </h3>
                                <div className="row g-3">
                                    {PLANETS.map((planet) => {
                                        // Age in years / ratio
                                        const now = new Date();
                                        const dobDate = new Date(`${dob}T${time}`);
                                        const ageInYears = (now.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                                        const pAge = (ageInYears / planet.ratio).toFixed(2);
                                        
                                        return (
                                            <div key={planet.name} className="col-6 col-md-4">
                                                <div className="planet-card p-3 rounded-4 text-center border border-secondary border-opacity-25" style={{ backgroundColor: '#111827' }}>
                                                    <p className="text-white-50 text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>{planet.name}</p>
                                                    <p className="fw-bold font-monospace mb-0" style={{ color: planet.color, fontSize: '1.2rem' }}>{pAge}</p>
                                                    <p className="text-white-50 mb-0" style={{ fontSize: '0.6rem' }}>years</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default AgeCalculatorPage;