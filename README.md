# Tessly

A self-hosted Tesla dashboard built as a personal homelab project. Pulls real-time data from the Tesla Fleet API and stores it in MySQL for historical tracking.

## Stack

- **Frontend** - React PWA (installable on iPhone)
- **Backend** - Node.js + Express
- **Database** - MySQL 8.0
- **Infrastructure** - Docker Compose on TrueNAS SCALE
- **DNS/SSL** - Cloudflare + Let's Encrypt (auto-renews)

## Features

- Live battery %, range, temperature, and online status
- Battery health tracking over time (based on rated range at 90%+ charge)
- Battery history chart
- Trip logging with Autopilot usage per trip
- Charging session history with kWh and cost tracking
- Monthly stats with charts (miles, cost, AP%)
- Interactive map with trip lines and heatmap
- Vehicle commands (lock, unlock, climate, charging, honk, flash)
- JWT login page
- Auto-refresh every 60 seconds
- Private by default - accessible via local network or WireGuard VPN only

## Architecture

The app runs entirely on a home server (HP EliteDesk running TrueNAS SCALE) behind a private network. Three Docker containers handle the frontend, backend, and database.

- Nginx serves the React PWA and proxies API calls to Node.js
- Node.js polls the Tesla Fleet API every 5 minutes and writes snapshots to MySQL
- MySQL stores all vehicle data including snapshots, trips, and charging sessions

## Privacy

This app is designed to be private. No data leaves your home network except through your own WireGuard VPN. The only public endpoint is the Tesla public key file required for Fleet API registration.

## Vehicle

Built for a 2020 Tesla Model 3 Performance AWD (HW3). Battery health baseline is 315 miles (original EPA range).
