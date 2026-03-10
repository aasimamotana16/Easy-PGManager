import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import UserSidebar from "../sideBar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const location = useLocation();

  // 🔄 Trigger Loader on every route change
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 600); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* SIDEBAR */}
      <UserSidebar
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
            >
              <FaBars size={20} />
            </button>
            <span className="ml-3 font-bold text-gray-900">
              EasyPG Manager
            </span>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-gray-50/50 relative">
          
          {/* 🎯 THE CENTRAL CIRCLE LOADER */}
          {pageLoading && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                {/* Custom Animated Circle */}
                <div className="relative w-16 h-16">
                   <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-orange-500 animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-orange-500/10 rounded-full animate-pulse"></div>
                   </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">
                  Loading Dashboard...
                </span>
              </div>
          </div>
          )}

          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;