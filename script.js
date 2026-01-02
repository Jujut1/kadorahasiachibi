// ===== KONFIGURASI KADO =====
// EDIT BAGIAN INI UNTUK PERSONALISASI

const KADO_CONFIG = {
    // Nama Pengirim (GANTI DI SINI)
    pengirim: {
        nama: "KELUARGA & TEMAN-TEMAN"
    },
    
    // Foto Penerima (URL gambar - GANTI DI SINI)
    // Kosongkan untuk menggunakan avatar default
    fotoPenerima: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    
    // Template Pesan (GANTI DI SINI)
    // Gunakan {nama} untuk nama penerima
    pesanTemplate: `{nama}, di hari spesialmu ini, kami ingin mengucapkan terima kasih telah menjadi sosok yang luar biasa dalam hidup kami.

Setiap tawa, setiap momen, setiap petualangan bersamamu adalah kenangan berharga yang takkan terlupakan.

**Semoga di usia yang baru ini:**
• Kesehatan selalu menyertaimu
• Kebahagiaan mengelilingi harimu  
• Kesuksesan menghampiri setiap langkahmu
• Impian dan cita-citamu segera terwujud

Teruslah bersinar, karena dunia membutuhkan cahayamu! 🌟`,
    
    // Game Configuration
    game: {
        angkaRahasia: 7,  // Ganti angka rahasia (1-10)
        maxKesempatan: 3
    }
};

// ===== VARIABEL GLOBAL =====
let namaPenerima = "";
let namaPengirim = KADO_CONFIG.pengirim.nama;

let gameData = {
    secretNumber: KADO_CONFIG.game.angkaRahasia,
    attempts: KADO_CONFIG.game.maxKesempatan,
    score: 0,
    guesses: [],
    isGameComplete: false
};

let isMusicPlaying = false;
let bgMusic = null;

// ===== INISIALISASI =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    initAudio();
    setupEventListeners();
    console.log('🎁 Kado Digital Siap!');
}

function initAudio() {
    bgMusic = document.getElementById('bgMusic');
    document.addEventListener('click', enableAudio, { once: true });
}

function enableAudio() {
    if (bgMusic) {
        bgMusic.load();
        console.log('🎵 Audio siap diputar');
    }
}

function setupEventListeners() {
    // Tombol mulai
    document.getElementById('startButton').addEventListener('click', startJourney);
    
    // Input nama (enter key)
    document.getElementById('userNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') startJourney();
    });
    
    // Tombol angka game
    document.querySelectorAll('.number-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const guess = parseInt(this.dataset.number);
            checkGuess(guess);
        });
    });
    
    // Tombol hint
    document.getElementById('hintButton').addEventListener('click', giveHint);
    
    // Tombol skip
    document.getElementById('skipButton').addEventListener('click', skipGame);
    
    // Amplop
    const envelope = document.getElementById('envelope');
    if (envelope) {
        envelope.addEventListener('click', openEnvelope);
    }
    
    // Surat
    const letterBtn = document.getElementById('openLetterBtn');
    if (letterBtn) {
        letterBtn.addEventListener('click', openLetter);
    }
    
    // Tombol music
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // Tombol aksi di halaman kado
    document.getElementById('shareButton')?.addEventListener('click', shareGift);
    document.getElementById('replayButton')?.addEventListener('click', replayGame);
    document.getElementById('customizeButton')?.addEventListener('click', openCustomModal);
    
    // Modal customization
    document.querySelector('.close-modal')?.addEventListener('click', closeCustomModal);
    document.getElementById('cancelEdit')?.addEventListener('click', closeCustomModal);
    document.getElementById('saveChanges')?.addEventListener('click', saveCustomization);
    
    // Close modal saat klik di luar
    document.getElementById('customModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeCustomModal();
    });
}

