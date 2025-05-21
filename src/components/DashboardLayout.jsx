import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="w-full mx-auto overflow-x-hidden">
      <div className="min-h-[calc(100vh-4rem)] animate-fade-in">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;