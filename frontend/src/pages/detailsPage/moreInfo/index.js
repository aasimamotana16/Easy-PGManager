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

  const pg = [...pgdetails].find(
    (item) => item.id === Number(id)
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pg) return null;

  const gallery = pg.roomImages || [];

  return (
    <div className="min-h-screen flex flex-col bg-background font-roboto">
      <Navbar />

      <div className="flex-1 w-full py-12">
        <div className="flex justify-center">
          <div className="max-w-7xl w-full lg:flex lg:gap-40 px-4 sm:px-6">

            {/* LEFT SECTION */}
            <div className="lg:w-2/3 flex flex-col gap-8">

              {/* IMAGE CAROUSEL */}
              {gallery.length > 0 ? (
                <div className="relative h-80 sm:h-[450px] rounded-xl overflow-hidden shadow-lg">
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
                </div>
              ) : (
                <div className="h-80 sm:h-[450px] bg-surface rounded-xl flex items-center justify-center">
                  No Images Available
                </div>
              )}

              {/* ✅ MAP SECTION (FIXED) */}
              {(pg.address || pg.location) && (
                <div className="w-full rounded-xl overflow-hidden shadow-lg bg-card">
                  <iframe
                    title="PG Location"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${pg.address || ""} ${pg.location || ""}`
                    )}&output=embed`}
                    className="w-full h-[300px]"
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

              {/* BOOK NOW */}
              <div className="flex justify-center">
                <CButton
                  size="lg"
                  className="text-lg px-8 py-3"
                  onClick={() => navigate(`/book/${pg.id}`)}
                >
                  Book Now
                </CButton>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="lg:w-1/2 flex flex-col gap-4 mt-6 lg:mt-0">

              {/* PG INFO */}
              <div className="bg-card p-4 rounded-lg shadow-sm space-y-1">
                <h1 className="text-3xl font-bold">{pg.name}</h1>
                <p className="text-lg text-text-secondary">{pg.location}</p>
                {pg.address && <p className="text-sm">{pg.address}</p>}
                {pg.ownerName && <p className="text-sm">Owner: {pg.ownerName}</p>}
                {pg.ownerContact && (
                  <p className="text-sm">Contact: {pg.ownerContact}</p>
                )}
                {pg.startingPrice && (
                  <p className="text-sm">{pg.startingPrice}</p>
                )}
                {pg.rating && (
                  <p className="text-warning">Rating: {pg.rating} ★</p>
                )}
              </div>

              {/* ROOM SHARING */}
              {pg.sharing?.length > 0 && (
                <div className="bg-card p-3 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-2">
                    Room Sharing & Prices
                  </h2>
                  <div className="flex gap-3">
                    {pg.sharing.map((room, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-warning-light rounded-lg p-2 text-center"
                      >
                        <p>{room.type}</p>
                        <p className="font-semibold">
                          {room.price}/month
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AMENITIES */}
              {pg.amenities?.length > 0 && (
                <div className="bg-card p-3 rounded-lg shadow-sm">
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
                <div className="bg-card p-3 rounded-lg shadow-sm">
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
                <div className="bg-warning-light p-3 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold mb-2">House Rules</h2>
                  <ul className="space-y-2">
                    {pg.rulesList.map((rule, i) => (
                      <li key={i} className="flex gap-2">
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
      </div>

      <Footer />
    </div>
  );
};

export default PGFullDetails;
