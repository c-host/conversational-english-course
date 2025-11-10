const state = {
    data: null,
    currentWeekIndex: 0,
    currentLesson: 'lesson1',
    grammarFocus: null,
    timer: { seconds: 0, handle: null },
    initiatorQueue: [],
    initiatorIndex: 0,
    chosenPath: [],
    currentNodeId: null,
    turns: {},
    decisionsMade: 0,
    decisionsTotal: 6,
};

const els = {
    weekSelect: document.getElementById('weekSelect'),
    lessonSelect: document.getElementById('lessonSelect'),
    // focusSelect removed
    timerDisplay: document.getElementById('timerDisplay'),
    timerPause: document.getElementById('timerPause'),
    timerReset: document.getElementById('timerReset'),
    mediaContainer: document.getElementById('mediaContainer'),
    prompt: document.getElementById('prompt'),
    pathA: document.getElementById('pathA'),
    pathB: document.getElementById('pathB'),
    refreshImage: document.getElementById('refreshImage'),
    resetPaths: document.getElementById('resetPaths'),
    mediaType: document.getElementById('mediaType'),
    mediaUrl: document.getElementById('mediaUrl'),
    applyMedia: document.getElementById('applyMedia'),
    mediaKeyword: document.getElementById('mediaKeyword'),
    searchImage: document.getElementById('searchImage'),
    vocabList: document.getElementById('vocabList'),
    pickInitiator: document.getElementById('pickInitiator'),
    initiatorName: document.getElementById('initiatorName'),
    // export removed
    lesson2Controls: document.getElementById('lesson2Controls'),
    modeSelect: document.getElementById('modeSelect'),
    modePrompts: document.getElementById('modePrompts'),
    progressCounter: document.getElementById('progressCounter'),
    selectedPath: document.getElementById('selectedPath'),
    pathTrail: document.getElementById('pathTrail'),
    helpButton: document.getElementById('helpButton'),
    helpModal: document.getElementById('helpModal'),
    closeModal: document.getElementById('closeModal'),
};

init();

async function init() {
    const res = await fetch('lessons.json');
    state.data = await res.json();
    setupSelectors();
    setupTimer();
    setupInitiatorQueue();
    setupEvents();
    render();
}

function setupSelectors() {
    const { weeks, settings } = state.data;
    // week select
    els.weekSelect.innerHTML = weeks.map((w, i) => `<option value="${i}">Week ${w.id}: ${w.topic}</option>`).join('');
    els.weekSelect.value = String(state.currentWeekIndex);
    // lesson select (preset in HTML)
    els.lessonSelect.value = state.currentLesson;
    // focus select removed
}

function setupTimer() {
    const { durations } = state.data.settings;
    document.querySelectorAll('[data-timer]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-timer');
            const mins = durations[key] || 0;
            state.timer.seconds = mins * 60;
            updateTimerDisplay();
            startTimer();
        });
    });
    els.timerPause.addEventListener('click', togglePauseResume);
    els.timerReset.addEventListener('click', () => { state.timer.seconds = 0; updateTimerDisplay(); pauseTimer(); els.timerPause.textContent = 'Pause'; });
}

function startTimer() {
    if (state.timer.handle) return;
    state.timer.handle = setInterval(() => {
        if (state.timer.seconds > 0) {
            state.timer.seconds -= 1;
            updateTimerDisplay();
        }
    }, 1000);
}
function pauseTimer() { clearInterval(state.timer.handle); state.timer.handle = null; }
function togglePauseResume() {
    if (state.timer.handle) {
        pauseTimer();
        els.timerPause.textContent = 'Resume';
    } else {
        startTimer();
        els.timerPause.textContent = 'Pause';
    }
}
function updateTimerDisplay() {
    const s = state.timer.seconds;
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    els.timerDisplay.textContent = `${m}:${sec}`;
}

