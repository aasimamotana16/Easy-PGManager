import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BackendContext } from "../../context/backendContext"; 
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CButton from "../../components/cButton";
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

/* ================= MAIN COMPONENT ================= */
const PGDetails = () => {
  // 1. ALL HOOKS AT THE TOP
  const { id } = useParams();
  const navigate = useNavigate();
  const { pgList } = useContext(BackendContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviewsRef = useRef(null);

  // 2. DATA CALCULATION
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const pg = pgList.find((item) => item._id === id);

  // 3. EFFECT DECLARED BEFORE CONDITIONAL RETURN
  useEffect(() => {
    // Gallery check inside the effect to prevent errors if pg is missing
    const rawGallery = [
      pg?.mainImage, 
      ...(pg?.images || []), 
      ...(pg?.roomImages || [])
    ].filter(Boolean);

    const galleryLength = rawGallery.length >= 4 ? rawGallery.length : 4;

    if (!pg || galleryLength <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === galleryLength - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [pg]);

  // 4. CONDITIONAL RETURN AFTER ALL HOOKS
  if (!pg) return <NotFoundState />;

  /* ================= DATA PREPARATION ================= */
  const rawGallery = [
    pg?.mainImage, 
    ...(pg?.images || []), 
    ...(pg?.roomImages || [])
  ].filter(Boolean);

  const gallery =
    rawGallery.length >= 4
      ? rawGallery
      : [...rawGallery, ...placeholders.slice(0, 4 - rawGallery.length)];

  const priceData = pg?.roomPrices || pg?.price || {};
  const displayStartingPrice =
    pg?.startingPrice ||
    (Object.keys(priceData).length > 0
      ? Math.min(...Object.values(priceData).map(v => Number(v)))
      : "5,000");

  const reviews = pg?.reviews?.length
    ? pg.reviews
    : [
        { user: "ABCD", rating: 5, comment: "Clean rooms and very safe environment." },
        { user: "XYZ", rating: 4, comment: "Good facilities, food quality can be improved." },
      ];

  const averageRating = (
    reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
  ).toFixed(1);

  /* ================= HANDLERS ================= */
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitFeedback = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    console.log({
      pgId: pg._id,
      rating,
      comment,
    });

    setIsFeedbackOpen(false);
    setRating(0);
    setComment("");
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row lg:gap-10">

        {/* ================= LEFT MAIN CONTENT ================= */}
        <div className="w-full lg:w-[60%] flex flex-col gap-6 order-1">

          {/* IMAGE */}
          <div className="order-1 relative h-64 md:h-[450px] rounded-3xl overflow-hidden bg-gray-200 shadow">
            <img
              src={gallery[currentIndex]}
              alt={pg.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() =>
                setCurrentIndex(currentIndex === 0 ? gallery.length - 1 : currentIndex - 1)
              }
              className="absolute left-3 top-1/2 bg-white p-2 rounded-full shadow"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() =>
                setCurrentIndex(currentIndex === gallery.length - 1 ? 0 : currentIndex + 1)
              }
              className="absolute right-3 top-1/2 bg-white p-2 rounded-full shadow"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* ⭐ ALL PG DETAILS (MOBILE AFTER IMAGE) */}
          <div className="order-2 lg:hidden flex flex-col gap-5">

            <div className="bg-white p-6 rounded-2xl shadow">
              <h1 className="text-2xl font-black">{pg.name}</h1>
              <p className="text-gray-500 font-semibold">📍 {pg.location}</p>

              <div className="mt-4 flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                <StarIcon className="h-6 w-6 text-amber-500" />
                <span className="font-black">{averageRating}</span>
                <button
                  onClick={scrollToReviews}
                  className="text-xs text-blue-600 font-bold underline"
                >
                  ({reviews.length} reviews)
                </button>
              </div>

              <div className="mt-4 text-xl font-black text-primary">
                ₹{displayStartingPrice}/month
              </div>
            </div>

            <FeatureList
              title="Amenities"
              items={pg?.amenities?.length ? pg.amenities : ["Wifi", "CCTV Security", "RO Water", "Power Backup"]}
              icon="⭐"
            />
            <FeatureList
              title="Facilities"
              items={pg?.facilities?.length ? pg.facilities : ["Common Kitchen", "Housekeeping", "Laundry Area"]}
              icon="🛠️"
            />
            <HouseRules pg={pg} ruleIcons={ruleIcons} />
          </div>

          {/* MAP */}
          <div className="order-3 bg-white rounded-2xl overflow-hidden shadow">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2 font-bold">
                <MapPinIcon className="h-5 w-5 text-red-500" />
                Location
              </div>
              <button
                onClick={() =>
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pg.name + " " + pg.location)}`, "_blank")
                }
                className="text-xs bg-blue-600 text-white px-3 py-2 rounded-xl font-bold"
              >
                <PaperAirplaneIcon className="h-4 w-4 inline mr-1 -rotate-45" />
                Start
              </button>
            </div>
            <iframe
              title="map"
              className="w-full h-64"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.name + " " + pg.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            />
          </div>

          {/* REVIEWS */}
          <div ref={reviewsRef} className="order-4 bg-white rounded-2xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black">
                ⭐ {averageRating} ({reviews.length} Reviews)
              </h2>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-blue-600 text-sm font-bold"
              >
                Write Review
              </button>
            </div>

            {reviews.map((r, i) => (
              <div key={i} className="border-b pb-3 mb-3">
                <div className="flex justify-between">
                  <span className="font-bold">{r.user}</span>
                  <span className="text-amber-500">★ {r.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT SIDE (DESKTOP ONLY) ================= */}
        <div className="hidden lg:flex w-[40%] flex-col gap-6 order-2">

          <div className="bg-white p-6 rounded-2xl shadow">
            <h1 className="text-2xl font-black">{pg.name}</h1>
            <p className="text-gray-500">{pg.location}</p>

            <div className="mt-4 flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
              <StarIcon className="h-6 w-6 text-amber-500" />
              <span className="font-black">{averageRating}</span>
            </div>

            <div className="mt-4 text-xl font-black text-primary">
              ₹{displayStartingPrice}/month
            </div>
          </div>

          <FeatureList
            title="Amenities"
            items={pg?.amenities?.length ? pg.amenities : ["Wifi", "CCTV Security", "RO Water", "Power Backup"]}
            icon="⭐"
          />
          <FeatureList
            title="Facilities"
            items={pg?.facilities?.length ? pg.facilities : ["Common Kitchen", "Housekeeping", "Laundry Area"]}
            icon="🛠️"
          />
          <HouseRules pg={pg} ruleIcons={ruleIcons} />
        </div>
      </div>

      {/* ================= FEEDBACK MODAL ================= */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute top-4 right-4"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h2 className="font-black mb-4">Write a Review</h2>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-2xl ${
                    n <= rating ? "text-amber-500" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm"
              placeholder="Write your feedback..."
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="flex-1 bg-gray-100 py-2 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 bg-primary text-white py-2 rounded-xl font-bold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const FeatureList = ({ title, items, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow">
    <h2 className="font-black mb-4">{icon} {title}</h2>
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="px-4 py-2 bg-amber-50 rounded-xl text-xs font-black uppercase">
          {item}
        </span>
      ))}
    </div>
  </div>
);

const HouseRules = ({ pg, ruleIcons }) => {
  const rules = pg?.houseRules || pg?.rulesList || pg?.rules || [];
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="font-black mb-4">📜 House Rules</h2>
      <div className="space-y-3">
        {rules.map((rule, i) => (
          <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl">
            <span className="text-xl">{ruleIcons[rule.icon?.toLowerCase()] || "✅"}</span>
            <span className="text-xs font-black uppercase text-gray-600">
              {typeof rule === "object" ? rule.text : rule}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotFoundState = () => (
  <div className="min-h-screen flex items-center justify-center font-black text-red-500">
    Property Not Found
  </div>
);

export default PGDetails;