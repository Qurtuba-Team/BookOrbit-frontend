import React from "react";
import Navbar from "../components/common/Navbar";

/**
 * BorrowingTransactions
 *
 * APIs for this page:
 * - GET /borrowingtransactions/{borrowingTransactionId}
 * - PATCH /borrowingtransactions/{borrowingTransactionId}/return
 * - PATCH /borrowingtransactions/{borrowingTransactionId}/lost
 *
 * Admin extension:
 * - GET /borrowingtransactions
 */
const BorrowingTransactions = () => (
  <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18] pt-32">
      <p className="text-library-primary dark:text-white font-bold">
        معاملات الاستعارة — أساس الصفحة جاهز
      </p>
    </div>
  </>
);

export default BorrowingTransactions;