function setupInitiatorQueue() {
    const names = state.data.students || [];
    state.initiatorQueue = [...names];
    state.initiatorIndex = 0;
    if (els.initiatorName) {
        els.initiatorName.textContent = names[0] || '—';
    }
}

function setupEvents() {
    els.weekSelect.addEventListener('change', () => { state.currentWeekIndex = Number(els.weekSelect.value); resetLessonState(); render(); });
    els.lessonSelect.addEventListener('change', () => { state.currentLesson = els.lessonSelect.value; resetLessonState(); render(); });
    // focus select removed
    els.pickInitiator.addEventListener('click', advanceInitiator);
    els.pathA.addEventListener('click', () => choosePath(0));
    els.pathB.addEventListener('click', () => choosePath(1));
    els.refreshImage.addEventListener('click', refreshCyoaImage);
    els.resetPaths.addEventListener('click', resetLessonState);
    els.applyMedia.addEventListener('click', applyMediaSettings);
    els.modeSelect.addEventListener('change', renderModePrompts);
    els.mediaType.addEventListener('change', toggleMediaTypeControls);
    if (els.searchImage) els.searchImage.addEventListener('click', searchOpenverse);
    if (els.mediaKeyword) els.mediaKeyword.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchOpenverse(); });
    // export removed
    if (els.helpButton) els.helpButton.addEventListener('click', openHelpModal);
    if (els.closeModal) els.closeModal.addEventListener('click', closeHelpModal);
    if (els.helpModal) els.helpModal.addEventListener('click', (e) => { if (e.target === els.helpModal) closeHelpModal(); });
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && els.helpModal?.classList.contains('active')) closeHelpModal(); });
    filterTimeboxesByLesson();
    toggleMediaTypeControls();
}

function filterTimeboxesByLesson() {
    const current = state.currentLesson; // 'lesson1' or 'lesson2'
    document.querySelectorAll('[data-timer]').forEach(btn => {
        const allowedLesson = btn.getAttribute('data-lesson');
        if (!allowedLesson) {
            btn.style.display = '';
        } else {
            btn.style.display = allowedLesson === current ? '' : 'none';
        }
    });
}

function resetLessonState() {
    state.chosenPath = [];
    state.decisionsMade = 0;
    // Reset to start node for current week (Lesson 1)
    const week = state.data.weeks[state.currentWeekIndex];
    const startId = week?.lesson1?.cyoa?.startNodeId;
    state.currentNodeId = startId || null;
    els.prompt.textContent = 'Pick an initiator, then select a path.';
    els.vocabList.innerHTML = '<li class="placeholder">—</li>';
    if (els.selectedPath) els.selectedPath.textContent = '—';
    if (els.pathTrail) els.pathTrail.innerHTML = '<li class="placeholder">—</li>';
    updateProgress();
    // Re-render current view so path buttons are active from node 1
    render();
}

function render() {
    const week = state.data.weeks[state.currentWeekIndex];
    const isLesson1 = state.currentLesson === 'lesson1';
    els.lesson2Controls.classList.toggle('hidden', isLesson1);
    // Set body attribute for CSS-based toggling of lesson-specific UI
    document.body.setAttribute('data-lesson-view', isLesson1 ? 'lesson1' : 'lesson2');
    if (isLesson1) {
        // Ensure path controls visible for Lesson 1
        els.pathA.style.display = '';
        els.pathB.style.display = '';
        if (els.resetPaths) els.resetPaths.style.display = '';
        renderCYOA(week);
    } else {
        renderLesson2(week);
    }
    filterTimeboxesByLesson();
    toggleMediaTypeControls();
}

