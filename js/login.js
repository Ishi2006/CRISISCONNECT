/**
 * CrisisConnect Login Logic
 * Handles background animation, demo access, and authentication.
 */

/* ─── Animated World-Grid Background ─── */
(function() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.1,
            isCritical: Math.random() < 0.12
        });
    }

    const LAT_LINES  = 10;
    const LNG_LINES  = 16;
    let frame = 0;

    function draw() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const W = canvas.width, H = canvas.height;

        // Latitude lines
        for (let i = 0; i <= LAT_LINES; i++) {
            const y = (i / LAT_LINES) * H;
            const isMajor = i === 0 || i === Math.floor(LAT_LINES / 2) || i === LAT_LINES;
            ctx.beginPath();
            ctx.strokeStyle = isMajor ? 'rgba(255, 85, 0, 0.12)' : 'rgba(43, 27, 16, 0.5)';
            ctx.lineWidth = isMajor ? 0.8 : 0.4;
            for (let x = 0; x <= W; x += 4) {
                const bend = Math.sin((x / W) * Math.PI) * 6 * (i / LAT_LINES - 0.5);
                if (x === 0) ctx.moveTo(x, y + bend);
                else ctx.lineTo(x, y + bend);
            }
            ctx.stroke();
        }

        // Longitude lines
        for (let j = 0; j <= LNG_LINES; j++) {
            const x = (j / LNG_LINES) * W;
            const isMajor = j === 0 || j === Math.floor(LNG_LINES / 2) || j === LNG_LINES;
            ctx.beginPath();
            ctx.strokeStyle = isMajor ? 'rgba(255, 85, 0, 0.12)' : 'rgba(43, 27, 16, 0.5)';
            ctx.lineWidth = isMajor ? 0.8 : 0.4;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }

        // Hotspots
        const hotspots = [
            { rx: 0.53, ry: 0.42 }, { rx: 0.80, ry: 0.55 }, { rx: 0.18, ry: 0.48 },
            { rx: 0.55, ry: 0.72 }, { rx: 0.84, ry: 0.43 }
        ];

        hotspots.forEach((h, idx) => {
            const hx = h.rx * W, hy = h.ry * H;
            const pulse = (Math.sin(frame * 0.03 + idx * 1.2) + 1) / 2;
            ctx.beginPath();
            ctx.arc(hx, hy, 8 + pulse * 14, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 59, 59, ${0.5 - pulse * 0.35})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(hx, hy, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ff3b3b';
            ctx.fill();
        });

        // Particles
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.isCritical ? `rgba(255, 59, 59, ${p.alpha})` : `rgba(255, 85, 0, ${p.alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

/* ─── UI Interactions ─── */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('btn-login');
    const emailInput = document.getElementById('email-input');
    const pwInput = document.getElementById('pw-input');
    const pwToggle = document.getElementById('pw-toggle');
    const eyeIcon = document.getElementById('eye-icon');
    const rememberInput = document.getElementById('remember-input');

    const EYE_SHOW = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    const EYE_HIDE = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';

    // Clock
    function updateClock() {
        const d = new Date();
        const p = n => n.toString().padStart(2, '0');
        const clockEl = document.getElementById('timestamp');
        if (clockEl) {
            clockEl.textContent = `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Incident Counter
    let inc = 7;
    setInterval(() => {
        const incidentEl = document.getElementById('active-incidents');
        if (incidentEl && Math.random() < 0.3) {
            inc = Math.max(5, Math.min(12, inc + (Math.random() < 0.5 ? 1 : -1)));
            incidentEl.textContent = inc + ' ACTIVE INCIDENTS';
        }
    }, 4000);

    // Password Toggle
    if (pwToggle) {
        pwToggle.addEventListener('click', () => {
            const isText = pwInput.type === 'text';
            pwInput.type = isText ? 'password' : 'text';
            eyeIcon.innerHTML = isText ? EYE_SHOW : EYE_HIDE;
        });
    }

    // Demo Access
    const demoBtn = document.getElementById('btn-demo');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            emailInput.value = 'demo@crisisconnect.io';
            pwInput.value = 'crisis2024';
            [emailInput, pwInput].forEach(el => {
                el.style.borderColor = 'var(--amber)';
                el.style.boxShadow = '0 0 0 2px rgba(255,179,64,0.2)';
                setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 800);
            });
            hideError();
        });
    }

    // Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = pwInput.value;
            const remember = rememberInput.checked;

            if (!email || !password) {
                showError('AUTHENTICATION FAILED — All fields are required.');
                return;
            }

            loginBtn.disabled = true;
            loginBtn.classList.add('loading');
            hideError();

            try {
                let success = false;
                let token = null;

                // Attempt API call
                try {
                    const res = await fetch('/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                        signal: AbortSignal.timeout(3000)
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        token = data.token;
                        success = true;
                    }
                } catch (fetchErr) {
                    console.warn("Network error or timeout - falling back to demo mode if applicable.");
                }

                // Global Fallback for Demo Credentials (Useful for static previews or offline mode)
                if (!success && email === 'demo@crisisconnect.io' && password === 'crisis2024') {
                    token = 'demo-jwt-' + Date.now();
                    success = true;
                    console.log("Demo credentials authenticated via client-side fallback.");
                }

                if (success && token) {
                    const storage = remember ? localStorage : sessionStorage;
                    storage.setItem('cc_token', token);
                    storage.setItem('cc_user', email);
                    showSuccess();
                    setTimeout(() => window.location.href = 'index.html', 1400);
                } else {
                    showError('AUTHENTICATION FAILED — Invalid credentials. Try DEMO ACCESS.');
                }
            } catch (err) {
                showError('SYSTEM ERROR — Unable to reach security gateway.');
            } finally {
                loginBtn.disabled = false;
                loginBtn.classList.remove('loading');
            }
        });
    }
});

function showError(msg) {
    const banner = document.getElementById('error-banner');
    const msgEl = document.getElementById('error-msg');
    if (banner && msgEl) {
        msgEl.textContent = msg;
        banner.classList.add('show');
        const successBanner = document.getElementById('success-banner');
        if (successBanner) successBanner.classList.remove('show');
    }
}

function hideError() {
    const banner = document.getElementById('error-banner');
    if (banner) banner.classList.remove('show');
}

function showSuccess() {
    const banner = document.getElementById('success-banner');
    if (banner) {
        banner.classList.add('show');
        hideError();
    }
}
