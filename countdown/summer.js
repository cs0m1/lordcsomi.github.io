document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.querySelector('.todo-list');
    const bingoBoard = document.querySelector('.bingo-board');

    // Cookie management functions
    function setCookie(name, value, days = 365) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    function getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    }

    // Todo list functionality
    function initTodoList() {
        const savedTodos = getCookie('summerTodos');
        if (savedTodos) {
            const completedTodos = savedTodos.split(',');
            const checkboxes = todoList.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                if (completedTodos.includes(checkbox.id)) {
                    checkbox.checked = true;
                }
            });
        }

        todoList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                saveTodoState();
            }
        });
    }

    function saveTodoState() {
        const completedTodos = [];
        const checkboxes = todoList.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                completedTodos.push(checkbox.id);
            }
        });

        setCookie('summerTodos', completedTodos.join(','));
    }

    // Confetti animation
    function triggerConfetti() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 1000
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    // Bingo board functionality
    function initBingoBoard() {
        const savedBingo = getCookie('summerBingo');
        if (savedBingo) {
            const completedBingo = savedBingo.split(',');
            const bingoItems = bingoBoard.querySelectorAll('.bingo-item');
            
            bingoItems.forEach(item => {
                if (completedBingo.includes(item.dataset.id)) {
                    item.classList.add('completed');
                }
            });
        }

        bingoBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('bingo-item') && !e.target.classList.contains('free-space')) {
                e.target.classList.toggle('completed');
                saveBingoState();
                checkBingoWin();
            }
        });
    }

    function saveBingoState() {
        const completedBingo = [];
        const bingoItems = bingoBoard.querySelectorAll('.bingo-item');
        
        bingoItems.forEach(item => {
            if (item.classList.contains('completed')) {
                completedBingo.push(item.dataset.id);
            }
        });

        setCookie('summerBingo', completedBingo.join(','));
    }

    function checkBingoWin() {
        const bingoItems = Array.from(bingoBoard.querySelectorAll('.bingo-item'));
        const completed = bingoItems.filter(item => item.classList.contains('completed'));
        const size = 5;
        
        let hasWin = false;
        
        // Convert to 2D array for easier checking
        const grid = [];
        for (let i = 0; i < size; i++) {
            grid.push([]);
            for (let j = 0; j < size; j++) {
                const item = bingoItems[i * size + j];
                // Consider free space as always completed
                grid[i].push(item.classList.contains('completed') || item.classList.contains('free-space'));
            }
        }

        // Check rows
        for (let i = 0; i < size; i++) {
            if (grid[i].every(cell => cell)) hasWin = true;
        }

        // Check columns
        for (let j = 0; j < size; j++) {
            if (grid.every(row => row[j])) hasWin = true;
        }

        // Check main diagonal
        if (grid.every((row, i) => row[i])) hasWin = true;

        // Check other diagonal
        if (grid.every((row, i) => row[size - 1 - i])) hasWin = true;

        // Update progress display
        const progress = Math.round((completed.length / (bingoItems.length - 1)) * 100); // -1 for free space
        const message = `${completed.length}/${bingoItems.length - 1} teljesítve (${progress}%)`;
        updateProgressDisplay(message);

        // Trigger confetti for new wins
        if (hasWin && !document.cookie.includes('bingoWin')) {
            setCookie('bingoWin', 'true');
            triggerConfetti();
            setTimeout(() => {
                alert('🎯 Gratulálunk! Teljesítettél egy teljes sort/oszlopot/átlót! Folytasd tovább a kihívásokat! 🌟');
            }, 1000);
        }
        
        // Super win - all challenges completed
        if (completed.length === bingoItems.length - 1) { // -1 for free space
            triggerConfetti();
            setTimeout(() => {
                alert('🎉 SZUPER! Teljesítetted az összes nyári kihívást! Te vagy a nyár bajnoka! 🏆');
            }, 1000);
        }
    }

    // Progress display
    function updateProgressDisplay(message) {
        let progressDiv = document.querySelector('.bingo-progress');
        if (!progressDiv) {
            progressDiv = document.createElement('div');
            progressDiv.className = 'bingo-progress';
            document.querySelector('.bingo-section h2').after(progressDiv);
        }
        progressDiv.textContent = message;
    }

    // Initialize Map
    function initMap() {
        const locations = [
            { name: "Lupa Beach", coordinates: [47.6061, 19.0696] },
            { name: "Plázs Siófok", coordinates: [46.9086, 18.0556] },
            { name: "Strand Fesztivál", coordinates: [46.8042, 17.9853] },
            { name: "SZIN", coordinates: [46.2530, 20.1414] },
            { name: "Sziget Fesztivál", coordinates: [47.5507, 19.0531] }
        ];

        // Initialize map centered on Hungary
        const map = L.map('map').setView([47.1625, 19.5033], 7);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom icon class for emoji markers
        const BeachIcon = L.divIcon({
            html: '🏖️',
            className: 'map-marker',
            iconSize: [35, 35],
            iconAnchor: [17, 17],
            popupAnchor: [0, -20]
        });

        // Add markers with popups
        locations.forEach(location => {
            const marker = L.marker(location.coordinates, { icon: BeachIcon })
                .bindPopup(`<h3>${location.name}</h3>`)
                .addTo(map);

            // Add click handler for smooth zoom
            marker.on('click', () => {
                map.flyTo(location.coordinates, 13, {
                    duration: 1
                });
            });
        });

        // Add zoom control
        map.zoomControl.setPosition('topright');
    }

    // Initialize everything
    initTodoList();
    initBingoBoard();
    initMap();
});
