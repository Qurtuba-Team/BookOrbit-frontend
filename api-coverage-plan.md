# API Coverage Plan (Based on `frontend-api-reference.md`)

## 1) APIs currently wired in frontend

- Identity:
  - `POST /identity/token`
  - `POST /identity/token/refresh`
  - `GET /identity/users/me`
  - `POST /identity/users/send-email-confirmation`
  - `POST /identity/confirm-email`
  - `POST /identity/users/send-reset-password`
  - `POST /identity/reset-password`
  - `POST /identity/users/me/change-password`
- Students:
  - `POST /students`
  - `GET /students/me`
  - `PATCH /students/{studentId}`
  - Admin lifecycle endpoints (`approve`, `activate`, `ban`, `unban`, `reject`, `pend`)
  - `GET /students`
- Books:
  - `POST /books`
  - `GET /books`
  - `GET /books/{bookId}`
  - `PATCH /books/{bookId}`
  - `PATCH /books/{bookId}/available`
  - `PATCH /books/{bookId}/reject`
  - `DELETE /books/{bookId}`
- Book copies:
  - `POST /students/me/books/{bookId}/copies`
  - `GET /books/copies/{bookCopyId}`
  - `PATCH /books/copies/{bookCopyId}`
  - `GET /books/{bookId}/copies`
  - `GET /students/{studentId}/books/copies`
  - `GET /books/copies`
  - `POST /students/me/books/copies/{bookCopyId}/list`
  - `PATCH /books/copies/{bookCopyId}/available`
  - `PATCH /books/copies/{bookCopyId}/unavailable`
- Lending list:
  - `GET /lendinglist`
  - `GET /lendinglist/{lendingListRecordId}`
  - `POST /lendinglist/{lendingListRecordId}/request`
- Borrowing requests:
  - `GET /borrowingrequests`
  - `GET /borrowingrequests/{borrowingRequestId}`
  - `GET /borrowingrequests/me/in`
  - `GET /borrowingrequests/me/out`
  - `PATCH /borrowingrequests/{borrowingRequestId}/accept`
  - `PATCH /borrowingrequests/{borrowingRequestId}/reject`
  - `PATCH /borrowingrequests/{borrowingRequestId}/cancel`
  - `POST /borrowingrequests/{borrowingRequestId}/deliver`
- Borrowing transactions:
  - `GET /borrowingtransactions`
  - `GET /borrowingtransactions/{borrowingTransactionId}`
  - `PATCH /borrowingtransactions/{borrowingTransactionId}/return`
  - `PATCH /borrowingtransactions/{borrowingTransactionId}/lost`
- Images:
  - `GET /images/students/{studentId}`
  - `GET /images/books/{bookId}`

## 2) Updated pages to match API changes

- `src/pages/LendingList.jsx`
  - switched from admin list endpoint to student endpoint `GET /borrowingrequests/me/out`
  - updated request status mapping to backend states (`pending`, `accepted`, `rejected`, `cancelled`, `expired`)
  - aligned query keys (`page`, `pageSize`, `searchTerm`, `sortColumn`, `sortDirection`, `states`)
- `src/pages/MyCopies.jsx`
  - updated copy condition values to backend enum values
  - restricted lending duration input to backend-valid range `7-30`
- `src/pages/Dashboard.jsx`
  - aligned lending list query keys with backend contract
- `src/components/admin/EditBookModal.jsx`
  - aligned update payload with backend `PATCH /books/{bookId}` (multipart with title)

## 3) Newly added skeleton pages for uncovered APIs

- `src/pages/BorrowingIncomingRequests.jsx`
  - target APIs: incoming requests + accept/reject/deliver flow
- `src/pages/BorrowingOutgoingRequests.jsx`
  - target APIs: outgoing requests + cancel flow
- `src/pages/BorrowingTransactions.jsx`
  - target APIs: transaction detail + return/lost (+ admin list extension)

Routes added:
- `/lending/incoming`
- `/lending/outgoing`
- `/lending/transactions`
