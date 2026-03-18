const NOW_PLAYING_URL = "https://a6.asurahosting.com/api/nowplaying/radio_la_nube";

export type NowPlayingInfo = {
  isOnline: boolean;
  title: string;
  artist: string;
  art: string;
};

const DEFAULT_COVER = "/logo-fondo.webp";

export async function getNowPlaying(): Promise<NowPlayingInfo> {
  const response = await fetch(NOW_PLAYING_URL, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar metadata");
  }

  const data = await response.json();
  const song = data?.now_playing?.song;

  return {
    isOnline: Boolean(data?.is_online),
    title: song?.title || "Sin informacion",
    artist: song?.artist || "Radio La Nube",
    art: song?.art || DEFAULT_COVER,
  };
}