// ===== FUNGSI UTAMA =====
function startJourney() {
    const nameInput = document.getElementById('userNameInput');
    const inputNama = nameInput.value.trim();
    
    if (!inputNama) {
        alert("Silakan masukkan namamu terlebih dahulu!");
        nameInput.focus();
        return;
    }
    
    // SIMPAN NAMA USER
    namaPenerima = formatNama(inputNama);
    
    // Update display nama di halaman game
    document.getElementById('playerNameDisplay').textContent = namaPenerima;
    
    // Reset game state
    resetGame();
    
    // Pindah ke halaman game
    switchPage('game-page');
    
    // Start background music
    playBackgroundMusic();
}

function formatNama(nama) {
    return nama.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function checkGuess(guess) {
    if (gameData.attempts <= 0 || gameData.isGameComplete) return;
    
    gameData.guesses.push(guess);
    gameData.attempts--;
    
    updateGameUI();
    
    const btn = document.querySelector(`.number-button[data-number="${guess}"]`);
    
    if (guess === gameData.secretNumber) {
        btn.classList.add('correct');
        gameData.score = 100 + (gameData.attempts * 50);
        gameData.isGameComplete = true;
        
        updateFeedback(`🎉 HORE! TEPAT SEKALI! Angka rahasia: ${gameData.secretNumber}`, 'success');
        updateProgressBar(100);
        
        setTimeout(() => {
            document.getElementById('winnerName').textContent = namaPenerima;
            switchPage('envelope-page');
        }, 1500);
        
        playSuccessSound();
        
    } else {
        btn.classList.add('wrong');
        
        const feedback = guess > gameData.secretNumber ? 
            "📈 Terlalu tinggi!" : "📉 Terlalu rendah!";
            
        updateFeedback(`${feedback} Sisa kesempatan: ${gameData.attempts}`, 'warning');
        
        const progress = ((KADO_CONFIG.game.maxKesempatan - gameData.attempts) / KADO_CONFIG.game.maxKesempatan) * 100;
        updateProgressBar(progress);
        
        btn.disabled = true;
        setTimeout(() => {
            btn.disabled = false;
            btn.classList.remove('wrong');
        }, 1000);
        
        if (gameData.attempts === 0) {
            gameData.isGameComplete = true;
            setTimeout(() => {
                updateFeedback(`😢 Kesempatan habis! Angka rahasia: ${gameData.secretNumber}`, 'error');
                setTimeout(() => {
                    document.getElementById('winnerName').textContent = namaPenerima;
                    switchPage('envelope-page');
                }, 2000);
            }, 1000);
        }
    }
}

function giveHint() {
    if (gameData.isGameComplete) return;
    
    const hints = [
        `💡 Angkanya antara 1 dan 10`,
        `🎯 Kamu sudah menebak: ${gameData.guesses.join(', ') || 'belum ada'}`,
        `🔢 Angka ini ${gameData.secretNumber % 2 === 0 ? 'genap' : 'ganjil'}`,
        `🌟 Hint: coba angka ${gameData.secretNumber > 5 ? 'di atas 5' : 'di bawah 6'}`
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    updateFeedback(`💡 Petunjuk: ${randomHint}`, 'info');
}

function skipGame() {
    if (confirm("Yakin ingin melewati game? Kado tetap bisa dibuka lho!")) {
        gameData.isGameComplete = true;
        document.getElementById('winnerName').textContent = namaPenerima;
        switchPage('envelope-page');
    }
}

function openEnvelope() {
    const envelope = document.getElementById('envelope');
    envelope.classList.add('open');
    
    setTimeout(() => {
        updateFeedback("📨 Amplop terbuka! Klik surat untuk membaca pesan", 'info');
    }, 800);
}

function openLetter() {
    const letter = document.getElementById('letter');
    letter.classList.add('open');
    
    setTimeout(() => {
        loadGiftPage();
        switchPage('gift-page');
    }, 1500);
}

function loadGiftPage() {
    // Generate pesan personal
    const pesanPersonal = generatePersonalizedMessage(namaPenerima);
    
    // Update semua data
    document.getElementById('forName').textContent = namaPenerima;
    document.getElementById('fromName').textContent = namaPengirim;
    document.getElementById('senderName').textContent = namaPengirim;
    document.getElementById('photoName').textContent = namaPenerima;
    document.getElementById('messageText').innerHTML = pesanPersonal;
    
    // Load foto bulat
    loadPhoto();
    
    // Update tanggal
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', options);
    
    // Buat efek confetti
    createConfetti();
}

function loadPhoto() {
    const photoCircle = document.getElementById('photoCircle');
    
    if (KADO_CONFIG.fotoPenerima) {
        // Create image element
        const img = document.createElement('img');
        img.src = KADO_CONFIG.fotoPenerima;
        img.alt = namaPenerima;
        img.onload = function() {
            // Replace placeholder with image
            photoCircle.innerHTML = '';
            photoCircle.appendChild(img);
        };
        img.onerror = function() {
            // If image fails to load, show placeholder
            showPhotoPlaceholder();
        };
    } else {
        showPhotoPlaceholder();
    }
}

function showPhotoPlaceholder() {
    const photoCircle = document.getElementById('photoCircle');
    photoCircle.innerHTML = `
        <div class="photo-placeholder">
            <i class="fas fa-user-circle"></i>
            <p style="margin-top: 15px; font-size: 1.2rem; color: #7f8c8d;">${namaPenerima}</p>
        </div>
    `;
}

function generatePersonalizedMessage(nama) {
    let pesan = KADO_CONFIG.pesanTemplate.replace(/{nama}/g, `<strong>${nama}</strong>`);
    
    // Format pesan dengan line breaks
    pesan = pesan.replace(/\n/g, '<br>');
    pesan = pesan.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return pesan;
}

// ===== FUNGSI BANTUAN =====
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetGame() {
    gameData = {
        secretNumber: KADO_CONFIG.game.angkaRahasia || Math.floor(Math.random() * 10) + 1,
        attempts: KADO_CONFIG.game.maxKesempatan,
        score: 0,
        guesses: [],
        isGameComplete: false
    };
    
    document.getElementById('attemptsCounter').textContent = gameData.attempts;
    document.getElementById('guessesDisplay').textContent = '-';
    document.getElementById('scoreDisplay').textContent = '0';
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('progressFill').style.width = '0%';
    
    document.querySelectorAll('.number-button').forEach(btn => {
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
    
    updateFeedback('Pilih angka untuk mulai bermain!', 'info');
}

function updateGameUI() {
    document.getElementById('attemptsCounter').textContent = gameData.attempts;
    document.getElementById('guessesDisplay').textContent = gameData.guesses.join(', ') || '-';
    document.getElementById('scoreDisplay').textContent = gameData.score;
}

function updateFeedback(message, type = 'info') {
    const feedbackBox = document.getElementById('feedbackBox');
    const icons = {
        success: 'fas fa-trophy',
        error: 'fas fa-heart-broken',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    feedbackBox.innerHTML = `
        <i class="${icons[type] || 'fas fa-info-circle'}"></i>
        <span class="feedback-text">${message}</span>
    `;
    
    const colors = {
        success: 'rgba(46, 204, 113, 0.2)',
        error: 'rgba(231, 76, 60, 0.2)',
        warning: 'rgba(241, 196, 15, 0.2)',
        info: 'rgba(52, 152, 219, 0.2)'
    };
    
    feedbackBox.style.background = colors[type] || colors.info;
}

function updateProgressBar(percent) {
    const fill = document.getElementById('progressFill');
    const percentText = document.getElementById('progressPercent');
    
    fill.style.width = `${percent}%`;
    percentText.textContent = `${Math.round(percent)}%`;
}

// ===== AUDIO FUNCTIONS =====
function playBackgroundMusic() {
    if (bgMusic && !isMusicPlaying) {
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            updateMusicButton(true);
        }).catch(e => {
            console.log('Audio play failed:', e);
            updateFeedback('🔊 Klik tombol musik untuk mengaktifkan suara', 'info');
        });
    }
}

function playSuccessSound() {
    const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3");
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Success sound skipped'));
}

function toggleMusic() {
    if (!bgMusic) return;
    
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
    } else {
        bgMusic.play();
        isMusicPlaying = true;
    }
    
    updateMusicButton(isMusicPlaying);
}

function updateMusicButton(playing) {
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.innerHTML = playing ? 
            '<i class="fas fa-volume-up"></i><span class="music-text">Musik</span>' :
            '<i class="fas fa-volume-mute"></i><span class="music-text">Musik</span>';
    }
}

// ===== CONFETTI EFFECT =====
function createConfetti() {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    container.innerHTML = '';
    const colors = ['#FFD700', '#FFA500', '#E74C3C', '#2ECC71', '#3498DB', '#9B59B6', '#FF69B4'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 15 + 5}px;
            height: ${Math.random() * 15 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -50px;
            left: ${Math.random() * 100}%;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            opacity: 0.9;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        `;
        
        if (!document.querySelector('#confetti-animation')) {
            const style = document.createElement('style');
            style.id = 'confetti-animation';
            style.textContent = `
                @keyframes confettiFall {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(100vh) rotate(${Math.random() * 720}deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentElement) confetti.remove();
        }, 5000);
    }
}

