import React from 'react';

interface GenericToolPageProps {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
}

const GenericToolPage: React.FC<GenericToolPageProps> = ({ title, children, onBack }) => {
  return (
    <div className="fixed-top w-100 h-100 d-flex align-items-center justify-content-center p-0 m-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', zIndex: 2000, overflowY: 'auto' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="btn btn-link text-white text-decoration-none position-absolute top-0 start-0 m-4 z-3 d-flex align-items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Tools
      </button>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="text-center mb-5">
               <h1 className="display-4 fw-bold text-white">{title}</h1>
            </div>
            
            <div className="bg-dark bg-opacity-50 rounded-5 p-5 border border-secondary border-opacity-25 shadow-lg backdrop-blur-md">
                {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericToolPage;