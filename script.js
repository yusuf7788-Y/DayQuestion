import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment, getDoc, setDoc, runTransaction, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const commentInput = document.getElementById('comment-input');
const sendBtn = document.getElementById('send-btn');
const commentsList = document.getElementById('comments-list');
const inputContainer = document.getElementById('input-container');
const lockMessage = document.getElementById('lock-message');
const timerElement = document.getElementById('timer');
const topicTitle = document.getElementById('daily-topic');
const topicImageContainer = document.getElementById('topic-image-container');

// State
let userIp = null;
let currentLang = 'tr';
let lastTopics = []; // Fixed: declared globally to avoid ReferenceError in modules

function formatDate(date) {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

let VIRTUAL_TODAY = localStorage.getItem('dq_virtual_date') || formatDate(new Date()); // YYYY-MM-DD
const TODAY_STR = VIRTUAL_TODAY; // Alias for legacy code support

// Translation Dictionary
const translations = {
    tr: {
        topicLabel: "Günün konusu:",
        loading: "Yükleniyor...",
        timerLabel: "Kalan Süre:",
        inputPlaceholder: "Yorumunu yap",
        sendBtnAlt: "Gönder",
        lockMessage: "Bugünlük hakkını kullandın. Yarın görüşürüz!",
        commentsTitle: "Yorumlar:",
        noComments: "Henüz yorum yok.",
        anonUser: "anonim",
        copySuccess: "Mail kopyalandı",
        welcomeTitle: "Hoşgeldin!",
        welcomeText: "Yorum yapabilmek için bir takma ad belirle.",
        usernamePlaceholder: "Kullanıcı Adı",
        continueBtn: "Devam Et",
        welcomeMsg: "Hoşgeldin ",
        minCharError: "En az 3 karakter giriniz.",
        connWaiting: "Bağlantı bekleniyor...",
        postSuccess: "Yorum gönderildi!",
        postError: "Hata oluştu.",
        confirmDelete: " yorumu silmek istiyor musunuz?",
        deleteSuccess: "Silme işlemi tamam.",
        dayPrefix: "Gün ",
        feedbackLabel: "Geri bildirim sağlayın:",
        adminTitle: "Yeni Soru Ekle",
        adminTrPlaceholder: "Soru Başlığı (Türkçe)",
        adminEnPlaceholder: "Question Title (English)",
        adminImgPlaceholder: "Resim URL (https://...)",
        cancel: "İPTAL",
        save: "KAYDET"
    },
    en: {
        topicLabel: "Today's topic:",
        loading: "Loading...",
        timerLabel: "Time Left:",
        inputPlaceholder: "Make your comment",
        sendBtnAlt: "Send",
        lockMessage: "You used your daily right. See you tomorrow!",
        commentsTitle: "Comments:",
        noComments: "No comments yet.",
        anonUser: "anonymous",
        copySuccess: "Email copied",
        welcomeTitle: "Welcome!",
        welcomeText: "Set a nickname to be able to comment.",
        usernamePlaceholder: "Username",
        continueBtn: "Continue",
        welcomeMsg: "Welcome ",
        minCharError: "Enter at least 3 characters.",
        connWaiting: "Waiting for connection...",
        postSuccess: "Comment posted!",
        postError: "An error occurred.",
        confirmDelete: " comments?",
        deleteSuccess: "Deletion complete.",
        dayPrefix: "Day ",
        feedbackLabel: "Give feedback:",
        adminTitle: "Add New Topic",
        adminTrPlaceholder: "Topic Title (Turkish)",
        adminEnPlaceholder: "Topic Title (English)",
        adminImgPlaceholder: "Image URL (https://...)",
        cancel: "CANCEL",
        save: "SAVE"
    }
};

function applyTranslations() {
    const t = translations[currentLang];

    // Header
    const topicLabelEl = document.querySelector('.topic-label');
    if (topicLabelEl) topicLabelEl.textContent = t.topicLabel;

    // Countdown - preserve timer content and re-acquire reference
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        const currentTime = document.getElementById('timer')?.textContent || '--:--:--';
        countdownEl.innerHTML = `${t.timerLabel} <span id="timer">${currentTime}</span>`;
    }

    // Input
    if (commentInput) commentInput.placeholder = t.inputPlaceholder;

    // Lock Message
    if (lockMessage) {
        lockMessage.innerHTML = `<i class="fa-solid fa-lock"></i> ${t.lockMessage}`;
    }

    // Comments
    const commentsTitleEl = document.querySelector('.comments-title');
    if (commentsTitleEl) commentsTitleEl.textContent = t.commentsTitle;

    // Modals
    const modalTitle = document.querySelector('#username-modal h2');
    const modalP = document.querySelector('#username-modal p');
    if (modalTitle) modalTitle.textContent = t.welcomeTitle;
    if (modalP) modalP.textContent = t.welcomeText;
    if (usernameInput) usernameInput.placeholder = t.usernamePlaceholder;
    if (saveUsernameBtn) saveUsernameBtn.textContent = t.continueBtn;

    // Flag Update
    const flagImg = currentLang === 'tr' ? 'https://flagcdn.com/w40/tr.png' : 'https://flagcdn.com/w40/us.png';
    const currentLangBtn = document.getElementById('current-lang-btn');
    if (currentLangBtn) {
        const img = currentLangBtn.querySelector('img');
        if (img) img.src = flagImg;
    }

    // Feedback Text
    const feedbackLabelEl = document.querySelector('.feedback-corner span');
    if (feedbackLabelEl) feedbackLabelEl.textContent = t.feedbackLabel;

    // Admin Modal
    const adminModalTitle = document.getElementById('admin-modal-title');
    if (adminModalTitle) adminModalTitle.textContent = t.adminTitle;

    const trInput = document.getElementById('new-topic-title-tr');
    if (trInput) trInput.placeholder = t.adminTrPlaceholder;

    const enInput = document.getElementById('new-topic-title-en');
    if (enInput) enInput.placeholder = t.adminEnPlaceholder;

    const imgInput = document.getElementById('new-topic-image');
    if (imgInput) imgInput.placeholder = t.adminImgPlaceholder;

    const cancelBtn = document.getElementById('close-topic-modal-btn');
    if (cancelBtn) cancelBtn.textContent = t.cancel;

    const saveBtnModal = document.getElementById('save-topic-db-btn');
    if (saveBtnModal) saveBtnModal.textContent = t.save;

    // Browser Lang Attribute
    document.documentElement.lang = currentLang;
}

