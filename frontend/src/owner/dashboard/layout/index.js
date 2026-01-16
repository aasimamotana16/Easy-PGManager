import { Outlet } from "react-router-dom";
import OwnerSidebar from "../ownerSideBar";
import Navbar from "../../../components/navbar";

const OwnerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-200">
      
      {/* Sidebar */}
      <OwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default OwnerLayout;
