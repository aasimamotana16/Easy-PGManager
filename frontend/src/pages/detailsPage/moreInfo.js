import React, { useState } from "react";
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

const PGFullDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pg = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === parseInt(id)
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pg) return null;
  const gallery = pg.roomImages || [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-roboto">
      <Navbar />

      <div className="flex-1 w-full px-0 py-12">
        <div className="flex justify-center">
          <div className="max-w-7xl w-full lg:flex lg:gap-8 px-4 sm:px-6 lg:px-0">
            {/* Left: Image and Book Now */}
            <div className="lg:w-1/2 flex flex-col gap-8">
              {gallery.length > 0 ? (
                <div className="relative h-80 sm:h-[450px] rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={gallery[currentIndex].startsWith("http") ? gallery[currentIndex] : process.env.PUBLIC_URL + gallery[currentIndex]}
                    alt="PG"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setCurrentIndex(prev =>
                        prev === 0 ? gallery.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentIndex(prev =>
                        prev === gallery.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-80 sm:h-[450px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                  No Images Available
                </div>
              )}

              {/* Book Now Button below image */}
              <div className="flex justify-center mt-4">
                <CButton
                  size="lg"
                  className="text-base sm:text-lg px-6 py-2"
                  onClick={() => navigate(`/book/${pg.id}`)}
                  disabled={!pg.sharing || pg.sharing.length === 0}
                >
                  Book Now
                </CButton>
              </div>
            </div>

            {/* Right: Details */}
            <div className="lg:w-1/2 flex flex-col gap-3 mt-6 lg:mt-0">
              {/* Basic Info */}
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pg.name}</h1>
                <p className="text-base sm:text-lg text-gray-600">{pg.location}</p>
                {pg.address && <p className="text-sm sm:text-base text-gray-600">{pg.address}</p>}
                {pg.ownerName && <p className="text-sm sm:text-base text-gray-600">Owner: {pg.ownerName}</p>}
                 {pg.ownerContact && <p className="text-sm sm:text-base text-gray-600">Contact: {pg.ownerContact}</p>}
                {pg.startingPrice && <p className="text-sm sm:text-base text-gray-600">Starting Price: {pg.startingPrice}</p>}
                {pg.pgType && <p className="text-sm sm:text-base text-gray-600">PG Type: {pg.pgType}</p>}
                {pg.rating && <p className="text-sm sm:text-base text-yellow-500">Rating: {pg.rating} ★</p>}
                {pg.description && <p className="text-sm sm:text-base text-gray-700 mt-2">{pg.description}</p>}
              </div>

              {/* Room Sharing & Prices */}
              {pg.sharing?.length > 0 && (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h2 className="font-semibold text-lg sm:text-xl mb-2">Room Sharing & Prices</h2>
                  <div className="flex gap-3 flex-wrap">
                    {pg.sharing.map((room, i) => (
                      <div key={i} className="bg-amber-100 p-2 rounded-lg flex-1 text-center">
                        <p className="text-sm sm:text-base">{room.type}</p>
                        <p className="text-base sm:text-lg font-semibold text-amber-600">{room.price}/month</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {pg.amenities?.length > 0 && (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h2 className="font-semibold text-lg sm:text-xl mb-2">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {pg.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="text-sm sm:text-base px-2 py-1 border rounded-full bg-gray-50"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {pg.facilities?.length > 0 && (
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <h2 className="font-semibold text-lg sm:text-xl mb-2">Facilities</h2>
                  <div className="flex flex-wrap gap-2">
                    {pg.facilities.map((f, i) => (
                      <span
                        key={i}
                        className="text-sm sm:text-base px-2 py-1 border rounded-full bg-gray-50"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* House Rules */}
              {pg.rulesList?.length > 0 && (
                <div className="bg-amber-100 p-3 rounded-lg shadow-sm">
                  <h2 className="font-semibold text-lg sm:text-xl mb-2">House Rules</h2>
                  <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    {pg.rulesList.map((rule, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span>{ruleIcons[rule.icon] || "•"}</span>
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
