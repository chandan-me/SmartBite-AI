import { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlobalStateContext } from '../context/GlobalStateContext';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { getRecipes } from '../recipeApi';
import { addCartItem, loadCart, removeCartItem } from '../services/cartService';
import { placeOrder } from '../services/orderService';
import { loadAddresses } from '../services/addressService';
import './CSS/Voice.css';

/* ─── TTS — native only, Google TTS blocked by CORS ─── */
const speakNative = (text, onEnd) => {
  if (!('speechSynthesis' in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9; u.pitch = 1.0; u.volume = 1.0; u.lang = 'en-IN';
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
};

/* ─── Checkout flow states ─── */
const CHECKOUT_STEPS = {
  NONE:                    'none',
  AWAITING_PAYMENT_METHOD: 'awaiting_payment_method',
  CONFIRM_COD:             'confirm_cod',
  CONFIRM_UPI:             'confirm_upi',
  PROCESSING:              'processing',
};

/* ════════════════════════════════════════════════════════
   CATEGORY KEYWORDS
════════════════════════════════════════════════════════ */
const CATEGORY_KEYWORDS = {
  burger:      ['burger', 'burgers'],
  pizza:       ['pizza', 'pizzas'],
  spicy:       ['spicy', 'spice', 'hot and spicy'],
  chinese:     ['chinese', 'noodles', 'fried rice'],
  dessert:     ['dessert', 'desserts', 'sweet', 'cake', 'ice cream'],
  drinks:      ['drink', 'drinks', 'beverage', 'juice', 'water', 'shake', 'milkshake'],
  biryani:     ['biryani', 'rice'],
  sandwich:    ['sandwich', 'sandwiches', 'sub'],
  pasta:       ['pasta', 'spaghetti'],
  salad:       ['salad', 'salads'],
  snacks:      ['snack', 'snacks', 'fries', 'chips'],
  chicken:     ['chicken'],
  veg:         ['veg', 'vegetarian', 'vegetable'],
  maincourse:  ['main course', 'main dish', 'mains'],
  fastfood:    ['fast food', 'fastfood', 'quick bite'],
  healthy:     ['healthy', 'health food', 'diet', 'low calorie', 'nutritious'],
  seafood:     ['seafood', 'fish', 'prawn', 'shrimp'],
  soup:        ['soup', 'soups'],
  wrap:        ['wrap', 'wraps', 'roll', 'rolls'],
};

/* ════════════════════════════════════════════════════════
   NUMBER WORDS → digits
════════════════════════════════════════════════════════ */
const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  a: 1, an: 1,
};

const parseQuantity = (text) => {
  // Match digit first
  const digitMatch = text.match(/\b(\d+)\b/);
  if (digitMatch) return parseInt(digitMatch[1], 10);
  // Match number word
  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) return val;
  }
  return 1; // default
};

