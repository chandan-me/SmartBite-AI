import React from 'react'
import { Outlet } from 'react-router-dom'
import { GlobalStateProvider } from './context/GlobalStateContext'
import Navbar from './components/Navbar'
import VoiceAssistant from './components/VoiceAssistant'
import Footer from './components/Footer'
import { useEffect, useState } from "react";

const App = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") !== "light"
  );
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  return (
    <GlobalStateProvider>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Outlet />
      <VoiceAssistant />
      <Footer />
    </GlobalStateProvider>
    
  )
}

export default App