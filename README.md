# Unofficial Debian Download Website 🐧

**The easiest way to download Debian ISOs** - No confusion, just downloads.

A simplified, user-friendly website to download Debian ISOs without navigating the maze of the official Debian website.

🔗 **Live Site:** [deb-dl.org](https://deb-dl.org) | 🔗 **GitHub:** [github.com/obitwo/debian-download](https://github.com/obitwo/debian-download)

![Debian Logo](https://www.debian.org/logos/openlogo-nd.svg)

---

## 🎯 Motivation

As a long-time Debian user (since the early days!), I've always been frustrated by how difficult it is to find the right ISO on the official Debian website.

**The problem?** Trying to find PXE network boot files, a specific live ISO, or just the basic netinstall image shouldn't require clicking through endless directory listings on multiple mirror sites. Yet that's exactly what we've been doing for years.

**Common frustrations:**
- 😤 Multiple mirror sites with confusing directory structures
- 🤯 Hard to find firmware-included images
- 🔍 PXE/netboot files buried 5 levels deep in subdirectories
- ❓ No clear distinction between stable, testing, and daily builds
- 🚫 Beginners get completely lost trying to choose the right ISO

At 2 AM, when you need that PXE netboot file to deploy a server, you shouldn't have to navigate through:
```
/debian/dists/stable/main/installer-amd64/current/images/netboot/
```

You should just... click a button.

**This website solves that.**

---

## ✨ Features

### Download Types
- **Netinstall Images** - Minimal installation for all architectures (~350 MB)
- **Live Images** - Try Debian without installing (GNOME, KDE, Xfce, LXDE, MATE, Cinnamon)
- **Network Boot (PXE)** - Direct links to netboot directories
- **Testing Builds** - Weekly and daily development builds

### Architecture Support
Official Debian 13 architectures:
- AMD64 (64-bit PC) - Most common
- ARM64 - Modern ARM devices
- ARMHF - Older ARM devices
- PPC64EL - IBM POWER systems
- RISC-V 64 - RISC-V processors
- S390X - IBM mainframes

### User Experience
- 🎯 **One-page design** - All downloads visible with one scroll
- 🔧 **Architecture selector** - Switch between platforms instantly
- 🌍 **Bilingual** - Full English and French translations
- 🤝 **Beginner assistant** - Step-by-step guide with Rufus tutorial
- 📱 **Fully responsive** - Works on all devices
- ⚡ **Fast & lightweight** - Pure HTML/CSS/JS, no bloat

### Technical Features
- 🤖 **Auto-updating** - GitHub Actions fetches latest ISOs daily
- 🔗 **Direct links** - No more directory navigation
- ✅ **Checksum links** - Always verify your downloads
- 🎨 **Modern UI** - Built with Tailwind CSS
- 🌐 **i18next** - Professional translation system

---

## 🚀 How It Works

### Architecture

```
┌─────────────────────────────────────────────┐
│  index.html                                  │
│  ├── Hero section (Netinstall)              │
│  ├── Live ISOs section                      │
│  ├── Network Boot section                   │
│  ├── Testing/Daily builds section           │
│  └── Help modal (3-step assistant)          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  script.js                                   │
│  ├── Fetches debian-links.json              │
│  ├── Populates cards dynamically            │
│  ├── Handles i18next translations           │
│  ├── Architecture selector                  │
│  └── Modal/assistant logic                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  debian-links.json (auto-generated)         │
│  ├── Netinstall URLs (6 architectures)      │
│  ├── Live ISO URLs (6 desktops)             │
│  ├── Netboot directories                    │
│  └── Testing/daily build URLs               │
└─────────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────────┐
│  parse_debian_links.py                      │
│  ├── Scrapes cdimage.debian.org             │
│  ├── Parses HTML directory listings         │
│  ├── Extracts ISO filenames                 │
│  ├── Builds download URLs                   │
│  └── Generates debian-links.json            │
└─────────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────────┐
│  GitHub Actions                              │
│  └── Runs parser daily at 2 AM UTC          │
└─────────────────────────────────────────────┘
```

### The Parser

`parse_debian_links.py` is a Python script that:
1. Fetches HTML from official Debian mirrors (cdimage.debian.org)
2. Parses directory listings to find `.iso` files
3. Detects current Debian version automatically
4. Extracts URLs for all architectures and desktop environments
5. Generates `debian-links.json` with metadata and checksums

**Run it manually:**
```bash
python3 parse_debian_links.py
```

### GitHub Actions Automation

Every day at 2 AM UTC:
1. GitHub Action triggers
2. Runs `parse_debian_links.py`
3. Commits updated `debian-links.json` if changes detected
4. Pushes to repository
5. Website auto-updates (if using GitHub Pages/Netlify/etc.)

---

## 📦 Quick Start

### Prerequisites
- Python 3.7+ (for parser only)
- Any web server (or just `python -m http.server`)

### Local Development

```bash
# Clone the repository
git clone https://github.com/obitwo/debian-download.git
cd debian-download

# Generate latest Debian links (optional, already included)
python3 parse_debian_links.py

# Start a local web server
python3 -m http.server 8000

# Open browser at http://localhost:8000
```

### Project Structure

```
debian-download/
├── index.html                      # Main page (Tailwind CSS)
├── script.js                       # Frontend logic
├── translations.json               # EN/FR translations
├── parse_debian_links.py           # Link scraper
├── debian-links.json               # Generated ISO links
├── .github/
│   └── workflows/
│       └── update-debian-links.yml # Daily automation
└── README.md                       # This file
```

---

## 🌍 Adding Translations

The site uses [i18next](https://www.i18next.com/) for internationalization.

### Add a New Language

1. **Edit `translations.json`:**
```json
{
  "en": { "translation": { ... } },
  "fr": { "translation": { ... } },
  "de": {
    "translation": {
      "hero": {
        "title": "Debian einfach herunterladen"
      }
    }
  }
}
```

2. **Add language button in `index.html`:**
```html
<button class="lang-btn ..." data-lang="de">DE</button>
```

3. **Update `script.js` resources:**
```javascript
resources: {
    en: translations.en,
    fr: translations.fr,
    de: translations.de
}
```

That's it! No build step needed.

---

## 📦 Deployment

This is a **static site** - deploy anywhere:

### GitHub Pages
1. Push to GitHub
2. Settings → Pages → Select branch
3. Done! `https://yourusername.github.io/debian-download/`

### Netlify / Vercel / Cloudflare Pages
1. Connect your GitHub repo
2. Auto-deploys on every push
3. Free HTTPS included

### Custom Domain
1. Configure DNS to point to your host
2. Enable HTTPS (free with Let's Encrypt)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ideas for Contributions
- 🌐 **Add translations** - German, Spanish, Italian, Portuguese, etc.
- 🎨 **UI improvements** - Dark mode, better mobile UX
- 📸 **Add screenshots** - Rufus tutorial images
- 📝 **Documentation** - Additional guides (macOS, Linux)
- 🐛 **Bug reports** - Found an issue? Open an issue!
- 💡 **Feature requests** - Have an idea? Let's discuss!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 👤 About the Author

**Obitwo** - Debian enthusiast since the early days 🐧

I've been using Debian for as long as I can remember. From my first install on ancient hardware to running production servers today, Debian has always been my rock-solid choice.

**Why I love Debian:**
- 🛡️ **Stability** - It just works, for years
- 🎯 **Philosophy** - Free software done right
- 🌍 **Community** - The best in open source
- ⚙️ **Versatility** - From Raspberry Pi to mainframes

But let's be real: **downloading the right ISO shouldn't require a PhD in directory navigation.**

This website is my love letter to Debian - making it more accessible to everyone, from curious beginners to sysadmins searching for that elusive PXE netboot.tar.gz at 2 AM (we've all been there).

**If you're a Debian fan like me**, you understand. Let's make Debian easier for the next generation.

🚀 **Long live Debian! Long live free software!**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

**Important:** This is an **unofficial** project. Debian® is a registered trademark of Software in the Public Interest, Inc. All Debian logos and trademarks belong to their respective owners.

---

## 🙏 Acknowledgments

- **Debian Project** - For 30+ years of incredible work
- **Debian CDImage Team** - For maintaining the mirrors
- **Tailwind CSS** - For the beautiful CSS framework
- **i18next** - For the translation library
- **GitHub** - For free hosting and Actions

---

## 📧 Contact & Links

- 🌐 **Website:** [deb-dl.org](https://deb-dl.org)
- 🐙 **GitHub:** [github.com/obitwo/debian-download](https://github.com/obitwo/debian-download)
- 🐛 **Issues:** [Report a bug](https://github.com/obitwo/debian-download/issues)
- 💬 **Discussions:** [Share ideas](https://github.com/obitwo/debian-download/discussions)

---

<div align="center">

**Made with ❤️ for the Debian community by [Obitwo](https://github.com/obitwo)**

*Disclaimer: This is an unofficial project and is not affiliated with or endorsed by the Debian Project.*

⭐ **If you find this useful, please star the repo!**

</div>
