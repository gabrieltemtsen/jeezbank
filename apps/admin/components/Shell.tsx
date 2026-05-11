import React from "react";
import Sidebar from "@/components/Sidebar";

export default function Shell({
  role,
  name,
  children,
}: {
  role: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} name={name} />
      <main className="flex-1 min-w-0 py-7 px-6 lg:px-10 jmb-page-in">
        <div className="max-w-[1500px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
