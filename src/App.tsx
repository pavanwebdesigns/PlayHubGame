import { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryBar from './components/CategoryBar';
import GamePlay from './components/GamePlay';
import ToolsModal from './components/ToolsModal'; 
import ToolsPage, { CpsTest, ReactionGame, SystemInfoTool, PasswordGenTool } from './components/ToolsPage';
import BreathTrainerPage from './components/tools/BreathTrainerPage'; 
import GenericToolPage from './components/tools/GenericToolPage';
import FocusTimerPage from './components/tools/FocusTimerPage'; 
import SpeedTestPage from './components/tools/SpeedTestPage'; 
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

export interface Tool {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: string;
  isReady: boolean;
}

// --- Game Card Component ---
const GameCard = ({ 
  game, 
  onClick, 
  isFavorite, 
  onToggleFavorite 
}: { 
  game: GamePixGame; 
  onClick: (game: GamePixGame) => void;
  isFavorite: boolean;
  onToggleFavorite: (game: GamePixGame) => void;
}) => {
  // Append timestamp to force refresh images and bypass cache
  const timestamp = Date.now();
  const getFreshUrl = (url: string) => url ? `${url}?t=${timestamp}` : '';

  const imageSrc = game.banner_image ? getFreshUrl(game.banner_image) : 
                   game.bannerUrl ? getFreshUrl(game.bannerUrl) : 
                   game.thumbnailUrl ? getFreshUrl(game.thumbnailUrl) : 
                   getFreshUrl(game.thumbnailUrl100);

  return (
    <div className="col-6 col-md-4 col-lg-3 col-xl-2 mb-4 position-relative group">
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
                    // Fallback chain with fresh URLs
                    if (game.thumbnailUrl && imageSrc !== getFreshUrl(game.thumbnailUrl)) {
                         target.src = getFreshUrl(game.thumbnailUrl);
                    } else {
                         target.src = 'https://placehold.co/600x400/000E30/FFFFFF?text=Game';
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

      <button 
        className="btn position-absolute top-0 start-0 m-2 p-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-transform hover-scale"
        style={{ 
          zIndex: 20, 
          backgroundColor: isFavorite ? 'rgba(220, 53, 69, 0.9)' : 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          width: '36px', 
          height: '36px',
          backdropFilter: 'blur(4px)'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(game);
        }}
        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill={isFavorite ? "white" : "none"} 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>
  );
};

// Sidebar
const FavoritesSidebar = ({ isOpen, onClose, favoriteGames, favoriteTools, onPlayGame, onLaunchTool, onRemoveGameFavorite, onRemoveToolFavorite }: any) => {
    const timestamp = Date.now(); 
    const getFreshUrl = (url: string) => url ? `${url}?t=${timestamp}` : '';

    return (
    <>
      {isOpen && <div className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50" style={{ zIndex: 1045 }} onClick={onClose} />}
      <div className={`position-fixed top-0 end-0 h-100 bg-dark border-start border-secondary border-opacity-25 shadow-lg transition-transform duration-300 ease-in-out d-flex flex-column`} style={{ width: '320px', zIndex: 1050, transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out' }}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
          <h5 className="text-white mb-0 d-flex align-items-center gap-2">Favorites</h5>
          <button className="btn btn-sm btn-outline-secondary border-0 text-white" onClick={onClose}>X</button>
        </div>
        <div className="p-3 overflow-auto flex-grow-1">
          <h6 className="text-white-50 text-uppercase small mb-3 fw-bold">Games ({favoriteGames.length})</h6>
          {favoriteGames.length === 0 ? <p className="text-white-50 small">No favorite games.</p> : (
            <div className="d-flex flex-column gap-3 mb-4">
              {favoriteGames.map((game: any) => {
                 // Robust image logic
                 const imageSrc = game.banner_image ? getFreshUrl(game.banner_image) : 
                                  game.bannerUrl ? getFreshUrl(game.bannerUrl) : 
                                  game.thumbnailUrl ? getFreshUrl(game.thumbnailUrl) : 
                                  getFreshUrl(game.thumbnailUrl100);

                return (
                <div key={game.id} className="d-flex align-items-center gap-3 bg-black bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-10 group">
                  <img 
                    src={imageSrc} 
                    alt={game.title} 
                    className="rounded-2" 
                    style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }} 
                    onClick={() => { onPlayGame(game); onClose(); }} 
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.getAttribute('data-failed')) {
                            target.setAttribute('data-failed', 'true');
                            if (game.thumbnailUrl) {
                                 target.src = getFreshUrl(game.thumbnailUrl);
                            } else {
                                 target.src = 'https://placehold.co/100x100/000E30/FFFFFF?text=Game';
                            }
                        }
                      }}
                  />
                  <div className="flex-grow-1 overflow-hidden">
                    <h6 className="text-white mb-0 text-truncate cursor-pointer small" onClick={() => { onPlayGame(game); onClose(); }}>{game.title}</h6>
                  </div>
                  <button className="btn btn-sm btn-link text-white-50 hover-text-danger p-1" onClick={(e) => { e.stopPropagation(); onRemoveGameFavorite(game); }}>X</button>
                </div>
              )})}
            </div>
          )}
          <hr className="border-secondary border-opacity-25 my-4" />
          <h6 className="text-white-50 text-uppercase small mb-3 fw-bold">Tools ({favoriteTools.length})</h6>
          {favoriteTools.length === 0 ? <p className="text-white-50 small">No favorite tools.</p> : (
            <div className="d-flex flex-column gap-3">
                {favoriteTools.map((tool: any) => (
                    <div key={tool.id} className="d-flex align-items-center gap-3 bg-black bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-10 group">
                        <div className="rounded-2 bg-dark d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>{tool.icon}</div>
                        <div className="flex-grow-1 overflow-hidden">
                            <h6 className="text-white mb-0 text-truncate cursor-pointer small" onClick={() => { if(tool.isReady) { onLaunchTool(tool.id); onClose(); } }}>{tool.title}</h6>
                        </div>
                        <button className="btn btn-sm btn-link text-white-50 hover-text-danger p-1" onClick={(e) => { e.stopPropagation(); onRemoveToolFavorite(tool); }}>X</button>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Placeholder Blog
const BlogPage = () => (
  <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center py-5">
    <h1 className="display-4 fw-bold text-white mb-3">Blog Coming Soon</h1>
    <p className="lead text-white-50 mb-4" style={{ maxWidth: '600px' }}>Read the latest news from PlayHub.</p>
  </div>
);

function App() {
  const [games, setGames] = useState<GamePixGame[]>([]);
  const [favoriteGames, setFavoriteGames] = useState<GamePixGame[]>([]);
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Initial state from URL
  const [currentView, setCurrentView] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
  });
  
  const [activeGame, setActiveGame] = useState<GamePixGame | null>(null);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use a ref to track if initial load from URL is done to prevent overwriting
  const isInitialLoadDone = useRef(false);

  useEffect(() => {
    try {
        const storedGameFavs = localStorage.getItem('playhub_favorites');
        if (storedGameFavs) setFavoriteGames(JSON.parse(storedGameFavs));
        const storedToolFavs = localStorage.getItem('playhub_tool_favorites');
        if (storedToolFavs) setFavoriteTools(JSON.parse(storedToolFavs));
    } catch (e) { console.error(e); }
  }, []);

  const toggleGameFavorite = (game: GamePixGame) => {
    setFavoriteGames(prev => {
      const exists = prev.find(f => f.id === game.id);
      const newFavs = exists ? prev.filter(f => f.id !== game.id) : [...prev, game];
      localStorage.setItem('playhub_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const toggleToolFavorite = (tool: Tool) => {
    setFavoriteTools(prev => {
      const exists = prev.find(f => f.id === tool.id);
      const newFavs = exists ? prev.filter(f => f.id !== tool.id) : [...prev, tool];
      localStorage.setItem('playhub_tool_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const fetchGames = async (pageNumber: number) => {
    const isFirstLoad = pageNumber === 1;
    if (isFirstLoad) { setLoading(true); setError(null); } else { setLoadingMore(true); }
    const apiUrl = `https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page=${pageNumber}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      let newGames: GamePixGame[] = [];
      if (Array.isArray(json)) newGames = json;
      else if (json.data && Array.isArray(json.data)) newGames = json.data;
      else if (json.items && Array.isArray(json.items)) newGames = json.items;
      else if (json.games && Array.isArray(json.games)) newGames = json.games;
      else if (json.id && json.title) newGames = [json];
      
      newGames = newGames.filter(g => g && g.id && g.title);
      
      if (newGames.length > 0) { 
          setGames(prev => {
             const combined = isFirstLoad ? newGames : [...prev, ...newGames];
             const unique = Array.from(new Set(combined.map(a => a.id)))
                .map(id => combined.find(a => a.id === id)!);
             return unique;
          }); 
      } else { 
          setHasMore(false); 
          if (isFirstLoad) throw new Error("No games found."); 
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      if (isFirstLoad) setError("Failed to load games. Please check connection.");
    } finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { fetchGames(1); }, []);
  const handleLoadMore = () => { const nextPage = page + 1; setPage(nextPage); fetchGames(nextPage); };
  
  // --- UPDATED NAVIGATION HANDLERS ---
  const updateUrl = (view: string, gameId?: string) => {
      const params = new URLSearchParams(window.location.search);
      if (view === 'home') {
          params.delete('page');
          params.delete('game');
      } else {
          params.set('page', view);
          if (gameId) params.set('game', gameId);
          else params.delete('game');
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
  };

  const handleGameClick = (game: GamePixGame) => { 
      setActiveGame(game); 
      setCurrentView('game');
      updateUrl('game', game.id.toString());
  };
  
  const handleHomeClick = () => { 
      setActiveGame(null); 
      setCurrentView('home'); 
      updateUrl('home');
  };
  
  const handleToolsClick = () => { 
      setActiveGame(null); 
      setCurrentView('tools'); 
      updateUrl('tools');
  };
  
  const handleBlogClick = () => { 
      setActiveGame(null); 
      setCurrentView('blog'); 
      updateUrl('blog');
  };

  const handleNavigateToTool = (toolId: string) => {
      let newView = `tool-${toolId}`;
      if (toolId === 'breath') newView = 'tool-breath';
      else if (toolId === 'focus') newView = 'tool-focus';
      else if (toolId === 'speed') newView = 'tool-speed'; 
      
      setCurrentView(newView);
      updateUrl(newView);
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

  // --- URL RECOVERY LOGIC (Runs only when games change) ---
  useEffect(() => {
    // Only try to restore game if we haven't done it yet, or if activeGame is null but url says we should be in game
    const params = new URLSearchParams(window.location.search);
    const gameIdParam = params.get('game');

    if (gameIdParam && games.length > 0 && !activeGame) {
        const foundGame = games.find(g => g.id.toString() === gameIdParam);
        if (foundGame) {
            setActiveGame(foundGame);
            setCurrentView('game');
        }
    }
  }, [games]); 

  // --- ROUTER LOGIC ---

  let content = null;

  if (currentView === 'tool-breath') {
      content = <BreathTrainerPage onBack={() => { setCurrentView('tools'); updateUrl('tools'); }} />;
  } else if (currentView === 'tool-focus') {
      content = <FocusTimerPage onBack={() => { setCurrentView('tools'); updateUrl('tools'); }} />;
  } else if (currentView === 'tool-speed') {
      content = <SpeedTestPage onBack={() => { setCurrentView('tools'); updateUrl('tools'); }} />;
  } else if (currentView.startsWith('tool-')) {
      const toolId = currentView.replace('tool-', '');
      let innerContent = <div className="text-center text-white">Tool under construction 🚧</div>;
      let title = "Tool";

      if (toolId === 'reaction') { title = "Reaction Test"; innerContent = <ReactionGame />; }
      else if (toolId === 'cps') { title = "CPS Test"; innerContent = <CpsTest />; }
      else if (toolId === 'sys-info') { title = "System Info"; innerContent = <SystemInfoTool />; }
      else if (toolId === 'password-gen') { title = "Password Gen"; innerContent = <PasswordGenTool />; }

      content = <GenericToolPage title={title} onBack={() => { setCurrentView('tools'); updateUrl('tools'); }}>{innerContent}</GenericToolPage>;
  } else if (currentView === 'game' && activeGame) {
      const related = games.filter(g => g.category === activeGame.category && g.id !== activeGame.id);
      const safeActiveGame = activeGame as unknown as any; 
      const safeRelated = related as any;

      content = (
        <>
          <GamePlay 
              game={safeActiveGame} 
              relatedGames={safeRelated} 
              onBack={handleHomeClick}
              onPlayGame={handleGameClick}
              isFavorite={favoriteGames.some(f => f.id === activeGame.id)}
              onToggleFavorite={() => toggleGameFavorite(activeGame)}
          />
          <ToolsModal isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
          <button className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center position-fixed" style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }} onClick={() => setIsToolsOpen(true)} title="Game Tools"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></button>
          <FavoritesSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} favoriteGames={favoriteGames} favoriteTools={favoriteTools} onPlayGame={handleGameClick} onLaunchTool={(toolId: string) => handleNavigateToTool(toolId)} onRemoveGameFavorite={toggleGameFavorite} onRemoveToolFavorite={toggleToolFavorite} />
        </>
      );
  } else {
      // Default: Home Grid or Blog or Tools List
      content = (
        <div className="d-flex flex-column min-vh-100 w-100 position-relative overflow-x-hidden">
          <Header onSearch={setSearchTerm} onHome={handleHomeClick} onTools={handleToolsClick} onBlog={handleBlogClick} onOpenSidebar={() => setIsSidebarOpen(true)} favoritesCount={favoriteGames.length + favoriteTools.length} />
          <FavoritesSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} favoriteGames={favoriteGames} favoriteTools={favoriteTools} onPlayGame={handleGameClick} onLaunchTool={(toolId: string) => handleNavigateToTool(toolId)} onRemoveGameFavorite={toggleGameFavorite} onRemoveToolFavorite={toggleToolFavorite} />
          
          {currentView === 'home' && (
            <div className="sticky-top" style={{ top: '0px', zIndex: 1020 }}>
              <CategoryBar categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            </div>
          )}

          <main className="flex-grow-1 container-fluid px-4 py-4 d-flex flex-column">
            {currentView === 'tools' ? (
              <ToolsPage favoriteTools={favoriteTools} onToggleFavorite={toggleToolFavorite} onNavigateToTool={handleNavigateToTool} />
            ) : currentView === 'blog' ? (
              <BlogPage />
            ) : (
              loading ? (
                <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1" style={{ minHeight: '50vh' }}>
                  <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                  <p className="fs-3 text-white animate-pulse">Loading Arcade...</p>
                </div>
              ) : error ? (
                 <div className="d-flex flex-column align-items-center justify-content-center text-center flex-grow-1" style={{ minHeight: '50vh' }}>
                  <div className="alert alert-danger d-inline-block" role="alert"><h4 className="alert-heading">Oops! Something went wrong.</h4><p>{error}</p></div>
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
                        <GameCard key={`${game.id}-${index}`} game={game} onClick={handleGameClick} isFavorite={favoriteGames.some(f => f.id === game.id)} onToggleFavorite={toggleGameFavorite} />
                      ))}
                  </div>
                  {hasMore && filteredGames.length > 0 && !searchTerm && !selectedCategory && (
                      <div className="text-center mt-5">
                          <button className="btn btn-custom btn-lg px-5 rounded-pill fs-4" onClick={handleLoadMore} disabled={loadingMore}>
                              {loadingMore ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...</>) : "Load More Games"}
                          </button>
                      </div>
                  )}
                </>
              )
            )}
          </main>
          <Footer />
          <button className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center position-fixed" style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }} onClick={() => setIsToolsOpen(true)} title="Game Tools"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></button>
          <ToolsModal isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
        </div>
      );
  }
  
  return content;
}

export default App;