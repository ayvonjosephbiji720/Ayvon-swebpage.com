import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REVALIDATE_SECONDS = 1800; // 30 min — new uploads show up without hammering the YouTube API quota.

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
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
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=11&playlistId=${uploadsPlaylistId}&key=${apiKey}`
    );

    const videos: YouTubeVideo[] = (playlistData.items ?? [])
      .map((item: { snippet: { resourceId?: { videoId?: string }; title: string; description: string; publishedAt: string; thumbnails?: Record<string, { url: string }> } }) => ({
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
