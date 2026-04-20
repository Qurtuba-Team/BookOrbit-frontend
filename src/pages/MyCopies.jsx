/**
 * MyCopies — /my-copies
 * APIs used:
 *   GET  /students/{studentId}/books/copies?Page&PageSize&Conditions&States
 *   POST /students/{studentId}/books/copies  { bookId, condition }
 *   POST /students/{studentId}/books/copies/{bookCopyId}/list?borrowingDurationInDays
 * Access: Student ownership
 */
import React from "react";
// TODO: implement student copies management using bookCopiesApi.getByStudent(), bookCopiesApi.create(), bookCopiesApi.listForLending()
const MyCopies = () => (
  <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18]">
    <p className="text-library-primary dark:text-white font-bold">كتبي — قيد البناء</p>
  </div>
);
export default MyCopies;
