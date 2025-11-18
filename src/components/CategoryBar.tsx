import React, { useRef } from 'react';

// Arrow Icons
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);

interface CategoryBarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 200; // Adjust scroll distance as needed
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="border-bottom border-playhub py-3 sticky-top z-2" style={{ backgroundColor: 'rgba(0,0,0,0.95)', top: '76px' }}>
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center position-relative">
          
          {/* Left Arrow Button */}
          <button 
            className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm border border-secondary me-2" 
            onClick={() => scroll('left')}
            style={{ width: '40px', height: '40px', zIndex: 10 }}
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="d-flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide pb-1 flex-grow-1" 
            style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
          >
            <button 
              onClick={() => onSelectCategory(null)}
              className={`btn btn-lg text-nowrap flex-shrink-0 ${selectedCategory === null ? 'btn-light text-dark fw-bold' : 'btn-outline-custom'}`}
            >
              All Games
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`btn btn-lg text-nowrap flex-shrink-0 ${selectedCategory === cat ? 'btn-light text-dark fw-bold' : 'btn-outline-custom'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button 
            className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm border border-secondary ms-2" 
            onClick={() => scroll('right')}
            style={{ width: '40px', height: '40px', zIndex: 10 }}
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>

        </div>
      </div>
    </div>
  );
};

export default CategoryBar;