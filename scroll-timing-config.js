/**
 * Centralized scroll timing configuration
 * All timing values in viewport height (vh) units for consistency across screen sizes
 *
 * Adjust these values to fine-tune the entire page experience.
 * Changes here apply consistently to ALL sections.
 */

export const SCROLL_TIMING = {
    // Main panel text hold time at full opacity (for reading)
    PANEL_READING_HOLD: 1.2, // vh - time to read main panel text

    // Card appearance spacing
    CARD_READING_HOLD: 0.2, // vh - time each card holds at full opacity before next appears
    CARD_FADE_DISTANCE: 0.08, // vh - distance over which each card fades in

    // Global panel fade distances
    PANEL_FADE_IN: 0.3, // vh - distance over which panel fades in
    PANEL_FADE_OUT: 0.3, // vh - distance over which panel fades out

    // Grey space between panels (after fade out, before next fade in)
    GREY_SPACE_BETWEEN: 0.75, // vh - consistent grey space between all panels

    // Special: Last panel hold time before comparison section appears
    LAST_PANEL_EXTRA_HOLD: 0.2, // vh - extra hold time for last panel
};

/**
 * Calculate total section height based on content
 *
 * CRITICAL: Grey space is controlled by distance between section centers
 * When section N center is at distance fadeZone from viewport, it's at opacity 0
 * When section N+1 center is at distance fadeZone from viewport, it's at opacity 0
 * For consistent grey space, we need: distance_between_centers = 2*fadeZone + greySpace
 *
 * Since fadeZone is 0.7vh (set in schema), and we want GREY_SPACE_BETWEEN of grey:
 * Section height = 2 * 0.7 + GREY_SPACE_BETWEEN + content_hold_time
 *
 * @param {Object} options
 * @param {number} options.cardCount - Number of challenge cards (0 if none)
 * @param {boolean} options.isLastSection - Whether this is the last fullscreen section
 * @param {number} options.fadeZone - The fadeZone value from schema (default 0.7)
 * @returns {number} Total section height in vh
 */
export function calculateSectionHeight({ cardCount = 0, isLastSection = false, fadeZone = 0.7 }) {
    const T = SCROLL_TIMING;

    // Hold time for reading main panel text
    let holdTime = T.PANEL_READING_HOLD;

    // If there are cards, add space for each card appearance + reading
    if (cardCount > 0) {
        for (let i = 0; i < cardCount; i++) {
            holdTime += T.CARD_FADE_DISTANCE; // Fade in
            holdTime += T.CARD_READING_HOLD;  // Reading time
        }
    }

    // Extra hold for last panel
    if (isLastSection) {
        holdTime += T.LAST_PANEL_EXTRA_HOLD;
    }

    // Total height = 2 * fadeZone (fade in + fade out ranges) + grey space + hold time
    const totalHeight = (2 * fadeZone) + T.GREY_SPACE_BETWEEN + holdTime;

    // Convert to vh and multiply by 100 for css height value
    return Math.ceil(totalHeight * 100);
}

/**
 * Calculate card appearance thresholds in pixels
 * @param {number} windowHeight - Viewport height in pixels
 * @param {number} cardIndex - Index of the card (0-based)
 * @returns {Object} { threshold: number, fadeDistance: number }
 */
export function calculateCardThreshold(windowHeight, cardIndex) {
    const T = SCROLL_TIMING;

    // First card appears after main panel reading hold time
    let pixelThreshold = windowHeight * T.PANEL_READING_HOLD;

    // Add spacing for each previous card
    if (cardIndex > 0) {
        pixelThreshold += windowHeight * (
            (T.CARD_FADE_DISTANCE + T.CARD_READING_HOLD) * cardIndex
        );
    }

    return {
        threshold: Math.round(pixelThreshold),
        fadeDistance: Math.round(windowHeight * T.CARD_FADE_DISTANCE)
    };
}

/**
 * Calculate fade zones for a section
 * CRITICAL: PANEL_FADE_OUT must be CONSISTENT across all sections for even grey spacing
 * Only the HOLD zone varies based on content (cards)
 *
 * @param {number} windowHeight - Viewport height in pixels
 * @param {number} cardCount - Number of cards in this section
 * @returns {Object} { holdZone: number, fadeZone: number }
 */
export function calculateFadeZones(windowHeight, cardCount) {
    const T = SCROLL_TIMING;

    // Hold zone = reading time + all card appearance/reading time
    let holdZoneVh = T.PANEL_READING_HOLD;

    if (cardCount > 0) {
        holdZoneVh += (T.CARD_FADE_DISTANCE + T.CARD_READING_HOLD) * cardCount;
    }

    // fadeZone = holdZone + CONSISTENT fade out distance
    // This ensures all sections fade over the same distance (PANEL_FADE_OUT)
    const fadeZoneVh = holdZoneVh + T.PANEL_FADE_OUT;

    return {
        holdZone: windowHeight * holdZoneVh,
        fadeZone: windowHeight * fadeZoneVh
    };
}
