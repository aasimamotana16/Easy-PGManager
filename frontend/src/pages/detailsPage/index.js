import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackendContext } from "../../context/backendContext"; 
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader"; // Assuming this is your path
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
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const storedUserName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editableName, setEditableName] = useState(storedUserName);

  const reviewsRef = useRef(null);
  
  // Find the PG from the list
  const pg = pgList.find((item) => item._id === id);

  useEffect(() => {
    // Simulate a brief check for data availability
    if (pgList && pgList.length > 0) {
      setLoading(false);
    } else if (pgList && pgList.length === 0) {
        // If list is fetched but empty, stop loading after a timeout
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }
  }, [pgList]);

  useEffect(() => {
    if (!pg) return;
    const galleryLength = [pg?.mainImage, ...(pg?.images || []), ...(pg?.roomImages || [])].filter(Boolean).length;
    if (galleryLength <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === galleryLength - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [pg]);

  // Loading State
  if (loading) return <Loader />;

  // Only show Not Found if loading is finished and pg doesn't exist
  if (!pg) return <NotFoundState />;

  const rawGallery = [pg?.mainImage, ...(pg?.images || []), ...(pg?.roomImages || [])].filter(Boolean);
  const gallery = rawGallery.length >= 4 ? rawGallery : [...rawGallery, ...placeholders.slice(0, 4 - rawGallery.length)];

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
    <div className="min-h-screen bg-gray-50  text-base md:text-lg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row lg:gap-20">

        {/* ================= LEFT / MOBILE MAIN COLUMN ================= */}
        <div className="w-full lg:w-[80%] flex flex-col gap-7">

          {/* 0. MOBILE ONLY NAME & RATING */}
          <div className="order-0 bg-white rounded-md shadow p-7 lg:hidden">
            <h1 className="text-4xl sm:text-4xl ">{pg.name}</h1>
            <p className="text-gray-600 flex items-center gap-3 text-2xl">
              <MapPinIcon className="h-5 w-5 text-red-400" /> {pg.location}
            </p>
            <div className="mt-4 flex items-center gap-3 bg-black p-4 rounded-md w-fit">
              <StarIcon className="h-7 w-7 text-amber-500" />
              <span className="text-white text-3xl">{averageRating}</span>
            </div>
          </div>

          {/* 1. IMAGE GALLERY */}
          <div className="order-1 relative h-50 md:h-[500px] rounded-md overflow-hidden shadow bg-gray-200">
            <img src={gallery[currentIndex]} alt={pg.name} className="w-full h-full object-cover" />
            <button onClick={() => setCurrentIndex(currentIndex === 0 ? gallery.length - 1 : currentIndex - 1)} className="absolute left-3 top-1/2 bg-white p-2 rounded-full shadow"><ChevronLeftIcon className="h-6 w-6" /></button>
            <button onClick={() => setCurrentIndex(currentIndex === gallery.length - 1 ? 0 : currentIndex + 1)} className="absolute right-3 top-1/2 bg-white p-2 rounded-full shadow"><ChevronRightIcon className="h-6 w-6" /></button>
          </div>

          {/* 2. BOOK NOW */}
          <div className="order-2 bg-white rounded-md shadow p-6 flex justify-between items-center border border-primary">
            <div>
              <p className="sm:text-2xl lg:text-xl  text-gray-600 uppercase">Starting Price</p>
              <p className="sm:text-4xl lg:text-2xl  text-black">
                ₹{displayStartingPrice}
                <span className="sm:text-2xl lg:text-xl text-gray-400 ">/month</span>
              </p>
            </div>
            <button
              onClick={() => navigate(`/book/${pg._id}`)}
              className="bg-primary  text-white px-8 md:px-12 py-4 rounded-md  shadow-md transition-all active:scale-95 sm:text-2xl lg:text-xl"
            >
              Book Now
            </button>
          </div>

          {/* 3. MOBILE DETAILS */}
          <div className="order-3 flex flex-col gap-6 lg:hidden ">
             <HouseRules pg={pg} ruleIcons={ruleIcons} />
             <FeatureList title="Facilities" items={pg?.facilities || []} icon="🛠️" />
             <FeatureList title="Amenities" items={pg?.amenities || []} icon="⭐" />
          </div>

          {/* 4. MAP */}
          <div className="order-4 bg-white rounded-md overflow-hidden shadow">
            <div className="flex justify-between items-center p-5 border-b ">
              <div className="flex items-center gap-2 sm:text-3xl lg:text-xl"><MapPinIcon className="h-6 w-6 text-red-500" />Location</div>
              <button onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(pg.name + " " + (pg.location || ""))}`, "_blank")} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl">
                <PaperAirplaneIcon className="h-5 w-5 inline mr-1 -rotate-45" />Start
              </button>
            </div>
            <iframe title="map" className="w-full h-72" src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.name + " " + (pg.location || ""))}&t=&z=13&ie=UTF8&iwloc=&output=embed`} />
          </div>

          {/* 5. REVIEWS */}
          <div ref={reviewsRef} className="order-5 bg-white rounded-md p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="sm:text-3xl lg:text-xl">⭐ {averageRating} ({reviews.length} Reviews)</h2>
              {isLoggedIn && (
                <button onClick={() => setIsFeedbackOpen(true)} className="text-blue-600 sm:text-2xl lg:text-xl  hover:underline">
                  Write Review
                </button>
              )}
            </div>

            {reviews.map((r, i) => (
              <div key={i} className="border-b last:border-none pb-4 mb-4">
                <div className="flex justify-between  text-lg">
                  <span className="sm:text-3xl lg:text-xl ">{r.user}</span>
                  <span className="text-amber-500">★ {r.rating}</span>
                </div>
                <p className="lg:text-xl sm:text-3xl text-gray-600 mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT / LAPTOP SIDEBAR ================= */}
        <div className="hidden lg:flex w-[50%] flex-col gap-6">
          <div className="bg-white rounded-md shadow p-8">
            <h1 className="text-2xl  mb-2">{pg.name}</h1>
            <p className="text-gray-500 flex items-center gap-1 text-lg">
              <MapPinIcon className="h-6 w-6 text-red-400" /> {pg.location}
            </p>

            <div className="mt-6 flex items-center gap-4 bg-gray-200 p-3 rounded-md">
              <div className="bg-amber-400 p-2 rounded-md">
                <StarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600  uppercase ">Community Rating</p>
                <span className=" text-xl">{averageRating}</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-md p-8 relative shadow-2xl">
            <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-black ">
              <XMarkIcon className="h-7 w-7" />
            </button>
            <h2 className="text-2xl mb-6 text-gray-800 text-center ">Write a Review</h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm  text-gray-500 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="w-full p-4 border-2 border-gray-100 rounded-md focus:border-orange-400 outline-none text-lg "
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-sm  text-gray-500 uppercase ml-1">Email (Locked)</label>
                <input value={userEmail} disabled className="w-full p-4 border-2 border-gray-50 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed text-lg " />
              </div>
              <div>
                <label className="text-sm  text-gray-500 uppercase ml-1">Rating</label>
                <div className="flex gap-2 mt-1 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} className={`text-5xl ${n <= rating ? "text-amber-500" : "text-gray-200"}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm  text-gray-500 uppercase ml-1">Review</label>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border-2 border-gray-100 rounded-md p-4 focus:border-orange-400 outline-none text-lg " placeholder="Share details of your experience..." />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsFeedbackOpen(false)} className="flex-1 bg-gray-100 py-4 rounded-md  text-gray-600 text-lg ">Cancel</button>
              <button onClick={handleSubmitFeedback} className="flex-1 bg-orange-500 text-white py-4 rounded-md  shadow-lg text-lg ">Submit Review</button>
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
    ? items.map(item => typeof item === 'object' ? (item.name || item.text || JSON.stringify(item)) : item)
    : [];

  return (
    <div className="bg-white p-6 rounded-md shadow font-poppins">
      <h2 className=" mb-4 uppercase lg:text-xl sm:text-3xl tracking-wider flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      <div className="flex flex-wrap gap-3">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, i) => (
            <span key={i} className="px-5 py-2 bg-amber-50 rounded-md text-sm  uppercase text-amber-800 border border-amber-100">
              {item}
            </span>
          ))
        ) : (
          <span className="text-gray-400 lg:text-xl sm:text-3xl italic">No {title.toLowerCase()} listed</span>
        )}
      </div>
    </div>
  );
};

