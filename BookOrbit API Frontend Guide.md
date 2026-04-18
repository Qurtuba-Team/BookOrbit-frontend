# BookOrbit API Frontend Guide

Source of truth used for this document:

- `BookOrbit API.postman_collection.json`
- API request contracts and controllers under `Code/BookOrbit.Api`

This guide is written for frontend work. It focuses on:

- what the app can do
- what each endpoint is for
- which endpoints need auth and which role can call them
- which requests are `application/json` vs `multipart/form-data`
- sample requests you can copy into frontend code quickly

## 1. Quick Overview

BookOrbit is a book-sharing and lending platform centered around students.

Core capabilities exposed by the current API:

- authentication with access token + refresh token
- student registration and profile management
- student approval lifecycle handled by admins
- book catalog management
- student-owned book copy management
- lending list creation and browsing
- image delivery for student photos and book covers
- health, metrics, and OpenAPI service endpoints

## 2. Base URL And Environment Variables

Postman collection variables:

- `baseUrl = https://localhost:7240`
- `accessToken`
- `refreshToken`
- `StudentId`
- `BookId`
- `bookCopyId`
- `lendingListRecordId`

Suggested frontend config:

```ts
export const API_BASE_URL = "https://localhost:7240";
```

## 3. Auth Model

### Login

Use:

- `POST /api/v1/identity/token`

Returns:

- `accessToken`
- `refreshToken`
- `expiresOnUtc`

