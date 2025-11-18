import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryBar from './components/CategoryBar';
import GamePlay from './components/GamePlay';
import './App.css';

// --- Types ---
export interface GamePixGame {
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

// --- Game Card Component ---
const GameCard = ({ game, onClick }: { game: GamePixGame, onClick: (game: GamePixGame) => void }) => {
  const imageSrc = game.banner_image || game.bannerUrl || game.thumbnailUrl || game.thumbnailUrl100;

  return (
    <div className="col-6 col-md-4 col-lg-3 col-xl-2 mb-4">
      <div 
        className="cursor-pointer text-decoration-none" 
        onClick={() => onClick(game)}
        style={{ cursor: 'pointer' }}
      >
        <div className="card game-card h-100 border-0 shadow-sm bg-transparent">
          <div className="position-relative w-100 rounded-4 overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#2a2a2a' }}>
            <img 
              src={imageSrc} 
              alt={game.title}
              className="w-100 h-100 object-fit-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.getAttribute('data-failed')) {
                    target.setAttribute('data-failed', 'true');
                    if (imageSrc !== game.thumbnailUrl && game.thumbnailUrl) {
                         target.src = game.thumbnailUrl;
                    } else {
                         target.src = 'https://placehold.co/600x400/000E30/FFFFFF?text=No+Image';
                    }
                }
              }}
            />
            <span className="position-absolute top-0 end-0 m-2 badge bg-black bg-opacity-75 text-uppercase rounded-pill" style={{ fontSize: '0.7rem', letterSpacing: '0.5px', backdropFilter: 'blur(2px)' }}>
              {game.category}
            </span>
          </div>
          <div className="mt-2 text-center">
            <h5 className="text-white text-truncate mb-0 fw-bold px-1" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>
              {game.title}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Placeholder Pages ---
const ToolsPage = () => (
  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-5">
    <div className="mb-4 p-4 bg-dark bg-opacity-50 rounded-circle d-inline-flex">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    </div>
    <h1 className="display-4 fw-bold text-white mb-3">Tools Coming Soon</h1>
    <p className="lead text-white-50 mb-4" style={{ maxWidth: '600px' }}>
      We are building some amazing tools to enhance your gaming experience. Stay tuned for updates!
    </p>
  </div>
);

const BlogPage = () => (
  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-5">
    <div className="mb-4 p-4 bg-dark bg-opacity-50 rounded-circle d-inline-flex">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </div>
    <h1 className="display-4 fw-bold text-white mb-3">Blog Coming Soon</h1>
    <p className="lead text-white-50 mb-4" style={{ maxWidth: '600px' }}>
      Read the latest news, game reviews, and updates from the PlayHub team.
    </p>
  </div>
);

