import './CSS/About.css'

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About <span>SmartBite AI</span></h1>
        <p>Voice-powered AI food ordering system — order with your voice, eat with pleasure.</p>
      </div>

      <div className="about-grid">
        {[
          { icon: '🎤', title: 'Voice Ordering', desc: 'Hands-free food ordering with cutting-edge AI voice recognition. Just speak your cravings.' },
          { icon: '🤖', title: 'AI Recommendations', desc: 'Personalized food recommendations powered by machine learning based on your preferences.' },
          { icon: '⚡', title: 'Fast Delivery', desc: 'Average delivery in under 20 minutes. We prioritize speed without compromising quality.' },
          { icon: '🛡️', title: 'Secure Payments', desc: 'Multiple payment methods including UPI, Card, and COD with bank-grade security.' },
          { icon: '🌟', title: 'Premium Quality', desc: 'Partnered with top restaurants to ensure every meal meets our high quality standards.' },
          { icon: '📱', title: 'Multi-Language', desc: 'Voice assistant supports multiple languages for a seamless ordering experience.' },
        ].map(card => (
          <div key={card.title} className="about-card">
            <div className="icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="about-section" style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-xl)', padding:'2rem', marginBottom:'1.5rem'}}>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800, marginBottom:'1rem'}}>Our Story</h2>
        <p>SmartBite AI was built to revolutionize food ordering — combining voice AI, smart recommendations, and fast delivery into one seamless experience. Starting as EchoEats, we've grown into a full-stack AI-powered platform that connects food lovers with the best meals in town.</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', textAlign:'center'}}>
        {[['500+','Restaurant Partners'],['50k+','Happy Customers'],['20min','Avg Delivery'],['4.8★','Rating']].map(([num,label]) => (
          <div key={label} style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:'1.5rem'}}>
            <div style={{fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, color:'var(--orange-primary)'}}>{num}</div>
            <div style={{color:'var(--text-secondary)', fontSize:'0.82rem', marginTop:'4px'}}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AboutPage
