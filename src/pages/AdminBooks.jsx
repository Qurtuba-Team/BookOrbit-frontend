/**
 * AdminBooks — /admin/books
 * APIs used:
 *   POST   /books                    multipart/form-data
 *   PATCH  /books/{bookId}           JSON
 *   DELETE /books/{bookId}
 *   GET    /books/copies             (all copies - admin)
 *   PATCH  /books/copies/{copyId}    JSON { condition }
 * Access: Admin only
 */
import React from "react";
// TODO: implement admin book catalog management using booksApi and bookCopiesApi.getAll()
const AdminBooks = () => (
  <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18]">
    <p className="text-library-primary dark:text-white font-bold">إدارة الكتب (Admin) — قيد البناء</p>
  </div>
);
export default AdminBooks;
