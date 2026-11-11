# PosiKids visual reference

Source: `PosiKids_20261109_200153_0000.pdf`, 15 pages, 1920 × 1080.
The requested direction is a faithful implementation of this supplied design.
ENERGY 3 / RHYTHM 2 / MOTION 1.

- Composition: illustrated 16:9 game scenes, without the previous website header, marketing copy, or footer. Portrait screens reflow to preserve readable text and usable controls.
- Palette: the PDF's warm brown ink, orange uniforms, pale paper, blue circular navigation, and pink/blue character identifiers. Learning shapes retain their instructional colors.
- Type: Gliker for headings and menu labels, Chau Philomene One for instructions, Marykate for stage labels, all extracted from the supplied PDF. Nunito is the existing fallback for characters outside the embedded subsets.
- Images: existing owner-supplied artwork plus original PDF image objects. No generated replacement illustrations. All images have intrinsic dimensions.
- Shape and elevation: rounded paper signs and cards, terracotta outlines and offset shadows reproduce the paper objects in the reference. Colored choice panels distinguish Zaa and Zee.
- Interaction: circular arrows navigate, locks show actual stage availability, dots show actual stage progression, and the envelope slider scrolls the map or article. No decorative status indicators.
- Motion: only short hover/press feedback, disabled for reduced motion. No perpetual animation.
- Content: preserve the working question bank and saved-progress schema. PDF page 5 asks for a blue triangle while showing no matching house; the implementation keeps the existing valid choices so the question can be answered.
- Puzzle: preserve nine selectable/draggable pieces and keyboard support. The PDF shows an assembled example; the playable board additionally exposes the pieces and progress.

`tools/render-reference.ps1` renders the supplied PDF with Windows' native PDF renderer.
`tools/extract-reference.py` extracts source artwork and merges embedded font subsets. `.reference/` contains local visual-review artifacts, not website content.
