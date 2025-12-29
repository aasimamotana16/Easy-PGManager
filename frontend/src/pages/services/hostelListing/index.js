import ListingCard from "../../../components/listingCard";
import { Link } from "react-router-dom";

export default function HostelListings({ list = [] }) {
  if (!list.length)
    return <p className="text-center text-lg mt-6">No Hostels found</p>;

  return (
    <>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-24 mb-6">
        Available Hostels
      </h2>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-6 overflow-x-auto py-4 px-2 scrollbar-hide">
        {list.map((hostel) => (
          <Link
            key={hostel.id}
            to={`/pg/${hostel.id}`}
            className="hover:scale-[1.03] transition-transform flex-shrink-0"
          >
            <ListingCard {...hostel} />
          </Link>
        ))}
      </div>
    </>
  );
}
