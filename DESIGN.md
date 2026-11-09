---
name: Café Nuestras Raíces
description: The painted wall of a paisa coffee shop. Every coffee gets its own hand-painted sign, set on a sober lime-wash wall.
colors:
  wall: "#fafaf6"
  wall-shade: "#efefe8"
  panel: "#ffffff"
  ink: "#141414"
  muted: "#45453f"
  line: "#14141426"
  action: "#2f6b47"
  action-deep: "#275a3c"
  accent: "#d9a441"
  state: "#e3ddd0"
  error: "#9a2a1d"
typography:
  sign-display:
    fontFamily: "Sansita Black, Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 7.5vw, 6rem)"
    fontWeight: 900
    fontStyle: italic
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  sign-display-home:
    fontFamily: "Sansita Black, Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 7vw, 5.75rem)"
    fontWeight: 900
    fontStyle: italic
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  sign-numeral:
    fontFamily: "Sansita Black, Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 900
    fontStyle: italic
    lineHeight: 1
  sign-section:
    fontFamily: "Sansita Black, Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 900
    fontStyle: italic
    lineHeight: 1.05
  sign-board:
    fontFamily: "Sansita Black, Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 900
    fontStyle: italic
    lineHeight: 1
  sign-method:
    fontFamily: "Sansita Black, Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 2.6vw, 2.25rem)"
    fontWeight: 900
    fontStyle: italic
    lineHeight: 1.05
  name-title:
    fontFamily: "Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    fontStyle: italic
    lineHeight: 1.1
  name-row:
    fontFamily: "Sansita, Albert Sans, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    fontStyle: italic
    lineHeight: 1.15
  sign-price:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  sign-price-row:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  headline:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body-large:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  lead:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.6
  micro:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  photo: "2px"
  inner: "3px"
  row: "4px"
  frame: "6px"
  pill: "999px"
  round: "50%"
spacing:
  frame-inset: "5px"
  gut-mobile: "16px"
  grid-gap: "24px"
  gut-tablet: "32px"
  gut-desktop: "56px"
  section-top: "56px"
  section-bottom: "72px"
  header-height: "64px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.panel}"
    typography: "{typography.body}"
    rounded: "{rounded.frame}"
    padding: "0 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.action-deep}"
  button-primary-added:
    backgroundColor: "{colors.state}"
    textColor: "{colors.ink}"
  button-pay:
    backgroundColor: "{colors.action}"
    textColor: "{colors.panel}"
    rounded: "{rounded.frame}"
    height: "52px"
    width: "100%"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.action}"
    rounded: "{rounded.frame}"
    padding: "0 18px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.action}"
    textColor: "{colors.panel}"
  button-round:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "40px"
  button-round-hover:
    backgroundColor: "{colors.wall-shade}"
  button-on-ink:
    backgroundColor: "transparent"
    textColor: "{colors.wall}"
    rounded: "{rounded.frame}"
    padding: "0 16px"
    height: "44px"
  button-on-ink-hover:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.frame}"
    padding: "0 14px"
    height: "44px"
  chip-hover:
    backgroundColor: "{colors.wall-shade}"
  chip-selected:
    backgroundColor: "{colors.state}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.frame}"
    padding: "0 12px"
    height: "44px"
  card-product:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "5px"
  panel-step:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "14px 14px 16px"
  panel-info:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "24px"
  photo-frame:
    backgroundColor: "{colors.wall}"
    rounded: "{rounded.frame}"
    padding: "5px"
  status-plate:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.ink}"
    rounded: "{rounded.frame}"
    padding: "10px 14px"
  tag-state:
    backgroundColor: "{colors.state}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.inner}"
    padding: "2px 8px"
  header:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.ink}"
    height: "64px"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.wall}"
    padding: "56px 16px 20px"
---

# Design System: Café Nuestras Raíces

## Overview

**Creative North Star: "The Painted Wall of the Paisa Local"**

The system is *rotulación popular*: the hand-painted lettering on the walls of neighbourhood shops in Antioquia, made sober. The ground is a lime-wash white wall. Every coffee gets its own painted sign: its name and price in a sign-painter's script with a soft painted shadow. Everything else is set in a plain, warm sans that never competes with the lettering. Painted signs carry the character; a quiet text face carries the information.

