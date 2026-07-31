const API_URL =
"https://script.google.com/macros/s/AKfycbw0d1cWaAvS_PWn6XU45K1hrrzTnbWK6jYsD3cMXpWlHrft-Xee2wV9rG3UwfVTBmgv/exec";

let txt;
let html5QrCode = null;
let ocrTimer = null;
let isOCRRunning = false;
let isCameraRunning = false;

window.onload=function(){

txt=document.getElementById("barcode");

txt.focus();
txt.addEventListener("keypress", function(e){
  if(e.key==="Enter"){
    cari();
  }
  });
};


async function cari(){

let barcode=txt.value.trim();

if(barcode==""){

alert("Masukkan Barcode");

return;

}

try{

let response =
await fetch(
API_URL+"?barcode="+encodeURIComponent(barcode)
);

let data =
await response.json();

if(!data){


hasilBarcode.innerHTML="-";

hasilNama.innerHTML="BARCODE TIDAK DITEMUKAN";

hasilHarga.innerHTML="-";

return;

}

hasilBarcode.innerHTML=data.barcode;

hasilNama.innerHTML=data.nama;

hasilHarga.innerHTML=
"Rp "+Number(data.harga)
.toLocaleString("id-ID");


txt.select();


}

catch(err){

console.log(err);

alert("Gagal koneksi server");

}

}

async function scanBarcode(){

    // Jika kamera sedang aktif, tutup
    if(isCameraRunning){
        await stopScanner();
        return;
    }

    document.querySelector(".scanner-box").style.display = "block";

    html5QrCode = new Html5Qrcode("reader");

    const cameras = await Html5Qrcode.getCameras();

    const backCamera = cameras.find(c =>
        c.label.toLowerCase().includes("back") ||
        c.label.toLowerCase().includes("rear")
    );

    const cameraId = backCamera
        ? backCamera.id
        : cameras[cameras.length-1].id;

    await html5QrCode.start(
        cameraId,
        {
            fps:15,
            qrbox:{
                width:330,
                height:120
            },
            formatsToSupport:[
                Html5QrcodeSupportedFormats.EAN_13
            ]
        },
        async function(decodedText){

            txt.value = decodedText;

            beep();

            await stopScanner();

            setTimeout(cari,300);

        },
        function(){}
    );

    isCameraRunning = true;
}

async function bacaAngkaOCR(){

    if(isOCRRunning) return;
    isOCRRunning = true;

    try{

        const video = document.querySelector("#reader video");

        if(!video || video.videoWidth===0){
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video,0,0);

        const result = await Tesseract.recognize(
            canvas,
            "eng"
        );

        const text = result.data.text.replace(/\s/g,"");

        const match = text.match(/\d{8,13}/);

        if(match){
          clearInterval(ocrTimer);

            txt.value = match[0];

            beep();

            stopScanner();

            setTimeout(cari,300);

        }

    } finally {

        isOCRRunning = false;

    }
}

async function stopScanner(){

    if(!html5QrCode) return;

    clearInterval(ocrTimer);

    try{
        await html5QrCode.stop();
    }catch(e){}

    try{
        await html5QrCode.clear();
    }catch(e){}

    html5QrCode = null;
    isCameraRunning = false;

    document.querySelector(".scanner-box").style.display = "none";
}
  

function beep(){

let ctx =
new AudioContext();

let osc =
ctx.createOscillator();

osc.type="sine";

osc.frequency.value=900;

osc.connect(ctx.destination);

osc.start();

setTimeout(()=>{

osc.stop();

ctx.close();


},120);


}
