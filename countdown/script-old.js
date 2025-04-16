document.addEventListener('DOMContentLoaded', () => {
    // Timer settings
    const timerSettings = {
        pomodoro: 25 * 60, // 25 minutes
        shortBreak: 5 * 60, // 5 minutes
        longBreak: 15 * 60 // 15 minutes
    };

    let currentMode = 'pomodoro';
    let timeLeft = timerSettings[currentMode];
    let isRunning = false;
    let timerId = null;

    // DOM elements
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const remainingTimeEl = document.querySelector('.remaining-time');
    const timerTitleEl = document.querySelector('.timer-title');

    // Start/Pause timer
    function toggleTimer() {
        isRunning = !isRunning;
        startBtn.innerHTML = isRunning ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        
        if (isRunning) {
            timerId = setInterval(updateTimer, 1000);
        } else {
            clearInterval(timerId);
        }
    }

    // Update timer
    function updateTimer() {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            isRunning = false;
            clearInterval(timerId);
            startBtn.innerHTML = '<i class="fas fa-play"></i>';
            // Notification sound could be added here
        }
    }

    // Reset timer
    function resetTimer() {
        isRunning = false;
        clearInterval(timerId);
        timeLeft = timerSettings[currentMode];
        startBtn.innerHTML = '<i class="fas fa-play"></i>';
        updateDisplay();
    }

    // Update display
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        remainingTimeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - Érettségi Hub`;
    }

    // Set timer mode
    function setTimer(mode) {
        document.querySelectorAll('.pomodoro-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick="setTimer('${mode}')"]`).classList.add('active');
        
        currentMode = mode;
        timeLeft = timerSettings[mode];
        
        // Update title text
        const titles = {
            pomodoro: 'Idő a tanulásra!',
            shortBreak: 'Rövid szünet',
            longBreak: 'Hosszú szünet'
        };
        timerTitleEl.textContent = titles[mode];
        
        resetTimer();
    }

    // Event listeners for timer controls
    startBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Make functions global
    window.setTimer = setTimer;
    window.openTab = (tabName) => {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show the selected tab
        document.getElementById(tabName).classList.add('active');
        // Add active class to the clicked button
        document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
    };

    // Original countdown timer code
    const targetDate = new Date('2025-05-05T09:00:00+02:00');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const landingSection = document.getElementById('home');
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    const countdownWrapper = document.querySelector('.countdown-wrapper');
    const navbarHeight = document.querySelector('.navbar').offsetHeight;

    // Navigation
    navToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('show');
            
            // Update active link
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.section');
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                navLink?.classList.add('active');
            }
        });
    });

    // Motivational messages
    const messages = [
        "Csak így tovább! Hajrá!",
        "Minden perc tanulás közelebb visz a sikerhez!",
        "Megéri a befektetett munka!",
        "Koncentrálj és kitartás!",
        "A siker apró lépésekből épül!",
        "Napról napra erősebb és okosabb vagy!",
        "A jövő azoké, akik készülnek rá!",
        "Hiszünk benned!",
        "Minden perc befektetés a jövődbe!",
        "A célod elérhető!"
    ];

    // Update countdown
    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.querySelector('.container').innerHTML = '<h1>Eljött az idő!</h1><p>Sok sikert az érettségihez!</p>';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');

        updateCircles(days, hours, minutes, seconds);
    }

    // Update progress circles
    function updateCircles(days, hours, minutes, seconds) {
        const totalDays = Math.ceil((targetDate - new Date('2024-01-29')) / (1000 * 60 * 60 * 24));
        const daysCircle = document.getElementById('days-circle');
        const hoursCircle = document.getElementById('hours-circle');
        const minutesCircle = document.getElementById('minutes-circle');
        const secondsCircle = document.getElementById('seconds-circle');

        daysCircle.style.setProperty('--progress', `${(days / totalDays) * 360}deg`);
        hoursCircle.style.setProperty('--progress', `${(hours / 24) * 360}deg`);
        minutesCircle.style.setProperty('--progress', `${(minutes / 60) * 360}deg`);
        secondsCircle.style.setProperty('--progress', `${(seconds / 60) * 360}deg`);
    }

    // Particle system
    class Particle {
        constructor(canvas, x, y) {
            this.canvas = canvas;
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 2;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 6 - 3;
            this.opacity = 1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.01;
            this.size -= 0.1;
        }

        draw(ctx) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let particles = [];

    function resizeCanvas() {
        const rect = landingSection.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles = particles.filter(particle => particle.size > 0.2 && particle.opacity > 0);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
        
        requestAnimationFrame(animate);
    }

    function createFloatingMessage(x, y, message) {
    // Only create messages in the landing section, avoiding navbar and countdown
    const rect = landingSection.getBoundingClientRect();
    const countdownRect = countdownWrapper.getBoundingClientRect();
    
    // Check if mouse is over countdown wrapper
    const isOverCountdown = (
        x >= countdownRect.left &&
        x <= countdownRect.right &&
        y >= countdownRect.top &&
        y <= countdownRect.bottom
    );

    // Don't create messages if over navbar, outside section, or over countdown
    if (y < rect.top || y > rect.bottom || y < navbarHeight || isOverCountdown) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'floating-message';
        messageEl.style.left = `${x}px`;
        messageEl.style.top = `${y}px`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        // Random direction and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200 + 100;
        const xMove = Math.cos(angle) * distance;
        const yMove = Math.sin(angle) * distance;

        // Initial position
        messageEl.style.transform = 'translate(-50%, -50%)';

        // Start animation after a tiny delay
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = `translate(calc(-50% + ${xMove}px), calc(-50% + ${yMove}px))`;
            setTimeout(() => messageEl.remove(), 3000);
        }, 10);
    }

    // Track mouse/touch movement
    let lastParticleTime = 0;
    const particleDelay = 200; // 0.2 second delay

    function handleMove(e) {
        const rect = landingSection.getBoundingClientRect();
        const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        
        const countdownRect = countdownWrapper.getBoundingClientRect();
        const isOverCountdown = (
            x >= countdownRect.left &&
            x <= countdownRect.right &&
            y >= countdownRect.top &&
            y <= countdownRect.bottom
        );
        
        // Only create particles in the landing section, avoiding navbar and countdown
        if (y < rect.top || y > rect.bottom || y < navbarHeight || isOverCountdown) return;
        
        const currentTime = Date.now();
        if (currentTime - lastParticleTime >= particleDelay) {
            const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            createParticles({ clientX: x, clientY: y });
            lastParticleTime = currentTime;
        }
    }

    // Create particles and message
    function createParticles(e) {
        const rect = landingSection.getBoundingClientRect();
        const y = e.clientY;
        const x = e.clientX;
        
        // Only create particles in the landing section, avoiding navbar and countdown
        const countdownRect = countdownWrapper.getBoundingClientRect();
        const isOverCountdown = (
            x >= countdownRect.left &&
            x <= countdownRect.right &&
            y >= countdownRect.top &&
            y <= countdownRect.bottom
        );

        if (y < rect.top || y > rect.bottom || y < navbarHeight || isOverCountdown) return;
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;
        
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(canvas, relativeX, relativeY));
        }
        
        createFloatingMessage(x, y, messages[Math.floor(Math.random() * messages.length)]);
    }

    // Event listeners
    document.addEventListener('click', createParticles);
    document.addEventListener('touchstart', createParticles);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);

    // Start animations
    updateCountdown();
    setInterval(updateCountdown, 1000);
    animate();
});
