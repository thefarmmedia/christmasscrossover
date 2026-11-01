# The Fright Before Christmas — Field of Screams Branson

A responsive, buildless event website using the supplied Christmas artwork. The site lives in `dist/` and has no runtime dependencies.

- Event dates: November 6, 7, 13, and 14, 2026.
- Box office: 6 PM. Published attraction hours: 7 PM–11 PM, Central Time.
- Address: 1000 Pat Nash Drive, Branson, Missouri 65616.
- Ticket calls to action link to the official Field of Screams Branson website. Replace these URLs with the direct ticket-page URL when available; no widget configuration is required for ordinary links.
- Selecting a date prepares an iCalendar download. It does not reserve admission.
- Navigation, date selection, FAQ, countdown, and calendar export run in the browser.

Event details were checked against https://www.fieldofscreamsbranson.com/home-1 and contact details against https://www.fieldofscreamsbranson.com/home-1-5-2 on October 28, 2026. The supplied artwork provides the event name and November dates. Confirm operator policies and changes on the official site.

Use the Sites preview daemon for local preview and the Sites source helper for source synchronization and deployment packaging.


## Visual revision

Full-page snowy cobweb and Christmas light backdrop, red-lit gothic gate hero, supplied candlelight photo, and Christmas Crossover poster. Core accents sampled from the supplied poster: green `#00F800`, red `#F00000`. Generated environment assets use the built-in image-generation tool with the provided artwork as reference; original brand art is retained. Delivery uses optimized WebP copies. Decorative snowfall can be switched off in the footer and respects reduced-motion settings.

## Ambient motion

Sparse canvas snowfall uses varied sizes, speeds, and gentle drift. Independent local light blooms and dimmers align to bulb positions in the original background artwork, including responsive cover crops. The footer Atmosphere switch pauses both effects. Reduced-motion preferences disable the effects, and rendering pauses in a hidden tab. No assets or event details were changed for this update.

## Character removal

Replaced the hero, closing-section background, and event poster with edited variants that remove the horned character. Original artwork remains available in source history. Public access, event details, snowfall, and light effects are retained.

## Transparent brand graphics

Applied transparent cutouts of the supplied circular emblem and horizontal Christmas wordmark across the header, hero, divider, closing section, and footer. Removed the enlarged gothic-window background entirely. Retained snowfall and the frame lights, with local flicker aligned to the circular emblem bulbs.

## Mobile light scaling

The mobile Christmas frame retains its original aspect ratio and repeats along the page edges. The duplicated stretched hero overlay is disabled on small screens, and mobile bulb blooms are tighter. Flicker coordinates follow the correctly sized repeated artwork.

## Logo background removal

Replaced the remaining JPG hero title and refreshed the header wordmark with true-alpha cutouts. Reused the cleaned wordmark in the divider and closing section. Displayed cutouts use lossless WebP with alpha, and the PNG originals are retained. Removed blend/mask display effects from the hero title so real transparency reveals the site background.

## More visible atmosphere

Increased snowflake radii by roughly 36% while retaining the sparse density and slow drift. The independent bulbs now use stronger dim-to-bright changes on shorter, varied cycles. Mobile lights keep their tight glow and original aspect ratio.

## Snow crystal shapes

Replaced round snow particles with fine six-armed, branched crystals, sized about 7–13 CSS pixels across after a small size reduction. Each snowflake slowly rotates while falling. Sparse density, gentle drift, reduced-motion support, and the stronger light flicker are retained.

## Header backing removal

Verified the header wordmark on a contrasting checkerboard. Removed the sticky header's dark fill, backdrop blur, and shadow so the transparent logo sits directly over the site atmosphere. Versioned the header logo URL and its preload to refresh cached copies.

## Lettering-only header

Simplified only the top-left logo to the Field of Screams lettering with Branson beneath it. Removed the surrounding Christmas decorations from that asset and retained real transparency. The other supplied graphics continue to use their existing artwork.

## Mobile content spacing

Added responsive 30–48px side gutters to the mobile hero, content sections, and closing area. The main title's lettering fits inside the inset reading area, with its outer foliage cropped by the artwork container. Mobile calls to action fit the narrower reading area; calendar actions stack, and essentials stack on the smallest screens. Desktop layout and the decorative frame retain their existing sizing.


## Mobile ticket button

The green Get Tickets button stays at the bottom of mobile screens, with safe-area spacing and room beneath the footer. The mobile header shows the wordmark and menu. Desktop retains its header button. The small entrance animation respects reduced-motion preferences.

## Header scrolling

The top-left wordmark and navigation stay at the top of the page and scroll out of view with the content. The mobile ticket button remains fixed at the bottom.

## GitHub and Netlify

This is a portable static site. The root `netlify.toml` publishes `dist/` with no build command. See `GITHUB-NETLIFY.md` for repository setup, deployment, and the files to edit.

## Christmas Crossover refresh

The event title and FOS emblem remain the main hero artwork. Transparent Santa and snowman accents appear in the story and FAQ sections; selecting either opens the original supplied photograph in an accessible gallery. Added a live countdown to the next event, clearer typography, updated calendar/share URLs for Netlify, and larger mobile text while preserving the inset content area, bottom ticket button, crystal snowfall, and local light flicker. New layout and gallery code are in `dist/crossover.css` and `dist/crossover.js`.

Character cutouts were made with the built-in image generation tool and preserved as lossless WebP with real alpha. See `ASSET-NOTES.md` for source and prompt details.

## Professional finish

The `crossover.css` design system sets a shared reading width, consistent section spacing, larger body text, one green ticket-button style, straight image frames, simple date cards, and a quieter backdrop behind the content. The event art stays in the hero; the two characters remain secondary accents. The calendar selection explains its purpose, and the photo viewer includes a photo counter, 44px controls, keyboard navigation, and restored focus/scrolling when closed.
