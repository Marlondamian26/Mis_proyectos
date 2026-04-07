import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../styles/theme.css';
import '../index.css';
import './styles/promocional.css';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Servicios from './components/Servicios';
import SobreNosotros from './components/SobreNosotros';
import Testimonios from './components/Testimonios';
import Contacto from './components/Contacto';
import CTA from './components/CTA';
import Footer from './components/Footer';

import Login from '../components/Login';
import Registro from '../components/Registro';
import { CLINIC_NAME } from './config/constants';

function LandingPage() {
  const { theme } = useTheme();
  
  return (
    <div className="sitio-promocional" data-theme={theme}>
      <Navbar />
      
      <main>
        <section id="inicio">
          <Hero />
        </section>
        
        <Servicios />
        
        <SobreNosotros />
        
        <Testimonios />
        
        <Contacto />
        
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router basename="/promocional">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default App;