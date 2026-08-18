(function () {
  'use strict';

  const PLAYLIST = [
    { file: 'nothing.mp3', title: 'Nothing' },
    { file: 'just-the-way-you-are.mp3', title: 'Just the Way You Are' },
    { file: 'lowkey.mp3', title: 'Lowkey' },
    { file: 'your-man.mp3', title: 'Your Man' },
    { file: 'dilaw - maki.mp3', title: 'Dilaw — Maki' },
    { file: 'maybe - radi.mp3', title: 'Maybe — RADI' },
    { file: 'paninindigan kita - ben&ben.mp3', title: 'Paninindigan Kita' },
  ];

  const TOTAL_SCREENS = 5;
  const $ = (id) => document.getElementById(id);

  const screens = Array.from({ length: TOTAL_SCREENS }, (_, i) => $('screen-' + (i + 1)));
  const btnOpen = $('btn-open');
  const envelopeScene = $('envelope-scene');
  const btnBack = $('btn-back');
  const stepDots = document.querySelectorAll('.dot');
  const poemEl = $('poem');
  const btnGift = $('btn-gift');
  const btnMore = $('btn-more');
  const btnAsk = $('btn-ask');
  const btnYes = $('btn-yes');
  const btnNo = $('btn-no');
  const sureMessage = $('sure-message');
  const celebration = $('celebration');
  const inviteButtons = $('invite-buttons');
  const bloomContainer = $('bloom-container');
  const fallingPetals = $('falling-petals');
  const petalsContainer = $('petals-container');
  const musicPlayer = $('music-player');
  const playerExpand = $('player-expand');
  const playerBody = $('player-body');

  const audio = $('audio');
  const songTitle = $('song-title');
  const songTitleMini = $('song-title-mini');
  const btnPlay = $('btn-play');
  const btnPlayMini = $('btn-play-mini');
  const btnPrev = $('btn-prev');
  const btnNext = $('btn-next');
  const progressBar = $('progress-bar');
  const progressFill = $('progress-fill');
  const currentTimeEl = $('current-time');
  const durationEl = $('duration');
  const volumeSlider = $('volume-slider');
  const playlistToggle = $('playlist-toggle');
  const playlistPanel = $('playlist-panel');
  const playlistEl = $('playlist');

  let currentScreen = 1;
  let currentTrack = 0;
  let musicStarted = false;
  let envelopeOpened = false;
  let noTapCount = 0;
  let isSeeking = false;
  let yesCelebrated = false;
  let playerExpanded = false;

  /* ── Screens ── */
  function showScreen(num) {
    screens.forEach((screen, i) => {
      const step = i + 1;
      const isActive = step === num;
      screen.classList.toggle('active', isActive);
      screen.hidden = !isActive;
    });
    currentScreen = num;
    updateStepDots(num);
    btnBack.classList.toggle('hidden', num === 1);
    if (num === 3) replayPoemAnimation();
    if (num === 1) resetEnvelope();
    document.body.dataset.screen = String(num);
  }

  function goToScreen(num) {
    if (num < 1 || num > TOTAL_SCREENS || num === currentScreen) return;
    if (currentScreen === TOTAL_SCREENS && num !== TOTAL_SCREENS) resetInvite();
    showScreen(num);
  }

  function goBack() {
    if (currentScreen > 1) goToScreen(currentScreen - 1);
  }

  function updateStepDots(step) {
    stepDots.forEach((dot) => {
      const s = Number(dot.dataset.step);
      dot.classList.toggle('active', s === step);
      dot.classList.toggle('done', s < step);
    });
  }

  function replayPoemAnimation() {
    if (!poemEl) return;
    poemEl.querySelectorAll('.poem-line').forEach((line) => {
      line.style.animation = 'none';
      line.offsetHeight;
      line.style.animation = '';
    });
  }

  function resetEnvelope() {
    envelopeOpened = false;
    envelopeScene.classList.remove('opening');
    btnOpen.disabled = false;
  }

  function resetInvite() {
    noTapCount = 0;
    yesCelebrated = false;
    inviteButtons.classList.remove('hidden');
    sureMessage.classList.add('hidden');
    celebration.classList.add('hidden');
    btnNo.style.cssText = '';
    bloomContainer.innerHTML = '';
    fallingPetals.innerHTML = '';
  }

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    btnOpen.disabled = true;
    envelopeScene.classList.add('opening');
    startMusic();
    setTimeout(() => goToScreen(2), 500);
  }

  /* ── Petals ── */
  function createPetals(count) {
    const classes = ['petal--pink', 'petal--rose', 'petal--cream'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'petal ' + classes[i % 3];
      p.style.left = Math.random() * 100 + '%';
      const size = 8 + Math.random() * 12;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      p.style.animationDuration = (14 + Math.random() * 18) + 's';
      p.style.animationDelay = (Math.random() * 15) + 's';
      petalsContainer.appendChild(p);
    }
  }

  /* ── Music ── */
  function setSongTitles(title) {
    songTitle.textContent = title;
    songTitleMini.textContent = title;
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
    audio.src = 'audio/' + encodeURI(track.file);
    setSongTitles(track.title);
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

  function updatePlayIcons() {
    const playing = !audio.paused;
    document.querySelectorAll('.icon-play').forEach((el) => el.classList.toggle('hidden', playing));
    document.querySelectorAll('.icon-pause').forEach((el) => el.classList.toggle('hidden', !playing));
    btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    btnPlayMini.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function updateProgress() {
    if (!audio.duration) return;
    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
  }

  function togglePlayerExpanded() {
    playerExpanded = !playerExpanded;
    musicPlayer.classList.toggle('expanded', playerExpanded);
    musicPlayer.classList.toggle('collapsed', !playerExpanded);
    document.body.classList.toggle('player-expanded', playerExpanded);
    playerExpand.setAttribute('aria-expanded', playerExpanded);
    playerExpand.setAttribute('aria-label', playerExpanded ? 'Collapse music player' : 'Expand music player');
    playerBody.hidden = !playerExpanded;
  }

  audio.volume = volumeSlider.value / 100;

  audio.addEventListener('play', updatePlayIcons);
  audio.addEventListener('pause', updatePlayIcons);
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

  /* ── Celebration ── */
  function spawnFallingPetals(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'fall-petal';
        p.style.left = Math.random() * 100 + '%';
        const size = 10 + Math.random() * 10;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        fallingPetals.appendChild(p);
        setTimeout(() => p.remove(), 5000);
      }, i * 55);
    }
  }

  function spawnBlooms() {
    const spots = [6, 12, 88, 18, 10, 42, 82, 48, 20, 75, 50, 65, 35, 88, 72, 25];
    for (let i = 0; i < spots.length; i += 2) {
      setTimeout(() => {
        const bloom = document.createElement('img');
        bloom.src = 'assets/flower.svg';
        bloom.className = 'bloom';
        bloom.style.left = spots[i] + '%';
        bloom.style.top = spots[i + 1] + '%';
        bloom.alt = '';
        bloomContainer.appendChild(bloom);
      }, (i / 2) * 90);
    }
  }

  function moveNoButton() {
    const pad = 20;
    const navBottom = 60;
    const playerTop = musicPlayer.getBoundingClientRect().top;
    const yesRect = btnYes.getBoundingClientRect();
    const btnW = btnNo.offsetWidth;
    const btnH = btnNo.offsetHeight;
    const maxLeft = window.innerWidth - btnW - pad;
    const maxTop = playerTop - btnH - pad;
    const minTop = navBottom + pad;

    let left, top, tries = 0;
    do {
      left = pad + Math.random() * (maxLeft - pad);
      top = minTop + Math.random() * (maxTop - minTop);
      tries++;
    } while (
      tries < 20 &&
      left + btnW > yesRect.left - 12 &&
      left < yesRect.right + 12 &&
      top + btnH > yesRect.top - 12 &&
      top < yesRect.bottom + 12
    );

    btnNo.style.cssText = 'position:fixed;left:' + left + 'px;top:' + top + 'px;z-index:50';
  }

  /* ── Events ── */
  btnOpen.addEventListener('click', openEnvelope);
  btnBack.addEventListener('click', goBack);
  btnGift.addEventListener('click', () => goToScreen(3));
  btnMore.addEventListener('click', () => goToScreen(4));
  btnAsk.addEventListener('click', () => goToScreen(5));

  btnYes.addEventListener('click', () => {
    if (yesCelebrated) return;
    yesCelebrated = true;
    inviteButtons.classList.add('hidden');
    sureMessage.classList.add('hidden');
    celebration.classList.remove('hidden');
    spawnFallingPetals(40);
    spawnBlooms();
  });

  btnNo.addEventListener('click', (e) => {
    e.stopPropagation();
    noTapCount++;
    if (noTapCount >= 3) sureMessage.classList.remove('hidden');
    moveNoButton();
  });

  btnPlay.addEventListener('click', togglePlay);
  btnPlayMini.addEventListener('click', togglePlay);
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
    document.body.classList.toggle('player-playlist-open', !playlistPanel.classList.contains('hidden'));
  });
  playerExpand.addEventListener('click', togglePlayerExpanded);

  /* ── Init ── */
  createPetals(24);
  buildPlaylist();
  showScreen(1);
})();
