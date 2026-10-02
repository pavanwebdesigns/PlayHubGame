import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryBar from './components/CategoryBar';
import GamePlay from './components/GamePlay';
import ToolsModal from './components/ToolsModal';
import ToolsPage from './components/ToolsPage';
import type { GamePixGame } from './types';
import { COVER_PLACEHOLDER, coverSrc, gamepixSrcSet } from './lib/image';
import { gameFromSlug } from './lib/gameLink';
import { findTool, isToolReady, toolCategories, tools } from './tools/registry';
import './App.css';

function readStoredGames(raw: string): GamePixGame[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const game = item as Record<string, unknown>;
    if (game.id == null || typeof game.title !== 'string' || game.title.length === 0) return [];
    const orientation = game.orientation;
    return [{
      id: String(game.id),
      title: game.title,
      namespace: typeof game.namespace === 'string' ? game.namespace : '',
      description: typeof game.description === 'string' ? game.description : '',
      category: typeof game.category === 'string' ? game.category : '',
      orientation: orientation === 'landscape' || orientation === 'portrait' || orientation === 'all' ? orientation : 'all',
      quality_score: typeof game.quality_score === 'number' ? game.quality_score : 0,
      width: typeof game.width === 'number' ? game.width : 0,
      height: typeof game.height === 'number' ? game.height : 0,
      date_published: typeof game.date_published === 'string' ? game.date_published : '',
      date_modified: typeof game.date_modified === 'string' ? game.date_modified : '',
      banner_image: typeof game.banner_image === 'string' ? game.banner_image : '',
      image: typeof game.image === 'string' ? game.image : '',
      url: typeof game.url === 'string' ? game.url : '',
    }];
  });
}

function readFeedGames(json: unknown): GamePixGame[] {
  let list: unknown = [];
  if (Array.isArray(json)) list = json;
  else if (json && typeof json === 'object') {
    const record = json as Record<string, unknown>;
    if (Array.isArray(record.data)) list = record.data;
    else if (Array.isArray(record.items)) list = record.items;
    else if (Array.isArray(record.games)) list = record.games;
    else if (record.id != null && typeof record.title === 'string') list = [record];
  }
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => readStoredGames(JSON.stringify([item])));
}

function mergeGames(current: GamePixGame[], incoming: GamePixGame[], replace: boolean): GamePixGame[] {
  const combined = replace ? incoming : [...current, ...incoming];
  const seen = new Set<string>();
  const unique: GamePixGame[] = [];
  for (const game of combined) {
    if (seen.has(game.id)) continue;
    seen.add(game.id);
    unique.push(game);
  }
  return unique;
}

const FEED_PAGE = 'https://feeds.gamepix.com/v2/json?sid=LC991&pagination=96&page=';
const MAX_GAME_LOOKUP_PAGES = 20;

