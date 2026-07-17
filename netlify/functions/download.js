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

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube');
    
    // API ALTERNATIF: Menggunakan endpoint publik serbaguna yang stabil untuk YT & TikTok
    const apiUrl = `https://api.vreden.web.id/api/download?url=${encodeURIComponent(url)}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const data = await res.json();

    // Pastikan API merespons dengan status sukses (200) dan ada datanya
    if (data.status === 200 && data.result) {
      let downloadLink = '';
      let title = data.result.title || "Video Berhasil Diunduh";

      if (isYouTube) {
        // Struktur data YouTube biasanya mengembalikan object/array download
        downloadLink = data.result.download?.url || data.result.url;
      } else {
        // Struktur data TikTok tanpa watermark
        downloadLink = data.result.video?.noWatermark || data.result.video || data.result.url;
      }

      if (downloadLink) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            title: title,
            downloadUrl: downloadLink,
            source: isYouTube ? 'YouTube' : 'TikTok'
          }),
        };
      }
    }

    // FALLBACK API KEDUA: Jika API pertama gagal/limit, pakai pelapis ini
    const fallbackUrl = `https://api.sandipbaruwal.com.np/download?url=${encodeURIComponent(url)}`;
    const fallbackRes = await fetch(fallbackUrl);
    const fallbackData = await fallbackRes.json();

    if (fallbackData.status && fallbackData.data) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          title: fallbackData.data.title || "Unduhan Video",
          downloadUrl: fallbackData.data.url || fallbackData.data.video,
          source: isYouTube ? 'YouTube' : 'TikTok'
        }),
      };
    }

    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: "Server tujuan sibuk atau format video tidak didukung. Coba link video yang lain." }) 
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Terjadi kesalahan sistem internal. Silakan coba lagi." }),
    };
  }
};