Token DTO shape:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresOnUtc": "2026-04-17T21:00:00Z"
}
```

### Refresh

Use:

- `POST /api/v1/identity/token/refresh`

You send:

- `refreshToken`
- `expiredAccessToken`

### Authorization Header

Most protected endpoints use:

```http
Authorization: Bearer <accessToken>
```

### Useful frontend rule

- treat login and refresh as JSON endpoints
- treat student registration, student update, and book creation as `multipart/form-data`
- image endpoints return binary file content, not JSON

## 4. Roles And Access Levels

Access rules inferred from the API controllers:

- `Anonymous`: can register a student account, log in, refresh token, confirm email
- `Registered user`: can read current user info and student images
- `Student only`: can read their own current student profile
- `Student ownership`: student can operate only on their own student record / owned copies
- `Active student`: can browse books, book copies by book/student, lending list, and book cover images
- `Admin only`: can manage student states, manage books, update book copies, list all students, list all book copies

## 5. Main User Flows

### New student onboarding

1. Register with `POST /api/v1/students`
2. Log in with `POST /api/v1/identity/token`
3. Get current user with `GET /api/v1/identity/users/me`
4. Send confirmation email with `POST /api/v1/identity/users/{userId}/send-email-confirmation`
5. Admin reviews student state using student management endpoints
6. Once active, the student can browse books and manage owned copies

### Book catalog browsing

1. Log in as active student
2. Fetch books list
3. Fetch book details
4. Load cover image from image endpoint
5. Fetch copies for a selected book

### Student copy listing flow

1. Student creates a book copy under their account
2. Student lists that copy for lending with borrowing duration
3. Lending list becomes visible through lending list endpoints

## 6. Common Query Patterns

Paginated endpoints use this shape:

```json
{
  "page": 1,
  "pageSize": 10,
  "totalPages": 3,
  "totalCount": 22,
  "items": []
}
```

Shared query fields:

- `Page`
- `PageSize`
- `SearchTerm`
- `SortColumn`
- `SortDirection`

API-specific filters:

- students: `States`, `EmailConfirmed`
- books: `Categories`
- book copies: `Conditions`, `States`
- lending list: `BookCopyId`, `BookId`, `States`

## 7. Useful Enum Values

### StudentState

- `Pending`
- `Approved`
- `Active`
- `Rejected`
- `Banned`
- `UnBanned`

### BookCopyCondition

- `New`
- `LikeNew`
- `Acceptable`
- `Poor`

### BookCopyState

- `Available`
- `Borrowed`
- `Reserved`
- `Lost`
- `Damaged`
- `UnAvilable`

### LendingListRecordState

- `Available`
- `Reserved`
- `Borrowed`
- `Expired`
- `Closed`

### BookCategory

- `Fiction`
- `Nonfiction`
- `Mystery`
- `Thriller`
- `Romance`
- `ScienceFiction`
- `Fantasy`
- `Horror`
- `HistoricalFiction`
- `Biography`
- `Autobiography`
- `SelfHelp`
- `Business`
- `Science`
- `Philosophy`
- `Psychology`
- `ReligionAndSpirituality`
- `Travel`
- `Cooking`
- `ChildrenBooks`

Note: book categories are modeled as flags in the backend, so a book can belong to multiple categories.

## 8. Frontend Integration Notes

- `POST /students` and `PATCH /students/{id}` use `multipart/form-data`
- `POST /books` uses `multipart/form-data`
- `PATCH /books/{id}`, `POST /identity/token`, `POST /identity/token/refresh`, `POST /students/{id}/books/copies`, and `PATCH /books/copies/{id}` use JSON
- image endpoints return files; use them as image `src` URLs or fetch them as blobs
- list endpoints support pagination; build reusable table/list state around `Page`, `PageSize`, `SortColumn`, `SortDirection`, and `SearchTerm`
- student and book image URLs are separate endpoints; DTOs do not include direct image URLs
- the Postman collection omits some useful API routes that exist in code, including email confirmation and moving a student back to pending

## 9. Sample Frontend Requests

### Login with fetch

```ts
await fetch(`${API_BASE_URL}/api/v1/identity/token`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@bookorbit.com",
    password: "Admin@123456"
  })
});
```

### Authenticated JSON request

```ts
await fetch(`${API_BASE_URL}/api/v1/books?Page=1&PageSize=10`, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```

### Multipart student registration

```ts
const form = new FormData();
form.append("Name", "Eyad Reda");
form.append("PhoneNumber", "01025456586");
form.append("TelegramUserId", "EyadDev1235");
form.append("UniversityMailAddress", "example@std.mans.edu.eg");
form.append("Password", "sa123456");
form.append("PersonalPhoto", fileInput.files[0]);

await fetch(`${API_BASE_URL}/api/v1/students`, {
  method: "POST",
  body: form
});
```

### Multipart book creation

```ts
const form = new FormData();
form.append("Title", "Atomic Habits");
form.append("ISBN", "9789770953571");
form.append("Publisher", "Dar El Shorouk");
form.append("Author", "Ahmed Khaled Tawfik");
form.append("Categories", "Fiction");
form.append("Categories", "Nonfiction");
form.append("CoverImage", coverFile);

await fetch(`${API_BASE_URL}/api/v1/books`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form
});
```

## 10. Response Shapes You Will Likely Care About

### Current user

```json
{
  "userId": "string",
  "email": "student@std.mans.edu.eg",
  "roles": ["Student"],
  "claims": [],
  "emailConfirmed": true
}
```

### Student

```json
{
  "id": "guid",
  "name": "string",
  "phoneNumber": "string | null",
  "telegramUserId": "string | null",
  "universityMailAddress": "string",
  "points": 0,
  "state": "Pending",
  "joinDate": "2026-04-17T00:00:00+00:00"
}
```

### Book list item

```json
{
  "id": "guid",
  "title": "string",
  "isbn": "string",
  "publisher": "string",
  "category": "Fiction",
  "author": "string",
  "availableCopiesCount": 3
}
```

### Book copy with book details

```json
{
  "id": "guid",
  "bookId": "guid",
  "ownerId": "guid",
  "condition": "LikeNew",
  "state": "Available",
  "ownerName": "string",
  "book": {
    "id": "guid",
    "title": "string",
    "isbn": "string",
    "publisher": "string",
    "category": "Fiction",
    "author": "string"
  },
  "isListed": true
}
```

### Lending list item

```json
{
  "id": "guid",
  "bookCopyId": "guid",
  "ownerId": "guid",
  "condition": "Acceptable",
  "bookCopyState": "Available",
  "ownerName": "string",
  "title": "string",
  "state": "Available",
  "borrowingDurationInDays": 10,
  "cost": 25,
  "createdAt": "2026-04-17T00:00:00+00:00"
}
```

## 11. Endpoint Catalog

Each entry includes:

- endpoint name
- method and route
- access
- description
- request details
- sample request

---

### Identity

#### 1. Login (Generate Token)

- Method: `POST`
- Route: `/api/v1/identity/token`
- Access: `Anonymous`
- Description: Authenticates the user and returns an access token plus refresh token.
- Content type: `application/json`
- Body:

```json
{
  "email": "admin@bookorbit.com",
  "password": "Admin@123456"
}
```

- Sample:

```http
POST /api/v1/identity/token
Content-Type: application/json
```

#### 2. Refresh Token

- Method: `POST`
- Route: `/api/v1/identity/token/refresh`
- Access: `Anonymous`
- Description: Exchanges a valid refresh token and expired access token context for a new token pair.
- Content type: `application/json`
- Body:

```json
{
  "refreshToken": "<refreshToken>",
  "expiredAccessToken": "<expiredAccessToken>"
}
```

#### 3. Get Current User

- Method: `GET`
- Route: `/api/v1/identity/users/me`
- Access: `Registered user`
- Description: Returns the app user profile associated with the current access token.
- Headers: `Authorization: Bearer <accessToken>`
- Sample:

```http
GET /api/v1/identity/users/me
Authorization: Bearer <accessToken>
```

#### 4. Send Confirm Email

- Method: `POST`
- Route: `/api/v1/identity/users/{userId}/send-email-confirmation`
- Access: `Registered user ownership`
- Description: Sends an email confirmation link for the specified user account.
- Headers: `Authorization: Bearer <accessToken>`

#### 5. Confirm Email

- Method: `GET`
- Route: `/api/v1/identity/confirm-email?Id={userId}&token={token}`
- Access: `Anonymous`
- Description: Confirms a user's email using the token from the email link.
- Note: exists in API code but is not present in the Postman collection.

---

### Students

#### 6. Create Student

- Method: `POST`
- Route: `/api/v1/students`
- Access: `Anonymous`
- Description: Registers a new student account and student profile.
- Content type: `multipart/form-data`
- Form fields:
  - `Name`
  - `PhoneNumber`
  - `TelegramUserId`
  - `PersonalPhoto` file
  - `UniversityMailAddress`
  - `Password`
- Sample:

```http
POST /api/v1/students
Content-Type: multipart/form-data
```

#### 7. Update Student

- Method: `PATCH`
- Route: `/api/v1/students/{studentId}`
- Access: `Student ownership`
- Description: Updates editable student profile fields and optionally replaces the photo.
- Content type: `multipart/form-data`
- Form fields:
  - `Name`
  - `PersonalPhoto` file optional

#### 8. Get Current Student

- Method: `GET`
- Route: `/api/v1/students/me`
- Access: `Student only`
- Description: Returns the current authenticated student's profile.

#### 9. Get Student By Id

- Method: `GET`
- Route: `/api/v1/students/{studentId}`
- Access: `Student ownership`
- Description: Returns full student details for the specified student.

#### 10. Get Students

- Method: `GET`
- Route: `/api/v1/students`
- Access: `Admin only`
- Description: Returns a paginated list of students with search, filters, and sorting.
- Query params:
  - `Page`
  - `PageSize`
  - `SearchTerm`
  - `SortColumn`
  - `SortDirection`
  - `States`
  - `EmailConfirmed`
- Sort options: `joindate`, `state`, `name`, `updatedat`, `createdat`
- Sample:

```http
GET /api/v1/students?Page=1&PageSize=5&SortColumn=joindate&SortDirection=desc
Authorization: Bearer <accessToken>
```

#### 11. Approve Student

- Method: `PATCH`
- Route: `/api/v1/students/{studentId}/approve`
- Access: `Admin only`
- Description: Approves a pending student.

#### 12. Activate Student

- Method: `PATCH`
- Route: `/api/v1/students/{studentId}/activate`
- Access: `Admin only`
- Description: Activates an approved student so they can use student-only platform features.

#### 13. Ban Student

- Method: `PATCH`
- Route: `/api/v1/students/{studentId}/ban`
- Access: `Admin only`
- Description: Bans a student account.

#### 14. Reject Student

- Method: `PATCH`
- Route: `/api/v1/students/{studentId}/reject`
- Access: `Admin only`
- Description: Rejects a student account request.

#### 15. Unban Student

- Method: `PATCH`
- Route: `/api/v1/students/{studentId}/unban`
- Access: `Admin only`
- Description: Removes the ban from a student account.

#### 16. Pend Student

- Method: `PATCH`
- Route: `/api/v1/students/{studentId}/pend`
- Access: `Admin only`
- Description: Moves a student back to `Pending`.
- Note: exists in API code but is not present in the Postman collection.

---

### Images

#### 17. Get Student Image

- Method: `GET`
- Route: `/api/v1/images/students/{studentId}`
- Access: `Registered user`
- Description: Returns the student's profile image file.
- Response type: binary image
- Frontend note: can be used directly as an `<img src>` URL if auth is handled appropriately.

#### 18. Get Book Cover Image

- Method: `GET`
- Route: `/api/v1/images/books/{bookId}`
- Access: `Active student`
- Description: Returns the book cover image file.
- Response type: binary image

---

### Books

#### 19. Create Book

- Method: `POST`
- Route: `/api/v1/books`
- Access: `Admin only`
- Description: Creates a new book in the catalog.
- Content type: `multipart/form-data`
- Form fields:
  - `Title`
  - `ISBN`
  - `Publisher`
  - `Author`
  - `CoverImage` file
  - `Categories` repeated field
- Sample:

```http
POST /api/v1/books
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

