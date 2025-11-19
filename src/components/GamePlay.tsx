import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';

// --- Interface Definition (Local) ---
// This must match the structure of the game object passed from App.tsx
interface GamePixGame {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailUrl100: string;
  banner_image?: string;
  bannerUrl?: string;
  url: string;
  category: string;
  width: number;
  height: number;
  color: string;
}

interface GamePlayProps {
  game: GamePixGame;
  relatedGames: GamePixGame[];
  onBack: () => void;
  onPlayGame: (game: GamePixGame) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const GamePlay: React.FC<GamePlayProps> = ({ 
  game, 
  relatedGames, 
  onBack, 
  onPlayGame, 
  isFavorite, 
  onToggleFavorite 
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    document.title = `Play ${game.title} - Free Online ${game.category} Game | PlayHubGame`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', `Play ${game.title} for free! ${game.description?.substring(0, 150)}... No downloads required.`);
    }
  }, [game.id, game.title, game.category, game.description]);

  const toggleFullScreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 w-100 bg-black" ref={topRef}>
      <Header onSearch={() => {}} onHome={onBack} />

      <main className="flex-grow-1 container-fluid px-0 px-md-4 py-4">
        <nav aria-label="breadcrumb" className="container mb-4">
            <button onClick={onBack} className="btn btn-outline-light rounded-pill px-4 d-flex align-items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Arcade
            </button>
        </nav>

        <article className="container mb-5">
            <div className="row g-4">
                <div className="col-12 col-lg-9">
                    <section 
                        ref={gameContainerRef}
                        className="ratio ratio-16x9 bg-dark rounded-4 overflow-hidden shadow-lg border border-secondary border-opacity-25 position-relative group" 
                        style={{ minHeight: '60vh' }}
                    >
                        <iframe 
                            src={game.url} 
                            title={`Play ${game.title}`} 
                            allowFullScreen 
                            className="w-100 h-100"
                            loading="eager"
                            allow="autoplay; fullscreen; gyroscope; accelerometer; magnetometer; gamepad"
                        ></iframe>
                         <button 
                            onClick={toggleFullScreen}
                            className="btn btn-dark bg-opacity-75 position-absolute bottom-0 end-0 m-3 rounded-circle p-2 d-flex align-items-center justify-content-center border border-white border-opacity-25"
                            style={{ width: '48px', height: '48px', zIndex: 10 }}
                            aria-label="Toggle Fullscreen"
                            title="Fullscreen"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                        </button>
                    </section>
                    
                    <section className="mt-4 text-white">
                        <header className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <div className="d-flex flex-wrap align-items-center gap-3">
                                <h1 className="display-5 fw-bold mb-0">{game.title}</h1>
                                <span className="badge bg-primary fs-6 rounded-pill px-3 py-2 text-uppercase">{game.category}</span>
                            </div>

                            {/* Favorite Toggle Button */}
                            <button 
                                className={`btn rounded-pill px-4 d-flex align-items-center gap-2 ${isFavorite ? 'btn-danger text-white' : 'btn-outline-light text-white-50'}`}
                                onClick={onToggleFavorite}
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill={isFavorite ? "currentColor" : "none"} 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                {isFavorite ? 'Favorited' : 'Add to Favorites'}
                            </button>
                        </header>
                        
                        <div className="alert alert-dark d-flex align-items-center border border-secondary border-opacity-25 mb-4" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning me-3"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            <div>
                                <strong>Having trouble playing?</strong> If the game doesn't load, try disabling your ad blocker.
                            </div>
                        </div>
                        
                        <div className="game-description">
                            <h2 className="h4 text-white mb-3">About this Game</h2>
                            <p className="lead text-white-50">
                                {game.description || `Experience the thrill of ${game.title} on PlayHubGame.`}
                            </p>
                        </div>
                    </section>
                </div>
                <aside className="col-12 col-lg-3">
                    <div className="bg-dark bg-opacity-50 rounded-4 p-4 h-100 border border-secondary border-opacity-25 text-center d-flex flex-column align-items-center justify-content-start sticky-top" style={{ top: '100px', zIndex: 1 }}>
                        <span className="text-white-50 text-uppercase small letter-spacing-2 mb-3">Sponsored</span>
                        <div className="p-4 bg-black bg-opacity-50 rounded w-100 d-flex align-items-center justify-content-center" style={{ border: '2px dashed #444', minHeight: '250px' }}>
                             <span className="text-white-50">Ad Space</span>
                        </div>
                    </div>
                </aside>
            </div>
        </article>

        {/* Related Games Section */}
        {relatedGames.length > 0 && (
            <section className="container pt-5 border-top border-secondary border-opacity-25 mt-5">
                <h2 className="text-white mb-4 border-start border-4 border-primary ps-3 display-6">
                    More <span className="text-primary">{game.category}</span> Games
                </h2>
                
                <div className="row g-3 g-md-4">
                    {relatedGames.slice(0, 12).map((relatedGame, index) => {
                         const imageSrc = relatedGame.banner_image || relatedGame.bannerUrl || relatedGame.thumbnailUrl || relatedGame.thumbnailUrl100;
                         
                         return (
                            <div key={`${relatedGame.id}-${index}`} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                <div 
                                    className="card h-100 border-0 bg-transparent cursor-pointer game-card"
                                    onClick={() => onPlayGame(relatedGame)}
                                    title={`Play ${relatedGame.title}`}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="position-relative w-100 rounded-4 overflow-hidden shadow-sm" style={{ aspectRatio: '16/9', backgroundColor: '#2a2a2a' }}>
                                        <img 
                                            src={imageSrc} 
                                            alt={relatedGame.title}
                                            className="w-100 h-100 object-fit-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (!target.getAttribute('data-failed')) {
                                                    target.setAttribute('data-failed', 'true');
                                                    if (imageSrc !== relatedGame.thumbnailUrl && relatedGame.thumbnailUrl) {
                                                         target.src = relatedGame.thumbnailUrl;
                                                    } else {
                                                         target.src = 'https://placehold.co/600x400/000E30/FFFFFF?text=No+Image';
                                                    }
                                                }
                                            }}
                                        />
                                        <span className="position-absolute top-0 end-0 m-2 badge bg-black bg-opacity-75 text-uppercase rounded-pill" style={{ fontSize: '0.6rem', backdropFilter: 'blur(2px)' }}>
                                            {relatedGame.category}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <h3 className="text-white text-truncate mb-0 h6 opacity-75">{relatedGame.title}</h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default GamePlay;