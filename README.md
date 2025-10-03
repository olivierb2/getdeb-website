# deb-dl.org 🚀

**The easiest way to download Debian ISOs** - No confusion, just downloads.

A simple, fast, and beautiful website to help users find and download Debian installation images without the complexity of the official Debian website.

## ✨ Features

- **🎯 Clear CTA** - Prominent download button for the most common use case (Netinstall)
- **📜 Single-page Design** - All downloads in one place, just scroll down
- **🌍 Bilingual** - Full English and French translations with easy language switching
- **🤝 Beginner Assistant** - Interactive guide to help newcomers:
  - Recommends Debian Live GNOME (includes firmware by default)
  - Step-by-step Rufus tutorial with screenshots
  - Boot instructions for different PC brands
- **🔄 Auto-updated Links** - Python parser + GitHub Actions updates ISO links daily
- **📱 Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- **⚡ Pure HTML/CSS/JS** - No build process, no framework bloat
- **🎨 Modern Design** - Clean interface with Debian branding

## 🗂️ Project Structure

```
debian-download/
├── index.html                # Main page (dynamic, loads from JSON)
├── styles.css                # Complete styling (responsive, modern)
├── script.js                 # i18next + dynamic link population
├── translations.json         # All translations (EN/FR)
├── debian-links.json         # Auto-generated ISO download links
├── parse_debian_links.py     # Parser to scrape official Debian mirrors
├── .github/
│   └── workflows/
│       └── update-debian-links.yml  # Daily auto-update workflow
├── images/                   # Screenshots for Rufus tutorial
│   ├── README.md
│   ├── rufus-main.png           (to add)
│   └── rufus-dd-mode.png        (to add)
└── README.md
```

## 🚀 Quick Start

### Local Development

1. **Clone or download** this repository

2. **Generate Debian links** (already done, but to refresh):
   ```bash
   python3 parse_debian_links.py
   ```

3. **Add screenshots** (optional but recommended):
   - Take screenshots of Rufus following `images/README.md`
   - Save them as `rufus-main.png` and `rufus-dd-mode.png` in the `images/` folder

4. **Serve the site** using any HTTP server:

   ```bash
   # Python 3
   python3 -m http.server 8000

   # Node.js (with http-server)
   npx http-server -p 8000

   # PHP
   php -S localhost:8000
   ```

5. **Open your browser** at `http://localhost:8000`

> ⚠️ **Important**: You MUST use a local server (not just open `index.html` directly) because the site loads JSON files via fetch().

## 🔄 Automated Link Updates

The site uses a Python parser to automatically fetch the latest Debian ISO links:

- **Parser**: `parse_debian_links.py` scrapes official Debian mirrors
- **Output**: `debian-links.json` with all current download URLs
- **Automation**: GitHub Actions runs daily at 2 AM UTC
- **Manual run**: `python3 parse_debian_links.py`

### How it works

1. Parser fetches directory listings from `cdimage.debian.org`
2. Extracts `.iso` filenames and builds download URLs
3. Detects current Debian version automatically
4. Generates `debian-links.json` with metadata
5. GitHub Actions commits changes if links updated

## 🌍 Translation System

This site uses **i18next** via CDN for internationalization.

### How it works

- **translations.json** contains all text in EN and FR
- Each translatable element has a `data-i18n="key.path"` attribute
- Language preference is stored in `localStorage`
- Browser language is auto-detected on first visit

### Adding a new language

1. Edit `translations.json` and add a new language object:

```json
{
  "en": { ... },
  "fr": { ... },
  "es": {
    "translation": {
      "hero": {
        "title": "Descarga Debian Fácilmente",
        ...
      }
    }
  }
}
```

2. Add a language button in `index.html`:

```html
<button class="lang-btn" data-lang="es">ES</button>
```

That's it! No build step needed.

## 🎨 Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --debian-red: #D70A53;
    --debian-dark: #A80042;
    --primary: var(--debian-red);
    /* ... */
}
```

### Download Links

Update ISO URLs in `index.html` (search for `cdimage.debian.org`). Links point to official Debian mirrors.

### Sections

To add/remove sections, edit `index.html` and add a new `<section>` with class `download-section`.

## 📦 Deployment

This is a **static site** - deploy anywhere:

### GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Select branch and root folder
4. Done! Your site is at `https://username.github.io/repo-name/`

### Netlify

1. Drag and drop the folder on Netlify
2. Done! Auto-deploys on each push

### Cloudflare Pages / Vercel / Any Static Host

Just upload the files. No configuration needed.

### Custom Domain

For `deb-dl.org`:
1. Configure your DNS with your hosting provider
2. Point to your hosting (GitHub Pages, Netlify, etc.)
3. Enable HTTPS (free with Let's Encrypt on most platforms)

## 🤝 Contributing

Contributions are welcome! Ideas:

- [ ] Add more screenshots for the tutorial
- [ ] Add more languages (DE, ES, IT, PT, etc.)
- [ ] Improve mobile UX
- [ ] Add dark mode toggle
- [ ] Add download statistics (privacy-friendly)
- [ ] Create alternative tutorials (for macOS with Etcher, Linux with dd)
- [ ] Add checksums verification tutorial

## 📝 License

This project is public domain / MIT. Feel free to use, modify, and redistribute.

The Debian logo and name are trademarks of Software in the Public Interest, Inc.

## ⚠️ Disclaimer

**This is an unofficial website.**

All ISO files are hosted on official Debian mirrors. Always verify checksums before installation.

Official Debian website: https://www.debian.org

## 💬 Feedback

If you find this useful or have suggestions, please open an issue or submit a PR!

---

Made with ❤️ for the Debian community
