Here's the improved README.md in the same format without images:

```markdown
# 🍔 SMARTBITE AI

SMARTBITE AI is an AI-powered food ordering web application built with React, Firebase, Groq AI, and Razorpay. The application features a voice assistant for hands-free ordering, AI-powered recommendations, and seamless payment processing.

## ✨ Features

### Core Features
- 🛒 **Smart Food Ordering** - Browse, search, and order food with intelligent recommendations
- 🎤 **Voice Assistant** - Full voice control for hands-free ordering experience
- 💳 **Dual Payment Options** - Razorpay UPI and Cash on Delivery (COD)
- 👤 **User Profiles** - Manage orders, favorites, and profile settings
- 📜 **Order History** - Track all past orders with real-time status
- ⭐ **Rate & Review** - Review delivered orders and help others decide
- 🤖 **AI Recommendations** - Groq AI-powered food suggestions based on preferences
- 🌙 **Dark Theme** - Premium dark UI with orange accents
- 📱 **Fully Responsive** - Seamless experience across all devices
- 🔥 **Real-time Updates** - Firebase backend for instant data sync

### Voice Commands
```bash
"Show burgers"        → Filter and display burger items
"Add 2 pizzas"        → Add items to cart with quantity
"Take me to cart"     → Navigate to shopping cart
"Checkout"            → Start the checkout process
"Cash on delivery"    → Select COD payment method
"UPI"                 → Select UPI/Razorpay payment
"Remove 1 pizza"      → Remove specific items from cart
"Show orders"         → View order history
"Logout"              → Log out of account
"Go home"             → Navigate to home page
"Show desserts"       → Filter and display dessert items
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library with hooks and context API
- **Vite** - Next-generation build tool for fast development
- **Firebase** - Authentication, Firestore database, and storage
- **React Router v7** - Navigation and routing
- **React Speech Recognition** - Voice assistant integration
- **React Hot Toast** - Beautiful notifications
- **React Icons** - Icon library for UI elements

### Backend (Firebase)
- **Firebase Auth** - Secure user authentication
- **Firestore** - NoSQL real-time database
- **Firebase Storage** - Image and file storage

### AI & Payments
- **Groq API** - AI-powered food recommendations
- **Razorpay** - Secure payment processing (UPI/Cards)
- **Web Speech API** - Speech recognition and text-to-speech

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- npm or yarn
- Firebase Account
- Razorpay Account (for payments)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/chandan-me/SmartBite-AI.git
cd SmartBite-AI
```

**2. Frontend Setup**
```bash
cd FrontEnd
npm install
```

**3. Configure Firebase**

Create a `.env` file in the `FrontEnd` directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RAZORPAY_KEY=your_razorpay_key
VITE_GROQ_API_KEY=your_groq_api_key
```

**4. Run Frontend**
```bash
npm run dev
```

**5. (Optional) Django Backend**
```bash
cd Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 3000
```

**6. Open Browser**
```
http://localhost:5173
```

## 📁 Project Structure

```
SmartBite-AI/
├── FrontEnd/
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── CSS/
│   │   │   │   ├── Voice.css
│   │   │   │   └── OrderReviewModal.css
│   │   │   ├── VoiceAssistant.jsx
│   │   │   ├── OrderReviewModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── GlobalStateContext.jsx
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── cartService.js
│   │   │   ├── favoriteService.js
│   │   │   └── orderService.js
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── Backend/ (Optional Django)
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | ✅ |
| `VITE_RAZORPAY_KEY` | Razorpay Key ID | Optional |
| `VITE_GROQ_API_KEY` | Groq AI API Key | Optional |

## 🤖 AI & Voice Assistant

### Voice Commands System
The voice assistant uses **Web Speech API** for speech recognition and **Text-to-Speech** for responses. It supports natural language processing for food ordering.

**Example Voice Flow:**
1. User: "Add 2 pizzas"
   - Assistant: "Added 2 Classic Margherita Pizza to your cart!"
   - Cart updates automatically

2. User: "Checkout"
   - Assistant: "You have items in your cart. How would you like to pay?"
   - Opens payment options

3. User: "Cash on delivery"
   - Assistant: "Cash on delivery selected. Say confirm to place your order."
   - Processes COD order

### AI Recommendations
Powered by **Groq API**, the system provides:
- 🌶️ Spicy recommendations for heat lovers
- 🥗 Healthy options for health-conscious users
- 🍰 Sweet cravings for dessert lovers
- 🍔 Fast food suggestions for quick bites
- 🎯 Personalized recommendations based on order history

## 💳 Payment Flow

### Cash on Delivery (COD)
1. User says "Checkout" or clicks checkout button
2. Select "Cash on Delivery"
3. Confirm order via voice or button
4. Order is placed with "Placed" status
5. Cart is automatically cleared
6. User is redirected to Orders page

### UPI/Razorpay
1. User says "Checkout" or clicks checkout button
2. Select "UPI" payment option
3. Razorpay payment modal opens
4. User completes payment
5. Order is confirmed with "Placed" status
6. Cart is automatically cleared
7. User is redirected to Orders page

### Order Status Flow
```
Placed → Confirmed → Preparing → Out For Delivery → Delivered
```

## 📱 Responsive Design

| Device | Screen Size | Support |
|--------|-------------|---------|
| Mobile | 320px - 480px | ✅ Fully responsive |
| Tablet | 481px - 768px | ✅ Fully responsive |
| Laptop | 769px - 1024px | ✅ Fully responsive |
| Desktop | 1025px+ | ✅ Fully responsive |

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview

# Run development server
npm run dev
```

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Style Guidelines
- Use ESLint for JavaScript code quality
- Follow React component best practices (functional components with hooks)
- Write meaningful commit messages
- Test your changes before submitting
- Maintain dark theme consistency
- Keep voice commands intuitive and user-friendly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Chandan N**
- GitHub: [@chandan-me](https://github.com/chandan-me)
- Portfolio: [me](https://www.chandan-n.me/)
- LinkedIn: [Chandan N](https://www.linkedin.com/in/chandan-niranjan/)
- Email: chandan2004.n@gmail.com
  

## 🙏 Acknowledgments

- Groq API for AI capabilities
- Razorpay for payment processing
- Firebase for backend infrastructure
- Web Speech API for voice recognition
- All open-source libraries and tools used

## 📞 Support

For any queries or support:
- Create an issue on GitHub
- Reach out via email
- Connect on LinkedIn

## ⭐ Show Your Support

If you find this project helpful, please consider:
- Giving it a ⭐ on GitHub
- Forking the repository
- Contributing to the project
- Sharing with others

---

**Made with ❤️ and 🍕 by Chandan N**

© 2026 SmartBite AI. All rights reserved.
```
