import { Outlet } from "react-router-dom";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import OwnerSidebar from "../ownerSideBar";

const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // 🔒 Lock entire dashboard height & stop page scroll
    <div className="flex h-screen bg-white overflow-hidden">

      {/* SIDEBAR (fixed, no scroll) */}
      <OwnerSidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* MOBILE TOP BAR */}
        <div className="lg:hidden sticky top-0 z-40 bg-white shadow px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700"
          >
            <FaBars size={22} />
          </button>
          <span className="ml-4 font-semibold text-gray-800">
            EasyPG Manager
          </span>
        </div>

        {/* ✅ ONLY THIS PART SCROLLS */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
