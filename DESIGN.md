# Micro Tools Design System

## Platform Identity

Micro Tools is a browser-based collection of 76+ free utilities for developers, designers, and digital professionals. Its single job is to get a user from intent to tool in under ten seconds — no accounts, no installs, no friction. The platform is a means to an end. Its design should reflect that: precise, immediately navigable, and built by people who understand the user's daily environment.

The audience spends their working hours in code editors, documentation, and clean interfaces. They are sensitive to design that performs professionalism without delivering it. Generic SaaS aesthetics — soft gradients, undifferentiated white, "boost your productivity" copy — signal that the tool was designed for a demo rather than for use.

---

## Design Philosophy: Precision Reference

The conceptual anchor is a **precision reference** — like a technical manual, a calibration guide, or a professional instrument specification. Every element has a defined function. Nothing decorates without informing. The visual language builds trust through consistency and intention.

This frames every decision:
- Spacing is regular and systematic, not expressive
- Color signals state and identity, not mood
- Typography encodes hierarchy through weight and scale, not decorative switching
- Motion is absent except where it communicates state change
- Structure serves the user's task, not the platform's ego

---

## Color Palette

The palette is light-first. The background is a warm off-white — not pure white (cold, clinical) and not cream (rustic, editorial). It reads like quality uncoated paper. White cards sit on top of it, creating natural depth without shadows. The accent is a deep vermilion — an uncommon choice for a tools platform that creates a clear, confident mark wherever it appears.

| Role                | Token                  | Hex       | Notes                                            |
|---------------------|------------------------|-----------|--------------------------------------------------|
| Background          | `--background`         | `#F7F6F2` | Warm off-white — uncoated paper, not cream       |
| Card surface        | `--card`               | `#FFFFFF` | Pure white — creates depth against background    |
| Primary text        | `--foreground`         | `#111110` | Near-black with slight warm undertone            |
| Muted text          | `--muted-foreground`   | `#6B6760` | Warm mid-gray for secondary content              |
| Muted surface       | `--muted`              | `#EAE8E3` | Slightly darker bg for muted sections            |
| Border              | `--border`             | `#E3DED7` | Warm tan — visible but not sharp                 |
| **Accent**          | `--accent`             | `#C13209` | Deep vermilion — the one bold choice             |
| Accent text         | `--accent-foreground`  | `#FFFFFF` | White on vermilion (solid icon blocks)           |
| Destructive         | `--destructive`        | `#DC2626` | Standard red for errors, distinct from accent    |

### Why Vermilion

Most tools platforms default to blue (authoritative) or purple (creative). Amber has become associated with "dark mode developer tool" since ~2023. Vermilion on warm off-white is:

1. Genuinely unusual in this space — high memorability
2. Semantically appropriate — it reads as "active," "alert," "precise"
3. Creates strong contrast on warm backgrounds without being cold
4. Works as a solid block color (not just a tint or outline)

---

## Typography

Two typefaces, both functional, no decorative switching.

| Role      | Family        | Usage                                      |
|-----------|---------------|--------------------------------------------|
| Headlines | `GeistMono`   | All h1, h2, h3 globally via `@layer base`  |
| Body      | `GeistSans`   | Everything else — labels, descriptions     |

Monospace headlines are the primary aesthetic signal. They evoke code, precision instruments, and technical documentation without being ironic or retro. The contrast between the geometric mono headlines and the cleaner sans body creates hierarchy without requiring color changes.

**Scale decisions:**
- Hero h1: `text-5xl / sm:text-6xl` — bold, confident, not decorative
- Category/page h1: `text-2xl / sm:text-3xl`
- Tool card titles: `text-sm font-semibold` — dense, scannable
- Labels and UI chrome: `text-xs font-mono` — instrumentation read-out feeling

---

## Spacing & Radius

The radius system is small and deliberate — these are tools, not soft consumer apps.

| Token        | Value | Use                        |
|--------------|-------|----------------------------|
| `--radius-sm` | 4px  | Badges, tags, small chips  |
| `--radius-md` | 6px  | Inputs, buttons            |
| `--radius-lg` | 10px | Cards, panels (base)       |
| `--radius-xl` | 16px | Large containers           |

---

## Component Patterns

### Icon Containers

All icon containers use **solid accent color**, not tints. `bg-accent text-accent-foreground` creates a strong visual anchor in card grids. The vermilion squares at consistent `w-9 h-9 rounded-md` create a clear visual rhythm across category pages and the homepage grid.

This is a deliberate departure from the `bg-accent/10` tint treatment — in light mode, low-opacity tints read as an afterthought. Solid blocks read as designed.

### Cards

Cards are pure white on the warm off-white background. The border (`border-border`, warm tan) provides definition without heaviness. On hover: `hover:border-accent/50 hover:shadow-md` — the border intensifies and a shadow lifts the card slightly. This gives a tactile, physical quality to interaction.

No background color change on hover (removing the dark-mode `hover:bg-card/80` pattern, which doesn't translate to light mode).

### Navbar

The navbar logo mark is a solid vermilion square (`bg-accent`) with a white Terminal icon. This is the platform's most visible brand element — a small, punchy mark that reads across any context. The active nav link renders in `text-accent` (vermilion) to create a clear location signal.

### Hero Section

The homepage hero is typographic and confident:
- Large mono h1 (`text-5xl / text-6xl`) with `leading-none` — tight, dense
- A 2px × 48px vermilion rule (`w-12 h-0.5 bg-accent`) separates the headline from the description
- The tool count ("76 free tools") is embedded in the description as a metric, not used as a badge above the headline

The rule is a structural device — it creates a beat in the reading flow and uses the accent color as a layout element rather than just an icon background.

---

## What to Avoid

- **Tinted icon containers** on light backgrounds — `bg-accent/10` reads as accidental
- **Gradient backgrounds** on sections — use flat surfaces and shadow for depth
- **Multiple accent colors** — one action color (vermilion), one destructive color (red), everything else is neutral
- **Uppercase everything** — reserve uppercase mono for the smallest UI chrome only
- **Hover state background fills** on cards — use border + shadow instead
- **Removing the category rule accent line** in the hero — it's the one structural detail that makes the hero feel designed
