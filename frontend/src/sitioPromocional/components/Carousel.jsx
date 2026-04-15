import React, { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCircle } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;
  }
  return 'http://127.0.0.1:8000/api';
};

const API_URL = getApiUrl();

function Carousel() {
  const { language } = useLanguage();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      setLoading(true);
      const url = `${API_URL}/sitio-imagenes/carousel/`;
      console.log('[Carousel] Fetching from:', url);
      
      const response = await fetch(url);
      console.log('[Carousel] Response status:', response.status, 'ok:', response.ok);
      
      if (!response.ok) {
        console.error('[Carousel] Response not ok');
        setError('Error del servidor');
        return;
      }
      
      const contentType = response.headers.get('content-type');
      console.log('[Carousel] Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[Carousel] Invalid content-type');
        setError('Tipo de contenido incorrecto');
        return;
      }
      
      const data = await response.json();
      console.log('[Carousel] Received data:', data);
      setImages(data);
      setError(null);
    } catch (err) {
      console.error('[Carousel] Fetch error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="promo-carousel">
        <div className="promo-carousel-loading">
          <div className="promo-carousel-spinner"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="promo-carousel promo-carousel-error">
        <div className="promo-carousel-error-message">
          <p>Error al cargar imágenes del carrusel</p>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="promo-carousel promo-carousel-empty">
        <div className="promo-carousel-empty-message">
          <p>No hay imágenes en el carrusel. Agrega imágenes desde el panel de administración.</p>
        </div>
      </section>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <section className="promo-carousel">
      <div className="promo-carousel-container">
        <div className="promo-carousel-slide">
          <img 
            src={currentImage.imagen} 
            alt={currentImage.titulo || 'Carousel image'} 
            className="promo-carousel-image"
          />
          {currentImage.titulo && (
            <div className="promo-carousel-caption">
              <h3>{currentImage.titulo}</h3>
              {currentImage.descripcion && <p>{currentImage.descripcion}</p>}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button 
              className="promo-carousel-arrow promo-carousel-prev" 
              onClick={goToPrevious}
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </button>
            
            <button 
              className="promo-carousel-arrow promo-carousel-next" 
              onClick={goToNext}
              aria-label="Next slide"
            >
              <FaChevronRight />
            </button>

            <div className="promo-carousel-dots">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`promo-carousel-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <FaCircle />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Carousel;