function App() {
  const [games, setGames] = useState<GamePixGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Router State: 'home' | 'game' | 'tools' | 'blog'
  const [currentView, setCurrentView] = useState<'home' | 'game' | 'tools' | 'blog'>('home');
  const [activeGame, setActiveGame] = useState<GamePixGame | null>(null);

  const fetchGames = async (pageNumber: number) => {
    const isFirstLoad = pageNumber === 1;
    if (isFirstLoad) {
        setLoading(true);
        setError(null);
    } else {
        setLoadingMore(true);
    }
    
    const apiUrl = `https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page=${pageNumber}`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();
      let newGames: GamePixGame[] = [];

      if (Array.isArray(json)) {
          newGames = json;
      } else if (json.data && Array.isArray(json.data)) {
          newGames = json.data;
      } else if (json.items && Array.isArray(json.items)) {
          newGames = json.items;
      } else if (json.games && Array.isArray(json.games)) {
          newGames = json.games;
      } else if (json.id && json.title) {
          newGames = [json];
      }

      newGames = newGames.filter(g => g && g.id && g.title);

      if (newGames.length > 0) {
          setGames(prev => isFirstLoad ? newGames : [...prev, ...newGames]);
      } else {
          setHasMore(false);
          if (isFirstLoad) throw new Error("No games found.");
      }

    } catch (err: any) {
      console.error("Fetch Error:", err);
      if (isFirstLoad && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
          try {
              const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
              const proxyRes = await fetch(proxyUrl);
              const proxyJson = await proxyRes.json();
              if (proxyJson.contents) {
                  const parsedContents = JSON.parse(proxyJson.contents);
                  let validProxyGames = [];
                   if (Array.isArray(parsedContents)) validProxyGames = parsedContents;
                   else if (parsedContents.data) validProxyGames = parsedContents.data;
                   else if (parsedContents.items) validProxyGames = parsedContents.items;
                  
                  if (validProxyGames.length > 0) {
                      setGames(validProxyGames);
                      setError(null);
                      return;
                  }
              }
          } catch (proxyErr) {
              console.error("Proxy Fetch Error:", proxyErr);
          }
      }
      if (isFirstLoad) setError("Failed to load games. Please check connection.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGames(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGames(nextPage);
  };

  const handleGameClick = (game: GamePixGame) => {
    setActiveGame(game);
    setCurrentView('game');
  };

  const handleHomeClick = () => {
    setActiveGame(null);
    setCurrentView('home');
  };

  const handleToolsClick = () => {
    setActiveGame(null);
    setCurrentView('tools');
  };

  const handleBlogClick = () => {
    setActiveGame(null);
    setCurrentView('blog');
  };

  const categories = useMemo(() => {
    if (!games.length) return [];
    const cats = new Set(games.map(g => g.category).filter(Boolean)); 
    return Array.from(cats).sort();
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesCategory = selectedCategory ? game.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchTerm, selectedCategory]);

  // --- Render Logic ---

  if (currentView === 'game' && activeGame) {
      const related = games.filter(g => g.category === activeGame.category && g.id !== activeGame.id);
      return (
          <GamePlay 
              game={activeGame} 
              relatedGames={related} 
              onBack={handleHomeClick}
              onPlayGame={handleGameClick}
          />
      );
  }

  return (
    <div className="d-flex flex-column min-vh-100 w-100">
      <Header 
        onSearch={setSearchTerm} 
        onHome={handleHomeClick} 
        onTools={handleToolsClick} 
        onBlog={handleBlogClick}
      />
      
      {/* Only show CategoryBar on Home view */}
      {currentView === 'home' && (
        <CategoryBar 
          categories={categories} 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <main className="flex-grow-1 container-fluid px-4 py-5 d-flex flex-column">
        {currentView === 'tools' ? (
          <ToolsPage />
        ) : currentView === 'blog' ? (
          <BlogPage />
        ) : (
          // Home View Content
          loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1" style={{ minHeight: '50vh' }}>
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
              <p className="fs-3 text-white animate-pulse">Loading Arcade...</p>
            </div>
          ) : error ? (
             <div className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1" style={{ minHeight: '50vh' }}>
              <div className="alert alert-danger d-inline-block" role="alert">
                <h4 className="alert-heading">Oops! Something went wrong.</h4>
                <p>{error}</p>
              </div>
              <button className="btn btn-custom mt-3" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="text-white border-start border-4 border-primary ps-3 mb-0 display-6">
                  {selectedCategory || (searchTerm ? `Search: "${searchTerm}"` : "Featured Games")}
                </h2>
                <span className="text-white-50 fs-4">{filteredGames.length} Games</span>
              </div>
              <div className="row g-4">
                  {filteredGames.map((game, index) => (
                    <GameCard 
                      key={`${game.id}-${index}`} 
                      game={game} 
                      onClick={handleGameClick} 
                    />
                  ))}
              </div>
              {hasMore && filteredGames.length > 0 && !searchTerm && !selectedCategory && (
                  <div className="text-center mt-5">
                      <button 
                          className="btn btn-custom btn-lg px-5 rounded-pill fs-4" 
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                      >
                          {loadingMore ? (
                              <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Loading...
                              </>
                          ) : "Load More Games"}
                      </button>
                  </div>
              )}
            </>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;