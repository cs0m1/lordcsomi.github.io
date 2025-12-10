// Vision Board Application Logic

const App = {
    state: {
        activeBoard: null,
        completedTodos: JSON.parse(localStorage.getItem('visionBoard_todos')) || {},
        completedRoadmap: JSON.parse(localStorage.getItem('visionBoard_roadmap')) || {}
    },

    // Default pre-completed items (applied if localStorage is empty)
    defaultCompletedTodos: {
        'l2': true,   // Complete Physics self-assessments
        'f1': true,   // Complete first outdoor lead climb
        'li2': true,  // Save money consistently
        'p5': true,   // Contribute to open source
        'fh1': true,  // Hike above 1000m
        'fh2': true,  // Hike above 2000m
        'fh3': true,  // Hike above 3000m
    },

    init() {
        // Apply default completed todos if localStorage is empty (first visit)
        if (Object.keys(this.state.completedTodos).length === 0) {
            this.state.completedTodos = { ...this.defaultCompletedTodos };
            localStorage.setItem('visionBoard_todos', JSON.stringify(this.state.completedTodos));
        }
        
        // Apply dark mode preference from localStorage
        this.applyDarkMode();
        
        this.renderNav();
        this.renderDashboard();
        this.renderFooterStats();
        
        // Highlight the correct nav icon on initial load (Overview)
        this.setActiveBoard(null);
    },

    // --- Dark Mode Logic ---
    
    toggleDarkMode() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('visionBoard_darkMode', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('visionBoard_darkMode', 'dark');
        }
        
        this.updateDarkModeIcon();
    },
    
    applyDarkMode() {
        const saved = localStorage.getItem('visionBoard_darkMode');
        
        // Only apply dark mode if explicitly saved as 'dark'
        // Default to light mode on first visit (no saved preference)
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        this.updateDarkModeIcon();
    },
    
    updateDarkModeIcon() {
        const isDark = document.documentElement.classList.contains('dark');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        
        if (sunIcon && moonIcon) {
            if (isDark) {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }
    },

    // --- Navigation Logic ---

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        const icon = document.getElementById('menu-icon');
        menu.classList.toggle('hidden');
        
        if (menu.classList.contains('hidden')) {
            icon.classList.remove('ph-x');
            icon.classList.add('ph-list');
        } else {
            icon.classList.remove('ph-list');
            icon.classList.add('ph-x');
        }
    },

    setActiveBoard(boardId) {
        this.state.activeBoard = boardId;
        document.getElementById('mobile-menu').classList.add('hidden');
        
        // Update Nav Active State for icon buttons
        document.querySelectorAll('.nav-icon-btn').forEach(btn => {
            const isActive = btn.dataset.id === (boardId || '');
            if (isActive) {
                btn.classList.remove('text-gray-500', 'hover:text-indigo-600', 'hover:bg-indigo-50');
                btn.classList.add('text-indigo-600', 'bg-indigo-100');
            } else {
                btn.classList.remove('text-indigo-600', 'bg-indigo-100');
                btn.classList.add('text-gray-500', 'hover:text-indigo-600', 'hover:bg-indigo-50');
            }
        });

        if (boardId) {
            this.renderBoardDetail(DATA[boardId]);
        } else {
            this.renderDashboard();
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // --- State Logic ---

    toggleTodo(id) {
        if (this.state.completedTodos[id]) {
            delete this.state.completedTodos[id];
        } else {
            this.state.completedTodos[id] = true;
        }
        
        localStorage.setItem('visionBoard_todos', JSON.stringify(this.state.completedTodos));
        
        const el = document.getElementById(`todo-${id}`);
        const icon = el.querySelector('.todo-icon');
        const text = el.querySelector('.todo-text');
        const checkboxColor = DATA[this.state.activeBoard].themeColors.text;

        if (this.state.completedTodos[id]) {
            icon.className = `todo-icon ph-fill ph-check-circle text-xl ${checkboxColor}`;
            text.classList.add('text-gray-400', 'line-through');
            text.classList.remove('text-gray-700');
        } else {
            icon.className = `todo-icon ph ph-circle text-xl text-gray-300 group-hover:text-gray-400`;
            text.classList.remove('text-gray-400', 'line-through');
            text.classList.add('text-gray-700');
        }

        this.updateProgressBar(DATA[this.state.activeBoard]);
    },

    // --- Rendering Logic ---

    renderNav() {
        const desktopNav = document.getElementById('desktop-nav');
        const mobileNav = document.getElementById('mobile-menu');
        
        // Desktop: Icon-only nav with tooltips
        // Use icons from DATA to stay in sync
        let linksHtml = `
            <button data-id="" onclick="app.setActiveBoard(null)" class="nav-icon-btn group relative flex items-center justify-center w-9 h-9 rounded-lg transition-all cursor-pointer text-gray-500 hover:text-indigo-600 hover:bg-indigo-50" title="Overview">
                <i class="ph ph-house text-xl"></i>
                <span class="nav-tooltip absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Overview</span>
            </button>
        `;
        
        let mobileLinksHtml = `
            <button onclick="app.setActiveBoard(null)" class="flex items-center gap-3 w-full text-left py-2 px-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <i class="ph ph-house text-xl"></i>
                Overview
            </button>
        `;

        Object.values(DATA).forEach(board => {
            // Use the same icon from DATA for consistency
            const label = board.title.split(' ')[0];
            
            linksHtml += `
                <button data-id="${board.id}" onclick="app.setActiveBoard('${board.id}')" class="nav-icon-btn group relative flex items-center justify-center w-9 h-9 rounded-lg transition-all cursor-pointer text-gray-500 hover:text-indigo-600 hover:bg-indigo-50" title="${label}">
                    <i class="ph ${board.icon} text-xl"></i>
                    <span class="nav-tooltip absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">${label}</span>
                </button>
            `;
            
            mobileLinksHtml += `
                <button onclick="app.setActiveBoard('${board.id}')" class="flex items-center gap-3 w-full text-left py-2 px-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <i class="ph ${board.icon} text-xl"></i>
                    ${board.title}
                </button>
            `;
        });

        desktopNav.innerHTML = linksHtml;
        mobileNav.innerHTML = mobileLinksHtml;
    },

    renderDashboard() {
        this.state.activeBoard = null;
        const root = document.getElementById('app-root');
        
        const totalGoals = Object.values(DATA).reduce((acc, b) => acc + b.todos.length, 0);
        const completed = Object.keys(this.state.completedTodos).length;

        let panelsHtml = '';
        Object.values(DATA).forEach((board, index) => {
            const completedInBoard = board.todos.filter(t => this.state.completedTodos[t.id]).length;
            const progressPercent = Math.round((completedInBoard / board.todos.length) * 100);
            
            panelsHtml += `
                <div 
                    onclick="app.setActiveBoard('${board.id}')" 
                    class="selector-panel group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ease-out"
                    style="flex: 1; min-height: 500px;"
                    onmouseenter="app.highlightPanel(this)"
                    onmouseleave="app.unhighlightPanels()"
                >
                    <!-- Background Gradient -->
                    <div class="absolute inset-0 bg-gradient-to-b ${board.gradient} transition-opacity duration-500"></div>
                    
                    <!-- Overlay for dimming -->
                    <div class="panel-overlay absolute inset-0 bg-black/40 transition-opacity duration-500"></div>
                    
                    <!-- Glow effect on hover -->
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                         style="box-shadow: inset 0 0 60px rgba(255,255,255,0.2);"></div>
                    
                    <!-- Content -->
                    <div class="relative h-full flex flex-col items-center justify-between p-6 text-white z-10">
                        
                        <!-- Top: Icon -->
                        <div class="flex flex-col items-center pt-8">
                            <div class="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-500">
                                <i class="ph ${board.icon} text-5xl"></i>
                            </div>
                            <span class="text-xs uppercase tracking-widest opacity-60 font-semibold">Area ${index + 1}</span>
                        </div>
                        
                        <!-- Middle: Title & Vision -->
                        <div class="text-center flex-grow flex flex-col justify-center py-8">
                            <h3 class="text-2xl md:text-3xl font-bold mb-3">${board.title.split(' ')[0]}</h3>
                            <p class="text-sm text-white/70 leading-relaxed max-w-[200px] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-0 group-hover:h-auto overflow-hidden">${board.vision}</p>
                        </div>
                        
                        <!-- Bottom: Progress & Action -->
                        <div class="w-full pb-4">
                            <!-- Progress bar -->
                            <div class="w-full bg-white/20 rounded-full h-1.5 mb-4">
                                <div class="bg-white h-1.5 rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                            </div>
                            
                            <!-- Stats -->
                            <div class="flex justify-between text-xs opacity-70 mb-4">
                                <span>${completedInBoard}/${board.todos.length} goals</span>
                                <span>${progressPercent}%</span>
                            </div>
                            
                            <!-- Enter button (visible on hover) -->
                            <div class="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <div class="bg-white/20 backdrop-blur-md rounded-xl py-3 text-center text-sm font-semibold uppercase tracking-wide hover:bg-white/30 transition-colors">
                                    <span>Enter</span>
                                    <i class="ph-bold ph-arrow-right ml-2"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Decorative elements -->
                    <div class="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div class="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </div>
            `;
        });

        root.innerHTML = `
            <div class="fade-in min-h-[calc(100vh-200px)] flex flex-col py-4">
                <!-- Character Selector Panels -->
                <div id="selector-container" class="flex flex-col md:flex-row gap-3 md:gap-4 flex-grow">
                    ${panelsHtml}
                </div>
            </div>
        `;
    },

    highlightPanel(el) {
        const panels = document.querySelectorAll('.selector-panel');
        panels.forEach(panel => {
            if (panel === el) {
                panel.style.flex = '1.5';
                panel.querySelector('.panel-overlay').style.opacity = '0';
            } else {
                panel.style.flex = '0.8';
                panel.querySelector('.panel-overlay').style.opacity = '0.6';
            }
        });
    },

    unhighlightPanels() {
        const panels = document.querySelectorAll('.selector-panel');
        panels.forEach(panel => {
            panel.style.flex = '1';
            panel.querySelector('.panel-overlay').style.opacity = '0.4';
        });
    },

    renderBoardDetail(board) {
        const root = document.getElementById('app-root');
        const tc = board.themeColors;

        // Split todos by type: short-term vs long-term/skills
        const group1 = board.todos.filter(t => t.type === 'short');
        const group2 = board.todos.filter(t => t.type !== 'short');

        const renderTodoList = (items) => {
            return items.map(item => {
                const isDone = this.state.completedTodos[item.id];
                return `
                <div id="todo-${item.id}" onclick="app.toggleTodo('${item.id}')" class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                    <i class="todo-icon text-xl flex-shrink-0 ${isDone ? `ph-fill ph-check-circle ${tc.text}` : 'ph ph-circle text-gray-300 group-hover:text-gray-400'}"></i>
                    <span class="todo-text text-sm leading-tight ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}">${item.text}</span>
                </div>`;
            }).join('');
        };

        // Stats as inline pills/tags
        const statIcons = {
            'Status': 'ph-calendar',
            'Focus': 'ph-target',
            'Goal': 'ph-flag',
            'Climb': 'ph-mountains',
            'Run 10k': 'ph-sneaker-move',
            'Fly': 'ph-parachute',
            'Now': 'ph-map-pin',
            'Next': 'ph-arrow-right',
            'Dream': 'ph-star',
            'Stack': 'ph-stack'
        };
        
        const statsHtml = board.stats.map(s => {
            const icon = statIcons[s.label] || 'ph-info';
            return `<span class="stat-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tc.bg} ${tc.text} text-sm font-medium cursor-default">
                <i class="ph ${icon} text-base"></i>
                ${s.value}
            </span>`;
        }).join('');

        // Hero images for each board type
        const heroImages = {
            learning: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop',
            fitness: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop',
            projects: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=1200&h=400&fit=crop',
            lifestyle: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop'
        };

        root.innerHTML = `
            <div class="pb-20">
                <!-- Hero Image with all header content overlaid -->
                <div class="hero-zoom relative w-full h-64 md:h-72 rounded-2xl overflow-hidden mb-8 scale-in">
                    <img src="${heroImages[board.id]}" alt="${board.title}" class="w-full h-full object-cover brightness-50">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    
                    <!-- Back button at top -->
                    <div class="absolute top-0 left-0 right-0 p-6">
                        <button onclick="app.renderDashboard()" class="flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium group">
                            <i class="ph-bold ph-arrow-left mr-1 group-hover:-translate-x-1 transition-transform"></i> Back to Overview
                        </button>
                    </div>
                    
                    <!-- Title, icon, and vision at bottom -->
                    <div class="absolute bottom-0 left-0 right-0 p-6">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="p-3 rounded-lg ${tc.bg} ${tc.text}">
                                <i class="ph ${board.icon} text-2xl"></i>
                            </div>
                            <h2 class="text-3xl font-bold text-white">${board.title}</h2>
                        </div>
                        <p class="text-xl text-white/90 font-light">${board.vision}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 space-y-8">
                        
                        <!-- Mission section -->
                        <section class="section-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 slide-in-left animate-delay-3">
                            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="ph-bold ph-target ${tc.text}"></i> The Mission
                            </h3>
                            <p class="text-gray-600 leading-relaxed mb-6">${board.explanation}</p>
                            <div class="flex flex-wrap gap-2">${statsHtml}</div>
                        </section>

                        <!-- Action Plan section -->
                        <section class="section-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 slide-in-left animate-delay-4">
                            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="ph-bold ph-check-circle ${tc.text}"></i> Action Plan
                            </h3>
                            
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
                                <div id="progress-bar" class="${tc.iconBg} h-2.5 rounded-full transition-all duration-1000 ease-out" style="width: 0%"></div>
                            </div>

                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Immediate Goals</h4>
                                    <div class="space-y-1">${renderTodoList(group1)}</div>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Long Term / Skills</h4>
                                    <div class="space-y-1">${renderTodoList(group2)}</div>
                                </div>
                            </div>
                        </section>

                        <!-- Quote at bottom of left column -->
                        <div class="p-6 rounded-2xl ${tc.bg} ${tc.border} border-l-4 slide-in-left animate-delay-5">
                            <div class="flex gap-4">
                                <i class="ph-fill ph-quotes text-3xl opacity-20 flex-shrink-0 ${tc.text}"></i>
                                <div>
                                    <p class="italic text-lg font-serif mb-2 text-gray-800">"${board.quote}"</p>
                                    <p class="text-sm font-bold uppercase tracking-wide opacity-60 text-gray-600">— ${board.quoteAuthor}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right sidebar -->
                    <div class="space-y-8">
                        ${this.renderRoadmap(board)}

                        <div class="p-6 rounded-2xl text-white ${tc.btn.split(' ')[0]} slide-in-right animate-delay-4">
                            <div class="flex items-start gap-3">
                                <i class="ph-fill ph-lightbulb text-2xl text-white/60 flex-shrink-0 mt-0.5"></i>
                                <p class="text-white/90 text-base font-medium leading-relaxed italic">"${board.subtitle}"</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.updateProgressBar(board);
    },
    
    updateProgressBar(board) {
        const total = board.todos.length;
        const completed = board.todos.filter(t => this.state.completedTodos[t.id]).length;
        const percentage = Math.round((completed / total) * 100);
        
        const bar = document.getElementById('progress-bar');
        if (bar) bar.style.width = `${percentage}%`;
        
        this.renderFooterStats();
    },

    renderRoadmap(board) {
        if (!board.roadmap || board.roadmap.length === 0) return '';
        
        const tc = board.themeColors;
        const selectedStep = this.state.completedRoadmap[board.id] ?? 0; // Default to first step (index 0)
        
        const stepsHtml = board.roadmap.map((step, index) => {
            const isSelected = index === selectedStep;
            const isFirst = index === 0;
            const isLast = index === board.roadmap.length - 1;
            
            const circleClass = isSelected 
                ? `${tc.iconBg} text-white roadmap-pulse`
                : 'bg-gray-200 text-gray-400 hover:bg-gray-300';
            
            const textClass = isSelected ? 'text-gray-900 font-semibold' : 'text-gray-500';
            const yearClass = isSelected ? tc.text + ' font-bold' : 'text-gray-400';
            
            return `
                <div class="roadmap-step flex items-start gap-4 cursor-pointer" data-index="${index}" onclick="app.handleRoadmapClick('${board.id}', ${index})">
                    <!-- Timeline Column -->
                    <div class="flex flex-col items-center flex-shrink-0">
                        <!-- Circle -->
                        <div class="roadmap-circle w-10 h-10 rounded-full flex items-center justify-center ${circleClass} flex-shrink-0 transition-all duration-300 ${isSelected ? 'ring-4 ring-opacity-30 ' + tc.border.replace('border', 'ring') : ''}">
                            <i class="ph-bold ph-map-pin text-sm"></i>
                        </div>
                        <!-- Line -->
                        ${!isLast ? `<div class="roadmap-line w-0.5 h-16 bg-gray-200"></div>` : ''}
                    </div>
                    
                    <!-- Content Column -->
                    <div class="roadmap-content flex-1 pb-8 ${!isLast ? '' : 'pb-0'} transition-all duration-200 hover:translate-x-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs uppercase tracking-wider ${yearClass}">${step.year}</span>
                            ${isFirst ? `<span class="text-xs px-2 py-0.5 rounded-full ${tc.bg} ${tc.text} font-medium">Current Focus</span>` : ''}
                        </div>
                        <h4 class="text-base ${textClass} transition-colors">${step.milestone}</h4>
                        <p class="text-sm text-gray-400 mt-0.5">${step.detail}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <section class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 slide-in-right animate-delay-3">
                <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <i class="ph-bold ph-path ${tc.text}"></i> The Roadmap
                </h3>
                <p class="text-xs text-gray-400 mb-6">Click to highlight a milestone</p>
                
                <div class="roadmap-container">
                    ${stepsHtml}
                </div>
            </section>
        `;
    },

    handleRoadmapClick(boardId, stepIndex) {
        const board = DATA[boardId];
        const tc = board.themeColors;
        const previousSelected = this.state.completedRoadmap[boardId] ?? 0;
        
        // Update state
        this.state.completedRoadmap[boardId] = stepIndex;
        localStorage.setItem('visionBoard_roadmap', JSON.stringify(this.state.completedRoadmap));
        
        // Update only the affected roadmap steps (no full page reload)
        const steps = document.querySelectorAll('.roadmap-step');
        
        steps.forEach((stepEl, index) => {
            const circle = stepEl.querySelector('.roadmap-circle');
            const content = stepEl.querySelector('.roadmap-content');
            const yearSpan = content.querySelector('span:first-child');
            const titleEl = content.querySelector('h4');
            
            const isSelected = index === stepIndex;
            const isFirst = index === 0;
            
            // Update circle classes
            if (isSelected) {
                circle.className = `roadmap-circle w-10 h-10 rounded-full flex items-center justify-center ${tc.iconBg} text-white roadmap-pulse flex-shrink-0 transition-all duration-300 ring-4 ring-opacity-30 ${tc.border.replace('border', 'ring')}`;
            } else {
                circle.className = `roadmap-circle w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-400 hover:bg-gray-300 flex-shrink-0 transition-all duration-300`;
            }
            
            // Update text classes
            yearSpan.className = `text-xs uppercase tracking-wider ${isSelected ? tc.text + ' font-bold' : 'text-gray-400'}`;
            titleEl.className = `text-base transition-colors ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-500'}`;
        });
    },

    renderFooterStats() {
        const totalGoals = Object.values(DATA).reduce((acc, b) => acc + b.todos.length, 0);
        const completed = Object.keys(this.state.completedTodos).length;
        
        const el = document.getElementById('footer-stats');
        if (el) {
            el.innerHTML = `
                <span>Total Goals: ${totalGoals}</span>
                <span>•</span>
                <span class="text-indigo-600 font-semibold">Completed: ${completed}</span>
                <span>•</span>
                <span>Next Milestone: Jan 2026</span>
            `;
        }
    }
};

// Global reference for onclick events
const app = App;

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => App.init());
