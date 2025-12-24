// src/components/ListingCard/index.js
export default function ListingCard({ name, location, price, amenities }) {
  return (
    <div className="p-6 border border-border rounded-xl bg-card shadow-card hover:shadow-hover transition">
      <h3 className="text-xl font-semibold text-primary mb-1">{name}</h3>
      <p className="text-sm text-text-secondary mb-1">
        <strong>Location:</strong> {location}
      </p>
      <p className="text-sm text-text-secondary mb-1">
        <strong>Price:</strong> {price}
      </p>
      <p className="text-sm text-text-secondary">
        <strong>Amenities:</strong> {amenities.join(", ")}
      </p>
    </div>
  );
}
