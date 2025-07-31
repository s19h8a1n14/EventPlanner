# 🎉 EventPlanner

**EventPlanner** is a modern web application designed to simplify event management. Whether you're attending concerts or organizing private parties, this platform offers an intuitive and powerful interface for managing bookings, guests, and ticket sales with ease.

---

## 🔐 Authentication

- **Sign In**: Already registered users can log in securely.
- **Register**: New users can create an account to start managing or booking events.

![Sign In](https://github.com/user-attachments/assets/d3a1c877-c276-4ccc-b0a1-3ea30a9aa677)
![Register](https://github.com/user-attachments/assets/e3ef6316-c4ca-4351-843b-f0ecda70a439)

---

## 🏠 Home Page

The home page displays all **public events** such as concerts, exhibitions, and shows. Users can view details and purchase tickets via an integrated **Stripe payment gateway**.

![Home](https://github.com/user-attachments/assets/7d6cd306-82a7-4e5a-a166-eca9cec378b2)

---

## 🎟️ My Bookings

After successfully booking a ticket, users can view all their bookings in the **My Bookings** section.

![Bookings](https://github.com/user-attachments/assets/bd5fc0f4-ed42-4e3e-8f74-3b8be8b05f0f)

---

## 📅 Create an Event

Users can organize:
- **Public events** (visible to all users)
- **Private events** (invite-only via guest list)

A form is provided to capture event details, and for private events, you can upload an Excel file to manage your guest list.

---

## 📊 My Events Dashboard

### Public Events
Get real-time insights like:
- Ticket sales
- Guest engagement
- Event stats

You can also **edit event details** anytime.

![Insights](https://github.com/user-attachments/assets/cc10dec7-3c9f-4a25-8021-22a1e8fe1232)

### Private Events
Manage and view your private events along with all related guest information.

![Private Events](https://github.com/user-attachments/assets/d1c4781b-9627-44b1-a5de-902fbf27e16c)

---

## 👥 Guest Management

For private events, users can:
- Upload a guest list via Excel
- Add or edit guests manually
- Track guest RSVP status

![Guest List](https://github.com/user-attachments/assets/75863b62-a05f-4448-b231-26bba48d628e)

---

## 💡 Tech Stack

- **Frontend**: HTML, CSS, JavaScript (or React if upgraded)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Payments**: Stripe API
- **File Uploads**: Multer + XLSX Parser

---

## 🚀 Future Enhancements

- Admin dashboard
- Event ratings and reviews
- Email notifications
- Social media event sharing
- Guest QR code check-in

---

## 🛠️ Setup Instructions

```bash
git clone https://github.com/your-username/EventPlanner.git
cd EventPlanner
npm install
npm start
