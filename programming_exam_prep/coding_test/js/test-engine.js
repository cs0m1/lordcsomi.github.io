// Test Engine - Manages problems, timing, and auto-save
class TestEngine {
    constructor() {
        this.allProblems = []; // Full list of all problems
        this.problems = [];     // Current session problems
        this.currentIndex = 0;
        this.currentProblem = null;
        this.startTime = null;
        this.problemStartTime = null;
        this.results = [];
        this.sessionData = null;
        this.autoSaveInterval = null;
        this.timerInterval = null;
        this.grader = new AIGrader();
    }

    async loadProblems() {
        try {
            const response = await fetch('../problems_data.json');
            const data = await response.json();
            const problems = data.problems || [];
            this.allProblems = problems; // Store full list
            return problems;
        } catch (error) {
            console.error('Error loading problems:', error);
            return [];
        }
    }

    selectProblems(mode, options = {}) {
        let selected = [];
        
        switch (mode) {
            case 'all':
                selected = [...this.problems];
                break;
                
            case 'range':
                const from = parseInt(options.from) || 1;
                const to = parseInt(options.to) || 40;
                selected = this.problems.filter(p => {
                    const num = parseInt(p.id.split('_')[1]);
                    return num >= from && num <= to;
                });
                break;
                
            case 'weak':
                // Load from AI suggestions or failed attempts
                const attempts = this.getStorageData('psup_coding_attempts') || [];
                const failedIds = attempts
                    .filter(a => a.aiGrade && a.aiGrade.totalScore < 70)
                    .map(a => a.problemId);
                selected = this.problems.filter(p => failedIds.includes(p.id));
                
                // If no failed attempts, use all problems
                if (selected.length === 0) {
                    selected = [...this.problems];
                }
                break;
        }

        // Shuffle if requested
        if (options.shuffle) {
            selected = this.shuffleArray(selected);
        }

        return selected;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startSession(selectedProblems) {
        this.problems = selectedProblems;
        this.currentIndex = 0;
        this.startTime = Date.now();
        this.results = [];
        
        this.sessionData = {
            problems: selectedProblems.map(p => p.id),
            startTime: this.startTime,
            currentIndex: 0,
            results: [],
            currentCode: ''
        };
        
        this.loadProblem(0);
        this.startAutoSave();
    }

    resumeSession(savedSession) {
        this.sessionData = savedSession;
        this.startTime = savedSession.startTime;
        this.currentIndex = savedSession.currentIndex;
        this.results = savedSession.results || [];
        
        // Load problems by IDs
        this.problems = savedSession.problems.map(id => 
            this.problems.find(p => p.id === id)
        ).filter(p => p);
        
        this.loadProblem(this.currentIndex);
        this.startAutoSave();
    }

    loadProblem(index) {
        if (index >= this.problems.length) {
            this.endSession();
            return false;
        }

        this.currentIndex = index;
        this.currentProblem = this.problems[index];
        this.problemStartTime = Date.now();
        this.startTimer();
        
        return this.currentProblem;
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.problemStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timerEl = document.getElementById('timer');
            if (timerEl) {
                timerEl.textContent = 
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveSession();
        }, 30000);
    }

    saveSession() {
        if (!this.sessionData) return;
        
        const codeInput = document.getElementById('code-input');
        if (codeInput) {
            this.sessionData.currentCode = codeInput.value;
        }
        
        this.sessionData.currentIndex = this.currentIndex;
        this.sessionData.results = this.results;
        
        localStorage.setItem('psup_current_session', JSON.stringify(this.sessionData));
        
        // Update autosave status
        const statusEl = document.getElementById('autosave-status');
        if (statusEl) {
            statusEl.textContent = '● AUTO-SAVED';
            setTimeout(() => {
                statusEl.textContent = '● AUTO-SAVE: ENABLED';
            }, 2000);
        }
    }

    getSavedSession() {
        return this.getStorageData('psup_current_session');
    }

    clearSession() {
        localStorage.removeItem('psup_current_session');
        this.sessionData = null;
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }

    async submitCode(code) {
        this.stopTimer();
        const timeSpent = Date.now() - this.problemStartTime;
        
        // Show grading in progress
        return new Promise(async (resolve) => {
            const grade = await this.grader.gradeCode(this.currentProblem, code);
            
            const result = {
                problemId: this.currentProblem.id,
                problemTitle: this.currentProblem.title,
                userCode: code,
                aiGrade: grade,
                timeSpent: timeSpent,
                timestamp: Date.now()
            };
            
            this.results.push(result);
            this.saveAttempt(result);
            
            resolve(grade);
        });
    }

    skipProblem() {
        const result = {
            problemId: this.currentProblem.id,
            problemTitle: this.currentProblem.title,
            userCode: '',
            aiGrade: {
                totalScore: 0,
                breakdown: { correctness: 0, syntaxQuality: 0, efficiency: 0 },
                feedback: 'Problem skipped',
                passes: false
            },
            timeSpent: Date.now() - this.problemStartTime,
            timestamp: Date.now(),
            skipped: true
        };
        
        this.results.push(result);
        this.nextProblem();
    }

    nextProblem() {
        const nextIndex = this.currentIndex + 1;
        const problem = this.loadProblem(nextIndex);
        
        if (!problem) {
            return false;
        }
        
        // Clear code input
        const codeInput = document.getElementById('code-input');
        if (codeInput) {
            codeInput.value = this.sessionData?.currentCode || '';
        }
        
        return true;
    }

    endSession() {
        this.stopTimer();
        this.clearSession();
        
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        return this.getSessionResults();
    }

    getSessionResults() {
        const totalTime = Date.now() - this.startTime;
        const scores = this.results.map(r => r.aiGrade?.totalScore || 0);
        const avgScore = scores.length > 0 
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
        
        const passed = this.results.filter(r => r.aiGrade?.totalScore >= 70).length;
        const failed = this.results.length - passed;
        
        return {
            totalProblems: this.results.length,
            avgScore,
            passed,
            failed,
            totalTime,
            results: this.results
        };
    }

    saveAttempt(result) {
        const attempts = this.getStorageData('psup_coding_attempts') || [];
        attempts.push(result);
        localStorage.setItem('psup_coding_attempts', JSON.stringify(attempts));
    }

    getStorageData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading storage data:', e);
            return null;
        }
    }

    pauseSession() {
        this.stopTimer();
        this.saveSession();
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}
