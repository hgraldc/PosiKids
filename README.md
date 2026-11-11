# PosiKids

Game edukasi berbasis React, TypeScript, dan Vite. Anak bermain sebagai kurir cilik Zaa atau Zee untuk mengenal warna, bentuk, angka, dan nama penerima surat. Tampilan mengacu pada `PosiKids_20261109_200153_0000.pdf` dan menggunakan ilustrasi yang disediakan pemilik proyek.

Proyek dapat dijalankan secara lokal tanpa backend, database, atau API key.

## Persiapan

- Node.js versi **22.12.0 atau lebih baru**, sesuai `package.json`, beserta npm.
- Editor kode, misalnya Visual Studio Code.

Buka folder proyek yang berisi `package.json`, lalu buka terminal pada folder tersebut. Jika proyek masih berbentuk ZIP, ekstrak terlebih dahulu. Berkas `posikids.code-workspace` juga dapat digunakan untuk membuka proyek di VS Code.

Periksa Node.js dan npm:

```sh
node -v
npm -v
```

## Instalasi dan menjalankan aplikasi

Pasang dependensi dengan:

```sh
npm install
```

Koneksi internet diperlukan untuk mengunduh dependensi. Perintah ini membuat folder `node_modules`.

Jalankan server pengembangan:

```sh
npm run dev
```

Buka alamat **Local** yang ditampilkan terminal, biasanya `http://localhost:5173`. Jika port tersebut sedang dipakai, gunakan alamat yang diberikan Vite. Biarkan terminal tetap berjalan dan tekan **Ctrl + C** untuk menghentikannya.

Pada penggunaan berikutnya, cukup jalankan `npm run dev`. Jalankan kembali `npm install` jika dependensi berubah atau folder `node_modules` dihapus.

Gunakan server Vite untuk membuka aplikasi; jangan membuka `index.html` langsung atau menggunakan ekstensi Live Server. Perubahan kode yang disimpan akan dimuat ulang secara otomatis di browser.

### Terminal Windows

Jika PowerShell memblokir `npm.ps1`, gunakan perintah berikut atau pilih profil **Command Prompt** pada terminal VS Code:

```powershell
npm.cmd install
npm.cmd run dev
```

Tidak perlu mengubah kebijakan keamanan PowerShell.

## Perintah proyek

| Perintah | Kegunaan |
| --- | --- |
| `npm install` | Memasang dependensi proyek. |
| `npm run dev` | Menjalankan server pengembangan. |
| `npm test` | Menjalankan tes logika tahap belajar dan puzzle. |
| `npm run build` | Memeriksa TypeScript dan membuat build produksi di `dist`. |
| `npm run preview` | Menampilkan build produksi secara lokal. |

Untuk melihat hasil produksi, jalankan `npm run build` terlebih dahulu, kemudian `npm run preview`. Buka alamat yang ditampilkan terminal, biasanya `http://localhost:4173`.

## Fitur permainan

- Pilihan karakter Zaa dan Zee; kepala pada dialog mengikuti karakter yang dipilih.
- Tiga tahap belajar: Bentuk dan Warna, Angka, serta Membaca. Setiap tahap berisi tiga soal dan terbuka secara berurutan.
- Umpan balik jawaban benar/salah dan kesempatan mencoba lagi tanpa batas waktu atau pengurangan nyawa.
- Kartu tahap menggunakan ikon gembok sesuai ketersediaan tahap, tanpa ikon ceklis tambahan.
- Puzzle 3 × 3 yang mendukung seret-lepas, memilih keping lalu tempatnya, serta navigasi keyboard.
- Halaman Tentang berisi deskripsi permainan, karakter, dan tombol hapus progres.
- Scroll tersedia pada halaman Tentang/deskripsi. Halaman permainan menggunakan tata letak yang menyesuaikan ukuran layar tanpa kontrol scroll.
- Tombol suara untuk mengaktifkan atau mematikan audio. Efek memakai nada sederhana; narasi memakai suara browser. Ketersediaan suara bahasa Indonesia bergantung pada browser dan perangkat.

## Penyimpanan progres

