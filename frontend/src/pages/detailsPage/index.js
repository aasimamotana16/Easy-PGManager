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
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(-1);
  const [filterType, setFilterType] = useState("All");
  const [roomDocsState, setRoomDocsState] = useState(null);
  const [roomsFetched, setRoomsFetched] = useState(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role"); 
  const storedUserName = localStorage.getItem("userName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editableName, setEditableName] = useState(storedUserName);
  const [formError, setFormError] = useState("");

  const parsePrice = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const s = String(val);
    const cleaned = s.replace(/[^0-9.\-]+/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatCurrency = (v) => `₹${parsePrice(v)}`;

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
        // If we already have PG from the shared context, no fetch necessary.
        // For owner-preview routes we rely on the owner data already present.
        if (!id || isOwnerPreviewRoute || pgFromList) return;
        const api = await import("../../api/api");
        const res = await api.getPgById(id);
        if (mounted && res?.data?.success) setOwnerPgData(res.data.data || null);
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [id, pgFromList, isOwnerPreviewRoute]);

  

  // Build a unified rooms array from backend shapes: pg.rooms, pg.roomPrices and lazy-loaded roomDocs
  const allRooms = useMemo(() => {
    if (!pg && !roomDocsState) return [];

    const normalize = (s) => String(s || "").trim().toLowerCase();

    // Build a map of variantLabel -> pricing data from pg.roomPrices
    const priceMap = new Map();
    if (Array.isArray(pg?.roomPrices)) {
      pg.roomPrices.forEach((v) => {
        const key = normalize(v.variantLabel || v.roomType || v.type || v.label || v.name);
        priceMap.set(key, {
          rent: Number(v.rent || v.price || v.pricePerMonth || 0) || 0,
          securityDeposit: Number(v.securityDeposit || v.deposit || 0) || 0,
          acType: v.acType || v.ac || 'Non-AC',
          description: v.description || v.desc || ''
        });
      });
    }

    // Also populate priceMap from roomDocsState (created Rooms) if present
    if (Array.isArray(roomDocsState) && roomDocsState.length > 0) {
      roomDocsState.forEach((rd) => {
        const key = normalize(rd.roomType || rd.variantLabel || rd.type || rd.label || rd.name || '');
        priceMap.set(key, {
          rent: Number(rd.rent || rd.price || 0) || 0,
          securityDeposit: Number(rd.securityDeposit || rd.deposit || 0) || 0,
          acType: rd.acType || rd.acType || 'Non-AC',
          description: rd.description || rd.desc || ''
        });
      });
    }

    const result = [];

    // Prefer explicit pg.rooms and attach pricing from priceMap when possible
    if (Array.isArray(pg?.rooms) && pg.rooms.length > 0) {
      pg.rooms.forEach((r) => {
        const type = r.roomType || r.type || 'Room';
        const key = normalize(r.roomType || r.type || '');

        // Try exact match first
        let priced = priceMap.get(key) || null;

        // Looser matching: check if any variant key contains the room type or vice-versa
        if (!priced && priceMap.size > 0 && key) {
          for (const [k, v] of priceMap.entries()) {
            if (k.includes(key) || key.includes(k)) { priced = v; break; }
            const kSimple = k.replace(/[-_\s]+/g, '');
            const keySimple = key.replace(/[-_\s]+/g, '');
            if (kSimple.includes(keySimple) || keySimple.includes(kSimple)) { priced = v; break; }
          }
        }

        // Also try matching against roomDocsState explicitly if no price yet
        if (!priced && Array.isArray(roomDocsState) && roomDocsState.length > 0 && key) {
          for (const rd of roomDocsState) {
            const rk = normalize(rd.roomType || rd.variantLabel || rd.type || '');
            if (rk === key || rk.includes(key) || key.includes(rk)) {
              priced = {
                rent: Number(rd.rent || rd.price || 0) || 0,
                securityDeposit: Number(rd.securityDeposit || rd.deposit || 0) || 0,
                acType: rd.acType || 'Non-AC',
                description: rd.description || rd.desc || ''
              };
              break;
            }
          }
        }

        result.push({
          type,
          price: priced ? priced.rent : Number(r.price || 0) || 0,
          securityDeposit: priced ? priced.securityDeposit : Number(r.securityDeposit || r.deposit || 0) || 0,
          bedsAvailable: Number(r.totalRooms || r.bedsPerRoom || r.bedsAvailable || 0) || 0,
          acType: priced?.acType || r.acType || 'Non-AC',
          description: priced?.description || r.description || r.desc || ''
        });
      });
    }

    // If no pg.rooms but variants exist in priceMap, use the variants
    if (result.length === 0 && priceMap.size > 0) {
      for (const [k, v] of priceMap.entries()) {
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        result.push({ type: label, price: v.rent || 0, securityDeposit: v.securityDeposit || 0, bedsAvailable: 0, acType: v.acType || 'Non-AC', description: v.description || '' });
      }
    }

    // Fallback to roomDocsState if still empty
    if (result.length === 0 && Array.isArray(roomDocsState) && roomDocsState.length > 0) {
      roomDocsState.forEach((rd) => {
        result.push({
          type: rd.roomType || rd.variantLabel || rd.type || 'Room',
          price: Number(rd.rent || rd.price || 0) || 0,
          securityDeposit: Number(rd.securityDeposit || rd.deposit || 0) || 0,
          bedsAvailable: Number(rd.totalRooms || rd.bedsPerRoom || 0) || 0,
          acType: rd.acType || 'Non-AC',
          description: rd.description || rd.desc || ''
        });
      });
    }

    // Fallback to older shapes
    if (result.length === 0) {
      if (Array.isArray(pg?.roomTypes) && pg.roomTypes.length > 0) {
        pg.roomTypes.forEach((r) => {
          result.push({
            type: r.type || r.roomType || 'Room',
            price: Number(r.price) || 0,
            securityDeposit: Number(r.securityDeposit || 0) || 0,
            bedsAvailable: Number(r.bedsAvailable || r.totalRooms || 0) || 0,
            acType: r.acType || 'Non-AC',
            description: r.description || r.desc || ''
          });
        });
      }
    }

    return result;
  }, [pg, roomDocsState]);

  // Extract unique categories for the "Dropdown/Filter"
  const categories = useMemo(() => {
    const types = allRooms.map(r => (r.type || '').split(' ')[0]); // Get first word like "Single", "Double"
    const unique = [...new Set(types.filter(Boolean))];

    // If no explicit categories found, try to infer from pg.roomPrices object keys
    if (unique.length === 0 && pg && pg.roomPrices && typeof pg.roomPrices === 'object' && !Array.isArray(pg.roomPrices)) {
      const inferred = Object.keys(pg.roomPrices).map(k => k.charAt(0).toUpperCase() + k.slice(1));
      return ["All", ...inferred];
    }

    // Fallback default categories when still empty
    if (unique.length === 0) return ["All", "Single", "Double", "Triple"];

    return ["All", ...unique];
  }, [allRooms, pg]);

  const filteredRooms = useMemo(() => {
    if (filterType === "All") return allRooms;
    return allRooms.filter(r => (r.type || '').toLowerCase() === (filterType || '').toLowerCase());
  }, [filterType, allRooms]);

  // Dynamic Financials based on selection
  const selectedRoom = (selectedRoomIdx >= 0 && filteredRooms[selectedRoomIdx]) ? filteredRooms[selectedRoomIdx] : null;
  // primary room for booking === currently selectedRoomIdx
  const primaryRoom = (selectedRoomIdx >= 0 && filteredRooms[selectedRoomIdx]) ? filteredRooms[selectedRoomIdx] : null;

  // Compute a sensible starting price (minimum available variant or pg.price)
  const startingPrice = useMemo(() => {
    const candidates = [];
    if (Array.isArray(allRooms) && allRooms.length > 0) {
      allRooms.forEach(r => {
        const p = parsePrice(r.price || r.price || 0);
        if (p > 0) candidates.push(p);
      });
    }
    if (Array.isArray(roomDocsState) && roomDocsState.length > 0) {
      roomDocsState.forEach(r => { const p = parsePrice(r.rent || r.price || 0); if (p > 0) candidates.push(p); });
    }
    if (candidates.length > 0) return Math.min(...candidates);
    if (parsePrice(pg?.price) > 0) return parsePrice(pg.price);
    return 0;
  }, [allRooms, roomDocsState, pg]);

  const totalToPay = (() => {
    // If a room selected, use its rent + deposit
    if (selectedRoomIdx >= 0) {
      const r = filteredRooms[selectedRoomIdx];
      if (r) {
        const rent = parsePrice(r.price || r.rent || 0);
        const dep = parsePrice(r.securityDeposit || r.deposit || 0);
        return rent + dep;
      }
    }
    // No selection: show starting price + starting deposit
    const rent = parsePrice(startingPrice || pg?.price || 0);
    // compute starting deposit similarly
    let startingDeposit = 0;
    const depCandidates = [];
    if (Array.isArray(allRooms) && allRooms.length > 0) {
      allRooms.forEach(r => { const d = parsePrice(r.securityDeposit || r.deposit || 0); if (d > 0) depCandidates.push(d); });
    }
    if (Array.isArray(roomDocsState) && roomDocsState.length > 0) {
      roomDocsState.forEach(r => { const d = parsePrice(r.securityDeposit || r.deposit || 0); if (d > 0) depCandidates.push(d); });
    }
    if (depCandidates.length > 0) startingDeposit = Math.min(...depCandidates.map(d => parsePrice(d)));
    else if (parsePrice(pg?.securityDeposit) > 0) startingDeposit = parsePrice(pg.securityDeposit);
    const total = rent + startingDeposit;
    return total > 0 ? total : 0;
  })();

  // Separate displayed rent and deposit for summary
  const displayedRent = (() => {
    if (selectedRoomIdx >= 0) {
      const r = filteredRooms[selectedRoomIdx];
      if (r) return parsePrice(r.price || r.rent || 0);
    }
    return parsePrice(startingPrice || pg?.price || 0);
  })();

  const displayedDeposit = (() => {
    if (selectedRoomIdx >= 0) {
      const r = filteredRooms[selectedRoomIdx];
      if (r) return parsePrice(r.securityDeposit || r.deposit || 0);
    }
    // starting deposit computed earlier
    let startingDeposit = 0;
    const depCandidates = [];
    if (Array.isArray(allRooms) && allRooms.length > 0) {
      allRooms.forEach(r => { const d = parsePrice(r.securityDeposit || r.deposit || 0); if (d > 0) depCandidates.push(d); });
    }
    if (Array.isArray(roomDocsState) && roomDocsState.length > 0) {
      roomDocsState.forEach(r => { const d = parsePrice(r.securityDeposit || r.deposit || 0); if (d > 0) depCandidates.push(d); });
    }
    if (depCandidates.length > 0) startingDeposit = Math.min(...depCandidates);
    else if (parsePrice(pg?.securityDeposit) > 0) startingDeposit = parsePrice(pg.securityDeposit);
    return startingDeposit;
  })();

  // Build a sensible display address: prefer `pg.address`, else combine other fields
  const displayAddress = (() => {
    if (!pg) return "";
    if (pg.address && String(pg.address).trim() !== "") return String(pg.address).trim();
    const parts = [];
    if (pg.area && String(pg.area).trim() !== "") parts.push(String(pg.area).trim());
    if (pg.location && String(pg.location).trim() !== "") parts.push(String(pg.location).trim());
    if (pg.city && String(pg.city).trim() !== "") parts.push(String(pg.city).trim());
    if (pg.pincode && String(pg.pincode).trim() !== "") parts.push(String(pg.pincode).trim());
    return parts.join(', ');
  })();

  // Short version for sidebar (prefer area + city, else first 60 chars)
  const displayAddressShort = (() => {
    if (!displayAddress) return pg?.location || pg?.city || "";
    const parts = displayAddress.split(',');
    if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
    return displayAddress.length > 60 ? displayAddress.slice(0, 57) + '...' : displayAddress;
  })();

  // Gallery state: show room-specific images when a room is selected
  const [gallery, setGallery] = useState(placeholders.slice(0, 4));
  useEffect(() => {
    if (!pg) return;
    const normalize = (s) => String(s || '').trim().toLowerCase();

    const selectedType = (selectedRoom && selectedRoom.type) ? normalize(selectedRoom.type) : '';
    let roomImages = [];
    // Prefer roomDocs from backend response first, else check cached state, otherwise lazy-load
    const availableRoomDocs = Array.isArray(pg.roomDocs) && pg.roomDocs.length > 0 ? pg.roomDocs : roomDocsState;

    if (Array.isArray(availableRoomDocs) && selectedType) {
      const match = availableRoomDocs.find(rd => {
        const rt = normalize(rd.roomType || rd.variantLabel || '');
        if (!rt) return false;
        return rt === selectedType || rt.includes(selectedType) || selectedType.includes(rt);
      });
      if (match) {
        roomImages = [match.mainImage, ...(match.images || [])].filter(Boolean).map(toImageUrl);
      }
    }

    // If we have no roomDocs anywhere and haven't fetched yet, lazy-load from API
    if ((!availableRoomDocs || availableRoomDocs.length === 0) && !roomsFetched && id) {
      (async () => {
        try {
          const api = await import('../../api/api');
          const res = await api.getRoomsByPg(id);
          if (res?.data?.success && Array.isArray(res.data.rooms)) {
            setRoomDocsState(res.data.rooms);
          }
        } catch (e) {
          // ignore fetch errors; gallery will fallback
          console.error('Failed to lazy-load rooms:', e.message || e);
        } finally {
          setRoomsFetched(true);
        }
      })();
    }

    if (!roomImages || roomImages.length === 0) {
      const raw = [pg?.mainImage, ...(pg?.images || []), ...(pg?.roomImages || [])].filter(Boolean).map(toImageUrl);
      roomImages = raw;
    }

    const final = roomImages.length >= 4 ? roomImages : [...roomImages, ...placeholders.slice(0, 4 - roomImages.length)];
    setGallery(final);
    setCurrentIndex(0);
  }, [pg, selectedRoom]);

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
                                        onClick={() => {setFilterType(cat); setSelectedRoomIdx(-1);}}
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
                      onClick={() => { setSelectedRoomIdx(idx); }}
                      className={`cursor-pointer flex items-start justify-between p-4 rounded-md border-2 transition-all group min-h-[72px] ${selectedRoomIdx === idx ? 'border-primary bg-primarySoft/30' : 'border-border bg-background hover:border-primary/50'}`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-md transition-colors shrink-0 ${selectedRoomIdx === idx ? 'bg-primary text-white' : 'bg-primarySoft text-primary'}`}>
                          <HomeIcon className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-textPrimary text-sm uppercase tracking-tight truncate">{room.type} <span className="text-xs font-bold ml-2 text-textSecondary">{room.acType === 'AC' ? '• AC' : '• Non-AC'}</span></h3>
                            {room.description ? (
                              <p className="text-[11px] text-textSecondary mt-1 truncate max-w-[220px]">{room.description}</p>
                            ) : (
                              <p className={`text-[10px] font-bold mt-1 ${room.bedsAvailable > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {room.bedsAvailable} Beds Left
                              </p>
                            )}
                        </div>
                      </div>
                      <div className="text-right pl-4 shrink-0">
                        <div className="text-[11px] font-semibold" style={{color: '#4B4B4B'}}>Starting from</div>
                        <p className="text-lg font-bold text-textPrimary">{formatCurrency(room.price || startingPrice || pg?.price)}<span className="text-[10px] text-textSecondary font-normal ml-0.5">/mo</span></p>
                        {selectedRoomIdx === idx && (
                          <span className="text-[9px] font-black text-primary uppercase">SELECTED</span>
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
                  <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Booking Summary</p>
                  <div className="mt-2 text-sm text-textPrimary">
                    {/* Show starting price when no room selected */}
                    {selectedRoomIdx < 0 ? (
                      <div className="mb-2">
                        <div className="text-sm text-textSecondary">Starting from</div>
                        <h3 className="text-lg font-extrabold">{formatCurrency(startingPrice)} <span className="text-[10px] font-normal">/mo</span></h3>
                        <p className="text-[12px] text-textSecondary mt-1 italic">Select a room to see full details</p>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <h3 className="text-lg font-extrabold">{selectedRoom?.type}</h3>
                        <p className="text-[12px] text-textSecondary mt-1">{selectedRoom?.description || 'No description available.'}</p>
                      </div>
                    )}

                    <div className="flex justify-between w-48"><span className="text-textSecondary">Rent</span><strong>{formatCurrency(displayedRent)}</strong></div>
                    <div className="flex justify-between w-48"><span className="text-textSecondary">Deposit</span><strong>{formatCurrency(displayedDeposit)}</strong></div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h2 className="text-2xl font-black text-textPrimary">{formatCurrency(totalToPay)}</h2>
                      <span className="text-xs text-textSecondary">(Rent + Deposit)</span>
                    </div>
                  </div>
                </div>
                {role !== "owner" && (
                  <button 
                    onClick={() => navigate(`/book/${pg._id}?type=${primaryRoom?.type}`)}
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
                <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(displayAddress || pg.location || pg.city || '')}`, "_blank")} className="text-xs bg-primary text-white px-4 py-2 rounded-md font-bold transition-all"><PaperAirplaneIcon className="h-4 w-4 inline mr-1 -rotate-45" /> Open Maps</button>
              </div>
              <iframe title="map" className="w-full h-64 grayscale-[0.3]" src={`https://maps.google.com/maps?q=${encodeURIComponent(displayAddress || pg.location || pg.city || '')}&t=&z=14&ie=UTF8&iwloc=&output=embed`} />
          </motion.div>
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <motion.div variants={fadeInUp} className="hidden lg:flex w-[35%] flex-col gap-6 sticky top-24 h-fit">
          <div className="bg-white rounded-md shadow p-6 border border-primary">
            <h1 className="text-2xl font-bold text-textPrimary mb-1">{pg.name}</h1>
            <p className="text-textSecondary flex items-center gap-1 text-sm"><MapPinIcon className="h-5 w-5 text-primary" /> {displayAddressShort || pg.location || pg.city}</p>
            <div className="mt-6 flex items-center gap-4 bg-background p-4 rounded-md border border-border">
                <div className="bg-primary p-2 rounded-md"><StarIcon className="h-6 w-6 text-white" /></div>
                <div>
                  <p className="text-[10px] text-textSecondary font-bold uppercase">Community Rating</p>
                  <span className="text-xl font-bold text-textPrimary">{averageRating} / 5.0</span>
                </div>
            </div>
          </div>
          {/* Merge amenities + facilities and show a single unified list to avoid duplicates */}
          <FeatureList title="Amenities" items={Array.from(new Set([...(pg?.amenities || []), ...(pg?.facilities || [])]))} icon="⭐" />
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
  // Support both object-shaped rules (pg.rules) and array-shaped rules (houseRules)
  const rawRules = pg?.houseRules || pg?.rules || [];

  const isObjectRules = rawRules && !Array.isArray(rawRules) && typeof rawRules === 'object';

  const renderedRules = [];

  if (isObjectRules) {
    const obj = rawRules;
    if (obj.smoking) renderedRules.push({ key: 'nosmoke', text: 'No Smoking' });
    if (obj.pets) renderedRules.push({ key: 'nopet', text: 'No Pets' });
    if (obj.music) renderedRules.push({ key: 'music', text: 'Quiet Hours' });
    if (obj.visitors === false) renderedRules.push({ key: 'noguest', text: 'No Guests' });
    if (obj.clean === false) renderedRules.push({ key: 'clean', text: 'Keep Clean' });
    if (obj.curfew) renderedRules.push({ key: 'curfew', text: `Gate closes at ${obj.curfew}` });
  } else {
    const arr = Array.isArray(rawRules) ? rawRules : (rawRules ? [rawRules] : []);
    arr.forEach((rule) => {
      const ruleText = typeof rule === 'object' ? (rule.text || rule.name) : rule;
      renderedRules.push({ key: String(ruleText || '').toLowerCase().replace(/\s/g, ''), text: ruleText });
    });
  }

  return (
    <motion.div whileHover={{ x: 5 }} className="bg-white p-5 rounded-md shadow border border-border">
      <h2 className="text-sm font-bold mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2"><span>📜</span> House Rules</h2>
      <div className="grid grid-cols-1 gap-3">
        {renderedRules.length > 0 ? (
          renderedRules.map((r, i) => (
            <div key={i} className="flex gap-3 items-center bg-background p-3 rounded-md border border-border">
              <span className="text-xl">{ruleIcons[r.key] || '✅'}</span>
              <span className="text-[10px] font-bold uppercase text-textSecondary">{r.text || 'Rule'}</span>
            </div>
          ))
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