/* ════════════════════════════════════════════════════════
   FULL LOCAL INTENT DETECTION
   Everything common is handled here — no backend needed.
════════════════════════════════════════════════════════ */
const detectIntent = (text, activeCheckoutStep) => {
  const t = text.toLowerCase().trim();

  /* ── 1. NAVIGATE ── */
  if (/\b(go to|take me to|open|navigate to|show me)\s+(the\s+)?(cart|my cart|basket)\b/.test(t) ||
      /\b(the cart|my cart)\b/.test(t))
    return { type: 'NAVIGATE', path: '/cart' };

  if (/\b(go to|take me to|open|navigate to)\s+(the\s+)?(home|homepage|main page|menu|food|items)\b/.test(t) ||
      /\bgo home\b/.test(t))
    return { type: 'NAVIGATE', path: '/' };

  if (/\b(go to|take me to|open|navigate to|show me)\s+(the\s+)?(orders?|my orders?|order history|past orders?)\b/.test(t))
    return { type: 'NAVIGATE', path: '/orders' };

  if (/\b(go to|take me to|open|navigate to)\s+(the\s+)?(login|sign in|signin)\b/.test(t))
    return { type: 'NAVIGATE', path: '/login' };

  if (/\b(go to|take me to|open|navigate to)\s+(the\s+)?(profile|account|my account)\b/.test(t))
    return { type: 'NAVIGATE', path: '/profile' };

  /* ── 2. LOGOUT ── */
  if (/\b(logout|log out|sign out|signout)\b/.test(t))
    return { type: 'LOGOUT' };

  /* ── 3. CHECKOUT triggers ── */
  if (/\b(checkout|check out|place.?order|order.?now|pay.?now|buy.?now|confirm.?order|proceed.?to.?pay|proceed.?to.?check.?out|order.?(the.?)?(things|items|food|everything)?.?(in.?)?(my.?)?(cart)?)\b/.test(t))
    return { type: 'CHECKOUT' };

  /* ── 4. PAYMENT / CONFIRM / CANCEL — only inside checkout flow ── */
  if (activeCheckoutStep !== CHECKOUT_STEPS.NONE) {
    if (/\b(cash.?on.?delivery|cod)\b/.test(t))                         return { type: 'SELECT_COD' };
    if (/\bupi\b|razorpay|net.?bank|online.?pay|digital|card/.test(t)) return { type: 'SELECT_UPI' };
    if (/\b(yes|confirm|sure|ok|proceed|go ahead|do it|yep|yeah)\b/.test(t)) return { type: 'CONFIRM' };
    if (/\b(no|cancel|stop|back|nevermind|never mind|nope)\b/.test(t)) return { type: 'CANCEL' };
  }

  /* ── 5. ADD TO CART ── */
  if (/\b(add|put|order|get me|i want|give me|i'd like|can i get|can you add)\b/.test(t)) {
    // Extract food name — everything after the action verb and optional quantity
    const addMatch = t.match(
      /\b(?:add|put|order|get me|i want|give me|i'd like|can i get|can you add)\b\s+(?:(?:one|two|three|four|five|six|seven|eight|nine|ten|a|an|\d+)\s+)?(.+?)(?:\s+(?:to|in|into)\s+(?:my\s+)?(?:cart|order|basket))?$/i
    );
    if (addMatch) {
      const itemName = addMatch[1]
        .replace(/\b(to|in|into|my|the|cart|order|basket|please)\b/gi, '')
        .trim();
      const quantity = parseQuantity(t);
      if (itemName.length > 1) return { type: 'ADD', itemName, quantity };
    }
  }

  /* ── 6. REMOVE FROM CART ── */
  if (/\b(remove|delete|take out|clear|get rid of)\b/.test(t)) {
    // "remove everything" / "clear cart"
    if (/\b(everything|all|clear.?cart|clear.?my.?cart|all items)\b/.test(t))
      return { type: 'REMOVE_ALL' };

    const removeMatch = t.match(
      /\b(?:remove|delete|take out|get rid of)\b\s+(?:(?:one|two|three|four|five|six|seven|eight|nine|ten|a|an|\d+)\s+)?(.+?)(?:\s+(?:from|in|out of)\s+(?:my\s+)?(?:cart|order|basket))?$/i
    );
    if (removeMatch) {
      const itemName = removeMatch[1]
        .replace(/\b(from|in|out|of|my|the|cart|order|basket|please)\b/gi, '')
        .trim();
      const quantity = parseQuantity(t);
      if (itemName.length > 1) return { type: 'REMOVE', itemName, quantity };
    }
  }

  /* ── 7. FILTER / SHOW CATEGORY ── */
  const browseVerb = /\b(show|find|see|display|browse|search|look for|what are|list|show me|i want to see|can you show)\b/;
  if (browseVerb.test(t)) {
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => t.includes(kw))) return { type: 'FILTER', category };
    }
  }

  return null; // unknown — let backend handle
};

