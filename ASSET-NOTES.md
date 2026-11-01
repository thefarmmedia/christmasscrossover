# Supporting Christmas characters

The event title and FOS emblem remain the main hero visuals. Santa is a supporting accent in the story image, the nutcracker is beneath the venue information, and the snowman is beside the FAQs. Selecting any character opens the original photograph. The original user photographs are unchanged. Photo labels have their own space beneath the full-body cutouts and do not cover the characters' feet.

## Files

- `dist/assets/holiday-santa-cutout.webp` — transparent Santa, generated from `873145790_122156499303129648_6612872490980989083_n.jpg`.
- `dist/assets/holiday-snowman-cutout.webp` — transparent snowman, generated from `875258977_122156499843129648_8087213234558765488_n.jpg`.
- `dist/assets/holiday-santa-photo.jpg` and `dist/assets/holiday-snowman-photo.jpg` — unchanged supplied originals for the photo viewer.
- `dist/assets/holiday-nutcracker-cutout.webp` — transparent nutcracker, generated from the supplied `2651.jpg`; 1024 × 1536 pixels, lossless WebP with its alpha channel preserved.
- `dist/assets/holiday-nutcracker-photo.jpg` — unchanged supplied `2651.jpg` for the photo viewer.

All three cutouts use the built-in image generation tool in background-extraction mode, with actual transparency. The Santa and snowman delivery copies are lossless WebP, 941 × 1672 pixels. No CLI/API fallback was used.

## Santa prompt

Use case: background-extraction. Website character cutout. Extract ONLY the costumed horror Santa in the supplied photo, preserving the actual character exactly: same white grinning mask with black eye makeup, white curly beard and hair, red Santa hat and red suit with white cuffs, belt, waving gloved hand, object in the other hand, green holiday gift bag, legs and dark shoes. Keep the same pose, realistic proportions, textures and identity. Remove the entire street, pavement, building, signage, trees and other people. Full body from hat to shoe soles, clean detailed hair and fabric edges. Tight portrait composition with a little transparent padding. Actual transparent alpha background, no floor, no backdrop, no new objects, no text, no additional characters, no horns or demon features. Preserve natural photographic appearance; do not redesign the costume.

## Snowman prompt

Use case: background-extraction. Website character cutout. Extract ONLY the costumed horror snowman from the supplied photo, preserving the actual character exactly: same rough dirty white round head with black hollow eyes and small dark nose, same worn black snowy top hat and red band, red scarf/cape, gray-white textured full-body suit with three oversized black buttons, gloved hands, green holiday gift bag and dark shoes. Keep the same walking pose, realistic proportions, details, textures and identity. Remove the entire street, float, buildings, signage, pavement, sky and every other person. Full body from hat to shoe soles with clean detailed edges. Tight portrait composition with a little transparent padding. Actual transparent alpha background, no floor, no backdrop, no new objects, no text, no additional characters, no horns or demon features. Preserve natural photographic appearance; do not redesign the costume.

## Nutcracker prompt

Use case: background-extraction. Asset type: transparent full-body character cutout for a Halloween/Christmas event website. Edit target: the attached photograph. Remove ONLY the surroundings and extract the existing costumed evil toy soldier/nutcracker with actual alpha transparency. Preserve the same face, blue eyes, red and gold hat and jacket, yellow gloves, black trousers, full boots, pose, photographic fabric texture, and the complete brown-handled pointed prop held in both hands. Remove the blue post, all buildings, floor, lights, cables, and background. Keep all of the character from the top of the hat to the soles of both boots fully inside the image, with modest transparent breathing room around the silhouette. Preserve the photographic identity and proportions; no stylization, added objects, words, frames, fake checkerboard, opaque black background, cast floor shadow, or cropped feet. Slightly lift the very dark trouser and boot detail enough to read against a dark website while preserving the original natural look.

## Typeface

The display typeface is Anton from the official `google/fonts` repository (`ofl/anton/Anton-Regular.ttf`). Its SIL Open Font License is included as `dist/assets/OFL-Anton.txt`. It is served locally, with no external font requests.
