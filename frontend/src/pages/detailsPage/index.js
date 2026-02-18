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
  FunnelIcon,
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

  const [selectedRoomIdx, setSelectedRoomIdx] = useState(-1);
  const [filterType, setFilterType] = useState("All");
  const [roomDocsState, setRoomDocsState] = useState(null);
  const [roomsFetched, setRoomsFetched] = useState(false);

  const role = localStorage.getItem("role"); 
  const storedUserName = localStorage.getItem("userName") || "";

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
        if (!id) return;
        const api = await import("../../api/api");
        if (isOwnerPreviewRoute) {
          const res = await api.getOwnerPgById(id);
          if (mounted && res?.data?.success) {
            const data = res.data.data || null;
            setOwnerPgData(data ? { ...data, name: data.name || data.pgName } : null);
          }
          return;
        }

        if (pgFromList) return;
        const res = await api.getPgById(id);
        if (mounted && res?.data?.success) setOwnerPgData(res.data.data || null);
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [id, pgFromList, isOwnerPreviewRoute]);

  const allRooms = useMemo(() => {
    if (!pg && !roomDocsState) return [];
    const normalize = (s) => String(s || "").trim().toLowerCase();
    const canonical = (s) => {
      const txt = normalize(s).replace(/[_-]/g, " ");
      if (txt.includes("single")) return "single";
      if (txt.includes("double")) return "double";
      if (txt.includes("triple")) return "triple";
      const first = txt.split(/\s+/).filter(Boolean)[0];
      return first || "";
    };
    const priceMap = new Map();
    const setPriceEntry = (rawKey, entry) => {
      const key = normalize(rawKey);
      const cKey = canonical(rawKey);
      if (key) priceMap.set(key, entry);
      if (cKey && !priceMap.has(cKey)) priceMap.set(cKey, entry);
    };

    if (Array.isArray(pg?.roomPrices)) {
      pg.roomPrices.forEach((v) => {
        const rawKey = v.variantName || v.variantLabel || v.roomType || v.type || v.label || v.name;
        setPriceEntry(rawKey, {
          rent: Number(v.rent || v.price || v.pricePerMonth || v.monthlyRent || 0) || 0,
          securityDeposit: Number(v.securityDeposit || v.deposit || 0) || 0,
          acType: v.acType || v.ac || 'Non-AC',
          description: v.description || v.desc || ''
        });
      });
    } else if (pg?.roomPrices && typeof pg.roomPrices === "object") {
      Object.entries(pg.roomPrices).forEach(([k, v]) => {
        const rent = Number(v?.rent || v?.price || v?.pricePerMonth || v?.monthlyRent || v || 0) || 0;
        const deposit = Number(v?.securityDeposit || v?.deposit || 0) || 0;
        setPriceEntry(k, {
          rent,
          securityDeposit: deposit,
          acType: v?.acType || 'Non-AC',
          description: v?.description || ''
        });
      });
    }

    if (Array.isArray(roomDocsState) && roomDocsState.length > 0) {
      roomDocsState.forEach((rd) => {
        const rawKey = rd.roomType || rd.variantName || rd.variantLabel || rd.type || rd.label || rd.name || '';
        setPriceEntry(rawKey, {
          rent: Number(rd.rent || rd.price || rd.pricePerMonth || rd.monthlyRent || 0) || 0,
          securityDeposit: Number(rd.securityDeposit || rd.deposit || 0) || 0,
          acType: rd.acType || 'Non-AC',
          description: rd.description || rd.desc || ''
        });
      });
    }

    const result = [];
    if (Array.isArray(pg?.rooms) && pg.rooms.length > 0) {
      pg.rooms.forEach((r) => {
        const type = r.roomType || r.type || 'Room';
        const key = normalize(type);
        const cKey = canonical(type);
        let priced = priceMap.get(key) || null;
        if (!priced && cKey) priced = priceMap.get(cKey) || null;

        if (!priced && priceMap.size > 0 && key) {
          for (const [k, v] of priceMap.entries()) {
            if (k.includes(key) || key.includes(k)) { priced = v; break; }
          }
        }

        result.push({
          type,
          price: priced ? priced.rent : Number(r.price || r.rent || r.pricePerMonth || r.monthlyRent || 0) || 0,
          securityDeposit: priced ? priced.securityDeposit : Number(r.securityDeposit || r.deposit || 0) || 0,
          bedsAvailable: Number(r.totalRooms || r.bedsPerRoom || r.bedsAvailable || 0) || 0,
          acType: priced?.acType || r.acType || 'Non-AC',
          description: priced?.description || r.description || r.desc || ''
        });
      });
    }

    if (result.length === 0 && priceMap.size > 0) {
      for (const [k, v] of priceMap.entries()) {
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        result.push({ type: label, price: v.rent || 0, securityDeposit: v.securityDeposit || 0, bedsAvailable: 0, acType: v.acType || 'Non-AC', description: v.description || '' });
      }
    }

    return result.map((room) => ({
      ...room,
      price: Number(room.price || 0) === 0 ? Number(pg?.price || 0) : Number(room.price || 0)
    }));
  }, [pg, roomDocsState]);

  const startingPrice = useMemo(() => {
    const candidates = [];
    if (allRooms.length > 0) {
      allRooms.forEach(r => {
        const p = parsePrice(r.price || 0);
        if (p > 0) candidates.push(p);
      });
    }
    if (candidates.length > 0) return Math.min(...candidates);
    if (parsePrice(pg?.price) > 0) return parsePrice(pg.price);
    return 0;
  }, [allRooms, pg]);

  const categories = useMemo(() => {
    const types = allRooms.map(r => (r.type || '').split(' ')[0]);
    const unique = [...new Set(types.filter(Boolean))];
    return ["All", ...unique];
  }, [allRooms]);

  const filteredRooms = useMemo(() => {
    if (filterType === "All") return allRooms;
    return allRooms.filter(r => (r.type || '').toLowerCase().includes(filterType.toLowerCase()));
  }, [filterType, allRooms]);

  const displayedRent = useMemo(() => {
    if (selectedRoomIdx >= 0 && filteredRooms[selectedRoomIdx]) {
      return parsePrice(filteredRooms[selectedRoomIdx].price || 0);
    }
    return startingPrice;
  }, [selectedRoomIdx, filteredRooms, startingPrice]);

  const displayedDeposit = useMemo(() => {
    if (selectedRoomIdx >= 0 && filteredRooms[selectedRoomIdx]) {
      return parsePrice(filteredRooms[selectedRoomIdx].securityDeposit || 0);
    }
    const depCandidates = allRooms.map(r => parsePrice(r.securityDeposit)).filter(d => d > 0);
    return depCandidates.length > 0 ? Math.min(...depCandidates) : parsePrice(pg?.securityDeposit);
  }, [selectedRoomIdx, filteredRooms, allRooms, pg]);

  const totalToPay = displayedRent + displayedDeposit;

  const displayAddress = useMemo(() => {
    if (!pg) return "";
    if (pg.address) return pg.address;
    return [pg.area, pg.city].filter(Boolean).join(', ');
  }, [pg]);

  const [gallery, setGallery] = useState(placeholders.slice(0, 4));
  useEffect(() => {
    if (!pg) return;
    const raw = [pg?.mainImage, ...(pg?.images || [])].filter(Boolean).map(toImageUrl);
    setGallery(raw.length >= 4 ? raw : [...raw, ...placeholders.slice(0, 4 - raw.length)]);
  }, [pg]);

  /* ================= DEBUGGER ================= */
  useEffect(() => {
    if (pg) {
      console.group(`🔍 Pricing Debug: ${pg.name}`);
      console.log("Top-level pg.price:", pg.price);
      console.log("allRooms count:", allRooms.length);
      console.log("Computed startingPrice:", startingPrice);
      if (allRooms.length > 0) {
        console.table(allRooms.map(r => ({ Type: r.type, Price: r.price, Deposit: r.securityDeposit })));
      } else {
        console.warn("⚠️ allRooms is EMPTY. Check backend roomPrices key.");
      }
      console.groupEnd();
    }
  }, [pg, allRooms, startingPrice]);

  if (loading) return <Loader />;
  if (!pg) return <NotFoundState />;

  const reviews = propertyReviews.length ? propertyReviews : [{ user: "User", rating: 5, comment: "Nice stay." }];
  const averageRating = (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-background text-textPrimary overflow-x-hidden">
      {!isOwnerPreviewRoute && <Navbar />}

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-12">
        
        <div className="w-full lg:w-[65%] flex flex-col gap-6 md:gap-8">
          {/* IMAGE GALLERY */}
          <motion.div variants={fadeInUp} className="relative aspect-video md:h-[450px] rounded-md overflow-hidden shadow bg-border ">
            <AnimatePresence mode="wait">
              <motion.img key={currentIndex} src={gallery[currentIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" />
            </AnimatePresence>
            <button onClick={() => setCurrentIndex(currentIndex === 0 ? gallery.length - 1 : currentIndex - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10"><ChevronLeftIcon className="h-5 w-5"/></button>
            <button onClick={() => setCurrentIndex((currentIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10"><ChevronRightIcon className="h-5 w-5"/></button>
          </motion.div>

          {/* ROOM SELECTION */}
          <motion.div variants={fadeInUp} className="bg-white rounded-md shadow p-5 md:p-8 border-t-4 border-primary">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-border pb-4">
               <div>
                  <h2 className="text-xl md:text-2xl font-bold text-textPrimary italic">Choose Your Stay</h2>
                  <p className="text-textSecondary text-xs">Security deposit updates based on selection</p>
               </div>
               
               {categories.length > 2 && (
                 <div className="flex items-center gap-2 bg-background p-1 rounded-md border border-border overflow-x-auto max-w-full">
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
              {filteredRooms.map((room, idx) => (
                  <motion.div 
                    key={idx} 
                    onClick={() => setSelectedRoomIdx(idx)}
                    className={`cursor-pointer flex items-start justify-between p-4 rounded-md border-2 transition-all ${selectedRoomIdx === idx ? 'border-primary bg-primarySoft/30' : 'border-border bg-background hover:border-primary/50'}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-md ${selectedRoomIdx === idx ? 'bg-primary text-white' : 'bg-primarySoft text-primary'}`}>
                        <HomeIcon className="h-5 w-5" />
                      </div>
                      <div>
                          <h3 className="font-bold text-textPrimary text-sm uppercase">{room.type}</h3>
                          <p className="text-[10px] text-textSecondary">{room.acType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-textPrimary">{formatCurrency(room.price)}<span className="text-[10px] text-textSecondary">/mo</span></p>
                    </div>
                  </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 md:p-6 bg-background border-2 border-dashed border-border rounded-md flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-textSecondary uppercase">Booking Summary</p>
                  <div className="mt-2 text-sm text-textPrimary">
                    <div className="flex justify-between w-48"><span>Rent</span><strong>{formatCurrency(displayedRent)}</strong></div>
                    <div className="flex justify-between w-48"><span>Deposit</span><strong>{formatCurrency(displayedDeposit)}</strong></div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h2 className="text-2xl font-black text-textPrimary">{formatCurrency(totalToPay)}</h2>
                    </div>
                  </div>
                </div>
                {!isOwnerPreviewRoute && role !== "owner" && (
                  <button 
                    onClick={() => navigate(`/book/${pg._id}`, {
                      state: {
                        selectedRoom: selectedRoomIdx >= 0 && filteredRooms[selectedRoomIdx]
                          ? filteredRooms[selectedRoomIdx]
                          : null
                      }
                    })}
                    className="px-10 py-4 bg-primary text-white font-bold uppercase text-sm rounded shadow-lg hover:bg-primaryDark transition-all"
                  >
                    Secure This Room
                  </button>
                )}
            </div>
          </motion.div>

          {/* MAP */}
          <motion.div variants={fadeInUp} className="bg-white rounded-md overflow-hidden shadow border border-border">
            <div className="p-4 border-b border-border font-bold">Location</div>
            <iframe title="map" className="w-full h-64 grayscale-[0.3]" src={`https://maps.google.com/maps?q=${encodeURIComponent(displayAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} />
          </motion.div>
        </div>

        {/* SIDEBAR */}
        <motion.div variants={fadeInUp} className="hidden lg:flex w-[35%] flex-col gap-6 sticky top-24 h-fit">
          <div className="bg-white rounded-md shadow p-6 border border-primary">
            <h1 className="text-2xl font-bold text-textPrimary mb-1">{pg.name}</h1>
            <p className="text-textSecondary text-sm flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {pg.city}</p>
            <div className="mt-6 flex items-center gap-4 bg-background p-4 rounded-md border border-border">
                <div className="bg-primary p-2 rounded-md"><StarIcon className="h-6 w-6 text-white" /></div>
                <div>
                  <p className="text-[10px] text-textSecondary font-bold">Community Rating</p>
                  <span className="text-xl font-bold">{averageRating} / 5.0</span>
                </div>
            </div>
          </div>
          <FeatureList title="Amenities" items={pg?.amenities || []} icon="⭐" />
          <HouseRules pg={pg} ruleIcons={ruleIcons} />
        </motion.div>
      </motion.div>

      {!isOwnerPreviewRoute && <Footer />}
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const FeatureList = ({ title, items, icon }) => (
  <div className="bg-white p-5 rounded-md shadow border border-border">
    <h2 className="text-sm font-bold mb-4 uppercase flex items-center gap-2">{icon} {title}</h2>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="px-3 py-1.5 bg-primarySoft rounded-md text-[10px] font-bold uppercase text-primaryDark">{typeof item === 'string' ? item : item.name}</span>
      ))}
    </div>
  </div>
);

const HouseRules = ({ pg, ruleIcons }) => {
  const rules = pg?.houseRules || [];
  return (
    <div className="bg-white p-5 rounded-md shadow border border-border">
      <h2 className="text-sm font-bold mb-4 uppercase">📜 House Rules</h2>
      <div className="grid grid-cols-1 gap-3">
        {rules.map((r, i) => (
          <div key={i} className="flex gap-3 items-center bg-background p-3 rounded-md border border-border">
            <span className="text-[10px] font-bold uppercase text-textSecondary">{typeof r === 'string' ? r : r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-primary bg-background"><h1 className="text-9xl font-bold">404</h1><p>Property Not Found</p></div>
);

export default PGDetails;