// --- Toast Notification ---
const toastElement = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
let toastTimeout;

function showToast(message, type = 'info') {
    let icon = toastElement.querySelector('i');
    if (!icon) {
        icon = document.createElement('i');
        toastElement.prepend(icon);
    }
    toastMessage.textContent = message;
    toastElement.className = `toast show ${type}`;
    icon.className = 'fa-solid';
    if (type === 'success') icon.classList.add('fa-check');
    else if (type === 'error') icon.classList.add('fa-exclamation-circle');
    else icon.classList.add('fa-info-circle');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

// --- Email Copy ---
window.copyEmail = (email) => {
    navigator.clipboard.writeText(email).then(() => {
        showToast(translations[currentLang].copySuccess, 'success');
    }).catch(err => {
        console.error('Copy failed', err);
    });
};

// Get User IP & Country
async function getIp() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        currentLang = (data.country_code === 'TR') ? 'tr' : 'en';
        applyTranslations();
        return data.ip;
    } catch (e) {
        console.warn("Geo/IP Fallback used");
        let localIp = localStorage.getItem('mock_ip');
        if (!localIp) {
            localIp = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('mock_ip', localIp);
        }
        applyTranslations();
        return localIp;
    }
}

function updateUserDisplay() {
    const userTag = document.getElementById('user-tag');
    if (!userTag) return;

    let displayId = localStorage.getItem('dq_display_id');
    if (!displayId) {
        displayId = Math.random().toString(36).substr(2, 8).toUpperCase();
        localStorage.setItem('dq_display_id', displayId);
    }

    const name = currentUsername || (currentLang === 'tr' ? 'Misafir' : 'Guest');
    userTag.innerHTML = `
        <span class="username">${name}</span>
        <span class="user-id">${displayId}</span>
    `;
}

