# EP.01 Story Media — asset placement

## Media source
User-provided 10 PNG illustrations and 2 clips, ordered by the **story moments** in `เนื้อเรื่องและคำถามล่าสุด(1).pdf`. Characters: เจฟ, ลูม, เฮียศักดิ์. The original images have been optimized into WebP and the videos into H.264 MP4 to play in browsers.

## Required repository location
Upload all files from the delivered archive `LearnLOOM_FakeHero_Media_For_GitHub.zip` to **`public/fake-hero/`**, preserving names and extensions. The code in `StoryMedia.tsx` already references these names. Until binary files are uploaded, a meaningful text fallback is displayed.

| File | Placement in storyline |
|---|---|
| `01-viral-video.mp4` | Scene 01: เจฟถูกแชร์คลิปเทของเหลว |
| `02-confrontation.webp` | Scene 02: ชาวบ้านถามเจฟ |
| `03-mother-message.webp` | Scene 02: เจฟได้รับข้อความจากแม่ |
| `04-jeff-admits.webp` | Scene 02: เจฟยอมรับว่าเทลงท่อ |
| `05-learning-chemistry.webp` | Scene 03: ลูมชวนอ่านข้อมูลทางเคมี |
| `06-river-mystery.webp` | Scene 08: คราบแวววาวบนแม่น้ำ |
| `06-river-investigation.mp4` | Scene 08: วิดีโอสำรวจคราบ |
| `06-evidence-question.webp` | Scene 08: คำถามเชิงหลักฐาน |
| `07-evidence-notebook.webp` | Notebook A02 / Evidence Board A08 |
| `08-engine-approach.webp` | Scene 09: เสียงเครื่องยนต์มา |
| `08-boat-arrival.webp` | Scene 09: เรือของเฮียศักดิ์ |
| `09-sak-chemical.webp` | Scene 09: ถังน้ำยาเฮียศักดิ์ |

**Important:** The provided illustrations begin at narrative page 02; the supplied opening clip represents page 01. Some panels are used as contextual additions, not a claim that the PDF specifies that exact artwork.

## Integration status
- React positions and fallbacks: **implemented** on branch `feat/fake-hero-story-media`.
- GitHub binary uploads: **not yet completed** because the connected GitHub interface only supports UTF-8 file updates, not local binary attachment transfer. The archive is delivered separately for upload.
- Preview without these assets will show labeled placeholders instead of broken images.
- No auto-play; video uses native play/pause/seek controls and does not block reading.
- Existing UI colors, menu, layout, and Itim font are retained.

## Manual import
1. Open the repository and navigate to `public/`.
2. Create `fake-hero` (if missing).
3. Extract the delivered zip locally; upload the **files inside** its `public/fake-hero/` folder (not the zip itself) to `public/fake-hero/` in GitHub.
4. Commit the added files to the **feature branch**, not directly to production while testing.
5. Wait for GitHub checks; verify each scene and both video controls in Vercel Preview.

Each video is silent by design in this upload. Do not imply narration exists.
