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