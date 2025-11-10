/**
 * Hero zone overlap validation
 * Validates that visual layers don't overlap with the hero text bounding box
 */

/**
 * Calculate the bounding box for hero text based on configuration
 * @param {import('./section-schema.js').HeroConfig} heroConfig
 * @returns {{top: number, right: number, bottom: number, left: number, width: number, height: number}}
 */
function calculateHeroBounds(heroConfig) {
    // Hero is always centered at 50% viewport with max-width 1000px
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const maxWidth = 1000;
    const padding = 40;

    // Estimate text height based on font size and line count
    const fontSize = heroConfig.fontSize || 'clamp(2.5rem, 6vw, 5rem)';
    const lineCount = (heroConfig.text.match(/<br>/g) || []).length + 1;

    // Parse clamp font size (simplified - takes middle value)
    let estimatedFontSize = 80; // default estimate in px
    if (fontSize.includes('clamp')) {
        const match = fontSize.match(/clamp\([^,]+,\s*([^,]+),/);
        if (match) {
            const vwValue = parseFloat(match[1]);
            estimatedFontSize = (viewportWidth * vwValue) / 100;
        }
    }

    const lineHeight = estimatedFontSize * 1.2;
    const estimatedHeight = lineCount * lineHeight;

    // Hero container bounds (fixed positioning, centered)
    const containerWidth = Math.min(maxWidth + (padding * 2), viewportWidth);
    const containerHeight = estimatedHeight + (padding * 2);

    return {
        top: (viewportHeight / 2) - (containerHeight / 2),
        left: (viewportWidth / 2) - (containerWidth / 2),
        bottom: (viewportHeight / 2) + (containerHeight / 2),
        right: (viewportWidth / 2) + (containerWidth / 2),
        width: containerWidth,
        height: containerHeight
    };
}

/**
 * Parse CSS position value to pixels
 * @param {string} value - CSS value (e.g., '10%', '50px')
 * @param {number} containerSize - Container dimension (viewport width or height)
 * @returns {number} Pixel value
 */
function parsePosition(value, containerSize) {
    if (!value) return null;

    if (value.endsWith('%')) {
        return (parseFloat(value) / 100) * containerSize;
    }
    if (value.endsWith('px')) {
        return parseFloat(value);
    }
    if (value.endsWith('vh')) {
        return (parseFloat(value) / 100) * window.innerHeight;
    }
    if (value.endsWith('vw')) {
        return (parseFloat(value) / 100) * window.innerWidth;
    }

    return parseFloat(value);
}

/**
 * Calculate bounds for an image layer
 * @param {import('./section-schema.js').ImageLayer} layer
 * @returns {{top: number, right: number, bottom: number, left: number, width: number, height: number}|null}
 */
function calculateImageBounds(layer) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const top = layer.position.top ? parsePosition(layer.position.top, viewportHeight) : null;
    const left = layer.position.left ? parsePosition(layer.position.left, viewportWidth) : null;
    const right = layer.position.right ? parsePosition(layer.position.right, viewportWidth) : null;
    const bottom = layer.position.bottom ? parsePosition(layer.position.bottom, viewportHeight) : null;

    const width = layer.size?.width ? parsePosition(layer.size.width, viewportWidth) : 100;
    const height = layer.size?.height ? parsePosition(layer.size.height, viewportHeight) : 100;

    // Calculate absolute bounds
    const bounds = {
        width,
        height
    };

    if (top !== null) {
        bounds.top = top;
        bounds.bottom = top + height;
    }
    if (bottom !== null) {
        bounds.bottom = viewportHeight - bottom;
        bounds.top = bounds.bottom - height;
    }
    if (left !== null) {
        bounds.left = left;
        bounds.right = left + width;
    }
    if (right !== null) {
        bounds.right = viewportWidth - right;
        bounds.left = bounds.right - width;
    }

    // Only return if we have enough info to determine position
    if (bounds.top !== undefined && bounds.left !== undefined) {
        return bounds;
    }

    return null;
}

/**
 * Check if two bounding boxes overlap
 * @param {Object} box1
 * @param {Object} box2
 * @returns {boolean}
 */
function boxesOverlap(box1, box2) {
    return !(
        box1.right < box2.left ||
        box1.left > box2.right ||
        box1.bottom < box2.top ||
        box1.top > box2.bottom
    );
}

/**
 * Validate that layers don't overlap with hero zone
 * @param {import('./section-schema.js').Section} section
 * @returns {{valid: boolean, warnings: string[]}}
 */
function validateHeroOverlap(section) {
    const warnings = [];
    const heroBounds = calculateHeroBounds(section.hero);

    section.layers.forEach((layer, idx) => {
        // Only check image layers with explicit positioning
        if (layer.type === 'image' && layer.position) {
            const imageBounds = calculateImageBounds(layer);

            if (imageBounds && boxesOverlap(heroBounds, imageBounds)) {
                warnings.push(
                    `Layer ${idx} (image: ${layer.src}) may overlap hero text. ` +
                    `Hero bounds: {top: ${Math.round(heroBounds.top)}, left: ${Math.round(heroBounds.left)}, ` +
                    `bottom: ${Math.round(heroBounds.bottom)}, right: ${Math.round(heroBounds.right)}}. ` +
                    `Image bounds: {top: ${Math.round(imageBounds.top)}, left: ${Math.round(imageBounds.left)}, ` +
                    `bottom: ${Math.round(imageBounds.bottom)}, right: ${Math.round(imageBounds.right)}}`
                );
            }
        }

        // Custom renderers can't be validated automatically - issue warning
        if (layer.type === 'custom') {
            warnings.push(
                `Layer ${idx} (custom: ${layer.renderer}) cannot be validated automatically. ` +
                `Ensure custom renderer respects hero zone bounds.`
            );
        }
    });

    return {
        valid: warnings.length === 0,
        warnings
    };
}

/**
 * Validate all sections for hero overlap
 * @param {import('./section-schema.js').SectionSchema} schema
 * @returns {{valid: boolean, warnings: string[]}}
 */
function validateAllSections(schema) {
    const allWarnings = [];

    schema.sections.forEach((section, idx) => {
        const result = validateHeroOverlap(section);
        if (!result.valid) {
            result.warnings.forEach(warning => {
                allWarnings.push(`Section ${idx} (${section.id}): ${warning}`);
            });
        }
    });

    return {
        valid: allWarnings.length === 0,
        warnings: allWarnings
    };
}

export { validateHeroOverlap, validateAllSections, calculateHeroBounds };
