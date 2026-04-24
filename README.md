# 📚 BookOrbit

<div align="center">
  <p><strong>Empowering Students. Sharing Knowledge. Reducing Costs.</strong></p>
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/Abdulrhman65/BookOrbit-frontend)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
  [![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![ASP.NET Core](https://img.shields.io/badge/Backend-ASP.NET_Core-512BD4.svg?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
</div>

<br />

## 📖 Introduction

**BookOrbit** is a dedicated university platform designed to facilitate the seamless exchange of used books among college students. By creating a localized, secure, and student-only community, BookOrbit significantly reduces educational costs and promotes a sustainable culture of knowledge sharing within the campus.

---

## 🏗️ Architecture

BookOrbit follows a modern, decoupled client-server architecture to ensure high performance, security, and scalability.

- **Frontend (Client):** Built with **React 19** and styled using **Tailwind CSS**, providing a dynamic, responsive, and intuitive User Interface (UI). **Framer Motion** is used to deliver fluid micro-animations, while **React Router v7** handles seamless navigation.
- **Backend (API):** Powered by an **ASP.NET Core** RESTful API. It handles complex business logic, strict input validation, OTP generation, and secure data transactions.
- **Authentication:** JWT-based authentication with strict role-based access control (Admin vs. Student), email verification, and secure session management.

---

## 🔌 API Documentation

Our API is designed following REST principles. Below are the core endpoints used by the platform:

| Endpoint | Method | Description | Auth Required |
| :--- | :---: | :--- | :---: |
| `/api/v1/auth/register` | `POST` | Registers a new student account (requires university email). | ❌ |
| `/api/v1/auth/login` | `POST` | Authenticates the user and returns a JWT token pair. | ❌ |
| `/api/v1/books` | `GET` | Retrieves a paginated list of available books in the university. | ✅ |
| `/api/v1/books` | `POST` | Submits a new book for admin review or adds a copy to an existing book. | ✅ |
| `/api/v1/exchange` | `POST` | Initiates a request to borrow/exchange a book from another student. | ✅ |
| `/api/v1/exchange/{id}/confirm`| `PUT` | Validates the OTP when students meet to finalize the book transfer. | ✅ |

> **Note:** All protected routes require a valid `Bearer Token` in the `Authorization` header.

---

## 🗄️ Database Schema

The system relies on a well-structured relational database. Below are the primary domain models:

- **`User` (Student/Admin):** Stores personal information, university ID, major, authentication details, and account status (Active, Pending, Banned).
- **`Book`:** Contains metadata about the book (Title, Author, ISBN, Category) subject to admin approval.
- **`BookCopy`:** Represents a physical instance of a book owned by a specific student, including its condition.
- **`ExchangeRequest`:** Tracks the lifecycle of a borrow/exchange transaction (Pending, Accepted, Rejected, Completed), including the auto-generated OTP for physical handover.

---

## ⚙️ Installation & Environment Variables

Follow these steps to run the frontend application locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/Abdulrhman65/BookOrbit-frontend.git
cd BookOrbit-frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and configure the required variables. Example:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:7240/api/v1

# Other Configuration
REACT_APP_ENVIRONMENT=development
```

### 5. Start the Development Server
```bash
npm start
```
The application will be available at `http://localhost:3000`.

---

## 🔄 User Flow: Uploading & Exchanging a Book

1. **Upload / Add Book:**
   - The student navigates to the "Add Book" section.
   - If the book is new to the platform, the student fills in the details (Title, Author, Cover). This creates a "Pending" book that requires **Admin Approval**.
   - If the book already exists in the system directory, the student simply adds their physical copy specifying its condition.
2. **Requesting to Borrow:**
   - Another student browses the catalog and clicks "Request to Borrow" on the desired book.
   - The owner receives a notification and can either **Accept** or **Reject** the request.
3. **Physical Handover & OTP Verification:**
   - Upon acceptance, the system generates a secure **OTP**.
   - The students agree to meet on campus.
   - At the meeting, the borrower provides the OTP to the owner. The owner enters it into the system to officially mark the book as "Exchanged/Delivered", ensuring a trusted transaction.

---

## 🚀 Future Roadmap

We are constantly looking to improve BookOrbit. Here are some features planned for future releases:

- [ ] **📱 Mobile Application:** Cross-platform mobile app (React Native/Flutter) for on-the-go access and push notifications.
- [ ] **⭐ Rating & Reputation System:** Allow students to rate each other after a successful exchange to build trust.
- [ ] **💬 In-App Messaging:** Secure, real-time chat between students to coordinate meeting points without sharing personal phone numbers.
- [ ] **🏛️ Multi-University Support:** Expanding the platform to support distinct communities across different universities.
- [ ] **📊 Advanced Analytics Dashboard:** For admins to monitor exchange metrics and popular academic materials.

---
<div align="center">
  <i>Built with ❤️ for University Students.</i>
</div>
