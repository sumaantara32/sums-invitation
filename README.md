# SUMS Invitation

Undangan digital Bali premium, dibuat terpisah dari SUMS Studio Business Intelligence.

## Sudah tersedia

- Bali Royal, Bali Botanical, Bali Modern.
- Editor visual untuk nama, keluarga, acara, lokasi, cerita, foto, dan hadiah.
- Draft browser via IndexedDB serta ekspor/impor JSON.
- Galeri fullscreen, navigasi keyboard, dan slideshow.
- Tiga instrumental original berbasis Web Audio; upload lagu sendiri atau URL HTTPS.
- Musik dimulai setelah interaksi tamu; dapat dihentikan kapan saja.
- Countdown WITA, kalender ICS, lokasi Maps, sapaan personal `?to=Nama%20Tamu`, dan WhatsApp.
- API publikasi dengan token admin; foto/musik ke R2; undangan dan RSVP ke D1.
- RSVP dilindungi Turnstile, tidak mengembalikan daftar tamu kepada publik.
- Ekspor RSVP CSV melalui autentikasi admin.

## Deployment: tanpa GitHub Actions

Repo ini **tidak memiliki workflow Actions**. Cloudflare Pages mengambil source dan membangun langsung. Tidak menggunakan menit GitHub Actions milik SUMS Studio. Kuota build, Functions, D1, R2, dan Turnstile mengikuti akun Cloudflare; bukan unlimited.

1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
2. Pilih `sumaantara32/sums-invitation`, branch `main`, framework `None`.
3. Build command: `npm run build`; output directory: `dist`; root directory: `/`.
4. Buat database D1 baru, misalnya `sums-invitation`, terapkan `migrations/0001.sql` melalui D1 Console atau Wrangler. Tambahkan binding **DB** pada project Pages.
5. Buat bucket R2 baru, misalnya `sums-invitation-media`. Tambahkan binding **MEDIA**. Bucket tidak perlu dibuat public: media dilayani melalui API project.
6. Tambahkan secret **ADMIN_TOKEN**, nilai acak minimal 32 karakter, melalui Cloudflare dashboard. Jangan memasukkannya ke repo, draft, atau chat.
7. Buat widget Turnstile untuk `undangan.sumsstudio.id` dan hostname pengujian yang dipakai. Tambahkan **TURNSTILE_SECRET** sebagai secret dan **TURNSTILE_SITE_KEY** sebagai environment variable. Redeploy setelah bindings dan secrets berubah.
8. Project → Custom domains → Set up domain → `undangan.sumsstudio.id`. Pertahankan record apex dan email SUMS yang sudah ada.
9. Buka Studio; isi konten, simpan preview. Untuk terbit, buka panel publikasi, masukkan token admin, lalu Terbitkan. Foto/musik lokal diunggah otomatis ke R2.
10. URL tamu: `https://undangan.sumsstudio.id/ayu-darma?to=Nama%20Tamu`.

Semua secrets hanya pada project undangan. Jangan menyalin kredensial production Business Intelligence ke sini.

## Pemeriksaan

```sh
npm run check
npm run build
```

Tidak memerlukan instalasi dependency. Preview statis dapat dibuka melalui hosting preview; di sana publikasi dan RSVP online akan menyatakan backend belum tersedia. RSVP preview tidak dikirim atau disimpan sebagai RSVP nyata.

## Batas versi awal

- Studio merupakan editor untuk operator SUMS, bukan dashboard multi-customer dengan akun individual.
- Cloudflare production, custom domain, D1, R2, dan Turnstile harus dikonfigurasi sebelum menerima customer.
- Preview tidak membuktikan konfigurasi backend production. Uji publish, buka link dari perangkat kedua, RSVP, dan unduh CSV setelah koneksi Cloudflare.
- Nama pasangan, tanggal, dan lokasi adalah contoh. Ornamen merupakan SVG original; foto milik customer diunggah melalui editor.
- Musik bawaan adalah komposisi original sintetis, bukan rekaman gamelan tradisional. Musik upload memerlukan izin pengguna.
- Maksimal 12 foto, 6 acara, media 20 MB per file (musik editor 15 MB), payload undangan 256 KB. Foto editor diperkecil maksimal 1400 px. Ekspor RSVP dibatasi 1000 baris terbaru.
- Belum ada manajemen/hapus media; upload gagal di tengah publikasi dapat meninggalkan file yang perlu dibersihkan dari R2.
- `robots.txt` menonaktifkan indexing selama fase awal. Atur kebijakan indexing sebelum peluncuran publik.
- Jangan simpan token admin di browser bersama. Foto undangan terbit dapat diakses lewat URL media; gunakan foto yang memang boleh dipublikasikan.

Tidak ada deploy per perubahan konten: setelah mesin terpasang, publikasi konten menulis D1/R2 tanpa commit atau build ulang.
