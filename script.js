// ===== Global state =====
let debianLinks = null;

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
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
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
        modal.classList.add('active');
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
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
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
const downloadIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';

// ===== Populate Download Links from JSON =====
function populateDownloadLinks() {
    if (!debianLinks) return;

    // Populate Netinstall
    const netinstallGrid = document.getElementById('netinstall-grid');
    if (netinstallGrid) {
        netinstallGrid.innerHTML = '';
        const archDescriptions = {
            amd64: { title: 'AMD64', desc: 'netinstall.amd64Desc', i18nDesc: 'For 64-bit PCs (Intel/AMD)' },
            arm64: { title: 'ARM64', desc: 'netinstall.arm64Desc', i18nDesc: 'For ARM 64-bit devices' }
        };

        for (const [arch, link] of Object.entries(debianLinks.netinstall)) {
            if (!link) continue;
            const desc = archDescriptions[arch];
            const card = document.createElement('div');
            card.className = 'download-card';
            card.innerHTML = `
                <h3>${desc.title}</h3>
                <p class="card-arch" data-i18n="${desc.desc}">${desc.i18nDesc}</p>
                <p class="card-size">~350 MB</p>
                <a href="${link.url}" class="btn btn-secondary">${downloadIconSVG}<span data-i18n="common.download">Download</span></a>
                <a href="${link.checksum}" class="link-checksum" data-i18n="common.checksum">Checksum</a>
            `;
            netinstallGrid.appendChild(card);
        }
    }

    // Populate Live ISOs
    const liveGrid = document.getElementById('live-grid');
    if (liveGrid) {
        liveGrid.innerHTML = '';
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
            card.className = info.featured ? 'download-card featured' : 'download-card';

            let badgeHtml = '';
            if (info.featured) {
                badgeHtml = '<div class="badge" data-i18n="common.recommended">Recommended for beginners</div>';
            }

            card.innerHTML = `
                ${badgeHtml}
                <h3>${info.title} (Live)</h3>
                <p class="card-arch" data-i18n="${info.desc}">${info.i18nDesc}</p>
                <p class="card-size">~2.5-3.5 GB</p>
                <a href="${link.url}" class="btn ${info.featured ? 'btn-primary' : 'btn-secondary'}">${downloadIconSVG}<span data-i18n="common.download">Download</span></a>
            `;
            liveGrid.appendChild(card);
        }
    }

    // Populate Netboot
    const netbootGrid = document.getElementById('netboot-grid');
    if (netbootGrid && debianLinks.netboot) {
        netbootGrid.innerHTML = '';
        const archDescriptions = {
            amd64: { title: 'AMD64', desc: 'netboot.amd64Desc', i18nDesc: 'AMD64 netboot files' },
            arm64: { title: 'ARM64', desc: 'netboot.arm64Desc', i18nDesc: 'ARM64 netboot files' }
        };

        for (const [arch, url] of Object.entries(debianLinks.netboot)) {
            const desc = archDescriptions[arch];
            if (!desc) continue;
            const card = document.createElement('div');
            card.className = 'download-card';
            card.innerHTML = `
                <h3>${desc.title} Netboot</h3>
                <p class="card-arch" data-i18n="${desc.desc}">${desc.i18nDesc}</p>
                <p class="card-size">Browse for files</p>
                <a href="${url}" class="btn btn-secondary" data-i18n="common.browse">Browse</a>
            `;
            netbootGrid.appendChild(card);
        }
    }

    // Populate Daily/Testing
    const dailyGrid = document.getElementById('daily-grid');
    if (dailyGrid && debianLinks.daily) {
        dailyGrid.innerHTML = `
            <div class="download-card testing-card">
                <div class="testing-toggle">
                    <button class="toggle-btn active" data-testing="weekly">
                        <span data-i18n="daily.weekly">Weekly</span>
                    </button>
                    <button class="toggle-btn" data-testing="daily">
                        <span data-i18n="daily.daily">Daily</span>
                    </button>
                </div>
                <h3 id="testing-title" data-i18n="daily.testingTitle">Testing</h3>
                <p class="card-arch" id="testing-desc" data-i18n="daily.weeklyDesc">Weekly testing builds</p>
                <a href="${debianLinks.daily.testing}" id="testing-link" class="btn btn-secondary" data-i18n="common.browse">Browse</a>
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
                toggleButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

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

    // Update hero download button to point to AMD64 netinstall
    const heroDownloadBtn = document.getElementById('hero-download-btn');
    if (heroDownloadBtn && debianLinks.netinstall && debianLinks.netinstall.amd64) {
        heroDownloadBtn.href = debianLinks.netinstall.amd64.url;
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
