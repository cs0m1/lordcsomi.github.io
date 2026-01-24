// --- FLUID PHYSICS ENGINE ---
const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000, active: false };
let flowAngle = Math.PI * 0.25; // Initial Global direction
let globalFlowVx = 0;
let globalFlowVy = 0;

class Particle {
    constructor() {
        this.friction = 0.96; 
        this.size = Math.random() * 80 + 40;
        
        // Color palette
        const colors = [
            'rgba(30, 64, 175, 0.8)',  // Deep Blue
            'rgba(59, 130, 246, 0.6)', // Bright Blue
            'rgba(99, 102, 241, 0.5)', // Indigo
            'rgba(147, 51, 234, 0.4)', // Purple
            'rgba(79, 70, 229, 0.6)'   // Violet
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.reset(true); 
    }

    reset(initial = false) {
        const margin = 200; // Spawn well outside visible area
        
        if (initial) {
            this.x = Math.random() * (canvas.width + margin * 2) - margin;
            this.y = Math.random() * (canvas.height + margin * 2) - margin;
        } else {
            // Smart Respawn: Spawn "Upstream" relative to current global flow
            const vx = Math.cos(flowAngle);
            const vy = Math.sin(flowAngle);

            let side = 0; // 0:Top, 1:Right, 2:Bottom, 3:Left
            const fromLeft = vx > 0;
            const fromTop = vy > 0;

            if (Math.random() > 0.5) {
                side = fromLeft ? 3 : 1; 
            } else {
                side = fromTop ? 0 : 2;
            }

            if (side === 0) { // Spawn Top
                this.x = Math.random() * canvas.width;
                this.y = -margin;
            } else if (side === 1) { // Spawn Right
                this.x = canvas.width + margin;
                this.y = Math.random() * canvas.height;
            } else if (side === 2) { // Spawn Bottom
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + margin;
            } else { // Spawn Left
                this.x = -margin;
                this.y = Math.random() * canvas.height;
            }
        }

        this.vx = 0;
        this.vy = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        // 1. Use Global Flow Vector (calculated in animateFluid)
        this.vx += (globalFlowVx - this.vx) * 0.05;
        this.vy += (globalFlowVy - this.vy) * 0.05;

        // 2. Mouse Disturbance (Weaker)
        if (mouse.active) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 250;

            if (distance < forceRadius) {
                const force = (forceRadius - distance) / forceRadius;
                this.vx -= dx * force * 0.005; 
                this.vy -= dy * force * 0.005;
            }
        }

        // 3. Move
        this.x += this.vx;
        this.y += this.vy;
        
        this.vx *= this.friction;
        this.vy *= this.friction;

        // 4. Boundary Check
        const margin = 250;
        if (this.x > canvas.width + margin || 
            this.x < -margin || 
            this.y > canvas.height + margin || 
            this.y < -margin) {
            this.reset(false);
        }
    }
}

function initFluid() {
    resize();
    for (let i = 0; i < 45; i++) {
        particles.push(new Particle());
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function animateFluid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const now = new Date();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();
    
    // Progress through the minute (0.0 to 1.0)
    const cycleProgress = (s + ms/1000) / 60;
    
    // Speed Curve
    const currentSpeed = 2.0 + (Math.pow(cycleProgress, 3) * 6.0);

    // Slowly rotate flow angle
    flowAngle += 0.0005; 
    
    // Calculate global vector once per frame
    globalFlowVx = Math.cos(flowAngle) * currentSpeed;
    globalFlowVy = Math.sin(flowAngle) * currentSpeed;

    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateFluid);
}

// Event listeners
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
});

window.addEventListener('touchstart', e => {
    mouse.active = true;
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

window.addEventListener('touchend', () => mouse.active = false);
window.addEventListener('resize', resize);