# Doctor.mx Card System

Card source of truth: `src/components/ui/card.tsx`.

## Tokens

- Compact padding: `--card-padding-compact` = `14px`
- Default padding: `--card-padding-default` = `16px`
- Comfortable padding: `--card-padding-comfortable` = `20px`
- Hero/preview padding: `--card-padding-hero` = `24px`
- Standard radius: `--card-radius-standard` = `12px`
- Hero/preview radius: `--card-radius-hero` = `16px`
- Border: `--card-border` = foreground at 7% opacity
- Shadow: `--card-shadow` = one soft two-layer shadow
- Hover shadow: `--card-shadow-hover`
- Grid gap: `--card-gap` = `14px`

## Variants

- `default`: standard static content card.
- `interactive`: clickable card. Use `asChild` with one `<a>` or `<button>`.
- `stat`: compact metrics and proof items.
- `feature`: icon + title + body.
- `step`: timeline/process row.
- `testimonial`: quote/review content.
- `preview`: fake UI mocks, assistant previews, data-review panels.
- `chip`: trust chips, inline facts, small proof rows.
- `form`: auth, onboarding, checkout, and profile-edit forms.
- `panel`: dense product panels and dashboard surfaces.
- `state`: compact loading, empty, and error states.

## Rules

- Use 32px icon badges by default; 24px for chips; 40px only for hero/preview.
- Decorative icon boxes larger than 40px are banned unless they are real avatars, real photos, loading spinners, or video-call controls.
- Card title scale is 15-16px/600. Body is 13-14px muted.
- Do not place a CTA inside a fully clickable card.
- Every clickable card must be a single focusable element with an `aria-label`.
- Hover is `translate-y: -1px` plus a shadow bump. No scale above `1.02`.
- Every media slot must declare `aspect-ratio`; images use `next/image` with `sizes`.

## No-Vibe UI Rules

- Do not use `rounded-2xl`, `rounded-3xl`, or `rounded-[2rem]` for ordinary cards. Use `12px`; use `16px` only for hero/preview modules.
- Do not use `shadow-2xl`, stacked custom shadows, or `shadow-dx-*` on product/public surfaces. Use `--card-shadow`.
- Do not center a giant icon above a title for routine states. Use `IconBadge` inline with the title or `EmptyState` from `src/components/ui/empty-state.tsx`.
- Do not use purple/pink gradient icon tiles or generic SaaS celebration treatments on healthcare flows.
- Custom card wrappers need a comment explaining why `Card` cannot be used.

Audit command: `npm run audit:ui`.

Visual specimens: `/dev/cards`.
