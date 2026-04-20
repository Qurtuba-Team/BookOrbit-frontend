/**
 * LendingList — /lending
 * APIs used:
 *   GET /lendinglist?Page&PageSize&SearchTerm&SortColumn&SortDirection&BookCopyId&BookId&States
 *   GET /lendinglist/{lendingListRecordId}
 * Access: Active student
 * Sort options: createdat, updatedat, cost, borrowingduration, expirationdate, state
 */
import React from "react";
// TODO: implement lending list with filters using lendingApi.getAll(), lendingApi.getById()
const LendingList = () => (
  <div className="min-h-screen flex items-center justify-center bg-library-paper dark:bg-[#060e18]">
    <p className="text-library-primary dark:text-white font-bold">قائمة الإعارة — قيد البناء</p>
  </div>
);
export default LendingList;
