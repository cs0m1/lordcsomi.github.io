// Flashcard Review App Controller
class FlashcardApp {
    constructor() {
        this.engine = new FlashcardEngine();
        this.currentView = 'settings';
        this.isFlipped = false;
        this.currentMode = 'all';
        this.init();
    }

    async init() {
        const allProblems = await this.engine.loadProblems();
        this.engine.problems = allProblems;

        // Update counts and problem list
        this.updateModeCounts();
        this.updateProblemsPreview();

        const savedSession = this.engine.getSavedSession();
        if (savedSession) {
            this.showResumeOption(savedSession);
        }

        this.setupEventListeners();
    }

    updateModeCounts() {
        const counts = this.engine.getModeCounts();
        
        document.getElementById('count-all').textContent = counts.all;
        document.getElementById('count-review').textContent = counts.needReview;
        document.getElementById('count-unknown').textContent = counts.dontKnow;
        document.getElementById('count-weak').textContent = counts.weak;
    }

    updateProblemsPreview() {
        const previewEl = document.getElementById('problems-preview');
        if (!previewEl) return;

        const problems = this.engine.getProblemsForMode(this.currentMode);
        
        if (problems.length === 0) {
            previewEl.innerHTML = `
                <div class="text-center text-white/30 py-4">
                    No problems in this category yet.
                    ${this.currentMode !== 'all' ? '<br><span class="text-xs">All problems will be used instead.</span>' : ''}
                </div>
            `;
            return;
        }

        let html = '';
        problems.forEach(p => {
            const diffColor = p.difficulty <= 3 ? 'text-green-400' : p.difficulty <= 6 ? 'text-yellow-400' : 'text-red-400';
            html += `
                <div class="flex items-center justify-between py-2 px-3 rounded bg-white/[0.02] border border-white/[0.03]">
                    <span class="text-xs text-white/60">${p.title}</span>
                    <span class="text-xs ${diffColor}">${p.difficulty}/10</span>
                </div>
            `;
        });
        
        previewEl.innerHTML = html;
    }

    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('input[name="review-mode"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.currentMode = e.target.value;
                this.updateProblemsPreview();
            });
        });

        document.getElementById('start-review')?.addEventListener('click', () => {
            this.startReview();
        });

        document.getElementById('resume-btn')?.addEventListener('click', () => {
            const savedSession = this.engine.getSavedSession();
            if (savedSession) {
                this.engine.resumeSession(savedSession);
                this.showView('flashcard');
                this.updateCardDisplay();
            }
        });

        document.getElementById('clear-session-btn')?.addEventListener('click', () => {
            this.engine.clearSession();
            document.getElementById('resume-section')?.classList.add('hidden');
        });

        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.engine.saveSession();
            this.showView('settings');
            this.updateModeCounts();
            this.updateProblemsPreview();
            // Re-check for saved session and show resume option
            const savedSession = this.engine.getSavedSession();
            if (savedSession) {
                this.showResumeOption(savedSession);
            }
        });

        // Save session when clicking Home link
        document.querySelectorAll('a[href*="countdown"]').forEach(link => {
            link.addEventListener('click', () => {
                if (this.engine.sessionData && this.engine.cards.length > 0 && this.engine.currentIndex < this.engine.cards.length) {
                    this.engine.saveSession();
                }
            });
        });

        // Save session when leaving page
        window.addEventListener('beforeunload', () => {
            if (this.engine.sessionData && this.engine.cards.length > 0 && this.engine.currentIndex < this.engine.cards.length) {
                this.engine.saveSession();
            }
        });

        document.getElementById('flashcard')?.addEventListener('click', () => {
            this.flipCard();
        });

        document.getElementById('know-it')?.addEventListener('click', () => {
            this.recordResponse('know-it');
        });

        document.getElementById('need-review')?.addEventListener('click', () => {
            this.recordResponse('need-review');
        });

        document.getElementById('dont-know')?.addEventListener('click', () => {
            this.recordResponse('dont-know');
        });
    }

    showResumeOption(savedSession) {
        const resumeSection = document.getElementById('resume-section');
        const resumeInfo = document.getElementById('resume-info');
        
        if (resumeSection && resumeInfo) {
            const cardCount = savedSession.cards.length;
            const currentIndex = savedSession.currentIndex + 1;
            const elapsed = Date.now() - savedSession.startTime;
            const minutes = Math.floor(elapsed / 60000);
            
            // Get current problem name
            const currentProblemId = savedSession.cards[savedSession.currentIndex];
            const currentProblem = this.engine.problems.find(p => p.id === currentProblemId);
            const problemName = currentProblem ? currentProblem.title : `Card ${currentIndex}`;
            
            resumeInfo.textContent = `${problemName} • Card ${currentIndex}/${cardCount} • ${minutes} minutes ago`;
            resumeSection.classList.remove('hidden');
        }
    }

    startReview() {
        const settings = {
            front: {
                title: document.getElementById('show-title')?.checked ?? true,
                description: document.getElementById('show-description-front')?.checked ?? true,
                id: document.getElementById('show-id')?.checked ?? true,
                difficulty: document.getElementById('show-difficulty')?.checked ?? true,
                source: document.getElementById('show-source')?.checked ?? true
            },
            back: {
                hint: document.getElementById('show-hint')?.checked ?? true,
                algorithm: document.getElementById('show-algorithm')?.checked ?? true,
                complexity: document.getElementById('show-complexity')?.checked ?? true,
                solution: document.getElementById('show-solution')?.checked ?? true
            }
        };

        this.engine.updateSettings(settings);

        const mode = document.querySelector('input[name="review-mode"]:checked')?.value || 'all';
        const shuffle = document.getElementById('shuffle-cards')?.checked ?? true;

        const selected = this.engine.selectCards(mode, { shuffle });

        if (selected.length === 0) {
            alert('No cards available. Using all problems instead.');
        }

        this.engine.startSession(selected);
        this.showView('flashcard');
        this.updateCardDisplay();
        lucide.createIcons();
    }

    showView(viewName) {
        document.getElementById('settings-view').style.display = 'none';
        document.getElementById('flashcard-view').style.display = 'none';
        document.getElementById('results-view').style.display = 'none';
        
        document.getElementById(`${viewName}-view`).style.display = 'block';
        this.currentView = viewName;
    }

    updateCardDisplay() {
        const card = this.engine.currentCard;
        if (!card) return;

        // Update progress display
        const progressDisplay = document.getElementById('progress-display');
        if (progressDisplay) {
            progressDisplay.textContent = `${this.engine.currentIndex + 1}/${this.engine.cards.length}`;
        }

        // Generate card content
        const frontContent = this.engine.generateFrontContent(card);
        const backContent = this.engine.generateBackContent(card);

        document.getElementById('front-content').innerHTML = frontContent;
        document.getElementById('back-content').innerHTML = backContent;

        // Reset flip state
        this.isFlipped = false;
        document.getElementById('flashcard').classList.remove('flipped');

        // Update session stats
        this.updateSessionStats();
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        const flashcard = document.getElementById('flashcard');
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
    }

    recordResponse(response) {
        this.engine.recordResponse(response);
        
        const hasNext = this.engine.nextCard();
        
        if (hasNext) {
            this.updateCardDisplay();
        } else {
            this.showResults();
        }
    }

    updateSessionStats() {
        const results = this.engine.getSessionResults();
        
        document.getElementById('stat-know-header').textContent = results.know;
        document.getElementById('stat-review-header').textContent = results.review;
        document.getElementById('stat-unknown-header').textContent = results.unknown;
        document.getElementById('stat-mastery-header').textContent = results.mastery + '%';
    }

    showResults() {
        this.engine.clearSession();
        
        const results = this.engine.getSessionResults();
        
        this.showView('results');
        
        document.getElementById('summary-mastery').textContent = results.mastery + '%';
        document.getElementById('results-know').textContent = results.know;
        document.getElementById('results-review').textContent = results.review;
        document.getElementById('results-unknown').textContent = results.unknown;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FlashcardApp();
});