// Fetch Daily Topic
async function loadDailyTopic(dateStr = VIRTUAL_TODAY) {
    try {
        const topicRef = doc(db, "topics", dateStr);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
            const data = topicSnap.data();
            console.log("Topic Data Fetched:", data);
            const title = data['title_' + currentLang] || data.title;
            topicTitle.textContent = `“${title}”`;
            topicTitle.classList.remove('skeleton-text');
            if (data.image) {
                topicImageContainer.style.display = 'block';
                topicImageContainer.innerHTML = `<img src="${data.image}" class="topic-image" alt="Günün Konusu Resmi">`;
            } else {
                topicImageContainer.style.display = 'none';
                topicImageContainer.innerHTML = '';
            }
        } else {
            topicTitle.textContent = currentLang === 'tr' ? "Bu tarihte konu yok." : "No topic for this date.";
            topicImageContainer.style.display = 'none';
        }
    } catch (e) {
        console.error("Konu yüklenirken hata:", e);
    }
}

// Timer
function startTimer() {
    function update() {
        const timerEl = document.getElementById('timer');
        if (!timerEl) return;
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow - now;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        timerEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    setInterval(update, 1000);
    update();
}

// Check User Permission
async function checkUserStatus(ip) {
    if (!ip) return;
    const lastPostDate = localStorage.getItem('last_post_date');
    if (lastPostDate === TODAY_STR) {
        lockInput();
        return;
    }
    const userRef = doc(db, "users", ip);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.lastPostDate === TODAY_STR) {
            lockInput();
            localStorage.setItem('last_post_date', TODAY_STR);
        }
    }
}

function lockInput() {
    inputContainer.classList.add('hidden');
    lockMessage.classList.remove('hidden');
}

// Post Comment
async function postComment() {
    const t = translations[currentLang];
    const text = commentInput.value.trim();
    if (!text) return;
    if (!userIp) {
        showToast(t.connWaiting, 'info');
        return;
    }
    if (!currentUsername) {
        if (usernameModal) usernameModal.classList.remove('hidden');
        return;
    }
    lockInput();
    localStorage.setItem('last_post_date', TODAY_STR);
    try {
        await addDoc(collection(db, "comments"), {
            text: text,
            username: currentUsername,
            ip: userIp,
            date: new Date(),
            dayStr: TODAY_STR,
            likes: 0
        });
        await setDoc(doc(db, "users", userIp), { lastPostDate: TODAY_STR }, { merge: true });
        commentInput.value = '';
        showToast(t.postSuccess, 'success');
    } catch (e) {
        console.error(e);
        showToast(t.postError, 'error');
        inputContainer.classList.remove('hidden');
        lockMessage.classList.add('hidden');
        localStorage.removeItem('last_post_date');
    }
}

// Load Comments
function loadComments(dateStr = TODAY_STR) {
    if (window.unsubscribeComments) window.unsubscribeComments();
    const q = query(collection(db, "comments"), orderBy("likes", "desc"));
    window.unsubscribeComments = onSnapshot(q, (snapshot) => {
        commentsList.innerHTML = '';
        const relevantComments = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.dayStr === dateStr) relevantComments.push({ id: doc.id, ...data });
        });
        relevantComments.sort((a, b) => b.likes - a.likes);

        let bestCommentId = null;
        if (relevantComments.length > 0 && relevantComments[0].likes > 0) {
            bestCommentId = relevantComments[0].id;
        }

        if (relevantComments.length === 0) {
            commentsList.innerHTML = `<div style="color:#999; text-align:center; padding:20px;">${translations[currentLang].noComments}</div>`;
        }

        relevantComments.forEach(comment => {
            const isBest = comment.id === bestCommentId;
            commentsList.appendChild(createCommentElement(comment.id, comment, isBest));
        });
    });
}

