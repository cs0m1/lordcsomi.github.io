// Flashcard Engine - Manages flashcard review sessions
class FlashcardEngine {
    constructor() {
        this.problems = [];
        this.cards = [];
        this.currentIndex = 0;
        this.currentCard = null;
        this.sessionData = null;
        this.responses = [];
        // ALL settings ON by default
        this.settings = {
            front: {
                title: true,
                description: true,
                id: true,
                difficulty: true,
                source: true
            },
            back: {
                hint: true,
                algorithm: true,
                complexity: true,
                solution: true
            }
        };
    }

    async loadProblems() {
        try {
            const response = await fetch('../problems_data.json');
            const data = await response.json();
            return data.problems || [];
        } catch (error) {
            console.error('Error loading problems:', error);
            return [];
        }
    }

    updateSettings(settings) {
        this.settings = settings;
    }

    // Get counts for each mode
    getModeCounts() {
        const progressData = this.getStorageData('psup_flashcard_progress') || [];
        const codingAttempts = this.getStorageData('psup_coding_attempts') || [];
        
        const needReviewIds = progressData
            .filter(r => r.lastResponse === 'need-review')
            .map(r => r.problemId);
        
        const dontKnowIds = progressData
            .filter(r => r.lastResponse === 'dont-know')
            .map(r => r.problemId);
        
        const weakIds = new Set([
            ...codingAttempts
                .filter(a => a.aiGrade && a.aiGrade.totalScore < 70)
                .map(a => a.problemId),
            ...dontKnowIds
        ]);

        return {
            all: this.problems.length,
            needReview: this.problems.filter(p => needReviewIds.includes(p.id)).length,
            dontKnow: this.problems.filter(p => dontKnowIds.includes(p.id)).length,
            weak: this.problems.filter(p => weakIds.has(p.id)).length
        };
    }

    // Get problem list for a mode
    getProblemsForMode(mode) {
        const progressData = this.getStorageData('psup_flashcard_progress') || [];
        const codingAttempts = this.getStorageData('psup_coding_attempts') || [];
        
        switch (mode) {
            case 'all':
                return this.problems;
                
            case 'need-review':
                const reviewIds = progressData
                    .filter(r => r.lastResponse === 'need-review')
                    .map(r => r.problemId);
                return this.problems.filter(p => reviewIds.includes(p.id));
                
            case 'dont-know':
                const unknownIds = progressData
                    .filter(r => r.lastResponse === 'dont-know')
                    .map(r => r.problemId);
                return this.problems.filter(p => unknownIds.includes(p.id));
                
            case 'weak':
                const weakIds = new Set([
                    ...codingAttempts
                        .filter(a => a.aiGrade && a.aiGrade.totalScore < 70)
                        .map(a => a.problemId),
                    ...progressData
                        .filter(r => r.lastResponse === 'dont-know')
                        .map(r => r.problemId)
                ]);
                return this.problems.filter(p => weakIds.has(p.id));
                
            default:
                return this.problems;
        }
    }