The palette is held back on purpose. Black enamel does the lettering, the prices and the *filete*, the thin painted line that frames objects on the wall. One deep green marks everything you can act on. A pale stone with an inner ink filete marks what you have chosen. A muted red appears only when something is wrong. Hierarchy comes from size alone, never from extra colours or uppercase tracking.

Density is comfortable and comparative: coffees sit side by side on the same ruled lines, so origin, process, notes and price can be compared at a glance, and the add button is visible on every card without opening anything. Long pages are divided like a wall of painted signs: large painted numerals and headings, separated by 2px ink rules. Confirmed rejections: the cream-and-serif artisan grid and the white third-wave product grid; chivas, hats and flags used as decoration; painted lettering in running paragraphs; flip cards.

**Key Characteristics:**
- Lime-wash wall ground on every route, white panels hung on it inside a 2px ink filete.
- Sansita Black Italic for signs, section headings and numerals; Albert Sans ExtraBold with tabular numerals for prices and totals; Sansita ExtraBold Italic for coffee and product names (cards, sheet, board, cart, "Llévalo", origins detail); Albert Sans for everything else.
- One action colour (deep green), one chosen-state treatment (stone + inner filete), one error colour.
- Flat surfaces; depth comes from the filete and the painted letter shadow.
- The same measurement lines on every card so coffees compare row by row.
- One inverted surface: the footer, painted in black enamel.

## Colors

A warm enamel palette on a white wall ("Cafetal", chosen in live mode): black for the painting, one coffee-farm green for doing, a mustard filete under it, stone for choosing, red for errors. Livelier than the first sober green, never loud.

