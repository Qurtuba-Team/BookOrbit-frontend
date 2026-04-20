/**
 * BookDetail — /books/:bookId
 * APIs used:
 *   GET /books/{bookId}
 *   GET /books/{bookId}/copies?Page&PageSize&Conditions&States
 *   GET /images/books/{bookId}
 *   GET /books/copies/{bookCopyId}
 * Access: Active student
 */
import React from "react";
// TODO: implement book detail with copies list using booksApi.getById(), bookCopiesApi.getByBook()
const BookDetail = () => (
  <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18]">
    <p className="text-library-primary dark:text-white font-bold">تفاصيل الكتاب — قيد البناء</p>
  </div>
);
export default BookDetail;
