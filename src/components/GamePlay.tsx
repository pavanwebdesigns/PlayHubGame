import React, { useEffect, useRef, useState } from 'react';
import type { InfoView } from './InfoPage';
import { SITE_NAME, setDocumentMeta } from '../config/site';
import Header from './Header';
import Footer from './Footer';
import type { GamePixGame } from '../types';
import { COVER_PLACEHOLDER, coverSrc, gamepixSrcSet } from '../lib/image';

interface GamePlayProps {
  game: GamePixGame;
  relatedGames: GamePixGame[];
  onBack: () => void;
  onPlayGame: (game: GamePixGame) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onTools?: () => void;
  onBlog?: () => void;
  onOpenFavorites?: () => void;
  onOpenTool?: (toolId: string) => void;
  onOpenPage: (page: InfoView) => void;
  favoritesCount?: number;
}

const GamePlay: React.FC<GamePlayProps> = ({ 
  game, 
  relatedGames, 
  onBack, 
  onPlayGame, 
  isFavorite, 
  onToggleFavorite,
  onTools,
  onBlog,
  onOpenFavorites,
  onOpenTool,
  onOpenPage,
  favoritesCount = 0,
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'auto' });
    const categoryLabel = game.category ? ` Free Online ${game.category} Game` : '';
    setDocumentMeta(
      `Play ${game.title}${categoryLabel} | ${SITE_NAME}`,
      game.description
        ? `Play ${game.title} for free. ${game.description.slice(0, 140)}`
        : `Play ${game.title} free in the browser on ${SITE_NAME}.`,
    );
    loadedRef.current = false;
    setShowHelp(false);
    const helpTimer = window.setTimeout(() => {
      if (!loadedRef.current) setShowHelp(true);
    }, 15000);
    return () => window.clearTimeout(helpTimer);
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
      <Header onSearch={() => {}} onHome={onBack} onTools={onTools} onBlog={onBlog} onOpenSidebar={onOpenFavorites} onOpenTool={onOpenTool} favoritesCount={favoritesCount} />

      <main className="flex-grow-1 container-fluid px-0 px-md-4 py-4">
        <nav aria-label="breadcrumb" className="container mb-4">
            <button onClick={onBack} className="btn btn-outline-light rounded-pill px-4 d-flex align-items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to Arcade
            </button>
        </nav>

        <article className="container mb-5" style={{ maxWidth: '1200px' }}>
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
                            onLoad={() => {
                              loadedRef.current = true;
                              setShowHelp(false);
                            }}
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
                        
                        {showHelp && (
                        <div className="alert alert-dark d-flex align-items-center border border-secondary border-opacity-25 mb-4" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning me-3"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            <div>
                                <strong>Having trouble playing?</strong> If the game doesn't load, try disabling your ad blocker.
                            </div>
                        </div>
                        )}
                        
                        <div className="game-description">
                            <h2 className="h4 text-white mb-3">About this Game</h2>
                            <p className="lead text-white-50">
                                {game.description || `Play ${game.title} free in the browser on ${SITE_NAME}.`}
                            </p>
                        </div>
                    </section>
        </article>

        {/* Related Games Section */}
        {relatedGames.length > 0 && (
            <section className="container pt-5 border-top border-secondary border-opacity-25 mt-5">
                <h2 className="text-white mb-4 border-start border-4 border-primary ps-3 display-6">
                    More <span className="text-primary">{game.category}</span> Games
                </h2>
                
                <div className="row g-3 g-md-4">
                    {relatedGames.slice(0, 12).map((relatedGame, index) => {
                         const rawCover = relatedGame.banner_image || relatedGame.image;
                         const imageSrc = coverSrc(rawCover, 320);
                         const imageSrcSet = rawCover && imageSrc !== COVER_PLACEHOLDER ? gamepixSrcSet(rawCover, [320, 480, 640]) : undefined;
                         
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
                                            srcSet={imageSrcSet}
                                            sizes={imageSrcSet ? '(min-width: 1200px) 16vw, (min-width: 992px) 25vw, (min-width: 768px) 33vw, 50vw' : undefined}
                                            alt={relatedGame.title}
                                            width={320}
                                            height={180}
                                            className="w-100 h-100 object-fit-cover"
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (target.dataset.failed === 'placeholder') return;
                                                target.dataset.failed = 'placeholder';
                                                target.srcset = '';
                                                target.src = COVER_PLACEHOLDER;
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

      <Footer onOpenPage={onOpenPage} />
    </div>
  );
};

export default GamePlay;