function createCommentElement(id, data, isBest = false) {
    const div = document.createElement('div');
    div.className = `comment-card ${isBest ? 'best-comment' : ''}`;
    div.dataset.commentId = id;
    const stored = localStorage.getItem(`liked_${id}`);
    const liked = stored === 'true';
    const btnClass = liked ? 'like-btn liked' : 'like-btn';
    const displayUser = data.username ? `@${data.username}` : (currentLang === 'tr' ? '@anonim' : '@anonymous');
    const likesValue = Number(data.likes) || 0;
    div.innerHTML = `
        <input type="checkbox" class="admin-checkbox" data-id="${id}">
        <div class="comment-content">
            <div class="comment-meta">${escapeHtml(displayUser)}</div>
            <div class="comment-text">${parseMentions(data.text)}</div>
        </div>
        <div class="like-container">
            <button class="${btnClass}" onclick="toggleLike('${id}')">
                <i class="${liked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up"></i>
            </button>
            <span class="like-count">${formatCount(likesValue)}</span>
        </div>
    `;
    return div;
}

function formatCount(num) {
    if (num < 0) return 0;
    if (num > 999) return (num / 1000).toFixed(1) + 'K';
    return num;
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseMentions(text) {
    // First escape HTML, then parse mentions
    const escaped = escapeHtml(text);
    // Match @username (letters, numbers, underscores, 3-15 chars)
    return escaped.replace(/@([a-zA-Z0-9_]{3,15})/g, '<span class="mention">@$1</span>');
}

window.toggleLike = async (id) => {
    const commentCard = document.querySelector(`.comment-card[data-comment-id="${id}"]`);
    if (!commentCard) {
        console.error("Comment card not found for id:", id);
        return;
    }

    const likeBtn = commentCard.querySelector('.like-btn');
    const likeIcon = likeBtn?.querySelector('i');
    const likeCountEl = commentCard.querySelector('.like-count');
    if (!likeBtn || !likeIcon || !likeCountEl) {
        console.error("Like elements not found");
        return;
    }

    // Prevent double-click
    if (likeBtn.dataset.processing === 'true') return;
    likeBtn.dataset.processing = 'true';

    const stored = localStorage.getItem(`liked_${id}`);
    const wasLiked = stored === 'true';
    const currentDisplayCount = parseInt(likeCountEl.textContent.replace('K', '000')) || 0;

    // Optimistic UI Update (instant feedback)
    if (wasLiked) {
        likeBtn.classList.remove('liked');
        likeIcon.classList.remove('fa-solid');
        likeIcon.classList.add('fa-regular');
        likeCountEl.textContent = formatCount(Math.max(0, currentDisplayCount - 1));
        localStorage.removeItem(`liked_${id}`);
    } else {
        likeBtn.classList.add('liked');
        likeIcon.classList.remove('fa-regular');
        likeIcon.classList.add('fa-solid');
        likeCountEl.textContent = formatCount(currentDisplayCount + 1);
        localStorage.setItem(`liked_${id}`, 'true');
        // Add pop animation
        likeBtn.classList.add('like-pop');
        setTimeout(() => likeBtn.classList.remove('like-pop'), 300);
    }

    // Database Update using atomic increment
    const commentRef = doc(db, "comments", id);
    try {
        const changeAmount = wasLiked ? -1 : 1;
        await updateDoc(commentRef, {
            likes: increment(changeAmount)
        });
    } catch (e) {
        console.error("Like update failed: ", e);
        // Revert optimistic update on error
        if (wasLiked) {
            likeBtn.classList.add('liked');
            likeIcon.classList.remove('fa-regular');
            likeIcon.classList.add('fa-solid');
            likeCountEl.textContent = formatCount(currentDisplayCount);
            localStorage.setItem(`liked_${id}`, 'true');
        } else {
            likeBtn.classList.remove('liked');
            likeIcon.classList.remove('fa-solid');
            likeIcon.classList.add('fa-regular');
            likeCountEl.textContent = formatCount(currentDisplayCount);
            localStorage.removeItem(`liked_${id}`);
        }
    } finally {
        likeBtn.dataset.processing = 'false';
    }
};

// --- History / Navigation ---
const historyBar = document.getElementById('history-bar');
const menuToggle = document.getElementById('menu-toggle');
const usernameModal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const saveUsernameBtn = document.getElementById('save-username-btn');
let currentUsername = localStorage.getItem('dq_username');
let currentTopicDate = VIRTUAL_TODAY;
let allTopicsFromDb = [];

async function loadHistory() {
    const startDate = new Date(2025, 11, 25);
    const q = query(collection(db, "topics"));

    // Set up a singleton listener
    onSnapshot(q, (snapshot) => {
        allTopicsFromDb = [];
        snapshot.forEach(doc => allTopicsFromDb.push(doc.data()));
        refreshHistoryView();
    });
}

function refreshHistoryView() {
    const startDate = new Date(2025, 11, 25);
    const topics = [];

    let d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const [vYear, vMonth, vDay] = VIRTUAL_TODAY.split('-').map(Number);
    let end = new Date(vYear, vMonth - 1, vDay);

    // Safety check: ensure sequence runs at least once if end is today
    if (end < d) end = new Date(d);

    while (d <= end) {
        const dStr = formatDate(d);
        const existing = allTopicsFromDb.find(t => t.date === dStr);
        if (existing) {
            topics.push(existing);
        } else {
            topics.push({
                date: dStr,
                title: currentLang === 'tr' ? "Modu Kapatıp Yenileyin" : "Refresh After Closing Mode",
                title_en: "Refresh After Closing Mode",
                image: ""
            });
        }
        d.setDate(d.getDate() + 1);
    }

    topics.sort((a, b) => new Date(b.date) - new Date(a.date));
    lastTopics = topics;
    renderHistoryBar(topics, startDate);
}

function renderHistoryBar(topics, startDate) {
    historyBar.innerHTML = '';
    topics.forEach(topic => {
        const tDate = new Date(topic.date);
        const diffTime = Math.abs(tDate - startDate);
        const dayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const card = document.createElement('div');
        card.className = `history-card ${topic.date === currentTopicDate ? 'active' : ''}`;
        card.onclick = () => switchToTopic(topic.date);
        const title = topic['title_' + currentLang] || topic.title;
        card.innerHTML = `
            <div class="card-date">${translations[currentLang].dayPrefix}${dayNumber > 0 ? dayNumber : 1}</div>
            <div class="card-title">${title}</div>
        `;
        historyBar.appendChild(card);
    });
}

async function switchToTopic(dateStr) {
    currentTopicDate = dateStr;
    await loadDailyTopic(dateStr);
    if (dateStr !== VIRTUAL_TODAY) {
        inputContainer.classList.add('hidden');
        lockMessage.classList.add('hidden');
    } else {
        inputContainer.classList.remove('hidden');
        checkUserStatus(userIp);
    }
    loadComments(dateStr);
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        historyBar.classList.toggle('hidden');
    });
}

