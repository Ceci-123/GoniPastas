/**
 * GONI PASTAS - LÓGICA FRONTEND PRINCIPAL (main.js)
 * Manejo de navegación SPA, Menú Móvil, Filtros de Carta,
 * Mapa Interactivo y Pedidos Directos a WhatsApp.
 */

// Teléfono oficial para pedidos WhatsApp
const PHONE_NUMBER_WA = '5491164645474';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderAndScroll();
  initMobileMenu();
  initCategoryFilters();
  initDeliveryMap();
  initOrderModal();
  initFloatingWhatsApp();
  initScrollTop();
});

/* ==========================================================================
   1. HEADER FIJO, SCROLL SUAVE Y SCROLLSPY (SECCIÓN ACTIVA)
   ========================================================================== */
function initHeaderAndScroll() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], footer[id]');

  // Sombra y estilo al hacer scroll
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ScrollSpy para marcar la sección activa en el menú
  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Navegación con compensación de altura del header
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 76;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   2. MENÚ MÓVIL HAMBURGUESA Y OVERLAY
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const backdrop = document.getElementById('mobile-backdrop');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  if (!toggleBtn || !navMenu || !backdrop) return;

  const toggleMenu = (isOpen) => {
    const currentState = toggleBtn.classList.contains('active');
    const newState = isOpen !== undefined ? isOpen : !currentState;

    if (newState) {
      toggleBtn.classList.add('active');
      navMenu.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      toggleBtn.classList.remove('active');
      navMenu.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  };

  toggleBtn.addEventListener('click', () => toggleMenu());
  backdrop.addEventListener('click', () => toggleMenu(false));

  // Cerrar menú al hacer clic en un enlace de navegación
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      toggleMenu(false);
    }
  });
}

/* ==========================================================================
   3. FILTRADO DE PRODUCTOS POR CATEGORÍA
   ========================================================================== */
function initCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  if (!filterButtons.length || !productCards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar estado de botones
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // Animación de filtrado
      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   4. MAPA INTERACTIVO DE COBERTURA (LEAFLET / OPENSTREETMAP)
   ========================================================================== */
function initDeliveryMap() {
  const mapElement = document.getElementById('delivery-map');
  if (!mapElement || typeof L === 'undefined') return;

  // Coordenadas céntricas representativas del local
  const storeCoordinates = [-34.6037, -58.4200];

  try {
    const map = L.map('delivery-map', {
      center: storeCoordinates,
      zoom: 12,
      scrollWheelZoom: false // Evita atrapar el scroll de la página accidentalmente
    });

    // Tiles limpios y modernos de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Marcador del local de Goni Pastas con ícono gastronómico
    const storeIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background: #B83826;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid white;
          font-size: 16px;
        ">
          🍝
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    const marker = L.marker(storeCoordinates, { icon: storeIcon }).addTo(map);

    // Círculo Zona 1: Radio Cercano (Envío Bonificado)
    L.circle(storeCoordinates, {
      color: '#2ECC71',
      fillColor: '#2ECC71',
      fillOpacity: 0.18,
      radius: 4000,
      weight: 2
    }).addTo(map).bindPopup('<strong>Zona 1 (Radio 4 km)</strong><br>Envío Bonificado en pedidos superiores a $12.000');

    // Círculo Zona 2: Radio Extendido
    L.circle(storeCoordinates, {
      color: '#F39C12',
      fillColor: '#F39C12',
      fillOpacity: 0.10,
      radius: 8500,
      weight: 1.5,
      dashArray: '5, 5'
    }).addTo(map).bindPopup('<strong>Zona 2 (Radio Extendido hasta 8.5 km)</strong><br>Envíos diarios en moto refrigerada');

    // Habilitar zoom de rueda al hacer clic en el mapa
    map.on('click', () => {
      map.scrollWheelZoom.enable();
    });

    // Deshabilitar al salir del mapa
    map.on('mouseout', () => {
      map.scrollWheelZoom.disable();
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    window.addEventListener('resize', () => {
      map.invalidateSize();
    });
  } catch (error) {
    console.warn('Error inicializando Leaflet map:', error);
  }
}

/* ==========================================================================
   5. MODAL DE PEDIDO EXPRESS Y GENERACIÓN DE MENSAJE WHATSAPP
   ========================================================================== */
let currentOrderProduct = '';
let currentOrderPrice = '';

// Función global invocada desde los botones de los productos
window.pedirProducto = function(nombre, precio) {
  currentOrderProduct = nombre;
  currentOrderPrice = precio;

  const modal = document.getElementById('order-modal');
  const titleElem = document.getElementById('modal-item-name');
  const priceElem = document.getElementById('modal-item-price');
  const qtyInput = document.getElementById('modal-quantity');
  const notesInput = document.getElementById('modal-notes');

  if (modal && titleElem && priceElem && qtyInput) {
    titleElem.textContent = nombre;
    priceElem.textContent = precio;
    qtyInput.value = '1';
    if (notesInput) notesInput.value = '';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    // En caso de contingencia, enlace directo
    const msg = encodeURIComponent(`Hola Goni Pastas! Quiero encargar: ${nombre} (${precio}).`);
    window.open(`https://wa.me/${PHONE_NUMBER_WA}?text=${msg}`, '_blank');
  }
};

function initOrderModal() {
  const modal = document.getElementById('order-modal');
  const closeBtn = document.getElementById('order-modal-close');
  const qtyInput = document.getElementById('modal-quantity');
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const sendBtn = document.getElementById('modal-send-wa');
  const notesInput = document.getElementById('modal-notes');

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Cerrar al hacer clic afuera del contenido
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Control de Cantidades
  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
  }

  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val < 50) qtyInput.value = val + 1;
    });
  }

  // Enviar mensaje a WhatsApp
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const cantidad = qtyInput ? qtyInput.value : '1';
      const notas = notesInput && notesInput.value.trim() ? `\n• Aclaración: ${notesInput.value.trim()}` : '';

      const mensaje = `Hola Goni Pastas! 👋 Quisiera encargar:\n` +
                      `• Producto: ${currentOrderProduct}\n` +
                      `• Cantidad: ${cantidad}\n` +
                      `• Precio de referencia: ${currentOrderPrice}${notas}\n\n` +
                      `¿Me confirmarían disponibilidad y horario de entrega/retiro? ¡Muchas gracias!`;

      const url = `https://wa.me/${PHONE_NUMBER_WA}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
      closeModal();
    });
  }
}

/* ==========================================================================
   6. BOTÓN FLOTANTE DE WHATSAPP Y TOOLTIP DE BIENVENIDA
   ========================================================================== */
function initFloatingWhatsApp() {
  const tooltip = document.getElementById('whatsapp-tooltip');
  if (!tooltip) return;

  // Mostrar el tooltip suavemente a los 3.5 segundos para captar atención
  setTimeout(() => {
    tooltip.classList.add('active');
    // Ocultar automáticamente a los 9 segundos si el usuario no interactúa
    setTimeout(() => {
      tooltip.classList.remove('active');
    }, 5500);
  }, 3500);
}

/* ==========================================================================
   7. BOTÓN VOLVER ARRIBA (SCROLL TO TOP)
   ========================================================================== */
function initScrollTop() {
  const btnTop = document.getElementById('btn-scroll-top');
  if (!btnTop) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      btnTop.classList.add('visible');
    } else {
      btnTop.classList.remove('visible');
    }
  }, { passive: true });

  btnTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
