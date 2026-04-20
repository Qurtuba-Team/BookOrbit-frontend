/**
 * AdminStudents — /admin/students
 * APIs used:
 *   GET   /students?Page&PageSize&SearchTerm&States&EmailConfirmed&SortColumn&SortDirection
 *   PATCH /students/{id}/approve
 *   PATCH /students/{id}/activate
 *   PATCH /students/{id}/reject
 *   PATCH /students/{id}/ban
 *   PATCH /students/{id}/unban
 *   PATCH /students/{id}/pend
 *   GET   /images/students/{studentId}
 * Access: Admin only
 */
import React from "react";
// TODO: implement admin student management table using studentsApi.getAll() + state actions
const AdminStudents = () => (
  <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18]">
    <p className="text-library-primary dark:text-white font-bold">إدارة الطلاب (Admin) — قيد البناء</p>
  </div>
);
export default AdminStudents;