// ===== CUSTOMIZATION FUNCTIONS =====
function openCustomModal() {
    document.getElementById('editSenderName').value = namaPengirim;
    document.getElementById('editPhotoUrl').value = KADO_CONFIG.fotoPenerima || '';
    document.getElementById('editMessage').value = KADO_CONFIG.pesanTemplate.replace(/{nama}/g, namaPenerima);
    
    document.getElementById('customModal').classList.add('active');
}

function closeCustomModal() {
    document.getElementById('customModal').classList.remove('active');
}

function saveCustomization() {
    const newSender = document.getElementById('editSenderName').value.trim();
    const newPhoto = document.getElementById('editPhotoUrl').value.trim();
    const newMessage = document.getElementById('editMessage').value.trim();
    
    if (newSender) namaPengirim = newSender;
    if (newPhoto) KADO_CONFIG.fotoPenerima = newPhoto;
    if (newMessage) KADO_CONFIG.pesanTemplate = newMessage.replace(new RegExp(namaPenerima, 'g'), '{nama}');
    
    // Save to localStorage
    const customConfig = {
        pengirim: { nama: namaPengirim },
        fotoPenerima: KADO_CONFIG.fotoPenerima,
        pesanTemplate: KADO_CONFIG.pesanTemplate
    };
    
    localStorage.setItem('kadoCustomConfig', JSON.stringify(customConfig));
    
    // Update current page if on gift page
    if (document.getElementById('gift-page').classList.contains('active')) {
        loadGiftPage();
    }
    
    closeCustomModal();
    alert('✅ Perubahan disimpan! Kado telah diperbarui.');
}

// ===== ACTION FUNCTIONS =====
function shareGift() {
    const shareText = `Lihat kado digital spesial dari ${namaPengirim} untuk ${namaPenerima}! 🎁`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Kado Digital Ulang Tahun',
            text: shareText,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('📋 Tautan berhasil disalin!\n\nBagikan ke orang tersayang: ' + shareUrl);
        }).catch(() => {
            prompt('Salin tautan berikut:', shareUrl);
        });
    }
}

function replayGame() {
    resetGame();
    document.getElementById('envelope').classList.remove('open');
    document.getElementById('letter').classList.remove('open');
    switchPage('intro-page');
    document.getElementById('userNameInput').value = namaPenerima;
}

// ===== EXPORT FUNGSI GLOBAL =====
window.startJourney = startJourney;
window.checkGuess = checkGuess;
window.giveHint = giveHint;
window.skipGame = skipGame;
window.openEnvelope = openEnvelope;
window.openLetter = openLetter;
window.shareGift = shareGift;
window.replayGame = replayGame;
window.toggleMusic = toggleMusic;
window.openCustomModal = openCustomModal;
window.closeCustomModal = closeCustomModal;
window.saveCustomization = saveCustomization;