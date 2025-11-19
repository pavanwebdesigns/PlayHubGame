import React from 'react';

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
);

const ToolsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);

const BlogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);

interface HeaderProps {
  onSearch: (term: string) => void;
  onHome?: () => void;
  onTools?: () => void;
  onBlog?: () => void;
  onOpenSidebar?: () => void;
  favoritesCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onHome, onTools, onBlog, onOpenSidebar, favoritesCount = 0 }) => {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onHome) {
      onHome();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky-top bg-playhub-main border-bottom border-playhub shadow-sm">
      <nav className="navbar navbar-expand-md navbar-dark py-3">
        <div className="container-fluid px-4">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#" onClick={handleLogoClick}>
            <img alt="playhublogo-image" src="./playlogo.svg" style={{ height: '40px', width: 'auto' }} />
          </a>

          <div className="flex-grow-1 mx-md-4 my-2 my-md-0 position-relative" style={{ maxWidth: '500px' }}>
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

          <div className="d-none d-md-flex gap-1 align-items-center">
            <button className="nav-link-custom border-0 bg-transparent" onClick={onHome}>
              <GamepadIcon />
              <span className="fs-5">Games</span>
            </button>
            <button className="nav-link-custom border-0 bg-transparent" onClick={onTools}>
              <ToolsIcon />
              <span className="fs-5">Tools</span>
            </button>
            <button className="nav-link-custom border-0 bg-transparent" onClick={onBlog}>
              <BlogIcon />
              <span className="fs-5">Blog</span>
            </button>
            <button 
              className="btn btn-outline-light rounded-circle position-relative ms-2 d-flex align-items-center justify-content-center p-2 border-opacity-25"
              onClick={onOpenSidebar}
              style={{ width: '42px', height: '42px' }}
              title="Favorites"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={favoritesCount > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={favoritesCount > 0 ? "text-danger" : ""}><path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {favoritesCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark" style={{ fontSize: '0.65rem' }}>
                  {favoritesCount}
                  <span className="visually-hidden">favorites</span>
                </span>
              )}
            </button>
          </div>

          <div className="d-md-none d-flex gap-2">
             {/* Mobile favorite button */}
            <button 
              className="btn btn-link text-white p-1 position-relative"
              onClick={onOpenSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={favoritesCount > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={favoritesCount > 0 ? "text-danger" : ""}><path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               {favoritesCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark" style={{ fontSize: '0.6rem', transform: 'translate(-50%, 10%)' }}>
                  {favoritesCount}
                </span>
              )}
            </button>
            <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mobileMenu">
                <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;