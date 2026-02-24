import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { getPublicReviews } from "../../../api/api";

const fallbackReviews = [
  { id: "s1", comment: "EasyPG made finding a PG effortless.", userRole: "student", rating: 5 },
  { id: "s2", comment: "Great platform for owners.", userRole: "owner", rating: 4 },
  { id: "s3", comment: "Smooth booking flow and transparent pricing.", userRole: "tenant", rating: 5 },
  { id: "s4", comment: "Helpful support and quick responses.", userRole: "tenant", rating: 4 },
  { id: "s5", comment: "Rooms were exactly as described.", userRole: "student", rating: 5 },
  { id: "s6", comment: "Owner was cooperative during move-in.", userRole: "owner", rating: 4 },
  { id: "s7", comment: "Great value for money. Recommended!", userRole: "working-professional", rating: 5 },
  { id: "s8", comment: "Booking process was fast and clear.", userRole: "tenant", rating: 4 },
];

const HomeReviews = () => {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(320); // sensible default for measurement fallback
  const [currentSlide, setCurrentSlide] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [cardHeight, setCardHeight] = useState(220);
  const touchStartY = useRef(null);

  // shared measurement function used for centering and responsiveness
  const measure = () => {
    const cw = containerRef.current?.clientWidth || window.innerWidth || 0;
    if (cw) setContainerWidth(cw);

    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // Mobile: make card exactly half-screen minus padding so two cards visible (vertical stack)
    if (mobile) {
      const mobileWidth = Math.max(100, Math.floor(window.innerWidth / 2) - 20);
      setCardWidth(mobileWidth);
      // compute cardHeight so two cards fit vertically in viewport (approx)
      const computedHeight = Math.max(160, Math.floor((window.innerHeight - 160) / 2));
      setCardHeight(computedHeight);
      return;
    }

    const firstCard = trackRef.current?.querySelector('.review-card');
    if (firstCard) {
      const rect = firstCard.getBoundingClientRect();
      if (rect.width && rect.width > 0) setCardWidth(rect.width);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      try {
        const res = await getPublicReviews();
        if (mounted && res?.data?.success && Array.isArray(res.data.data) && res.data.data.length) {
          setReviews(res.data.data);
        } else if (mounted) {
          setReviews(fallbackReviews);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (mounted) setReviews(fallbackReviews);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchReviews();

    // initial measurement and observer
    setTimeout(measure, 80);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);

    return () => { mounted = false; window.removeEventListener('resize', measure); if (ro) ro.disconnect(); };
  }, []);

  // re-measure when reviews or loading state changes
  useEffect(() => {
    setTimeout(measure, 80);
  }, [loading, reviews]);

  // Auto-advance slide index
  useEffect(() => {
    if (paused) return;
    const visibleCount = (loading ? fallbackReviews : reviews).length || 0;
    if (visibleCount === 0) return;
    const id = setInterval(() => {
      setCurrentSlide((s) => {
        const next = s + 1;
        return next >= visibleCount ? 0 : next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [paused, loading, reviews]);

  // debug log to help diagnose rendering/measurement issues
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[HomeReviews] cardWidth, currentSlide, reviewsCount ->', cardWidth, currentSlide, (loading ? fallbackReviews : reviews).length);
  }, [cardWidth, currentSlide, loading, reviews]);

  return (
    <section className="py-6 px-6 bg-white snap-start">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-4">
          <h2 className="  text-black mb-3">What Our <span className="text-primary">Users</span> Say</h2>
          <p className="text-textSecondary  max-w-2xl">
            Real feedback from PG owners and tenants who use EasyPG Manager daily.
          </p>
        </div>

        <div className="relative ">
          <div
            ref={containerRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={(e) => { if (isMobile) touchStartY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => {
              if (!isMobile || touchStartY.current == null) return;
              const endY = e.changedTouches[0].clientY;
              const delta = touchStartY.current - endY;
              const threshold = 30;
              const visibleCount = (loading ? fallbackReviews : reviews).length || 0;
              if (delta > threshold) {
                setCurrentSlide((s) => (s + 1) % visibleCount);
              } else if (delta < -threshold) {
                setCurrentSlide((s) => (s - 1 + visibleCount) % visibleCount);
              }
              touchStartY.current = null;
            }}
            className="overflow-hidden py-10 px-2"
            style={isMobile ? { height: `${cardHeight * 2 + 12}px` } : undefined}
          >
            <motion.div
              ref={trackRef}
              className={isMobile ? 'flex flex-col gap-3 items-stretch' : 'flex gap-6 items-stretch'}
              // ensure center card overflow is visible when scaled
              style={{ overflow: 'visible' }}
              animate={(() => {
                const gap = isMobile ? 12 : 24; // smaller gap on mobile
                if (isMobile) {
                  // vertical stacked: move by one card height + gap
                  return { y: -(currentSlide * (cardHeight + gap)) };
                }
                // horizontal centering formula for larger screens
                return { x: -(currentSlide * (cardWidth + gap)) + (containerWidth / 2) - (cardWidth / 2) };
              })()}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
            {(() => {
              const visible = (loading ? fallbackReviews : reviews) || [];
              const display = visible.length > 0 ? [...visible, ...visible] : visible;
              return display.map((review, i) => {
              const modIndex = visible.length ? i % visible.length : i;
              const isCenter = modIndex === currentSlide;
              return (
              <motion.article
                key={`review-${i}`}
                className="review-card snap-start w-[260px] sm:w-[300px] md:w-[340px] lg:w-[360px] min-w-[260px] sm:min-w-[300px] md:min-w-[340px] lg:min-w-[360px] bg-primarySoft/10 border rounded-2xl p-6 flex-shrink-0 shadow-sm flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: isCenter ? 1 : 0.6 }}
                transition={{ duration: 0.45 }}
                style={{
                  borderColor: isCenter ? '#B45309' : '#E5E0D9',
                  width: isMobile ? '100%' : undefined,
                  minHeight: isMobile ? `${cardHeight}px` : '260px',
                  height: isMobile ? `${cardHeight}px` : '260px',
                }}
              >
              <div className="relative flex h-full flex-col">
                <div className="absolute -top-3 -right-3 text-primarySoft opacity-70">
                  <Quote size={34} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, idx) => {
                    const selected = idx < Number(review?.rating || 0);
                    return (
                      <Star
                        key={idx}
                        size={14}
                        className={selected ? "text-primary" : "text-gray-300"}
                        fill={selected ? "currentColor" : "none"}
                      />
                    );
                  })}
                </div>

                <p
                  className="text-textSecondary italic text-body-sm leading-relaxed mb-5 overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  “{review.comment}”
                </p>

                <div className="mt-auto flex items-center gap-3">
                  <div className="w-10 h-10 bg-primarySoft rounded-full flex items-center justify-center text-primaryDark font-bold">
                    {(review.userRole || 'U')?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-textPrimary capitalize text-sm">{(review.userRole || 'User').replace('-', ' ')}</p>
                    <p className="text-xs text-textSecondary mt-1 opacity-70">Verified User</p>
                  </div>
                </div>
              </div>
            </motion.article>
              );
            });
            })()}
            </motion.div>
          </div>

          {/* Arrows */}
          {!isMobile && (
            <>
              <button
                aria-label="Previous review"
                onClick={() => {
                  const visibleCount = (loading ? fallbackReviews : reviews).length || 0;
                  if (visibleCount === 0) return;
                  setPaused(true);
                  setCurrentSlide((s) => (s - 1 + visibleCount) % visibleCount);
                  setTimeout(() => setPaused(false), 1500);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-md border border-border flex items-center justify-center"
              >
                <span className="text-primary text-lg leading-none">←</span>
              </button>

              <button
                aria-label="Next review"
                onClick={() => {
                  const visibleCount = (loading ? fallbackReviews : reviews).length || 0;
                  if (visibleCount === 0) return;
                  setPaused(true);
                  setCurrentSlide((s) => (s + 1) % visibleCount);
                  setTimeout(() => setPaused(false), 1500);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-md border border-border flex items-center justify-center"
              >
                <span className="text-primary text-lg leading-none">→</span>
              </button>
            </>
          )}
        </div>

        {/* Pagination dots (mobile/tablet) */}
        {isMobile && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {Array.from({ length: (loading ? fallbackReviews : reviews).length || 0 }).map((_, idx) => (
              <button
                key={`dot-${idx}`}
                aria-label={`Go to review ${idx + 1}`}
                onClick={() => {
                  const visibleCount = (loading ? fallbackReviews : reviews).length || 0;
                  if (visibleCount === 0) return;
                  setPaused(true);
                  setCurrentSlide(idx);
                  setTimeout(() => setPaused(false), 1500);
                }}
                className={
                  idx === currentSlide
                    ? "w-2.5 h-2.5 rounded-full bg-primary"
                    : "w-2.5 h-2.5 rounded-full bg-primarySoft border border-border"
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeReviews;
