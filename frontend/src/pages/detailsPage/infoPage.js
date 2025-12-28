import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { pgdetails, hosteldetails } from "../../config/staticData";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CButton from "../../components/cButton";

const PGOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const pg = [...pgdetails, ...hosteldetails].find(
    (item) => item.id === parseInt(id)
  );

  if (!pg) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 max-w-5xl mx-auto px-4 py-24 text-center">
          <p className="text-3xl font-bold text-red-500">
            PG / Hostel not found!
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-roboto">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="mb-12 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {pg.name}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600">{pg.location}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Image */}
          {pg.image ? (
            <img
              src={pg.image.startsWith("http") ? pg.image : process.env.PUBLIC_URL + pg.image}
              alt={pg.name}
              className="w-full h-72 sm:h-80 md:h-96 object-cover rounded-xl shadow-lg border"
            />
          ) : (
            <div className="w-full h-72 sm:h-80 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}

          {/* Info */}
          <div className="bg-white border rounded-xl p-6 sm:p-8 space-y-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              {/* Monthly Rent */}
              {pg.price && (
                <div>
                  <p className="text-gray-500 text-sm sm:text-base mb-1">Monthly Rent</p>
                  <p className="text-2xl sm:text-3xl font-semibold">{pg.price}</p>
                </div>
              )}

              {/* Starting Price */}
              {pg.startingPrice && (
                <div>
                  <p className="text-gray-500 text-sm sm:text-base mb-1">Starting Price</p>
                  <p className="text-lg sm:text-xl font-medium">{pg.startingPrice}</p>
                </div>
              )}

              {/* Owner Name */}
              {pg.ownerName && (
                <div>
                  <p className="text-gray-500 text-sm sm:text-base mb-1">Owner</p>
                  <p className="text-lg sm:text-xl font-medium">{pg.ownerName}</p>
                </div>
              )}

              {/* Address */}
              {pg.address && (
                <div>
                  <p className="text-gray-500 text-sm sm:text-base mb-1">Address</p>
                  <p className="text-lg sm:text-xl font-medium">{pg.address}</p>
                </div>
              )}

              {/* PG Type */}
              {pg.pgType && (
                <div>
                  <p className="text-gray-500 text-sm sm:text-base mb-1">PG Type</p>
                  <p className="text-lg sm:text-xl font-medium">{pg.pgType}</p>
                </div>
              )}

              {/* Rating */}
              {pg.rating && (
                <div className="flex items-center gap-1">
                  <p className="text-gray-500 text-sm sm:text-base mb-1">Rating:</p>
                  <p className="text-lg sm:text-xl font-medium text-yellow-500">{pg.rating} ★</p>
                </div>
              )}

              {/* Facilities */}
              {pg.facilities?.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">
                    Facilities
                  </h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                    {pg.facilities.map((f, i) => (
                      <span
                        key={i}
                        className="px-3 py-2 text-sm sm:text-base bg-gray-100 rounded-full border"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View Full Details Button */}
            <div className="pt-4 flex justify-center lg:justify-start">
              <CButton
                className="w-full sm:w-auto text-lg sm:text-xl"
                onClick={() => navigate(`/pg/${pg.id}/details`)}
              >
                View Full Details
              </CButton>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PGOverview;
