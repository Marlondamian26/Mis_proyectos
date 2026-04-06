import React, { useEffect } from 'react';
import '../styles/promocional.css';

import Navbar from './Navbar';
import Hero from './Hero';
import Servicios from './Servicios';
import SobreNosotros from './SobreNosotros';
import Testimonios from './Testimonios';
import Contacto from './Contacto';
import CTA from './CTA';
import Footer from './Footer';

function LandingWrapper() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sitio-promocional" data-theme="light">
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

export default LandingWrapper;