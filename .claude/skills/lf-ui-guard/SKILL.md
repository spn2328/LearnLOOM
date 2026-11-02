---
name: lf-ui-guard
description: Rules for touching LearnLOOM UI/CSS without breaking the owner-approved cream-and-green look. Use before editing any .tsx markup, .css, fonts, or layout, and when adding images/animation.
---

# UI guard

Approved look: original cream-and-green dashboard — LearnLOOM logo, left sidebar, top bar, home hero with red panda "Loom", course cards, My Skills; font **Itim** (Google Fonts) with Noto Sans Thai fallback.

## Default: no visual change
Unless the owner explicitly asked for a visual change in chat, change content/behaviour only.

## When a visual change IS requested
- Scope it: prefer `features/fake-hero/styles/fake-hero.css` with `fh-` prefixed classes. Touch `app/globals.css` only for narrowly scoped selectors, never global tokens/fonts/sidebar.
- `app/globals.css` is 57KB on few lines: Grep the selector, Read only that range.
- Check desktop, 768×1024 tablet and 375×812 mobile; Thai text must not clip.
- Images/animation: put files in `public/fake-hero/`, use WebP, provide a static fallback, honour `prefers-reduced-motion`, never hide question text. Bump the cache version in `public/sw.js` if new assets must be offline.
- Accessibility: buttons must be real `<button>`s, visible focus, contrast ≥ 4.5:1, touch targets ≥ 44px.

## Never
- Swap fonts/palette, restructure sidebar/navigation, or delete legacy views without owner approval.
- Ship assets without usage rights.
