document.addEventListener('DOMContentLoaded', () => {

    // --- Countdown Target Date ---
    const targetDate = new Date('2025-05-05T09:00:00');
    const targetTimestamp = targetDate.getTime() / 1000;

    // --- Initialize Flipdown Clock ---
    try {
        const flipdown = new FlipDown(targetTimestamp, 'flipdown', {
            theme: 'light'
        }).start();
    } catch (e) {
        console.error("Failed to initialize FlipDown:", e);
        const clockElement = document.getElementById('flipdown');
        if (clockElement) {
            clockElement.innerHTML = "<p style='color: red;'>Hiba a visszaszámláló betöltésekor.</p>";
        }
    }

    // --- Motivational Quotes ---
    const messages = [
        "Csak így tovább! Hajrá! 💪", "Minden perc tanulás közelebb visz a sikerhez! 📚",
        "Megéri a befektetett munka! ✨", "Koncentrálj és kitartás! 🎯",
        "A siker apró lépésekből épül! 👣", "Napról napra erősebb és okosabb vagy! 💡",
        "A jövő azoké, akik készülnek rá! 🚀", "Hiszünk benned! 🙌",
        "Minden perc befektetés a jövődbe! ⏳", "A célod elérhető! 🏆",
        "Ne add fel, már majdnem ott vagy! 🌟", "Minden hiba egy tanulási lehetőség! 🌱"
    ];
    const scrollContainer = document.querySelector('.motivation-scroll');
    if (scrollContainer) {
        const fragment = document.createDocumentFragment();
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'quote-item';
            div.textContent = msg;
            fragment.appendChild(div);
        });
        // Append quotes twice for seamless looping effect
        scrollContainer.appendChild(fragment.cloneNode(true));
        scrollContainer.appendChild(fragment.cloneNode(true));
    } else {
        console.error("Motivation scroll container not found.");
    }

    // --- Landscape Orientation Check ---
    const rotatePrompt = document.getElementById('rotate-prompt');
    const mainContainer = document.querySelector('.container');
    const motivationContainer = document.querySelector('.motivation-container');
    const fullscreenButton = document.getElementById('fullscreen-btn'); // Get button

    function checkOrientation() {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        const isLikelyPhone = (window.innerWidth < 768 && window.innerHeight > window.innerWidth); // Adjusted heuristic

        if (isPortrait && isLikelyPhone) {
            if (rotatePrompt) rotatePrompt.style.display = 'flex';
            if (mainContainer) mainContainer.style.display = 'none';
            if (motivationContainer) motivationContainer.style.display = 'none';
            if (fullscreenButton) fullscreenButton.style.display = 'none'; // Hide button in portrait prompt
        } else {
            // Hide prompt, show content (respecting fullscreen state later)
            if (rotatePrompt) rotatePrompt.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'flex';
            if (motivationContainer) motivationContainer.style.display = 'flex';
            if (fullscreenButton) fullscreenButton.style.display = 'block'; // Show button (use block or flex)
        }
    }
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);


    // --- Fullscreen Button Logic ---
    const fsEnterIcon = document.getElementById('fullscreen-enter-icon');
    const fsExitIcon = document.getElementById('fullscreen-exit-icon');

    function getFullscreenElement() {
        return document.fullscreenElement // Standard
            || document.webkitFullscreenElement // Safari/Chrome
            || document.mozFullScreenElement // Firefox
            || document.msFullscreenElement; // IE/Edge
    }

    function toggleFullscreen() {
        if (!getFullscreenElement()) {
            // Enter fullscreen
            const element = document.documentElement; // Full page
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => console.error(`FS Error: ${err.message}`));
            } else if (element.webkitRequestFullscreen) { /* Safari */
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) { /* Firefox */
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) { /* IE/Edge */
                element.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) { /* Firefox */
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) { /* IE/Edge */
                document.msExitFullscreen();
            }
        }
    }

    // Update button icon based on fullscreen state
    function updateFullscreenButton() {
        if (getFullscreenElement()) {
            if(fsEnterIcon) fsEnterIcon.style.display = 'none';
            if(fsExitIcon) fsExitIcon.style.display = 'inline-block';
            if(fullscreenButton) fullscreenButton.setAttribute('aria-label', 'Kilépés a teljes képernyőből');
        } else {
            if(fsEnterIcon) fsEnterIcon.style.display = 'inline-block';
            if(fsExitIcon) fsExitIcon.style.display = 'none';
             if(fullscreenButton) fullscreenButton.setAttribute('aria-label', 'Teljes képernyő');
        }
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    } else {
        console.warn("Fullscreen button not found.");
    }

    // Listen for fullscreen changes (e.g., user pressing ESC)
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);

    // Initial button state check
    updateFullscreenButton();

});