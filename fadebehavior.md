# Fade Behavior System Documentation

## Overview
The scroll-based fade system controls when sections appear and disappear based on their distance from the viewport center.

## Key Concepts

### 1. The Fade System (section-builder.js lines 152-170)

The system calculates opacity based on how far a section's center is from the viewport center:

```javascript
const sectionCenter = rect.top + (rect.height / 2);
const viewportCenter = windowHeight / 2;
const distance = Math.abs(sectionCenter - viewportCenter);
```

### 2. Critical Zones

**holdZone**: The distance from center where section stays at 100% opacity
**fadeZone**: The distance from center where section reaches 0% opacity

**CRITICAL RULE: holdZone MUST be smaller than fadeZone**

If holdZone >= fadeZone, the math breaks:
```javascript
opacity = 1 - ((distance - holdZone) / (sectionFadeZone - holdZone));
// If holdZone > fadeZone, denominator is NEGATIVE and opacity calculation fails!
```

### 3. Default Values

- **Default holdZone**: 0.4vh (40% of viewport height)
- **Default fadeZone**: 0.7vh (70% of viewport height)
- **Fade range**: fadeZone - holdZone = 0.3vh

This means:
- Section at full opacity when center is within 40vh of viewport center
- Section fades from 40vh to 70vh
- Section invisible beyond 70vh from center

## Challenge Cards Section (section-02)

### The Problem

Section-02 needed special handling because:
1. Cards appear based on scroll distance from center (200px, 700px, 1200px, 1700px)
2. All cards need to be visible before section fades
3. Section height is 500vh to accommodate all scrolling

### The Solution

**Custom zones for section-02:**
```javascript
const holdZone = sectionId === 'section-02' ? windowHeight * 1.5 : windowHeight * 0.4;
const sectionFadeZone = sectionId === 'section-02' ? windowHeight * 2.5 : windowHeight * fadeZone;
```

**Section configuration:**
- Section height: 350vh (tall enough for fade to complete without section scrolling out of view)
- fadeZone in schema: 0.5 (same as other sections to prevent crossfade)

**Why these values:**
- holdZone = 1.5vh (~900px on typical 600px viewport)
- Last card appears at 640px + 120px fade = 760px fully visible
- Section holds full opacity until 900px from center (140px hold time after last card)
- All 4 cards are fully visible with time to read before fade starts
- fadeZone = 2.5vh (~1500px) gives smooth 600px fade-out range

### Card Appearance Thresholds

```javascript
// Card 0: 100px past center
// Card 1: 280px past center  (180px gap)
// Card 2: 460px past center  (180px gap)
// Card 3: 640px past center  (180px gap)
const pixelThreshold = 100 + (cardIndex * 180);
const fadeDistance = 120; // Each card fades in over 120px
```

### The User Experience Timeline

1. Section enters and becomes centered (opacity = 1)
2. User reads "But things can get messy fast"
3. Scroll 100px past center → Card 1 fades in
4. Scroll 180px more → Card 2 fades in
5. Scroll 180px more → Card 3 fades in
6. Scroll 180px more → Card 4 fades in (fully visible at ~760px)
7. Continue scrolling → All cards remain visible with 140px more of hold time
8. At 900px from center → Section begins gradual fade out
9. Fade completes at 1500px (600px fade range)
10. Next section appears

## Preventing Section Crossfade

**Problem**: Sections crossfade (overlap) instead of one fully fading out before the next fades in.

**Cause**: Inconsistent fadeZone values in schema cause sections to start appearing before previous section finishes fading.

**Solution**: Use consistent fadeZone values across all sections in schema:
```javascript
scroll: {
    height: '200vh',
    fadeZone: 0.5  // Keep this consistent across sections
}
```

All sections should use the same fadeZone (0.5 recommended) to ensure clean transitions.

## Troubleshooting

### Cards disappear too quickly
- Increase holdZone to be larger than the furthest card threshold
- Ensure fadeZone > holdZone

### Section fades before cards appear
- Calculate: last_card_threshold + fade_distance = pixels needed
- Set holdZone (in vh) to: pixels_needed / viewport_height
- Set fadeZone to be at least 1.0vh larger than holdZone

### Blank scrolling space
- Section scroll height too large for content
- Reduce section.scroll.height in schema

### Section jumps to gray/disappears abruptly
- Section height too small for custom fade zones
- Section scrolls out of view (display: none on line 138-143) before opacity fade completes
- **Solution**: Increase section.scroll.height to accommodate the full fade range
- **Rule of thumb**: Section height should be at least (fadeZone * 100)vh + buffer
  - Example: fadeZone of 2.5vh needs section height of at least 300vh (350vh recommended)

## Formula for Custom Sections

```javascript
// 1. Determine furthest content distance from center (in pixels)
const furthestContentDistance = 1900; // example

// 2. Calculate required holdZone (in vh)
const requiredHoldZone = furthestContentDistance / windowHeight;

// 3. Set fadeZone to be larger
const requiredFadeZone = requiredHoldZone + 1.0; // at least 1vh larger

// 4. Apply in code
const holdZone = sectionId === 'your-section' ? windowHeight * requiredHoldZone : windowHeight * 0.4;
const sectionFadeZone = sectionId === 'your-section' ? windowHeight * requiredFadeZone : windowHeight * fadeZone;
```

## Key Learnings

1. **Always verify holdZone < fadeZone** - This is non-negotiable for the math to work
2. **Calculate zones based on content** - Don't guess; measure the furthest scroll distance needed
3. **Use viewport-relative units (vh)** - Ensures consistency across screen sizes
4. **Section height must accommodate content** - Set scroll.height large enough for all interactions
5. **Pixel-based thresholds work well for sequential content** - More predictable than percentage-based
