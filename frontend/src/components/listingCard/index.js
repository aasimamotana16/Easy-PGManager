export default function ListingCard({
  name,
  location,
  image,
  roomImages,
  price,
  availability,
}) {
  const mainImage = image || roomImages?.[0];

  return (
    <div className="w-80 flex-shrink-0 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-transform hover:scale-[1.02] flex flex-col overflow-hidden">
      
      {/* Framed Image */}
      <div className="w-full h-64 md:h-72 lg:h-80 bg-gray-100 p-3 flex items-center justify-center">
        {mainImage ? (
          <img
            src={mainImage}
            alt={name}
            className="w-full h-full object-cover rounded-xl shadow-inner"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-amber-600 mb-1 truncate">
            {name}
          </h3>

          <p className="text-sm text-gray-700 mb-1 truncate">
            <strong>Location:</strong> {location}
          </p>

          {price && (
            <p className="text-sm text-gray-700 mb-1">
              <strong>Price:</strong> {price}
            </p>
          )}

          {availability && (
            <p className="text-sm text-gray-700 mb-3">
              <strong>Availability:</strong> {availability}
            </p>
          )}
        </div>

        {/* View Button */}
        <button className="bg-amber-600 text-white font-semibold py-2 rounded-xl w-full hover:bg-amber-700 transition">
          View
        </button>
      </div>
    </div>
  );
}
