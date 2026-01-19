// Statistics Dashboard with Charts
class StatisticsApp {
    constructor() {
        this.problems = [];
        this.codingAttempts = [];
        this.flashcardProgress = [];
        this.hintUsage = [];
        this.currentFilter = 'all';
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadProblems();
        this.loadData();
        this.calculateStats();
        this.displayStats();
        this.initCharts();
        this.setupEventListeners();
    }

    async loadProblems() {
        try {
            const response = await fetch('../problems_data.json');
            const data = await response.json();
            this.problems = data.problems || [];
        } catch (error) {
            console.error('Error loading problems:', error);
        }
    }

    loadData() {
        this.codingAttempts = this.getStorageData('psup_coding_attempts') || [];
        this.flashcardProgress = this.getStorageData('psup_flashcard_progress') || [];
        this.hintUsage = this.getStorageData('psup_hint_usage') || [];
    }

    getStorageData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    calculateStats() {
        const totalAttempts = this.codingAttempts.length + this.flashcardProgress.length;
        
        const codingScores = this.codingAttempts.map(a => a.aiGrade?.totalScore || 0);
        const avgCodingScore = codingScores.length > 0
            ? Math.round(codingScores.reduce((a, b) => a + b, 0) / codingScores.length)
            : 0;
        
        const flashcardMastery = this.flashcardProgress.map(f => f.masteryLevel || 0);
        const avgFlashcardMastery = flashcardMastery.length > 0
            ? Math.round(flashcardMastery.reduce((a, b) => a + b, 0) / flashcardMastery.length)
            : 0;
        
        const overallMastery = Math.round((avgCodingScore + avgFlashcardMastery) / 2);
        
        const codingTime = this.codingAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
        const flashcardTime = this.flashcardProgress.reduce((sum, f) => sum + (f.totalTimeSpent || 0), 0);
        const totalTime = codingTime + flashcardTime;

        // Count hints used from attempts
        const hintsUsed = this.codingAttempts.filter(a => a.hintUsed).length + this.hintUsage.length;
        
        return {
            totalAttempts,
            avgScore: avgCodingScore,
            totalTime,
            mastery: overallMastery,
            hintsUsed,
            coding: {
                attempts: this.codingAttempts.length,
                avgScore: avgCodingScore,
                passed: this.codingAttempts.filter(a => a.aiGrade?.totalScore >= 70).length,
                failed: this.codingAttempts.filter(a => a.aiGrade?.totalScore < 70).length,
                totalTime: codingTime,
                hintsUsed: this.codingAttempts.filter(a => a.hintUsed).length
            },
            flashcard: {
                total: this.flashcardProgress.length,
                know: this.flashcardProgress.filter(f => f.lastResponse === 'know-it').length,
                review: this.flashcardProgress.filter(f => f.lastResponse === 'need-review').length,
                unknown: this.flashcardProgress.filter(f => f.lastResponse === 'dont-know').length,
                totalTime: flashcardTime
            }
        };
    }

    displayStats() {
        const stats = this.calculateStats();
        
        document.getElementById('total-attempts').textContent = stats.totalAttempts;
        document.getElementById('avg-score').textContent = stats.avgScore + '%';
        document.getElementById('total-time').textContent = this.formatTime(stats.totalTime);
        document.getElementById('mastery-level').textContent = stats.mastery + '%';
        document.getElementById('hints-used').textContent = stats.hintsUsed;
        
        document.getElementById('coding-attempts').textContent = stats.coding.attempts;
        document.getElementById('coding-avg').textContent = stats.coding.avgScore + '%';
        document.getElementById('coding-passed').textContent = stats.coding.passed;
        document.getElementById('coding-time').textContent = this.formatTime(stats.coding.totalTime, true);
        document.getElementById('coding-hints').textContent = stats.coding.hintsUsed;
        
        document.getElementById('flashcard-total').textContent = stats.flashcard.total;
        document.getElementById('flashcard-know').textContent = stats.flashcard.know;
        document.getElementById('flashcard-review').textContent = stats.flashcard.review;
        document.getElementById('flashcard-unknown').textContent = stats.flashcard.unknown;
        
        this.displayRecentActivity();
        this.displayWeakAreas();
        this.displayProblemsTable();
        this.displayImprovementCards();
        this.displayExamReadiness();
        this.displayRecentScores();
    }

