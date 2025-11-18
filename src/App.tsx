import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryBar from './components/CategoryBar';
import './App.css';

// --- Types ---
interface GamePixGame {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailUrl100: string;
  banner_image?: string; // Added optional property
  bannerUrl?: string;   // Added optional property
  url: string;
  category: string;
  width: number;
  height: number;
  color: string;
}

// --- Game Card Component ---
const GameCard = ({ game }: { game: GamePixGame }) => {
  // Determine the best image source
  const imageSrc = game.banner_image || game.bannerUrl || game.thumbnailUrl || game.thumbnailUrl100;

  return (
    <div className="col-6 col-md-4 col-lg-3 col-xl-2 mb-4">
      <a href={game.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
        <div className="card game-card h-100 border-0 shadow-sm bg-transparent">
          
          {/* Image Container - Flexible Aspect Ratio */}
          {/* Change '16/9' to '1/1', '4/3', etc. as per your wish */}
          <div className="position-relative w-100 rounded-4 overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#2a2a2a' }}>
            <img 
              src={imageSrc} 
              alt={game.title}
              className="w-100 h-100 object-fit-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Check if we've already tried the fallback to avoid loops
                if (!target.getAttribute('data-failed')) {
                    target.setAttribute('data-failed', 'true');
                    // Try next available image or fallback to placeholder
                    if (imageSrc !== game.thumbnailUrl && game.thumbnailUrl) {
                         target.src = game.thumbnailUrl;
                    } else {
                         target.src = 'https://placehold.co/600x400/000E30/FFFFFF?text=No+Image';
                    }
                }
              }}
            />
            
            {/* Category Badge - Top Right */}
            <span className="position-absolute top-0 end-0 m-2 badge bg-black bg-opacity-75 text-uppercase rounded-pill" style={{ fontSize: '0.7rem', letterSpacing: '0.5px', backdropFilter: 'blur(2px)' }}>
              {game.category}
            </span>
          </div>
          
          {/* Title Below Image */}
          <div className="mt-2 text-center">
            <h5 className="text-white text-truncate mb-0 fw-bold px-1" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>
              {game.title}
            </h5>
          </div>

        </div>
      </a>
    </div>
  );
};

function App() {
  const [games, setGames] = useState<GamePixGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

      // Flexible parsing logic
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

      // Filter valid games
      newGames = newGames.filter(g => g && g.id && g.title);

      if (newGames.length > 0) {
          setGames(prev => isFirstLoad ? newGames : [...prev, ...newGames]);
      } else {
          setHasMore(false);
          if (isFirstLoad) throw new Error("No games found.");
      }

    } catch (err: any) {
      console.error("Fetch Error:", err);
      // Fallback proxy for first load only
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

  return (
    <div className="d-flex flex-column min-vh-100 w-100">
      <Header onSearch={setSearchTerm} />
      <CategoryBar 
        categories={categories} 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <main className="flex-grow-1 container-fluid px-4 py-5">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <p className="fs-3 text-white animate-pulse">Loading Arcade...</p>
          </div>
        ) : error ? (
           <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '50vh' }}>
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
                  <GameCard key={`${game.id}-${index}`} game={game} />
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
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;