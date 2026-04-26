import React from "react";
import Navbar from "../components/common/Navbar";

/**
 * BorrowingOutgoingRequests
 *
 * APIs for this page:
 * - GET /borrowingrequests/me/out
 * - PATCH /borrowingrequests/{borrowingRequestId}/cancel
 * - GET /borrowingrequests/{borrowingRequestId}
 */
const BorrowingOutgoingRequests = () => (
  <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18] pt-32">
      <p className="text-library-primary dark:text-white font-bold">
        طلبات الاستعارة الصادرة — أساس الصفحة جاهز
      </p>
    </div>
  </>
);

export default BorrowingOutgoingRequests;
