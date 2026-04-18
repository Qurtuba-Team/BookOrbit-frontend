/**
 * ConfirmEmail — /confirm-email  (callback page for email link)
 * APIs used:
 *   GET /identity/confirm-email?Id={userId}&token={token}
 * Access: Anonymous
 * Note: This endpoint exists in API code but is missing from Postman collection.
 */
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_V1 } from "../services/api";

const ConfirmEmail = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    const id    = params.get("Id");
    const token = params.get("token");
    if (!id || !token) { setStatus("error"); return; }

    fetch(`${API_V1}/identity/confirm-email?Id=${id}&token=${encodeURIComponent(token)}`)
      .then(r => r.ok ? setStatus("success") : setStatus("error"))
      .catch(() => setStatus("error"));
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-library-paper dark:bg-[#060e18] gap-6" dir="rtl">
      {status === "loading" && <p className="text-library-primary dark:text-white font-bold text-lg">جاري التحقق...</p>}
      {status === "success" && (
        <>
          <p className="text-emerald-500 font-black text-2xl">تم تأكيد بريدك الإلكتروني ✓</p>
          <Link to="/login" className="px-6 py-3 bg-library-accent text-white rounded-xl font-bold">تسجيل الدخول</Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-red-400 font-black text-2xl">رابط التأكيد غير صالح أو منتهي الصلاحية</p>
          <Link to="/login" className="px-6 py-3 bg-library-primary text-white rounded-xl font-bold">العودة</Link>
        </>
      )}
    </div>
  );
};
export default ConfirmEmail;
