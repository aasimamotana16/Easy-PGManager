import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackendContext } from "../../context/backendContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";

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
  const { pgList } = useContext(BackendContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= ROLE & AUTH LOGIC ================= */
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role"); // "owner" or "tenant"
  const storedUserName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editableName, setEditableName] = useState(storedUserName);

  const reviewsRef = useRef(null);

  const pg = pgList?.find((item) => item._id === id);

  useEffect(() => {
    if (pgList && pgList.length > 0) {
      setLoading(false);
    } else if (pgList && pgList.length === 0) {
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [pgList]);

  const rawGallery = [pg?.mainImage, ...(pg?.images || []), ...(pg?.roomImages || [])].filter(Boolean);
  const gallery = rawGallery.length >= 4 ? rawGallery : [...rawGallery, ...placeholders.slice(0, 4 - rawGallery.length)];

  /* ================= AUTO-SCROLL LOGIC ================= */
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

  const reviews = pg?.reviews?.length ? pg.reviews : [
    { user: "ABCD", rating: 5, comment: "Clean rooms and very safe environment." },
    { user: "XYZ", rating: 4, comment: "Good facilities, food quality can be improved." }
  ];

  const averageRating = (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1);

  const handleSubmitFeedback = () => {
    setIsFeedbackOpen(false);
    setRating(0);
    setComment("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-12">

        {/* ================= LEFT COLUMN ================= */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6 md:gap-8">

          {/* MOBILE NAME & RATING */}
          <div className="bg-white rounded-md shadow p-5 md:p-7 lg:hidden">
            <h1 className="text-3xl md:text-4xl font-bold">{pg.name}</h1>
            <p className="text-gray-500 flex items-center gap-2 text-lg mt-2">
              <MapPinIcon className="h-5 w-5 text-red-400" /> {pg.location}
            </p>
            <div className="mt-4 flex items-center gap-3 bg-black p-3 rounded-md w-fit">
              <StarIcon className="h-6 w-6 text-amber-500" />
              <span className="text-white text-2xl font-semibold">{averageRating}</span>
            </div>
          </div>

          {/* IMAGE GALLERY */}
          <div className="relative aspect-video md:h-[500px] md:aspect-auto rounded-md overflow-hidden shadow bg-gray-200">
            <img 
               src={gallery[currentIndex]} 
               alt={pg.name} 
               className="w-full h-full object-cover transition-opacity duration-500" 
            />
            <button onClick={() => setCurrentIndex(currentIndex === 0 ? gallery.length - 1 : currentIndex - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition-all">
              <ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button onClick={() => setCurrentIndex((currentIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow hover:bg-white transition-all">
              <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* ================= CONDITIONAL BOOK NOW SECTION ================= */}
          <div className="bg-white rounded-md shadow p-5 md:p-6 flex flex-row justify-between items-center border border-orange-500/20">
            <div>
              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-widest">Starting Price</p>
              <p className="text-2xl md:text-3xl font-bold text-black">
                ₹{displayStartingPrice}
                <span className="text-sm md:text-lg text-gray-400 font-normal ml-1">/month</span>
              </p>
            </div>
            
            {role === "owner" ? (
              <div className="flex flex-col items-end">
                <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest border border-orange-200">
                  Owner Preview
                </span>
                <p className="text-[10px] text-gray-400 mt-1">Management is in Dashboard</p>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/book/${pg._id}`)}
                className="bg-orange-500 text-white px-6 md:px-10 py-3 md:py-4 rounded-md font-bold shadow-lg transition-all active:scale-95 text-sm md:text-lg uppercase tracking-wider"
              >
                Book Now
              </button>
            )}
          </div>

          {/* MOBILE ONLY: RULES & FEATURES */}
          <div className="flex flex-col gap-6 lg:hidden">
             <HouseRules pg={pg} ruleIcons={ruleIcons} />
             <FeatureList title="Facilities" items={pg?.facilities || []} icon="🛠️" />
             <FeatureList title="Amenities" items={pg?.amenities || []} icon="⭐" />
          </div>

          {/* MAP */}
          <div className="bg-white rounded-md overflow-hidden shadow">
            <div className="flex justify-between items-center p-4 md:p-5 border-b">
              <div className="flex items-center gap-2 text-lg font-bold">
                <MapPinIcon className="h-6 w-6 text-red-500" />
                Location
              </div>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pg.name + " " + (pg.location || ""))}`, "_blank")} 
                className="text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
              >
                <PaperAirplaneIcon className="h-4 w-4 inline mr-1 -rotate-45" /> Open Maps
              </button>
            </div>
            <iframe title="map" className="w-full h-64 md:h-80" src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.name + " " + (pg.location || ""))}&t=&z=14&ie=UTF8&iwloc=&output=embed`} />
          </div>

          {/* REVIEWS */}
          <div ref={reviewsRef} className="bg-white rounded-md p-5 md:p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <span className="text-amber-500">⭐</span> {averageRating} 
                <span className="text-gray-400 font-normal text-sm md:text-lg">({reviews.length} Reviews)</span>
              </h2>
              {/* Owners cannot write reviews for any property */}
              {isLoggedIn && role !== "owner" && (
                <button onClick={() => setIsFeedbackOpen(true)} className="text-blue-600 font-bold hover:underline text-sm md:text-base">
                  Write Review
                </button>
              )}
            </div>

            <div className="space-y-6">
              {reviews.map((r, i) => (
                <div key={i} className="border-b last:border-none pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-800 md:text-lg">{r.user}</span>
                    <span className="text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded">★ {r.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <div className="hidden lg:flex w-[35%] flex-col gap-6 sticky top-24 h-fit">
          <div className="bg-white rounded-md shadow p-6 border-l-4 border-orange-500">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{pg.name}</h1>
            <p className="text-gray-500 flex items-center gap-1 text-sm font-medium">
              <MapPinIcon className="h-5 w-5 text-red-400" /> {pg.location}
            </p>

            <div className="mt-6 flex items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
              <div className="bg-amber-400 p-2 rounded-md shadow-sm">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Community Rating</p>
                <span className="text-xl font-bold text-gray-800">{averageRating} / 5.0</span>
              </div>
            </div>
          </div>

          <FeatureList title="Amenities" items={pg?.amenities || []} icon="⭐" />
          <FeatureList title="Facilities" items={pg?.facilities || []} icon="🛠️" />
          <HouseRules pg={pg} ruleIcons={ruleIcons} />
        </div>
      </div>

      {/* ================= FEEDBACK MODAL ================= */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-md p-6 md:p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Write a Review</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email (Locked)</label>
                <input value={userEmail} disabled className="w-full p-3 border rounded-md bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-center">Your Rating</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} className={`text-4xl transition-transform active:scale-90 ${n <= rating ? "text-amber-500" : "text-gray-200"}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Your Review</label>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border rounded-md p-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all" placeholder="Share your experience..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsFeedbackOpen(false)} className="flex-1 bg-gray-100 py-3 rounded-md font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleSubmitFeedback} className="flex-1 bg-orange-500 text-white py-3 rounded-md font-bold shadow-lg hover:brightness-110 transition-all">Submit</button>
            </div>
          </div>
        </div>
      )}

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
    <div className="bg-white p-5 md:p-6 rounded-md shadow">
      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
        <span className="text-lg">{icon}</span> {title}
      </h2>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, i) => (
            <span key={i} className="px-3 md:px-4 py-1.5 md:py-2 bg-amber-50 rounded-md text-[10px] md:text-xs font-bold uppercase text-amber-800 border border-amber-100">
              {item}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm italic">No {title.toLowerCase()} listed</span>
        )}
      </div>
    </div>
  );
};

