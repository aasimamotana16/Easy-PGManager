import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pgdetails } from "../../../config/staticData";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const ruleIcons = {
  nosmoke: "🚭",
  nopet: "🐾",
  music: "🔕",
  clean: "🧹",
  noguest: "🙅‍♂️",
};

const PGFullDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pg = [...pgdetails].find((item) => item.id === Number(id));
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pg) return null;

  const gallery = pg.roomImages || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-roboto">
      <Navbar />

      <div className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 lg:flex lg:gap-16">

          {/* LEFT SECTION */}
          <div className="lg:w-2/3 flex flex-col gap-10">

            {/* IMAGE CAROUSEL */}
            <div className="relative h-80 sm:h-[450px] rounded-2xl overflow-hidden shadow-md bg-white">
              {gallery.length > 0 ? (
                <>
                  <img
                    src={
                      gallery[currentIndex].startsWith("http")
                        ? gallery[currentIndex]
                        : process.env.PUBLIC_URL + gallery[currentIndex]
                    }
                    alt="PG"
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? gallery.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === gallery.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No Images Available
                </div>
              )}
            </div>

            {/* MAP */}
            {(pg.address || pg.location) && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <iframe
                  title="PG Location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${pg.address || ""} ${pg.location || ""}`
                  )}&output=embed`}
                  className="w-full h-[300px]"
                  loading="lazy"
                />

                <div className="py-4 flex justify-center">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${pg.address || ""} ${pg.location || ""}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* BOOK NOW CTA (CLEAN, NO BORDER) */}
            <div className="flex justify-center pt-2">
              <CButton
                size="lg"
                className="px-12 py-3 text-lg"
                onClick={() => navigate(`/book/${pg.id}`)}
              >
                Book Now
              </CButton>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="lg:w-1/3 flex flex-col gap-6 mt-10 lg:mt-0">

            {/* BASIC INFO */}
            <div className="bg-white rounded-2xl shadow-md p-5 space-y-2">
              <h1 className="text-2xl font-bold">{pg.name}</h1>
              <p className="text-gray-600">{pg.location}</p>

              {pg.address && (
                <p className="text-sm text-gray-500">{pg.address}</p>
              )}

              <div className="pt-2 text-sm space-y-1">
                {pg.ownerName && <p><span className="font-medium">Owner:</span> {pg.ownerName}</p>}
                {pg.ownerContact && <p><span className="font-medium">Contact:</span> {pg.ownerContact}</p>}
              </div>

              {pg.startingPrice && (
                <div className="pt-3 text-lg font-semibold text-primary">
                  Starting from ₹{pg.startingPrice}/month
                </div>
              )}
            </div>

            {/* ROOM SHARING */}
            {pg.sharing?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-5">
                <h2 className="text-lg font-semibold mb-3">Room Categories</h2>
                <div className="grid grid-cols-2 gap-3">
                  {pg.sharing.map((room, i) => (
                    <div
                      key={i}
                      className="bg-orange-50 rounded-lg p-3 text-center"
                    >
                      <p className="text-sm">{room.type}</p>
                      <p className="font-semibold">₹{room.price}/month</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AMENITIES */}
            {pg.amenities?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-5">
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {pg.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm bg-gray-100 rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FACILITIES */}
            {pg.facilities?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-5">
                <h2 className="text-lg font-semibold mb-3">Facilities</h2>
                <div className="flex flex-wrap gap-2">
                  {pg.facilities.map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm bg-gray-100 rounded-full"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* HOUSE RULES */}
            {pg.rulesList?.length > 0 && (
              <div className="bg-orange-50 rounded-2xl shadow-md p-5">
                <h2 className="text-lg font-semibold mb-3">House Rules</h2>
                <ul className="space-y-2 text-sm">
                  {pg.rulesList.map((rule, i) => (
                    <li key={i} className="flex items-center gap-2">
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

export default PGFullDetails;
