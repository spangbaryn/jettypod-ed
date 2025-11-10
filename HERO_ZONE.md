# Hero Zone Protection

## Overview
The hero text zone is a protected area in the center of each fullscreen section that is guaranteed to never overlap with visual elements.

## Guarantees

### 1. Z-Index Protection
- Hero content container: **z-index 100** (fixed)
- All visual layers: **max z-index 50** (enforced by schema validation)
- Background layers: **z-index 0-10** (recommended)

### 2. Positioning
- Hero is always **fixed** positioned
- Centered at `top: 50%, left: 50%` with `transform: translate(-50%, -50%)`
- Max width: **1000px** with **40px padding**
- Responsive font size: `clamp(2.5rem, 6vw, 5rem)` (configurable per section)

### 3. Overlap Validation
The validator (`section-validator.js`) checks:
- Image layers with explicit positioning against hero bounds
- Warns about custom renderers (manual verification required)
- Calculates estimated hero height based on line count

## How to Use

### Schema Configuration
```javascript
{
  hero: {
    text: 'Your message<br>with line breaks',
    style: 'center',  // 'center', 'left', or 'right'
    fontSize: 'clamp(2.5rem, 6vw, 5rem)'  // optional override
  }
}
```

### Adding Visual Layers
Always use z-index ≤ 50:
```javascript
{
  type: 'image',
  src: 'assets/anchor.png',
  position: { top: '10%', left: '20%' },
  z: 10  // ✅ Safe - below hero zone
}

{
  type: 'custom',
  renderer: 'nautical-theme',
  z: 50  // ⚠️ Max allowed - validator will check
}
```

### Validation
Run validation before building:
```javascript
import { validateAllSections } from './section-validator.js';

const result = validateAllSections(schema);
if (!result.valid) {
  console.warn('Overlap warnings:', result.warnings);
}
```

## Mobile Responsiveness
- Hero text uses responsive `clamp()` sizing
- Container max-width ensures readability on all screens
- Validator calculations account for viewport size
- Visual layers should use % or vw/vh units for mobile compatibility

## Implementation Files
- **section-schema.js**: Schema definition and z-index validation
- **section-builder.js**: Hero container construction with z-index 100
- **section-validator.js**: Overlap detection and warnings
- **section-renderer.js**: Visual layer rendering with z-index constraints
