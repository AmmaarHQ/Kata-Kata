// =====================================================================
// 1. KODE ASLI LAMA KAMU (TETAP UTUH & TERPISAH DI ATAS)
// =====================================================================

// Fungsi untuk membuka URL
function bukaLink(url) {
    if (url && url !== '') {
        window.location.href = url;
    } else {
        alert('URL atau nama file belum dimasukkan!');
    }
}

// Fungsi untuk memindahkan ruang
function pindahRuang(ruangTujuan) {
    let ruang1 = document.getElementById('ruang1');
    let ruang2 = document.getElementById('ruang2');

    if (ruangTujuan === 1) {
        ruang1.style.display = 'grid';
        ruang2.style.display = 'none';
    } else if (ruangTujuan === 2) {
        ruang1.style.display = 'none';
        ruang2.style.display = 'grid';
    }
}


// =====================================================================
// 2. KODE BARU SUPABASE DATABASE (DENGAN SANDI & REALTIME)
// =====================================================================

const SUPABASE_URL = "https://ewtriokijmrcypnydxpq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dHJpb2tpam1yY3lwbnlkeHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNTI3MjIsImV4cCI6MjA5ODgyODcyMn0.YcPRv7pnFryMLOCYQaY-EtVreX59itJJWYKKZ0z2-_g"; 

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TOTAL_KOTAK = 20;
let kotakTerkunciDariCloud = [];
const KATA_SANDI_ADMIN = "1234"; 

// Logika Otomatis Realtime saat halaman dibuka
window.addEventListener('DOMContentLoaded', async () => {
    // Kunci instan semua interaksi tombol sejak detik pertama halaman dimuat agar tidak bisa di-klik cepat
    for (let i = 1; i <= TOTAL_KOTAK; i++) {
        let elemenLink = document.getElementById(`link-kotak-${i}`);
        if (elemenLink) elemenLink.style.pointerEvents = "none";
    }

    // Tampilkan indikator memuat keamanan keamanan
    document.getElementById('layarBlokir').style.display = 'flex';
    document.getElementById('layarBlokir').innerHTML = '';

    // Ambil data asli dari Supabase
    await muatDataAkses();

    // Sembunyikan kembali layar blokir setelah data sinkron
    document.getElementById('layarBlokir').style.display = 'none';

    // Langganan perubahan data secara Realtime
    _supabase
        .channel('perubahan-akses')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'akses_kotak' }, async () => {
            console.log("Perubahan terdeteksi di cloud!");
            await muatDataAkses(); 
            
            let nomorKotakSekarang = 0;
            let angka = window.location.href.match(/\d+/);
            if (angka) nomorKotakSekarang = parseInt(angka[0]);
            
            if (nomorKotakSekarang > 0 && kotakTerkunciDariCloud.includes(nomorKotakSekarang)) {
                document.getElementById('layarBlokir').style.display = 'flex';
            }
        })
        .subscribe();

    // Cek status verifikasi perangkat Admin (Hanya tertulis 1 kali secara rapi)
    if (localStorage.getItem('isOwner') === 'SandiRahasiaSuper123') {
        let btnAdmin = document.getElementById('secretadminBtn');
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            btnAdmin.style.display = 'block';
            btnAdmin.style.opacity = '1';
            btnAdmin.innerHTML = '⚙️ Kontrol Kunci Kotak';
        } else {
            btnAdmin.style.display = 'block';
            btnAdmin.style.opacity = '0.7';
            btnAdmin.innerHTML = '🔑 Login Admin';
        }
    }
});

// Fungsi-fungsi pembantu database
async function muatDataAkses() {
    try {
        let { data: akses_kotak, error } = await _supabase.from('akses_kotak').select('nomor_kotak, is_terkunci');
        if (error) throw error;
        kotakTerkunciDariCloud = [];
        if (akses_kotak) {
            akses_kotak.forEach(item => {
                if (item.is_terkunci === true) kotakTerkunciDariCloud.push(item.nomor_kotak);
            });
        }
        terapkanBlokirVisual();
    } catch (err) {
        console.error("Gagal sinkronisasi database:", err.message);
        // Jika gagal terkoneksi internet, biarkan tombol tetap terkunci demi keamanan
    }
}

// Fitur mewarnai kotak menjadi merah pudar transparan saat dikunci
function terapkanBlokirVisual() {
    for (let i = 1; i <= TOTAL_KOTAK; i++) {
        let elemenLink = document.getElementById(`link-kotak-${i}`); 
        if (elemenLink) {
            if (kotakTerkunciDariCloud.includes(i)) {
                elemenLink.style.opacity = "0.25";
                elemenLink.style.pointerEvents = "none"; 
                elemenLink.style.border = "1px solid rgba(239, 68, 68, 0.4)"; 
            } else {
                elemenLink.style.opacity = "1";
                elemenLink.style.pointerEvents = "auto"; // Hanya kotak yang tidak dikunci yang diaktifkan kliknya
                elemenLink.style.border = "1px solid rgba(255, 105, 180, 0.4)"; 
            }
        }
    }
}

// Buka panel checklist menggunakan prompt kata sandi/PIN
function bukaPanelAdmin() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        let inputSandi = prompt("Masukkan Kata Sandi Admin untuk Verifikasi:");
        
        if (inputSandi === KATA_SANDI_ADMIN) {
            localStorage.setItem('adminLoggedIn', 'true');
            let btnAdmin = document.getElementById('secretadminBtn');
            btnAdmin.style.opacity = '1';
            btnAdmin.innerHTML = '⚙️ Kontrol Kunci Kotak';
            alert("Verifikasi Sukses! Sekarang kamu bisa mengakses panel kontrol.");
        } else {
            if (inputSandi !== null) alert("Sandi Salah! Akses ditolak.");
            return; 
        }
    }

    document.getElementById('panelAdminModal').style.display = 'flex';
    let kontainerList = document.getElementById('listKontrolKotak');
    kontainerList.innerHTML = '';
    
    for (let i = 1; i <= TOTAL_KOTAK; i++) {
        let isChecked = kotakTerkunciDariCloud.includes(i) ? 'checked' : '';
        kontainerList.innerHTML += `
            <div class="kontrol-item">
                <label style="color: #333;">🔒 Kunci Kotak ${i}</label>
                <input type="checkbox" id="check-kotak-${i}" value="${i}" ${isChecked}>
            </div>
        `;
    }
}

function tutupPanelAdmin() {
    document.getElementById('panelAdminModal').style.display = 'none';
}

async function simpanAksesKeCloud() {
    alert("Menyinkronkan status kunci ke Supabase...");
    try {
        for (let i = 1; i <= TOTAL_KOTAK; i++) {
            let checkbox = document.getElementById(`check-kotak-${i}`);
            let statusKunci = checkbox ? checkbox.checked : false;
            const { error } = await _supabase.from('akses_kotak').upsert(
                { nomor_kotak: i, is_terkunci: statusKunci },
                { onConflict: 'nomor_kotak' }
            );
            if (error) throw error;
        }
        alert("Sinkronisasi Sukses!");
        tutupPanelAdmin();
    } catch (err) {
        alert("Gagal menyimpan data: " + err.message);
    }
}