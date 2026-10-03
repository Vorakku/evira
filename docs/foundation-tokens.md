# Evira Phase 1 tokens

The shared source is `src/styles.css`. Story aliases resolve to their original values in both themes; its heading wrapping remains unchanged.

| Brand token | Value |
| --- | --- |
| `--brand-ink` | `#191a17` |
| `--brand-paper` | `#f2f1e9` |
| `--brand-lime` | `#dbef9e` |
| `--brand-surface-soft` | `#f4f3ec` |
| `--brand-surface-deep` | `#e7e7de` |
| `--brand-muted` | `#65675e` |
| `--brand-muted-soft` | `#74766b` |
| `--brand-muted-light` | `#b0b2a4` |

Brand values stay fixed in dark mode so `/story` retains its original palette. `--brand-muted-soft` remains limited to the existing story captions; shop body text uses the darker `--brand-muted` for AA contrast.

| Theme token(s), resolved | Light | Dark |
| --- | --- | --- |
| `--background` | `#f7f6f0` | `#191a17` |
| `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground` | `#191a17` | `#f2f1e9` |
| `--primary` | `#191a17` | `#f2f1e9` |
| `--primary-foreground` | `#f2f1e9` | `#191a17` |
| `--card` | `#f4f3ec` | `#24251f` |
| `--popover` | `#f4f3ec` | `#292a23` |
| `--muted` | `#f2f1e9` | `#24251f` |
| `--secondary`, `--accent` | `#e7e7de` | `#303128` |
| `--muted-foreground`, `--ring` | `#65675e` | `#b0b2a4` |
| `--border`, `--input` | `#d7d8cc` | `#43453a` |
| `--destructive` | `#b42323` | `#ff8b8b` |
| `--surface-soft` | `#f4f3ec` | `#24251f` |
| `--surface-deep` | `#e7e7de` | `#303128` |
| `--image-surface` | `#e7e7de` | `#e7e7de` |
| `--image-surface-hover` | `color-mix(in srgb, var(--brand-surface-deep) 95%, var(--brand-ink))` | `#deded2` |
| `--promo-surface` | `#f2f1e9` | `#24251f` |
| `--promo-surface-alt` | `#dbef9e` | `#303128` |
| `--promo-surface-deep` | `#e7e7de` | `#37382f` |

Product photography keeps a light paper stage in dark mode, matching the existing treatment. Its inset focus outline and selected thumbnail border use brand ink for contrast. Lime accents use an ink-text highlight on light surfaces and lime text in dark mode. Existing intentional image text, masks, print styles and barcode backgrounds retain their functional colors.

Phase 2 deepens the light image surface to distinguish product tiles from the page. The light hover step adds 5% brand ink; dark image surfaces remain unchanged.

| Typography token | Value |
| --- | --- |
| `--font-display`, also used by `--font-sans` | `'Manrope Variable',sans-serif` |
| `--font-serif` | `Georgia,'Times New Roman',serif` |
| `--text-display` | `clamp(2.5rem,5vw + 1rem,5rem)` |
| `--text-h1` | `clamp(2rem,2.5vw + 1rem,3rem)` |
| `--text-h2` | `clamp(1.5rem,1.2vw + 1rem,2rem)` |
| `--text-h3` | `clamp(1.125rem,.4vw + 1rem,1.375rem)` |
| `--tracking-display` | `-.065em` |
| `--tracking-h1` | `-.045em` |
| `--tracking-h2` | `-.035em` |

At a 16px root size, h1 resolves to 32 / 35.2 / 48px and h2 to 24 / 25.216 / 32px at 390 / 768 / 1440px. Serif accents are italic, weight 400, with `-.035em` tracking. The existing `--radius:1rem` is unchanged.

| Motion token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.2,0.65,0.3,1)` |
| `--ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` |
| `--ease-in-out` (Phase 3) | `cubic-bezier(0.77,0,0.175,1)` |
| `--dur-fast` | `160ms` |
| `--dur-base` | `280ms` |
| `--dur-slow` | `600ms` |

Reduced motion sets all three duration tokens to `0ms` and preserves the existing animation and transition suppression. Existing image transition durations remain unchanged; no animations were added.

Phase 3 uses these shared tokens for press feedback, card hover, saved hearts, cart flights, home entrances/reveals and product image View Transitions. Home enhancement attributes are applied only after mounting; static HTML stays visible. Reduced-motion changes cancel active WAAPI feedback and reveal all content immediately. Product transitions wait for the destination gallery to commit because BrowserRouter schedules route updates asynchronously.

## Verification

- `npm run typecheck`, all 35 tests from `npm test`, and `npm run build` pass.
- Both themes checked at 390, 768 and 1440px on `/`, `/catalog`, `/offers`, `/products/p01`, `/cart`, `/checkout`, `/profile`, `/welcome`, `/auth/login` and the 404 state: no horizontal scroll, clipped headings or browser errors.
- Twenty supplemental checks cover all three carousel slides and populated cart/checkout states at 390 and 1440px in both themes, including heading bounds inside clipping ancestors. Checkout was not submitted.
- Minimum body-text contrast across the chosen theme and promo surfaces: 4.61:1 light, 5.51:1 dark. Main foreground/background contrast: 16.14:1 light, 15.43:1 dark.
- Story comparison against the original CSS: identical visible geometry, type and colors in both themes at all three widths. Stable screenshots show only negligible antialiasing differences (at most 2/255 per channel).
- Regression tests cover the sole product-name h1 and the seeded rating with the “No reviews yet” label.

Temporary screenshots and browser reports are in `.sites-runtime/foundation-qa/` (gitignored).