function renderCYOA(week) {
    const cyoa = week.lesson1?.cyoa;
    if (!cyoa || !cyoa.nodes?.length) {
        els.prompt.textContent = 'No CYOA content. Add nodes in lessons.json.';
        return;
    }
    if (!state.currentNodeId) state.currentNodeId = cyoa.startNodeId;
    const node = cyoa.nodes.find(n => n.id === state.currentNodeId);
    const media = week.lesson1?.media || (cyoa.nodes.find(n => n.id === cyoa.startNodeId) || node).media;
    renderMedia(media);
    renderPaths(node.paths);
    renderVocab([]);
    // Set initial guidance for Lesson 1
    els.prompt.textContent = 'Select a path to begin the conversation.';
    updateProgress();
    updateFocusUI();
}

function renderMedia(media) {
    els.mediaContainer.innerHTML = '';
    if (!media) return;
    if (media.type === 'video') {
        const iframe = document.createElement('iframe');
        iframe.src = media.url;
        iframe.title = 'video';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        els.mediaContainer.appendChild(iframe);
    } else if (media.type === 'image') {
        const img = document.createElement('img');
        img.src = media.url;
        img.alt = 'image';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        els.mediaContainer.appendChild(img);
    }
}

function refreshCyoaImage() {
    const week = state.data.weeks[state.currentWeekIndex];
    const cyoa = week.lesson1?.cyoa;
    if (!cyoa) return;
    // rotate through an images array on lesson1.media
    const media = week.lesson1.media || {};
    media.images = media.images || [media.url].filter(Boolean);
    const currentIdx = media.images.indexOf(media.url);
    const nextIdx = (currentIdx + 1) % media.images.length;
    if (media.images.length > 1) {
        media.url = media.images[nextIdx];
    } else {
        const cacheBust = Math.floor(Math.random() * 100000);
        media.url = `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&cb=${cacheBust}`;
    }
    week.lesson1.media = media;
    renderMedia(media);
}

function toggleMediaTypeControls() {
    const isVideo = els.mediaType.value === 'video';
    // Hide/show keyword and search elements using CSS class to maintain consistent layout
    const keywordLabel = els.mediaKeyword?.parentElement;
    if (keywordLabel) {
        keywordLabel.classList.toggle('media-control-hidden', isVideo);
    }
    if (els.searchImage) {
        els.searchImage.classList.toggle('media-control-hidden', isVideo);
    }
    // Hide/show change image button
    const changeImageContainer = els.refreshImage?.parentElement;
    if (changeImageContainer) {
        changeImageContainer.classList.toggle('media-control-hidden', isVideo);
    }
}

function applyMediaSettings() {
    const week = state.data.weeks[state.currentWeekIndex];
    if (!week.lesson1) return;
    const type = els.mediaType.value === 'video' ? 'video' : 'image';
    let url = (els.mediaUrl.value || '').trim();
    if (type === 'video') {
        // Normalize YouTube watch URL to embed
        url = url
            .replace('watch?v=', 'embed/')
            .replace('youtu.be/', 'www.youtube.com/embed/');
    }
    week.lesson1.media = {
        type,
        url: url || week.lesson1.media?.url || ''
    };
    toggleMediaTypeControls();
    renderMedia(week.lesson1.media);
}