#### 20. Get Book By Id

- Method: `GET`
- Route: `/api/v1/books/{bookId}`
- Access: `Active student`
- Description: Returns full details for a single book.

#### 21. Update Book

- Method: `PATCH`
- Route: `/api/v1/books/{bookId}`
- Access: `Admin only`
- Description: Updates editable book information.
- Content type: `application/json`
- Body:

```json
{
  "title": "ما وراء الطبيعة الجزء الخامس"
}
```

#### 22. Get Books

- Method: `GET`
- Route: `/api/v1/books`
- Access: `Active student`
- Description: Returns a paginated list of books with search, category filter, and sorting.
- Query params:
  - `Page`
  - `PageSize`
  - `SearchTerm`
  - `SortColumn`
  - `SortDirection`
  - `Categories`
- Sort options: `createdat`, `updatedat`, `title`, `publisher`, `author`
- Sample:

```http
GET /api/v1/books?Page=1&PageSize=5&SearchTerm=العادات&SortColumn=title&SortDirection=asc
Authorization: Bearer <accessToken>
```

#### 23. Delete Book

- Method: `DELETE`
- Route: `/api/v1/books/{bookId}`
- Access: `Admin only`
- Description: Deletes a book if it is not referenced by existing copies.

---

### Book Copies

#### 24. Create Book Copy

