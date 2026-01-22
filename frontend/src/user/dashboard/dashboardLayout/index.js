import { Outlet } from "react-router-dom";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import UserSidebar from "../sideBar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // 🔒 Lock dashboard height & prevent page scroll (same as OwnerLayout)
    <div className="flex h-screen bg-white overflow-hidden">

      {/* SIDEBAR */}
      <UserSidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
     < div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* MOBILE TOP BAR (same pattern as Owner) */}
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
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
