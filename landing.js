// ACADEX — Landing Page Logic

// Sticky nav on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('lNav');
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById('lMobileMenu');
  const hamburger = document.getElementById('lHamburger');
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open');
  hamburger.classList.toggle('open');
}

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeUp 0.6s ease both';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step-card, .competition-stat').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
