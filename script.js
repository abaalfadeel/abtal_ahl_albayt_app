document.addEventListener('DOMContentLoaded', () => {
    // --- APP STATE & DATA ---
    const APP_DATA = {
        character: null,
        xp: 0,
        gold: 50, // Start with some gold
        level: 1,
        unlockedTitles: ['محب أهل البيت'],
        currentTitleIndex: 0,
        dailyChallengeCompleted: false,
        lastPlayedDate: new Date().toDateString(),
        donations: { mosque: 0, poor: 0, books: 0 }
    };

    const TITLES = [
        'محب أهل البيت', 'نور الزهراء', 'حامل القيم', 'حبيب القرآن',
        'بطل الدعاء', 'صديق العباس', 'فارس كربلاء', 'خادم الإمام الحسين',
        'السخيّ', 'باني الخير'
    ];

    const MEMORY_ITEMS = ['⚔️', '🏹', '👑', '🕋', '💧', '📿', '🕯️', '🏴'];
    
    const ARABIC_LETTERS = [
        { letter: 'أ', name: 'ألف' }, { letter: 'ب', name: 'باء' },
        { letter: 'ت', name: 'تاء' }, { letter: 'ث', name: 'ثاء' },
        { letter: 'ج', name: 'جيم' }, { letter: 'ح', name: 'حاء' },
        { letter: 'خ', name: 'خاء' }, { letter: 'د', name: 'دال' }
    ];
    let currentLetterIndex = 0;

    // --- DOM ELEMENTS ---
    const screens = document.querySelectorAll('.screen');
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.bottom-nav-item');
    const notification = document.getElementById('notification');
    const appContainer = document.getElementById('appContainer');

    // --- CORE FUNCTIONS ---
    function loadProgress() {
        const savedData = localStorage.getItem('ahlulbaytHeroes_progress');
        if (savedData) {
            Object.assign(APP_DATA, JSON.parse(savedData));
        }
        
        if (APP_DATA.lastPlayedDate !== new Date().toDateString()) {
            APP_DATA.dailyChallengeCompleted = false;
            APP_DATA.lastPlayedDate = new Date().toDateString();
            saveProgress();
        }

        if (APP_DATA.character) {
            showApp();
        } else {
            showScreen('startScreen');
        }
    }

    function saveProgress() {
        localStorage.setItem('ahlulbaytHeroes_progress', JSON.stringify(APP_DATA));
    }

    function showScreen(screenId) {
        screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        appContainer.classList.remove('active');
    }

    function showApp() {
        screens.forEach(s => s.classList.remove('active'));
        appContainer.classList.add('active');
        updateUI();
    }

    function navigateTo(sectionId) {
        if (!APP_DATA.character) return; // Prevent navigation if character not selected

        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        navItems.forEach(item => item.classList.remove('active'));
        const activeNav = document.querySelector(`.bottom-nav-item[onclick*="${sectionId}"]`);
        if (activeNav) activeNav.classList.add('active');
    }

    function updateUI() {
        const xpNeeded = APP_DATA.level * 100;
        document.getElementById('xpBar').textContent = `${APP_DATA.xp} / ${xpNeeded} XP`;
        document.getElementById('xpBar').style.width = `${(APP_DATA.xp / xpNeeded) * 100}%`;
        
        document.getElementById('headerLevel').textContent = APP_DATA.level;
        document.getElementById('totalXP').textContent = APP_DATA.xp;
        document.getElementById('totalGold').textContent = APP_DATA.gold;
        document.getElementById('centerGoldAmount').textContent = APP_DATA.gold;
        
        const avatar = APP_DATA.character === 'boy' ? '👦' : '👧';
        document.getElementById('headerAvatar').textContent = avatar;
        document.getElementById('profileAvatar').textContent = avatar;

        document.getElementById('currentTitle').textContent = TITLES[APP_DATA.currentTitleIndex];
        
        document.getElementById('donationMosque').textContent = APP_DATA.donations.mosque;
        document.getElementById('donationPoor').textContent = APP_DATA.donations.poor;
        document.getElementById('donationBooks').textContent = APP_DATA.donations.books;

        // Update Daily Challenge UI
        const challengeBtn = document.getElementById('dailyChallengeBtn');
        const challengeText = document.getElementById('dailyChallengeText');
        if (APP_DATA.dailyChallengeCompleted) {
            challengeBtn.textContent = 'تمت المهمة ✅';
            challengeBtn.disabled = true;
            challengeText.textContent = 'حسنًا! عد غدًا لمهمة جديدة.';
        }
    }

    function showNotification(message, type = 'info') {
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function gainXP(amount) {
        const xpNeeded = APP_DATA.level * 100;
        APP_DATA.xp += amount;
        
        let leveledUp = false;
        while (APP_DATA.xp >= xpNeeded) {
            APP_DATA.xp -= xpNeeded;
            APP_DATA.level++;
            leveledUp = true;
        }
        
        saveProgress();
        updateUI();
        showNotification(`+${amount} XP!`);
        if (leveledUp) {
            setTimeout(() => showNotification(`🎉 لقد وصلت للمستوى ${APP_DATA.level}!`, 'success'), 500);
        }
        checkForNewTitle();
    }

    function gainGold(amount) {
        APP_DATA.gold += amount;
        saveProgress();
        updateUI();
        showNotification(`+${amount} 🏆 ذهب!`, 'success');
    }
    
    function checkForNewTitle() {
        const nextTitleIndex = APP_DATA.unlockedTitles.length;
        if (nextTitleIndex < TITLES.length && APP_DATA.level > 2 && APP_DATA.unlockedTitles.length < nextTitleIndex + 1) {
            const newTitle = TITLES[nextTitleIndex];
            APP_DATA.unlockedTitles.push(newTitle);
            APP_DATA.currentTitleIndex = nextTitleIndex;
            saveProgress();
            updateUI();
            showNotification(`🏆 لقد فتحت لقبًا جديدًا: ${newTitle}!`, 'success');
        }
    }

    // --- CHARACTER SELECTION LOGIC ---
    function selectCharacter(character) {
        APP_DATA.character = character;
        saveProgress();
        showApp();
    }

    // --- DAILY CHALLENGE LOGIC ---
    function completeDailyChallenge() {
        if (APP_DATA.dailyChallengeCompleted) return;
        APP_DATA.dailyChallengeCompleted = true;
        gainXP(30);
        gainGold(50);
        saveProgress();
    }

    // --- MEMORY GAME LOGIC ---
    let memoryCards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;

    function initMemoryGame() {
        const board = document.getElementById('memoryBoard');
        if (!board) return;
        board.innerHTML = '';
        memoryCards = [...MEMORY_ITEMS, ...MEMORY_ITEMS];
        memoryCards.sort(() => 0.5 - Math.random());
        matchedPairs = 0;
        flippedCards = [];
        canFlip = true;

        memoryCards.forEach((item, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.item = item;
            card.innerHTML = `<div class="front">?</div><div class="back">${item}</div>`;
            card.addEventListener('click', flipCard);
            board.appendChild(card);
        });
    }

    function flipCard() {
        if (!canFlip || this.classList.contains('flipped')) return;
        this.classList.add('flipped');
        flippedCards.push(this);
        if (flippedCards.length === 2) {
            canFlip = false;
            checkForMatch();
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.item === card2.dataset.item;
        if (isMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            gainXP(10);
            gainGold(5);
            if (matchedPairs === MEMORY_ITEMS.length) {
                setTimeout(() => {
                    showNotification(`🎉 أحسنت! أكملت اللعبة! (+20 XP, +20 🏆)`, 'success');
                    gainXP(20);
                    gainGold(20);
                }, 500);
            }
            flippedCards = [];
            canFlip = true;
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }

    function resetMemoryGame() {
        initMemoryGame();
    }
    
    // --- PUZZLE GAME LOGIC ---
    let puzzleState = [];
    let selectedPiece = null;

    function initPuzzleGame() {
        const board = document.getElementById('puzzleBoard');
        if (!board) return;
        
        puzzleState = Array.from({ length: 9 }, (_, i) => i);
        shufflePuzzle();
        renderPuzzle();
    }

    function shufflePuzzle() {
        for (let i = puzzleState.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [puzzleState[i], puzzleState[j]] = [puzzleState[j], puzzleState[i]];
        }
    }

    function renderPuzzle() {
        const board = document.getElementById('puzzleBoard');
        board.innerHTML = '';
        // Use a placeholder image from the web
        const imageUrl = 'https://i.imgur.com/vj7p1yL.jpeg'; // A placeholder image, replace with an Ahlulbayt image
        
        puzzleState.forEach((pieceIndex, position) => {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.dataset.index = pieceIndex;
            piece.dataset.position = position;
            
            const row = Math.floor(pieceIndex / 3);
            const col = pieceIndex % 3;
            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
            
            piece.addEventListener('click', selectPuzzlePiece);
            board.appendChild(piece);
        });
    }

    function selectPuzzlePiece() {
        if (selectedPiece && selectedPiece === this) {
            this.classList.remove('selected');
            selectedPiece = null;
            return;
        }

        if (!selectedPiece) {
            selectedPiece = this;
            this.classList.add('selected');
        } else {
            const firstPiece = selectedPiece;
            const secondPiece = this;

            // Swap data-index attributes
            const tempIndex = firstPiece.dataset.index;
            firstPiece.dataset.index = secondPiece.dataset.index;
            secondPiece.dataset.index = tempIndex;

            // Swap in the state array
            const pos1 = parseInt(firstPiece.dataset.position);
            const pos2 = parseInt(secondPiece.dataset.position);
            [puzzleState[pos1], puzzleState[pos2]] = [puzzleState[pos2], puzzleState[pos1]];
            
            firstPiece.classList.remove('selected');
            secondPiece.classList.add('selected');
            
            setTimeout(() => {
                renderPuzzle();
                checkPuzzleWin();
            }, 300);
            
            selectedPiece = null;
        }
    }
    
    function checkPuzzleWin() {
        const isWon = puzzleState.every((val, index) => val === index);
        if (isWon) {
            showNotification('🎉 رائع! لقد ركبت الصورة بنجاح! (+25 XP, +25 🏆)', 'success');
            gainXP(25);
            gainGold(25);
        }
    }

    function resetPuzzleGame() {
        shufflePuzzle();
        renderPuzzle();
    }


    // --- ARABIC LETTERS GAME LOGIC ---
    function updateLetterDisplay() {
        const letterData = ARABIC_LETTERS[currentLetterIndex];
        document.getElementById('arabicLetter').textContent = letterData.letter;
        document.querySelector('.letter-name').textContent = letterData.name;
    }

    function nextLetter() {
        gainXP(5);
        gainGold(2);
        currentLetterIndex = (currentLetterIndex + 1) % ARABIC_LETTERS.length;
        updateLetterDisplay();
    }
    
    // --- DONATION SYSTEM LOGIC ---
    function donate(type, cost) {
        if (APP_DATA.gold < cost) {
            showNotification(`لا تملك ذهبًا كافيًا! تحتاج ${cost} 🏆.`, 'error');
            return;
        }
        
        APP_DATA.gold -= cost;
        APP_DATA.donations[type]++;
        
        let message = '';
        switch(type) {
            case 'mosque':
                message = 'شكرًا لك على تبرعك لبناء مسجد! نسأل الله أن يتقبله منك.';
                break;
            case 'poor':
                message = 'صدقة جارية! جزاك الله خيرًا على مساعدة إخوانك.';
                break;
            case 'books':
                message = 'نشر للعلم! بارك الله في علمك ومالك.';
                break;
        }
        
        saveProgress();
        updateUI();
        showNotification(message, 'success');
        
        // Unlock a special title for donating
        if (APP_DATA.donations.mosque + APP_DATA.donations.poor + APP_DATA.donations.books === 1) {
            const specialTitleIndex = TITLES.indexOf('السخيّ');
            if (specialTitleIndex > -1 && APP_DATA.unlockedTitles.indexOf('السخيّ') === -1) {
                APP_DATA.unlockedTitles.push('السخيّ');
                APP_DATA.currentTitleIndex = APP_DATA.unlockedTitles.length - 1;
                updateUI();
                setTimeout(() => showNotification('🏆 لقد فتحت لقبًا مميزًا: السخيّ!', 'success'), 1000);
            }
        }
    }


    // --- INITIALIZATION ---
    loadProgress();
    initMemoryGame();
    initPuzzleGame();
    updateLetterDisplay();
});
