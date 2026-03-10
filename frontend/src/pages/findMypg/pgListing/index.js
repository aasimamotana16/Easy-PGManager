import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ListingCard from "../../../components/listingCard";
import { BackendContext } from "../../../context/backendContext";
import { SearchX } from "lucide-react";

export default function PGListings({ list: filteredList }) {
  const { pgList } = useContext(BackendContext);
  const navigate = useNavigate();

  // Use filtered list from props, fallback to context
  const displayList = filteredList || pgList;

  const handleNavigate = (id) => {
    navigate(`/pg/${id}`);
  };

  if (!displayList || displayList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#FEF3C7]/10 rounded-md border border-dashed border-[#E5E0D9]">
        <SearchX size={56} className="text-[#4B4B4B]/20 mb-4" />
        <h3 className="text-lg font-semibold text-[#1C1C1C]">No PGs Found</h3>
        <p className="text-[#4B4B4B] text-sm">Try adjusting your filters or search area.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Result Count Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1C1C1C]">
          Available Properties 
          <span className="text-[#D97706] ml-2 text-lg">({displayList.length})</span>
        </h2>
      </div>

      {/* VERTICAL STACK OF HORIZONTAL CARDS */}
      <div className="flex flex-col gap-8">
        {displayList.map((pg) => (
          <div
            key={pg._id}
            onClick={() => handleNavigate(pg._id)}
            className="w-full cursor-pointer transition-all duration-300"
          >
            {/* We pass the data to ListingCard. 
                The ListingCard now handles the 'beside the photo' layout 
                using flex-row internally as we updated.
            */}
            <ListingCard 
              name={pg.name}
              location={pg.location}
              image={pg.mainImage || pg.image}
              roomImages={pg.roomImages}
              price={pg.rent || pg.price} // Handling different field names
              availability={pg.availability}
            />
          </div>
        ))}
      </div>
    </div>
  );
}