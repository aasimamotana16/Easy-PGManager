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
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-3xl font-bold text-red-500">
            PG / Hostel not found!
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const mainImage = pg.image || pg.roomImages?.[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 py-16">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            {pg.name}
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary">
            {pg.location}
          </p>
        </div>

        {/* Horizontal Card Layout */}
        <div className="flex flex-col lg:flex-row gap-40 items-start">
          
          {/* Left: Image with frame */}
          <div className="lg:w-full bg-gray-100 p-3 rounded-2xl shadow-inner flex items-center justify-center">
            {mainImage ? (
              <img
                src={
                  mainImage.startsWith("http")
                    ? mainImage
                    : process.env.PUBLIC_URL + mainImage
                }
                alt={pg.name}
                className="w-full h-80 md:h-96 lg:h-[500px] object-cover rounded-xl shadow-inner"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Right: Info Section */}
          <div className="lg:w-full bg-white rounded-3xl shadow-lg p-8 flex flex-col justify-between space-y-6">
            
            {/* Price */}
            {(pg.price || pg.startingPrice) && (
              <div>
                <p className="text-sm text-text-secondary mb-1">
                  Starting Price
                </p>
                <p className="text-2xl font-bold text-primary">
                  {pg.price || pg.startingPrice}
                  <span className="text-base font-medium text-text-secondary">
                    {" "} / month
                  </span>
                </p>
              </div>
            )}

            {/* Owner */}
            {pg.ownerName && (
              <div>
                <p className="text-sm text-text-secondary mb-1">Owner</p>
                <p className="text-lg font-semibold">{pg.ownerName}</p>
              </div>
            )}

            {/* Address */}
            {pg.address && (
              <div>
                <p className="text-sm text-text-secondary mb-1">Address</p>
                <p className="text-lg">{pg.address}</p>
              </div>
            )}

            {/* PG Type */}
            {pg.pgType && (
              <div>
                <p className="text-sm text-text-secondary mb-1">PG Type</p>
                <p className="text-lg">{pg.pgType}</p>
              </div>
            )}

            {/* Availability */}
            {pg.availability && (
              <div>
                <p className="text-sm text-text-secondary mb-1">Availability</p>
                <p className="text-lg font-semibold">{pg.availability}</p>
              </div>
            )}

            {/* Rating */}
            {pg.rating && (
              <div>
                <p className="text-sm text-text-secondary mb-1">Rating</p>
                <p className="text-lg font-semibold text-amber">
                  {pg.rating} ★
                </p>
              </div>
            )}

            {/* Facilities */}
            {pg.facilities?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Facilities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {pg.facilities.map((facility, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 text-sm rounded-full bg-gray-100 border border-border"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4">
              <CButton
                size="lg"
                fullWidth
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
