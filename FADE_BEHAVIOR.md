# Fade-In/Fade-Out Behavior

## Overview
All fullscreen sections use a consistent scroll-based fade system that smoothly transitions content as you scroll through the page.

## How It Works

### Fade Zone Calculation
- Sections fade in/out based on distance from **viewport center**
- Default fade zone: **70% of viewport height** (configurable)
- Opacity: `1 - (distance / fadeZone)`

### Scroll Behavior
1. Section is **completely hidden** when outside viewport
2. Fades **in** as it approaches viewport center
3. **Full opacity** when centered
4. Fades **out** as it moves away from center
5. **Hidden again** when out of viewport

### Configuration

Per-section override:
```javascript
{
  id: 'my-section',
  scroll: {
    height: '250vh',    // How much scroll space this section takes
    fadeZone: 0.7       // 70% of viewport (0-1)
  }
}
```

Global default:
```javascript
setupScrollBehavior(0.7);  // 70% fade zone for all sections
```

## Performance Optimizations

### Display Management
- Sets `display: none` when completely out of view
- Reduces repaints and reflows
- Only visible sections are rendered

### Transition Smoothness
- CSS transition: `opacity 0.3s ease-out`
- Combines with scroll-based opacity calculation
- Large fade zone (70%) ensures smooth visual transitions

## Mobile Considerations
- Fade zone percentage adapts to viewport size
- Smaller viewports = smaller absolute fade distance
- Maintains consistent visual effect across devices
- Touch scrolling respects same fade behavior

## Implementation

Located in `section-builder.js`:
```javascript
function setupScrollBehavior(fadeZone = 0.7) {
  function updateSectionOpacity() {
    // Calculates opacity based on section position
    // Hides/shows sections for performance
    // Handles comparison container fade-in
  }

  window.addEventListener('scroll', updateSectionOpacity);
  updateSectionOpacity();
}
```

## Testing Fade Behavior

Test that:
1. Sections require significant scrolling (min 2x viewport height)
2. Fade zone is large enough for smooth transitions (≥60% viewport)
3. Content opacity changes smoothly during scroll
4. No content pops or jumps
5. Performance is smooth on mobile devices

## Customization Examples

### Faster fade:
```javascript
scroll: { fadeZone: 0.4 }  // 40% - quicker transition
```

### Slower, more dramatic fade:
```javascript
scroll: { fadeZone: 0.9 }  // 90% - longer, smoother
```

### Shorter scroll distance:
```javascript
scroll: { height: '150vh' }  // Less scrolling per section
```

### Longer, more epic sections:
```javascript
scroll: { height: '400vh' }  // More scrolling, longer viewing
```
