import React, { useRef, useEffect, useContext } from "react";
import ListingCard from "../../../components/listingCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CButton from "../../../components/cButton";
import { useNavigate } from "react-router-dom";
import { BackendContext } from "../../../context/backendContext";

export default function PGListings() {
  const { pgList } = useContext(BackendContext);
  const navigate = useNavigate();

  const list = pgList.length ? [...pgList, ...pgList] : [];

  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);

  const SPEED = 0.4; // 👈 control speed here

  /* ============ TRUE INFINITE AUTO SCROLL ============ */
  const animate = () => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const halfWidth = track.scrollWidth / 2;

    positionRef.current += SPEED;

    if (positionRef.current >= halfWidth) {
      positionRef.current = 0;
    }

    track.style.transform = `translateX(-${positionRef.current}px)`;
    animationRef.current = requestAnimationFrame(animate);
  };

  const startAutoScroll = () => {
    if (!animationRef.current) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const stopAutoScroll = () => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [pgList]);

  /* ============ ARROW CONTROLS ============ */
  const scrollLeft = () => {
    positionRef.current -= 300;
  };

  const scrollRight = () => {
    positionRef.current += 300;
  };

  const handleNavigate = (id) => {
    navigate(`/pg/${id}`);
  };

  return (
    <div className="relative mt-24 overflow-hidden">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">
        Available PGs
      </h2>

      {/* LEFT ARROW */}
      <button
        onClick={scrollLeft}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow"
      >
        <FaChevronLeft size={20} className="text-amber-600" />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={scrollRight}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow"
      >
        <FaChevronRight size={20} className="text-amber-600" />
      </button>

      {/* VIEWPORT */}
      <div
        className="overflow-hidden px-12"
        onMouseEnter={stopAutoScroll}
        onMouseLeave={startAutoScroll}
      >
        {/* TRACK */}
        <div
          ref={trackRef}
          className="flex gap-6 will-change-transform"
        >
          {list.map((pg, idx) => (
            <div
              key={`${pg._id}-${idx}`}
              onClick={() => handleNavigate(pg._id)}
              className="flex-shrink-0 cursor-pointer hover:scale-[1.03] transition-transform"
            >
              <ListingCard {...pg} image={pg.mainImage}>
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
          ))}
        </div>
      </div>
    </div>
  );
}
