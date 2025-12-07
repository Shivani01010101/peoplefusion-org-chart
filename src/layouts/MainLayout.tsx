import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">{children}</div>
);

export default MainLayout;
