// Main Application Controller
class CodingTestApp {
    constructor() {
        this.engine = new TestEngine();
        this.grader = new AIGrader();
        this.currentView = 'selection';
        this.selectedProblemId = null;
        this.init();
    }

    async init() {
        // Load problems
        const allProblems = await this.engine.loadProblems();
        this.engine.problems = allProblems;
        this.populateProblemList();

        // Check for saved session
        const savedSession = this.engine.getSavedSession();
        if (savedSession) {
            this.showResumeOption(savedSession);
        }

        // Check for API key - prompt on first visit
        if (!this.grader.hasApiKey()) {
            setTimeout(() => this.grader.promptForApiKey(), 500);
        }
        this.updateApiStatus();

        // Set up event listeners
        this.setupEventListeners();
    }

    updateApiStatus() {
        const statusEl = document.getElementById('api-status');
        if (statusEl) {
            if (this.grader.hasApiKey()) {
                statusEl.textContent = 'API Key ✓';
                statusEl.parentElement.classList.add('text-green-400/70');
            } else {
                statusEl.textContent = 'No API Key';
            }
        }
    }

    populateProblemList() {
        const list = document.getElementById('problem-list');
        if (!list) return;

        list.innerHTML = '';
        this.engine.problems.forEach(problem => {
            const diffClass = problem.difficulty <= 3 ? 'text-green-400' : 
                             problem.difficulty <= 6 ? 'text-yellow-400' : 'text-red-400';
            
            list.innerHTML += `
                <label class="problem-option">
                    <input type="radio" name="problem-choice" value="${problem.id}">
                    <span class="problem-label">
                        <span class="text-white/70">${problem.title}</span>
                        <span class="${diffClass} text-xs">${problem.difficulty}/10</span>
                    </span>
                </label>
            `;
        });
    }

