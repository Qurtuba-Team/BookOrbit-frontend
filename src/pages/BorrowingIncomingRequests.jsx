import React from "react";
import Navbar from "../components/common/Navbar";

/**
 * BorrowingIncomingRequests
 *
 * APIs for this page:
 * - GET /borrowingrequests/me/in
 * - PATCH /borrowingrequests/{borrowingRequestId}/accept
 * - PATCH /borrowingrequests/{borrowingRequestId}/reject
 * - POST /borrowingrequests/{borrowingRequestId}/deliver
 * - GET /borrowingrequests/{borrowingRequestId}
 */
const BorrowingIncomingRequests = () => (
  <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18] pt-32">
      <p className="text-library-primary dark:text-white font-bold">
        طلبات الاستعارة الواردة — أساس الصفحة جاهز
      </p>
    </div>
  </>
);

export default BorrowingIncomingRequests;
