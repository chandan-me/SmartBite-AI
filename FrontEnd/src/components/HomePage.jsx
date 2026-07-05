import React, { useContext, useState, useEffect } from 'react'
import { getRecipes } from "../recipeApi";
import { Link } from 'react-router-dom'
import './CSS/Hero.css'
import ItemsPage from './ItemsPage'
import { GlobalStateContext } from "../context/GlobalStateContext";

const AI_CATEGORIES = [
  {label:'Non-Veg', emoji:'🍖', badge:'nonveg', keywords:['chicken','mutton','beef','pork','fish','seafood']},
  {label:'Veg', emoji:'🥦', badge:'vegan', keywords:['vegan','plant-based','tofu','tempeh','seitan','legumes','beans','lentils']},
  { label: 'Healthy', emoji: '🥗', badge: 'healthy', keywords: ['salad','healthy','veggie','oats','fruit',"vegetable","quinoa","avocado","grilled","protein","low calorie","oats","smoothie"] },
  { label: 'Spicy', emoji: '🌶️', badge: 'spicy', keywords: ['spicy','pepper','chilli','peri','masala', "chili","masala","schezwan","tandoori","curry","jalapeno","hot","buffalo"] },
  { label: 'Sweet', emoji: '🍰', badge: 'sweet', keywords: [ "cake","dessert","sweet","cookie","brownie","ice cream","lava","halwa","chocolate","donut","cupcake","pie"] },
  { label: 'Fast Food', emoji: '🍔', badge: 'fast', keywords: ['burger','pizza','fries','sandwich','wrap'] },
  { label: 'Breakfast', emoji: '🍳', badge: 'breakfast', keywords: ['breakfast','pancake','waffle','omelette','cereal','smoothie bowl'] },
  { label: 'Desserts', emoji: '🍨', badge: 'dessert', keywords: ['dessert','cake','ice cream','pudding'] },

]

const getBadge = (name, category) => {
  const lower = (name + ' ' + category).toLowerCase()
  for (const cat of AI_CATEGORIES) {
    if (cat.keywords.some(k => lower.includes(k))) return cat.badge
  }
  return 'default'
}

const getRating = (id) => (3.8 + ((id * 17) % 12) / 10).toFixed(1)

const VoicePanelInline = ({ onOpen }) => (
  <div className='sb-voice-panel'>
    <div className='sb-voice-panel__header'>
      <span className='sb-voice-panel__title'>
        🎤 Voice Assistant
      </span>
      <div className='sb-voice-panel__waves'>
        {[8,14,18,12,16].map((h,i) => (
          <span key={i} style={{height: h + 'px'}} />
        ))}
      </div>
    </div>

    <div className='sb-voice-panel__mic-wrap'>
      <button className='sb-mic-btn-large' onClick={onOpen}>
        <span className='pulse-ring' />
        🎤
      </button>
      <span className='sb-voice-status'>Listening...</span>
    </div>

    <div className='sb-voice-greeting'>
      👋 Hi! I'm SmartBite AI<br />
      <span style={{color:'var(--text-muted)'}}>How can I help you today?</span>
    </div>

    <div className='sb-voice-suggestions'>
      {['Show me pizza', 'Find healthy food', 'I want something spicy', "Show today's offers"].map(s => (
        <button key={s} className='sb-voice-chip' onClick={onOpen}>{s}</button>
      ))}
    </div>
  </div>
)

