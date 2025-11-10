/**
 * Positioning Helpers
 * Utilities for common layout patterns that respect hero zone protection
 */

/**
 * Preset position configurations
 * These ensure visual elements don't overlap with the centered hero zone
 */
const positions = {
    // Corner positions
    'top-left': { top: '5vh', left: '5vw' },
    'top-right': { top: '5vh', right: '5vw' },
    'bottom-left': { bottom: '5vh', left: '5vw' },
    'bottom-right': { bottom: '5vh', right: '5vw' },

    // Edge positions (centered along edges, away from hero)
    'top-center': { top: '5vh', left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: '5vh', left: '50%', transform: 'translateX(-50%)' },
    'left-center': { top: '50%', left: '5vw', transform: 'translateY(-50%)' },
    'right-center': { top: '50%', right: '5vw', transform: 'translateY(-50%)' },

    // Safe zones (guaranteed no hero overlap on desktop)
    'left-top-safe': { top: '10vh', left: '5vw' },
    'left-bottom-safe': { bottom: '10vh', left: '5vw' },
    'right-top-safe': { top: '10vh', right: '5vw' },
    'right-bottom-safe': { bottom: '10vh', right: '5vw' }
};

/**
 * Get position configuration by name
 * @param {string} name - Position preset name
 * @returns {Object} Position object
 */
function getPosition(name) {
    if (!positions[name]) {
        console.warn(`Position preset "${name}" not found. Using top-left.`);
        return positions['top-left'];
    }
    return { ...positions[name] };
}

/**
 * Create a column layout (left or right side)
 * Useful for challenge boxes, feature lists, etc.
 * @param {'left'|'right'} side
 * @param {Object} options
 * @param {string} [options.width='15vw'] - Column width
 * @param {string} [options.gap='3vh'] - Gap between items
 * @param {string} [options.padding='3vw'] - Distance from edge
 * @returns {Object} Style configuration
 */
function columnLayout(side, options = {}) {
    const {
        width = '15vw',
        gap = '3vh',
        padding = '3vw'
    } = options;

    const baseStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap,
        maxWidth: width
    };

    if (side === 'left') {
        return {
            ...baseStyle,
            alignItems: 'flex-start',
            position: 'absolute',
            left: padding,
            top: padding,
            bottom: padding
        };
    } else {
        return {
            ...baseStyle,
            alignItems: 'flex-end',
            position: 'absolute',
            right: padding,
            top: padding,
            bottom: padding
        };
    }
}

/**
 * Create a grid layout around the hero zone
 * @param {Object} options
 * @param {number} [options.columns=3] - Number of columns
 * @param {number} [options.rows=3] - Number of rows
 * @param {string} [options.gap='2vw'] - Gap between grid items
 * @param {string} [options.padding='5vw'] - Distance from edges
 * @returns {Object} Grid container style
 */
function gridLayout(options = {}) {
    const {
        columns = 3,
        rows = 3,
        gap = '2vw',
        padding = '5vw'
    } = options;

    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap,
        padding,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
    };
}

/**
 * Create scattered positions (for stars, particles, etc.)
 * @param {number} count - Number of positions to generate
 * @param {Object} options
 * @param {boolean} [options.avoidCenter=true] - Avoid hero zone
 * @param {number} [options.centerExclusionRadius=0.3] - Radius around center to avoid (0-1)
 * @returns {Array<{left: string, top: string}>}
 */
function scatteredPositions(count, options = {}) {
    const {
        avoidCenter = true,
        centerExclusionRadius = 0.3
    } = options;

    const positions = [];

    for (let i = 0; i < count; i++) {
        let left, top;

        if (avoidCenter) {
            // Generate position, regenerate if too close to center
            do {
                left = Math.random();
                top = Math.random();
            } while (
                Math.abs(left - 0.5) < centerExclusionRadius / 2 &&
                Math.abs(top - 0.5) < centerExclusionRadius / 2
            );
        } else {
            left = Math.random();
            top = Math.random();
        }

        positions.push({
            left: `${left * 100}%`,
            top: `${top * 100}%`
        });
    }

    return positions;
}

/**
 * Create circular positions around a center point
 * @param {number} count - Number of positions
 * @param {Object} options
 * @param {string} [options.centerX='50%'] - Center X position
 * @param {string} [options.centerY='50%'] - Center Y position
 * @param {string} [options.radius='30vw'] - Radius from center
 * @param {number} [options.startAngle=0] - Starting angle in degrees
 * @returns {Array<{left: string, top: string}>}
 */
function circularPositions(count, options = {}) {
    const {
        centerX = '50%',
        centerY = '50%',
        radius = '30vw',
        startAngle = 0
    } = options;

    const positions = [];
    const angleStep = 360 / count;

    for (let i = 0; i < count; i++) {
        const angle = (startAngle + (i * angleStep)) * (Math.PI / 180);

        positions.push({
            left: `calc(${centerX} + ${Math.cos(angle)} * ${radius})`,
            top: `calc(${centerY} + ${Math.sin(angle)} * ${radius})`
        });
    }

    return positions;
}

/**
 * Convert positioning helper output to CSS string
 * @param {Object} styleObj - Style object
 * @returns {string} CSS string
 */
function toCSSString(styleObj) {
    return Object.entries(styleObj)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${value}`;
        })
        .join('; ') + ';';
}

/**
 * Mobile-responsive position adjustments
 * @param {Object} position - Position object
 * @param {Object} mobileOverrides - Mobile-specific overrides
 * @returns {string} CSS with media query
 */
function responsivePosition(position, mobileOverrides = {}) {
    const desktop = toCSSString(position);
    const mobile = toCSSString({ ...position, ...mobileOverrides });

    return `
        ${desktop}
        @media (max-width: 768px) {
            ${mobile}
        }
    `;
}

export {
    positions,
    getPosition,
    columnLayout,
    gridLayout,
    scatteredPositions,
    circularPositions,
    toCSSString,
    responsivePosition
};
