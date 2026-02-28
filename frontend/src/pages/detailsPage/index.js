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

const roomTypeKey = (value) => {
  const text = String(value || "").trim().toLowerCase().replace(/[_-]/g, " ");
  if (text.includes("single") || text.includes("1")) return "single";
  if (text.includes("double") || text.includes("2")) return "double";
  if (text.includes("triple") || text.includes("3")) return "triple";
  return "";
};

const doubleRoomFallbackImages = [
  "/images/double-room-fallbacks/double1.jpg",
  "/images/double-room-fallbacks/double2.jpg",
  "/images/double-room-fallbacks/double3.jpg",
  "/images/double-room-fallbacks/double4.jpg"
];

const singleRoomFallbackImages = [
  "/images/single-room-fallbacks/single1.jpg",
  "/images/single-room-fallbacks/single2.jpg",
  "/images/single-room-fallbacks/single3.jpg",
  "/images/single-room-fallbacks/single4.jpg"
];

const rotateByPgSeed = (images, pg, offset = 0) => {
  if (!Array.isArray(images) || images.length === 0) return [];
  const seedSource = String(pg?._id || pg?.id || pg?.pgName || "default");
  let hash = 0;
  for (let i = 0; i < seedSource.length; i += 1) {
    hash = (hash * 31 + seedSource.charCodeAt(i)) >>> 0;
  }

  const start = (hash + offset) % images.length;
  const rotated = [];
  for (let i = 0; i < images.length; i += 1) {
    rotated.push(images[(start + i) % images.length]);
  }
  return rotated;
};

const getDoubleFallbackByPg = (pg) => rotateByPgSeed(doubleRoomFallbackImages, pg, 0);
const getSingleFallbackByPg = (pg) => rotateByPgSeed(singleRoomFallbackImages, pg, 7);

const PGDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pgList } = useContext(BackendContext);
  const isOwnerPreviewRoute = location.pathname.startsWith("/owner/dashboard/pg/");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ownerPgData, setOwnerPgData] = useState(null);

  const [selectedRoomIdx, setSelectedRoomIdx] = useState(-1);
  const [filterType, setFilterType] = useState("All");
  const [roomDocsState, setRoomDocsState] = useState(null);
  const [roomsFetched, setRoomsFetched] = useState(false);

  const role = localStorage.getItem("role"); 
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true" ||
    Boolean(localStorage.getItem("userToken") || localStorage.getItem("token"));
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (_) {
      return {};
    }
  }, []);
  const storedUserName = localStorage.getItem("userName") || "";
  const loggedInEmail = String(storedUser?.email || localStorage.getItem("userEmail") || "").trim();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editableName, setEditableName] = useState(storedUserName);
  const [formError, setFormError] = useState("");
  const [hasBookedCurrentPg, setHasBookedCurrentPg] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!id || isOwnerPreviewRoute) return;
        const api = await import("../../api/api");
        const res = await api.getReviewsByPg(id);
        if (mounted && res?.data?.success) {
          setPropertyReviews(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch (err) {
        if (mounted) setPropertyReviews([]);
      }
    })();
    return () => { mounted = false; };
  }, [id, isOwnerPreviewRoute]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!isLoggedIn || !id || isOwnerPreviewRoute) {
          if (mounted) setHasBookedCurrentPg(false);
          return;
        }
        const api = await import("../../api/api");
        const res = await api.getBookings();
        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
        const booked = rows.some((b) => {
          const bookingPgId = String(b?.pgId || b?.pg?._id || "").trim();
          const status = String(b?.status || "").toLowerCase();
          return bookingPgId === String(id) && status !== "cancelled";
        });
        if (mounted) setHasBookedCurrentPg(booked);
      } catch (_) {
        if (mounted) setHasBookedCurrentPg(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, isLoggedIn, isOwnerPreviewRoute]);

  useEffect(() => {
    if (Array.isArray(pg?.roomDocs)) {
      setRoomDocsState(pg.roomDocs);
      setRoomsFetched(true);
      return;
    }
    if (!id || roomsFetched || isOwnerPreviewRoute) return;

    let mounted = true;
    (async () => {
      try {
        const api = await import("../../api/api");
        const res = await api.getRoomsByPg(id);
        if (mounted && res?.data?.success) {
          setRoomDocsState(Array.isArray(res.data.rooms) ? res.data.rooms : []);
          setRoomsFetched(true);
        }
      } catch (_) {
        if (mounted) setRoomsFetched(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, pg, roomsFetched, isOwnerPreviewRoute]);

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

    // Hard fallback: when no room entries exist at all, create one display room from PG-level data.
    if (result.length === 0) {
      const rawFallbackType = String(pg?.roomType || pg?.occupancy || "").trim();
      const fallbackType =
        !rawFallbackType || rawFallbackType.toLowerCase() === "any"
          ? "Single"
          : rawFallbackType;
      const fallbackPrice = Number(pg?.price || 0) || 0;
      const fallbackDeposit = Number(pg?.securityDeposit || 0) || 0;
      result.push({
        type: fallbackType,
        price: fallbackPrice,
        securityDeposit: fallbackDeposit,
        bedsAvailable: Number(pg?.totalRooms || 0) || 0,
        acType: "Non-AC",
        description: ""
      });
    }

    return result.map((room) => {
      const resolvedPrice = Number(room.price || 0) === 0 ? Number(pg?.price || 0) : Number(room.price || 0);
      const explicitDeposit = Number(room.securityDeposit || 0);
      // Keep room-level deposit if provided, otherwise derive from selected room rent.
      const resolvedDeposit = explicitDeposit > 0 ? explicitDeposit : Math.max(0, Math.round(resolvedPrice * 2));
      const rawType = String(room.type || "").trim();
      const resolvedType = !rawType || rawType.toLowerCase() === "any" ? "Single" : rawType;
      const resolvedDescription = String(room.description || "")
        .replace(/\s+/g, " ")
        .trim();

      return {
        ...room,
        type: resolvedType,
        price: resolvedPrice,
        securityDeposit: resolvedDeposit,
        description: resolvedDescription
      };
    });
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

  const cleanText = (value) => String(value ?? "").trim();

  const displayAddress = useMemo(() => {
    if (!pg) return "";
    const parts = [pg.address, pg.area, pg.location, pg.city, pg.pincode]
      .map(cleanText)
      .filter(Boolean);
    return [...new Set(parts)].join(", ");
  }, [pg]);

  const mapQuery = useMemo(() => {
    if (!pg) return "";
    const parts = [pg.name || pg.pgName, pg.address, pg.area, pg.location, pg.city, pg.pincode]
      .map(cleanText)
      .filter(Boolean);
    return [...new Set(parts)].join(", ");
  }, [pg]);

  const mapEmbedUrl = useMemo(() => {
    if (!mapQuery) return "";
    return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [mapQuery]);

  const pgGallery = useMemo(() => {
    return [pg?.mainImage, ...(pg?.images || [])].filter(Boolean).map(toImageUrl);
  }, [pg]);

  const roomTypeImages = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(roomDocsState)) return map;

    roomDocsState.forEach((room) => {
      const key = roomTypeKey(room?.roomType || room?.variantLabel || room?.type || room?.name);
      if (!key) return;
      const images = [room?.mainImage, ...(Array.isArray(room?.images) ? room.images : [])]
        .filter(Boolean)
        .map(toImageUrl);
      if (images.length > 0 && !map.has(key)) {
        map.set(key, images);
      }
    });

    return map;
  }, [roomDocsState]);

  const activeGallery = useMemo(() => {
    if (selectedRoomIdx >= 0 && filteredRooms[selectedRoomIdx]) {
      const selectedTypeKey = roomTypeKey(filteredRooms[selectedRoomIdx]?.type);
      if (selectedTypeKey && roomTypeImages.has(selectedTypeKey)) {
        return roomTypeImages.get(selectedTypeKey);
      }
      if (selectedTypeKey === "single") {
        return getSingleFallbackByPg(pg);
      }
      if (selectedTypeKey === "double") {
        return getDoubleFallbackByPg(pg);
      }
    }
    return pgGallery;
  }, [selectedRoomIdx, filteredRooms, roomTypeImages, pgGallery, pg]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeGallery]);

  useEffect(() => {
    if (activeGallery.length <= 1 || isGalleryHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeGallery.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeGallery, isGalleryHovered]);

  const amenitiesList = useMemo(() => {
    const rawFacilities = Array.isArray(pg?.facilities) ? pg.facilities : [];
    const rawAmenities = Array.isArray(pg?.amenities) ? pg.amenities : [];
    const merged = [...rawFacilities, ...rawAmenities]
      .flatMap((item) => {
        if (typeof item === "string") {
          return item.split(",").map((x) => x.trim()).filter(Boolean);
        }
        return item ? [item] : [];
      })
      .map((item) => (typeof item === "string" ? item.trim() : String(item?.name || "").trim()))
      .filter(Boolean);

    return [...new Set(merged)];
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

  const normalizedReviews = useMemo(
    () => (Array.isArray(propertyReviews) ? propertyReviews : []).map((r) => ({
      user: r?.userName || r?.user || "User",
      rating: Number(r?.rating || 0),
      comment: r?.comment || ""
    })),
    [propertyReviews]
  );

  if (loading) return <Loader />;
  if (!pg) return <NotFoundState />;
  const reviews = normalizedReviews.length ? normalizedReviews : [{ user: "User", rating: 5, comment: "Nice stay." }];
  const averageRating = (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1);

  const openReviewModal = () => {
    if (!isLoggedIn || !hasBookedCurrentPg) return;
    setEditableName(storedUserName || editableName || "");
    setFormError("");
    setIsFeedbackOpen(true);
  };

  const submitReview = async () => {
    const name = String(editableName || "").trim();
    const message = String(comment || "").trim();

    if (!name) return setFormError("Name is required.");
    if (!loggedInEmail) return setFormError("Email is missing in your login profile.");
    if (!rating || rating < 1) return setFormError("Please select rating.");
    if (!message) return setFormError("Please write your feedback.");

    try {
      setReviewSubmitting(true);
      setFormError("");
      const api = await import("../../api/api");
      await api.createReview({
        pgId: id,
        ownerId: pg?.ownerId || null,
        userId: storedUser?._id || storedUser?.id || null,
        userName: name,
        userEmail: loggedInEmail,
        userRole: role === "owner" ? "owner" : "tenant",
        comment: message,
        rating
      });
      setPropertyReviews((prev) => [{ userName: name, rating, comment: message }, ...(prev || [])]);
      setIsFeedbackOpen(false);
      setComment("");
      setRating(0);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Could not submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {!isOwnerPreviewRoute && <Navbar />}

      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-12 overflow-x-hidden">
        
        <div className="w-full lg:w-[65%] flex flex-col gap-6 md:gap-8">
          {/* IMAGE GALLERY */}
          <motion.div
            variants={fadeInUp}
            className="relative aspect-video md:h-[450px] rounded-md overflow-hidden shadow bg-border"
            onMouseEnter={() => setIsGalleryHovered(true)}
            onMouseLeave={() => setIsGalleryHovered(false)}
          >
            {activeGallery.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img key={currentIndex} src={activeGallery[currentIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" />
                </AnimatePresence>
                {activeGallery.length > 1 && (
                  <>
                    <button onClick={() => setCurrentIndex(currentIndex === 0 ? activeGallery.length - 1 : currentIndex - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10"><ChevronLeftIcon className="h-5 w-5"/></button>
                    <button onClick={() => setCurrentIndex((currentIndex + 1) % activeGallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow z-10"><ChevronRightIcon className="h-5 w-5"/></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/25 px-2 py-1 rounded-full">
                      {activeGallery.map((_, idx) => (
                        <button
                          key={`dot-${idx}`}
                          type="button"
                          aria-label={`Go to image ${idx + 1}`}
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            idx === currentIndex ? "bg-white scale-110" : "bg-white/60 hover:bg-white/90"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-textSecondary bg-background">
                No room image uploaded
              </div>
            )}
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
                          {room.description ? (
                            <p className="text-[11px] leading-5 text-textSecondary mt-1 line-clamp-2 max-w-[240px]">{room.description}</p>
                          ) : null}
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
            <div className="p-4 border-b border-border">
              <p className="font-bold">Location</p>
              <p className="text-xs text-textSecondary mt-1">
                Exact Location: {displayAddress || "Not specified"}
              </p>
            </div>
            {mapEmbedUrl ? (
              <iframe title="map" className="w-full h-64 grayscale-[0.3]" src={mapEmbedUrl} />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-sm text-textSecondary bg-background">
                Location map not available
              </div>
            )}
          </motion.div>

          {!isLoggedIn && !isOwnerPreviewRoute && (
            <motion.div variants={fadeInUp}>
              <GuestRatingsReviews reviews={normalizedReviews} averageRating={averageRating} />
            </motion.div>
          )}

          {!isOwnerPreviewRoute && isLoggedIn && role !== "owner" && hasBookedCurrentPg && (
            <motion.div variants={fadeInUp} className="flex justify-end">
              <button
                type="button"
                onClick={openReviewModal}
                className="px-6 py-3 bg-primary text-white font-bold rounded-md hover:bg-primaryDark transition-all"
              >
                Write a Review
              </button>
            </motion.div>
          )}
        </div>

        {/* SIDEBAR */}
        <motion.div variants={fadeInUp} className="hidden lg:flex w-[35%] flex-col gap-6 sticky top-24 h-fit">
          <div className="bg-white rounded-md shadow p-6 border border-primary">
            <h1 className="text-2xl font-bold text-textPrimary mb-1">{pg.name}</h1>
            <p className="text-textSecondary text-sm flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {pg.city}</p>
            <div className="mt-3 bg-background px-3 py-2.5 rounded-md border border-border">
              <p className=" text-textSecondary font-bold inline-flex items-center gap-1 leading-tight">
                <StarIcon className="h-4 w-4 text-primary" />
                Community Rating
              </p>
              <div className="ml-5 text-base font-bold leading-tight">{averageRating} / 5.0</div>
            </div>
          </div>
          <FeatureList title="Amenities" items={amenitiesList} icon="⭐" />
          <HouseRules pg={pg} ruleIcons={ruleIcons} />
        </motion.div>
      </motion.div>

      {!isOwnerPreviewRoute && <Footer />}

      {isFeedbackOpen && isLoggedIn && hasBookedCurrentPg && (
        <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-3xl font-bold text-textPrimary">Write a Review</h3>
              <button
                type="button"
                className="text-textSecondary hover:text-textPrimary"
                onClick={() => setIsFeedbackOpen(false)}
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-textSecondary">Name</label>
              <input
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
              />

              <label className="text-sm font-semibold text-textSecondary">Email</label>
              <input
                type="email"
                value={loggedInEmail}
                readOnly
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-textSecondary cursor-not-allowed"
              />

              <div className="flex items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)}>
                    <StarIcon className={`h-6 w-6 ${star <= rating ? "text-primary" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback..."
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none"
              />
              {formError ? <p className="text-sm text-red-500">{formError}</p> : null}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-gray-100 text-textPrimary font-bold"
                onClick={() => setIsFeedbackOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primaryDark transition-all disabled:opacity-70"
                onClick={submitReview}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
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

const GuestRatingsReviews = ({ reviews, averageRating }) => {
  const items = Array.isArray(reviews) ? reviews.slice(0, 2) : [];
  const count = Array.isArray(reviews) ? reviews.length : 0;

  return (
    <div className="bg-white p-5 md:p-8 rounded-3xl shadow border border-border">
      <h2 className="text-3xl font-bold text-textPrimary mb-4">Ratings & Reviews</h2>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-primary font-bold">⭐ {count > 0 ? averageRating : "0.0"}</span>
        <span className="text-textSecondary font-semibold">({count} REVIEWS)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full bg-background p-4 rounded-3xl border border-border text-textSecondary">
            No reviews yet.
          </div>
        ) : (
          items.map((review, idx) => (
            <div key={idx} className="bg-background p-5 rounded-3xl border border-border">
              <div className="flex justify-between items-start gap-3">
                <p className="text-2xl font-bold text-textPrimary">{review.user}</p>
                <span className="text-primary font-bold">⭐ {Number(review.rating || 0)}</span>
              </div>
              <p className="mt-2 text-textSecondary text-xl leading-relaxed">"{review.comment}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-primary bg-background"><h1 className="text-9xl font-bold">404</h1><p>Property Not Found</p></div>
);

export default PGDetails;