/* ════════════════════════════════════════════════════════ */

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    Togg, setTogg,
    logout, login,
    isLoggedIn, user,
    cart, setCart,
  } = useContext(GlobalStateContext);

  const [recipes, setRecipes] = useState([]);
  const [isListening,          setIsListening]          = useState(false);
  const [assistantResponse,    setAssistantResponse]    = useState('');
  const [isSpeaking,           setIsSpeaking]           = useState(false);
  const [isProcessing,         setIsProcessing]         = useState(false);
  const [hasGreeted,           setHasGreeted]           = useState(false);
  const [loginStep,            setLoginStep]            = useState(null);
  const [loginEmail,           setLoginEmail]           = useState('');
  const [checkoutStep,         setCheckoutStep]         = useState(CHECKOUT_STEPS.NONE);

  const processedRef = useRef(new Set());
  const timeoutRef   = useRef(null);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  /* ── speak ── */
  const speak = useCallback((text) => {
    setAssistantResponse(text);
    setIsSpeaking(true);
    speakNative(text, () => setIsSpeaking(false));
  }, []);

  // Load recipes for food matching
  useEffect(() => {
    getRecipes().then(setRecipes).catch(console.error);
  }, []);

  /* ── greeting on opening ── */
  useEffect(() => {
    if (Togg && !hasGreeted) {
      speak('Hello! I am SmartBite AI. Say "show burgers", "add 2 pizzas", "checkout", or "take me to cart"!');
      setHasGreeted(true);
    }
  }, [Togg, hasGreeted, speak]);

  /* ── FILTER ── */
  const applyFilter = useCallback((category) => {
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    speak(`Showing ${label} for you!`);
    navigate('/');
    setTimeout(() => {
      document.getElementById('items')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const btns = document.querySelectorAll('.category-btn');
        // exact category name match
        for (const btn of btns) {
          if (btn.textContent.toLowerCase().includes(category.toLowerCase())) {
            btn.click(); return;
          }
        }
        // keyword match
        const kws = CATEGORY_KEYWORDS[category] || [];
        for (const btn of btns) {
          if (kws.some(kw => btn.textContent.toLowerCase().includes(kw))) {
            btn.click(); return;
          }
        }
      }, 400);
    }, 300);
  }, [navigate, speak]);

  /* ── this CART helpers ── */
  
  const getCartItems = useCallback(() => cart, [cart]);

  const getCartTotal = useCallback(() =>
    cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0),
  [cart]);

  const findFood = useCallback((name) =>
    (recipes || []).find(r =>
      r.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(r.name.toLowerCase())
    ),
  [recipes]);

  const fireCartEvent = (eventName, detail = {}) =>
    window.dispatchEvent(new CustomEvent(eventName, { detail }));

  const clearCart = useCallback(async () => {
    if (!user) return;
    for (const item of cart) {
      await removeCartItem(user.uid, item.id);
    }
    setCart([]);
  }, [cart, user, setCart]);

  const updateQuantity = useCallback(async (recipeId, change) => {
    if (!user) return;
    const food = recipes.find(r => r.id === recipeId);
    if (!food) return;

    const existing = cart.find(item => item.id === recipeId);
    const currentQty = existing ? existing.quantity : 0;
    const newQty = currentQty + change;

    if (newQty <= 0) {
      if (existing) {
        await removeCartItem(user.uid, recipeId);
      }
    } else {
      await addCartItem(user.uid, food, newQty);
    }

    const updated = await loadCart(user.uid);
    setCart(updated);
  }, [user, recipes, cart, setCart]);

  /* ── COD order ── */
  const placeCODOrder = useCallback(async () => {
    const cartItems = getCartItems();
    const total     = getCartTotal();
    if (!cartItems.length) { speak('Your cart is empty.'); setCheckoutStep(CHECKOUT_STEPS.NONE); return; }
    if (!isLoggedIn) { speak('Please log in first to place an order.'); navigate('/login'); setCheckoutStep(CHECKOUT_STEPS.NONE); return; }

    setCheckoutStep(CHECKOUT_STEPS.PROCESSING);
    speak('Placing your cash on delivery order. Please wait.');
    try {
      const addresses = await loadAddresses(user.uid);
      const address = addresses.length > 0 ? addresses[0] : {
        fullName: user.displayName || user.email?.split('@')[0] || "Guest User",
        phone: user.phoneNumber || "9999999999",
        house: "Voice Order",
        area: "Default Area",
        city: "Default City",
        state: "Default State",
        pincode: "110001",
        landmark: "Voice Assistant Placement"
      };

      await placeOrder(
        user.uid,
        cartItems,
        total,
        "Cash On Delivery",
        address,
        "Pending",
        ""
      );

      await clearCart();
      speak('Order placed with cash on delivery! Enjoy your meal!');
      setCheckoutStep(CHECKOUT_STEPS.NONE);
      navigate('/orders');
    } catch (err) {
      console.error(err);
      speak('Order failed. Please try again.');
      setCheckoutStep(CHECKOUT_STEPS.NONE);
    }
  }, [getCartItems, getCartTotal, isLoggedIn, user, clearCart, speak, navigate]);

  /* ── UPI order ── */
  const placeUPIOrder = useCallback(async () => {
    const cartItems = getCartItems();
    const total     = getCartTotal();
    if (!cartItems.length) { speak('Your cart is empty.'); setCheckoutStep(CHECKOUT_STEPS.NONE); return; }
    if (!isLoggedIn) { speak('Please log in first to place an order.'); navigate('/login'); setCheckoutStep(CHECKOUT_STEPS.NONE); return; }

    setCheckoutStep(CHECKOUT_STEPS.PROCESSING);
    speak('Opening UPI payment. Please complete the payment on screen.');
    if (location.pathname !== '/cart') navigate('/cart');
    setTimeout(() => fireCartEvent('voice:open-upi', { userId: user.uid, total, cartItems }), 400);
    setCheckoutStep(CHECKOUT_STEPS.NONE);
  }, [getCartItems, getCartTotal, isLoggedIn, user, speak, navigate, location]);

  /* ════════════════════════════════════════════
     MAIN COMMAND HANDLER — all local
  ════════════════════════════════════════════ */
  const handleIntent = useCallback(async (intent) => {

    /* NAVIGATE */
    if (intent.type === 'NAVIGATE') {
      const labels = { '/cart': 'cart', '/': 'home', '/orders': 'orders', '/login': 'login', '/profile': 'profile' };
      speak(`Taking you to ${labels[intent.path] || intent.path}.`);
      navigate(intent.path);
      if (intent.path === '/') setTimeout(() => document.getElementById('items')?.scrollIntoView({ behavior: 'smooth' }), 300);
      return;
    }

    /* LOGOUT */
    if (intent.type === 'LOGOUT') {
      await logout();
      speak('Logged out successfully.');
      return;
    }

    /* FILTER */
    if (intent.type === 'FILTER') {
      applyFilter(intent.category);
      return;
    }

    /* ADD */
    if (intent.type === 'ADD') {
      const food = findFood(intent.itemName);
      if (!food) {
        speak(`Sorry, I could not find ${intent.itemName} in the menu.`);
        return;
      }
      for (let i = 0; i < intent.quantity; i++) await updateQuantity(food.id, 1);
      speak(`Added ${intent.quantity} ${food.name} to your cart!`);
      return;
    }

    /* REMOVE */
    if (intent.type === 'REMOVE') {
      const food = findFood(intent.itemName);
      if (!food) {
        speak(`Sorry, I could not find ${intent.itemName} in your cart.`);
        return;
      }
      const cartItem = getCartItems().find(f => f.id === food.id);
      if (!cartItem || cartItem.quantity === 0) {
        speak(`${food.name} is not in your cart.`);
        return;
      }
      const qty = Math.min(intent.quantity, cartItem.quantity);
      for (let i = 0; i < qty; i++) await updateQuantity(food.id, -1);
      speak(`Removed ${qty} ${food.name} from your cart.`);
      return;
    }

    /* REMOVE ALL */
    if (intent.type === 'REMOVE_ALL') {
      const cart = getCartItems();
      if (!cart.length) { speak('Your cart is already empty.'); return; }
      await clearCart();
      speak('Your cart has been cleared.');
      return;
    }

    /* CHECKOUT FLOW */
    if (intent.type === 'CHECKOUT') {
      const cart = getCartItems();
      if (!cart.length) { speak('Your cart is empty. Please add items first.'); return; }
      if (!isLoggedIn) {
        speak('You need to be logged in to checkout. Taking you to login.');
        navigate('/login', { state: { from: { pathname: '/cart' } } });
        return;
      }
      const total = getCartTotal();
      const names = cart.map(i => `${i.quantity} ${i.name}`).join(', ');
      speak(`You have ${names} in your cart. Total is ₹${total.toFixed(0)}. How would you like to pay? Say cash on delivery or UPI.`);
      setCheckoutStep(CHECKOUT_STEPS.AWAITING_PAYMENT_METHOD);
      return;
    }

    if (intent.type === 'SELECT_COD') {
      speak('Cash on delivery selected. Say confirm to place your order, or cancel to go back.');
      setCheckoutStep(CHECKOUT_STEPS.CONFIRM_COD);
      return;
    }

    if (intent.type === 'SELECT_UPI') {
      speak('UPI selected. Say confirm to proceed to payment, or cancel to go back.');
      setCheckoutStep(CHECKOUT_STEPS.CONFIRM_UPI);
      return;
    }

    if (intent.type === 'CONFIRM') {
      if (checkoutStep === CHECKOUT_STEPS.CONFIRM_COD) { await placeCODOrder(); return; }
      if (checkoutStep === CHECKOUT_STEPS.CONFIRM_UPI) { await placeUPIOrder(); return; }
    }

    if (intent.type === 'CANCEL') {
      speak('Cancelled.');
      setCheckoutStep(CHECKOUT_STEPS.NONE);
      return;
    }

  }, [
    logout, applyFilter, findFood, updateQuantity, getCartItems, getCartTotal,
    clearCart, isLoggedIn, navigate, speak, checkoutStep, placeCODOrder, placeUPIOrder,
  ]);

  /* ════════════════════════════════════════════
     MAIN TRANSCRIPT PROCESSOR
  ════════════════════════════════════════════ */
  const processText = useCallback(async (text) => {
    if (!text?.trim() || processedRef.current.has(text)) return;
    processedRef.current.add(text);

    /* Login multi-step */
    if (loginStep === 'awaiting_email') {
      setLoginEmail(text);
      setLoginStep('awaiting_password');
      speak('Please say your password.');
      return;
    }
    if (loginStep === 'awaiting_password') {
      speak('Logging you in...');
      try {
        const res = await fetch('http://localhost:8000/login/', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, password: text }),
        });
        const data = await res.json();
        if (res.ok) { login(data.user); speak('Login successful! How can I help you?'); }
        else speak('Login failed. Please try again.');
      } catch { speak('Login failed. Please try again.'); }
      finally { setLoginStep(null); setLoginEmail(''); }
      return;
    }

    /* Detect intent locally */
    const intent = detectIntent(text, checkoutStep);

    if (intent) {
      await handleIntent(intent);
      return;
    }

    /* Nothing matched — try backend as last resort */
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:8000/voice/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.aiResponse) {
        speak(data.aiResponse.response);
        // Backend can still return FILTER / ORDER / NAVIGATE commands
        const cmd = data.aiResponse;
        if (cmd.command === 'FILTER')   applyFilter(cmd.category || '');
        if (cmd.command === 'NAVIGATE') navigate(cmd.path);
        if (cmd.command === 'LOGOUT')   { await logout(); speak('Logged out.'); }
        if (cmd.command === 'ORDER' && cmd.items?.length) {
          for (const item of cmd.items) {
            const food = findFood(item.name);
            if (food) for (let i = 0; i < item.quantity; i++) await updateQuantity(food.id, 1);
          }
        }
        if (cmd.command === 'REMOVE' && cmd.items?.length) {
          for (const item of cmd.items) {
            const food = findFood(item.name);
            if (food) for (let i = 0; i < item.quantity; i++) await updateQuantity(food.id, -1);
          }
        }
        if (cmd.command === 'NAVIGATE' && cmd.page === 'login') {
          setLoginStep('awaiting_email');
          speak('Please say your email address.');
        }
      } else {
        speak("Sorry, I didn't understand that. Try saying 'show burgers' or 'add 2 pizzas'.");
      }
    } catch {
      speak("Sorry, I couldn't connect to the server. Try commands like 'show burgers', 'add 2 pizzas', or 'checkout'.");
    } finally {
      setIsProcessing(false);
    }
  }, [
    loginStep, loginEmail, login, checkoutStep,
    handleIntent, applyFilter, findFood, updateQuantity, logout, navigate, speak,
  ]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    clearTimeout(timeoutRef.current);
    if (transcript && !processedRef.current.has(transcript)) processText(transcript);
  }, [transcript, processText]);

  /* ── transcript watcher ── */
  useEffect(() => {
    if (!transcript || !isListening) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => processText(transcript), 1800);
    return () => clearTimeout(timeoutRef.current);
  }, [transcript, isListening, processText]);

  useEffect(() => {
    if (!listening && transcript && isListening) {
      const timer = setTimeout(stopListening, 1000);
      return () => clearTimeout(timer);
    }
  }, [listening, transcript, isListening, stopListening]);

  const startListening = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsListening(true);
    processedRef.current.clear();
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  };

  const closeAssistant = () => {
    window.speechSynthesis?.cancel();
    setTogg(false);
    setIsListening(false);
    setAssistantResponse('');
    setLoginStep(null);
    setLoginEmail('');
    setCheckoutStep(CHECKOUT_STEPS.NONE);
    setHasGreeted(false);
    processedRef.current.clear();
    resetTranscript();
  };

  const getStepHint = () => {
    if (checkoutStep === CHECKOUT_STEPS.AWAITING_PAYMENT_METHOD) return '💬 Say: "Cash on delivery" or "UPI"';
    if (checkoutStep === CHECKOUT_STEPS.CONFIRM_COD)             return '💬 Say: "Confirm" or "Cancel"';
    if (checkoutStep === CHECKOUT_STEPS.CONFIRM_UPI)             return '💬 Say: "Confirm" or "Cancel"';
    if (checkoutStep === CHECKOUT_STEPS.PROCESSING)              return '⏳ Placing your order...';
    return '💡 Try: "Show burgers", "Add 2 pizzas", "Take me to cart", "Checkout"';
  };

  /* ─────────────── RENDER ─────────────── */
  if (!Togg) {
    return (
      <div className="voice-assistant-floating">
        <button className="floating-voice-button" onClick={() => setTogg(true)} title="SmartBite AI">
          🎤
          {isSpeaking && <span className="floating-pulse" />}
        </button>
        {isSpeaking && <div className="floating-speaking-indicator">🔊 Speaking...</div>}
      </div>
    );
  }

  return (
    <div className="voice-assistant-panel">
      <div className="voice-header">
        <div>
          <h3>🎤 SmartBite AI</h3>
          {checkoutStep !== CHECKOUT_STEPS.NONE && (
            <p className="voice-subtitle" style={{ color: 'var(--orange-primary)' }}>
              {checkoutStep === CHECKOUT_STEPS.AWAITING_PAYMENT_METHOD && '🛒 Select payment method'}
              {checkoutStep === CHECKOUT_STEPS.CONFIRM_COD             && '💵 Confirm COD order'}
              {checkoutStep === CHECKOUT_STEPS.CONFIRM_UPI             && '📱 Confirm UPI payment'}
              {checkoutStep === CHECKOUT_STEPS.PROCESSING              && '⏳ Processing order...'}
            </p>
          )}
        </div>
        <button className="close-button" onClick={closeAssistant}>✕</button>
      </div>

      <div className="voice-controls">
        <button
          className={`listen-button ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || checkoutStep === CHECKOUT_STEPS.PROCESSING}
        >
          {checkoutStep === CHECKOUT_STEPS.PROCESSING ? '⏳'
            : isListening ? <><span className="pulse-icon" />🛑</>
            : isProcessing ? '⏳' : '🎤'}
        </button>

        {isListening && (
          <div className="listening-indicator">
            <div className="sound-wave">
              {[...Array(5)].map((_, i) => <div key={i} className="bar" />)}
            </div>
            <span>Listening... tap to stop</span>
          </div>
        )}

        {!isListening && !isProcessing && checkoutStep === CHECKOUT_STEPS.NONE && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tap mic to speak</span>
        )}

        {isProcessing && (
          <div className="processing-indicator"><div className="spinner" /> Processing...</div>
        )}
      </div>

      {transcript && (
        <div className="voice-transcript">
          <div className="transcript-label">You said</div>
          <div className="transcript-text">&ldquo;{transcript}&rdquo;</div>
        </div>
      )}

      {assistantResponse && (
        <div className="assistant-response">
          <div className="response-label">SmartBite AI</div>
          <div className="response-text">{assistantResponse}</div>
          {isSpeaking && <div className="speaking-indicator"><span>🔊</span> Speaking...</div>}
        </div>
      )}

      {/* Category quick chips */}
      {checkoutStep === CHECKOUT_STEPS.NONE && (
        <div style={{ padding: '0 1.25rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {[
            
          ].map(({ label, key }) => (
            <button key={key} className="voice-chip" onClick={() => processText(`show ${key}`)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Checkout: payment method */}
      {checkoutStep === CHECKOUT_STEPS.AWAITING_PAYMENT_METHOD && (
        <div style={{ padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button className="voice-chip" onClick={() => processText('cash on delivery')}>💵 Cash on Delivery</button>
          <button className="voice-chip" onClick={() => processText('upi')}>📱 UPI / Card</button>
          <button className="voice-chip" onClick={() => processText('cancel')}>✕ Cancel</button>
        </div>
      )}

      {/* Checkout: confirm / cancel */}
      {(checkoutStep === CHECKOUT_STEPS.CONFIRM_COD || checkoutStep === CHECKOUT_STEPS.CONFIRM_UPI) && (
        <div style={{ padding: '0 1.25rem', display: 'flex', gap: '0.5rem' }}>
          <button
            className="voice-chip"
            style={{ flex: 1, background: 'rgba(56,161,105,0.15)', borderColor: 'rgba(56,161,105,0.4)', color: '#68d391' }}
            onClick={() => processText('confirm')}
          >✅ Confirm</button>
          <button className="voice-chip" style={{ flex: 1 }} onClick={() => processText('cancel')}>✕ Cancel</button>
        </div>
      )}

      <div className="voice-tips">{getStepHint()}</div>
    </div>
  );
};

export default VoiceAssistant;