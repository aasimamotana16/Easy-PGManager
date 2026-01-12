import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { getUserProfile } from "../../../api/api";
import Sidebar from "../../../components/sideBar";

const UserDashboardLayout = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserProfile();
        setUserData(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="flex min-h-screen bg-default">
      {/* Desktop sidebar */}
      <aside className="w-80 p-6 bg-background-dark shadow-md hidden md:flex flex-col">
        <Sidebar />
      </aside>

      {/* Mobile / overlay sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-background-dark shadow-xl p-6 overflow-y-auto">
            <Sidebar closeSidebar={() => setSidebarOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet context={{ userData, isLoading, setSidebarOpen }} />
      </main>
    </div>
  );
};

export default UserDashboardLayout;
