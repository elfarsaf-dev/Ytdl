export default {
  async fetch(req) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("No video id", { status: 400 });
    }

    const ytRes = await fetch(
      "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "17.31.35",
            },
          },
          videoId: id,
        }),
      }
    );

    const data = await ytRes.json();

    const formats = data?.streamingData?.adaptiveFormats || [];

    const audio = formats.find(f =>
      f.mimeType && f.mimeType.includes("audio")
    );

    if (!audio) {
      return new Response("No audio found", { status: 404 });
    }

    let audioUrl = audio.url;

    // kalau pakai signatureCipher
    if (!audioUrl && audio.signatureCipher) {
      const params = new URLSearchParams(audio.signatureCipher);
      audioUrl = decodeURIComponent(params.get("url"));
    }

    return new Response(
      JSON.stringify({
        title: data.videoDetails?.title,
        audio: audioUrl
      }),
      {
        headers: { "content-type": "application/json" }
      }
    );
  }
};