const HouseRules = ({ pg, ruleIcons }) => {
  const rules = pg?.houseRules || pg?.rules || [];
  return (
    <div className="bg-white p-6 rounded-md shadow ">
      <h2 className=" mb-4 uppercase lg:text-xl sm:text-3xl tracking-wider flex items-center gap-2">
        <span>📜</span> House Rules
      </h2>
      <div className="space-y-4">
        {rules.length > 0 ? (
          rules.map((rule, i) => {
            const ruleText = typeof rule === "object" ? (rule.text || rule.name) : rule;
            const ruleIconKey = typeof rule === "object" ? rule.icon?.toLowerCase() : rule.toLowerCase().replace(/\s/g, '');
            return (
              <div key={i} className="flex gap-4 items-center bg-gray-50 p-4 rounded-md border border-gray-100">
                <span className="text-2xl">{ruleIcons[ruleIconKey] || "✅"}</span>
                <span className="text-base  uppercase text-gray-600">
                  {ruleText}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 lg:text-xl sm:text-3xl italic">No rules specified</p>
        )}
      </div>
    </div>
  );
};

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center  text-red-500 bg-gray-50 ">
    <h1 className="text-8xl mb-2">404</h1>
    <p className="text-2xl uppercase ">Property Not Found</p>
  </div>
);

export default PGDetails;