import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { OrbitIcon } from "../components/common/OrbitIcon";

const AdminBooks = () => (
  <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-dark-bg pt-[calc(8rem+env(safe-area-inset-top,0px))] px-4">
      <div className="glass-card max-w-md w-full rounded-2xl p-8 border border-library-primary/10 dark:border-white/[0.08] text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-library-primary/[0.06] dark:bg-white/[0.06] flex items-center justify-center border border-library-primary/10 dark:border-white/10">
            <OrbitIcon className="w-7 h-7" />
          </div>
        </div>
        <h1 className="text-lg font-black text-library-primary dark:text-library-paper">إدارة الكتب</h1>
        <p className="text-sm text-library-primary/55 dark:text-gray-400 font-medium leading-relaxed">
          هذه الصفحة قيد البناء. الإدارة الكاملة للكتب متاحة من لوحة التحكم الرئيسية.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-library-primary text-library-paper text-sm font-bold hover:bg-library-primary/90 transition-colors shadow-lg shadow-library-primary/15"
        >
          الانتقال للوحة الإدارة
        </Link>
      </div>
    </div>
  </>
);
export default AdminBooks;
