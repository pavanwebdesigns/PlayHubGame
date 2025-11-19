import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-playhub-main border-top border-playhub py-5 mt-5">
      <div className="container text-center">
        <h2 className="text-white mb-3 fs-1">PlayHub<span className="text-playhub-accent">Game</span></h2>
        <p className="text-white-50 mx-auto mb-4 fs-5" style={{ maxWidth: '500px' }}>
          The best destination for free online games. Play thousands of games instantly without downloading.
        </p>
        <div className="d-flex justify-content-center gap-4 mb-4 fs-5">
          <a href="#" className="text-white-50 text-decoration-none hover-white">Privacy Policy</a>
          <a href="#" className="text-white-50 text-decoration-none hover-white">Terms</a>
          <a href="#" className="text-white-50 text-decoration-none hover-white">Contact</a>
        </div>
        <div className="text-white-50 small">
          &copy; {new Date().getFullYear()} PlayHubGame. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;