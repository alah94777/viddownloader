exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { url } = JSON.parse(event.body);
    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: "URL wajib diisi" }) };
    }

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    
    // Kita tembak API pihak ketiga yang biasa dipakai bot telegram (Bypass CORS)
    const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    // Jika input adalah TikTok
    if (!isYouTube && data.result) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          title: data.result.title || "Video TikTok",
          downloadUrl: data.result.video.noWatermark || data.result.video.watermark,
          source: 'TikTok'
        }),
      };
    }

    // Jika yang dimasukkan link YouTube atau API Tiklydown gagal, gunakan fallback serbaguna
    const fallbackRes = await fetch(`https://api.toolbox.ragan.id/v1/downloader?url=${encodeURIComponent(url)}`);
    const fallbackData = await fallbackRes.json();

    if (fallbackData.url) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          title: fallbackData.title || "Unduhan Video",
          downloadUrl: fallbackData.url,
          source: isYouTube ? 'YouTube' : 'TikTok'
        }),
      };
    }

    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: "Format link tidak didukung atau server tujuan sedang sibuk." }) 
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Terjadi kesalahan internal. Coba beberapa saat lagi." }),
    };
  }
};
