import React from 'react';

// Icons specific to Header
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
);

const ToolsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);


interface HeaderProps {
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  return (
    <header className="sticky-top bg-playhub-main border-bottom border-playhub shadow-sm">
      <nav className="navbar navbar-expand-md navbar-dark py-3">
        <div className="container-fluid px-4"> {/* Changed to container-fluid for full width header */}
          {/* Logo Section */}
          <a className="navbar-brand d-flex align-items-center gap-2" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span className="d-none d-sm-block fs-2 text-white ms-2">
              <img src='./playlogo.svg' />
            </span>
          </a>

          {/* Search Bar */}
          <div className="flex-grow-1 mx-md-4 my-2 my-md-0 position-relative" style={{ maxWidth: '600px' }}>
            <input 
              type="text" 
              className="form-control form-control-dark py-2 ps-5 pe-3 fs-5"
              placeholder="Search games..."
              onChange={(e) => onSearch(e.target.value)}
            />
            <div className="position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50">
              <SearchIcon />
            </div>
          </div>

          {/* Navigation (Desktop) */}
          <div className="d-none d-md-flex gap-2">
            <button className="nav-link-custom active border-0 bg-transparent">
              <GamepadIcon />
              <span className="fs-5">Games</span>
            </button>
            <button className="nav-link-custom border-0 bg-transparent">
              <ToolsIcon />
              <span className="fs-5">Tools</span>
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mobileMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;