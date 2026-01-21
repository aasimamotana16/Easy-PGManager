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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* MOBILE TOP BAR */}
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-700 p-1 -ml-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Open menu"
            >
              <FaBars size={20} />
            </button>
            <span className="ml-3 font-bold text-gray-900 tracking-tight">
              EasyPG Manager
            </span>
          </div>
          {/* Optional: Add user avatar icon here for better UI */}
        </div>

        {/* ✅ DYNAMIC PADDING: p-3 on mobile, p-6 on desktop */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto"> 
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;