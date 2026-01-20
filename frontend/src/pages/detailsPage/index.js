import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackendContext } from "../../context/backendContext"; 
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CButton from "../../components/cButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const ruleIcons = {
  nosmoke: "🚭",
  nopet: "🐾",
  music: "🔕",
  clean: "🧹",
  noguest: "🙅‍♂️",
};

// Professional placeholders to ensure a full gallery of 3-4 images
const placeholders = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb"
];

const PGDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { pgList } = useContext(BackendContext);

  const pg = pgList.find((item) => item._id === id);

  // 1. UNIVERSAL GALLERY LOGIC: Combines Atlas fields and adds padding if < 4
  const rawGallery = [
    pg?.mainImage, 
    ...(pg?.images || []), 
    ...(pg?.roomImages || [])
  ].filter(Boolean);

  const gallery = rawGallery.length >= 4 
    ? rawGallery 
    : [...rawGallery, ...placeholders.slice(0, 4 - rawGallery.length)];

  // 2. PRICE LOGIC: Matches your Atlas "roomPrices" or "price" fields
  const priceData = pg?.roomPrices || pg?.price || {};
  const hasPrices = Object.keys(priceData).length > 0;
  const displayStartingPrice = pg?.startingPrice || (hasPrices ? Math.min(...Object.values(priceData).map(v => Number(v))) : "5,000");

  // 3. AMENITIES/FACILITIES FALLBACKS: Keeps UI full even if Atlas fields are missing
  const displayAmenities = pg?.amenities?.length > 0 ? pg.amenities : ["Wifi", "CCTV Security", "RO Water", "Power Backup"];
  const displayFacilities = pg?.facilities?.length > 0 ? pg.facilities : ["Common Kitchen", "Housekeeping", "Laundry Area"];

  useEffect(() => {
    if (gallery.length <= 1) return; 
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
    }, 4000); 
    return () => clearInterval(interval);
  }, [gallery.length]);

  if (pgList.length === 0) return <LoadingState />; 
  if (!pg) return <NotFoundState />;

  return (
    <div className="min-h-screen flex flex-col bg-background font-roboto">
      <Navbar />

      <div className="flex-1 w-full py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto lg:flex lg:gap-10">

          {/* LEFT SECTION (60% width) */}
          <div className="lg:w-[60%] flex flex-col gap-6">
            
            {/* IMAGE CAROUSEL */}
            <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-xl bg-gray-200 group">
              <img
                src={gallery[currentIndex].startsWith("http") ? gallery[currentIndex] : process.env.PUBLIC_URL + gallery[currentIndex]}
                alt={pg.name}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              {gallery.length > 1 && (
                <>
                  <button onClick={() => setCurrentIndex((prev) => prev === 0 ? gallery.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"><ChevronLeftIcon className="h-6 w-6 text-gray-800" /></button>
                  <button onClick={() => setCurrentIndex((prev) => prev === gallery.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"><ChevronRightIcon className="h-6 w-6 text-gray-800" /></button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {gallery.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* BOOKING BAR */}
            <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-md border-b-4 border-amber-500">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Starting Price</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{displayStartingPrice}
                  <span className="text-lg font-normal text-gray-500 ml-1">/ month</span>
                </p>
              </div>
              <CButton size="lg" className="px-10 h-14 text-lg shadow-lg" onClick={() => navigate(`/book/${pg._id}`)}>
                Book Now
              </CButton>
            </div>

            {/* DYNAMIC MAP SECTION */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">Location & Area</h3>
                <p className="text-sm text-gray-500">{pg.location || "Address on Request"}</p>
              </div>
              <iframe
                title="PG Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${pg.name} ${pg.location}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-80 border-0"
                loading="lazy"
              ></iframe>
              <div className="flex justify-center p-4 bg-gray-50">
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pg.name} ${pg.location}`)}`} target="_blank" rel="noopener noreferrer" className="bg-primary text-white px-8 py-2.5 rounded-full hover:bg-primary-dark transition font-semibold flex items-center gap-2">
                  <span>📍</span> Open in Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (40% width) */}
          <div className="lg:w-[40%] flex flex-col gap-6">
            
            {/* MAIN INFO CARD */}
            <div className="bg-white p-8 rounded-3xl shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-10 -mt-10" />
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{pg.name }</h1>
              <p className="text-lg text-gray-600 mt-2 flex items-center gap-2">
                <span className="text-red-500">📍</span> {pg.location}
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between"><span className="text-gray-500">Owner</span><span className="font-semibold text-gray-800">{pg.ownerName || "Contact Owner"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-green-600 uppercase text-sm">{pg.status || "Active"}</span></div>
                {pg.rating && <div className="flex justify-between"><span className="text-gray-500">Rating</span><span className="text-yellow-500 font-bold">★ {pg.rating}</span></div>}
              </div>
            </div>

            {/* ROOM OPTIONS - Grid Layout matching your Atlas 'roomPrices' */}
            <div className="bg-white p-6 rounded-3xl shadow-md">
              <h2 className="text-xl font-bold mb-5 text-gray-800 flex items-center gap-2">🏠 Room Categories</h2>
              {hasPrices ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(priceData).map(([type, amount], i) => (
                    <div key={i} className="border border-amber-100 rounded-2xl p-4 text-center bg-amber-50/30">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">{type.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="font-extrabold text-amber-700 text-lg">₹{amount}/mo</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 rounded-2xl p-6 text-center border border-dashed border-amber-200">
                   <p className="text-amber-800 font-semibold">Multiple Sharing Options</p>
                   <p className="text-xs text-amber-600 mt-1">Starting from ₹5,000</p>
                </div>
              )}
            </div>

            {/* AMENITIES & FACILITIES - Using display fallbacks */}
            <FeatureList title="Amenities" items={displayAmenities} icon="⭐" />
            <FeatureList title="Facilities" items={displayFacilities} icon="🛠️" />

            {/* HOUSE RULES */}
            <HouseRules pg={pg} ruleIcons={ruleIcons} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Reusable Feature List
const FeatureList = ({ title, items, icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-50 mb-2">
    <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">{icon} {title}</h2>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900 font-semibold shadow-sm">
          {item}
        </span>
      ))}
    </div>
  </div>
);

const HouseRules = ({ pg, ruleIcons }) => {
  const rules = pg?.houseRules || pg?.rulesList || pg?.rules || [];
  
  return (
    <div className="bg-white p-6 rounded-3xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">📜 House Rules</h2>
      <ul className="space-y-3">
        {rules.length > 0 ? (
          rules.map((rule, i) => (
            <li key={i} className="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-2xl">{ruleIcons[rule.icon?.toLowerCase()] || "✅"}</span>
              <span className="text-sm text-gray-700 font-bold uppercase tracking-tight">
                {typeof rule === 'object' ? rule.text : rule}
              </span>
            </li>
          ))
        ) : (
          <li className="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
             <span className="text-2xl">🚭</span>
             <span className="text-sm text-gray-700 font-bold uppercase tracking-tight">No Smoking Inside</span>
          </li>
        )}
      </ul>
    </div>
  );
};

const LoadingState = () => <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><Navbar /><div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mt-10" /><p className="text-xl text-gray-600 font-medium mt-6">Fetching Property Details...</p></div>;
const NotFoundState = () => <div className="min-h-screen flex flex-col items-center justify-center"><Navbar /><p className="text-3xl font-bold text-red-500 mt-10">Property Not Found</p><CButton className="mt-4" onClick={() => window.history.back()}>Go Back</CButton></div>;

export default PGDetails;