const HomePage = () => {
const { setTogg, addFavorite} = useContext(GlobalStateContext);
  const [activeAICat, setActiveAICat] = useState('All')
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  

  useEffect(() => {

  async function loadRecipes() {

    try {

      const data = await getRecipes();

      setRecipes(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoadingRecipes(false);

    }

  }

  loadRecipes();

}, []);

const getAIRecs = () => {

  if (!recipes.length) return [];

  if (activeAICat === "All") {

    return recipes.slice(0, 8);

  }

  const cat = AI_CATEGORIES.find(
    (c) => c.label === activeAICat
  );

  if (!cat) {

    return recipes.slice(0, 8);

  }

  const filtered = recipes.filter((item) => {

    const lower = (
      item.name +
      " " +
      item.cuisine
    ).toLowerCase();

    return cat.keywords.some((k) =>
      lower.includes(k)
    );

  });

  return filtered.length
    ? filtered
    : recipes.slice(0, 8);

};

  const aiRecs = getAIRecs()

  return (
    <div className='sb-home'>
      {/* ── Hero Grid ── */}
      <div className='sb-hero'>
        {/* Main banner */}
        <div className='sb-hero__main'>
          <div className='sb-hero__bg' />
          <img
            className='sb-hero__food-img'
            src='/Hero2.png'
            alt='Delicious Food'
            onError={e => { e.target.style.display='none' }}
          />
          <div className='sb-hero__content'>
            <h1 className='sb-hero__title'>
              Good Food,<br />
              <span className='orange'>Smart</span> Choice!
            </h1>
            <p className='sb-hero__subtitle'>
              SmartBite AI brings you the best food experience with AI recommendations and Voice Assistant.
            </p>
            <div className='sb-hero__ctas'>
              <a href='#items' className='sb-btn-primary'>Order Now →</a>
              <a href='#items' className='sb-btn-outline'>Explore Menu 🍽️</a>
            </div>
          </div>
          <div className='sb-hero__promo'>
            <div className='sb-promo__pct'>20% OFF</div>
            <div className='sb-promo__sub'>On Your First Order</div>
            <span className='sb-promo__code'>SB20</span>
          </div>
        </div>

        {/* Voice assistant panel */}
        <VoicePanelInline onOpen={() => setTogg(true)} />
      </div>

      {/* ── AI Recommended Section ── */}
      <div className='sb-section'>
        <div className='sb-section__header'>
          <h2 className='sb-section__title'>
            <span className='ai-star'>✦</span> AI Recommended For You
          </h2>
          <a href='#items' className='sb-section__view-all'>View All →</a>
        </div>

        {/* Category filter pills */}
        <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.25rem', flexWrap:'wrap'}}>
          {['All', ...AI_CATEGORIES.map(c => c.label)].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveAICat(cat)}
              style={{
                background: activeAICat === cat ? 'var(--orange-gradient)' : 'var(--bg-card)',
                color: activeAICat === cat ? 'white' : 'var(--text-secondary)',
                border: activeAICat === cat ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: '20px', padding: '6px 16px',
                fontSize: '0.83rem', fontWeight: '600',
                cursor: 'pointer', transition: 'var(--transition)',
              }}
            >
              {AI_CATEGORIES.find(c=>c.label===cat)?.emoji || '🍽️'} {cat}
            </button>
          ))}
        </div>

        <div className='sb-cards-row'>
          {aiRecs.map(item => {
            const badge = getBadge(item.name, item.cuisine)
            const rating = item.rating

            const price = (item.price || (100 + ((item.id * 37) % 200))).toFixed(0)

            return (
              <div key={item.id} className='sb-food-card'>
                <div className='sb-food-card__img-wrap'>
                  <img
                    className='sb-food-card__img'
                    src={item.image}
                    alt={item.name}
                    onError={e => { e.target.src = 'https://via.placeholder.com/300x225/1a1a1a/ff6b00?text=Food' }}
                  />
                  <span className={`sb-food-card__badge ${badge}`}>
                    {AI_CATEGORIES.find(c=>c.badge===badge)?.label || item.cuisine}
                  </span>
                </div>
                <div className='sb-food-card__body'>
                  <div className='sb-food-card__name'>{item.name}</div>
                      <div className="sb-food-card__meta">

                          <div className="rating">

                              ⭐ {item.rating}

                              <span>
                                  ({item.reviewCount} Reviews)
                              </span>

                          </div>

                          <div className="price">

                              ₹{price}

                          </div>

                      </div>

                </div>
                <div className='sb-food-card__footer'>
                    <button
                      className="sb-add-btn"
                      onClick={() => addFavorite(item)}
                    >
                      ❤️ Favorite
                    </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── How It Works + Free Delivery ── */}
      <div className='sb-how-wrap'>
        <div className='sb-how'>
          <h3 className='sb-how__title'>⏱️ How It Works</h3>
          <div className='sb-how__steps'>
            {[
              { icon: '🛍️', title: 'Choose Food', desc: 'Browse your favorite food items' },
              { icon: '🛒', title: 'Add to Cart', desc: 'Add items to cart and place order' },
              { icon: '🎤', title: 'AI Assistant', desc: 'Use voice assistant for quick help' },
              { icon: '🎉', title: 'Enjoy Meal', desc: 'Get your food delivered to your doorstep' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.title}>
                <div className='sb-how__step'>
                  <div className='sb-how__icon'>{step.icon}</div>
                  <div className='sb-how__step-text'>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <div className='sb-how__arrow'>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className='sb-delivery-card'>
          <div>
            <h3>Free Delivery</h3>
            <p>On orders above ₹299</p>
          </div>
          <a href='#items' className='sb-btn-white'>Order Now →</a>
        </div>
      </div>

      {/* ── Full Menu ── */}
      <ItemsPage />
    </div>
  )
}

export default HomePage
