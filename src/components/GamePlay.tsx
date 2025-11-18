import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';

// Define interface locally to avoid import issues
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
}

const GamePlay: React.FC<GamePlayProps> = ({ game, relatedGames, onBack, onPlayGame }) => {
  const topRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top and update SEO meta when game changes
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // SEO: Update Page Title
    document.title = `Play ${game.title} - Free Online ${game.category} Game | PlayHubGame`;
    
    // SEO: Update Meta Description (Basic implementation)
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
        
        {/* Breadcrumb / Navigation */}
        <nav aria-label="breadcrumb" className="container mb-4">
            <button onClick={onBack} className="btn btn-outline-light rounded-pill px-4 d-flex align-items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Arcade
            </button>
        </nav>

        {/* Game Player & Details Section */}
        <article className="container mb-5">
            <div className="row g-4">
                {/* Game Frame */}
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

                         {/* Full Screen Toggle Button (visible on hover or always on mobile) */}
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
                    
                    {/* Game Meta Data & SEO Content */}
                    <section className="mt-4 text-white">
                        <header className="mb-4">
                            <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                                <h1 className="display-5 fw-bold mb-0">{game.title}</h1>
                                <span className="badge bg-primary fs-6 rounded-pill px-3 py-2 text-uppercase">{game.category}</span>
                            </div>
                        </header>
                        
                        {/* Detailed Description for SEO */}
                        <div className="game-description">
                            <h2 className="h4 text-white mb-3">About this Game</h2>
                            <p className="lead text-white-50">
                                {game.description || `Experience the thrill of ${game.title}, a top-rated ${game.category} game on PlayHubGame. Play instantly without any downloads!`}
                            </p>
                            
                            {/* Additional SEO-friendly details */}
                            <div className="row mt-4 g-3">
                                <div className="col-auto">
                                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                                        <span className="d-block text-white-50 small text-uppercase">Category</span>
                                        <span className="d-block fw-bold">{game.category}</span>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                                        <span className="d-block text-white-50 small text-uppercase">Platform</span>
                                        <span className="d-block fw-bold">Browser (HTML5)</span>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                                        <span className="d-block text-white-50 small text-uppercase">Game Type</span>
                                        <span className="d-block fw-bold">Free to Play</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar / Ads Placeholder */}
                <aside className="col-12 col-lg-3">
                    <div className="bg-dark bg-opacity-50 rounded-4 p-4 h-100 border border-secondary border-opacity-25 text-center d-flex flex-column align-items-center justify-content-start sticky-top" style={{ top: '100px', zIndex: 1 }}>
                        <span className="text-white-50 text-uppercase small letter-spacing-2 mb-3">Sponsored</span>
                        {/* Ad Placeholder */}
                        <div className="p-4 bg-black bg-opacity-50 rounded w-100 d-flex align-items-center justify-content-center" style={{ border: '2px dashed #444', minHeight: '250px' }}>
                             <span className="text-white-50">Ad Space</span>
                        </div>
                        <div className="mt-4 p-4 bg-black bg-opacity-50 rounded w-100 d-flex align-items-center justify-content-center" style={{ border: '2px dashed #444', minHeight: '250px' }}>
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