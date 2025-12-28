import ListingCard from "../../../components/listingCard";
import { Link } from "react-router-dom";

export default function HostelListings({ list = [] }) {
  if (!list.length) return <p className="text-center">No Hostels found</p>;

  return (
    <>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-24 mb-10">
        Available Hostels
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        {list.map((hostel) => (
          <Link key={hostel.id} to={`/pg/${hostel.id}`} className="hover:scale-[1.03] transition">
            <ListingCard {...hostel} />
          </Link>
        ))}
      </div>
    </>
  );
}
