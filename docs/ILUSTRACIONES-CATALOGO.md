# Preparación de ilustraciones laterales — 2026-10-21

Herramienta: image_gen integrada, dos llamadas de edición con cinco imágenes de referencia por llamada. Después se convirtieron las salidas a WebP conservando alfa. No se usó la API ni CLI alternativa.

Archivos: public/images/catalog-botanicals-1.webp y catalog-botanicals-2.webp.

Prompt 1: Prepare one transparent botanical sprite strip from these FIVE input illustrations. Remove gray/white backgrounds and exterior white outlines, preserving original plant colors, shapes, style and pale internal variegation. Layout EXACTLY five equal-width cells in a single horizontal row, one plant per cell in supplied order: trailing heartleaf vine, banana broad leaves, branched tree foliage, sage watercolor twig, monstera. Each whole plant fits within its cell with 8% transparent padding and no overlap into neighboring cells. Wide canvas, true alpha transparent background; no checkerboard, no text, no labels, no shadows, no borders. Faithful cutouts for website edge decorations. All five plants must be individually isolated by transparent gaps.

Prompt 2: Prepare one transparent botanical sprite strip from these FIVE input illustrations. Remove white, cream, paper and baked checkerboard backgrounds and exterior white outlines, preserving original plant colors, shapes, style and pale internal variegation. Layout EXACTLY five equal-width cells in a single horizontal row, one whole plant per cell in supplied order: palm fronds, variegated green burgundy plant, red caladium, orange bird of paradise, red yellow heliconia. Each whole plant fits within its cell with 8% transparent padding and no overlap into neighboring cells. Wide canvas 3:1, true alpha transparent background; no checkerboard, no text, no labels, no shadows, no borders. Faithful cutouts for website edge decorations. All five plants must be individually isolated by transparent gaps.

## Composición final — 2026-10-22
Los atlas iniciales se sustituyeron por diez imágenes individuales catalog-{vine,branch,banana,twig,variegated,palm,bird,monstera,caladium,heliconia}.webp con alfa real. Los tallos se anclan fuera del borde y las hojas conservan contornos nítidos. La distribución depende de la altura del catálogo y respeta movimiento reducido. Los atlas iniciales ya no se usan en la interfaz.