### Primary
- **Cafetal Green** (action, #2f6b47): every actionable element and nothing else. Primary buttons (Añadir al carrito, Finalizar compra, Pagar, Cómo llegar, Tienda in the header, Ver carrito), secondary button outlines, link hover, the focus ring, the free-shipping progress bar, the technical-sheet toggle, the coffee pins on the origins map. Text on it is panel white.
- **Deep Cafetal Green** (action-deep, #275a3c): hover and pressed fill of green buttons only.
- **Mustard Filete** (accent, #d9a441): the 3px inset stripe along the foot of filled primary buttons (`--action-stripe`), and two moments of selection on the origins map: the breathing ring around the chosen pin and the brief flash as the chosen department is painted. Never a resting fill, never text.

### Origins map
Departments are painted inline: stone (#e9e5d9, stroke #b3ab97) by default, light cafetal (#c9dfcd, stroke action green) where the shop's coffees grow, deep cafetal (#6fa57f, ink stroke) for the selected origin's department, over a soft sky gradient (#eef3ec → #f7f5ee). Pins are small 11px dots with a white ring and an ink outline, each in its own earthy colour (terracotta #b5532f, mustard #c08a1e, teal #2e6f7a, coffee #5b3a24, plum #7d4e7a, cafetal #2f6b47, in that order); the matching colour dot sits in each origin's name chip. Selecting an origin zooms the map 1.14× toward its pin (800ms), pops the pin, paints the department, and slides the coffee detail in with its notes following one by one. All of it is off under reduced motion.

### Secondary
- **Lime Stone** (state): the chosen state. Selected chips (including origin and coffee chips on the map), the checked weight/grind option, the chosen delivery and shipping option, the "added" button state, the cart count badge, state tags (Agotado, product badge), the clear-cart confirmation, the open menu toggle. Always paired with ink text, and on selectable controls with an inner ink filete.

### Tertiary
- **Muted Brick Red** (error): field error text, the border of an invalid touched field, and the checkout error banner. Nothing else.

### Neutral
- **Black Enamel** (ink): sign lettering, body text, prices and totals, every filete and control outline, the 2px rules that divide page sections, the step-number tiles, the selected map pin, the open-status dot, the toast, and the footer ground.
- **Worn Enamel** (muted): secondary text such as producer, meta lines, hints, leads, the currency code after a total, labels in ruled rows.
- **Lime-Wash Wall** (wall): the page ground of every route (set on html, body and the app host), the sticky header, the cart drawer, input fields, the mat inside framed photos and the status plate. On the footer it becomes the text colour.
- **Wall Shade** (wall-shade): hover fill on neutral controls (chips, steppers, icon buttons, round social buttons, step-list rows, menu links), skeleton blocks, the disabled button.
- **Panel White** (panel): objects hung on the wall: product cards, the board, checkout step panels, order review, cart summary, the result card, the location card, the origins map and detail panel, carousel cards, the menu dropdown. Also text on green.
- **Pencil Rule** (line, ink at 15%): hairline 1px rules between ruled rows, board rows, cart items, step-list rows, and above the history and carousel blocks.

### Named Rules
**The One Green Rule.** Deep green is reserved for things you can act on. If tapping it does nothing, it is not green. The open/closed status is information, so it is painted in ink: a filled dot for open, a hollow ring for closed.

**The Stone Means Chosen Rule.** Stone with ink text is the only "selected" signal. It never decorates and never signals an error.

**The Red Means Wrong Rule.** The muted red appears only on errors. Prices are ink, not red.

## Typography

**Display Font:** Sansita Black (with Albert Sans, system-ui), self-hosted from `public/fonts` and preloaded
**Body Font:** Albert Sans, variable 400–700 (with system-ui), self-hosted and preloaded; the base face of html and body

**Character:** A heavy, slanted sign-painter's script against a clean, slightly warm grotesque. The script is the painted sign; the sans is the small print under it.

### Hierarchy
- **Sign Display** (Sansita Black 400, clamp(3.5rem, 7.5vw, 6rem), 0.95): the shop's page sign ("Tienda"), one per page, decorative and `aria-hidden` when a real h1 follows.
- **Sign Display Home** (Sansita Black 400, clamp(3.5rem, 7vw, 5.75rem), 0.95): the home page sign ("Tu visita"), same role, slightly smaller so the step list fits beside the photo.
- **Sign Numeral** (Sansita Black 400, clamp(3rem, 6vw, 4.5rem), 1): the painted number heading each home step. In the first-viewport step list the same numerals are 2rem in a 44px column.
- **Sign Section** (Sansita Black 400, clamp(2rem, 4vw, 3rem), 1.05): section headings on the home page: step h2s, the history heading, the carousel heading.
- **Sign Board** (Sansita Black 400, clamp(2.25rem, 4vw, 3rem), 1): the board heading.
- **Sign Method** (Sansita Black 400, clamp(1.75rem, 2.6vw, 2.25rem), 1.05): brewing-method names on the Prueba menu board, painted at sign scale.
- **Sign Title** (Sansita Black 400, 1.625rem, 1.1): coffee names on cards, the street address on the location card. Cart names are 1.125rem; the drawer, result and footer brand headings 1.75rem; the return page heading 2rem.
- **Sign Row** (Sansita Black 400, 1.375rem, 1.15): names on ruled rows and small cards: board rows, the home take-home list, carousel card titles, the header brand name (1.125rem under 768px).
- **Price** (Albert Sans 800, 1.75rem, 1, tabular figures, -0.01em): card and sheet prices. Cart and checkout totals 1.5rem, line totals 1.125rem. A muted Albert Sans currency code (Micro) follows display totals.
- **Price Row** (Albert Sans 800, 1.25rem, 1, tabular figures, -0.01em): prices on board rows and the home take-home list.
- **Headline** (Albert Sans 700, clamp(1.5rem, 2.6vw, 2rem), 1.15): section headings such as the catalog heading.
- **Title** (Albert Sans 700, clamp(1.375rem, 2.2vw, 1.75rem), 1.2, max 24ch): the real page h1 under the shop sign.
- **Body Large** (Albert Sans, 1.125rem): step names in the first-viewport list (700) and the history story (400, line-height 1.65, max 60ch, muted).
- **Lead** (Albert Sans 400, 1.0625rem, 1.5): leads under signs and step headings, method details, location-card values; muted, 48–56ch.
- **Body** (Albert Sans 400, 1rem, 1.5): running text.
- **Body Small** (Albert Sans 400–600, 0.9375rem, 1.4): ruled-row values, control labels, chips, fields, step-list details, card descriptions.
- **Caption** (Albert Sans 400–700, 0.875rem, 1.4): meta lines, breadcrumbs, field labels, map captions, tasting-note pills, the footer's bottom line.
- **Label** (Albert Sans 700, 0.8125rem, 1.6): ruled-row terms, filter labels, state tags. Sentence case, no tracking.
- **Micro** (Albert Sans 700, 0.75rem): the currency code after display totals.

### Named Rules
**The Sign Lettering Rule.** Sansita Black is used only on signs and headings, method names, numerals, the street address, the brand name and the pickup code; coffee names use Sansita ExtraBold; prices and totals use Albert Sans ExtraBold. Never in paragraphs, buttons, labels or form text.

**The Painted Shadow Rule.** Sign lettering on page signs, numerals, headings and card names carries a soft painted shadow (0.05em 0.05em, ink at 20%, no blur). Prices, row names and running text carry none.

**The Size Alone Rule.** Hierarchy comes from size and weight. No uppercase tracked labels, no eyebrows above headings, no colour coding of levels.

## Layout

Content sits in a centred container (max 1280px) with a responsive gutter: 16px on phones, 32px from 640px, 56px from 1024px. A sticky header (64px, 56px under 768px) sits over every page.

The shop's first viewport is a two-column grid (1.05fr / 0.95fr, 48px gap): page sign, h1, lead and a framed shop photo on the left; the board on the right. The home first viewport is the same idea reversed in weight (0.9fr / 1.1fr, 48px gap): sign, h1, lead, a numbered step list and two buttons on the left, the framed shop photo with its status plate on the right. Both stack into one column below 1024px.

Long pages are a sequence of sections, each opened by a 2px ink rule and padded 56px top and 72px bottom (40px / 48px on phones). A step heading is a three-column row: painted numeral, heading with muted lead, and an optional button at the right that drops below on phones. Sub-blocks inside a step (history, carousel) are separated by a 1px pencil rule instead. Anchored sections keep a scroll margin of the header height plus 12px.

The product grid is three columns at 24px gaps, two below 1024px, one below 640px. Cards stretch to equal height, and the buying block (presentation, price, quantity, add) is pushed to the card's foot so it lines up across a row. Notes reserve two lines for the same reason. The method board is four columns (two below 1024px, one below 640px); the take-home list two (one below 640px); the carousel shows three cards, then two, then one. The location block and the origins block are two columns that stack below 768px. The footer is four columns, two below 900px, one below 560px.

The cart is a 440px drawer from the right (full width on narrow screens) with a sticky heading and a summary at the foot. Checkout lives in the drawer as stacked step panels; paired fields go to one column below 420px. Touch targets are at least 44px (round social and menu buttons 40px); primary buttons 48px, pay buttons 52px. On coarse pointers, fields use 16px text so phones do not zoom.

## Elevation & Depth

The wall is flat. Depth is painted, not lit: objects hang on the wall inside a 2px ink filete, often with a 5px wall-coloured mat before the content (photos, the map, the video, product and carousel cards), and sign lettering carries a hard, soft-toned painted shadow. Only things that float above the page cast a shadow: the toast and the menu dropdown. Overlays (cart backdrop, photo dialogs) dim the wall with translucent ink. The footer reverses the wall: ink ground, wall text.

### Shadow Vocabulary
- **Painted letter shadow** (`text-shadow: 0.05em 0.05em 0 #14141433`): sign lettering on signs, numerals, headings and card names.
- **Chosen filete** (`box-shadow: inset 0 0 0 3px #e3ddd0, inset 0 0 0 4.5px #141414`): the inner line on a selected control, painted over a stone fill.
- **Pin ring** (`box-shadow: 0 0 0 2px #141414` around a 3px white border): the ink ring on a map pin.
- **Toast float** (`box-shadow: 0 10px 30px -10px #14141466`): the add-to-cart toast.
- **Dropdown float** (`box-shadow: 0 16px 32px -16px #14141466`): the menu dropdown under the header.

### Named Rules
**The Filete Rule.** Every framed object takes the same 2px ink line. Depth is shown by framing, never by drop shadows on cards or panels.

## Shapes

Gently softened corners throughout: 6px on frames, buttons, chips, fields, panels and the status plate; 3px on photos and tags inside a card; 2px on photos, the map embed and the video inside a 5px mat, so the inner corner nests inside the outer one; 4px on board rows, step-list rows, menu links, thumbnails and step tiles. Full circles for the round social and menu buttons, map pins, the status dot and the history logo; full pills for the cart count, the zoom hint, the progress track and tasting-note tags (1px ink outline). Borders are the 2px filete in ink, in green on secondary buttons, or in wall on the footer. Dashed 2px ink marks provisional or ticket-like objects (the empty or error catalog state, the pickup-code ticket); a dashed 1px ink line marks the pickup info box and the technical sheet's divider.

## Components

### Buttons
Plain, solid and confident; the green is the only loud thing on the page.
- **Shape:** gently softened (6px).
- **Primary:** green fill, white Albert Sans 700, 48px tall (Agregar, cart toggle, Cómo llegar, the origins link to the shop); 52px full width for Ir a pagar, Pagar and result actions. The header's Tienda button is 44px with a cart icon, icon-only (44px square, name kept for screen readers) under 460px.
- **Hover / Active:** fill deepens to the dark green over 160ms; pressed buttons nudge down 1px. Focus is a 3px green outline offset 2px (wall outline on the ink footer).
- **Added:** after adding, the button turns stone with ink text for a moment.
- **Disabled:** wall-shade fill with muted text; the pay button while processing drops to 70% opacity with an inline spinner.
- **Secondary:** transparent with a 2px green outline and green text, 44px; fills green on hover.
- **Round:** 40px circles with a 2px ink outline and an ink icon (social links, menu toggle); hover fills wall shade.
- **Square control:** 44px, 2px ink outline, 6px corners, labelled SVG arrows and pause (carousel controls, photo-dialog close).
- **On ink:** on the footer, a 2px wall outline with wall text; fills wall with ink text on hover.
- **Text link buttons:** ink, underlined at 0.2em, turning green on hover (Seguir comprando, Volver, Editar).
- **Destructive confirm:** ink fill with wall text, inside a stone confirmation panel.

### Chips
- **Style:** transparent with a 2px ink filete, ink Albert Sans 600 at 0.9375rem, 44px tall, 14px side padding.
- **State:** hover fills with wall shade; selected turns stone with the inner ink filete, painted in over 320ms. The same treatment serves segmented weight/grind pickers, delivery-method and shipping-option rows, and the origin and coffee chips on the map.

### Cards / Containers
- **Corner Style:** 6px outer, 3px on a card photo, 2px on a matted photo.
- **Background:** panel white on the wall.
- **Shadow Strategy:** none; see the Filete Rule.
- **Border:** 2px ink filete with a 5px inset before the photo.
- **Internal Padding:** 14px 10px for the text block inside a card; 14px on checkout step panels; 24px on the location card and origins detail (18px on phones).

### Inputs / Fields
- **Style:** wall-coloured fill, 2px ink-at-40% border, 6px radius, 44px tall, 12px padding; label above in ink 0.875rem 700, with "(opcional)" in muted 400. Selects use the same box with a drawn chevron.
- **Hover / Focus:** border goes full ink on hover; on focus it turns green with a soft 3px green halo.
- **Error:** border and message in muted red (0.8125rem, 600) once the field has been touched.

### Navigation
- **Header (contact bar):** sticky, wall ground with a 2px ink bottom rule, one row at every width. Left: the brand lockup (painted mark, a small "Café" over the Sansita Black name, which also links home; the mark tilts -8deg on hover). Right: the green Tienda button, round social buttons (Facebook and Instagram hidden under 768px; WhatsApp stays) and the round menu toggle.
- **Menu dropdown:** a white panel in the ink filete, 6px corners, 6px padding, opening under the toggle aligned right, with the dropdown float shadow. Links are 44px rows, Albert Sans 600, filling wall shade on hover.
- **Breadcrumb:** muted 0.875rem, links underlined, green on hover.
- **Board rows as links:** each row on the board jumps to its card; hover fills the row green with white text. The home take-home list rows behave the same and open the coffee in the shop.

### Visit Step List (signature)
The home page's own navigation: an ordered list opened by a 2px ink rule, each row a link with a 2rem painted numeral in a 44px column and a step name (Body Large, 700) over a muted detail line, separated by pencil rules, 56px minimum height. Hover fills wall shade. Each row jumps to its section, where the same numeral returns at Sign Numeral scale beside a Sign Section heading.

### Status Plate (signature)
A wall-coloured plate in the ink filete, 6px corners, pinned to the foot of the framed shop photo (20px in). Albert Sans 700 text beside a 12px dot: filled ink when open, hollow ink ring when closed, computed from the opening hours in Bogotá time.

### Origins Map
A white framed panel with the department map in grayscale (lightened, softened contrast) so the green pins carry the only colour. Pins are 16px green dots with a 3px white border and an ink ring, growing on hover; the selected pin turns ink. The detail panel beside it uses a Sign Title-scale heading, a framed product photo, ruled lines (9rem term column), pill tasting notes and a green link to the shop.

### Footer
Black enamel: the one inverted surface. Ink ground, wall text, a Sansita Black brand name at 1.75rem, Albert Sans 700 column headings at 0.9375rem, softened wall tones for paragraphs (`#d9d9d2`) and hints (`#b9b9b1`), links underlined in wall at 40% that solidify on hover, an outlined "Cómo llegar" button, and a bottom line above a wall-at-20% rule.

### The Board (signature)
A white panel with a double painted frame: the "Hoy tenemos" sign, a muted lead, and an ordered list of coffees, each row a painted line with name (Sansita ExtraBold), process, origin and two notes (muted), and the price at the right. Rows are separated by pencil rules; the payment badge sits at the foot.

### Ruled Lines (signature)
Coffee attributes are a definition list on hairline rules: a 4.5rem muted label column and a value column, identical on every card and in the technical sheet, so coffees compare row by row. The location card and origins detail use the same ruled list.

### Sold Out
The coffee name is struck through with a 3px ink line, the price becomes a stone "Agotado" tag, and the photo desaturates (70% grayscale). Nothing is hidden.

### Checkout Steps
Each step is a white panel framed in ink with an ink tile carrying the step number in Sansita Black (28px, 4px radius). A collapsible order review and an ink-ruled summary with an Albert Sans ExtraBold total precede the pay button and the payment badge.

### Pickup Ticket
On the result page the pickup code is a dashed-ink ticket on white: the code in Sansita Black at 2.25rem with 0.08em tracking, and the QR below it.

## Do's and Don'ts

### Do:
- **Do** frame every hung object (card, panel, photo, map, field group) in the 2px ink filete with 6px corners.
- **Do** open each page section with a 2px ink rule and a painted numeral or Sansita Black heading.
- **Do** keep deep green for actions only: buttons, link hover, focus rings, progress, map pins.
- **Do** mark every chosen state with stone fill plus the inner ink filete (3px stone gap, 1.5px ink).
- **Do** set coffee names in Sansita ExtraBold Italic and prices and totals in Albert Sans ExtraBold with tabular figures, followed by a muted currency code on display totals.
- **Do** keep the same ruled lines, in the same order, on every product card.
- **Do** show sold-out coffees with a struck name and a stone Agotado tag instead of hiding them.
- **Do** honour reduced motion: transitions collapse, smooth scroll turns off.

### Don't:
- **Don't** add another accent colour beyond the mustard filete, or reintroduce the earlier cobalt, yellow and bright red enamels. Don't use the mustard as a fill or for text.
- **Don't** use the error red for prices, sale tags or emphasis.
- **Don't** paint status or information green; open/closed is ink.
- **Don't** set paragraphs, buttons or form labels in Sansita Black.
- **Don't** put drop shadows on cards or panels; only floating objects (toast, menu dropdown) cast one.
- **Don't** use chivas, hats or flags as decoration, or flip cards.
- **Don't** add uppercase tracked labels or eyebrows above headings; hierarchy is by size alone.
- **Don't** carry over the old site look (cream grounds, Georgia/Playfair, gold) into new surfaces.

## Migration status

This world ships on every public surface: the home page, the shared header and menu, the location card and map, coffee origins, history, carousel, footer, the shop (`/tienda`), cart drawer, checkout and payment pages (`/pago/resultado`, payment return). Tokens live on `:root` in `src/styles.css`; html, body and the app host use the wall ground and Albert Sans, and `index.html` preloads the two self-hosted fonts instead of loading Google Fonts.

Still not migrated: the staff pickup desk (`src/app/pickup-desk`) keeps the earlier cream, 16px-radius, old-green look. That is incumbent drift, not part of the system.

Content, not system: the carousel's photos and copy are placeholders the shop owner will replace, and the history copy is provisional.

Known drift in the shipped code (not part of the system): panel white has no custom property and is written as a literal `#fff` in components; photo mats in the product card and origins detail use an off-token `#f1f1ec`; the home h1 uses the Headline size while the shop h1 uses Title; the origins detail heading uses clamp(1.75rem, 3vw, 2.25rem), a near-duplicate of Sign Method; the menu toggle fills stone on hover, not only when open; the header's small "Café" in the brand lockup is uppercase with 0.2em tracking, a carry-over that conflicts with the Size Alone Rule and is not a pattern to reuse.