    selectCards(mode, options = {}) {
        let selected = this.getProblemsForMode(mode);

        // If no problems in the filter, fall back to all
        if (selected.length === 0) {
            selected = [...this.problems];
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

    startSession(selectedCards) {
        this.cards = selectedCards;
        this.currentIndex = 0;
        this.responses = [];
        
        this.sessionData = {
            cards: selectedCards.map(c => c.id),
            startTime: Date.now(),
            lastCardTime: Date.now(),
            currentIndex: 0,
            responses: [],
            settings: this.settings
        };
        
        this.loadCard(0);
    }

    resumeSession(savedSession) {
        this.sessionData = savedSession;
        this.currentIndex = savedSession.currentIndex;
        this.responses = savedSession.responses || [];
        this.settings = savedSession.settings || this.settings;
        
        // Load cards by IDs
        this.cards = savedSession.cards.map(id => 
            this.problems.find(p => p.id === id)
        ).filter(c => c);
        
        this.loadCard(this.currentIndex);
    }

    loadCard(index) {
        if (index >= this.cards.length) {
            return null;
        }

        this.currentIndex = index;
        this.currentCard = this.cards[index];
        
        return this.currentCard;
    }

    generateFrontContent(card) {
        let html = '';

        if (this.settings.front.title) {
            html += `<h2>${card.title}</h2>`;
        }

        if (this.settings.front.description) {
            html += `
                <div class="card-section">
                    <div class="section-title">DESCRIPTION</div>
                    <div class="section-content">${card.description}</div>
                </div>
            `;
        }

        let metaHtml = '';
        if (this.settings.front.id) {
            metaHtml += `<span class="text-white/40">ID: ${card.id}</span>`;
        }
        if (this.settings.front.difficulty) {
            const diffColor = card.difficulty <= 3 ? 'text-green-400' : card.difficulty <= 6 ? 'text-yellow-400' : 'text-red-400';
            metaHtml += `<span class="${diffColor}">Difficulty: ${card.difficulty}/10</span>`;
        }
        if (this.settings.front.source && card.source) {
            metaHtml += `<span class="text-white/40">Page ${card.source.page} • Slide ${card.source.slide}</span>`;
        }

        if (metaHtml) {
            html += `<div class="flex flex-wrap gap-4 justify-center mt-4 text-xs">${metaHtml}</div>`;
        }

        return html;
    }

    generateBackContent(card) {
        let html = '';

        if (this.settings.back.hint) {
            html += `
                <div class="card-section">
                    <div class="section-title">HINT</div>
                    <div class="section-content">${card.hint}</div>
                </div>
            `;
        }

        if (this.settings.back.algorithm) {
            const steps = card.algorithm.steps.map((step, i) => 
                `${i + 1}. ${step}`
            ).join('<br>');
            
            html += `
                <div class="card-section">
                    <div class="section-title">ALGORITHM</div>
                    <div class="section-content">
                        <strong>${card.algorithm.description}</strong><br><br>
                        ${steps}
                    </div>
                </div>
            `;
        }

        if (this.settings.back.complexity) {
            html += `
                <div class="card-section">
                    <div class="section-title">COMPLEXITY</div>
                    <div class="section-content">
                        <strong>Time:</strong> ${card.solution.time_complexity}<br>
                        <strong>Space:</strong> ${card.solution.space_complexity}
                    </div>
                </div>
            `;
        }

        if (this.settings.back.solution) {
            html += `
                <div class="card-section">
                    <div class="section-title">SOLUTION</div>
                    <pre>${this.escapeHtml(card.solution.code)}</pre>
                </div>
            `;
        }

        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    recordResponse(response) {
        const responseData = {
            problemId: this.currentCard.id,
            problemTitle: this.currentCard.title,
            response: response, // 'know-it', 'need-review', 'dont-know'
            timestamp: Date.now(),
            viewCount: this.getViewCount(this.currentCard.id) + 1
        };

        this.responses.push(responseData);
        this.saveProgress(responseData);
    }

    getViewCount(problemId) {
        const progress = this.getStorageData('psup_flashcard_progress') || [];
        const existing = progress.find(p => p.problemId === problemId);
        return existing ? existing.viewCount : 0;
    }

    saveProgress(responseData) {
        let progress = this.getStorageData('psup_flashcard_progress') || [];
        
        // Calculate time spent on this card
        const timeSpent = this.sessionData?.lastCardTime 
            ? Date.now() - this.sessionData.lastCardTime 
            : 30000; // Default 30 seconds if unknown
        
        // Update or add
        const existingIndex = progress.findIndex(p => p.problemId === responseData.problemId);
        
        if (existingIndex >= 0) {
            progress[existingIndex] = {
                ...progress[existingIndex],
                lastResponse: responseData.response,
                lastViewed: responseData.timestamp,
                viewCount: responseData.viewCount,
                masteryLevel: this.calculateMastery(progress[existingIndex], responseData.response),
                totalTimeSpent: (progress[existingIndex].totalTimeSpent || 0) + timeSpent
            };
        } else {
            progress.push({
                problemId: responseData.problemId,
                problemTitle: responseData.problemTitle,
                lastResponse: responseData.response,
                lastViewed: responseData.timestamp,
                viewCount: 1,
                masteryLevel: this.calculateMastery(null, responseData.response),
                totalTimeSpent: timeSpent
            });
        }

        localStorage.setItem('psup_flashcard_progress', JSON.stringify(progress));
        
        // Update last card time for next card
        if (this.sessionData) {
            this.sessionData.lastCardTime = Date.now();
        }
    }

    calculateMastery(existing, newResponse) {
        let mastery = existing ? existing.masteryLevel : 0;
        
        switch (newResponse) {
            case 'know-it':
                mastery = Math.min(100, mastery + 25);
                break;
            case 'need-review':
                mastery = Math.max(0, mastery + 10);
                break;
            case 'dont-know':
                mastery = Math.max(0, mastery - 15);
                break;
        }

        return mastery;
    }

    nextCard() {
        const nextIndex = this.currentIndex + 1;
        return this.loadCard(nextIndex);
    }

    getSessionResults() {
        const knowCount = this.responses.filter(r => r.response === 'know-it').length;
        const reviewCount = this.responses.filter(r => r.response === 'need-review').length;
        const unknownCount = this.responses.filter(r => r.response === 'dont-know').length;
        
        // Calculate overall mastery
        const total = this.responses.length || 1;
        const mastery = Math.round(((knowCount * 100) + (reviewCount * 50)) / total);
        
        return {
            total: this.responses.length,
            know: knowCount,
            review: reviewCount,
            unknown: unknownCount,
            mastery: mastery || 0
        };
    }

    saveSession() {
        if (!this.sessionData) return;
        
        this.sessionData.currentIndex = this.currentIndex;
        this.sessionData.responses = this.responses;
        
        localStorage.setItem('psup_flashcard_session', JSON.stringify(this.sessionData));
    }

    getSavedSession() {
        return this.getStorageData('psup_flashcard_session');
    }

    clearSession() {
        localStorage.removeItem('psup_flashcard_session');
        this.sessionData = null;
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
}