if (historyBar) {
    historyBar.addEventListener('wheel', (evt) => {
        evt.preventDefault();
        historyBar.scrollLeft += evt.deltaY;
    });
}

function initLangSwitcher() {
    const btn = document.getElementById('current-lang-btn');
    const options = document.getElementById('lang-options');
    const optionItems = document.querySelectorAll('.lang-option');
    if (btn && options) {
        btn.onclick = (e) => {
            e.stopPropagation();
            options.classList.toggle('hidden');
        };
        document.onclick = () => options.classList.add('hidden');
        optionItems.forEach(item => {
            item.onclick = (e) => {
                e.stopPropagation();
                currentLang = item.dataset.lang;
                applyTranslations();
                loadDailyTopic(currentTopicDate);
                refreshHistoryView();
                loadComments(currentTopicDate);
                options.classList.add('hidden');
            };
        });
    }
}

async function init() {
    try {
        startTimer();
        initLangSwitcher();
        userIp = await getIp();

        // Load initial data
        // loadComments doesn't return a Promise, so we call it normally
        loadDailyTopic(VIRTUAL_TODAY).catch(e => console.error(e));
        loadComments(VIRTUAL_TODAY);
        loadHistory().catch(e => console.error(e));

        checkUserStatus(userIp);

        if (sendBtn) {
            sendBtn.addEventListener('click', postComment);
        }
        if (commentInput) {
            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') postComment();
            });
            // Character Counter
            commentInput.addEventListener('input', () => {
                const charCount = document.getElementById('char-count');
                const charCounter = document.querySelector('.char-counter');
                if (charCount && charCounter) {
                    const len = commentInput.value.length;
                    charCount.textContent = len;
                    charCounter.classList.remove('warning', 'limit');
                    if (len >= 140) {
                        charCounter.classList.add('limit');
                    } else if (len >= 120) {
                        charCounter.classList.add('warning');
                    }
                }
            });
        }

        // Share Button
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                const topic = document.getElementById('daily-topic')?.textContent || "Günün Konusu";
                const shareData = {
                    title: 'DayQuestion',
                    text: `${topic}\n\nSen ne düşünüyorsun? Fikrini paylaş!`,
                    url: window.location.href
                };
                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        // Fallback: Copy to clipboard
                        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                        showToast(currentLang === 'tr' ? 'Link kopyalandı!' : 'Link copied!', 'success');
                    }
                } catch (e) {
                    console.log('Share cancelled or failed');
                }
            });
        }


        if (!currentUsername && userIp) {
            try {
                const userRef = doc(db, "users", userIp);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (data.username) {
                        currentUsername = data.username;
                        localStorage.setItem('dq_username', currentUsername);
                    }
                }
            } catch (e) {
                console.error("User verify error:", e);
            }
        }

        updateUserDisplay();
        initTheme();

        if (!currentUsername && usernameModal) {
            usernameModal.classList.remove('hidden');
        }

        initAdmin(); // Separate admin initialization
    } catch (e) {
        console.error("Initialization failed:", e);
    }
}

