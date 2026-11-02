"use client";
import { getMedia } from "../media/registry";
import { mediaSlots, type MediaSlotId } from "../media/slots";

// Add ?slots to the URL to see every slot id on the page (for placing media).
const showSlots = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("slots");
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function MediaSlot({ id }: { id: MediaSlotId }) {
  const items = getMedia(id);
  const label = mediaSlots[id];
  const debug = showSlots();
  if (!items.length) return debug ? <div className="fh-slot-hint">ตำแหน่งสื่อ <b>{id}</b> — {label}</div> : null;
  return (
    <>
      {items.map((f) => (
        <figure className="fh-story-media" key={f.name}>
          {f.kind === "video" ? (
            <video
              src={f.url}
              aria-label={label}
              playsInline
              preload="metadata"
              controls={!f.loop}
              autoPlay={f.loop && !reducedMotion()}
              loop={f.loop}
              muted={f.loop}
            />
          ) : (
            <img src={f.url} alt={label} loading="lazy" decoding="async" />
          )}
          {debug && <figcaption>{id} · {f.name}</figcaption>}
        </figure>
      ))}
    </>
  );
}
