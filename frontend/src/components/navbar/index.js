import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import CButton from "../../components/cButton";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutSuccessful, setIsLogoutSuccessful] = useState(false);

  const role = localStorage.getItem("role");

  const checkLoginStatus = () => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserName(localStorage.getItem("userName") || "User");
  };

  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  useEffect(() => {
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (token) {
        await axios.post(
          "http://localhost:5000/api/users/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsLogoutSuccessful(true);

      setTimeout(() => {
        localStorage.clear();
        setProfileOpen(false);
        setIsLogoutModalOpen(false);
        setIsLogoutSuccessful(false);
        navigate("/");
        window.dispatchEvent(new Event("storage"));
      }, 1500);
    } catch {
      localStorage.clear();
      navigate("/");
    }
  };

  const navLinkClass = (path) => {
  const isActive = location.pathname === path;
  
  return `relative text-sm transition-all pb-1
    ${isActive ? "text-primary " : "text-white hover:text-white"}
    
    after:content-[''] after:absolute after:left-0 after:bottom-0 
    after:h-[2px] after:bg-primary after:transition-all after:duration-300
    ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
  `;
};

  const goToDashboard = () => {
    navigate(role === "owner" ? "/owner/dashboard/dashboardHome" : "/user/dashboard/dashboardHome");
    setProfileOpen(false);
  };

  const goToProfile = () => {
    navigate(role === "owner" ? "/owner/dashboard/profileStatus" : "/user/userProfile");
    setProfileOpen(false);
  };

  return (
    <>
      <nav className="bg-black border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-[100]">
        
        {/* LEFT: LOGO ONLY */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/logos/logo1.png" className="h-9 w-auto mr-1" alt="logo" />
          <span className="text-white  text-lg">
            EasyPG <span className="text-primary">Manager</span>
          </span>
        </div>

        {/* CENTER: NAV LINKS */}
<div className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-x-4 gap-y-2 lg:gap-8 px-2">
  {[
    ["/", "Home"],
    ["/about", "About"],
    ["/services", "Services"],
    ["/findmypg", "FindMyPG"],
    ["/contact", "Contact"],
    ["/faq", "FAQ"],
  ].map(([path, label]) => (
    <button
      key={path}
      onClick={() => navigate(path)}
      className={`
        relative py-1 lg:py-2 text-xs sm:text-base lg:text-base  tracking-wide transition-all duration-300
        ${location.pathname === path 
          ? "text-orange-500" 
          : "text-white hover:text-primary"}
        group whitespace-nowrap
      `}
    >
      {label}
      {/* Animated Underline Effect - Visible on all screens */}
      <span className={`
        absolute bottom-0 left-0 h-[2px] bg-orange-500 transition-all duration-300
        ${location.pathname === path ? "w-full" : "w-0 group-hover:w-full"}
      `}></span>
    </button>
  ))}
</div>

        {/* RIGHT: PROFILE */}
       <div className="flex items-center gap-4">
  {!isLoggedIn ? (
    <div className="flex gap-3">
      {/* Login Button */}
      <CButton 
        variant="outline" // Assuming your CButton supports a variant or custom styling
        className=" text-base " 
        text="Login" 
        onClick={() => navigate("/login")} 
      />
      
      {/* Sign Up Button */}
      <CButton 
        className=" text-base" 
        text="Sign Up" 
        onClick={() => navigate("/signup")} 
      />
    </div>
          ) : (
            <div className="relative">
              <button
                className="flex items-center gap-2 text-white"
                onClick={() => setProfileOpen((p) => !p)}
              >
                <div className="flex flex-col items-end hidden sm:block">
    
                  <span className="text-base font-medium">{userName}</span>
                </div>
                <FaUserCircle size={28} className="text-orange-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl z-[110] overflow-hidden border border-gray-100">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm  text-gray-900 truncate">{userName}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={goToDashboard} className="w-full px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left">
                      Dashboard
                    </button>
                    <button onClick={goToProfile} className="w-full px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left">
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-red-600 hover:bg-gray-100 text-sm text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            {!isLogoutSuccessful ? (
              <>
                <h3 className="text-xl  text-gray-900">Sign Out?</h3>
                <p className="text-gray-500 mt-2 text-sm">
                  Are you sure you want to end your session?
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-md  text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 bg-primary text-white rounded-md  text-sm"
                  >
                    YES
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4">
                  ✓
                </div>
                <h3 className="text-xl ">Logged Out</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;