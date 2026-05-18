
# 🎃🗳️ BasicVotingSystem

**BasicVotingSystem** is a full-stack voting platform that allows users to participate in elections securely, while administrators manage elections, votes, and results.

The application is built with a **Halloween-themed neon UI**, role-based access control, and a modern full-stack architecture.

---

## 👥 User Roles

The system supports **two types of users**:

* **Voter**
* **Admin**

Each role has different permissions enforced on both the frontend and backend.

---

## 🚀 Features

### 👤 Voter Features

* User Registration & Login (Firebase Authentication)
* View **Live Elections**
* View **Upcoming Elections**
* View **Previous / Result Elections**
* **Vote only once per election**
* View vote status (Voted / Not Voted)
* **Search elections**
* **Sort elections** (date, status, category)
* View & manage **Profile**
* **Edit profile details**
* **Logout**
* Dark Mode support

---

### 🛠️ Admin Features

* All voter features
* **Create new elections**
* **Edit elections**
* **Delete elections** (Admin-only)
* View **total votes per election**
* View detailed election results
* Access protected admin routes
* Role-based backend middleware (`adminOnly`)

---

## 🎃 UI Theme

* Halloween / Neon theme used across the application
* Pumpkin-style fonts and glowing cards
* Animated vote bars with winner/loser effects
* Dark Mode enabled by default
* Fully responsive layout

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* Context API (AuthContext)
* Custom CSS (Halloween / Neon theme)
* Firebase Authentication

### Backend

* Node.js
* Express.js
* **PostgreSQL**
* Firebase Admin SDK
* JWT Authentication
* Role-based middleware

---

## 🗄️ Database & Storage Architecture

**BasicVotingSystem** utilizes a highly robust, dual-mode database architecture that offers both friction-free local development and stable production durability:

*   **Local Development (SQLite)**: 
    *   By default (`USE_DEMO_DB=true`), the system utilizes a plug-and-play, local **SQLite** database (`database.sqlite`). 
    *   Allows immediate development and testing out-of-the-box with no setup required.
*   **Production Deployment (Supabase PostgreSQL)**:
    *   When set to production (`USE_DEMO_DB=false`), the backend connects securely to your cloud-hosted **Supabase PostgreSQL** instance.
    *   Utilizes the secure **Supabase Connection Pooler** (over port `6543` with Transaction mode) to ensure highly scalable, permanent, and resilient data storage.
    *   Guarantees that user profiles, coin balances, daily streaks, and completed tasks remain permanently intact even when Render servers restart or spin down.

---

## 📁 Project Structure

```
BasicVotingSystem/
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── election.controller.js
│   │   │   ├── vote.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   └── adminOnly.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── server.js
│   ├── .env
│   └── serviceAccountKey.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ElectionsList.jsx
│   │   │   ├── ElectionCreate.jsx
│   │   │   ├── EditElection.jsx
│   │   │   ├── ResultBar.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── auth/
│   │   │   └── firebase.js
│   │   ├── services/
│   │   ├── utils/
│   │   └── assets/
│   ├── public/
│   │   └── *.css
│   ├── App.jsx
│   └── main.jsx
│
└── README.md
```

---

## 🔐 Role-Based Access Control

| Action                  | Voter | Admin |
| ----------------------- | ----- | ----- |
| Vote in election        | ✅     | ✅     |
| Search & sort elections | ✅     | ✅     |
| View results            | ✅     | ✅     |
| Create election         | ✅     | ✅     |
| Edit election           | ❌     | ✅     |
| Delete election         | ❌     | ✅     |
| View total votes        | ❌     | ✅     |

---

## ⚙️ Environment Variables

### Backend (`.env`)

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/basic_voting_system
JWT_SECRET=your_secret_key
```

---

## ▶️ Run Locally

### Backend

```bash
cd Backend
npm install
npm start
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

## 🎨 CSS & Styling Note

* All CSS is written manually with help from **ChatGPT**


* Additional inspiration taken from **online CSS frameworks & UI references**
* No component library (like MUI or Bootstrap) is used
* Focus on **custom theme design and animations**

---

## 🧪 Security

* Firebase Authentication
* JWT-based authorization
* Admin-only middleware
* Protected frontend routes
* One-vote-per-user enforcement

---

## 👨‍💻 Developer & AI Collaborator

*   **Meet Virugama** — Creator & Lead Full Stack Developer
*   **Antigravity (Google DeepMind)** — Agentic AI Coding Assistant & Architect
    *   *Antigravity* built the secure task verification engine, dynamic dashboard statistics system (fetching real-time win rates, polls created, and earnings), robust multi-origin CORS handling, dynamic database port routing, and resolved all Render/Vercel deployment hurdles to deliver a premium, production-ready product.


---

## 📌 Future Improvements

* Real-time vote updates
* Admin analytics dashboard
* Email notifications
* Multi-candidate elections
* Mobile UI optimization

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ and feel free to contribute!

---

🎃 **Happy Voting & Happy Halloween!** 🗳️


<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 36 51 AM" src="https://github.com/user-attachments/assets/b3fbf856-bada-484a-a832-9f62e735e227" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 36 43 AM" src="https://github.com/user-attachments/assets/2402eb0d-ef5b-4638-8d39-3e377fcf85e9" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 36 36 AM" src="https://github.com/user-attachments/assets/c4b69456-2aaf-4336-8dcb-d5ddaf52763e" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 36 33 AM" src="https://github.com/user-attachments/assets/34f76251-48eb-4c4d-ba3a-013ce07bc39f" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 35 51 AM" src="https://github.com/user-attachments/assets/17eb0396-204b-4446-9fe4-89fffce2e3f8" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 35 41 AM" src="https://github.com/user-attachments/assets/f56c86d3-79ef-4d21-a0df-fe78b0d93e33" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 35 25 AM" src="https://github.com/user-attachments/assets/8519b3a7-06c2-4adf-91f5-491c459c6416" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 35 12 AM" src="https://github.com/user-attachments/assets/7517c938-79db-4e9a-8f84-c51b3c1ff38e" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 34 42 AM" src="https://github.com/user-attachments/assets/38a3dbc5-256f-41bc-96d7-577d6f7dda20" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 35 04 AM" src="https://github.com/user-attachments/assets/90db3310-9985-4da3-b4da-0891e2109981" />
<img width="1462" height="754" alt="Screenshot 2026-01-17 at 4 34 48 AM" src="https://github.com/user-attachments/assets/58554139-af59-479d-bf80-23d5afc1b9e2" />