    initCharts() {
        const stats = this.calculateStats();
        
        // Chart.js default options for dark theme
        Chart.defaults.color = 'rgba(255, 255, 255, 0.5)';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
        
        this.initScorePieChart(stats);
        this.initDifficultyBarChart();
        this.initFlashcardPieChart(stats);
        this.initProgressLineChart();
    }

    initScorePieChart(stats) {
        const ctx = document.getElementById('score-pie-chart');
        if (!ctx) return;
        
        const passed = stats.coding.passed;
        const failed = stats.coding.failed;
        
        this.charts.scorePie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed'],
                datasets: [{
                    data: [passed || 0, failed || 0],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.raw} attempts`
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    initDifficultyBarChart() {
        const ctx = document.getElementById('difficulty-bar-chart');
        if (!ctx) return;
        
        const ranges = [
            { label: 'Easy', min: 1, max: 3 },
            { label: 'Medium', min: 4, max: 6 },
            { label: 'Hard', min: 7, max: 10 }
        ];
        
        const data = ranges.map(range => {
            const rangeAttempts = this.codingAttempts.filter(a => {
                const problem = this.problems.find(p => p.id === a.problemId);
                return problem && problem.difficulty >= range.min && problem.difficulty <= range.max;
            });
            
            return rangeAttempts.length > 0
                ? Math.round(rangeAttempts.reduce((sum, a) => sum + (a.aiGrade?.totalScore || 0), 0) / rangeAttempts.length)
                : 0;
        });
        
        this.charts.difficultyBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ranges.map(r => r.label),
                datasets: [{
                    label: 'Avg Score %',
                    data: data,
                    backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    initFlashcardPieChart(stats) {
        const ctx = document.getElementById('flashcard-pie-chart');
        if (!ctx) return;
        
        this.charts.flashcardPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Know It', 'Need Review', "Don't Know"],
                datasets: [{
                    data: [stats.flashcard.know, stats.flashcard.review, stats.flashcard.unknown],
                    backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.raw} cards`
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    initProgressLineChart(days = 30) {
        const ctx = document.getElementById('progress-line-chart');
        if (!ctx) return;
        
        // Group attempts by date
        const now = Date.now();
        const cutoff = days === 'all' ? 0 : now - (days * 24 * 60 * 60 * 1000);
        
        const filteredAttempts = this.codingAttempts.filter(a => a.timestamp >= cutoff);
        
        // Group by date
        const byDate = {};
        filteredAttempts.forEach(a => {
            const date = new Date(a.timestamp).toLocaleDateString();
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(a.aiGrade?.totalScore || 0);
        });
        
        const labels = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));
        const avgScores = labels.map(date => {
            const scores = byDate[date];
            return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        });
        
        // Calculate running best
        let runningBest = 0;
        const bestScores = labels.map(date => {
            const maxOnDay = Math.max(...byDate[date]);
            runningBest = Math.max(runningBest, maxOnDay);
            return runningBest;
        });
        
        if (this.charts.progressLine) {
            this.charts.progressLine.destroy();
        }
        
        this.charts.progressLine = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : ['No data'],
                datasets: [
                    {
                        label: 'Average Score',
                        data: avgScores.length > 0 ? avgScores : [0],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Best Score',
                        data: bestScores.length > 0 ? bestScores : [0],
                        borderColor: '#22c55e',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.raw}%`
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    displayImprovementCards() {
        const container = document.getElementById('improvement-cards');
        if (!container) return;
        
        // Calculate improvement for each problem
        const improvements = [];
        
        this.problems.forEach(problem => {
            const attempts = this.codingAttempts
                .filter(a => a.problemId === problem.id)
                .sort((a, b) => a.timestamp - b.timestamp);
            
            if (attempts.length >= 2) {
                const firstScore = attempts[0].aiGrade?.totalScore || 0;
                const bestScore = Math.max(...attempts.map(a => a.aiGrade?.totalScore || 0));
                const improvement = bestScore - firstScore;
                
                if (improvement > 0) {
                    improvements.push({
                        problem,
                        firstScore,
                        bestScore,
                        improvement,
                        attempts: attempts.length
                    });
                }
            }
        });
        
        // Sort by improvement descending
        improvements.sort((a, b) => b.improvement - a.improvement);
        const top3 = improvements.slice(0, 3);
        
        if (top3.length === 0) {
            container.innerHTML = '<div class="text-white/30 text-sm col-span-3 text-center py-4">Complete more attempts to see improvement tracking!</div>';
            return;
        }
        
        container.innerHTML = top3.map((item, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
            return `
                <div class="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 hover:bg-white/[0.04] transition-colors cursor-pointer" onclick="app.showProblemDetail('${item.problem.id}')">
                    <div class="flex items-start justify-between mb-2">
                        <span class="text-2xl">${medal}</span>
                        <span class="text-xs text-white/30">${item.attempts} attempts</span>
                    </div>
                    <div class="text-sm font-medium text-white/80 mb-2">${item.problem.title}</div>
                    <div class="flex items-center gap-2">
                        <span class="text-red-400 text-sm">${item.firstScore}%</span>
                        <span class="text-white/30">→</span>
                        <span class="text-green-400 text-sm font-bold">${item.bestScore}%</span>
                        <span class="ml-auto text-green-400 text-xs">+${item.improvement}%</span>
                    </div>
                    <div class="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-red-500 to-green-500" style="width: ${item.bestScore}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatTime(ms, shortFormat = false) {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        
        if (shortFormat) {
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m`;
        }
        
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return '<1m';
    }

    displayRecentActivity() {
        const activityEl = document.getElementById('activity-list');
        
        const activities = [
            ...this.codingAttempts.map(a => ({ type: 'coding', ...a })),
            ...this.flashcardProgress.map(f => ({ type: 'flashcard', ...f }))
        ].sort((a, b) => (b.timestamp || b.lastViewed) - (a.timestamp || a.lastViewed));
        
        const recent = activities.slice(0, 15);
        
        if (recent.length === 0) {
            activityEl.innerHTML = '<div class="empty-state">No activity yet. Start practicing!</div>';
            return;
        }
        
        let html = '';
        
        recent.forEach(item => {
            if (item.type === 'coding') {
                const score = item.aiGrade?.totalScore || 0;
                const scoreClass = score >= 90 ? 'score-good' : score >= 70 ? 'score-ok' : 'score-bad';
                const timeAgo = this.getTimeAgo(item.timestamp);
                const hintBadge = item.hintUsed ? '<span class="ml-2 text-xs text-yellow-400/60">💡</span>' : '';
                const model = item.modelName ? `<span class="text-xs text-white/20 ml-2">${item.modelName}</span>` : '';
                
                html += `
                    <div class="activity-item hover:bg-white/[0.02] cursor-pointer rounded px-2 py-1" onclick="app.showProblemDetail('${item.problemId}')">
                        <div>
                            <div class="activity-title">Coding: ${item.problemTitle}${hintBadge}${model}</div>
                            <div class="activity-meta">${timeAgo}</div>
                        </div>
                        <div class="activity-score ${scoreClass}">${score}%</div>
                    </div>
                `;
            } else {
                const response = item.lastResponse === 'know-it' ? '✓ Know' : 
                               item.lastResponse === 'need-review' ? '⚠ Review' : '✗ Unknown';
                const scoreClass = item.lastResponse === 'know-it' ? 'score-good' : 
                                  item.lastResponse === 'need-review' ? 'score-ok' : 'score-bad';
                const timeAgo = this.getTimeAgo(item.lastViewed);
                
                html += `
                    <div class="activity-item">
                        <div>
                            <div class="activity-title">Flashcard: ${item.problemTitle}</div>
                            <div class="activity-meta">${timeAgo}</div>
                        </div>
                        <div class="activity-score ${scoreClass}">${response}</div>
                    </div>
                `;
            }
        });
        
        activityEl.innerHTML = html;
    }

    getTimeAgo(timestamp) {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    displayWeakAreas() {
        const weakEl = document.getElementById('weak-areas-list');
        const weak = new Map();
        
        this.codingAttempts.forEach(a => {
            if (a.aiGrade && a.aiGrade.totalScore < 70) {
                if (!weak.has(a.problemId)) {
                    weak.set(a.problemId, { title: a.problemTitle, reasons: [], attempts: 0 });
                }
                weak.get(a.problemId).reasons.push(`Score: ${a.aiGrade.totalScore}%`);
                weak.get(a.problemId).attempts++;
            }
        });
        
        this.flashcardProgress.forEach(f => {
            if (f.lastResponse === 'dont-know') {
                if (!weak.has(f.problemId)) {
                    weak.set(f.problemId, { title: f.problemTitle, reasons: [], attempts: 0 });
                }
                weak.get(f.problemId).reasons.push('Flashcard: Don\'t know');
            }
        });
        
        if (weak.size === 0) {
            weakEl.innerHTML = '<div class="empty-state" style="color: #4ade80;">Great job! No weak areas identified.</div>';
            return;
        }
        
        let html = '';
        weak.forEach((data, id) => {
            const latestReason = data.reasons[data.reasons.length - 1];
            html += `
                <div class="weak-area-item hover:bg-white/[0.02] cursor-pointer rounded px-2 py-2" onclick="app.showProblemDetail('${id}')">
                    <div class="weak-area-title">${data.title}</div>
                    <div class="weak-area-reason">${latestReason} • ${data.attempts} attempt(s)</div>
                </div>
            `;
        });
        
        weakEl.innerHTML = html;
    }

    displayProblemsTable() {
        const tableBody = document.getElementById('problems-table-body');
        
        const problemStats = this.problems.map(problem => {
            const attempts = this.codingAttempts
                .filter(a => a.problemId === problem.id)
                .sort((a, b) => a.timestamp - b.timestamp);
            const flashcard = this.flashcardProgress.find(f => f.problemId === problem.id);
            
            const firstScore = attempts.length > 0 ? (attempts[0].aiGrade?.totalScore || 0) : 0;
            const bestScore = attempts.length > 0
                ? Math.max(...attempts.map(a => a.aiGrade?.totalScore || 0))
                : 0;
            const improvement = attempts.length >= 2 ? bestScore - firstScore : 0;
            const hintsUsed = attempts.filter(a => a.hintUsed).length;
            
            const mastery = flashcard ? flashcard.masteryLevel : 0;
            
            return {
                ...problem,
                attempts: attempts.length,
                firstScore,
                bestScore,
                improvement,
                mastery,
                hintsUsed,
                passed: bestScore >= 70
            };
        });
        
        const filtered = problemStats.filter(p => {
            switch (this.currentFilter) {
                case 'attempted': return p.attempts > 0;
                case 'passed': return p.passed;
                case 'failed': return p.attempts > 0 && !p.passed;
                case 'improved': return p.improvement > 0;
                default: return true;
            }
        });
        
        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="empty-state py-4">No problems match this filter</td></tr>';
            return;
        }
        
        let html = '';
        
        filtered.forEach(p => {
            const diffClass = p.difficulty <= 3 ? 'diff-1-3' : p.difficulty <= 6 ? 'diff-4-6' : 'diff-7-10';
            const firstClass = p.firstScore >= 70 ? 'score-ok' : p.firstScore > 0 ? 'score-bad' : 'text-white/20';
            const bestClass = p.bestScore >= 90 ? 'score-good' : p.bestScore >= 70 ? 'score-ok' : p.bestScore > 0 ? 'score-bad' : 'text-white/20';
            const improveClass = p.improvement > 0 ? 'text-green-400' : p.improvement < 0 ? 'text-red-400' : 'text-white/20';
            
            html += `
                <tr class="hover:bg-white/[0.02] cursor-pointer" onclick="app.showProblemDetail('${p.id}')">
                    <td class="text-white/50 py-2 px-2">${p.id}</td>
                    <td class="text-white/70 py-2 px-2">${p.title}</td>
                    <td class="text-center ${diffClass} py-2 px-2">${p.difficulty}</td>
                    <td class="text-center text-white/50 py-2 px-2">${p.attempts || '-'}</td>
                    <td class="text-center ${firstClass} py-2 px-2">${p.firstScore > 0 ? p.firstScore + '%' : '-'}</td>
                    <td class="text-center ${bestClass} py-2 px-2">${p.bestScore > 0 ? p.bestScore + '%' : '-'}</td>
                    <td class="text-center ${improveClass} py-2 px-2">${p.improvement !== 0 ? (p.improvement > 0 ? '+' : '') + p.improvement + '%' : '-'}</td>
                    <td class="text-center text-yellow-400/60 py-2 px-2">${p.hintsUsed > 0 ? '💡' + p.hintsUsed : '-'}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    }

    showProblemDetail(problemId) {
        const problem = this.problems.find(p => p.id === problemId);
        const attempts = this.codingAttempts.filter(a => a.problemId === problemId);
        
        if (!problem) return;
        
        // Could open a modal here - for now just scroll to activity showing this problem
        console.log('Problem detail:', problem, 'Attempts:', attempts);
        
        // Highlight in table
        const rows = document.querySelectorAll('#problems-table-body tr');
        rows.forEach(row => {
            if (row.textContent.includes(problemId)) {
                row.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => row.style.backgroundColor = '', 2000);
            }
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.displayProblemsTable();
            });
        });
        
