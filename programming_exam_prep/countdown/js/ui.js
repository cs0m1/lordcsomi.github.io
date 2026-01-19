// --- UI LOGIC ---
function calculateTimeLeft(target) {
    const diff = target - new Date();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60)
    };
}

// Get practice stats from localStorage
function getPracticeStats() {
    try {
        const codingAttempts = JSON.parse(localStorage.getItem('psup_coding_attempts') || '[]');
        const flashcardProgress = JSON.parse(localStorage.getItem('psup_flashcard_progress') || '[]');
        
        if (codingAttempts.length === 0 && flashcardProgress.length === 0) return null;

        // Coding stats
        const codingScores = codingAttempts.map(a => a.aiGrade?.totalScore || 0);
        const avgCodingScore = codingScores.length > 0
            ? Math.round(codingScores.reduce((a, b) => a + b, 0) / codingScores.length)
            : 0;
        const codingPassed = codingAttempts.filter(a => a.aiGrade?.totalScore >= 70).length;

        // Flashcard stats
        const flashcardKnow = flashcardProgress.filter(f => f.lastResponse === 'know-it').length;
        const flashcardReview = flashcardProgress.filter(f => f.lastResponse === 'need-review').length;
        const flashcardUnknown = flashcardProgress.filter(f => f.lastResponse === 'dont-know').length;

        return {
            coding: {
                attempts: codingAttempts.length,
                avgScore: avgCodingScore,
                passed: codingPassed
            },
            flashcard: {
                total: flashcardProgress.length,
                know: flashcardKnow,
                review: flashcardReview,
                unknown: flashcardUnknown
            }
        };
    } catch (e) {
        return null;
    }
}

let currentHeroId = null;

function updateUI() {
    const now = new Date();
    const exam = PROGRAMMING_EXAM;
    const stats = getPracticeStats();

    const main = document.getElementById('main-content');

    if (exam.date <= now) {
        if (currentHeroId !== 'DONE') {
            main.innerHTML = `
                <div class="text-center fade-in">
                    <h1 class="text-5xl md:text-6xl font-black text-white italic tracking-tighter">EXAM TIME</h1>
                    <p class="mt-4 text-white/20 tracking-[0.5em] uppercase text-[10px]">Good luck!</p>
                </div>
            `;
            currentHeroId = 'DONE';
        }
        return;
    }

    if (currentHeroId !== exam.id) {
        main.innerHTML = `
            <div class="fade-in flex flex-col h-full">
                <!-- Top Content -->
                <div class="flex-grow flex flex-col justify-center">
                    <!-- Exam Title - Left Aligned -->
                    <div class="space-y-1 mb-12">
                        <h1 class="text-3xl md:text-4xl font-bold text-white">Basic Programming Exam</h1>
                        <div class="text-sm text-white/40">
                            ${exam.date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})} • ${exam.location}
                        </div>
                    </div>
                    
                    <!-- TIMER -->
                    <div class="grid grid-cols-4 gap-6 md:gap-12">
                        <div class="flex flex-col items-center">
                            <span id="timer-days" class="text-5xl md:text-7xl lg:text-8xl font-light text-white tabular-nums tracking-tighter">00</span>
                            <span class="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mt-2">Days</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span id="timer-hours" class="text-5xl md:text-7xl lg:text-8xl font-light text-white tabular-nums tracking-tighter">00</span>
                            <span class="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mt-2">Hours</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span id="timer-mins" class="text-5xl md:text-7xl lg:text-8xl font-light text-white tabular-nums tracking-tighter">00</span>
                            <span class="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mt-2">Mins</span>
                        </div>
                        <div class="flex flex-col items-center">
                            <span id="timer-secs" class="text-5xl md:text-7xl lg:text-8xl font-light text-white tabular-nums tracking-tighter">00</span>
                            <span class="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 mt-2">Secs</span>
                        </div>
                    </div>
                </div>

                <!-- Bottom Action Bar -->
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 border-t border-white/5 mt-auto">
                    <!-- Practice Buttons (Left) -->
                    <div class="flex items-center gap-3">
                        <a href="../coding_test/index.html" class="inline-flex items-center gap-3 glass-card glass-card-hover px-5 py-2.5 rounded-lg group">
                            <i data-lucide="code" class="text-blue-400 group-hover:text-blue-300 transition-colors" width="16"></i>
                            <span class="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Coding</span>
                        </a>
                        <a href="../flashcards/index.html" class="inline-flex items-center gap-3 glass-card glass-card-hover px-5 py-2.5 rounded-lg group">
                            <i data-lucide="layers" class="text-green-400 group-hover:text-green-300 transition-colors" width="16"></i>
                            <span class="text-sm font-bold text-white group-hover:text-green-400 transition-colors">Flashcards</span>
                        </a>
                        <a href="../statistics/index.html" class="inline-flex items-center gap-3 glass-card glass-card-hover px-5 py-2.5 rounded-lg group">
                            <i data-lucide="bar-chart-2" class="text-purple-400 group-hover:text-purple-300 transition-colors" width="16"></i>
                            <span class="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Stats</span>
                        </a>
                    </div>

                    <!-- Stats (Right) -->
                    <div class="flex items-center gap-4 text-xs text-white/40">
                        <span><strong class="text-white/50">${exam.totalProblems}</strong> problems</span>
                        ${stats ? `
                        <span class="text-white/20">•</span>
                        <span>Coding: <strong class="${stats.coding.avgScore >= 80 ? 'text-green-400/70' : stats.coding.avgScore >= 60 ? 'text-blue-400/70' : 'text-yellow-400/70'}">${stats.coding.avgScore}%</strong> avg</span>
                        <span class="text-white/20">•</span>
                        <span>Cards: <strong class="text-white/50">${stats.flashcard.know}</strong> known</span>
                        ` : `
                        <span class="text-white/20">•</span>
                        <span class="text-white/30">No practice yet</span>
                        `}
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        currentHeroId = exam.id;
    }

    const tl = calculateTimeLeft(exam.date);
    updateTimerValue('timer-days', tl.days);
    updateTimerValue('timer-hours', tl.hours);
    updateTimerValue('timer-mins', tl.mins);
    updateTimerValue('timer-secs', tl.secs);
}

function updateTimerValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val.toString().padStart(2, '0');
}

// Initialize and start
initFluid();
animateFluid();
updateUI();
setInterval(updateUI, 1000);
