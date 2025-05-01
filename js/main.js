// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navContainer = document.querySelector('.nav-container');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

// Smooth Scrolling & Active Link Update
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');

    // Check if target is just "#" (like the logo link)
    if (targetId === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Update active state for Home link
      document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
      const homeLink = document.querySelector('.nav-links a[href="#home"]');
      if(homeLink) homeLink.classList.add('active');
      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
      return; // Exit early for the "#" link
    }

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const navHeight = navContainer ? navContainer.offsetHeight : 70;
      const offsetTop = targetElement.offsetTop - navHeight;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Update active link immediately on click
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
      });

      // Check if the clicked anchor itself is inside the nav-links
      if (this.closest('.nav-links')) {
        this.classList.add('active');
      } else {
        // If clicked from outside nav (e.g., CTA button), activate corresponding nav link
        const correspondingNavLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
        if (correspondingNavLink) {
          correspondingNavLink.classList.add('active');
        }
      }

      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
      }
    }
  });
});

// Scroll Spy (Update active link on scroll)
const sections = document.querySelectorAll('section[id]');

const scrollSpyHandler = () => {
  const scrollPosition = window.scrollY;
  const navHeight = navContainer ? navContainer.offsetHeight : 70;

  // Sticky Navigation Style Change
  if (navContainer) {
    if (scrollPosition > 50) {
      navContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      navContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      navContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      navContainer.style.boxShadow = 'none';
    }
  }

  // Active Link Update Logic
  let currentSectionId = '';
  sections.forEach(section => {
    // Adjust offset calculation slightly for better accuracy
    const sectionTop = section.offsetTop - navHeight - 50;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSectionId = section.getAttribute('id');
    }
  });

  // Handle edge case: if scrolled near the bottom, activate the last section link
  const bottomThreshold = document.body.offsetHeight - window.innerHeight - navHeight;
  if (scrollPosition >= bottomThreshold - 50) {
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      currentSectionId = lastSection.getAttribute('id');
    }
  }

  // Update active class on nav links
  let foundActive = false;
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSectionId) {
      link.classList.add('active');
      foundActive = true;
    }
  });

  // Handle edge case: if scrolled to top, activate "Home"
  if (!foundActive && scrollPosition < sections[0].offsetTop - navHeight - 50) {
    const homeLink = document.querySelector('.nav-links a[href="#home"]');
    if(homeLink) homeLink.classList.add('active');
  }
};

window.addEventListener('scroll', scrollSpyHandler);

// Initial check for active link on page load/refresh
window.addEventListener('load', scrollSpyHandler);

// 타이핑 효과 (영웅 섹션)
document.addEventListener('DOMContentLoaded', function() {
  const text = document.querySelector('.hero-content h3');
  if (text) {
    const originalText = text.textContent;
    text.textContent = '';

    let i = 0;
    const typeWriter = () => {
      if (i < originalText.length) {
        text.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
      }
    };

    setTimeout(typeWriter, 1000);
  }
});

