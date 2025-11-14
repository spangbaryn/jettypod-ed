import { calculateSectionHeight } from './scroll-timing-config.js';

/**
 * @typedef {Object} HeroConfig
 * @property {string} text - Hero text content (can include <br> tags)
 * @property {'center'|'left'|'right'} [style='center'] - Text alignment
 * @property {string} [fontSize] - Optional CSS font-size override
 * @property {string} [color] - Optional CSS color override
 */

/**
 * @typedef {Object} Position
 * @property {string} [top] - CSS top value (e.g., '10%', '50px')
 * @property {string} [right] - CSS right value
 * @property {string} [bottom] - CSS bottom value
 * @property {string} [left] - CSS left value
 */

/**
 * @typedef {Object} Size
 * @property {string} [width] - CSS width value
 * @property {string} [height] - CSS height value
 */

/**
 * @typedef {Object} BackgroundLayer
 * @property {'background'} type
 * @property {string} color - CSS color value
 * @property {number} [z=0] - Z-index relative to hero (hero is always 100)
 */

/**
 * @typedef {Object} ImageLayer
 * @property {'image'} type
 * @property {string} src - Image source path
 * @property {Position} position - CSS positioning
 * @property {Size} [size] - Image dimensions
 * @property {string} [animation] - Optional animation name
 * @property {number} [z=1] - Z-index relative to hero (max 50 to stay behind hero)
 * @property {number} [opacity=1] - Image opacity (0-1)
 */

/**
 * @typedef {Object} CustomLayer
 * @property {'custom'} type
 * @property {string} renderer - Renderer function name from registry
 * @property {Object} [config] - Renderer-specific configuration
 * @property {number} [z=1] - Z-index relative to hero (max 50 to stay behind hero)
 */

/**
 * @typedef {BackgroundLayer|ImageLayer|CustomLayer} Layer
 */

/**
 * @typedef {Object} ScrollConfig
 * @property {string} [height='250vh'] - Section scroll height
 * @property {number} [fadeZone=0.7] - Fade transition zone (0-1, percentage of viewport)
 */

/**
 * @typedef {Object} Section
 * @property {string} id - Unique section identifier
 * @property {HeroConfig} hero - Hero text configuration
 * @property {Layer[]} layers - Visual layers (background, images, custom elements)
 * @property {ScrollConfig} [scroll] - Scroll behavior configuration
 */

/**
 * @typedef {Object} SectionSchema
 * @property {Section[]} sections - Array of section configurations
 */

/**
 * Validates a section schema
 * @param {SectionSchema} schema - The schema to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateSchema(schema) {
    const errors = [];

    if (!schema.sections || !Array.isArray(schema.sections)) {
        errors.push('Schema must have a "sections" array');
        return { valid: false, errors };
    }

    schema.sections.forEach((section, idx) => {
        const prefix = `Section ${idx}`;

        // Validate required fields
        if (!section.id) errors.push(`${prefix}: missing id`);
        if (!section.hero) errors.push(`${prefix}: missing hero config`);
        if (!section.hero?.text) errors.push(`${prefix}: hero missing text`);
        if (!section.layers || !Array.isArray(section.layers)) {
            errors.push(`${prefix}: missing or invalid layers array`);
        }

        // Validate layer z-index constraints
        section.layers?.forEach((layer, layerIdx) => {
            if (layer.z > 50) {
                errors.push(`${prefix}, layer ${layerIdx}: z-index ${layer.z} exceeds max of 50 (hero zone protection)`);
            }

            // Validate layer type
            if (!['background', 'image', 'custom'].includes(layer.type)) {
                errors.push(`${prefix}, layer ${layerIdx}: invalid layer type "${layer.type}"`);
            }

            // Type-specific validation
            if (layer.type === 'image' && !layer.src) {
                errors.push(`${prefix}, layer ${layerIdx}: image layer missing src`);
            }
            if (layer.type === 'custom' && !layer.renderer) {
                errors.push(`${prefix}, layer ${layerIdx}: custom layer missing renderer name`);
            }
        });
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

// Example schema
const exampleSchema = {
    sections: [
        {
            id: 'section-00',
            hero: {
                text: 'Tools like <span class="rotating-text-container"><span class="rotating-text">Lovable</span></span><br>are great for building simple apps.',
                style: 'center'
            },
            layers: [
                {
                    type: 'background',
                    color: '#E8EBED',
                    z: 0
                },
                {
                    type: 'image',
                    src: 'ship-images/paper-ship-square.png',
                    position: { top: '40%', left: '50%' },
                    size: { width: '25vw', height: 'auto' },
                    z: 1
                }
            ],
            scroll: {
                height: `${calculateSectionHeight({ cardCount: 0, isLastSection: false, fadeZone: 0.7 })}vh`,
                fadeZone: 0.7
            }
        },
        {
            id: 'section-01',
            hero: {
                text: 'Claude Code can build almost anything.',
                style: 'center'
            },
            layers: [
                {
                    type: 'background',
                    color: '#E8EBED',
                    z: 0
                },
                {
                    type: 'image',
                    src: 'ship-images/smooth-ship-square.png',
                    position: { top: '40%', left: '50%' },
                    size: { width: '25vw', height: 'auto' },
                    z: 1
                }
            ],
            scroll: {
                height: `${calculateSectionHeight({ cardCount: 0, isLastSection: false, fadeZone: 0.7 })}vh`,
                fadeZone: 0.7
            }
        },
        {
            id: 'section-02',
            hero: {
                text: 'But things can get<br>messy fast.',
                style: 'center'
            },
            layers: [
                {
                    type: 'background',
                    color: '#D6C6A8',
                    z: 0
                },
                {
                    type: 'image',
                    src: 'ship-images/tempest-ship-square.png',
                    position: { top: '40%', left: '50%' },
                    size: { width: '25vw', height: 'auto' },
                    z: 1
                }
            ],
            scroll: {
                height: `${calculateSectionHeight({ cardCount: 0, isLastSection: false, fadeZone: 0.7 })}vh`,
                fadeZone: 0.7
            }
        },
        {
            id: 'section-03',
            hero: {
                text: 'JettyPod enforces an AI native<br>workflow for smooth sailing.',
                style: 'center',
                top: '35%',
                color: 'black'
            },
            layers: [
                {
                    type: 'background',
                    color: '#7A9E9F',
                    z: 0
                },
                {
                    type: 'custom',
                    renderer: 'jetty-method-title',
                    z: 50
                },
                {
                    type: 'image',
                    src: 'tugboat.png',
                    position: { top: '45%', left: '50%' },
                    size: { width: '120px', height: 'auto' },
                    z: 2
                },
                {
                    type: 'custom',
                    renderer: 'checklist',
                    config: {
                        title: 'Onboarding Checklist',
                        items: [
                            'Add JettyPod to project',
                            'Say "Hey Claude"',
                            'Yep. That\'s it.'
                        ]
                    },
                    z: 2
                }
            ],
            scroll: {
                height: `${calculateSectionHeight({ cardCount: 0, isLastSection: true, fadeZone: 0.7 })}vh`,
                fadeZone: 0.7
            }
        }
    ]
};

export { validateSchema, exampleSchema };
