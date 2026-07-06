import React from 'react'
import { Link } from 'react-router-dom'
import './CSS/Footer.css'

import { IoLogoGithub } from "react-icons/io5";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { MdContacts } from "react-icons/md";
import { MdAttachEmail } from "react-icons/md";


const Footer = () => {
  return (
    <div className='outerFooter'>
      <div className='Footer'>
        <div className='FooterContent'>
          <div className='footer-brand'>
            <div className='footer-brand-logo'>🍽️ SmartBite <span>AI</span></div>
            <p>AI-powered food ordering with voice assistant. Get the best meals delivered to your door.</p>
          </div>

          <div className='FooterSection'>
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div className='FooterSection'>
            <h3>Support</h3>
            <ul>
              <li><Link to="/about">FAQ</Link></li>
              <li><Link to="/about">Terms of Service</Link></li>
              <li><Link to="/about">Privacy Policy</Link></li>
              <li><Link to="/about">Help Center</Link></li>
              
            </ul>
          </div>

          <div className='FooterSection'>
            <h3>Follow me</h3>
            <div className='SocialIcons'>
              <a href="https://www.chandan-n.me/" target="_blank"><MdContacts /></a>
              <a href="mailto:chandan2004.n@gmail.com" target="_blank"><MdAttachEmail /></a>
              <a href="https://github.com/chandan-me" target="_blank" ><IoLogoGithub /></a>
              <a href="https://x.com/n_chandan2004" target="_blank"><FaSquareXTwitter /></a>
              <a href="https://www.linkedin.com/in/chandan-niranjan/" target="_blank"><FaLinkedin /></a>
            </div>
          </div>
        </div>

        <div className='FooterBottom'>
          <p>© 2026 SmartBite AI. All rights reserved. | Designed with ❤️ for food lovers</p>
          <p style={{color:'var(--orange-primary)', fontSize:'0.78rem', fontWeight:'600'}}>
            🤖 AI-Powered · 🎤 Voice-Enabled · 🚀 Fast Delivery
          </p>
        </div>
      </div>
    </div>
  )
}

export default Footer
