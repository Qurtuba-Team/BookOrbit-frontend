import React from "react";
import Navbar from "../components/common/Navbar";

const AdminBooks = () => (
  <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18] pt-32">
      <p className="text-library-primary dark:text-white font-bold">إدارة الكتب (Admin) — قيد البناء</p>
    </div>
  </>
);
export default AdminBooks;
