import React, { useState, useEffect } from 'react';

interface EMICalculatorPageProps {
  onBack: () => void;
}

const EMICalculatorPage: React.FC<EMICalculatorPageProps> = ({ onBack }) => {
  // --- State ---
  const [currency, setCurrency] = useState('$');
  const [method, setMethod] = useState<'reducing' | 'flat'>('reducing');
  
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(5);
  const [extraEMI, setExtraEMI] = useState(0);
  
  const [showPrepayment, setShowPrepayment] = useState(false);

  // Results
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [savings, setSavings] = useState(0);

  // --- Calculation Logic ---
  useEffect(() => {
    calculateEMI();
  }, [amount, rate, tenure, extraEMI, method]);

  const calculateEMI = () => {
    const P = amount;
    const R_annual = rate;
    const N_years = tenure;
    
    if (!P || !R_annual || !N_years) return;

    let calculatedEmi = 0;
    // let calcTotalInterest = 0;
    // let calcTotalPaid = 0;
    let scheduleData: any[] = [];

    if (method === 'reducing') {
        const R = R_annual / 12 / 100;
        const N = N_years * 12;
        
        calculatedEmi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        
        let balance = P;
        let currentYearInterest = 0;
        let currentYearPrincipal = 0;
        let currentYear = 1;
        let totalInt = 0;
        let totalPd = 0;

        const standardTotalInterest = (calculatedEmi * N) - P;

        for (let i = 1; i <= N * 2; i++) {
            if (balance <= 1) break;

            let interest = balance * R;
            let monthlyPrincipal = (calculatedEmi + extraEMI) - interest;
            
            if (balance < (calculatedEmi + extraEMI)) {
                monthlyPrincipal = balance;
            }
            
            balance -= monthlyPrincipal;
            totalInt += interest;
            totalPd += (monthlyPrincipal + interest);

            currentYearInterest += interest;
            currentYearPrincipal += monthlyPrincipal;

            if (i % 12 === 0 || balance <= 1) {
                scheduleData.push({
                    year: currentYear,
                    principal: currentYearPrincipal,
                    interest: currentYearInterest,
                    balance: balance > 0 ? balance : 0
                });
                currentYear++;
                currentYearInterest = 0;
                currentYearPrincipal = 0;
            }
        }
        
        setEmi(Math.round(calculatedEmi));
        setTotalInterest(Math.round(totalInt));
        setTotalPayment(Math.round(totalPd));
        setSchedule(scheduleData);
        
        if (extraEMI > 0) {
            setSavings(Math.max(0, Math.round(standardTotalInterest - totalInt)));
        } else {
            setSavings(0);
        }

    } else {
        const totalInt = P * (R_annual / 100) * N_years;
        const totalPd = P + totalInt;
        calculatedEmi = totalPd / (N_years * 12);
        
        setEmi(Math.round(calculatedEmi));
        setTotalInterest(Math.round(totalInt));
        setTotalPayment(Math.round(totalPd));
        setSavings(0);

        let yearlyPrincipal = P / N_years;
        let yearlyInterest = totalInt / N_years;
        let balance = P;

        for(let i=1; i<=N_years; i++) {
            balance -= yearlyPrincipal;
            scheduleData.push({
                year: i,
                principal: yearlyPrincipal,
                interest: yearlyInterest,
                balance: balance > 0 ? balance : 0
            });
        }
        setSchedule(scheduleData);
    }
  };

  const fmt = (val: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);

  // --- Exact Colors from HTML ---
  const colors = {
      bg: '#0b0f19',      // gray-950
      panel: '#111827',   // gray-900
      border: '#1f2937',  // gray-800
      textMain: '#f3f4f6',
      textMuted: '#9ca3af', // gray-400
      emerald: '#10b981', // emerald-500
      blue: '#3b82f6',    // blue-500
      blueDark: '#2563eb' // blue-600
  };

  // --- Donut Chart Component ---
  const DonutChart = ({ p, i }: { p: number, i: number }) => {
      const total = p + i;
      const pPercent = (p / total) * 100;
      
      // SVG properties to match Chart.js look
      const size = 180;
      const strokeWidth = 25;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const pOffset = circumference - ((pPercent / 100) * circumference);
      
      return (
          <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: size, height: size }}>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={colors.emerald} strokeWidth={strokeWidth} />
                  <circle 
                      cx={size/2} cy={size/2} r={radius} 
                      fill="none" stroke={colors.blue} strokeWidth={strokeWidth} 
                      strokeDasharray={circumference} strokeDashoffset={pOffset}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
              </svg>
              <div className="position-absolute text-center" style={{ transform: 'rotate(0deg)' }}> 
                  <div className="text-white-50 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Total Payable</div>
                  <div className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>{currency}{fmt(totalPayment)}</div>
              </div>
          </div>
      );
  };

  return (
    <div className="fixed-top w-100 h-100 d-flex flex-column align-items-center" 
         style={{ 
             background: colors.bg, 
             zIndex: 2000, 
             overflowY: 'auto', 
             fontFamily: "'Inter', system-ui, sans-serif",
             color: colors.textMain,
             fontSize: '14px'
         }}>
         
         <style>{`
            /* Custom styles to match HTML */
            input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; margin: 8px 0; }
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%;
                background: ${colors.blue}; cursor: pointer; margin-top: -7px; 
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); transition: transform 0.1s;
            }
            input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
            input[type=range]::-webkit-slider-runnable-track {
                width: 100%; height: 4px; cursor: pointer; background: #374151; border-radius: 2px;
            }
            input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            .glass-panel { background: rgba(31, 41, 55, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(75, 85, 99, 0.4); }
         `}</style>

       {/* Navigation Bar */}
       <div className="w-100 border-bottom border-secondary border-opacity-25" style={{ background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
           <div className="container px-4 py-2 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={onBack} className="btn btn-link text-white-50 p-0 text-decoration-none d-flex align-items-center gap-2 hover-text-white" style={{ fontSize: '0.85rem' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Back to Tools
                    </button>
                    <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-3">
                        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${colors.emerald}, ${colors.blue})` }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                        </div>
                        <h1 className="h6 mb-0 fw-bold text-white tracking-tight" style={{ fontSize: '1rem' }}>FinCalc<span style={{ color: colors.emerald }}>Pro</span></h1>
                    </div>
                </div>
           </div>
       </div>

       <div className="container py-4" style={{ maxWidth: '1200px' }}>
         <div className="row g-5">
            
            {/* Left Column: Inputs */}
            <div className="col-12 col-lg-7">
                <div className="bg-gray-900 rounded-4 border border-secondary border-opacity-25 p-4 shadow-lg position-relative overflow-hidden" style={{ backgroundColor: colors.panel }}>
                    
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h5 fw-bold text-white m-0 d-flex align-items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                            Loan Details
                        </h2>
                        <button className="btn btn-sm bg-dark border border-secondary border-opacity-25 text-white-50 d-flex align-items-center gap-2" onClick={() => window.print()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                            Print Report
                        </button>
                    </div>

                    {/* Currency & Method */}
                    <div className="row g-4 mb-4">
                        <div className="col-12 col-md-6">
                            <label className="d-block text-white-50 small fw-bold mb-2">Currency</label>
                            <select 
                                className="form-select bg-black border-secondary border-opacity-50 text-white py-2" 
                                style={{ backgroundColor: '#0b0f19', fontSize: '0.9rem' }}
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                <option value="$">USD - US Dollar ($)</option>
                                <option value="€">EUR - Euro (€)</option>
                                <option value="₹">INR - Indian Rupee (₹)</option>
                                <option value="£">GBP - British Pound (£)</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="d-block text-white-50 small fw-bold mb-2">Interest Method</label>
                            <div className="d-flex bg-black rounded-3 p-1 border border-secondary border-opacity-25" style={{ backgroundColor: '#0b0f19' }}>
                                <button 
                                    className="btn flex-grow-1 py-1 text-white small fw-bold rounded-2"
                                    style={{ backgroundColor: method === 'reducing' ? colors.blueDark : 'transparent', fontSize: '0.75rem' }}
                                    onClick={() => setMethod('reducing')}
                                >Reducing</button>
                                <button 
                                    className="btn flex-grow-1 py-1 text-white-50 small rounded-2"
                                    style={{ backgroundColor: method === 'flat' ? colors.blueDark : 'transparent', color: method === 'flat' ? 'white' : '#9ca3af', fontSize: '0.75rem', fontWeight: method === 'flat' ? 'bold' : 'normal' }}
                                    onClick={() => setMethod('flat')}
                                >Flat Rate</button>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-3 rounded-3 mb-4 border border-opacity-25" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                        <p className="m-0 small" style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                            {method === 'reducing' 
                                ? <span><strong>Reducing Balance:</strong> Interest is calculated on the outstanding principal. This is the standard for home/auto loans.</span>
                                : <span className="text-warning"><strong>Flat Rate:</strong> Interest calculated on initial principal. Usually costs more.</span>
                            }
                        </p>
                    </div>

                    {/* Inputs */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="text-white-50 small fw-bold">Loan Amount</label>
                            <div className="position-relative">
                                <span className="position-absolute start-0 top-50 translate-middle-y ps-3 text-white-50 fw-bold">{currency}</span>
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(Number(e.target.value))} 
                                    className="form-control bg-black border-secondary border-opacity-50 text-white text-end py-1 ps-5 pe-3" 
                                    style={{ backgroundColor: '#0b0f19', fontSize: '0.9rem', width: '140px' }}
                                />
                            </div>
                        </div>
                        <input type="range" min="10000" max="10000000" step="10000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                    </div>

                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="text-white-50 small fw-bold">Interest Rate (p.a)</label>
                            <div className="position-relative">
                                <input 
                                    type="number" 
                                    value={rate} 
                                    step="0.1"
                                    onChange={(e) => setRate(Number(e.target.value))} 
                                    className="form-control bg-black border-secondary border-opacity-50 text-white text-end py-1 pe-4" 
                                    style={{ backgroundColor: '#0b0f19', fontSize: '0.9rem', width: '90px' }}
                                />
                                <span className="position-absolute end-0 top-50 translate-middle-y pe-2 text-white-50 fw-bold">%</span>
                            </div>
                        </div>
                        <input type="range" min="1" max="30" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                        <div className="d-flex justify-content-between text-white-50 small" style={{ fontSize: '0.65rem' }}><span>1%</span><span>30%</span></div>
                    </div>

                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="text-white-50 small fw-bold">Loan Tenure</label>
                            <div className="d-flex align-items-center bg-black border border-secondary border-opacity-50 rounded overflow-hidden" style={{ backgroundColor: '#0b0f19' }}>
                                <input 
                                    type="number" 
                                    value={tenure} 
                                    onChange={(e) => setTenure(Number(e.target.value))} 
                                    className="form-control bg-transparent border-0 text-white text-end py-1 px-2 shadow-none" 
                                    style={{ fontSize: '0.9rem', width: '60px' }}
                                />
                                <span className="text-white-50 bg-secondary bg-opacity-10 px-2 py-1 small">Years</span>
                            </div>
                        </div>
                        <input type="range" min="1" max="30" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
                        <div className="d-flex justify-content-between text-white-50 small" style={{ fontSize: '0.65rem' }}><span>1 Yr</span><span>30 Yrs</span></div>
                    </div>

                    {/* Prepayment Toggle */}
                    <div className="pt-4 mt-2 border-top border-secondary border-opacity-25">
                        <div className="d-flex align-items-center justify-content-between cursor-pointer" onClick={() => setShowPrepayment(!showPrepayment)}>
                            <div className="d-flex align-items-center gap-2" style={{ color: colors.emerald }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 0.6-3.5 1.5-0.7-0.9-2-1.5-3.5-1.5-2.5 0-4.5 2-4.5 4.5 0 3.5 5.5 8.5 8 8.5 2.5 0 8-5 8-8.5 0-2.5-2-4.5-4.5-4.5z"/><path d="M12 5v-2"/></svg>
                                <span className="small fw-bold text-uppercase tracking-wide">Add Prepayments (Save Interest)</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showPrepayment ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        
                        {showPrepayment && (
                            <div className="mt-4 animate-fade-in">
                                <label className="text-white-50 small d-block mb-2">Extra Payment per Month</label>
                                <div className="position-relative">
                                    <span className="position-absolute start-0 top-50 translate-middle-y ps-3 text-white-50 fw-bold">{currency}</span>
                                    <input 
                                        type="number" 
                                        value={extraEMI} 
                                        onChange={(e) => setExtraEMI(Number(e.target.value))} 
                                        className="form-control bg-black border-secondary border-opacity-50 text-white py-2 ps-5"
                                        style={{ backgroundColor: '#0b0f19' }}
                                    />
                                </div>
                                <p className="mt-2 text-white-50 small fst-italic" style={{ fontSize: '0.75rem' }}>Paying extra reduces your principal faster, drastically cutting down total interest.</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Schedule Table */}
                <div className="mt-4 bg-dark border border-secondary border-opacity-25 rounded-4 p-4 shadow-sm" style={{ backgroundColor: colors.panel }}>
                    <h3 className="fw-bold text-white-50 mb-3" style={{ fontSize: '0.9rem' }}>Repayment Schedule (Yearly)</h3>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover table-sm small text-center mb-0" style={{ fontSize: '0.8rem', background: 'transparent' }}>
                            <thead>
                                <tr>
                                    <th className="text-white-50 fw-normal py-2">Year</th>
                                    <th className="text-white-50 fw-normal py-2">Principal</th>
                                    <th className="text-white-50 fw-normal py-2">Interest</th>
                                    <th className="text-white-50 fw-normal py-2">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="border-top border-secondary border-opacity-25">
                                {schedule.slice(0, 10).map((row: any) => (
                                    <tr key={row.year}>
                                        <td className="text-white-50 py-2">Year {row.year}</td>
                                        <td className="font-monospace text-white-50 py-2">{currency}{fmt(row.principal)}</td>
                                        <td className="font-monospace text-white-50 py-2">{currency}{fmt(row.interest)}</td>
                                        <td className="font-monospace text-white fw-bold py-2">{currency}{fmt(row.balance)}</td>
                                    </tr>
                                ))}
                                {schedule.length > 10 && <tr><td colSpan={4} className="text-white-50 fst-italic py-2">...and {schedule.length - 10} more years</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Right Column: Results */}
            <div className="col-12 col-lg-5">
                <div className="sticky-top" style={{ top: '100px' }}>
                    
                    {/* Main Result Card */}
                    <div className="p-5 rounded-4 border border-secondary border-opacity-25 shadow-2xl mb-4 position-relative overflow-hidden text-center" 
                         style={{ background: 'linear-gradient(145deg, #111827, #1f2937)' }}>
                        
                        <p className="text-uppercase fw-bold mb-3" style={{ color: colors.textMuted, fontSize: '0.7rem', letterSpacing: '1px' }}>Your Monthly EMI</p>
                        <h2 className="display-4 fw-bold text-white font-monospace tracking-tight mb-5">
                            <span className="fs-2 align-top text-white-50 me-1">{currency}</span>{fmt(emi)}
                        </h2>

                        {/* Chart */}
                        <div className="mb-5 d-flex justify-content-center">
                            <DonutChart p={amount} i={totalInterest} />
                        </div>

                        {/* Breakdown Stats */}
                        <div className="row g-3 text-start">
                            <div className="col-6">
                                <div className="p-3 rounded-3 border border-secondary border-opacity-25 h-100 bg-black bg-opacity-25" style={{ borderLeft: `4px solid ${colors.blue}` }}>
                                    <div className="text-uppercase small text-white-50 mb-1" style={{ fontSize: '0.65rem' }}>Principal</div>
                                    <div className="fw-bold text-white font-monospace fs-5">{currency}{fmt(amount)}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 rounded-3 border border-secondary border-opacity-25 h-100 bg-black bg-opacity-25" style={{ borderLeft: `4px solid ${colors.emerald}` }}>
                                    <div className="text-uppercase small text-white-50 mb-1" style={{ fontSize: '0.65rem' }}>Total Interest</div>
                                    <div className="fw-bold font-monospace fs-5" style={{ color: colors.emerald }}>{currency}{fmt(totalInterest)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Savings Badge */}
                        {savings > 0 && (
                            <div className="mt-4 p-3 rounded-3 d-flex align-items-center justify-content-center gap-2" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                <span className="small fw-medium" style={{ color: '#6ee7b7' }}>You save <strong>{currency}{fmt(savings)}</strong> by paying extra!</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>

         </div>
       </div>
    </div>
  );
};

export default EMICalculatorPage;