- Method: `POST`
- Route: `/api/v1/students/{studentId}/books/copies`
- Access: `Student ownership`
- Description: Creates a new owned copy of an existing book for the given student.
- Content type: `application/json`
- Body:

```json
{
  "bookId": "362ac07e-e3a1-42f3-bccd-78cfa3e73486",
  "condition": "Poor"
}
```

#### 25. Update Book Copy

- Method: `PATCH`
- Route: `/api/v1/books/copies/{bookCopyId}`
- Access: `Admin only`
- Description: Updates book copy editable data such as condition.
- Content type: `application/json`
- Body:

```json
{
  "condition": "Acceptable"
}
```

#### 26. Get Book Copy By Id

- Method: `GET`
- Route: `/api/v1/books/copies/{bookCopyId}`
- Access: `Active student`
- Description: Returns detailed information for a book copy, including nested book details.

#### 27. Get Copies By Book Id

- Method: `GET`
- Route: `/api/v1/books/{bookId}/copies`
- Access: `Active student`
- Description: Returns paginated copies for one book.
- Query params:
  - `Page`
  - `PageSize`
  - `SearchTerm`
  - `SortColumn`
  - `SortDirection`
  - `Conditions`
  - `States`
- Sort options: `createdat`, `ownername`, `booktitle`, `updatedat`

#### 28. Get Copies By Student Id

- Method: `GET`
- Route: `/api/v1/students/{studentId}/books/copies`
- Access: `Active student`
- Description: Returns paginated copies owned by one student.
- Query params:
  - `Page`
  - `PageSize`
  - `SearchTerm`
  - `SortColumn`
  - `SortDirection`
  - `Conditions`
  - `States`

#### 29. Get Copies

- Method: `GET`
- Route: `/api/v1/books/copies`
- Access: `Admin only`
- Description: Returns paginated copies across the full system.
- Query params:
  - `Page`
  - `PageSize`
  - `SearchTerm`
  - `SortColumn`
  - `SortDirection`
  - `Conditions`
  - `States`

#### 30. List Book Copy