async function loadFeedPage(pageNumber: number): Promise<GamePixGame[]> {
  const response = await fetch(`${FEED_PAGE}${pageNumber}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return readFeedGames(await response.json());
}

function findListedGame(gameList: GamePixGame[], gameId: string | null, slug: string | null): GamePixGame | undefined {
  return gameList.find((game) =>
    (gameId != null && gameId.length > 0 && game.id === gameId) ||
    (slug != null && slug.length > 0 && game.namespace === slug),
  );
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
const TILE_SIZES = '(min-width: 1200px) 16vw, (min-width: 992px) 25vw, (min-width: 768px) 33vw, 50vw';

const GameCard = ({
  game,
  onClick,
  isFavorite,
  onToggleFavorite,
  imageIndex,
}: {
  game: GamePixGame;
  onClick: (game: GamePixGame) => void;
  isFavorite: boolean;
  onToggleFavorite: (game: GamePixGame) => void;
  imageIndex: number;
}) => {
  const rawCover = game.banner_image || game.image;
  const imageSrc = coverSrc(rawCover, 320);
  const imageSrcSet = rawCover && imageSrc !== COVER_PLACEHOLDER ? gamepixSrcSet(rawCover, [320, 480, 640]) : undefined;

  return (
    <div className="col-6 col-md-4 col-lg-3 col-xl-2 mb-4 position-relative group">
      <div
        className="cursor-pointer text-decoration-none h-100"
        onClick={() => onClick(game)}
        style={{ cursor: 'pointer' }}
      >
        <div className="card game-card h-100 border-0 shadow-sm bg-transparent">
          <div className="position-relative w-100 rounded-4 overflow-hidden shadow-sm border border-white border-opacity-10" style={{ aspectRatio: '16/9', backgroundColor: '#2a2a2a' }}>
            <img
              src={imageSrc}
              srcSet={imageSrcSet}
              sizes={imageSrcSet ? TILE_SIZES : undefined}
              alt={game.title}
              width={320}
              height={180}
              className="w-100 h-100 object-fit-cover transition-transform duration-500 group-hover:scale-110"
              loading={imageIndex < 6 ? 'eager' : 'lazy'}
              fetchPriority={imageIndex === 0 ? 'high' : 'auto'}
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.dataset.failed === 'placeholder') return;
                const icon = game.image ? coverSrc(game.image, 320) : COVER_PLACEHOLDER;
                if (target.dataset.failed !== 'icon' && icon !== COVER_PLACEHOLDER && target.src !== icon) {
                  target.dataset.failed = 'icon';
                  target.srcset = '';
                  target.src = icon;
                  return;
                }
                target.dataset.failed = 'placeholder';
                target.srcset = '';
                target.src = COVER_PLACEHOLDER;
              }}
            />
            <span className="position-absolute top-0 end-0 m-2 badge bg-black bg-opacity-75 text-uppercase rounded-pill border border-white border-opacity-10" style={{ fontSize: '0.6rem', letterSpacing: '0.5px', backdropFilter: 'blur(4px)' }}>
              {game.category}
            </span>
          </div>
          <div className="mt-2 text-center">
            <h5 className="text-white text-truncate mb-0 fw-bold px-1 group-hover:text-primary transition-colors" style={{ fontSize: '1rem', letterSpacing: '0.3px' }}>
              {game.title}
            </h5>
          </div>
        </div>
      </div>

      <button
        className="btn position-absolute top-0 start-0 m-2 p-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-transform hover-scale active:scale-90"
        style={{
          zIndex: 20,
          backgroundColor: isFavorite ? '#ef4444' : 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          width: '32px',
          height: '32px',
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
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isFavorite ? "white" : "none"}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
  );
};

// Sidebar
const FavoritesSidebar = ({
  isOpen,
  onClose,
  favoriteGames,
  favoriteTools,
  onPlayGame,
  onLaunchTool,
  onRemoveGameFavorite,
  onRemoveToolFavorite,
}: {
  isOpen: boolean;
  onClose: () => void;
  favoriteGames: GamePixGame[];
  favoriteTools: Tool[];
  onPlayGame: (game: GamePixGame) => void;
  onLaunchTool: (toolId: string) => void;
  onRemoveGameFavorite: (game: GamePixGame) => void;
  onRemoveToolFavorite: (tool: Tool) => void;
}) => {
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
              {favoriteGames.map((game) => {
                const imageSrc = coverSrc(game.banner_image || game.image, 105);

                return (
                  <div key={game.id} className="d-flex align-items-center gap-3 bg-black bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-10 group">
                    <img
                      src={imageSrc}
                      alt={game.title}
                      width={50}
                      height={50}
                      decoding="async"
                      className="rounded-2"
                      style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => { onPlayGame(game); onClose(); }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.dataset.failed === 'placeholder') return;
                        target.dataset.failed = 'placeholder';
                        target.src = COVER_PLACEHOLDER;
                      }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <h6 className="text-white mb-0 text-truncate cursor-pointer small" onClick={() => { onPlayGame(game); onClose(); }}>{game.title}</h6>
                    </div>
                    <button className="btn btn-sm btn-link text-white-50 hover-text-danger p-1" onClick={(e) => { e.stopPropagation(); onRemoveGameFavorite(game); }}>X</button>
                  </div>
                )
              })}
            </div>
          )}
          <hr className="border-secondary border-opacity-25 my-4" />
          <h6 className="text-white-50 text-uppercase small mb-3 fw-bold">Tools ({favoriteTools.length})</h6>
          {favoriteTools.length === 0 ? <p className="text-white-50 small">No favorite tools.</p> : (
            <div className="d-flex flex-column gap-3">
              {favoriteTools.map((tool) => (
                <div key={tool.id} className="d-flex align-items-center gap-3 bg-black bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-10 group">
                  <div className="rounded-2 bg-dark d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>{tool.icon}</div>
                  <div className="flex-grow-1 overflow-hidden">
                    <h6 className="text-white mb-0 text-truncate cursor-pointer small" onClick={() => { if (tool.isReady) { onLaunchTool(tool.id); onClose(); } }}>{tool.title}</h6>
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
  const [gameLookup, setGameLookup] = useState<'ready' | 'loading' | 'missing'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'game' ? 'loading' : 'ready';
  });
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const gamesRef = useRef(games);
  gamesRef.current = games;
  const idLookupFor = useRef<string | null>(null);
  const lookupToken = useRef(0);

  // Load favorites
  useEffect(() => {
    try {
      const storedGameFavs = localStorage.getItem('playhub_favorites');
      if (storedGameFavs) setFavoriteGames(readStoredGames(storedGameFavs));
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
    try {
      const newGames = await loadFeedPage(pageNumber);
      if (newGames.length > 0) {
        setGames(prev => mergeGames(prev, newGames, false));
        setPage(current => Math.max(current, pageNumber));
      } else {
        setHasMore(false);
        if (isFirstLoad) throw new Error("No games found.");
      }
    } catch (err: unknown) {
      console.error("Fetch Error:", err);
      if (isFirstLoad) setError("Failed to load games. Please check connection.");
    } finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => { fetchGames(1); }, []);
  const handleLoadMore = () => { const nextPage = page + 1; setPage(nextPage); fetchGames(nextPage); };

  // --- UPDATED NAVIGATION HANDLERS ---
  const updateUrl = (view: string, game?: Pick<GamePixGame, 'id' | 'namespace'>) => {
    const params = new URLSearchParams(window.location.search);
    if (view === 'home') {
      params.delete('page');
      params.delete('game');
      params.delete('slug');
    } else {
      params.set('page', view);
      if (game) {
        params.set('game', game.id);
        if (game.namespace) params.set('slug', game.namespace);
        else params.delete('slug');
      } else {
        params.delete('game');
        params.delete('slug');
      }
    }
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    window.history.pushState(view === 'game' ? { fromGrid: true } : {}, '', next);
  };

  const handleGameClick = (game: GamePixGame) => {
    if (currentView !== 'game') {
      const previous = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
      window.history.replaceState({ ...previous, scrollY: window.scrollY }, '', window.location.href);
    }
    idLookupFor.current = null;
    setActiveGame(game);
    setGameLookup('ready');
    setCurrentView('game');
    updateUrl('game', game);
  };

  const handleGameBack = () => {
    const state = window.history.state as { fromGrid?: boolean } | null;
    if (state?.fromGrid) {
      window.history.back();
      return;
    }
    handleHomeClick();
  };

  const searchInstead = () => {
    handleHomeClick();
    window.setTimeout(() => document.getElementById('site-search')?.focus(), 0);
  };

  const cancelGameLookup = () => {
    lookupToken.current += 1;
    idLookupFor.current = null;
  };

  const handleHomeClick = () => {
    cancelGameLookup();
    setActiveGame(null);
    setGameLookup('ready');
    setCurrentView('home');
    updateUrl('home');
  };

  const handleToolsClick = () => {
    cancelGameLookup();
    setActiveGame(null);
    setGameLookup('ready');
    setCurrentView('tools');
    updateUrl('tools');
  };

  const handleBlogClick = () => {
    cancelGameLookup();
    setActiveGame(null);
    setGameLookup('ready');
    setCurrentView('blog');
    updateUrl('blog');
  };

  const handleNavigateToTool = (toolId: string) => {
    setCurrentView(`tool-${toolId}`);
    updateUrl(`tool-${toolId}`);
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

  const resolveGameFromUrl = (gameList: GamePixGame[]) => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('page') || 'home';
    const gameId = params.get('game');
    const slug = params.get('slug');

    if (view !== 'game') {
      lookupToken.current += 1;
      idLookupFor.current = null;
      setCurrentView(view);
      setActiveGame(null);
      setGameLookup('ready');
      return;
    }

    setCurrentView('game');
    const found = findListedGame(gameList, gameId, slug);
    if (found) {
      setActiveGame(found);
      setGameLookup('ready');
      return;
    }
    if (slug) {
      setActiveGame((current) => current?.namespace === slug ? current : gameFromSlug(gameId && gameId.length > 0 ? gameId : slug, slug));
      setGameLookup('ready');
      return;
    }
    if (!gameId) {
      setActiveGame(null);
      setGameLookup('missing');
      return;
    }
    if (idLookupFor.current === gameId) return;

    idLookupFor.current = gameId;
    const token = lookupToken.current + 1;
    lookupToken.current = token;
    setActiveGame(null);
    setGameLookup('loading');
    void (async () => {
      for (let pageNumber = 1; pageNumber <= MAX_GAME_LOOKUP_PAGES; pageNumber += 1) {
        let pageGames: GamePixGame[] = [];
        try {
          pageGames = await loadFeedPage(pageNumber);
        } catch {
          break;
        }
        if (lookupToken.current !== token) return;
        if (pageGames.length === 0) break;
        setGames((prev) => mergeGames(prev, pageGames, false));
        setPage((current) => Math.max(current, pageNumber));
        const hit = pageGames.find((game) => game.id === gameId);
        if (hit) {
          setActiveGame(hit);
          setGameLookup('ready');
          return;
        }
      }
      if (lookupToken.current !== token) return;
      setActiveGame(null);
      setGameLookup('missing');
    })();
  };

  const pendingScroll = useRef<number | null>(null);

  const resolveRef = useRef(resolveGameFromUrl);
  resolveRef.current = resolveGameFromUrl;

  useEffect(() => {
    resolveGameFromUrl(games);
  }, [games]);

  useEffect(() => {
    if (currentView === 'game') return;
    const y = pendingScroll.current;
    if (typeof y !== 'number') return;
    pendingScroll.current = null;
    const restore = () => window.scrollTo(0, y);
    restore();
    requestAnimationFrame(restore);
    window.setTimeout(restore, 50);
    window.setTimeout(restore, 300);
  }, [currentView, games]);

  useEffect(() => {
    const onPopState = () => {
      const state = window.history.state as { scrollY?: number } | null;
      const view = new URLSearchParams(window.location.search).get('page') || 'home';
      if (view !== 'game' && typeof state?.scrollY === 'number') pendingScroll.current = state.scrollY;
      resolveRef.current(gamesRef.current);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);


  // --- ROUTER LOGIC ---

  const visibleFavoriteTools = favoriteTools.filter((tool) => {
    const entry = findTool(tool.id);
    return entry != null && isToolReady(entry);
  });
  const visibleCategories = toolCategories.filter((category) =>
    tools.some((tool) => tool.category === category.id && isToolReady(tool)),
  );
  const requestedToolId = currentView.startsWith('tool-') ? currentView.slice('tool-'.length) : '';
  const requestedTool = requestedToolId ? findTool(requestedToolId) : undefined;
  const toolUnavailable = requestedToolId.length > 0 && !(requestedTool && isToolReady(requestedTool));

  let content = null;

  if (requestedTool?.component) {
    const ToolPage = requestedTool.component;
    content = <ToolPage onBack={() => { setCurrentView('tools'); updateUrl('tools'); }} />;
  } else if (currentView === 'game' && activeGame && gameLookup === 'ready') {
    const related = activeGame.category
      ? games.filter(g => g.category === activeGame.category && g.id !== activeGame.id)
      : [];

    content = (
      <>
        <GamePlay
          game={activeGame}
          relatedGames={related}
          onBack={handleGameBack}
          onPlayGame={handleGameClick}
          isFavorite={favoriteGames.some(f => f.id === activeGame.id)}
          onToggleFavorite={() => toggleGameFavorite(activeGame)}
          onTools={handleToolsClick}
          onBlog={handleBlogClick}
          onOpenFavorites={() => setIsSidebarOpen(true)}
          favoritesCount={favoriteGames.length + visibleFavoriteTools.length}
        />
        <ToolsModal isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
        <button className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center position-fixed" style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }} onClick={() => setIsToolsOpen(true)} title="Game Tools"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg></button>
        <FavoritesSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} favoriteGames={favoriteGames} favoriteTools={visibleFavoriteTools} onPlayGame={handleGameClick} onLaunchTool={(toolId: string) => handleNavigateToTool(toolId)} onRemoveGameFavorite={toggleGameFavorite} onRemoveToolFavorite={toggleToolFavorite} />
      </>
    );
  } else if (currentView === 'game') {
    content = (
      <div className="d-flex flex-column min-vh-100 w-100 bg-black">
        <Header onSearch={setSearchTerm} onHome={handleHomeClick} onTools={handleToolsClick} onBlog={handleBlogClick} onOpenSidebar={() => setIsSidebarOpen(true)} favoritesCount={favoriteGames.length + visibleFavoriteTools.length} />
        <main className="container py-5 text-white">
          {gameLookup === 'missing' ? (
            <>
              <h1 className="h2">Game not found — search instead</h1>
              <p className="text-white-50">That link doesn't match a game we can open.</p>
              <button type="button" className="btn btn-custom" onClick={searchInstead}>Search instead</button>
            </>
          ) : (
            <div className="d-flex align-items-center gap-3" role="status">
              <div className="spinner-border text-primary" aria-hidden="true"></div>
              <p className="mb-0">Looking for this game...</p>
            </div>
          )}
        </main>
      </div>
    );
  } else {
    // Default: Home Grid or Blog or Tools List
    content = (
      <div className="d-flex flex-column min-vh-100 w-100 position-relative overflow-x-hidden pt-4">
        <Header onSearch={setSearchTerm} onHome={handleHomeClick} onTools={handleToolsClick} onBlog={handleBlogClick} onOpenSidebar={() => setIsSidebarOpen(true)} favoritesCount={favoriteGames.length + visibleFavoriteTools.length} />
        <FavoritesSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} favoriteGames={favoriteGames} favoriteTools={visibleFavoriteTools} onPlayGame={handleGameClick} onLaunchTool={(toolId: string) => handleNavigateToTool(toolId)} onRemoveGameFavorite={toggleGameFavorite} onRemoveToolFavorite={toggleToolFavorite} />

        {currentView === 'home' && (
          <div className="sticky-top" style={{ top: '0px', zIndex: 1020 }}>
            <CategoryBar categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </div>
        )}

        <main className="flex-grow-1 container-fluid px-4 py-4 d-flex flex-column">
          {currentView === 'tools' || toolUnavailable ? (
            <ToolsPage
              tools={tools}
              categories={visibleCategories}
              notice={toolUnavailable ? "That tool isn't available. Pick one from the list." : undefined}
              favoriteTools={visibleFavoriteTools}
              onToggleFavorite={toggleToolFavorite}
              onNavigateToTool={handleNavigateToTool}
            />
          ) : currentView === 'blog' ? (
            <BlogPage />
          ) : (
            // Home Grid
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
                    <GameCard key={`${game.id}-${index}`} game={game} imageIndex={index} onClick={handleGameClick} isFavorite={favoriteGames.some(f => f.id === game.id)} onToggleFavorite={toggleGameFavorite} />
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
        <button className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center position-fixed" style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', zIndex: 1050 }} onClick={() => setIsToolsOpen(true)} title="Game Tools"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg></button>
        <ToolsModal isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} />
      </div>
    );
  }

  return content;
}

export default App;