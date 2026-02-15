import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BackendContext } from "../../context/backendContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import { motion, AnimatePresence } from "framer-motion"; // Added for animations
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";

/* ================= ANIMATION VARIANTS ================= */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } }
};

/* ================= CONSTANTS ================= */
const ruleIcons = {
  nosmoke: "🚭",
  nopet: "🐾",
  music: "🔕",
  clean: "🧹",
  noguest: "🙅‍♂️",
};

const placeholders = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb"
];

const PGDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pgList } = useContext(BackendContext);
  const isOwnerPreviewRoute = location.pathname.startsWith("/owner/dashboard/pg/");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ownerPgData, setOwnerPgData] = useState(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role"); 
  const storedUserName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editableName, setEditableName] = useState(storedUserName);
  
  // ERROR STATE FOR VALIDATION
  const [formError, setFormError] = useState("");

  const reviewsRef = useRef(null);
  const pgFromList = pgList?.find((item) => item._id === id);
  const pg = ownerPgData || pgFromList;
  const [propertyReviews, setPropertyReviews] = useState([]);
  const toImageUrl = (imgPath) =>
    imgPath && imgPath.startsWith("/uploads")
      ? `http://localhost:5000${imgPath}`
      : (imgPath && imgPath.startsWith("uploads/") ? `http://localhost:5000/${imgPath}` : imgPath);

  useEffect(() => {
    if (ownerPgData) {
      setLoading(false);
      return;
    }

    if (pgList && pgList.length > 0) {
      // For owner preview route, wait for owner-specific fetch if item is not in public pgList.
      if (isOwnerPreviewRoute && !pgFromList) return;
      setLoading(false);
    } else if (pgList && pgList.length === 0) {
      if (isOwnerPreviewRoute) return;
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [pgList, pgFromList, ownerPgData, isOwnerPreviewRoute]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id || !isOwnerPreviewRoute || pgFromList) return;
        const api = await import("../../api/api");
        const res = await api.getOwnerPgById(id);
        if (mounted && res?.data?.success) {
          setOwnerPgData(res.data.data || null);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load owner property details", err);
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, pgFromList, isOwnerPreviewRoute]);

  // Load property-specific reviews (must run before any early returns)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id) return;
        const api = await import("../../api/api");
        const res = await api.getReviewsByPg(id);
        if (mounted && res?.data?.success) setPropertyReviews(res.data.data || []);
      } catch (err) {
        console.error('Failed to load property reviews', err);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const rawGallery = [pg?.mainImage, ...(pg?.images || []), ...(pg?.roomImages || [])]
    .filter(Boolean)
    .map(toImageUrl);
  const gallery = rawGallery.length >= 4 ? rawGallery : [...rawGallery, ...placeholders.slice(0, 4 - rawGallery.length)];

  useEffect(() => {
    if (loading || gallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [loading, gallery.length]);

  if (loading) return <Loader />;
  if (!pg) return <NotFoundState />;

  const priceData = pg?.roomPrices || pg?.price || {};
  const displayStartingPrice = pg?.startingPrice || (Object.keys(priceData).length ? Math.min(...Object.values(priceData).map(Number)) : "5,000");
  
  const displayDeposit = pg?.securityDeposit || displayStartingPrice;


  const reviews = propertyReviews.length ? propertyReviews : [
    { user: "ABCD", rating: 5, comment: "Clean rooms and very safe environment." },
    { user: "XYZ", rating: 4, comment: "Good facilities, food quality can be improved." }
  ];

  const averageRating = (reviews.length ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length) : 0).toFixed(1);

  // UPDATED VALIDATION LOGIC
  const handleSubmitFeedback = () => {
    if (!editableName.trim() || !comment.trim() || rating === 0) {
      setFormError("Please provide name, rating, and a comment.");
      return;
    }
    
    setFormError("");

    // submit review to backend (hidden until admin approval)
    (async () => {
      try {
        const payload = {
          pgId: id,
          userId: localStorage.getItem('userId') || null,
          userName: editableName,
          userEmail: localStorage.getItem('userEmail') || null,
          userRole: role || 'tenant',
          comment,
          rating,
          isOwnerCreated: false
        };
        await import("../../api/api").then(m => m.createReview(payload));
        // Inform user that review is submitted for moderation
        setIsFeedbackOpen(false);
        setRating(0);
        setComment("");
        // Optional: show toast if you have one
        console.log('Review submitted for moderation');
      } catch (err) {
        console.error('Failed to submit review', err);
        setFormError('Failed to submit review. Please try again later.');
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary overflow-x-hidden">
      <Navbar />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-12"
      >
        {/* ================= LEFT COLUMN ================= */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6 md:gap-8">

          {/* MOBILE NAME & RATING */}
          <motion.div variants={fadeInUp} className="bg-white rounded-md shadow p-5 md:p-7 lg:hidden">
            <h1 className="text-h2-sm md:text-h2 font-bold text-textPrimary">{pg.name}</h1>
            <p className="text-textSecondary flex items-center gap-2 text-lg mt-2">
              <MapPinIcon className="h-5 w-5 text-primary" /> {pg.location}
            </p>
            <div className="mt-4 flex items-center gap-3 bg-textPrimary p-3 rounded-md w-fit">
              <StarIcon className="h-6 w-6 text-primary" />
              <span className="text-white text-2xl font-semibold">{averageRating}</span>
            </div>
          </motion.div>

          {/* IMAGE GALLERY */}
          <motion.div variants={fadeInUp} className="relative aspect-video md:h-[500px] md:aspect-auto rounded-md overflow-hidden shadow bg-border ">
            <AnimatePresence mode="wait">
              <motion.img 
                 key={currentIndex}
                 src={gallery[currentIndex]} 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5 }}
                 alt={pg.name} 
                 className="w-full h-full object-cover" 
              />
            </AnimatePresence>
            <button onClick={() => setCurrentIndex(currentIndex === 0 ? gallery.length - 1 : currentIndex - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition-all z-10">
              <ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6 text-textPrimary" />
            </button>
            <button onClick={() => setCurrentIndex((currentIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition-all z-10">
              <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6 text-textPrimary" />
            </button>
          </motion.div>

          {/* ================= CONDITIONAL BOOK NOW SECTION ================= */}
          <motion.div variants={fadeInUp} className="bg-white rounded-md shadow p-5 md:p-6 flex flex-row justify-between items-center border border-l-4 border-primary">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div>
                <p className="text-xs md:text-sm font-semibold text-textSecondary uppercase tracking-widest">Starting Price</p>
                <p className="text-2xl md:text-3xl font-bold text-textPrimary">
                  ₹{displayStartingPrice}
                  <span className="text-sm md:text-lg text-textSecondary font-normal ml-1">/month</span>
                </p>
              </div>
              
              <div className="h-8 w-[1px] bg-border hidden md:block"></div>

              <div>
                <p className="text-xs md:text-sm font-semibold text-textSecondary uppercase tracking-widest flex items-center gap-1">
                   Security Deposit
                </p>
                <p className="text-xl md:text-2xl font-bold text-textSecondary">
                  ₹{displayDeposit}
                  <span className="text-[10px] md:text-xs text-textSecondary font-medium ml-1 bg-background px-2 py-0.5 rounded border border-border italic uppercase tracking-tighter">Refundable</span>
                </p>
              </div>
            </div>
            
            {role === "owner" ? (
              <div className="flex flex-col items-end">
                <span className="bg-primarySoft text-primaryDark px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest border border-primary/20">
                  Owner Preview
                </span>
                <p className="text-[10px] text-textSecondary mt-1">Management is in Dashboard</p>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/book/${pg._id}`)}
                className="bg-primary text-white px-6 md:px-10 py-3 md:py-4 rounded-md font-bold shadow-lg text-sm md:text-lg uppercase tracking-wider hover:bg-primaryDark"
              >
                Book Now
              </motion.button>
            )}
          </motion.div>

          <div className="flex flex-col gap-6 lg:hidden">
              <HouseRules pg={pg} ruleIcons={ruleIcons} />
              <FeatureList title="Facilities" items={pg?.facilities || []} icon="🛠️" />
              <FeatureList title="Amenities" items={pg?.amenities || []} icon="⭐" />
          </div>

          <motion.div variants={fadeInUp} className="bg-white rounded-md overflow-hidden shadow border border-border">
            <div className="flex justify-between items-center p-4 md:p-5 border-b border-border">
              <div className="flex items-center gap-2 text-lg font-bold text-textPrimary">
                <MapPinIcon className="h-6 w-6 text-primary" />
                Location
              </div>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pg.name + " " + (pg.location || ""))}`, "_blank")} 
                className="text-xs md:text-sm bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm"
              >
                <PaperAirplaneIcon className="h-4 w-4 inline mr-1 -rotate-45" /> Open Maps
              </button>
            </div>
            <iframe title="map" className="w-full h-64 md:h-80 grayscale-[0.3]" src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.name + " " + (pg.location || ""))}&t=&z=14&ie=UTF8&iwloc=&output=embed`} />
          </motion.div>

          <motion.div variants={fadeInUp} ref={reviewsRef} className="bg-white rounded-md p-5 md:p-6 shadow border border-primary">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-textPrimary">
                <span className="text-primary">⭐</span> {averageRating} 
                <span className="text-textSecondary font-normal text-sm md:text-lg">({reviews.length} Reviews)</span>
              </h2>
              {isLoggedIn && role !== "owner" && (
                <button onClick={() => { setIsFeedbackOpen(true); setFormError(""); }} className="text-primaryDark font-bold hover:underline text-sm md:text-base">
                  Write Review
                </button>
              )}
            </div>

            <div className="space-y-6">
              {reviews.map((r, i) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  key={i} 
                  className="border-b border-border last:border-none pb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-textPrimary md:text-lg">{r.user}</span>
                    <span className="text-primaryDark font-bold text-sm bg-primarySoft px-2 py-1 rounded">★ {r.rating}</span>
                  </div>
                  <p className="text-textSecondary text-sm md:text-base leading-relaxed">{r.comment}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <motion.div variants={fadeInUp} className="hidden lg:flex w-[35%] flex-col gap-6 sticky top-24 h-fit">
          <motion.div whileHover={{ y: -5 }} className="bg-white rounded-md shadow p-6 border b border-primary transition-all">
            <h1 className="text-2xl font-bold text-textPrimary mb-1">{pg.name}</h1>
            <p className="text-textSecondary flex items-center gap-1 text-sm font-medium">
              <MapPinIcon className="h-5 w-5 text-primary" /> {pg.location}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-4 bg-background p-4 rounded-md border border-border">
                <div className="bg-primary p-2 rounded-md shadow-sm">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-textSecondary font-bold uppercase tracking-widest">Community Rating</p>
                  <span className="text-xl font-bold text-textPrimary">{averageRating} / 5.0</span>
                </div>
              </div>
            </div>
          </motion.div>

          <FeatureList title="Amenities" items={pg?.amenities || []} icon="⭐" />
          <FeatureList title="Facilities" items={pg?.facilities || []} icon="🛠️" />
          <HouseRules pg={pg} ruleIcons={ruleIcons} />
        </motion.div>
      </motion.div>

      {/* ================= FEEDBACK MODAL ================= */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-textPrimary/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-md p-6 md:p-8 relative shadow-2xl"
            >
              <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-textPrimary transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center text-textPrimary">Write a Review</h2>
              
              {/* DISPLAY ERROR MESSAGE */}
              {formError && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded text-center animate-pulse">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-primarySoft focus:border-primary outline-none transition-all ${formError && !editableName.trim() ? 'border-red-500 bg-red-50' : 'border-border'}`}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest block mb-1">Email (Locked)</label>
                  <input value={userEmail} disabled className="w-full p-3 border border-border rounded-md bg-background text-textSecondary cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest block mb-1 text-center">Your Rating</label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <motion.button 
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        key={n} 
                        onClick={() => {setRating(n); setFormError("");}} 
                        className={`text-4xl ${n <= rating ? "text-primary" : "text-border"}`}
                      >★</motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest block mb-1">Your Review</label>
                  <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-primarySoft focus:border-primary outline-none transition-all ${formError && !comment.trim() ? 'border-red-500 bg-red-50' : 'border-border'}`} placeholder="Share your experience..." />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setIsFeedbackOpen(false)} className="flex-1 bg-background py-3 rounded-md font-bold text-textSecondary hover:bg-border transition-colors border border-border">Cancel</button>
                <button onClick={handleSubmitFeedback} className="flex-1 bg-primary text-white py-3 rounded-md font-bold shadow-lg hover:bg-primaryDark transition-all">Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const FeatureList = ({ title, items, icon }) => {
  const normalizedItems = Array.isArray(items) 
    ? items.map(item => typeof item === 'object' ? (item.name || item.text) : item)
    : [];

  return (
    <motion.div whileHover={{ x: 5 }} className="bg-white p-5 md:p-6 rounded-md shadow border border-border transition-all">
      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2 text-textPrimary">
        <span className="text-lg">{icon}</span> {title}
      </h2>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, i) => (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              key={i} 
              className="px-3 md:px-4 py-1.5 md:py-2 bg-primarySoft rounded-md text-[10px] md:text-xs font-bold uppercase text-primaryDark border border-primary/10"
            >
              {item}
            </motion.span>
          ))
        ) : (
          <span className="text-textSecondary text-sm italic">No {title.toLowerCase()} listed</span>
        )}
      </div>
    </motion.div>
  );
};

const HouseRules = ({ pg, ruleIcons }) => {
  const rules = pg?.houseRules || pg?.rules || [];
  return (
    <motion.div whileHover={{ x: 5 }} className="bg-white p-5 md:p-6 rounded-md shadow border border-border transition-all">
      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2 text-textPrimary">
        <span className="text-lg ">📜</span> House Rules
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {rules.length > 0 ? (
          rules.map((rule, i) => {
            const ruleText = typeof rule === "object" ? (rule.text || rule.name) : rule;
            const ruleIconKey = typeof rule === "object" ? rule.icon?.toLowerCase() : rule.toLowerCase().replace(/\s/g, '');
            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                key={i} 
                className="flex gap-3 items-center bg-background p-3 rounded-md border border-border transition-colors hover:bg-white"
              >
                <span className="text-xl">{ruleIcons[ruleIconKey] || "✅"}</span>
                <span className="text-[10px] font-bold uppercase text-textSecondary truncate">
                  {ruleText}
                </span>
              </motion.div>
            );
          })
        ) : (
          <p className="text-textSecondary text-sm italic">No rules specified</p>
        )}
      </div>
    </motion.div>
  );
};

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-primary bg-background px-4 text-center">
    <h1 className="text-7xl md:text-9xl font-bold mb-4">404</h1>
    <p className="text-xl md:text-2xl font-bold uppercase tracking-widest">Property Not Found</p>
    <button onClick={() => window.history.back()} className="mt-6 text-textSecondary font-bold hover:underline">Go Back</button>
  </div>
);

export default PGDetails;
