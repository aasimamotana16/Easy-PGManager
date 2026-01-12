import React, { useRef, useEffect, useContext } from "react";
import ListingCard from "../../../components/listingCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CButton from "../../../components/cButton";
import { useNavigate } from "react-router-dom";
import { BackendContext } from "../../../context/backendContext"; // 2. Added Context Import

export default function PGListings({ list = [] }) {
  const { pgList } = useContext(BackendContext); // 3. Grab live data from Context

  //const activeList = pgList.length > 0 ? pgList : list;

  // To this:
  const activeList = pgList;

  // Change this line in PGListings/index.js:
  const duplicatedList = activeList.length > 5 ? [...activeList, ...activeList] : activeList;

  //const duplicatedList = [...activeList, ...activeList];

  const containerRef = useRef(null);
  const scrollInterval = useRef(null);
  const navigate = useNavigate();

  // Duplicate list for infinite feel


  /* ================= AUTO SCROLL ================= */
  const startAutoScroll = () => {
    scrollInterval.current = setInterval(() => {
      if (!containerRef.current) return;

      const { scrollLeft, scrollWidth } = containerRef.current;
      const halfWidth = scrollWidth / 2;

      if (scrollLeft >= halfWidth) {
        containerRef.current.scrollLeft += 1.5;
      } else {
        containerRef.current.scrollLeft += 3; 
      }
    }, 15);
  };

  const stopAutoScroll = () => clearInterval(scrollInterval.current);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [activeList]);

  /* ================= ARROW SCROLL ================= */
  const scrollLeft = () => {
    stopAutoScroll();
    containerRef.current.scrollBy({ left: -350, behavior: "smooth" });
  };

  const scrollRight = () => {
    stopAutoScroll();
    containerRef.current.scrollBy({ left: 350, behavior: "smooth" });
  };

  const handleNavigate = (id) => {
    // Navigating with the specific MongoDB _id
    navigate(`/pg/${id}`);
  };

  return (
    <div className="relative mt-24">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">
        Available PGs
      </h2>

      {/* LEFT ARROW */}
      <button
        onClick={scrollLeft}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow hover:bg-amber-50 transition"
      >
        <FaChevronLeft size={20} className="text-amber-600" />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={scrollRight}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow hover:bg-amber-50 transition"
      >
        <FaChevronRight size={20} className="text-amber-600" />
      </button>

      {/* SCROLL CONTAINER */}
      <div
        ref={containerRef}
        onMouseEnter={stopAutoScroll}
        onMouseLeave={startAutoScroll}
        className="flex gap-6 overflow-x-hidden scroll-smooth px-12"
      >
        {duplicatedList.length === 0 ? (
          <p className="text-center text-lg mt-6 w-full">No PGs found</p>
        ) : (
          duplicatedList.map((pg, idx) => (
            <div
              // Updated to use the unique _id from backend
              key={`${pg._id}-${idx}`} 
              onClick={() => handleNavigate(pg._id)}
              className="flex-shrink-0 cursor-pointer hover:scale-[1.03] transition-transform"
            >
              {/* Passing backend fields to the ListingCard [cite: 2026-01-11] */}
              <ListingCard 
                {...pg} 
                id={pg._id} 
                image={pg.mainImage} 
              >
                <CButton
                  text="View"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(pg._id); 
                  }}
                />
              </ListingCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}