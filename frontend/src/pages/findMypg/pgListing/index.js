import React, { useRef, useEffect } from "react";
import ListingCard from "../../../components/listingCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CButton from "../../../components/cButton";
import { useNavigate } from "react-router-dom";

export default function PGListings({ list = [] }) {
  const containerRef = useRef(null);
  const scrollInterval = useRef(null);
  const navigate = useNavigate();

  // Infinite scroll by duplicating list
  const duplicatedList = [...list, ...list];

  useEffect(() => {
    const startAutoScroll = () => {
      scrollInterval.current = setInterval(() => {
        if (containerRef.current) {
          const { scrollLeft, scrollWidth } = containerRef.current;
          if (scrollLeft >= scrollWidth / 2) {
            containerRef.current.scrollLeft = 0;
          } else {
            containerRef.current.scrollLeft += 1;
          }
        }
      }, 10);
    };

    startAutoScroll();
    return () => clearInterval(scrollInterval.current);
  }, []);

  const handleMouseEnter = () => clearInterval(scrollInterval.current);

  const handleMouseLeave = () => {
    scrollInterval.current = setInterval(() => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth } = containerRef.current;
        if (scrollLeft >= scrollWidth / 2) {
          containerRef.current.scrollLeft = 0;
        } else {
          containerRef.current.scrollLeft += 1;
        }
      }
    }, 10);
  };

  if (!list.length)
    return <p className="text-center text-lg mt-6">No PGs found</p>;

  const scrollLeft = () => {
    containerRef.current.scrollLeft -= 300;
  };

  const scrollRight = () => {
    containerRef.current.scrollLeft += 300;
  };

  const handleNavigate = (id) => {
    navigate(`/pg/${id}`);
  };

  return (
    <div className="relative mt-24">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">
        Available PGs
      </h2>

      {/* Carousel Arrows */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full hover:bg-amber-50 transition"
      >
        <FaChevronLeft size={20} className="text-amber-600" />
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full hover:bg-amber-50 transition"
      >
        <FaChevronRight size={20} className="text-amber-600" />
      </button>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex gap-6 overflow-x-hidden scroll-smooth px-12"
        style={{ scrollbarWidth: "none" }}
      >
        {duplicatedList.map((pg, idx) => (
          <div
            key={`${pg.id}-${idx}`}
            onClick={() => handleNavigate(pg.id)}
            className="flex-shrink-0 cursor-pointer hover:scale-[1.03] transition transform"
          >
            <ListingCard {...pg}>
              <CButton
                text="View"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation(); // prevent double navigation
                  handleNavigate(pg.id);
                }}
              />
            </ListingCard>
          </div>
        ))}
      </div>
    </div>
  );
}
