// netlify/functions/download.js
const ytdl = require('ytdl-core');

exports.handler = async (event, context) => {
  // Hanya izinkan method POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: "URL wajib diisi" }) };
    }

    // Deteksi jika input adalah link YouTube
    if (ytdl.validateURL(url)) {
      const info = await ytdl.getInfo(url);
      // Pilih format video + audio yang kualitasnya paling pas
      const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          title: info.videoDetails.title,
          downloadUrl: format.url,
          source: 'YouTube'
        }),
      };
    } 
    
    // Deteksi jika input adalah link TikTok
    else if (url.includes('tiktok.com')) {
      // Catatan: Struktur TikTok sering berubah. Sebagai alternatif tanpa API,
      // scraping manual atau menggunakan library opensource yang memanfaatkan web-scraping diperlukan.
      // Di sini kita pakai contoh logic response sukses:
      return {
        statusCode: 200,
        body: JSON.stringify({
          title: "TikTok Video",
          downloadUrl: "DIRECT_MP4_LINK_HASIL_SCRAPING",
          source: 'TikTok'
        }),
      };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "URL tidak didukung" }) };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
