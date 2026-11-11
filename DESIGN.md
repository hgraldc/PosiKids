# PosiKids visual reference

Source: `PosiKids_20261109_200153_0000.pdf`, 15 pages, 1920 × 1080.
The requested direction is a faithful implementation of this supplied design.
ENERGY 3 / RHYTHM 2 / MOTION 1.

- Composition: illustrated 16:9 game scenes, without the previous website header, marketing copy, or footer. Portrait screens reflow to preserve readable text and usable controls.
- Palette: the PDF's warm brown ink, orange uniforms, pale paper, blue circular navigation, and pink/blue character identifiers. Learning shapes retain their instructional colors.
- Type: Gliker for headings and menu labels, Chau Philomene One for instructions, Marykate for stage labels, all extracted from the supplied PDF. Nunito is the existing fallback for characters outside the embedded subsets.
- Images: original IMM artwork lives directly in `public/assets` for all illustrations, backgrounds, navigation icons, menu buttons, title signs, and character/stage cards. `tools/prepare-imm-assets.py` reads that directory to refresh intrinsic dimensions in `imm-assets.json`; `src/assets.ts` maps game identifiers to these files. The application and asset tooling do not depend on the original `Aset IMM` folder.
- Shape and elevation: rounded paper signs and cards, terracotta outlines and offset shadows reproduce the paper objects in the reference. Colored choice panels distinguish Zaa and Zee.
- Interaction: circular arrows navigate, locks show actual stage availability, and dots show actual stage progression. Only the description/about page scrolls; game scenes fit the viewport. The envelope slider is limited to the about article.
- Motion: only short hover/press feedback, disabled for reduced motion. No perpetual animation.
- Content: preserve the working question bank and saved-progress schema. PDF page 5 asks for a blue triangle while showing no matching house; the implementation keeps the existing valid choices so the question can be answered.
- Puzzle: preserve nine selectable/draggable pieces and keyboard support. The PDF shows an assembled example; the playable board additionally exposes the pieces and progress.
- Screenshot corrections: use the complete first-stage card so its three houses and caption retain their original spacing. Align each standing mascot's shoe baseline with the reflection baked into the decorated background, without an additional CSS reflection. Reading uses `latar-dialog-krem-polos`; dialogue heads use the selected character's head artwork and stay inside the scene.

`tools/render-reference.ps1` renders the supplied PDF with Windows' native PDF renderer.
`tools/extract-reference.py` extracts source artwork and merges embedded font subsets. `.reference/` contains local visual-review artifacts, not website content.
