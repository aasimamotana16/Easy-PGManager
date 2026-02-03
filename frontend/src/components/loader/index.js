import React from "react";

const Loader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-default">
      <div className="flex flex-col items-center animate-pulse">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-100 rounded-full blur-2xl opacity-40 animate-ping"></div>
          <img
            src="/logos/logo1.png"
            alt="EasyPG Logo"
            className="relative h-20 w-20 object-contain"
          />
        </div>

        <h2 className="text-lg font-black text-gray-900 tracking-widest uppercase">
          EasyPG Manager
        </h2>

        <div className="mt-3 flex gap-1">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
