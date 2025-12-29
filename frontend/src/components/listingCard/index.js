export default function ListingCard({
  name,
  location,
  address,
  image,
  roomImages,
}) {
  // Priority: image → roomImages[0]
  const mainImage = image || roomImages?.[0];

  return (
    <div className="w-72 flex-shrink-0 p-4 border border-border rounded-xl bg-card shadow-card hover:shadow-hover transition">
      {/* Image */}
      <div className="w-full h-49 mb-4 rounded-lg overflow-hidden bg-gray-200">
        {mainImage ? (
          <img
            src={mainImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <h3 className="text-xl font-semibold text-primary mb-1">{name}</h3>
      <p className="text-sm text-text-secondary mb-1">
        <strong>Location:</strong> {location}
      </p>
      <p className="text-sm text-text-secondary">
        <strong>Address:</strong> {address || "N/A"}
      </p>
    </div>
  );
}
