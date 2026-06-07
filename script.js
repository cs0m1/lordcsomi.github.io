document.addEventListener('DOMContentLoaded', function() {
  // Calculate and display age dynamically
  function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  
  const ageElement = document.getElementById('age');
  if (ageElement) {
    ageElement.textContent = calculateAge('2005-08-06');
  }

  const canvas = document.getElementById('blobCanvas');
  const ctx = canvas.getContext('2d');

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  let sketches = [];
  const SHAPE_TYPES = ['cube', 'hexagon', 'rect', 'circle', 'triangle'];

  class Sketch {
    constructor(width, height) {
      this.reset(width, height, true);
    }

    reset(width, height, init) {
      if (!init && Math.random() > 0.45) {
        this.x = width * (0.45 + Math.random() * 0.6);
        this.y = height * (Math.random() * 0.55);
      } else {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
      this.vx = (Math.random() - 0.5) * 0.65;
      this.vy = (Math.random() - 0.5) * 0.65;
      this.size = 8 + Math.random() * 26;
      this.type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.002;
      this.opacity = 0.18 + Math.random() * 0.22;
      this.originalVx = this.vx;
      this.originalVy = this.vy;
    }

    draw() {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const base = dark ? `232, 228, 216` : `37, 38, 39`;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.strokeStyle = `rgba(${base}, ${this.opacity})`;
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      const s = this.size;

      switch (this.type) {
        case 'hexagon': {
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const px = Math.cos(a) * s, py = Math.sin(a) * s;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          for (let i = 0; i <= 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            i === 0 ? ctx.moveTo(Math.cos(a) * s * 0.48, Math.sin(a) * s * 0.48)
                    : ctx.lineTo(Math.cos(a) * s * 0.48, Math.sin(a) * s * 0.48);
          }
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ctx.moveTo(Math.cos(a) * s * 0.48, Math.sin(a) * s * 0.48);
            ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
          }
          break;
        }
        case 'cube': {
          const f = s * 0.62, d = f * 0.42;
          ctx.moveTo(-f/2, -f/2); ctx.lineTo(f/2, -f/2);
          ctx.lineTo(f/2, f/2);   ctx.lineTo(-f/2, f/2);
          ctx.closePath();
          ctx.moveTo(-f/2, -f/2); ctx.lineTo(-f/2+d, -f/2-d);
          ctx.lineTo(f/2+d, -f/2-d); ctx.lineTo(f/2, -f/2);
          ctx.moveTo(f/2, -f/2);  ctx.lineTo(f/2+d, -f/2-d);
          ctx.lineTo(f/2+d, f/2-d); ctx.lineTo(f/2, f/2);
          break;
        }
        case 'circle': {
          ctx.arc(0, 0, s, 0, Math.PI * 2);
          ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
          ctx.moveTo(0, -s); ctx.lineTo(0, s);
          ctx.moveTo(s * 0.42, 0);
          ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
          break;
        }
        case 'triangle': {
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.866, s * 0.5);
          ctx.lineTo(-s * 0.866, s * 0.5);
          ctx.closePath();
          ctx.moveTo(0, -s * 0.3);
          ctx.lineTo(s * 0.28, s * 0.15);
          ctx.lineTo(-s * 0.28, s * 0.15);
          ctx.closePath();
          break;
        }
        default: {
          const rw = s * 1.35, rh = s * 0.78;
          ctx.rect(-rw/2, -rh/2, rw, rh);
          ctx.moveTo(-rw/5, -rh/2); ctx.lineTo(-rw/5, rh/2);
          ctx.moveTo(rw/4,  -rh/2); ctx.lineTo(rw/4,  rh/2);
          ctx.moveTo(-rw/2, 0);     ctx.lineTo(rw/2,  0);
          break;
        }
      }

      ctx.stroke();
      ctx.restore();
    }

    update(width, height) {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repel = 180;
        if (dist < repel) {
          const force = (1 - dist / repel) * 0.35;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force;
          this.vy += Math.sin(angle) * force;
        }
      }

      this.vx += (this.originalVx - this.vx) * 0.008;
      this.vy += (this.originalVy - this.vy) * 0.008;

      const pad = this.size + 60;
      if (this.x < -pad) this.x = width + pad;
      if (this.x > width + pad) this.x = -pad;
      if (this.y < -pad) this.y = height + pad;
      if (this.y > height + pad) this.y = -pad;
    }
  }

  // Throttle helper
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Animation helpers
  function waitForAnimationEnd(element, className) {
    return new Promise(resolve => {
      const firstLetter = element.querySelector('.letter:first-child');
      const totalDuration = 1500 + (1320); // animation duration + last letter delay
      element.classList.add(className);
      setTimeout(resolve, totalDuration);
    });
  }

  function initializeShapes() {
    const count = isMobile ? 14 : 28;
    sketches = Array.from({ length: count }, () => new Sketch(canvas.width, canvas.height));
  }

  let lastTime = 0;
  function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;

    if (!isMobile || deltaTime > 16.67) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sketches.forEach(s => {
        s.update(canvas.width, canvas.height);
        s.draw();
      });
      lastTime = currentTime;
    }

    requestAnimationFrame(animate);
  }

  // Mouse tracking
  const mouse = { x: null, y: null };
  document.addEventListener('mousemove', throttle((e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, 16));
  
  document.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Form validation and submission
  const form = document.getElementById('contactForm');
  let isSubmitting = false;

  if (form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    const submitBtn = form.querySelector('.submit-btn');
    
    // Real-time validation
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        validateInput(input);
      });
      
      input.addEventListener('blur', () => {
        validateInput(input);
      });
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Prevent double submission
      if (isSubmitting) return;
      
      // Validate all fields
      let isValid = true;
      inputs.forEach(input => {
        if (!validateInput(input)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        inputs[0].focus();
        return;
      }
      
      // Start submission
      isSubmitting = true;
      submitBtn.disabled = true;
      submitBtn.classList.add('sending');
      
      try {
        // Send email
        await emailjs.send(
          'service_94d9gna',
          'template_rp9qs5f',
          {
            to_name: 'Csomi',
            from_name: form.querySelector('#name').value,
            from_email: form.querySelector('#email').value,
            message: form.querySelector('#message').value
          }
        );
        
        // Show success state
        submitBtn.classList.remove('sending');
        submitBtn.classList.add('success');
        
        // Reset form after delay
        setTimeout(() => {
          submitBtn.classList.remove('success');
          submitBtn.disabled = false;
          isSubmitting = false;
          form.reset();
          // Reset character counter
          if (charCount && charLimit && charLimitText && charCounter) {
            charCount.textContent = '0';
            charLimit.textContent = '10';
            charLimitText.textContent = 'characters minimum';
            charCounter.classList.remove('valid', 'invalid', 'warning');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error:', error);
        submitBtn.classList.remove('sending');
        submitBtn.disabled = false;
        isSubmitting = false;
        alert('Something went wrong. Please try again or use the email link above.');
      }
    });
  }

  // Input validation helper
  function validateInput(input) {
    const isValid = input.checkValidity();
    
    if (!isValid) {
      input.classList.add('invalid');
      input.classList.remove('valid');
    } else {
      input.classList.add('valid');
      input.classList.remove('invalid');
    }
    
    return isValid;
  }

  // Character counter for message textarea
  const messageTextarea = document.getElementById('message');
  const charCount = document.getElementById('charCount');
  const charLimit = document.getElementById('charLimit');
  const charLimitText = document.getElementById('charLimitText');
  const charCounter = document.querySelector('.char-counter');
  
  if (messageTextarea && charCount && charLimit && charLimitText) {
    const minLength = messageTextarea.minLength || 10;
    const maxLength = messageTextarea.maxLength || 1000;
    
    messageTextarea.addEventListener('input', () => {
      const currentLength = messageTextarea.value.length;
      charCount.textContent = currentLength;
      
      if (currentLength >= minLength) {
        // Switch to max counter mode
        charLimit.textContent = maxLength;
        charLimitText.textContent = 'characters maximum';
        charCounter.classList.add('valid');
        charCounter.classList.remove('invalid');
        
        // Warn if approaching max
        if (currentLength >= maxLength * 0.9) {
          charCounter.classList.add('warning');
        } else {
          charCounter.classList.remove('warning');
        }
      } else if (currentLength > 0) {
        // Show min counter mode
        charLimit.textContent = minLength;
        charLimitText.textContent = 'characters minimum';
        charCounter.classList.add('invalid');
        charCounter.classList.remove('valid', 'warning');
      } else {
        // Reset to default
        charLimit.textContent = minLength;
        charLimitText.textContent = 'characters minimum';
        charCounter.classList.remove('valid', 'invalid', 'warning');
      }
    });
  }
  
  // Initialize blobs and other functionality
  const resizeCanvas = throttle(function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeShapes();
  }, isMobile ? 500 : 200);

  resizeCanvas();
  requestAnimationFrame(animate);
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      canvas.classList.add('loaded');
    }, 300);
  });
  
  window.addEventListener('resize', resizeCanvas);

  // Trigger sketch draw-in when scrolled into view
  const sketchWraps = document.querySelectorAll('.section-sketch-wrap');
  if (sketchWraps.length && 'IntersectionObserver' in window) {
    const sketchObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sketch-visible');
          sketchObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    sketchWraps.forEach(w => sketchObs.observe(w));
  }

  // Staggered reveal of the project bento tiles
  const projectTiles = document.querySelectorAll('.projects-grid .project-card');
  if (projectTiles.length && 'IntersectionObserver' in window) {
    const tileObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('tile-in');
          tileObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    projectTiles.forEach((t, i) => {
      t.style.setProperty('--tile-delay', (i * 55) + 'ms');
      tileObs.observe(t);
    });
  } else {
    projectTiles.forEach(t => t.classList.add('tile-in'));
  }

  // Dark mode
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
  }

  applyTheme(localStorage.getItem('theme') || 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }

  // Game demo countdown
  function updateCountdown() {
    const target = new Date('2026-08-01T00:00:00');
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      const el = document.getElementById('countdown-display');
      if (el) el.textContent = 'Demo is live!';
      return;
    }
    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(mins).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
