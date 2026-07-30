import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REVALIDATE_SECONDS = 1800; // 30 min — new uploads show up without hammering the YouTube API quota.
// Pull more candidates than we need to display (11), since some may be
// non-embeddable and get filtered out below.
const PLAYLIST_FETCH_COUNT = 30;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
}

interface RawPlaylistItem {
  snippet: {
    resourceId?: { videoId?: string };
    title: string;
    description: string;
    publishedAt: string;
    thumbnails?: Record<string, { url: string }>;
  };
}

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  const body = await res.json();
  if (!res.ok) {
    const message = body?.error?.message || `YouTube API request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = (process.env.YOUTUBE_CHANNEL_HANDLE || "frmathewvayalamannil").replace(/^@/, "");

  if (!apiKey) {
    return NextResponse.json(
      { error: "Daily Blessings is not configured. Add YOUTUBE_API_KEY to your environment variables to enable it." },
      { status: 501 }
    );
  }

  try {
    const channelData = await fetchJson(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`
    );
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      return NextResponse.json({ error: `Could not find a YouTube channel for @${handle}.` }, { status: 404 });
    }

    const playlistData = await fetchJson(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${PLAYLIST_FETCH_COUNT}&playlistId=${uploadsPlaylistId}&key=${apiKey}`
    );

    const candidates: YouTubeVideo[] = (playlistData.items ?? [])
      .map((item: RawPlaylistItem) => ({
        id: item.snippet.resourceId?.videoId ?? "",
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnail:
          item.snippet.thumbnails?.maxres?.url ??
          item.snippet.thumbnails?.high?.url ??
          item.snippet.thumbnails?.medium?.url ??
          item.snippet.thumbnails?.default?.url ??
          "",
      }))
      .filter((v: YouTubeVideo) => v.id)
      .sort((a: YouTubeVideo, b: YouTubeVideo) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // The playlist alone doesn't say whether a video allows iframe embedding
    // — some channel owners disable that per-video. Check status.embeddable
    // for every candidate and drop the ones that would just show YouTube's
    // "Playback on other websites has been disabled" error instead of playing.
    const embeddableIds = await getEmbeddableVideoIds(
      candidates.map((v) => v.id),
      apiKey
    );
    const videos = candidates.filter((v) => embeddableIds.has(v.id));

    return NextResponse.json({
      channelHandle: handle,
      latest: videos[0] ?? null,
      previous: videos.slice(1, 11),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load videos from YouTube.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** videos.list accepts up to 50 comma-separated IDs per request. */
async function getEmbeddableVideoIds(videoIds: string[], apiKey: string): Promise<Set<string>> {
  const embeddable = new Set<string>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    if (batch.length === 0) continue;
    const data = await fetchJson(
      `https://www.googleapis.com/youtube/v3/videos?part=status&id=${batch.join(",")}&key=${apiKey}`
    );
    for (const item of data.items ?? []) {
      if (item.status?.embeddable) embeddable.add(item.id);
    }
  }
  return embeddable;
}
