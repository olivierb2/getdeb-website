#!/usr/bin/env python3
"""
Debian ISO Links Parser
Scrapes official Debian mirrors to get the latest ISO download links.
Outputs a JSON file with all current download links.
"""

import json
import re
from datetime import datetime, timezone
from urllib.request import urlopen
from urllib.parse import urljoin
from html.parser import HTMLParser


class DebianLinkParser(HTMLParser):
    """HTML parser to extract .iso files and SHA256SUMS from directory listings"""

    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            for attr, value in attrs:
                if attr == 'href':
                    if value.endswith('.iso') or value == 'SHA256SUMS':
                        self.links.append(value)


def fetch_directory_links(url):
    """Fetch and parse directory listing to get .iso files"""
    try:
        with urlopen(url, timeout=30) as response:
            html = response.read().decode('utf-8')
            parser = DebianLinkParser()
            parser.feed(html)
            return parser.links
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []


def get_latest_version(url):
    """Extract version number from ISO filename"""
    iso_files = fetch_directory_links(url)
    version_pattern = r'debian-(\d+\.\d+\.\d+)'

    for iso in iso_files:
        match = re.search(version_pattern, iso)
        if match:
            return match.group(1)
    return None


def parse_netinstall_links(base_url, arch):
    """Parse netinstall ISO links for a given architecture"""
    url = f"{base_url}{arch}/iso-cd/"
    iso_files = fetch_directory_links(url)

    # Find netinst ISO
    netinst_iso = next((f for f in iso_files if 'netinst.iso' in f and not f.endswith('.txt')), None)

    if netinst_iso:
        return {
            'url': urljoin(url, netinst_iso),
            'checksum': urljoin(url, 'SHA256SUMS'),
            'filename': netinst_iso
        }
    return None


def parse_nonfree_links(base_url, arch):
    """Parse non-free firmware ISO links"""
    url = f"{base_url}{arch}/iso-cd/"
    iso_files = fetch_directory_links(url)

    # Find firmware ISO
    firmware_iso = next((f for f in iso_files if 'firmware-' in f and 'netinst.iso' in f), None)

    if firmware_iso:
        return {
            'url': urljoin(url, firmware_iso),
            'checksum': urljoin(url, 'SHA256SUMS'),
            'filename': firmware_iso
        }
    return None


def parse_live_links(base_url, desktop):
    """Parse live ISO links for a given desktop environment"""
    url = base_url
    iso_files = fetch_directory_links(url)

    # Find live ISO for desktop (stable version, not testing)
    desktop_lower = desktop.lower()
    # Filter out "testing" ISOs and look for stable ones (with version number like 13.x.x or no "testing" in name)
    live_iso = next((f for f in iso_files
                     if desktop_lower in f
                     and f.endswith('.iso')
                     and 'testing' not in f.lower()
                     and 'edu' not in f.lower()), None)

    if live_iso:
        return {
            'url': urljoin(url, live_iso),
            'filename': live_iso
        }
    return None


def parse_live_nonfree_links(base_url, desktop):
    """Parse live + non-free ISO links"""
    url = base_url
    iso_files = fetch_directory_links(url)

    # Find live + nonfree ISO
    desktop_lower = desktop.lower()
    live_nonfree = next((f for f in iso_files if desktop_lower in f and 'nonfree.iso' in f), None)

    if live_nonfree:
        return {
            'url': urljoin(url, live_nonfree),
            'filename': live_nonfree
        }
    return None


def get_testing_codename():
    """Detect the current testing codename by scraping debian.org"""
    # Try to get from weekly builds
    try:
        url = "https://cdimage.debian.org/cdimage/weekly-builds/amd64/iso-cd/"
        with urlopen(url, timeout=10) as response:
            html = response.read().decode('utf-8')
            # Look for testing codename in filenames (e.g., debian-testing-amd64-netinst.iso or debian-forky-*)
            match = re.search(r'debian-(?:testing-|)([a-z]+)-', html.lower())
            if match and match.group(1) not in ['amd64', 'arm64', 'i386']:
                codename = match.group(1).capitalize()
                print(f"✅ Detected testing codename: {codename}")
                return codename
    except Exception as e:
        print(f"⚠️  Could not auto-detect testing codename: {e}")

    # Fallback: return "Forky" as it's the current testing
    return "Forky"


def main():
    """Main parser function"""

    print("🔍 Parsing Debian ISO links...")

    # Base URLs - Debian has integrated firmware by default since Debian 12
    STABLE_BASE = "https://cdimage.debian.org/debian-cd/current/"
    LIVE_BASE = "https://cdimage.debian.org/debian-cd/current-live/amd64/iso-hybrid/"

    # Get current version
    print("📦 Detecting latest Debian version...")
    version = get_latest_version(f"{STABLE_BASE}amd64/iso-cd/")

    if not version:
        print("❌ Could not detect Debian version")
        version = "unknown"
    else:
        print(f"✅ Found version: {version}")

    # Get testing codename
    testing_codename = get_testing_codename()

    # Build JSON structure
    data = {
        "metadata": {
            "version": version,
            "testingCodename": testing_codename,
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "generator": "parse_debian_links.py",
            "notice": "Since Debian 12, firmware is included by default in standard ISOs"
        },
        "netinstall": {},
        "live": {},
        "netboot": {
            "amd64": "https://ftp.debian.org/debian/dists/stable/main/installer-amd64/current/images/netboot/",
            "arm64": "https://ftp.debian.org/debian/dists/stable/main/installer-arm64/current/images/netboot/",
            "armhf": "https://ftp.debian.org/debian/dists/stable/main/installer-armhf/current/images/netboot/",
            "ppc64el": "https://ftp.debian.org/debian/dists/stable/main/installer-ppc64el/current/images/netboot/",
            "riscv64": "https://ftp.debian.org/debian/dists/stable/main/installer-riscv64/current/images/netboot/",
            "s390x": "https://ftp.debian.org/debian/dists/stable/main/installer-s390x/current/images/netboot/"
        },
        "daily": {
            "testing": "https://cdimage.debian.org/cdimage/weekly-builds/amd64/iso-cd/",
            "daily": "https://cdimage.debian.org/cdimage/daily-builds/daily/arch-latest/",
            "testingCodename": testing_codename
        }
    }

    # Parse Netinstall (firmware included by default)
    # Official Debian 13 architectures: amd64, arm64, armhf, ppc64el, riscv64, s390x
    print("\n📀 Parsing Netinstall ISOs (with firmware)...")
    for arch in ['amd64', 'arm64', 'armhf', 'ppc64el', 'riscv64', 's390x']:
        print(f"  - {arch}")
        data['netinstall'][arch] = parse_netinstall_links(STABLE_BASE, arch)

    # Parse Live (firmware included in standard live images now)
    print("\n💿 Parsing Live ISOs (with firmware)...")
    for desktop in ['gnome', 'kde', 'xfce', 'lxde', 'mate', 'cinnamon']:
        print(f"  - {desktop}")
        data['live'][desktop] = parse_live_links(LIVE_BASE, desktop)

    # Write JSON file
    output_file = 'debian-links.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Successfully generated {output_file}")
    print(f"📊 Version: {version}")
    print(f"🕐 Updated: {data['metadata']['lastUpdated']}")

    # Print summary
    total_links = 0
    for category in ['netinstall', 'live']:
        count = sum(1 for v in data[category].values() if v is not None)
        total_links += count
        print(f"   {category}: {count} links")

    print(f"\n🎉 Total: {total_links} download links parsed")


if __name__ == '__main__':
    main()
