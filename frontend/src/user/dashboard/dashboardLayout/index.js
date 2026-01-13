// src/user/dashboard/dashboardLayout/index.js

import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../sideBar"

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-dashboard-gradient">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <UserSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
