import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BackendContext } from "../../context/backendContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import Loader from "../../components/loader";
import { motion, AnimatePresence } from "framer-motion"; 
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  HomeIcon,
  FunnelIcon, // Added for filtering
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

  // Filter & Selection State
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [filterType, setFilterType] = useState("All");

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role"); 
  const storedUserName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editableName, setEditableName] = useState(storedUserName);
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
    if (ownerPgData || (pgList && pgList.length > 0)) {
      setLoading(false);
    }
  }, [pgList, ownerPgData]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id || !isOwnerPreviewRoute || pgFromList) return;
        const api = await import("../../api/api");
        const res = await api.getOwnerPgById(id);
        if (mounted && res?.data?.success) setOwnerPgData(res.data.data || null);
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [id, pgFromList, isOwnerPreviewRoute]);

  const rawGallery = [pg?.mainImage, ...(pg?.images || []), ...(pg?.roomImages || [])]
    .filter(Boolean)
    .map(toImageUrl);
  const gallery = rawGallery.length >= 4 ? rawGallery : [...rawGallery, ...placeholders.slice(0, 4 - rawGallery.length)];

  // Logic for filtering Room Types
  const allRooms = pg?.roomTypes || [];
  
  // Extract unique categories for the "Dropdown/Filter"
  const categories = useMemo(() => {
    const types = allRooms.map(r => r.type.split(' ')[0]); // Get first word like "Single", "Double"
    return ["All", ...new Set(types)];
  }, [allRooms]);

  const filteredRooms = useMemo(() => {
    if (filterType === "All") return allRooms;
    return allRooms.filter(r => r.type.startsWith(filterType));
  }, [filterType, allRooms]);

  // Dynamic Financials based on selection
  const selectedRoom = filteredRooms[selectedRoomIdx] || filteredRooms[0];
  const displayDeposit = selectedRoom?.price || pg?.securityDeposit || "5,000";

  if (loading) return <Loader />;
  if (!pg) return <NotFoundState />;

  const reviews = propertyReviews.length ? propertyReviews : [
    { user: "ABCD", rating: 5, comment: "Clean rooms and very safe environment." },
    { user: "XYZ", rating: 4, comment: "Good facilities, food quality can be improved." }
  ];
  const averageRating = (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1);

  const handleSubmitFeedback = async () => {
    if (!editableName.trim() || !comment.trim() || rating === 0) {
      setFormError("Please provide name, rating, and a comment.");
      return;
    }
    try {
      const api = await import("../../api/api");
      await api.createReview({ pgId: id, userName: editableName, comment, rating });
      setIsFeedbackOpen(false);
    } catch (err) { setFormError('Failed to submit review.'); }
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary overflow-x-hidden">
      <Navbar />

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-12">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6 md:gap-8">
          
          {/* IMAGE GALLERY */}
          <motion.div variants={fadeInUp} className="relative aspect-video md:h-[450px] rounded-md overflow-hidden shadow bg-border ">
            <AnimatePresence mode="wait">
              <motion.img key={currentIndex} src={gallery[currentIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" />
            </AnimatePresence>
            <button onClick={() => setCurrentIndex(currentIndex === 0 ? gallery.length - 1 : currentIndex - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10"><ChevronLeftIcon className="h-5 w-5"/></button>
            <button onClick={() => setCurrentIndex((currentIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10"><ChevronRightIcon className="h-5 w-5"/></button>
          </motion.div>

          {/* ================= ROOM SELECTION WITH FILTER ================= */}
          <motion.div variants={fadeInUp} className="bg-white rounded-md shadow p-5 md:p-8 border-t-4 border-primary">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-border pb-4">
               <div>
                  <h2 className="text-xl md:text-2xl font-bold text-textPrimary italic">Choose Your Stay</h2>
                  <p className="text-textSecondary text-xs">Security deposit updates based on selection</p>
               </div>
               
               {/* DYNAMIC FILTER (Shown if multiple room types exist) */}
               {categories.length > 2 && (
                 <div className="flex items-center gap-2 bg-background p-1 rounded-md border border-border overflow-x-auto max-w-full">
                    <FunnelIcon className="h-4 w-4 text-textSecondary ml-2 hidden sm:block" />
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => {setFilterType(cat); setSelectedRoomIdx(0);}}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all whitespace-nowrap ${filterType === cat ? 'bg-primary text-white shadow-sm' : 'text-textSecondary hover:bg-primarySoft'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room, idx) => (
                  <motion.div 
                    key={idx} 
                    onClick={() => setSelectedRoomIdx(idx)}
                    className={`cursor-pointer flex items-center justify-between p-4 rounded-md border-2 transition-all group ${selectedRoomIdx === idx ? 'border-primary bg-primarySoft/30' : 'border-border bg-background hover:border-primary/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-md transition-colors ${selectedRoomIdx === idx ? 'bg-primary text-white' : 'bg-primarySoft text-primary'}`}>
                        <HomeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-textPrimary text-sm uppercase tracking-tight">{room.type}</h3>
                        <p className={`text-[10px] font-bold ${room.bedsAvailable > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {room.bedsAvailable} Beds Left
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-textPrimary">₹{room.price}<span className="text-[10px] text-textSecondary font-normal ml-0.5">/mo</span></p>
                      {selectedRoomIdx === idx && (
                        <span className="text-[9px] font-black text-primary uppercase">Selected</span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-textSecondary italic py-4">No rooms match this filter.</p>
              )}
            </div>

            {/* DYNAMIC BOOKING SUMMARY */}
            <div className="mt-8 p-4 md:p-6 bg-background border-2 border-dashed border-border rounded-md flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Total to Pay Now</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-textPrimary">₹{displayDeposit}</h2>
                    <span className="text-xs text-textSecondary">(Rent + Deposit)</span>
                  </div>
                </div>
                {role !== "owner" && (
                  <button 
                    onClick={() => navigate(`/book/${pg._id}?type=${selectedRoom?.type}`)}
                    className="w-full md:w-auto px-10 py-4 bg-primary text-white font-bold uppercase text-sm rounded shadow-lg hover:bg-primaryDark transition-all hover:scale-105 active:scale-95"
                  >
                    Secure This Room
                  </button>
                )}
            </div>
          </motion.div>

          <div className="flex flex-col gap-6 lg:hidden">
              <HouseRules pg={pg} ruleIcons={ruleIcons} />
              <FeatureList title="Facilities" items={pg?.facilities || []} icon="🛠️" />
          </div>

          <motion.div variants={fadeInUp} className="bg-white rounded-md overflow-hidden shadow border border-border">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <div className="flex items-center gap-2 text-lg font-bold text-textPrimary"><MapPinIcon className="h-6 w-6 text-primary" /> Location</div>
              <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(pg.name + " " + pg.location)}`, "_blank")} className="text-xs bg-primary text-white px-4 py-2 rounded-md font-bold transition-all"><PaperAirplaneIcon className="h-4 w-4 inline mr-1 -rotate-45" /> Open Maps</button>
            </div>
            <iframe title="map" className="w-full h-64 grayscale-[0.3]" src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.name + " " + pg.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} />
          </motion.div>
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <motion.div variants={fadeInUp} className="hidden lg:flex w-[35%] flex-col gap-6 sticky top-24 h-fit">
          <div className="bg-white rounded-md shadow p-6 border border-primary">
            <h1 className="text-2xl font-bold text-textPrimary mb-1">{pg.name}</h1>
            <p className="text-textSecondary flex items-center gap-1 text-sm"><MapPinIcon className="h-5 w-5 text-primary" /> {pg.location}</p>
            <div className="mt-6 flex items-center gap-4 bg-background p-4 rounded-md border border-border">
                <div className="bg-primary p-2 rounded-md"><StarIcon className="h-6 w-6 text-white" /></div>
                <div>
                  <p className="text-[10px] text-textSecondary font-bold uppercase">Community Rating</p>
                  <span className="text-xl font-bold text-textPrimary">{averageRating} / 5.0</span>
                </div>
            </div>
          </div>
          <FeatureList title="Amenities" items={pg?.amenities || []} icon="⭐" />
          <FeatureList title="Facilities" items={pg?.facilities || []} icon="🛠️" />
          <HouseRules pg={pg} ruleIcons={ruleIcons} />
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const FeatureList = ({ title, items, icon }) => {
  // Ensure items is an array even if backend returns null or a string
  const safeItems = Array.isArray(items) ? items : (items ? [items] : []);
  const normalizedItems = safeItems.map(item => typeof item === 'object' ? (item.name || item.text) : item);
  
  return (
    <motion.div whileHover={{ x: 5 }} className="bg-white p-5 rounded-md shadow border border-border">
      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2"><span>{icon}</span> {title}</h2>
      <div className="flex flex-wrap gap-2">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, i) => (
            <span key={i} className="px-3 py-1.5 bg-primarySoft rounded-md text-[10px] font-bold uppercase text-primaryDark border border-primary/10">{item}</span>
          ))
        ) : (
          <span className="text-textSecondary text-[10px] italic">No {title} listed</span>
        )}
      </div>
    </motion.div>
  );
};

const HouseRules = ({ pg, ruleIcons }) => {
  // Ensure rules is always an array
  const rawRules = pg?.houseRules || pg?.rules || [];
  const rules = Array.isArray(rawRules) ? rawRules : (rawRules ? [rawRules] : []);
  
  return (
    <motion.div whileHover={{ x: 5 }} className="bg-white p-5 rounded-md shadow border border-border">
      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2"><span>📜</span> House Rules</h2>
      <div className="grid grid-cols-1 gap-3">
        {rules.length > 0 ? (
          rules.map((rule, i) => {
            const ruleText = typeof rule === "object" ? (rule.text || rule.name || "") : (rule || "");
            const safeKey = String(ruleText).toLowerCase().replace(/\s/g, '');
            return (
              <div key={i} className="flex gap-3 items-center bg-background p-3 rounded-md border border-border">
                <span className="text-xl">{ruleIcons[safeKey] || "✅"}</span>
                <span className="text-[10px] font-bold uppercase text-textSecondary">{ruleText || 'Rule'}</span>
              </div>
            );
          })
        ) : (
          <p className="text-textSecondary text-[10px] italic">No rules specified</p>
        )}
      </div>
    </motion.div>
  );
};

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-primary bg-background"><h1 className="text-9xl font-bold">404</h1><p className="text-2xl font-bold uppercase">Property Not Found</p></div>
);

export default PGDetails;