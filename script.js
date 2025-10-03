// ===== Global state =====
let debianLinks = null;
let currentArch = 'amd64'; // Default architecture

// ===== i18next Initialization =====
document.addEventListener('DOMContentLoaded', function() {
    // Load Debian links JSON
    fetch('/debian-links.json')
        .then(response => response.json())
        .then(data => {
            debianLinks = data;
            populateDownloadLinks();
            console.log(`✅ Loaded Debian ${data.metadata.version} links`);
        })
        .catch(error => {
            console.error('Error loading debian-links.json:', error);
        });

    // Architecture selector
    const archSelect = document.getElementById('arch-select');
    if (archSelect) {
        archSelect.addEventListener('change', function() {
            currentArch = this.value;
            populateDownloadLinks();
        });
    }

    // Initialize i18next
    i18next
        .use(i18nextHttpBackend)
        .init({
            lng: localStorage.getItem('language') || 'en',
            fallbackLng: 'en',
            debug: false,
            backend: {
                loadPath: '/translations.json',
                parse: function(data) {
                    const json = JSON.parse(data);
                    return json[i18next.language].translation;
                }
            }
        }, function(err, t) {
            if (err) return console.error('i18next init error:', err);
            updateContent();
            highlightActiveLanguage();
        });

    // Language switcher
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });

    function changeLanguage(lang) {
        i18next.changeLanguage(lang, function(err, t) {
            if (err) return console.error('Language change error:', err);
            updateContent();
            highlightActiveLanguage();
            localStorage.setItem('language', lang);
        });
    }

    function updateContent() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(function(element) {
            const key = element.getAttribute('data-i18n');
            const translation = i18next.t(key);

            if (element.tagName === 'META') {
                element.setAttribute('content', translation);
            } else if (element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translation);
            } else {
                element.textContent = translation;
            }
        });

        // Update page title
        document.title = i18next.t('meta.title');
    }

    function highlightActiveLanguage() {
        const currentLang = i18next.language;
        langButtons.forEach(btn => {
            if (btn.getAttribute('data-lang') === currentLang) {
                btn.classList.add('bg-debian-red', 'border-debian-red', 'text-white');
                btn.classList.remove('border-gray-200', 'hover:border-debian-red', 'hover:text-debian-red');
            } else {
                btn.classList.remove('bg-debian-red', 'border-debian-red', 'text-white');
                btn.classList.add('border-gray-200', 'hover:border-debian-red', 'hover:text-debian-red');
            }
        });
    }

    // ===== Modal Assistant Management =====
    const modal = document.getElementById('assistantModal');
    const helpBtn = document.getElementById('helpBtn');
    const modalClose = document.getElementById('modalClose');
    const finishBtn = document.getElementById('finishBtn');

    let currentStep = 1;

    // Open modal
    helpBtn.addEventListener('click', function() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        showStep(1);
    });

    // Close modal
    modalClose.addEventListener('click', closeModal);
    finishBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        currentStep = 1;
    }

    // Step navigation
    const nextButtons = document.querySelectorAll('.step-next');
    const prevButtons = document.querySelectorAll('.step-prev');

    nextButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep < 3) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    function showStep(stepNumber) {
        const steps = document.querySelectorAll('.assistant-step');
        steps.forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            if (stepNum === stepNumber) {
                step.classList.remove('hidden');
            } else {
                step.classList.add('hidden');
            }
        });
        currentStep = stepNumber;

        // Scroll to top of modal content
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }

    // ===== Smooth Scroll for Anchor Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only handle internal navigation links (not # alone or external downloads)
            if (href !== '#' && href.length > 1 && !this.hasAttribute('download')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===== Download Link Analytics (Optional) =====
    // You can uncomment and customize this to track downloads
    /*
    document.querySelectorAll('a[href$=".iso"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const fileName = this.href.split('/').pop();
            console.log('Download started:', fileName);
            // Add your analytics tracking here
        });
    });
    */

    // ===== Scroll-based Header Shadow =====
    let lastScroll = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 10) {
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        } else {
            header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
        }

        lastScroll = currentScroll;
    });

    // ===== Console Welcome Message =====
    console.log('%c🎉 Welcome to deb-dl.org!', 'color: #D70A53; font-size: 20px; font-weight: bold;');
    console.log('%cMaking Debian downloads easier, one ISO at a time.', 'color: #6c757d; font-size: 14px;');
    console.log('%cContribute: https://github.com/yourusername/deb-dl', 'color: #2B3E50; font-size: 12px;');
});

