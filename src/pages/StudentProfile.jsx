/**
 * StudentProfile — /profile
 * APIs used:
 *   GET  /students/me
 *   PATCH /students/{studentId}   (multipart/form-data)
 *   GET  /images/students/{studentId}
 *   GET  /identity/users/me
 *   POST /identity/users/{userId}/send-email-confirmation
 */
import React from "react";
// TODO: implement full profile UI using studentsApi.getMe(), studentsApi.update(), identityApi.getMe()
const StudentProfile = () => (
  <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18]">
    <p className="text-library-primary dark:text-white font-bold">صفحة الملف الشخصي — قيد البناء</p>
  </div>
);
export default StudentProfile;
