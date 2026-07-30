"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clapperboard, ExternalLink, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { YouTubeVideo } from "@/app/api/youtube/videos/route";

interface VideosResponse {
  channelHandle: string;
  latest: YouTubeVideo | null;
  previous: YouTubeVideo[];
  error?: string;
}

export function DailyBlessings() {
  const [data, setData] = React.useState<VideosResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/youtube/videos")
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled) setData(body);
      })
      .catch(() => {
        if (!cancelled) setData({ channelHandle: "", latest: null, previous: [], error: "Failed to load videos." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clapperboard className="h-4 w-4 text-primary" /> Daily Blessings
        </CardTitle>
        <CardDescription>Latest videos from the channel</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading videos…
          </div>
        )}

        {!loading && data?.error && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
            {data.error}
            {data.error.includes("not configured") && (
              <p className="mt-1 text-xs text-muted-foreground">
                Add a <code className="rounded bg-muted px-1">YOUTUBE_API_KEY</code> environment variable to enable
                this (see README).
              </p>
            )}
          </div>
        )}

        {!loading && !data?.error && data?.latest && (
          <div className="space-y-6">
            <div>
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${data.latest.id}`}
                  title={data.latest.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-3 space-y-1.5">
                <h3 className="font-semibold leading-snug">{data.latest.title}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(data.latest.publishedAt)}</p>
                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                  {data.latest.description}
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${data.latest.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block pt-1"
                >
                  <Button variant="outline" size="sm">
                    Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>

            {data.previous.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Previous videos
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {data.previous.map((v) => (
                    <a
                      key={v.id}
                      href={`https://www.youtube.com/watch?v=${v.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="aspect-video w-full rounded-lg border border-border object-cover transition-opacity group-hover:opacity-80"
                      />
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium">{v.title}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(v.publishedAt)}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !data?.error && !data?.latest && (
          <p className="text-sm text-muted-foreground">No videos found yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
