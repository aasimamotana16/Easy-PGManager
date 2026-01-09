import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getUserProfile } from "../../../api/api"; 

const UserDashboardLayout = () => {
  // Logic running in the background
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <aside className="w-64 bg-background-dark shadow-md hidden md:block">
        <div className="p-6 text-xl font-semibold text-white">
          EasyPG Manager
        </div>

        <nav className="px-4 space-y-2">
          <MenuLink to="/user/dashboard" label="Dashboard" />
          <MenuLink to="/user/dashboard/userprofile" label="Profile" />
          <MenuLink to="/user/dashboard/payments" label="Payments" />
          <MenuLink to="/user/dashboard/agreements" label="Agreements" />
          <MenuLink to="/user/dashboard/check-ins" label="Check-ins" />
          <MenuLink to="/user/dashboard/documents" label="Documents" />
          <MenuLink to="/user/dashboard/timeline" label="Timeline" />
          <MenuLink to="/user/dashboard/owner-contact" label="Owner Contact" />
          <MenuLink to="/user/dashboard/support" label="Support" />
          <MenuLink to="/user/dashboard/explorePage" label="Explore PGs&Hostels"/>
        </nav>
      </aside>

      {/* Main content - Pass context so sub-pages can access userData */}
      <main className="flex-1 p-6">
        <Outlet context={{ userData, isLoading }} /> 
      </main>
    </div>
  );
};

const MenuLink = ({ to, label }) => (
  <NavLink
    to={to}
    end={to === "/user/dashboard"}
    className={({ isActive }) =>
      `block px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
        isActive
          ? "bg-primary text-white font-medium"
          : "text-white hover:text-primary"
      }`
    }
  >
    {label}
  </NavLink>
);

export default UserDashboardLayout;