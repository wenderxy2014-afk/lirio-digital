import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

type Props = {
  className?: string;
};

const STORAGE_KEY = "home_audio_enabled";

function safeParseBoolean(value: string | null) {
  if (!value) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function HomeAudioToggle({ className }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = safeParseBoolean(localStorage.getItem(STORAGE_KEY));
    // Default: try autoplay (as requested)
    return saved ?? true;
  });

  const videoId = "Q9-sYHRPZWM";

  const src = useMemo(() => {
    const origin = encodeURIComponent(window.location.origin);

    // We try autoplay; browsers may still block audio. We start unmuted (mute=0).
    // If blocked, user can click the button to force play.
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&playsinline=1&controls=0&rel=0&modestbranding=1&mute=0&origin=${origin}`;
  }, [videoId]);

  const postCommand = useCallback((func: string, args: unknown[] = []) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;

    win.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args,
      }),
      "*",
    );
  }, []);

  const applyState = useCallback(
    (nextEnabled: boolean) => {
      // Ensure playback is running (if browser allows) and toggle mute.
      postCommand("playVideo");
      if (nextEnabled) {
        postCommand("unMute");
        postCommand("setVolume", [100]);
      } else {
        postCommand("mute");
      }
    },
    [postCommand],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  // After iframe loads, apply the desired state.
  const handleLoad = useCallback(() => {
    // Small delay to give the player time to initialize.
    window.setTimeout(() => applyState(enabled), 250);
  }, [applyState, enabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      applyState(next);
      return next;
    });
  }, [applyState]);

  return (
    <div className={className}>
      {/* Hidden YouTube player (audio only) */}
      <iframe
        ref={iframeRef}
        title="Música de fundo"
        src={src}
        className="sr-only"
        onLoad={handleLoad}
        allow="autoplay; encrypted-media"
      />

      <Button type="button" variant="soft" size="sm" onClick={toggle} aria-pressed={enabled}>
        {enabled ? (
          <>
            <Volume2 className="h-4 w-4" /> Som: ligado
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4" /> Som: desligado
          </>
        )}
      </Button>
    </div>
  );
}
