import React, { useRef } from "react";
import ListingCard from "../../../components/listingCard";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function PGListings({ list = [] }) {
  const containerRef = useRef(null);

  if (!list.length)
    return <p className="text-center text-lg mt-6">No PGs found</p>;

  // Scroll left
  const scrollLeft = () => {
    containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  // Scroll right
  const scrollRight = () => {
    containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="relative mt-24">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">
        Available PGs
      </h2>

      {/* Carousel Arrows */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-amber-50 transition"
      >
        <FaChevronLeft size={20} className="text-amber-600" />
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-amber-50 transition"
      >
        <FaChevronRight size={20} className="text-amber-600" />
      </button>

      {/* Horizontal scroll container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-12"
        style={{ scrollbarWidth: "none" }}
      >
        {list.map((pg) => (
          <Link
            key={pg.id}
            to={`/pg/${pg.id}`}
            className="flex-shrink-0 hover:scale-[1.03] transition transform"
          >
            <ListingCard {...pg} />
          </Link>
        ))}
      </div>
    </div>
  );
}