function initAdmin() {
    const saveUsernameBtn = document.getElementById('save-username-btn');
    const adminDeleteBtn = document.getElementById('admin-delete-btn');
    const adminCloseBtn = document.getElementById('admin-close-btn');
    const adminDateInput = document.getElementById('admin-date-input');

    if (saveUsernameBtn) {
        saveUsernameBtn.addEventListener('click', async () => {
            // Prevent double-click
            if (saveUsernameBtn.disabled) return;
            saveUsernameBtn.disabled = true;
            const originalText = saveUsernameBtn.textContent;
            saveUsernameBtn.textContent = '...';

            const val = usernameInput.value.trim().toLowerCase();
            if (val.length < 3) {
                showToast(translations[currentLang].minCharError, 'error');
                saveUsernameBtn.disabled = false;
                saveUsernameBtn.textContent = originalText;
                return;
            }

            // Check if username is taken
            try {
                const usernameRef = doc(db, "usernames", val);
                const usernameSnap = await getDoc(usernameRef);

                if (usernameSnap.exists()) {
                    // Username already taken
                    showToast(currentLang === 'tr' ? 'Bu kullanıcı adı alınmış!' : 'This username is taken!', 'error');
                    saveUsernameBtn.disabled = false;
                    saveUsernameBtn.textContent = originalText;
                    return;
                }

                // Reserve the username
                await setDoc(usernameRef, {
                    owner: userIp,
                    createdAt: new Date()
                });

                // Save to user profile
                currentUsername = val;
                localStorage.setItem('dq_username', val);
                await setDoc(doc(db, "users", userIp), { username: val }, { merge: true });

                usernameModal.classList.add('hidden');
                updateUserDisplay();
                showToast(translations[currentLang].welcomeMsg + val, 'success');
            } catch (e) {
                console.error("Username check/save failed:", e);
                showToast(currentLang === 'tr' ? 'Bir hata oluştu!' : 'An error occurred!', 'error');
                saveUsernameBtn.disabled = false;
                saveUsernameBtn.textContent = originalText;
            }
        });
    }

    let keySequence = [];
    const secretCode = "GELİŞTİRİCİ ŞİFRESİ";

    document.addEventListener('keydown', (e) => {
        keySequence.push(e.key);
        if (keySequence.length > secretCode.length) keySequence.shift();
        if (keySequence.join('') === secretCode) {
            document.body.classList.toggle('admin-mode');
            const state = document.body.classList.contains('admin-mode') ? "AÇIK" : "KAPALI";
            showToast("Developer Modu: " + state, 'info');
            keySequence = [];
        }
    });

    if (adminDeleteBtn) {
        adminDeleteBtn.addEventListener('click', deleteSelectedComments);
    }

    if (adminCloseBtn) {
        adminCloseBtn.addEventListener('click', () => {
            // Force save current VIRTUAL_TODAY to localStorage
            localStorage.setItem('dq_virtual_date', VIRTUAL_TODAY);
            showToast("Ayarlar Kaydedildi, Hazırlanıyor...", 'success');
            setTimeout(() => {
                location.reload();
            }, 600);
        });
    }

    if (adminDateInput) {
        adminDateInput.value = VIRTUAL_TODAY;
        adminDateInput.addEventListener('change', (e) => {
            const newDate = e.target.value;
            if (newDate) {
                VIRTUAL_TODAY = newDate;
                localStorage.setItem('dq_virtual_date', newDate);
                currentTopicDate = newDate;
                loadDailyTopic(newDate);
                loadComments(newDate);
                refreshHistoryView();
                showToast("Simüle Tarih Güncellendi: " + newDate, 'success');
            }
        });
    }

    // New Topic Modal Logic
    const adminAddTopicBtn = document.getElementById('admin-add-topic-btn');
    const adminTopicModal = document.getElementById('admin-topic-modal');
    const closeTopicModalBtn = document.getElementById('close-topic-modal-btn');
    const saveTopicDbBtn = document.getElementById('save-topic-db-btn');

    if (adminAddTopicBtn && adminTopicModal) {
        adminAddTopicBtn.addEventListener('click', () => {
            document.getElementById('new-topic-date').value = VIRTUAL_TODAY;
            adminTopicModal.classList.remove('hidden');
        });
    }

    if (closeTopicModalBtn && adminTopicModal) {
        closeTopicModalBtn.addEventListener('click', () => {
            adminTopicModal.classList.add('hidden');
        });
    }

    if (saveTopicDbBtn) {
        saveTopicDbBtn.addEventListener('click', async () => {
            const titleTr = document.getElementById('new-topic-title-tr').value.trim();
            const titleEn = document.getElementById('new-topic-title-en').value.trim();
            const image = document.getElementById('new-topic-image').value.trim();
            const date = document.getElementById('new-topic-date').value;

            if (!titleTr || !date) {
                showToast("Başlık ve Tarih zorunludur!", 'error');
                return;
            }

            try {
                await setDoc(doc(db, "topics", date), {
                    title: titleTr, // Default title
                    title_tr: titleTr,
                    title_en: titleEn || titleTr,
                    image: image,
                    date: date
                });
                showToast("Konu Başarıyla Eklendi!", 'success');
                adminTopicModal.classList.add('hidden');
                // Reload data if the added date is what we are viewing
                if (date === currentTopicDate) {
                    loadDailyTopic(date);
                }
                // No need to call loadHistory() as it has an active onSnapshot listener
            } catch (e) {
                console.error("Save topic failed:", e);
                showToast("Hata oluştu!", 'error');
            }
        });
    }
}

