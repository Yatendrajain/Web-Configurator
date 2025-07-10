import React from "react";
// import TopNavbar from "@/components/navbars/TopNavbar";

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <TopNavbar /> */}
      <main className="common-layout-main">{children}</main>
    </>
  );
}