Karakter, progres tahap, pengaturan suara, dan status penyelesaian puzzle disimpan melalui `localStorage` dengan kunci `posikids.save.v1`. Susunan keping puzzle yang sedang dimainkan dimulai ulang saat halaman dimuat ulang.

Progres berlaku pada browser dan alamat situs yang sama. Progres dari situs hosting tidak otomatis terbawa ke localhost. Untuk mengulang permainan dari awal, buka **Tentang → Hapus progres belajar**.

## Struktur proyek

```text
posikids/
├── public/
│   ├── assets/                 # Ilustrasi, latar, kartu, tombol, dan ikon WebP
│   ├── fonts/                  # Font lokal dan berkas lisensi yang tersedia
│   └── favicon.svg
├── src/
│   ├── App.tsx                 # Halaman dan interaksi permainan
│   ├── assets.ts               # Pemetaan nama aset ke public/assets
│   ├── game.ts                 # Soal, jawaban, progres, dan validasi
│   ├── game.test.ts            # Tes logika tahap belajar
│   ├── puzzle.ts               # Aturan penempatan keping puzzle
│   ├── puzzle.test.ts          # Tes logika puzzle
│   ├── main.tsx                # Titik masuk React
│   └── style.css               # Tata letak dan tampilan responsif
├── tools/
│   ├── prepare-imm-assets.py   # Memperbarui data dimensi aset IMM
│   ├── render-reference.ps1    # Merender PDF referensi di Windows
│   └── extract-reference.py    # Mengekstrak materi referensi PDF
├── imm-assets.json             # Dimensi gambar IMM yang dipakai aplikasi
├── DESIGN.md                   # Acuan desain dan keputusan tampilan
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── posikids.code-workspace
└── README.md
```

## Aset dan referensi desain

Seluruh aset IMM untuk aplikasi berada **langsung di `public/assets`**, tanpa subfolder tambahan. `src/assets.ts` memetakan nama aset yang digunakan permainan ke berkas tersebut dan membaca dimensinya dari `imm-assets.json`.

Folder lama **`Aset IMM` dan `public/imm` tidak diperlukan** untuk menjalankan atau membangun aplikasi. Keduanya dapat dihapus setelah aset tersedia di `public/assets`. Tetap simpan **`imm-assets.json`**, karena berkas ini masih digunakan aplikasi.

Tombol beranda, kartu pilihan karakter/tahap, ikon navigasi, dan ilustrasi memakai gambar asli. Latar halaman Membaca menggunakan `latar-dialog-krem-polos.webp`. Font lokal yang digunakan mencakup Gliker, Chau, Marykate, dan Nunito; lisensi Nunito tersedia di `public/fonts/OFL.txt`.

PDF referensi, folder `.reference`, dan alat pengolahan referensi digunakan saat mengerjakan desain, bukan sebagai dependensi saat aplikasi berjalan.

## Mengubah proyek

- **Soal dan aturan progres:** edit `src/game.ts`. Setiap soal harus memiliki tepat satu jawaban benar.
- **Halaman, teks, dan interaksi:** edit `src/App.tsx`.
- **Ukuran, posisi, dan tampilan responsif:** edit `src/style.css`.
- **Gambar:** simpan di `public/assets`, lalu sesuaikan pemetaan pada `src/assets.ts` dan dimensi pada `imm-assets.json` jika diperlukan.

Jika ukuran gambar IMM yang terdaftar berubah, dimensi dapat diperbarui dengan alat opsional berikut. Perintah ini memerlukan Python dan Pillow; keduanya tidak diperlukan untuk menjalankan aplikasi.

```sh
python -m pip install Pillow
python tools/prepare-imm-assets.py
```

Alat tersebut membaca gambar langsung dari `public/assets` berdasarkan nama yang terdaftar pada `imm-assets.json`. Untuk gambar baru, tambahkan namanya ke manifest terlebih dahulu.

Tes logika dan build tidak memverifikasi kesamaan visual dengan PDF. Pemeriksaan posisi, skala, dan jarak elemen dilakukan dengan membandingkan tampilan browser terhadap referensi pada ukuran layar yang sesuai.
