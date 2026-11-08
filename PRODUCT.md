# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences weigh equally:

- **Local visitors** from Sabaneta and the Valle de Aburrá who come to the shop to taste coffee, try brewing methods, and spend time there. On the web they look for location, hours, what they can taste, and the place's story.
- **Online buyers** across Colombia who buy coffee (whole bean or ground) from the store, pay online, and either receive it by carrier or pick it up at the shop.

A third, internal user: **shop staff** at the counter, who use the pickup desk (`/retiro`) to look up an order by its pickup code or QR, verify payment, and mark it delivered.

## Product Purpose

Café Nuestras Raíces is a coffee shop and distributor in Sabaneta, Antioquia. It has no coffee brand of its own: it curates coffees from several Colombian origins and producers, lets people taste a wide variety of them and of brewing methods in the shop, and sells them online. Success means visitors come to the shop to taste, and buyers trust the store enough to order online.

## Positioning

A tasting place, not a single roaster's brand. In the shop people can compare many Colombian coffees side by side and try different brewing methods; online, the same curated selection is organised by origin. The value is variety, guidance, and the chance to try before choosing, not a house blend.

## Operating Context

- Physical shop: Calle 72 Sur #46 A 35, Sabaneta, Antioquia. Open Monday to Sunday, 8:00 a.m. – 9:00 p.m.
- Online store at `/tienda`: products and variants (weights, grind) come from a separate FastAPI backend. Payments go through Wompi (card, PSE, Nequi). The result page is `/pago/resultado`.
- Fulfilment: home delivery quoted by city through carriers such as Coordinadora and Servientrega, free above a threshold; or in-store pickup with a pickup code and QR.
- Staff pickup desk at `/retiro` and `/retiro/:code`, protected by a staff key stored on a shop device.
- Social: Instagram and Facebook `@cafenuestrasraices`.

## Capabilities and Constraints

- Angular 22 single-page app. The home page holds the history, the carousel, the coffee-origins map, cafe info, and contact details.
- The coffee-origins map groups catalog coffees by origin. An origin without coordinates falls back to its department's centre and is marked as approximate.
- Coffee details may include variety, process, roast, altitude, tasting notes, and available weights.
- Spanish (Colombia) is the only language. Prices are in COP.
- Images are optimised to WebP with `npm run optimizar-imagenes`.

## Brand Commitments

- Name: Café Nuestras Raíces. Existing logo assets in `public/images/cafe/` (`logo.webp`, `logo-tienda.webp`, `image.webp`).
- Voice is warm and conversational, built on sharing coffee, conversation, feeling at home, and creating new stories.
- Never present the coffees as a house brand or claim the shop roasts them.

## Evidence on Hand

- Real photos of the shop and products in `public/images/cafe/` (`sede_1`, `sede_2`, `_DSC0829`, `labralma`) and the history video `public/videos/historia.mp4`.
- Real catalog data: origins, producers, and coffee attributes from the backend API.
- **Not available, so never fabricate:** customer reviews or testimonials, awards, cupping/SCA scores, press mentions, or sales figures.
- Open decision: the history copy in `cafe-history.html` may be placeholder text. Confirm before treating it as final.

## Product Principles

1. Variety is the product: help people compare coffees and methods instead of pushing one.
2. Make it easy to go from the web to the shop: where it is, when it opens, what you can taste there.
3. Make it easy to trust online buying: clear prices, shipping, payment, and pickup at every step.
4. Name each coffee's origin and producer truthfully. Every claim comes from catalog data, never invented.
5. Warm and welcoming, like being at home, without empty marketing.
