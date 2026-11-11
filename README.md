# PosiKids — Menjalankan di VS Code

Kode sumber game PosiKids dengan React, TypeScript, dan Vite, beserta 44 gambar WebP dan font lokal. Tidak membutuhkan backend, database, API key, atau akun hosting untuk dijalankan di komputer sendiri.

## Persiapan

1. Instal **Node.js 22.12 atau lebih baru** dari https://nodejs.org/ (npm ikut terpasang).
2. Instal **Visual Studio Code** dari https://code.visualstudio.com/.
3. Ekstrak ZIP terlebih dahulu.
4. Di VS Code, pilih **File → Open Folder…**, lalu pilih folder `posikids` yang berisi `package.json`. Alternatif: buka berkas `posikids.code-workspace`.
5. Buka **Terminal → New Terminal**. Pastikan lokasi terminal adalah folder `posikids`.

Periksa instalasi:

```sh
node -v
npm -v
```

Node.js `v22.13.0` didukung; minimum yang dibutuhkan adalah `v22.12.0`. Jika perintah belum dikenali setelah instalasi, tutup dan buka kembali VS Code.

## Instal dan jalankan

Jalankan satu kali:

```sh
npm ci
```

Koneksi internet diperlukan untuk mengunduh dependensi. Folder `node_modules` akan dibuat otomatis dan memang tidak disertakan dalam ZIP.

Jalankan game:

```sh
npm run dev
```

Buka alamat **Local** yang muncul di terminal, biasanya **http://localhost:5173**. Jika port sedang dipakai, ikuti alamat lain yang diberikan Vite. Biarkan terminal menyala. Tekan **Ctrl + C** untuk menghentikan server.

Saat membuka proyek lagi, cukup jalankan `npm run dev`. Tidak perlu `npm ci` setiap kali, kecuali dependensi berubah atau `node_modules` dihapus.

**Jangan membuka `index.html` langsung dengan klik dua kali atau memakai Live Server.** Gunakan Vite dengan perintah di atas. Perubahan kode yang disimpan akan diperbarui otomatis di browser.

## Catatan Windows

Jika PowerShell menampilkan `npm.ps1 cannot be loaded` atau `running scripts is disabled`, pilih profil **Command Prompt** dari dropdown terminal VS Code lalu ulangi perintah. Alternatif dari PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev
```

Tidak perlu mengubah pengaturan keamanan PowerShell.

## Tes dan build produksi

```sh
npm test
npm run build
```

`npm test` menjalankan 11 tes logika. Hasil build berada di folder `dist`.

Untuk mencoba hasil build:

```sh
npm run preview
```

Buka alamat yang muncul, biasanya **http://localhost:4173**.

## Struktur kode

```text
posikids/
├── public/
│   ├── assets/           # 44 gambar WebP
│   ├── fonts/            # Font Nunito dan lisensinya
│   └── favicon.svg
├── src/
│   ├── App.tsx           # Layar dan interaksi game
│   ├── game.ts           # Soal, jawaban, progres, validasi
│   ├── game.test.ts      # Tes alur belajar
│   ├── puzzle.ts         # Aturan puzzle
│   ├── puzzle.test.ts    # Tes puzzle
│   ├── main.tsx          # Titik masuk React
│   └── style.css         # Tampilan responsif
├── asset-manifest.json   # Pemetaan nama aset ke sumber asli
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── posikids.code-workspace
└── README.md
```

## Mengubah game

- **Soal dan jawaban:** `src/game.ts`.
- **Layar dan teks antarmuka:** `src/App.tsx`.
- **Warna dan tata letak:** `src/style.css`.
- **Gambar:** `public/assets/`. Ganti memakai nama/format yang sama atau sesuaikan pemanggil pada kode.
- Setelah mengubah soal, jalankan tes dan build. Setiap soal harus memiliki tepat satu jawaban benar.

## Perilaku permainan

- Dua karakter: Zaa dan Zee.
- Tiga tahap belajar, masing-masing tiga soal, dibuka berurutan.
- Percobaan ulang tanpa batas waktu dan tanpa pengurangan nyawa.
- Progres tersimpan di browser/perangkat yang sama pada `localStorage`, kunci `posikids.save.v1`.
- Progres dari website hosting tidak otomatis terbawa ke localhost karena alamat situs berbeda.
- Reset melalui **Tentang → Hapus progres belajar**.
- Puzzle 3×3 mendukung drag, pilih-keping/lalu-slot, serta keyboard. Susunan dimulai ulang saat reload; tanda pernah selesai tetap tersimpan.
- Audio rekaman belum tersedia. Efek memakai nada sederhana; narasi memakai suara browser bila didukung. Dukungan bahasa Indonesia tergantung browser/perangkat.

## Status verifikasi

Versi awal telah lulus build produksi, 11 tes logika, dan pemeriksaan render kode sembilan layar. Uji visual browser serta perangkat nyata masih perlu dilakukan.

Gambar berasal dari aset yang disediakan pemilik proyek. Font Nunito memakai SIL Open Font License; lihat `public/fonts/OFL.txt`.

## Kompatibilitas Node

Persyaratan Node 24 sudah dihapus. Minimum Node 22.12.0; instalasi, 11 tes logika, dan build produksi telah diverifikasi menggunakan Node 22.13.0. `.nvmrc` berisi `22` sebagai pilihan opsional untuk pengguna nvm.
