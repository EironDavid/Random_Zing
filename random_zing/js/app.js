(function () {
  'use strict';

  const PLAYLIST = [
    { file: 'just-the-way-you-are.mp3', title: 'Just the Way You Are' },
    { file: 'lowkey.mp3', title: 'Lowkey' },
    { file: 'your-man.mp3', title: 'Your Man' },
  ];

  const screens = {
    1: document.getElementById('screen-1'),
    2: document.getElementById('screen-2'),
    3: document.getElementById('screen-3'),
  };

  const envelopeTrigger = document.getElementById('envelope-trigger');
  const btnBack = document.getElementById('btn-back');
  const stepDots = document.querySelectorAll('.dot');
  const poemEl = document.getElementById('poem');
  const btnMore = document.getElementById('btn-more');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const sureMessage = document.getElementById('sure-message');
  const celebration = document.getElementById('celebration');
  const inviteButtons = document.getElementById('invite-buttons');
  const bloomContainer = document.getElementById('bloom-container');
  const fallingPetals = document.getElementById('falling-petals');
  const heartsContainer = document.getElementById('hearts-container');
  const petalsContainer = document.getElementById('petals-container');
  const musicPlayer = document.getElementById('music-player');

  const audio = document.getElementById('audio');
  const songTitle = document.getElementById('song-title');
  const btnPlay = document.getElementById('btn-play');
  const iconPlay = btnPlay.querySelector('.icon-play');
  const iconPause = btnPlay.querySelector('.icon-pause');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const volumeSlider = document.getElementById('volume-slider');
  const playlistToggle = document.getElementById('playlist-toggle');
  const playlistPanel = document.getElementById('playlist-panel');
  const playlistEl = document.getElementById('playlist');

  let currentScreen = 1;
  let currentTrack = 0;
  let musicStarted = false;
  let noTapCount = 0;
  let isSeeking = false;
  let yesCelebrated = false;

  const PETAL_CLASSES = ['petal--pink', 'petal--rose', 'petal--cream'];

  function createBackgroundPetals(count) {
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal ' + PETAL_CLASSES[i % PETAL_CLASSES.length];
      petal.style.left = Math.random() * 100 + '%';
      const size = 8 + Math.random() * 14;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
      petal.style.animationDuration = (14 + Math.random() * 22) + 's';
      petal.style.animationDelay = (Math.random() * 20) + 's';
      petalsContainer.appendChild(petal);
    }
  }

  function updateStepDots(step) {
    stepDots.forEach((dot) => {
      const s = Number(dot.dataset.step);
      dot.classList.toggle('active', s === step);
      dot.classList.toggle('done', s < step);
    });
  }

  function updateBackButton(step) {
    btnBack.classList.toggle('hidden', step === 1);
  }

  function animatePoem() {
    poemEl.classList.remove('poem-animate');
    void poemEl.offsetWidth;
    poemEl.classList.add('poem-animate');
  }

  function resetEnvelope() {
    envelopeTrigger.classList.remove('opening');
  }

  function resetInvite() {
    noTapCount = 0;
    yesCelebrated = false;
    inviteButtons.classList.remove('hidden');
    sureMessage.classList.add('hidden');
    celebration.classList.add('hidden');
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.zIndex = '';
    bloomContainer.innerHTML = '';
    fallingPetals.innerHTML = '';
    heartsContainer.innerHTML = '';
  }

  function goToScreen(num, direction) {
    if (num === currentScreen) return;

    const prev = currentScreen;
    currentScreen = num;

    Object.values(screens).forEach((s) => {
      s.classList.remove('active', 'from-right', 'from-left');
    });

    const target = screens[num];
    target.classList.add('active');
    target.classList.add(direction === 'back' ? 'from-left' : 'from-right');

    updateStepDots(num);
    updateBackButton(num);

    if (num === 1) resetEnvelope();
    if (num === 2) animatePoem();
    if (num === 3 && prev === 1) animatePoem();

    if (prev === 3 && num !== 3) resetInvite();
  }

  function goBack() {
    if (currentScreen === 2) goToScreen(1, 'back');
    else if (currentScreen === 3) goToScreen(2, 'back');
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  function buildPlaylist() {
    playlistEl.innerHTML = '';
    PLAYLIST.forEach((track, i) => {
      const li = document.createElement('li');
      li.textContent = track.title;
      if (i === currentTrack) li.classList.add('active');
      li.addEventListener('click', () => loadTrack(i, true));
      playlistEl.appendChild(li);
    });
  }

  function updatePlaylistActive() {
    playlistEl.querySelectorAll('li').forEach((li, i) => {
      li.classList.toggle('active', i === currentTrack);
    });
  }

  function loadTrack(index, play) {
    currentTrack = ((index % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    const track = PLAYLIST[currentTrack];
    audio.src = 'audio/' + track.file;
    songTitle.textContent = track.title;
    updatePlaylistActive();
    if (play) audio.play().catch(() => {});
  }

  function showPlayer() {
    musicPlayer.classList.remove('hidden');
  }

  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    showPlayer();
    loadTrack(0, true);
    buildPlaylist();
  }

  function togglePlay() {
    if (!musicStarted) { startMusic(); return; }
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function updatePlayButton() {
    const playing = !audio.paused;
    iconPlay.classList.toggle('hidden', playing);
    iconPause.classList.toggle('hidden', !playing);
    btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function updateProgress() {
    if (!audio.duration) return;
    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
  }

  audio.volume = volumeSlider.value / 100;

  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);
  audio.addEventListener('ended', () => loadTrack(currentTrack + 1, true));

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    progressBar.max = audio.duration || 100;
  });

  audio.addEventListener('timeupdate', () => {
    if (!isSeeking && audio.duration) {
      progressBar.value = audio.currentTime;
      currentTimeEl.textContent = formatTime(audio.currentTime);
      updateProgress();
    }
  });

  progressBar.addEventListener('input', () => {
    isSeeking = true;
    currentTimeEl.textContent = formatTime(Number(progressBar.value));
    if (audio.duration) {
      progressFill.style.width = (Number(progressBar.value) / audio.duration) * 100 + '%';
    }
  });

  progressBar.addEventListener('change', () => {
    audio.currentTime = Number(progressBar.value);
    isSeeking = false;
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
  });

  btnPlay.addEventListener('click', togglePlay);
  btnPrev.addEventListener('click', () => {
    if (!musicStarted) startMusic();
    else loadTrack(currentTrack - 1, true);
  });
  btnNext.addEventListener('click', () => {
    if (!musicStarted) startMusic();
    else loadTrack(currentTrack + 1, true);
  });

  playlistToggle.addEventListener('click', () => {
    playlistPanel.classList.toggle('hidden');
    playlistToggle.classList.toggle('active');
  });

  btnBack.addEventListener('click', goBack);

  function openEnvelope() {
    if (envelopeTrigger.classList.contains('opening')) return;
    envelopeTrigger.classList.add('opening');
    startMusic();
    setTimeout(() => goToScreen(2, 'forward'), 1000);
  }

  envelopeTrigger.addEventListener('click', openEnvelope);
  envelopeTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  btnMore.addEventListener('click', () => goToScreen(3, 'forward'));

  function spawnFallingPetals(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'fall-petal';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = (10 + Math.random() * 12) + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
        fallingPetals.appendChild(p);
        setTimeout(() => p.remove(), 5500);
      }, i * 55);
    }
  }

  function spawnHearts(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const h = document.createElement('span');
        h.className = 'float-heart';
        h.textContent = '❤';
        h.style.left = (15 + Math.random() * 70) + '%';
        h.style.top = (25 + Math.random() * 45) + '%';
        heartsContainer.appendChild(h);
        setTimeout(() => h.remove(), 3200);
      }, i * 90);
    }
  }

  function spawnBlooms() {
    const positions = [
      [6, 12], [88, 18], [10, 42], [82, 48], [4, 68], [92, 62],
      [22, 8], [72, 82], [38, 6], [58, 75], [15, 85], [85, 32],
      [50, 15], [30, 55], [65, 38], [45, 88], [78, 28],
    ];
    positions.forEach(([left, top], i) => {
      setTimeout(() => {
        const bloom = document.createElement('img');
        bloom.src = 'assets/flower.svg';
        bloom.className = 'bloom';
        bloom.style.left = left + '%';
        bloom.style.top = top + '%';
        bloom.alt = '';
        bloomContainer.appendChild(bloom);
      }, i * 90);
    });
  }

  btnYes.addEventListener('click', () => {
    if (yesCelebrated) return;
    yesCelebrated = true;
    inviteButtons.classList.add('hidden');
    sureMessage.classList.add('hidden');
    celebration.classList.remove('hidden');
    spawnFallingPetals(55);
    spawnHearts(14);
    spawnBlooms();
  });

  function moveNoButton() {
    const rect = btnNo.getBoundingClientRect();
    const pad = 20;
    const playerRect = musicPlayer.getBoundingClientRect();
    const yesRect = btnYes.getBoundingClientRect();
    const navBottom = 56;

    const maxTop = playerRect.top - rect.height - pad;
    const maxLeft = window.innerWidth - rect.width - pad;
    const minLeft = pad;
    const minTop = navBottom + pad;

    let newLeft, newTop, attempts = 0;

    do {
      newLeft = minLeft + Math.random() * (maxLeft - minLeft);
      newTop = minTop + Math.random() * (maxTop - minTop);
      attempts++;
    } while (
      attempts < 25 &&
      newLeft + rect.width > yesRect.left - 12 &&
      newLeft < yesRect.right + 12 &&
      newTop + rect.height > yesRect.top - 12 &&
      newTop < yesRect.bottom + 12
    );

    btnNo.style.position = 'fixed';
    btnNo.style.left = newLeft + 'px';
    btnNo.style.top = newTop + 'px';
    btnNo.style.zIndex = '50';
  }

  btnNo.addEventListener('click', (e) => {
    e.stopPropagation();
    noTapCount++;
    if (noTapCount >= 3) sureMessage.classList.remove('hidden');
    moveNoButton();
  });

  createBackgroundPetals(28);
  buildPlaylist();
  updateStepDots(1);
  updateBackButton(1);
})();
