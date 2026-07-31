const API_URL = 
"https://script.google.com/macros/s/AKfycbw0d1cWaAvS_PWn6XU45K1hrrzTnbWK6jYsD3cMXpWlHrft-Xee2wV9rG3UwfVTBmgv/exec";


const txt = document.getElementById("barcode");


let html5QrCode = null;



window.onload=function(){

txt.focus();

};




// =======================
// SEARCH
// =======================


async function cari(){


let barcode = txt.value.trim();


if(barcode==""){

alert("Masukkan Barcode");

return;

}



try{


let response = await fetch(
API_URL+"?barcode="+encodeURIComponent(barcode)
);



let data = await response.json();



if(!data){


hasilBarcode.innerHTML="-";

hasilNama.innerHTML="BARCODE TIDAK DITEMUKAN";

hasilHarga.innerHTML="-";


return;


}



hasilBarcode.innerHTML=data.barcode;

hasilNama.innerHTML=data.nama;

hasilHarga.innerHTML=
"Rp "+Number(data.harga).toLocaleString("id-ID");


txt.select();



}catch(err){


alert("Gagal koneksi server");

console.log(err);


}


}





txt.addEventListener("keypress",function(e){


if(e.key==="Enter"){

cari();

}


});





// =======================
// SCANNER
// =======================


function scanBarcode(){



if(html5QrCode)return;



document.querySelector(".scanner-box").style.display="block";



html5QrCode=new Html5Qrcode("reader");



Html5Qrcode.getCameras().then(cameras=>{


const cameraId=cameras[cameras.length-1].id;



html5QrCode.start(


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



function(decodedText){



txt.value=decodedText;



beep();



stopScanner();



setTimeout(()=>{

cari();

},300);



},



function(error){}



);



}).catch(err=>{


alert("Kamera gagal dibuka\n"+err);


});



}




// =======================
// STOP
// =======================


function stopScanner(){


if(!html5QrCode)return;



html5QrCode.stop().then(()=>{


html5QrCode.clear();


html5QrCode=null;


document.querySelector(".scanner-box").style.display="none";


});


}






// =======================
// BEEP
// =======================


function beep(){


let ctx=new AudioContext();


let osc=ctx.createOscillator();


osc.frequency.value=900;


osc.connect(ctx.destination);


osc.start();


setTimeout(()=>{


osc.stop();

ctx.close();


},120);



}
