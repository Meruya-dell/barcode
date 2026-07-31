// ======================================
// KONFIGURASI
// ======================================

const API_URL = "https://script.google.com/macros/s/AKfycbw0d1cWaAvS_PWn6XU45K1hrrzTnbWK6jYsD3cMXpWlHrft-Xee2wV9rG3UwfVTBmgv/exec";

const txt = document.getElementById("barcode");

let html5QrCode = null;

// Fokus ke textbox
window.onload = function () {
    txt.focus();
};

// ======================================
// CARI PRODUK
// ======================================

async function cari() {

    const barcode = txt.value.trim();

    if (barcode === "") {
        alert("Masukkan Barcode");
        txt.focus();
        return;
    }

    try {

        const response = await fetch(API_URL + "?barcode=" + encodeURIComponent(barcode));

        const data = await response.json();

        if (!data) {

            document.getElementById("hasilBarcode").innerHTML = "-";
            document.getElementById("hasilNama").innerHTML = "BARCODE TIDAK DITEMUKAN";
            document.getElementById("hasilHarga").innerHTML = "-";

            txt.focus();
            txt.select();

            return;
        }

        document.getElementById("hasilBarcode").innerHTML = data.barcode;
        document.getElementById("hasilNama").innerHTML = data.nama;
        document.getElementById("hasilHarga").innerHTML =
            "Rp " + Number(data.harga).toLocaleString("id-ID");

        txt.focus();
        txt.select();

    } catch (err) {

        console.error(err);
        alert("Gagal menghubungi server.");

    }

}

// ======================================
// ENTER = SEARCH
// ======================================

txt.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        cari();

    }

});

// ======================================
// SCAN BARCODE
// ======================================

function scanBarcode() {

    if (html5QrCode) return;

    document.getElementById("reader").style.display = "block";

    html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then(cameras => {

        if (cameras.length === 0) {

            alert("Kamera tidak ditemukan");
            return;

        }

        const backCamera =
            cameras.find(c => c.label.toLowerCase().includes("back"));

        const cameraId = backCamera
            ? backCamera.id
            : cameras[cameras.length - 1].id;

        html5QrCode.start(

            cameraId,

            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 120
                }
            },

            function (decodedText) {

                txt.value = decodedText;

                beep();

                stopScanner();

                cari();

            },

            function () {
                // abaikan
            }

        );

    }).catch(err => {

        alert("Tidak dapat membuka kamera.\n" + err);

    });

}

// ======================================
// STOP SCANNER
// ======================================

function stopScanner() {

    if (!html5QrCode) return;

    html5QrCode.stop().then(() => {

        html5QrCode.clear();

        html5QrCode = null;

        document.getElementById("reader").style.display = "none";

    });

}

// ======================================
// BEEP
// ======================================

function beep() {

    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const osc = ctx.createOscillator();

    osc.type = "sine";

    osc.frequency.value = 900;

    osc.connect(ctx.destination);

    osc.start();

    setTimeout(() => {

        osc.stop();

        ctx.close();

    }, 120);

}