const HouseRules = ({ pg, ruleIcons }) => {
  const rules = pg?.houseRules || pg?.rules || [];
  return (
    <div className="bg-white p-5 md:p-6 rounded-md shadow">
      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
        <span className="text-lg ">📜</span> House Rules
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {rules.length > 0 ? (
          rules.map((rule, i) => {
            const ruleText = typeof rule === "object" ? (rule.text || rule.name) : rule;
            const ruleIconKey = typeof rule === "object" ? rule.icon?.toLowerCase() : rule.toLowerCase().replace(/\s/g, '');
            return (
              <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-md border border-gray-100 transition-colors hover:bg-white">
                <span className="text-xl">{ruleIcons[ruleIconKey] || "✅"}</span>
                <span className="text-[10px] font-bold uppercase text-gray-500 truncate">
                  {ruleText}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm italic">No rules specified</p>
        )}
      </div>
    </div>
  );
};

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-red-500 bg-gray-50 px-4 text-center">
    <h1 className="text-7xl md:text-9xl font-bold mb-4">404</h1>
    <p className="text-xl md:text-2xl font-bold uppercase tracking-widest">Property Not Found</p>
    <button onClick={() => window.history.back()} className="mt-6 text-gray-600 font-bold hover:underline">Go Back</button>
  </div>
);

export default PGDetails;