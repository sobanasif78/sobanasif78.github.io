/**
 * Soban Asif Awan — Portfolio Script
 * Creative Agency Micro-interactions, Canvas Particles, Category Filters & Toast
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. DYNAMIC CURSOR GLOW FOLLOWER
  const cursorGlow = document.getElementById('cursor-glow');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursorGlow() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    if (cursorGlow) {
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
    }
    requestAnimationFrame(renderCursorGlow);
  }
  renderCursorGlow();

  // 2. HERO INTERACTIVE CANVAS (Dynamic Particle Mesh)
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 45;
    const maxDistance = 140;

    function resizeCanvas() {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      initParticles();
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Subtle mouse repulsion / attraction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.x -= (dx / dist) * 0.8;
          this.y -= (dy / dist) * 0.8;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 255, 0, 0.45)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(200, 255, 0, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();
  }

  // 3. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
  const revealElements = document.querySelectorAll('.reveal-el');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach((el) => revealObserver.observe(el));

  // 4. PROJECT CATEGORY FILTERING
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 5. TOAST NOTIFICATION SYSTEM
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message, iconName = 'check-circle-2') {
    if (!toast) return;
    clearTimeout(toastTimer);

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-4 h-4 text-accent"></i>
      <span>${message}</span>
    `;
    if (window.lucide) lucide.createIcons();

    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // 6. 1-CLICK EMAIL CLIPBOARD COPY
  const copyBtn = document.getElementById('copy-email-btn');
  const emailTextEl = document.getElementById('email-text');

  if (copyBtn && emailTextEl) {
    copyBtn.addEventListener('click', async () => {
      const email = emailTextEl.innerText.trim();
      try {
        await navigator.clipboard.writeText(email);
        const copyLabel = copyBtn.querySelector('.copy-label');
        if (copyLabel) copyLabel.textContent = 'Copied!';
        showToast('Email address copied to clipboard!');
        setTimeout(() => {
          if (copyLabel) copyLabel.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        showToast('Copied: ' + email);
      }
    });
  }

  // 7. CONTACT FORM SUBMISSION HANDLER (posts to Formspree)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const submitBtn = document.getElementById('submit-btn');

      submitBtn.innerHTML = `
        <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>
        <span>Transmitting...</span>
      `;
      if (window.lucide) lucide.createIcons();

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          showToast(`Thank you, ${name}! Your message has been sent.`);
          contactForm.reset();
          submitBtn.innerHTML = `
            <span>Message Sent!</span>
            <i data-lucide="check" class="w-4 h-4"></i>
          `;
        } else {
          showToast('Something went wrong. Please try again or email me directly.', 'alert-circle');
          submitBtn.innerHTML = `
            <span>Transmit Message</span>
            <i data-lucide="send" class="w-4 h-4"></i>
          `;
        }
      } catch (err) {
        showToast('Network error. Please try again or email me directly.', 'alert-circle');
        submitBtn.innerHTML = `
          <span>Transmit Message</span>
          <i data-lucide="send" class="w-4 h-4"></i>
        `;
      }

      if (window.lucide) lucide.createIcons();
      setTimeout(() => {
        submitBtn.innerHTML = `
          <span>Transmit Message</span>
          <i data-lucide="send" class="w-4 h-4"></i>
        `;
        if (window.lucide) lucide.createIcons();
      }, 3000);
    });
  }

  // 8. LIVE TIMEZONE CLOCK (PKT / UTC+5)
  const timeDisplay = document.getElementById('local-time');
  function updateTime() {
    if (!timeDisplay) return;
    const now = new Date();
    // Pakistan Standard Time options
    const options = {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    timeDisplay.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
  }
  updateTime();
  setInterval(updateTime, 1000);

  // Dynamic Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 9. MOBILE NAVIGATION DRAWER TOGGLE
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
      mobileDrawer.classList.toggle('flex');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
        mobileDrawer.classList.remove('flex');
      });
    });
  }

  // 10. ACTIVE LINK HIGHLIGHT ON SCROLL
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('text-accent');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('text-accent');
      }
    });

    // Navbar blur enhancement on scroll
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('py-2');
        navbar.classList.remove('py-4');
      } else {
        navbar.classList.add('py-4');
        navbar.classList.remove('py-2');
      }
    }
  });
});
