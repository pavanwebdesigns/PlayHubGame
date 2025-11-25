import React, { useState, useEffect } from 'react';

interface BMICalculatorPageProps {
  onBack: () => void;
}

const BMICalculatorPage: React.FC<BMICalculatorPageProps> = ({ onBack }) => {
  // --- State ---
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175); // Always stored in cm
  const [weight, setWeight] = useState(70); // Always stored in kg
  const [activityLevel, setActivityLevel] = useState(1.55);

  // --- Results State ---
  const [bmi, setBmi] = useState(0);
  const [bmiCategory, setBmiCategory] = useState('');
  const [bmiColor, setBmiColor] = useState('#10b981');
  const [gaugeRotation, setGaugeRotation] = useState(135);
  const [idealWeightRange, setIdealWeightRange] = useState('');
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);
  const [macros, setMacros] = useState({ p: 0, f: 0, c: 0 });

  // --- Calculation Logic ---
  useEffect(() => {
    // 1. BMI Calculation
    const h_m = height / 100;
    if (h_m <= 0 || weight <= 0) return;
    
    const calculatedBmi = parseFloat((weight / (h_m * h_m)).toFixed(1));
    setBmi(calculatedBmi);

    // 2. Update Gauge & Category
    let category = "Normal";
    let color = "#10b981"; // emerald-500
    let rotation = 135; 

    if (calculatedBmi < 18.5) {
        category = "Underweight";
        color = "#3b82f6"; // blue-500
        rotation = 135 + Math.max(0, (calculatedBmi - 10) / 8.5) * 45;
    } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
        category = "Normal Weight";
        color = "#10b981"; // emerald-500
        rotation = 135 + 45 + ((calculatedBmi - 18.5) / 6.5) * 45;
    } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
        category = "Overweight";
        color = "#f59e0b"; // amber-500
        rotation = 135 + 90 + ((calculatedBmi - 25) / 5) * 45;
    } else {
        category = "Obese";
        color = "#ef4444"; // red-500
        rotation = 135 + 135 + Math.min(((calculatedBmi - 30) / 10) * 45, 45);
    }
    
    setBmiCategory(category);
    setBmiColor(color);
    setGaugeRotation(Math.min(Math.max(rotation, 135), 315)); 

    // 3. Ideal Weight
    const minW_kg = 18.5 * h_m * h_m;
    const maxW_kg = 24.9 * h_m * h_m;
    
    if (weightUnit === 'kg') {
        setIdealWeightRange(`${minW_kg.toFixed(1)} - ${maxW_kg.toFixed(1)}`);
    } else {
        setIdealWeightRange(`${(minW_kg * 2.20462).toFixed(1)} - ${(maxW_kg * 2.20462).toFixed(1)}`);
    }

    // 4. BMR
    let calculatedBmr = 0;
    if (gender === 'male') {
        calculatedBmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        calculatedBmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    setBmr(Math.round(calculatedBmr));

    // 5. TDEE & Macros
    const calculatedTdee = Math.round(calculatedBmr * activityLevel);
    setTdee(calculatedTdee);
    
    setMacros({
        p: Math.round((calculatedTdee * 0.25) / 4),
        f: Math.round((calculatedTdee * 0.30) / 9),
        c: Math.round((calculatedTdee * 0.45) / 4)
    });

  }, [height, weight, age, gender, activityLevel, weightUnit]);


  // --- Handlers ---
  const handleHeightChange = (val: number, type: 'cm' | 'ft' | 'in') => {
      if (type === 'cm') {
          setHeight(val);
      } else if (type === 'ft') {
          const currentInches = Math.round((height / 2.54) % 12);
          const totalInches = (val * 12) + currentInches;
          setHeight(totalInches * 2.54);
      } else if (type === 'in') {
          const currentFeet = Math.floor((height / 2.54) / 12);
          const totalInches = (currentFeet * 12) + val;
          setHeight(totalInches * 2.54);
      }
  };

  const handleWeightChange = (val: number, type: 'kg' | 'lbs') => {
      if (type === 'kg') {
          setWeight(val);
      } else {
          setWeight(val * 0.453592);
      }
  };

  const displayHeightFt = Math.floor((height / 2.54) / 12);
  const displayHeightIn = Math.round((height / 2.54) % 12);
  const displayWeightLbs = Math.round(weight * 2.20462);

  // --- Colors matching the reference HTML ---
  const colors = {
      bg: '#0b0f19', // gray-950
      panel: 'rgba(31, 41, 55, 0.6)', // gray-800/60
      border: 'rgba(75, 85, 99, 0.4)',
      textMain: '#f3f4f6', // gray-100
      textMuted: '#9ca3af', // gray-400
      emerald: '#34d399', // emerald-400
      emeraldDark: '#059669', // emerald-600
      blue: '#60a5fa',
      orange: '#fb923c',
      yellow: '#facc15'
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
                margin: 8px 0;
            }
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 14px;
                width: 14px;
                border-radius: 50%;
                background: ${colors.emerald};
                cursor: pointer;
                margin-top: -5px; 
                box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
            }
            input[type=range]::-webkit-slider-runnable-track {
                width: 100%;
                height: 4px;
                cursor: pointer;
                background: #374151;
                border-radius: 2px;
            }
            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; 
                margin: 0; 
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
                        <div className="rounded-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.28 3.6-2.34 4.63-4.23C24.94 7.25 23.91 3.7 20.62 3.7c-2.63 0-4.49 1.7-6.62 3.4C11.89 5.4 10.03 3.7 7.39 3.7c-3.3 0-4.33 3.55-3.01 6.07 1.03 1.89 3.14 2.95 4.63 4.23L14 19l5-5z"/><path d="M2 22h20"/></svg>
                        </div>
                        <h1 className="h6 mb-0 fw-bold text-white">Body<span style={{ color: colors.emerald }}>Metrics</span> Pro</h1>
                    </div>
                </div>
           </div>
       </div>

      <div className="container py-4">
        <div className="row g-4 justify-content-center">
            
            {/* Left Column: Inputs */}
            <div className="col-12 col-lg-5 col-xl-4">
                <div className="glass-panel p-4 rounded-4 h-100">
                    <h6 className="text-uppercase small fw-bold mb-4" style={{ color: colors.textMuted, letterSpacing: '1px', fontSize: '0.7rem' }}>Your Stats</h6>

                    {/* Gender */}
                    <div className="row g-2 mb-4">
                        <div className="col-6">
                            <button 
                                className="w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 transition-all"
                                style={{ 
                                    backgroundColor: gender === 'male' ? 'rgba(16, 185, 129, 0.15)' : '#111827', 
                                    border: `1px solid ${gender === 'male' ? colors.emerald : '#374151'}`,
                                    color: gender === 'male' ? 'white' : '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                                onClick={() => setGender('male')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2h6v6"/><path d="M13.76 10.23 21.34 2.66"/><circle cx="9" cy="15" r="6"/></svg>
                                Male
                            </button>
                        </div>
                        <div className="col-6">
                            <button 
                                className="w-100 py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 transition-all"
                                style={{ 
                                    backgroundColor: gender === 'female' ? 'rgba(16, 185, 129, 0.15)' : '#111827', 
                                    border: `1px solid ${gender === 'female' ? colors.emerald : '#374151'}`,
                                    color: gender === 'female' ? 'white' : '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                                onClick={() => setGender('female')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15v7"/><path d="M9 19h6"/><circle cx="12" cy="9" r="6"/></svg>
                                Female
                            </button>
                        </div>
                    </div>

                    {/* Age */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between mb-1">
                            <label className="small" style={{ color: '#d1d5db', fontSize: '0.85rem' }}>Age</label>
                            <span className="fw-bold font-monospace" style={{ color: colors.emerald, fontSize: '1rem' }}>{age}</span>
                        </div>
                        <input 
                            type="range" 
                            min="10" max="100" 
                            value={age} 
                            onChange={(e) => setAge(Number(e.target.value))}
                        />
                    </div>

                    {/* Height */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="small" style={{ color: '#d1d5db', fontSize: '0.85rem' }}>Height</label>
                            <div className="d-flex p-0.5 rounded bg-dark border border-secondary border-opacity-25">
                                <button 
                                    className="btn btn-sm py-0 px-2" 
                                    style={{ 
                                        backgroundColor: heightUnit === 'cm' ? colors.emeraldDark : 'transparent', 
                                        color: heightUnit === 'cm' ? 'white' : '#9ca3af',
                                        fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '4px'
                                    }} 
                                    onClick={() => setHeightUnit('cm')}
                                >CM</button>
                                <button 
                                    className="btn btn-sm py-0 px-2" 
                                    style={{ 
                                        backgroundColor: heightUnit === 'ft' ? colors.emeraldDark : 'transparent', 
                                        color: heightUnit === 'ft' ? 'white' : '#9ca3af',
                                        fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '4px'
                                    }} 
                                    onClick={() => setHeightUnit('ft')}
                                >FT</button>
                            </div>
                        </div>
                        
                        <div className="d-flex align-items-baseline gap-2 mb-1">
                            {heightUnit === 'cm' ? (
                                <div className="d-flex align-items-baseline w-100 border-bottom border-secondary pb-2">
                                    <input type="number" value={Math.round(height)} onChange={(e) => setHeight(Number(e.target.value))} className="bg-transparent border-0 text-white fw-bold p-0 shadow-none flex-grow-1" style={{ fontSize: '1.25rem', color: colors.emerald, outline: 'none', lineHeight: '1.2' }} />
                                    <span className="small ms-" style={{ color: '#6b7280', fontSize: '0.75rem' }}>cm</span>
                                </div>
                            ) : (
                                <div className="d-flex w-100 gap-3">
                                    <div className="d-flex align-items-baseline border-bottom border-secondary pb-2 flex-grow-1 col-6">
                                        <input type="number" value={displayHeightFt} onChange={(e) => handleHeightChange(Number(e.target.value), 'ft')} className="bg-transparent border-0 text-white fw-bold p-0 shadow-none flex-grow-1" style={{ fontSize: '1.25rem', color: colors.emerald, outline: 'none', lineHeight: '1.2' }} />
                                        <span className="small ms-1" style={{ color: '#6b7280', fontSize: '0.75rem' }}>ft</span>
                                    </div>
                                    <div className="d-flex align-items-baseline border-bottom border-secondary pb-2 flex-grow-1 col-6">
                                        <input type="number" value={displayHeightIn} onChange={(e) => handleHeightChange(Number(e.target.value), 'in')} className="bg-transparent border-0 text-white fw-bold p-0 shadow-none flex-grow-1" style={{ fontSize: '1.25rem', color: colors.emerald, outline: 'none', lineHeight: '1.2' }} />
                                        <span className="small ms-1" style={{ color: '#6b7280', fontSize: '0.75rem' }}>in</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <input 
                            type="range" 
                            min="100" max="250" 
                            value={Math.round(height)} 
                            onChange={(e) => setHeight(Number(e.target.value))}
                        />
                    </div>

                    {/* Weight */}
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="small" style={{ color: '#d1d5db', fontSize: '0.85rem' }}>Weight</label>
                            <div className="d-flex p-0.5 rounded bg-dark border border-secondary border-opacity-25">
                                <button className="btn btn-sm py-0 px-2" style={{ backgroundColor: weightUnit === 'kg' ? colors.emeraldDark : 'transparent', color: weightUnit === 'kg' ? 'white' : '#9ca3af', fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '4px' }} onClick={() => setWeightUnit('kg')}>KG</button>
                                <button className="btn btn-sm py-0 px-2" style={{ backgroundColor: weightUnit === 'lbs' ? colors.emeraldDark : 'transparent', color: weightUnit === 'lbs' ? 'white' : '#9ca3af', fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '4px' }} onClick={() => setWeightUnit('lbs')}>LBS</button>
                            </div>
                        </div>

                        <div className="d-flex align-items-baseline border-bottom border-secondary pb-2 mb-1">
                            <input 
                                type="number" 
                                value={weightUnit === 'kg' ? Math.round(weight) : displayWeightLbs} 
                                onChange={(e) => handleWeightChange(Number(e.target.value), weightUnit)} 
                                className="bg-transparent border-0 fw-bold p-0 shadow-none flex-grow-1" 
                                style={{ fontSize: '1.25rem', color: colors.emerald, outline: 'none', lineHeight: '1.2' }} 
                            />
                            <span className="small ms-1" style={{ color: '#6b7280', fontSize: '0.75rem' }}>{weightUnit}</span>
                        </div>
                        <input 
                            type="range" 
                            min="30" max="200" 
                            value={Math.round(weight)} 
                            onChange={(e) => setWeight(Number(e.target.value))}
                        />
                    </div>

                    {/* Activity Level */}
                    <div className="mb-2">
                        <label className="small mb-2 d-block" style={{ color: '#d1d5db', fontSize: '0.85rem' }}>Activity Level</label>
                        <select 
                            className="form-select border-secondary border-opacity-50 text-white py-2"
                            style={{ backgroundColor: '#111827', fontSize: '0.85rem' }}
                            value={activityLevel}
                            onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                        >
                            <option value="1.2">Sedentary (Little or no exercise)</option>
                            <option value="1.375">Lightly active (Exercise 1-3 days/week)</option>
                            <option value="1.55">Moderately active (Exercise 3-5 days/week)</option>
                            <option value="1.725">Very active (Exercise 6-7 days/week)</option>
                            <option value="1.9">Super active (Physical job or hard training)</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Right Column: Results */}
            <div className="col-12 col-lg-7 col-xl-8">
                
                {/* BMI Gauge Card */}
                <div className="glass-panel p-4 rounded-4 mb-4 position-relative overflow-hidden">
                    <div className="row align-items-center g-4 position-relative" style={{ zIndex: 1 }}>
                        <div className="col-12 col-md-5 text-center">
                            {/* Gauge Container */}
                            <div className="position-relative d-inline-block" style={{ width: '180px', height: '100px', overflow: 'hidden' }}>
                                <div style={{ 
                                    width: '180px', height: '180px', borderRadius: '50%', 
                                    border: '18px solid #374151', 
                                    transform: 'rotate(135deg)', 
                                    position: 'absolute', top: 0, left: 0
                                }}></div>
                                <div style={{ 
                                    width: '180px', height: '180px', borderRadius: '50%', 
                                    border: '18px solid transparent', borderTopColor: bmiColor, borderRightColor: bmiColor,
                                    transform: `rotate(${gaugeRotation}deg)`, 
                                    position: 'absolute', top: 0, left: 0, 
                                    transition: 'transform 1s ease-out, border-color 0.5s ease'
                                }}></div>
                                
                                {/* Center Text in Gauge */}
                                <div className="position-absolute w-100 text-center" style={{ top: '45px', left: 0 }}>
                                     <div className="text-uppercase fw-bold" style={{ fontSize: '0.6rem', color: '#6b7280' }}>Your BMI</div>
                                     <div className="fw-bold text-white" style={{ fontSize: '2rem', lineHeight: 1 }}>{bmi}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-12 col-md-7 text-center text-md-start">
                            <h3 className="fw-bold mb-1" style={{ color: bmiColor, fontSize: '1.4rem' }}>{bmiCategory}</h3>
                            <p className="small mb-3" style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.4 }}>
                                {bmi < 18.5 ? "Consider a calorie surplus to gain healthy mass." : 
                                 bmi < 25 ? "Great job! Maintain your balanced diet." : 
                                 bmi < 30 ? "Aim for a slight calorie deficit and cardio." : 
                                 "Consult a specialist for a structured plan."}
                            </p>
                            <div className="rounded-3 p-3 border border-secondary border-opacity-25 w-100" style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)' }}>
                                <div className="text-uppercase small" style={{ fontSize: '0.6rem', color: '#6b7280', marginBottom: '2px' }}>Ideal Weight Range</div>
                                <div className="fw-bold text-white font-monospace" style={{ fontSize: '1rem' }}>{idealWeightRange} <span className="small text-white-50">{weightUnit}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BMR & TDEE Cards */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                        <div className="glass-panel p-3 rounded-4 h-100 position-relative overflow-hidden" style={{ borderTop: `3px solid ${colors.blue}` }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h5 className="fw-bold text-white m-0" style={{ fontSize: '1rem' }}>BMR</h5>
                                    <small style={{ color: '#6b7280', fontSize: '0.65rem' }}>Basal Metabolic Rate</small>
                                </div>
                                <div className="p-1 rounded" style={{ backgroundColor: `${colors.blue}20`, color: colors.blue }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                                </div>
                            </div>
                            <div className="fw-bold text-white" style={{ fontSize: '1.5rem' }}>{bmr.toLocaleString()} <span className="fw-normal text-white-50" style={{ fontSize: '0.9rem' }}>kcal</span></div>
                            <p className="small mt-1 mb-0" style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Calories burned at rest.</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="glass-panel p-3 rounded-4 h-100 position-relative overflow-hidden" style={{ borderTop: `3px solid ${colors.orange}` }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h5 className="fw-bold text-white m-0" style={{ fontSize: '1rem' }}>TDEE</h5>
                                    <small style={{ color: '#6b7280', fontSize: '0.65rem' }}>Total Daily Energy</small>
                                </div>
                                <div className="p-1 rounded" style={{ backgroundColor: `${colors.orange}20`, color: colors.orange }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                </div>
                            </div>
                            <div className="fw-bold text-white" style={{ fontSize: '1.5rem' }}>{tdee.toLocaleString()} <span className="fw-normal text-white-50" style={{ fontSize: '0.9rem' }}>kcal</span></div>
                            <p className="small mt-1 mb-0" style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Daily maintenance calories.</p>
                        </div>
                    </div>
                </div>

                {/* Macros Panel */}
                <div className="glass-panel p-4 rounded-4">
                    <h6 className="text-uppercase small fw-bold mb-3" style={{ color: colors.textMuted, letterSpacing: '1px', fontSize: '0.65rem' }}>Suggested Daily Macros</h6>
                    <div className="row g-3 text-center">
                        <div className="col-4">
                            <div className="rounded-3 p-2 border border-secondary border-opacity-25" style={{ backgroundColor: '#111827' }}>
                                <div className="fw-bold" style={{ color: colors.emerald, fontSize: '1.2rem' }}>{macros.p}g</div>
                                <div className="small text-uppercase" style={{ color: '#6b7280', fontSize: '0.6rem' }}>Protein</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="rounded-3 p-2 border border-secondary border-opacity-25" style={{ backgroundColor: '#111827' }}>
                                <div className="fw-bold" style={{ color: colors.blue, fontSize: '1.2rem' }}>{macros.f}g</div>
                                <div className="small text-uppercase" style={{ color: '#6b7280', fontSize: '0.6rem' }}>Fats</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="rounded-3 p-2 border border-secondary border-opacity-25" style={{ backgroundColor: '#111827' }}>
                                <div className="fw-bold" style={{ color: colors.yellow, fontSize: '1.2rem' }}>{macros.c}g</div>
                                <div className="small text-uppercase" style={{ color: '#6b7280', fontSize: '0.6rem' }}>Carbs</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default BMICalculatorPage;