- Method: `POST`
- Route: `/api/v1/students/{studentId}/books/copies/{bookCopyId}/list`
- Access: `Student ownership`
- Description: Creates a lending list record for a student-owned copy.
- Query params:
  - `borrowingDurationInDays`
- Sample:

```http
POST /api/v1/students/{studentId}/books/copies/{bookCopyId}/list?borrowingDurationInDays=10
Authorization: Bearer <accessToken>
```

---

### Lending List

#### 31. Get All Lending List Records

- Method: `GET`
- Route: `/api/v1/lendinglist`
- Access: `Active student`
- Description: Returns paginated lending list records with search, filters, and sorting.
- Query params:
  - `Page`
  - `PageSize`
  - `SearchTerm`
  - `SortColumn`
  - `SortDirection`
  - `BookCopyId`
  - `BookId`
  - `States`
- Sort options: `createdat`, `updatedat`, `cost`, `borrowingduration`, `expirationdate`, `state`
- Sample:

```http
GET /api/v1/lendinglist?Page=1&PageSize=3&SortColumn=createdat&SortDirection=desc
Authorization: Bearer <accessToken>
```

#### 32. Get Lending List Record By Id

- Method: `GET`
- Route: `/api/v1/lendinglist/{lendingListRecordId}`
- Access: `Active student`
- Description: Returns details for a single lending list record.

---

### Service / Operations Endpoints

#### 33. Health

- Method: `GET`
- Route: `/health`
- Access: usually service monitoring
- Description: Service health check endpoint.

#### 34. Metrics

- Method: `GET`
- Route: `/metrics`
- Access: usually service monitoring
- Description: Prometheus-style metrics endpoint.

#### 35. OpenAPI

- Method: `GET`
- Route: `/openapi/v1.json`
- Access: API contract discovery
- Description: OpenAPI document for tooling and client generation.

#### 36. Important local tools

- `http://localhost:8081` -> Seq
- `http://localhost:9090` -> Prometheus
- `http://localhost:3000` -> Grafana
- `http://localhost:16686` -> Jaeger

## 12. Frontend Screen Mapping

This mapping is a practical way to structure UI work:

- Login page:
  - `POST /identity/token`
  - `POST /identity/token/refresh`
- Account page:
  - `GET /identity/users/me`
  - `POST /identity/users/{userId}/send-email-confirmation`
- Student profile page:
  - `GET /students/me`
  - `PATCH /students/{studentId}`
  - `GET /images/students/{studentId}`
- Admin students dashboard:
  - `GET /students`
  - approve / activate / reject / ban / unban
- Book catalog page:
  - `GET /books`
  - `GET /books/{bookId}`
  - `GET /images/books/{bookId}`
- Book detail page:
  - `GET /books/{bookId}`
  - `GET /books/{bookId}/copies`
- My copies page:
  - `GET /students/{studentId}/books/copies`
  - `POST /students/{studentId}/books/copies`
  - `POST /students/{studentId}/books/copies/{bookCopyId}/list`
- Admin books dashboard:
  - `POST /books`
  - `PATCH /books/{bookId}`
  - `DELETE /books/{bookId}`
  - `GET /books/copies`
  - `PATCH /books/copies/{bookCopyId}`
- Lending list page:
  - `GET /lendinglist`
  - `GET /lendinglist/{lendingListRecordId}`

## 13. Recommended Frontend Abstractions

- one API client that automatically injects `Authorization`
- one token store for `accessToken`, `refreshToken`, and `expiresOnUtc`
- one generic paginated list hook
- one helper for `multipart/form-data` endpoints
- one enum map for display labels of `StudentState`, `BookCopyCondition`, `BookCopyState`, and `LendingListRecordState`
- one image URL helper:

```ts
export const getStudentImageUrl = (studentId: string) =>
  `${API_BASE_URL}/api/v1/images/students/${studentId}`;

export const getBookImageUrl = (bookId: string) =>
  `${API_BASE_URL}/api/v1/images/books/${bookId}`;
```

## 14. Final Notes

- The Postman collection is useful for route coverage and sample payloads, but it does not include saved response examples.
- For response shapes, this document used backend DTOs directly.
- Two real API endpoints found in code are missing from the collection:
  - `GET /api/v1/identity/confirm-email`
  - `PATCH /api/v1/students/{studentId}/pend`