async function deleteSelectedComments() {
    const checkboxes = document.querySelectorAll('.admin-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast("Hiçbir yorum seçilmedi.", 'error');
        return;
    }
    if (!confirm(`${checkboxes.length} yorumu silmek istiyor musunuz?`)) return;
    for (const cb of checkboxes) {
        const commentId = cb.dataset.id;
        try {
            await deleteDoc(doc(db, "comments", commentId));
        } catch (e) {
            console.error("Delete failed for", commentId, e);
        }
    }
    showToast("Silme işlemi tamam.", 'success');
}

const themeToggle = document.getElementById('theme-toggle');
const logoImg = document.querySelector('.logo');
const assetTop = document.querySelector('.asset-top-right');
const assetBottom = document.querySelector('.asset-bottom-left');

function initTheme() {
    const savedTheme = localStorage.getItem('dq_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        if (logoImg) logoImg.src = 'logo-d.png';
        if (assetTop) assetTop.src = 'asset1-d.png';
        if (assetBottom) assetBottom.src = 'asset2-d.png';
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dq_theme', isDark ? 'dark' : 'light');
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    if (logoImg) {
        logoImg.src = isDark ? 'logo-d.png' : 'logo.png';
    }
    if (assetTop) {
        assetTop.src = isDark ? 'asset1-d.png' : 'asset1.png';
    }
    if (assetBottom) {
        assetBottom.src = isDark ? 'asset2-d.png' : 'asset2.png';
    }
}

init();
