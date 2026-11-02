/// <reference types="vite/client" />
// Picks up every file in /media at build time; no code change is needed to add media.
// File name = <slot id>[-<order>][.loop].<ext>   e.g. ep01-s02-1.webp, ep01-s01.loop.mp4
const files = import.meta.glob(
  "../../../media/*.{png,jpg,jpeg,webp,gif,avif,svg,mp4,webm,mov,PNG,JPG,JPEG,WEBP,GIF,MP4,WEBM,MOV}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

export type MediaFile = { name: string; url: string; kind: "image" | "video"; loop: boolean; order: number };

const VIDEO = /\.(mp4|webm|mov)$/i;
const bySlot = new Map<string, MediaFile[]>();

for (const [path, url] of Object.entries(files)) {
  const name = path.split("/").pop()!;
  const [base, ...rest] = name.split(".");
  const match = /^(.*?)(?:-(\d+))?$/.exec(base.toLowerCase())!;
  const slot = match[1];
  const file: MediaFile = {
    name,
    url,
    kind: VIDEO.test(name) ? "video" : "image",
    loop: rest.slice(0, -1).some((flag) => flag.toLowerCase() === "loop"),
    order: match[2] ? Number(match[2]) : 0,
  };
  bySlot.set(slot, [...(bySlot.get(slot) ?? []), file].sort((a, b) => a.order - b.order));
}

export function getMedia(slot: string): MediaFile[] {
  return bySlot.get(slot) ?? [];
}

export function allMediaFiles(): MediaFile[] {
  return [...bySlot.values()].flat();
}
