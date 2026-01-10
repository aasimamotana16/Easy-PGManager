// src/pages/detailsPage/index.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pgdetails, hosteldetails } from "../../config/staticData";
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

const PGDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pg = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === Number(id)
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const gallery = pg?.roomImages || [];

  // Auto-slide carousel
  useEffect(() => {
    if (gallery.length <= 1) return; // only slide if more than 1 image
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === gallery.length - 1 ? 0 : prev + 1
      );
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [gallery.length]);

  if (!pg)
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-3xl font-bold text-red-500">
            PG / Hostel not found!
          </p>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-background font-roboto">
      <Navbar />

      <div className="flex-1 w-full py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto lg:flex lg:gap-10">

          {/* LEFT SECTION: Carousel + Book Now + Map */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            {/* IMAGE CAROUSEL */}
            <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
              {gallery.length > 0 ? (
                <>
                  <img
                    src={
                      gallery[currentIndex].startsWith("http")
                        ? gallery[currentIndex]
                        : process.env.PUBLIC_URL + gallery[currentIndex]
                    }
                    alt={pg.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? gallery.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === gallery.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No Images Available
                </div>
              )}
            </div>

            {/* BOOK NOW */}
            <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-md">
              <div>
                <p className="text-lg sm:text-xl font-semibold">
                  Starting from {pg.startingPrice || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Secure your stay instantly
                </p>
              </div>
              <CButton
                size="lg"
                onClick={() => navigate(`/book/${pg.id}`)}
              >
                Book Now
              </CButton>
            </div>

            {/* MAP */}
            {(pg.address || pg.location) && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <iframe
                  title="PG Location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${pg.address || ""} ${pg.location || ""}`
                  )}&output=embed`}
                  className="w-full h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="flex justify-center py-4">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${pg.address || ""} ${pg.location || ""}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition"
                  >
                    Start Location
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SECTION: Info Cards */}
          <div className="lg:w-1/2 flex flex-col gap-5 mt-8 lg:mt-0">

            {/* PG INFO */}
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-2">
              <h1 className="text-3xl font-bold">{pg.name}</h1>
              <p className="text-lg text-gray-600">{pg.location}</p>
              {pg.address && <p className="text-sm text-gray-500">{pg.address}</p>}
              {pg.ownerName && <p className="text-sm">Owner: {pg.ownerName}</p>}
              {pg.ownerContact && <p className="text-sm">Contact: {pg.ownerContact}</p>}
              {pg.rating && <p className="text-yellow-500 font-semibold">Rating: {pg.rating} ★</p>}
            </div>

            {/* ROOM SHARING */}
            {pg.sharing?.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-2">Room Options</h2>
                <div className="flex gap-3">
                  {pg.sharing.map((room, i) => (
                    <div
                      key={i}
                      className="flex-1 border border-gray-200 rounded-lg p-2 text-center"
                    >
                      <p>{room.type}</p>
                      <p className="font-semibold text-primary">{room.price}/mo</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AMENITIES */}
            {pg.amenities?.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-2">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {pg.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 border rounded-full text-sm"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FACILITIES */}
            {pg.facilities?.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-2">Facilities</h2>
                <div className="flex flex-wrap gap-2">
                  {pg.facilities.map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 border rounded-full text-sm"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* HOUSE RULES */}
            {pg.rulesList?.length > 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-2">House Rules</h2>
                <ul className="space-y-2">
                  {pg.rulesList.map((rule, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <span>{ruleIcons[rule.icon]}</span>
                      <span>{rule.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PGDetails;