        document.getElementById('time-range-select')?.addEventListener('change', (e) => {
            const value = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
            this.initProgressLineChart(value);
        });
        
        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('clear-data-btn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
                this.clearAllData();
            }
        });
    }

    exportData() {
        const data = {
            codingAttempts: this.codingAttempts,
            flashcardProgress: this.flashcardProgress,
            hintUsage: this.hintUsage,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `psup-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    displayExamReadiness() {
        // Calculate best score for each attempted problem
        const problemBestScores = new Map();
        
        this.codingAttempts.forEach(a => {
            const score = a.aiGrade?.totalScore || 0;
            const current = problemBestScores.get(a.problemId) || 0;
            problemBestScores.set(a.problemId, Math.max(current, score));
        });
        
        const totalProblems = this.problems.length;
        const attemptedProblems = problemBestScores.size;
        
        // Count problems at different levels
        let above90 = 0, above70 = 0, below70 = 0;
        
        problemBestScores.forEach(score => {
            if (score >= 90) above90++;
            else if (score >= 70) above70++;
            else below70++;
        });
        
        // Readiness = % of problems with best score >= 90
        const readinessScore = totalProblems > 0 
            ? Math.round((above90 / totalProblems) * 100)
            : 0;
        
        // Progress bar = average of all best scores / 90 (target)
        const allBestScores = Array.from(problemBestScores.values());
        const avgBestScore = allBestScores.length > 0
            ? allBestScores.reduce((a, b) => a + b, 0) / allBestScores.length
            : 0;
        const progressPercent = Math.min(100, Math.round((avgBestScore / 90) * 100));
        
        // Update UI
        const readinessEl = document.getElementById('readiness-score');
        const readinessClass = readinessScore >= 80 ? 'text-green-400' : readinessScore >= 50 ? 'text-yellow-400' : 'text-red-400';
        readinessEl.textContent = readinessScore + '%';
        readinessEl.className = `text-3xl font-bold ${readinessClass}`;
        
        document.getElementById('problems-above-90').textContent = above90;
        document.getElementById('problems-above-70').textContent = above70;
        document.getElementById('problems-below-70').textContent = below70 + (totalProblems - attemptedProblems);
        
        document.getElementById('readiness-bar').style.width = progressPercent + '%';
        
        // Message
        let message = 'Keep practicing!';
        if (readinessScore >= 90) message = '🎉 Ready for exam!';
        else if (readinessScore >= 70) message = '💪 Almost there!';
        else if (readinessScore >= 50) message = '📈 Good progress!';
        else if (readinessScore >= 25) message = '🏃 Building momentum...';
        document.getElementById('readiness-message').textContent = message;
        
        // Panel border color
        const panel = document.getElementById('readiness-panel');
        if (readinessScore >= 80) {
            panel.style.borderColor = 'rgba(34, 197, 94, 0.5)';
        } else if (readinessScore >= 50) {
            panel.style.borderColor = 'rgba(234, 179, 8, 0.3)';
        } else {
            panel.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }
    }

    displayRecentScores() {
        // Get last 10 coding attempts
        const recent = this.codingAttempts
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .reverse(); // Oldest to newest for chart
        
        const scores = recent.map(a => a.aiGrade?.totalScore || 0);
        const labels = recent.map((a, i) => `#${i + 1}`);
        
        // Chart
        const ctx = document.getElementById('recent-scores-chart');
        if (ctx && scores.length > 0) {
            if (this.charts.recentScores) {
                this.charts.recentScores.destroy();
            }
            
            this.charts.recentScores = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: scores,
                        backgroundColor: scores.map(s => 
                            s >= 90 ? '#22c55e' : s >= 70 ? '#3b82f6' : s >= 50 ? '#eab308' : '#ef4444'
                        ),
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            max: 100,
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
        
        // Stats
        if (scores.length > 0) {
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            const best = Math.max(...scores);
            
            // Trend: compare first half to second half
            const half = Math.floor(scores.length / 2);
            const firstHalf = scores.slice(0, half);
            const secondHalf = scores.slice(half);
            const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
            const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
            const trendDiff = Math.round(secondAvg - firstAvg);
            
            const avgEl = document.getElementById('last-10-avg');
            avgEl.textContent = avg + '%';
            avgEl.className = `text-lg font-bold ${avg >= 90 ? 'text-green-400' : avg >= 70 ? 'text-blue-400' : 'text-yellow-400'}`;
            
            const trendEl = document.getElementById('last-10-trend');
            if (trendDiff > 0) {
                trendEl.textContent = '↑ +' + trendDiff + '%';
                trendEl.className = 'text-lg font-bold text-green-400';
            } else if (trendDiff < 0) {
                trendEl.textContent = '↓ ' + trendDiff + '%';
                trendEl.className = 'text-lg font-bold text-red-400';
            } else {
                trendEl.textContent = '→ 0%';
                trendEl.className = 'text-lg font-bold text-white/50';
            }
            
            const bestEl = document.getElementById('last-10-best');
            bestEl.textContent = best + '%';
            bestEl.className = `text-lg font-bold ${best >= 90 ? 'text-green-400' : best >= 70 ? 'text-blue-400' : 'text-yellow-400'}`;
        }
    }

    clearAllData() {
        localStorage.removeItem('psup_coding_attempts');
        localStorage.removeItem('psup_flashcard_progress');
        localStorage.removeItem('psup_current_session');
        localStorage.removeItem('psup_flashcard_session');
        localStorage.removeItem('psup_hint_usage');
        
        this.codingAttempts = [];
        this.flashcardProgress = [];
        this.hintUsage = [];
        
        // Destroy and reinit charts
        Object.values(this.charts).forEach(chart => chart?.destroy());
        this.charts = {};
        
        this.displayStats();
        this.initCharts();
        
        alert('All data cleared successfully!');
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new StatisticsApp();
});