    setupEventListeners() {
        // Mode selection - show problem selector when "Choose" is selected
        document.querySelectorAll('input[name="test-mode"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const selector = document.getElementById('problem-selector');
                if (selector) {
                    selector.classList.toggle('hidden', e.target.value !== 'choose');
                }
            });
        });

        // API settings button
        document.getElementById('api-settings-btn')?.addEventListener('click', async () => {
            await this.grader.promptForApiKey();
            this.updateApiStatus();
            lucide.createIcons();
        });

        // Start test
        document.getElementById('start-test')?.addEventListener('click', () => {
            this.startPractice();
        });

        // Resume session
        document.getElementById('resume-btn')?.addEventListener('click', () => {
            const savedSession = this.engine.getSavedSession();
            if (savedSession) {
                this.engine.resumeSession(savedSession);
                this.showView('coding');
                this.updateProblemDisplay();
            }
        });

        // Clear session
        document.getElementById('clear-session-btn')?.addEventListener('click', () => {
            this.engine.clearSession();
            document.getElementById('resume-section')?.classList.add('hidden');
        });

        // Back to selection
        document.getElementById('back-to-selection')?.addEventListener('click', () => {
            this.engine.saveSession();
            this.showView('selection');
        });

        // Submit code
        document.getElementById('submit-code')?.addEventListener('click', () => {
            this.submitCode();
        });

        // Clear code
        document.getElementById('clear-code')?.addEventListener('click', () => {
            if (confirm('Clear your code?')) {
                document.getElementById('code-editor').value = '';
            }
        });

        // Show hint
        document.getElementById('show-hint')?.addEventListener('click', () => {
            const hintContent = document.getElementById('hint-content');
            if (hintContent) {
                hintContent.classList.toggle('hidden');
                // Track hint usage
                if (!hintContent.classList.contains('hidden')) {
                    if (this.engine.sessionData) {
                        this.engine.sessionData.hintUsed = true;
                    }
                }
            }
        });

        // Next problem
        document.getElementById('next-problem')?.addEventListener('click', () => {
            this.nextProblem();
        });

        // Retry problem
        document.getElementById('retry-problem')?.addEventListener('click', () => {
            document.getElementById('feedback-section')?.classList.add('hidden');
            document.getElementById('solution-section')?.classList.add('hidden');
            document.getElementById('code-editor').value = '';
            document.getElementById('code-editor').focus();
        });

        // Show solution
        document.getElementById('show-solution')?.addEventListener('click', () => {
            this.showSolution();
        });

        // Auto-save code
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor) {
            let saveTimeout;
            codeEditor.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                document.getElementById('autosave-status').textContent = 'Saving...';
                saveTimeout = setTimeout(() => {
                    if (this.engine.sessionData) {
                        this.engine.sessionData.currentCode = codeEditor.value;
                        this.engine.saveSession();
                    }
                    document.getElementById('autosave-status').textContent = 'Auto-saved';
                }, 1000);
            });
        }
    }

    showResumeOption(savedSession) {
        const resumeSection = document.getElementById('resume-section');
        const resumeInfo = document.getElementById('resume-info');
        
        if (resumeSection && resumeInfo) {
            const elapsed = Date.now() - savedSession.startTime;
            const minutes = Math.floor(elapsed / 60000);
            
            resumeInfo.textContent = `${savedSession.problemTitle || 'Problem'} • ${minutes} minutes ago`;
            resumeSection.classList.remove('hidden');
        }
    }

    startPractice() {
        const mode = document.querySelector('input[name="test-mode"]:checked')?.value || 'random';
        
        let problem;
        
        if (mode === 'choose') {
            const selectedId = document.querySelector('input[name="problem-choice"]:checked')?.value;
            if (!selectedId) {
                alert('Please select a problem first.');
                return;
            }
            problem = this.engine.problems.find(p => p.id === selectedId);
        } else if (mode === 'random') {
            const randomIndex = Math.floor(Math.random() * this.engine.problems.length);
            problem = this.engine.problems[randomIndex];
        } else if (mode === 'sequential') {
            // Get first unattempted or least attempted
            problem = this.engine.problems[0];
        } else if (mode === 'weak') {
            // Get weak area problem (placeholder - use first for now)
            problem = this.engine.problems[0];
        }

        if (!problem) {
            alert('No problem available.');
            return;
        }

        this.engine.startSession([problem]);
        this.showView('coding');
        this.updateProblemDisplay();
    }

    showView(viewName) {
        document.getElementById('selection-view').style.display = 'none';
        document.getElementById('coding-view').style.display = 'none';
        
        document.getElementById(`${viewName}-view`).style.display = 'block';
        this.currentView = viewName;
    }

    updateProblemDisplay() {
        const problem = this.engine.currentProblem;
        if (!problem) return;

        // Update problem details
        document.getElementById('problem-title').textContent = problem.title;
        document.getElementById('problem-id').textContent = `ID: ${problem.id}`;
        document.getElementById('problem-difficulty').textContent = `Difficulty: ${problem.difficulty}/10`;
        document.getElementById('problem-description').textContent = problem.description;
        
        // Set hint
        const hintContent = document.getElementById('hint-content');
        if (hintContent) {
            hintContent.textContent = problem.hint;
            hintContent.classList.add('hidden');
        }

        // Clear previous state
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor) {
            codeEditor.value = this.engine.sessionData?.currentCode || '';
        }
        
        document.getElementById('feedback-section')?.classList.add('hidden');
        document.getElementById('solution-section')?.classList.add('hidden');
    }

    async submitCode() {
        const codeEditor = document.getElementById('code-editor');
        const code = codeEditor?.value.trim();

        if (!code) {
            alert('Please write some code before submitting.');
            return;
        }

        // Show loading
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay?.classList.remove('hidden');

        try {
            const problem = this.engine.currentProblem;
            const grade = await this.grader.gradeCode(problem, code);
            
            // Save attempt
            this.saveAttempt(problem, code, grade);
            
            this.showGradingResult(grade);
        } catch (error) {
            console.error('Grading error:', error);
            alert('Error grading code. Please try again.');
        } finally {
            loadingOverlay?.classList.add('hidden');
        }
    }

    saveAttempt(problem, code, grade) {
        const attempts = JSON.parse(localStorage.getItem('psup_coding_attempts') || '[]');
        attempts.push({
            problemId: problem.id,
            problemTitle: problem.title,
            code,
            aiGrade: grade,
            model: this.grader.getModel(),
            modelName: this.grader.getModelName(),
            hintUsed: this.engine.sessionData?.hintUsed || false,
            timestamp: Date.now(),
            timeSpent: this.engine.sessionData?.startTime ? Date.now() - this.engine.sessionData.startTime : 0
        });
        localStorage.setItem('psup_coding_attempts', JSON.stringify(attempts));
    }

    getScoreColor(score, max) {
        const percent = (score / max) * 100;
        if (percent >= 90) return 'text-green-400';
        if (percent >= 70) return 'text-blue-400';
        if (percent >= 50) return 'text-yellow-400';
        return 'text-red-400';
    }

    showGradingResult(grade) {
        const feedbackSection = document.getElementById('feedback-section');
        const gradeScore = document.getElementById('grade-score');
        const feedbackContent = document.getElementById('feedback-content');

        // Set score with color (using /100 scale)
        const score = grade.totalScore;
        const scoreColor = this.getScoreColor(score, 100);
        gradeScore.innerHTML = `<span class="${scoreColor}">${score}/100</span>`;

        // Get breakdown values with colors
        const correctness = grade.breakdown.correctness;
        const syntax = grade.breakdown.syntaxQuality;
        const efficiency = grade.breakdown.efficiency;

        const correctnessColor = this.getScoreColor(correctness, 40);
        const syntaxColor = this.getScoreColor(syntax, 40);
        const efficiencyColor = this.getScoreColor(efficiency, 20);

        // Build feedback HTML (using /100 scale: 40+40+20)
        let html = `
            <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="text-center">
                    <div class="text-lg font-bold ${correctnessColor}">${correctness}/40</div>
                    <div class="text-xs text-white/40">Correctness</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold ${syntaxColor}">${syntax}/40</div>
                    <div class="text-xs text-white/40">Syntax</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold ${efficiencyColor}">${efficiency}/20</div>
                    <div class="text-xs text-white/40">Efficiency</div>
                </div>
            </div>
            <p class="mb-4">${grade.feedback}</p>
        `;

        if (grade.syntaxErrors?.length > 0) {
            html += `
                <div class="mb-4">
                    <div class="text-xs font-bold text-red-400/70 mb-2">SYNTAX ISSUES</div>
                    <ul class="text-xs text-white/50 space-y-1">
                        ${grade.syntaxErrors.map(e => `<li>• ${e}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (grade.suggestions?.length > 0) {
            html += `
                <div>
                    <div class="text-xs font-bold text-yellow-400/70 mb-2">SUGGESTIONS</div>
                    <ul class="text-xs text-white/50 space-y-1">
                        ${grade.suggestions.map(s => `<li>• ${s}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        feedbackContent.innerHTML = html;
        feedbackSection?.classList.remove('hidden');
        feedbackSection?.scrollIntoView({ behavior: 'smooth' });
    }

    showSolution() {
        const problem = this.engine.currentProblem;
        if (!problem) return;

        const solutionSection = document.getElementById('solution-section');
        const solutionCode = document.getElementById('solution-code');
        const solutionComplexity = document.getElementById('solution-complexity');

        solutionCode.textContent = problem.solution.code;
        solutionComplexity.textContent = `Time: ${problem.solution.time_complexity} | Space: ${problem.solution.space_complexity}`;

        solutionSection?.classList.remove('hidden');
        solutionSection?.scrollIntoView({ behavior: 'smooth' });
    }

    nextProblem() {
        // Get a random new problem different from the current one
        const currentId = this.engine.currentProblem?.id;
        
        // Use allProblems (the full list) instead of problems (current session)
        const allProblems = this.engine.allProblems;
        
        // Make sure problems are loaded
        if (!allProblems || allProblems.length === 0) {
            console.error('No problems loaded');
            alert('Error: Problems not loaded. Please refresh the page.');
            return;
        }
        
        // If only 1 problem, allow repeating it
        if (allProblems.length === 1) {
            const nextProblem = allProblems[0];
            this.engine.startSession([nextProblem]);
            this.updateProblemDisplay();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        // Filter out current problem and pick a random one from ALL problems
        const otherProblems = allProblems.filter(p => p.id !== currentId);
        const randomIndex = Math.floor(Math.random() * otherProblems.length);
        const nextProblem = otherProblems[randomIndex];

        // Clear the current code for new session
        this.engine.sessionData = null;
        this.engine.startSession([nextProblem]);
        this.updateProblemDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CodingTestApp();
});
