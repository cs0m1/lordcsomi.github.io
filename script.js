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
  
  // Performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Initialize blobs array
  let blobs = [];
  
  // Define colors with adjusted opacity for mobile
  const blobColors = [
    ['rgba(0, 183, 255, 0.5)', 'rgba(0, 140, 255, 0.25)', 'rgba(0, 102, 204, 0.02)'],
    ['rgba(0, 191, 255, 0.5)', 'rgba(0, 150, 255, 0.25)', 'rgba(0, 112, 224, 0.02)'],
    ['rgba(0, 170, 255, 0.5)', 'rgba(0, 130, 255, 0.25)', 'rgba(0, 92, 184, 0.02)'],
    ['rgba(0, 160, 255, 0.5)', 'rgba(0, 120, 255, 0.25)', 'rgba(0, 82, 164, 0.02)'],
    ['rgba(0, 150, 255, 0.5)', 'rgba(0, 110, 255, 0.25)', 'rgba(0, 72, 144, 0.02)']
  ];

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

  // Blob class
  class Blob {
    constructor(colors, width, height) {
      this.radius = 300;
      this.colors = colors;
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.originalSpeed = {
        x: this.vx,
        y: this.vy
      };
    }

    draw() {
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      gradient.addColorStop(0, this.colors[0]);
      gradient.addColorStop(0.4, this.colors[1]);
      gradient.addColorStop(1, this.colors[2]);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    update(canvasWidth, canvasHeight) {
      this.x += this.vx * 0.8;
      this.y += this.vy * 0.8;

      const margin = -this.radius * 0.5;
      if (this.x - this.radius <= margin) {
        this.x = this.radius + margin;
        this.vx = Math.abs(this.vx) * 0.8;
        this.originalSpeed.x = Math.abs(this.originalSpeed.x) * 0.8;
      } else if (this.x + this.radius >= canvasWidth - margin) {
        this.x = canvasWidth - this.radius - margin;
        this.vx = -Math.abs(this.vx) * 0.8;
        this.originalSpeed.x = -Math.abs(this.originalSpeed.x) * 0.8;
      }

      if (this.y - this.radius <= margin) {
        this.y = this.radius + margin;
        this.vy = Math.abs(this.vy) * 0.8;
        this.originalSpeed.y = Math.abs(this.originalSpeed.y) * 0.8;
      } else if (this.y + this.radius >= canvasHeight - margin) {
        this.y = canvasHeight - this.radius - margin;
        this.vy = -Math.abs(this.vy) * 0.8;
        this.originalSpeed.y = -Math.abs(this.originalSpeed.y) * 0.8;
      }

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repulsionRadius = 250;
        
        if (distance < repulsionRadius) {
          const force = (1 - distance / repulsionRadius) * 0.6;
          const angle = Math.atan2(dy, dx);
          
          this.vx += Math.cos(angle) * force;
          this.vy += Math.sin(angle) * force;
          
          this.vx += (Math.random() - 0.5) * 0.05;
          this.vy += (Math.random() - 0.5) * 0.05;
        }
      }

      this.vx += (this.originalSpeed.x - this.vx) * 0.003;
      this.vy += (this.originalSpeed.y - this.vy) * 0.003;
    }
  }

  function initializeBlobs() {
    const count = isMobile ? 3 : 5;
    const baseSize = isMobile ? 200 : 300;
    const sizeIncrement = isMobile ? 30 : 40;
    const baseSpeedFactor = isMobile ? 0.3 : 0.4;
    const speedDecrement = isMobile ? 0.05 : 0.04;

    blobs = Array(count).fill().map((_, i) => {
      const blob = new Blob(blobColors[i], canvas.width, canvas.height);
      blob.radius = baseSize + (i * sizeIncrement);
      const speedFactor = baseSpeedFactor - (i * speedDecrement);
      blob.vx *= speedFactor;
      blob.vy *= speedFactor;
      blob.originalSpeed.x = blob.vx;
      blob.originalSpeed.y = blob.vy;
      return blob;
    }).reverse();
  }

  // Animation loop
  let lastTime = 0;
  function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    
    if (!isMobile || deltaTime > 16.67) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.filter = `blur(${isMobile ? '100px' : '140px'})`;
      blobs.forEach(blob => {
        blob.update(canvas.width, canvas.height);
        blob.draw();
      });
      ctx.filter = 'none';
      
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
    initializeBlobs();
  }, isMobile ? 500 : 200);

  resizeCanvas();
  requestAnimationFrame(animate);
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      canvas.classList.add('loaded');
    }, 300);
  });
  
  window.addEventListener('resize', resizeCanvas);

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