// ===== Download Icon SVG =====
const downloadIconSVG = '<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';

// ===== Populate Download Links from JSON =====
function populateDownloadLinks() {
    if (!debianLinks) return;

    // Populate Hero Netinstall Card
    const netinstallCard = document.getElementById('netinstall-card');
    if (netinstallCard && debianLinks.netinstall[currentArch]) {
        const link = debianLinks.netinstall[currentArch];

        if (link) {
            netinstallCard.innerHTML = `
                <h3 class="text-3xl font-bold text-debian-red mb-3">Netinstall ${currentArch.toUpperCase()}</h3>
                <p class="text-gray-500 mb-2">Minimal installation image</p>
                <p class="text-xl font-semibold text-debian-red mb-6">~350 MB</p>
                <a href="${link.url}" class="inline-flex items-center gap-2 bg-debian-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-debian-dark transition-all hover:scale-105 mb-3">
                    ${downloadIconSVG}
                    <span data-i18n="common.download">Download</span>
                </a>
                <br>
                <a href="${link.checksum}" class="inline-block text-gray-500 text-sm hover:text-debian-red hover:underline transition-colors" data-i18n="common.checksum">Checksum</a>
            `;
        } else {
            netinstallCard.innerHTML = '<p class="text-gray-500">No netinstall image available for this architecture.</p>';
        }
    }

    // Populate Live ISOs (only available for amd64)
    const liveGrid = document.getElementById('live-grid');
    if (liveGrid) {
        liveGrid.innerHTML = '';

        // Live ISOs are only available for amd64
        if (currentArch !== 'amd64') {
            const archName = currentArch.toUpperCase();
            liveGrid.innerHTML = `
                <div class="col-span-full bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
                    <h3 class="text-2xl font-bold text-gray-900 mb-3">Live Images Not Available</h3>
                    <p class="text-gray-600">
                        Live images are only available for AMD64 architecture.<br>
                        For <strong>${archName}</strong>, please use the Netinstall image above.
                    </p>
                </div>
            `;
        } else {
            const desktopInfo = {
                gnome: { title: 'GNOME', desc: 'live.gnomeDesc', i18nDesc: 'Modern desktop environment', featured: true },
                kde: { title: 'KDE', desc: 'live.kdeDesc', i18nDesc: 'Feature-rich desktop' },
                xfce: { title: 'Xfce', desc: 'live.xfceDesc', i18nDesc: 'Lightweight & fast' },
                lxde: { title: 'LXDE', desc: 'live.lxdeDesc', i18nDesc: 'Ultra-lightweight desktop' },
                mate: { title: 'MATE', desc: 'live.mateDesc', i18nDesc: 'Traditional desktop' },
                cinnamon: { title: 'Cinnamon', desc: 'live.cinnamonDesc', i18nDesc: 'Modern & elegant' }
            };

            for (const [desktop, link] of Object.entries(debianLinks.live)) {
                if (!link) continue;
                const info = desktopInfo[desktop];
                if (!info) continue;

                const card = document.createElement('div');
                card.className = info.featured
                    ? 'relative bg-white border-2 border-debian-red rounded-xl p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1'
                    : 'relative bg-white border-2 border-gray-200 rounded-xl p-8 text-center hover:border-debian-red hover:shadow-xl transition-all hover:-translate-y-1';

                let badgeHtml = '';
                if (info.featured) {
                    badgeHtml = '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-debian-red text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap" data-i18n="common.recommended">Recommended for beginners</div>';
                }

                card.innerHTML = `
                    ${badgeHtml}
                    <h3 class="text-2xl font-bold text-gray-900 mb-3">${info.title} (Live)</h3>
                    <p class="text-gray-600 mb-2" data-i18n="${info.desc}">${info.i18nDesc}</p>
                    <p class="text-lg font-semibold text-debian-red mb-6">~2.5-3.5 GB</p>
                    <a href="${link.url}" class="inline-flex items-center gap-2 ${info.featured ? 'bg-debian-red hover:bg-debian-dark' : 'bg-gray-800 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors w-full justify-center">
                        ${downloadIconSVG}
                        <span data-i18n="common.download">Download</span>
                    </a>
                `;
                liveGrid.appendChild(card);
            }
        }
    }

    // Populate Netboot
    const netbootGrid = document.getElementById('netboot-grid');
    if (netbootGrid && debianLinks.netboot[currentArch]) {
        netbootGrid.innerHTML = '';
        const url = debianLinks.netboot[currentArch];

        const card = document.createElement('div');
        card.className = 'bg-white border-2 border-gray-200 rounded-xl p-8 text-center hover:border-debian-red hover:shadow-xl transition-all hover:-translate-y-1';
        card.innerHTML = `
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Netboot ${currentArch.toUpperCase()}</h3>
            <p class="text-gray-600 mb-2">PXE network boot files</p>
            <p class="text-lg font-semibold text-debian-red mb-6">Browse for files</p>
            <a href="${url}" class="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full justify-center" data-i18n="common.browse">Browse</a>
        `;
        netbootGrid.appendChild(card);
    }

    // Populate Daily/Testing
    const dailyGrid = document.getElementById('daily-grid');
    if (dailyGrid && debianLinks.daily) {
        dailyGrid.innerHTML = `
            <div class="bg-white border-2 border-gray-200 rounded-xl p-8 text-center">
                <div class="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg justify-center">
                    <button class="toggle-btn flex-1 px-6 py-2 rounded-lg font-semibold text-sm transition-all bg-debian-red text-white" data-testing="weekly">
                        <span data-i18n="daily.weekly">Weekly</span>
                    </button>
                    <button class="toggle-btn flex-1 px-6 py-2 rounded-lg font-semibold text-sm transition-all hover:bg-debian-red/10" data-testing="daily">
                        <span data-i18n="daily.daily">Daily</span>
                    </button>
                </div>
                <h3 id="testing-title" class="text-2xl font-bold text-gray-900 mb-3" data-i18n="daily.testingTitle">Testing</h3>
                <p class="text-gray-600 mb-6" id="testing-desc" data-i18n="daily.weeklyDesc">Weekly testing builds</p>
                <a href="${debianLinks.daily.testing}" id="testing-link" class="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full justify-center" data-i18n="common.browse">Browse</a>
            </div>
        `;

        // Setup toggle functionality
        const toggleButtons = dailyGrid.querySelectorAll('.toggle-btn');
        const testingTitle = dailyGrid.querySelector('#testing-title');
        const testingDesc = dailyGrid.querySelector('#testing-desc');
        const testingLink = dailyGrid.querySelector('#testing-link');

        toggleButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const mode = this.getAttribute('data-testing');

                // Update active state
                toggleButtons.forEach(b => {
                    b.classList.remove('bg-debian-red', 'text-white');
                    b.classList.add('hover:bg-debian-red/10');
                });
                this.classList.add('bg-debian-red', 'text-white');
                this.classList.remove('hover:bg-debian-red/10');

                // Update content based on mode
                if (mode === 'weekly') {
                    testingDesc.setAttribute('data-i18n', 'daily.weeklyDesc');
                    testingDesc.textContent = i18next.t('daily.weeklyDesc');
                    testingLink.href = debianLinks.daily.testing;
                } else {
                    testingDesc.setAttribute('data-i18n', 'daily.dailyDesc');
                    testingDesc.textContent = i18next.t('daily.dailyDesc');
                    testingLink.href = debianLinks.daily.daily;
                }
            });
        });
    }

    // Update hero download button to point to current arch netinstall
    const heroDownloadBtn = document.getElementById('hero-download-btn');
    if (heroDownloadBtn && debianLinks.netinstall && debianLinks.netinstall[currentArch]) {
        heroDownloadBtn.href = debianLinks.netinstall[currentArch].url;
    }

    // Update assistant download link
    const assistantLink = document.getElementById('assistant-download-link');
    if (assistantLink && debianLinks.live && debianLinks.live.gnome) {
        assistantLink.href = debianLinks.live.gnome.url;
    }

    // Re-translate dynamically generated content
    if (typeof i18next !== 'undefined' && i18next.isInitialized) {
        document.querySelectorAll('[data-i18n]').forEach(function(element) {
            const key = element.getAttribute('data-i18n');
            const translation = i18next.t(key);
            if (element.tagName === 'META') {
                element.setAttribute('content', translation);
            } else if (element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translation);
            } else {
                element.textContent = translation;
            }
        });
    }
}
