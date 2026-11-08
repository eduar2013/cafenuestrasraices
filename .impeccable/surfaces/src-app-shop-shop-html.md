---
version: 1
slug: "src-app-shop-shop-html"
primary_target: "src/app/shop/shop.html"
related_targets: ["src/app/shop"]
---

# Tienda (/tienda)

Scope: shop header, "Hoy en la barra" board, origin/process filters, compact product card, cart drawer, checkout. Mode: Persuade (checkout behaves as Operate). Home follows in the next block with this same world.

Audience: online buyers across Colombia (mostly mobile) and locals taking home what they tasted. Job: pick one of ~7 coffees by comparing, then pay with confidence. Proof: real catalog data and real shop photos only; no reviews, awards, scores.

Constraints: cart/price logic, Wompi flow and trust copy, pickup code/QR, routes stay. WhatsApp 573207803402. Spanish, COP, WCAG AA. Fonts self-hosted.

Anti-goals: chivas, hats, flags as decoration; painted lettering in paragraphs; flip cards.

## Direction contract

THESIS: The shop is the painted wall of a paisa local: every coffee gets its own hand-painted sign and the bar announces "Hoy en la barra". Refuses the cream-and-serif artisan grid and the white third-wave product grid.

OWN-WORLD: Lime-wash white wall ground. Sober enamel, per the user after the first build (blue/yellow/red read too loud): black enamel for lettering, prices and filete; one deep green (#2d4a37) for everything you can act on; stone (#e3ddd0) with an inner ink filete for the chosen state; a muted red only for errors. Sign-painter display face (Shrikhand) with soft painted shadow only on coffee names, prices and the board; Albert Sans for everything else. Hierarchy by size alone. Same measurement lines across cards. Sold out = struck name + state tag.

STORY: Visitor sees what the bar has today, compares origin/process/notes at a glance, adds to cart from the card, pays seeing exactly what they pay for, with pickup as visible as shipping.

FIRST VIEWPORT: Painted header sign "Tienda" with a real shop photo; beside/below it the "Hoy tenemos" board (renamed from "Hoy en la barra": being on the bar today is not a verified fact) listing each coffee as a painted line (name, process, two notes, price), each line jumping to its card. Filters and first cards start right below; Agregar visible on every card without opening anything.

FORM: Rotulación popular, position 6 of 7 on the grounded list. seed:8ff0192698e0d4a2

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
