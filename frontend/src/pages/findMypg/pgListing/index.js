import ListingCard from "../../../components/listingCard";
import { Link } from "react-router-dom";

export default function PGListings({ list = [] }) {
  if (!list.length)
    return <p className="text-center text-lg mt-6">No PGs found</p>;

  return (
    <>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-24 mb-6">
        Available PGs
      </h2>

      {/* Horizontal scroll container */}
      <div className="flex gap-6 overflow-x-auto py-4 px-2">
        {list.map((pg) => (
          <Link
            key={pg.id}
            to={`/pg/${pg.id}`}
            className="hover:scale-[1.03] transition transform"
          >
            <ListingCard {...pg} />
          </Link>
        ))}
      </div>
    </>
  );
}
