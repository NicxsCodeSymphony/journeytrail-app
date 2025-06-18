<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JourneyTrail v0.0.1 Release</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --card-bg: rgba(255, 255, 255, 0.1);
            --card-border: rgba(255, 255, 255, 0.2);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
            --accent-gradient: linear-gradient(45deg, #ff6b6b, #ffa726);
            --success-color: #4ecdc4;
            --shadow-light: 0 10px 25px rgba(0, 0, 0, 0.2);
            --shadow-heavy: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: var(--primary-gradient);
            min-height: 100vh;
            padding: 20px;
            overflow-x: hidden;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            position: relative;
        }

        /* Header Styles */
        .header {
            text-align: center;
            margin-bottom: 40px;
            animation: fadeInDown 1s ease-out;
        }

        .version-badge {
            display: inline-block;
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid var(--card-border);
            border-radius: 50px;
            padding: 12px 24px;
            margin-bottom: 20px;
            color: var(--text-primary);
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
        }

        .version-badge:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-light);
            color: var(--text-primary);
        }

        .app-title {
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 10px;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            background: linear-gradient(45deg, #fff, #f0f0f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: 1.2rem;
            color: var(--text-secondary);
            margin-bottom: 30px;
        }

        /* Stats Section */
        .stats-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }

        .stat-card {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            color: var(--success-color);
            display: block;
            margin-bottom: 5px;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Release Card */
        .release-card {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 40px;
            margin: 30px 0;
            animation: fadeInUp 1s ease-out;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .release-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
            animation: shimmer 2s infinite;
        }

        .release-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-heavy);
        }

        .section-title {
            font-size: 1.8rem;
            color: var(--text-primary);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .icon {
            width: 30px;
            height: 30px;
            background: var(--accent-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            animation: pulse 2s infinite;
        }

        /* Changes Grid */
        .changes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-top: 30px;
        }

        .change-item {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
        }

        .change-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .change-item:hover::before {
            transform: scaleX(1);
        }

        .change-item:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-3px);
            box-shadow: var(--shadow-light);
            color: inherit;
            text-decoration: none;
        }

        .change-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 10px;
        }

        .change-description {
            color: var(--text-secondary);
            line-height: 1.6;
        }

        /* Contributor Section */
        .contributor-section {
            margin-top: 40px;
        }

        .contributor-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            border: 1px solid var(--card-border);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            text-decoration: none;
            color: inherit;
        }

        .contributor-card:hover {
            transform: scale(1.02);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            color: inherit;
            text-decoration: none;
        }

        .contributor-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--primary-gradient);
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: var(--text-primary);
            font-weight: bold;
            animation: float 3s ease-in-out infinite;
        }

        .contributor-name {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 10px;
        }

        .contributor-role {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
        }

        .github-link {
            display: inline-block;
            background: var(--card-bg);
            color: var(--text-primary);
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 50px;
            border: 1px solid var(--card-border);
            transition: all 0.3s ease;
            font-weight: 600;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .github-link:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: var(--shadow-light);
            color: var(--text-primary);
            text-decoration: none;
        }

        /* Floating Elements */
        .floating-elements {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }

        .floating-circle {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            animation: float-random 20s infinite linear;
        }

        /* Animations */
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        @keyframes shimmer {
            0% {
                left: -100%;
            }
            100% {
                left: 100%;
            }
        }

        @keyframes float-random {
            0% {
                transform: translateY(100vh) rotate(0deg);
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            body {
                padding: 15px;
            }
            
            .release-card {
                padding: 25px;
            }
            
            .changes-grid {
                grid-template-columns: 1fr;
            }
            
            .stats-section {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 480px) {
            .stats-section {
                grid-template-columns: 1fr;
            }
            
            .section-title {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <!-- Floating Background Elements -->
    <div class="floating-elements">
        <div class="floating-circle" style="width: 60px; height: 60px; left: 10%; animation-delay: 0s;"></div>
        <div class="floating-circle" style="width: 40px; height: 40px; left: 80%; animation-delay: 5s;"></div>
        <div class="floating-circle" style="width: 80px; height: 80px; left: 50%; animation-delay: 10s;"></div>
        <div class="floating-circle" style="width: 30px; height: 30px; left: 20%; animation-delay: 15s;"></div>
    </div>

    <div class="container">
        <!-- Header Section -->
        <header class="header">
            <a href="https://github.com/NicxsCodeSymphony/journeytrail-commuter-app/releases/tag/v.0.0.1" 
               class="version-badge" 
               target="_blank" 
               rel="noopener noreferrer">
                Version 0.0.1 • Initial Release
            </a>
            <h1 class="app-title">JourneyTrail</h1>
            <p class="subtitle">Your Ultimate Commuter Companion</p>
        </header>

        <!-- Statistics Section -->
        <section class="stats-section">
            <div class="stat-card">
                <span class="stat-number" data-target="1">0</span>
                <span class="stat-label">Release</span>
            </div>
            <div class="stat-card">
                <span class="stat-number" data-target="1">0</span>
                <span class="stat-label">Contributor</span>
            </div>
            <div class="stat-card">
                <span class="stat-number" data-target="1">0</span>
                <span class="stat-label">Pull Request</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">∞</span>
                <span class="stat-label">Possibilities</span>
            </div>
        </section>

        <!-- What's New Section -->
        <main class="release-card">
            <div class="section-title">
                <div class="icon">🚀</div>
                <h2>What's New in v0.0.1</h2>
            </div>
            
            <div class="changes-grid">
                <a href="https://github.com/NicxsCodeSymphony/journeytrail-commuter-app/pull/1" 
                   class="change-item" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <div class="change-title">🎯 Initial Master Branch</div>
                    <div class="change-description">
                        The foundation has been laid! The master branch represents the core architecture and initial codebase for JourneyTrail, setting the stage for an amazing commuter experience.
                    </div>
                </a>
                
                <a href="https://github.com/NicxsCodeSymphony/journeytrail-commuter-app/commits/v.0.0.1" 
                   class="change-item" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <div class="change-title">📱 App Infrastructure</div>
                    <div class="change-description">
                        Core application structure implemented with modern development practices, ensuring scalability and maintainability for future features.
                    </div>
                </a>
                
                <a href="https://github.com/NicxsCodeSymphony/journeytrail-commuter-app" 
                   class="change-item" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <div class="change-title">🛣️ Journey Begins</div>
                    <div class="change-description">
                        The first milestone in creating the ultimate commuter app experience. This release marks the beginning of revolutionizing daily commutes.
                    </div>
                </a>
            </div>
        </main>

        <!-- Contributors Section -->
        <section class="release-card">
            <div class="section-title">
                <div class="icon">👥</div>
                <h2>New Contributors</h2>
            </div>
            
            <div class="contributor-section">
                <a href="https://github.com/NicxsCodeSymphony" 
                   class="contributor-card" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <div class="contributor-avatar">N</div>
                    <div class="contributor-name">@NicxsCodeSymphony</div>
                    <div class="contributor-role">Founding Developer • First Contribution</div>
                </a>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <a href="https://github.com/NicxsCodeSymphony/journeytrail-commuter-app/commits/v.0.0.1" 
               class="github-link" 
               target="_blank" 
               rel="noopener noreferrer">
                📚 View Full Changelog
            </a>
        </footer>
    </div>

    <script>
        // Utility Functions
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Animate Statistics
        function animateStats() {
            const statNumbers = document.querySelectorAll('.stat-number[data-target]');
            
            statNumbers.forEach((stat, index) => {
                const target = parseInt(stat.dataset.target);
                let count = 0;
                const increment = target / 20;
                
                setTimeout(() => {
                    const timer = setInterval(() => {
                        count += increment;
                        if (count >= target) {
                            stat.textContent = target;
                            clearInterval(timer);
                        } else {
                            stat.textContent = Math.floor(count);
                        }
                    }, 50);
                }, index * 200);
            });
        }

        // Add Click Effects
        function addClickEffects() {
            const interactiveElements = document.querySelectorAll('.change-item, .contributor-card, .version-badge, .github-link');
            
            interactiveElements.forEach(element => {
                element.addEventListener('click', function(e) {
                    // Create ripple effect
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        pointer-events: none;
                        z-index: 1000;
                    `;
                    
                    // Add ripple animation
                    if (!document.querySelector('#ripple-style')) {
                        const style = document.createElement('style');
                        style.id = 'ripple-style';
                        style.textContent = `
                            @keyframes ripple {
                                to {
                                    transform: scale(2);
                                    opacity: 0;
                                }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    
                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(ripple);
                    
                    // Clean up
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                    
                    // Scale effect
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });
        }

        // Parallax Effect for Floating Elements
        function initParallax() {
            const circles = document.querySelectorAll('.floating-circle');
            
            const handleMouseMove = debounce(function(e) {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                
                circles.forEach((circle, index) => {
                    const speed = (index + 1) * 0.5;
                    const xMove = (x - 0.5) * speed * 20;
                    const yMove = (y - 0.5) * speed * 20;
                    
                    circle.style.transform = `translateX(${xMove}px) translateY(${yMove}px)`;
                });
            }, 16); // ~60fps
            
            document.addEventListener('mousemove', handleMouseMove);
        }

        // Intersection Observer for Animation Triggers
        function initScrollAnimations() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);
            
            // Observe elements that should animate on scroll
            document.querySelectorAll('.stat-card, .change-item').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        }

        // Keyboard Navigation Support
        function initKeyboardNavigation() {
            const focusableElements = document.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            
            focusableElements.forEach(element => {
                element.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        if (this.href) {
                            window.open(this.href, '_blank', 'noopener,noreferrer');
                        } else {
                            this.click();
                        }
                    }
                });
            });
        }

        // Performance Monitoring
        function logPerformance() {
            if ('performance' in window) {
                window.addEventListener('load', () => {
                    const loadTime = performance.now();
                    console.log(`JourneyTrail Release Page loaded in ${loadTime.toFixed(2)}ms`);
                });
            }
        }

        // Initialize Everything
        document.addEventListener('DOMContentLoaded', function() {
            // Start animations and interactions
            setTimeout(animateStats, 1000);
            addClickEffects();
            initParallax();
            initScrollAnimations();
            initKeyboardNavigation();
            logPerformance();
            
            // Add loaded class for additional styling
            document.body.classList.add('loaded');
            
            console.log('🚀 JourneyTrail Release Page initialized successfully!');
        });

        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            // Recalculate any size-dependent elements
            const circles = document.querySelectorAll('.floating-circle');
            circles.forEach(circle => {
                circle.style.transform = '';
            });
        }, 250));

        // Error handling
        window.addEventListener('error', (e) => {
            console.warn('JourneyTrail Release Page Error:', e.error);
        });
    </script>
</body>
</html>
