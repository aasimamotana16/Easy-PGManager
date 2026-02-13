import { getImageUrl } from "../../utils/imageUtils";

export default function ListingCard({
  name,
  location,
  image,
  roomImages,
  price,
  availability,
}) {
  // Use getImageUrl to convert relative paths to full URLs
  const mainImage = getImageUrl(image || roomImages?.[0]);

  return (
    /* Changed to flex-row for desktop, removed w-80 to fill the 50% container */
    <div className="w-full flex flex-col md:flex-row bg-white rounded-3xl border border-[#E5E0D9] transition-transform hover:scale-[1.01] overflow-hidden shadow-sm">
      
      {/* LEFT SIDE: Framed Image (takes 40% on desktop) */}
      <div className="w-full md:w-[40%] h-56 md:h-64 bg-white p-3 flex items-center justify-center">
        {mainImage ? (
          <img
            src={mainImage}
            alt={name}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded-2xl text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Content (takes 60% on desktop) */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-[#D97706] truncate">
              {name}
            </h3>
            {price && (
               <span className="text-lg font-bold text-[#1C1C1C]">₹{price}</span>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[#4B4B4B] flex items-center gap-1">
              <strong className="text-[#1C1C1C]">Location:</strong> 
              <span className="truncate">{location}</span>
            </p>

            {availability && (
              <p className="text-sm text-[#4B4B4B]">
                <strong className="text-[#1C1C1C]">Availability:</strong> {availability}
              </p>
            )}
            
            {/* Added a subtle divider or extra space for clean look */}
            <div className="pt-2 flex flex-wrap gap-2">
               <span className="text-[10px] bg-[#FEF3C7] text-[#B45309] px-2 py-1 rounded font-bold uppercase">
                 Verified PG
               </span>
            </div>
          </div>
        </div>

        {/* View Button - Styled with your primary colors */}
        <div className="mt-6">
          <button className="bg-[#D97706] text-white font-bold py-2.5 px-6 rounded-xl hover:bg-[#B45309] transition-all active:scale-95 w-full md:w-max">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}