async function searchOpenverse() {
    const q = (els.mediaKeyword?.value || '').trim();
    if (!q) return;
    try {
        // Use JSONP to bypass CORS restrictions with Wikimedia Commons API
        return new Promise((resolve, reject) => {
            const callbackName = 'wikimediaCallback_' + Date.now();
            window[callbackName] = function (data) {
                delete window[callbackName];
                document.body.removeChild(script);
                try {
                    const pages = (data && data.query && data.query.pages) || {};
                    const results = Object.values(pages);
                    if (!results.length) {
                        alert('No images found for "' + q + '". Try a different keyword.');
                        resolve();
                        return;
                    }
                    // Extract image URLs from Wikimedia Commons results
                    const images = results.map(page => {
                        const imageinfo = page.imageinfo && page.imageinfo[0];
                        if (imageinfo && imageinfo.thumburl) return imageinfo.thumburl;
                        if (imageinfo && imageinfo.url) return imageinfo.url;
                        return null;
                    }).filter(Boolean);
                    if (!images.length) {
                        alert('Found results but no image URLs available.');
                        console.log('Wikimedia API response structure:', data);
                        resolve();
                        return;
                    }
                    const imgUrl = images[0];
                    const week = state.data.weeks[state.currentWeekIndex];
                    if (!week.lesson1) {
                        resolve();
                        return;
                    }
                    week.lesson1.media = { type: 'image', url: imgUrl, images };
                    if (els.mediaType) els.mediaType.value = 'image';
                    if (els.mediaUrl) els.mediaUrl.value = imgUrl;
                    if (els.refreshImage) els.refreshImage.style.display = '';
                    renderMedia(week.lesson1.media);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };
            const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&callback=${callbackName}&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=1200`;
            const script = document.createElement('script');
            script.src = apiUrl;
            script.onerror = () => {
                delete window[callbackName];
                document.body.removeChild(script);
                alert('Image search failed. Since browser security prevents direct API access, you can:\n\n1. Use the URL field to manually paste an image URL\n2. Search for images on Unsplash/Pexels/Wikimedia and paste the URL\n3. Add a simple server-side proxy to your Python server');
                reject(new Error('JSONP request failed'));
            };
            document.body.appendChild(script);
            // Timeout after 10 seconds
            setTimeout(() => {
                if (window[callbackName]) {
                    delete window[callbackName];
                    if (script.parentNode) document.body.removeChild(script);
                    alert('Image search timed out. Try using the URL field to manually enter an image URL.');
                    reject(new Error('Request timeout'));
                }
            }, 10000);
        });
    } catch (e) {
        console.error('Image search failed', e);
        alert('Image search failed: ' + (e.message || 'Check your connection and try again.'));
    }
}

function renderPaths(paths) {
    const [a, b] = paths || [];
    if (!a || !b) {
        els.pathA.disabled = true;
        els.pathB.disabled = true;
        // Keep current prompt; only disable when end
        return;
    }
    els.pathA.textContent = `Path A — ${a.title}`;
    els.pathB.textContent = `Path B — ${b.title}`;
    els.pathA.disabled = false;
    els.pathB.disabled = false;
}

function renderVocab(items) {
    if (!items || items.length === 0) {
        els.vocabList.innerHTML = '<li class="placeholder">—</li>';
        return;
    }
    const list = items.map(v => ({ ...v, highlight: false }));
    els.vocabList.innerHTML = list.map(v => `<li class="${v.highlight ? 'highlight' : ''}"><span class="word">${v.word}</span>${v.definition}</li>`).join('');
}

function advanceInitiator() {
    const names = state.data.students || [];
    if (names.length === 0) return;
    state.initiatorIndex = (state.initiatorIndex + 1) % names.length;
    els.initiatorName.textContent = names[state.initiatorIndex] || '—';
}

function choosePath(index) {
    const week = state.data.weeks[state.currentWeekIndex];
    const node = week.lesson1.cyoa.nodes.find(n => n.id === state.currentNodeId);
    const path = node.paths[index];
    if (!path) return;
    state.chosenPath.push({ nodeId: node.id, pathIndex: index, title: path.title, initiator: els.initiatorName.textContent });
    // Update selected path display and trail
    els.selectedPath.textContent = `${index === 0 ? 'Path A' : 'Path B'} — ${path.title}`;
    renderTrail();
    renderVocab(path.vocab || []);
    els.prompt.textContent = path.prompt;
    state.decisionsMade = Math.min(state.decisionsMade + 1, state.decisionsTotal);
    updateProgress();
    updateFocusUI();
    advanceInitiator();
    if (path.next) {
        state.currentNodeId = path.next;
        // Keep media constant; only update paths
        const nextNode = week.lesson1.cyoa.nodes.find(n => n.id === state.currentNodeId);
        if (nextNode && Array.isArray(nextNode.paths) && nextNode.paths.length === 2) {
            renderPaths(nextNode.paths);
        } else {
            els.pathA.disabled = true;
            els.pathB.disabled = true;
        }
    } else {
        els.pathA.disabled = true;
        els.pathB.disabled = true;
    }
}

function renderTrail() {
    if (!els.pathTrail) return;
    if (state.chosenPath.length === 0) {
        els.pathTrail.innerHTML = '<li class="placeholder">—</li>';
        return;
    }
    els.pathTrail.innerHTML = state.chosenPath.map(step => `<li>${step.title}</li>`).join('');
}

function updateProgress() {
    if (!els.progressCounter) return;
    const remaining = Math.max(state.decisionsTotal - state.decisionsMade, 0);
    els.progressCounter.textContent = `Decisions remaining: ${remaining}/${state.decisionsTotal}`;
}

function updateFocusUI() { /* focus removed */ }

function renderLesson2(week) {
    const pres = week.lesson2?.presentations;
    if (!pres) {
        els.prompt.textContent = 'No presentation content. Add modes/prompts in lessons.json.';
        return;
    }
    els.modeSelect.innerHTML = (pres.modes || []).map(m => `<option value="${m}">${m}</option>`).join('');
    renderModePrompts();
    // Lesson 2 has no paths; hide buttons and clear vocab
    els.pathA.style.display = 'none';
    els.pathB.style.display = 'none';
    els.refreshImage.style.display = 'none';
    if (els.resetPaths) els.resetPaths.style.display = 'none';
    // Default prompt text for Lesson 2
    els.prompt.textContent = 'Select an option above to start a discussion with the presenter.';
    // Clear vocab initially - will be populated when a prompt is selected
    els.vocabList.innerHTML = '<li class="placeholder">—</li>';
}

function renderModePrompts() {
    const week = state.data.weeks[state.currentWeekIndex];
    const pres = week.lesson2?.presentations;
    const mode = els.modeSelect.value || (pres?.modes?.[0] || '');
    els.modeSelect.value = mode;
    const prompts = (pres?.promptsByMode?.[mode]) || [];
    // Buttons with descriptive names
    els.modePrompts.innerHTML = prompts.map((p, i) => `<button class="prompt-btn" data-pindex="${i}">${p.name}</button>`).join('');
    els.modePrompts.querySelectorAll('button').forEach((btn, i) => btn.addEventListener('click', () => {
        const selectedPrompt = prompts[i];
        if (!selectedPrompt) return;
        const text = selectedPrompt.text || '';
        els.prompt.textContent = `Ask the presenter: ${text}`;
        // Update optional vocab from the selected prompt's vocab array
        const items = selectedPrompt.vocab || [];
        if (items.length) {
            els.vocabList.innerHTML = items.map(v => `<li><span class="word">${v.word}</span>${v.definition}</li>`).join('');
        } else {
            els.vocabList.innerHTML = '<li class="placeholder">—</li>';
        }
    }));
}


function renderStudents(names) {
    els.studentList.innerHTML = names.map(n => `<li>${n}</li>`).join('');
    // Init turns counters
    state.turns = Object.fromEntries(names.map(n => [n, 0]));
    renderTurns();
}

function renderTurns() {
    els.turnsList.innerHTML = Object.entries(state.turns).map(([n, c]) => `<li>${n}: ${c}</li>`).join('');
}

function exportSession() {
    const week = state.data.weeks[state.currentWeekIndex];
    const payload = {
        timestamp: new Date().toISOString(),
        week: week.id,
        topic: week.topic,
        lesson: state.currentLesson,
        grammarFocus: state.grammarFocus,
        path: state.chosenPath,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `session-week-${week.id}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
}

function openHelpModal() {
    if (els.helpModal) {
        els.helpModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeHelpModal() {
    if (els.helpModal) {
        els.helpModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}


