# Doctor.mx Section Patterns

Shared section primitives live in `src/components/ui/card-patterns.tsx`.

## Primitives

- `SectionHeader`: canonical eyebrow, title, and optional body.
- `FeatureGrid`: auto-fit compact feature/tile grid.
- `StepTimeline`: compact process/timeline module.
- `CTABand`: final CTA surface.
- `TrustBar`: horizontal proof strip for stats and trust chips.
- `IconBadge`: 24/32/40px icon badges.

## Spacing

- Major public section padding: `--section-padding-y = clamp(48px, 6vw, 96px)`.
- Compact section padding: `clamp(48px, 5vw, 72px)`.
- Section horizontal padding: `--section-padding-x = clamp(16px, 4vw, 32px)`.
- Tile grids use `gap: 12-16px` and `repeat(auto-fill, minmax(200px, 1fr))`.

## Rules

- Do not hand-roll eyebrow + H2 pairs in new public surfaces; use `SectionHeader`.
- Do not create bespoke card shells on marketing pages; compose `Card`.
- Dark-blue hero and white/tinted content section rhythm stays intact.
- Do not remove sections or change routes/copy during density passes.
