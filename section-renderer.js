/**
 * Layer Renderer Registry
 * Maps layer types and custom renderer names to render functions
 */

import { scatteredPositions, columnLayout, toCSSString } from './positioning-helpers.js';

const renderers = {
    /**
     * Background layer renderer
     * @param {import('./section-schema.js').BackgroundLayer} layer
     * @param {HTMLElement} container - The section container
     * @returns {HTMLElement}
     */
    background: (layer, container) => {
        const bg = document.createElement('div');
        bg.className = 'section-background';
        bg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            opacity: 0;
            transition: opacity 0.3s ease-out;
            z-index: ${layer.z || 0};
            background: ${layer.color};
        `;
        bg.dataset.section = container.dataset.sectionId;
        return bg;
    },

    /**
     * Image layer renderer
     * @param {import('./section-schema.js').ImageLayer} layer
     * @param {HTMLElement} container - The section container
     * @returns {HTMLElement}
     */
    image: (layer, container) => {
        const img = document.createElement('img');
        img.src = layer.src;

        // Always center horizontally if left is 50%
        const needsHorizontalCenter = layer.position.left === '50%';

        img.style.cssText = `
            position: fixed;
            ${layer.position.top ? `top: ${layer.position.top};` : ''}
            ${layer.position.right ? `right: ${layer.position.right};` : ''}
            ${layer.position.bottom ? `bottom: ${layer.position.bottom};` : ''}
            ${layer.position.left ? `left: ${layer.position.left};` : ''}
            ${needsHorizontalCenter ? 'transform: translateX(-50%);' : ''}
            ${layer.size?.width ? `width: ${layer.size.width};` : ''}
            ${layer.size?.height ? `height: ${layer.size.height};` : ''}
            min-width: 200px;
            z-index: ${layer.z || 1};
            opacity: 0;
            transition: opacity 0.3s ease-out;
            max-width: 100%;
            object-fit: contain;
        `;

        if (layer.animation) {
            img.style.animation = layer.animation;
        }

        return img;
    },

    /**
     * Custom layer renderer dispatcher
     * @param {import('./section-schema.js').CustomLayer} layer
     * @param {HTMLElement} container - The section container
     * @returns {HTMLElement}
     */
    custom: (layer, container) => {
        const rendererFn = customRenderers[layer.renderer];
        if (!rendererFn) {
            console.error(`Custom renderer "${layer.renderer}" not found`);
            return document.createElement('div');
        }
        return rendererFn(layer.config || {}, container, layer.z || 1);
    }
};

/**
 * Custom renderer registry
 * These are the specific visual components (starfield, nautical-ropes, etc.)
 */
const customRenderers = {
    /**
     * Starfield visual (temporary - will be replaced with nautical theme)
     * @param {Object} config
     * @param {number} config.count - Number of stars
     * @param {HTMLElement} container
     * @param {number} z - Z-index
     * @returns {HTMLElement}
     */
    starfield: (config, container, z) => {
        const visualContainer = document.createElement('div');
        visualContainer.className = 'visual-container starfield';
        visualContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: ${z};
            display: flex;
            justify-content: space-between;
            padding: 3vh 3vw;
        `;

        // Generate stars using positioning helper (avoids hero zone)
        const positions = scatteredPositions(config.count || 100, {
            avoidCenter: true,
            centerExclusionRadius: 0.3
        });

        positions.forEach((pos, i) => {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.cssText = `
                position: absolute;
                background: #7A9E9F;
                border-radius: 50%;
                left: ${pos.left};
                top: ${pos.top};
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                animation: twinkle 3s ease-in-out infinite;
                animation-delay: ${Math.random() * 3}s;
            `;
            visualContainer.appendChild(star);
        });

        return visualContainer;
    },

    /**
     * Tangled arrows visual (temporary - will be replaced with nautical theme)
     * @param {Object} config
     * @param {Array} config.challengeBoxes - Challenge box configurations
     * @param {HTMLElement} container
     * @param {number} z - Z-index
     * @returns {HTMLElement}
     */
    'tangled-arrows': (config, container, z) => {
        const visualContainer = document.createElement('div');
        visualContainer.className = 'visual-container';
        visualContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: ${z};
            display: flex;
            justify-content: space-between;
            padding: 3vh 3vw;
        `;

        // Tangled arrows SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 800 600');
        svg.setAttribute('class', 'tangled-arrows');
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        const paths = [
            'M100,100 Q200,300 400,200 T700,400',
            'M150,500 Q350,100 500,300 T750,150',
            'M50,300 Q400,500 600,200 T800,450',
            'M200,50 Q450,400 350,500 T100,550',
            'M700,100 Q300,250 450,450 T150,200'
        ];

        paths.forEach(d => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('stroke', '#F2D6A2');
            path.setAttribute('stroke-width', '4');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', '0.5');
            path.style.cssText = `
                animation: draw 2s ease-out forwards;
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
            `;
            svg.appendChild(path);
        });

        visualContainer.appendChild(svg);

        // Challenge boxes using positioning helpers
        const leftColumn = document.createElement('div');
        leftColumn.className = 'challenge-column challenge-column-left';
        leftColumn.style.cssText = toCSSString(columnLayout('left'));

        const rightColumn = document.createElement('div');
        rightColumn.className = 'challenge-column challenge-column-right';
        rightColumn.style.cssText = toCSSString(columnLayout('right'));

        (config.challengeBoxes || []).forEach(box => {
            const challenge = document.createElement('div');
            challenge.className = 'challenge';
            challenge.textContent = box.text;
            challenge.style.cssText = `
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                color: #0B2532;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                opacity: 0;
                transform: scale(0.8);
                animation: popIn 0.5s ease-out forwards;
                border: 2px solid #F2D6A2;
                animation-delay: ${box.delay}s;
            `;

            if (box.position === 'left') {
                leftColumn.appendChild(challenge);
            } else {
                rightColumn.appendChild(challenge);
            }
        });

        visualContainer.appendChild(leftColumn);
        visualContainer.appendChild(rightColumn);

        return visualContainer;
    },

    /**
     * Challenge cards visual - four cards in corners
     * @param {Object} config
     * @param {Array} config.cards - Card configurations with text and position
     * @param {HTMLElement} container
     * @param {number} z - Z-index
     * @returns {HTMLElement}
     */
    'challenge-cards': (config, container, z) => {
        const visualContainer = document.createElement('div');
        visualContainer.className = 'visual-container challenge-cards';
        visualContainer.dataset.section = container.dataset.sectionId;
        visualContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 150;
            pointer-events: none;
        `;

        // Scattered positions near center, overlapping hero zone intentionally
        const positionStyles = {
            'top-left': { top: '25%', left: '35%' },
            'top-right': { top: '30%', right: '32%' },
            'bottom-left': { bottom: '30%', left: '30%' },
            'bottom-right': { bottom: '35%', right: '35%' }
        };

        (config.cards || []).forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'challenge-card';
            cardEl.textContent = card.text;

            const pos = positionStyles[card.position] || positionStyles['top-left'];

            cardEl.style.cssText = `
                position: absolute;
                ${pos.top ? `top: ${pos.top};` : ''}
                ${pos.bottom ? `bottom: ${pos.bottom};` : ''}
                ${pos.left ? `left: ${pos.left};` : ''}
                ${pos.right ? `right: ${pos.right};` : ''}
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                color: #0B2532;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border: 2px solid #F2D6A2;
                max-width: 200px;
                opacity: 0;
                transform: scale(0.8);
                text-align: center;
            `;

            visualContainer.appendChild(cardEl);
        });

        return visualContainer;
    },

    /**
     * Checklist renderer - items with checkmarks
     * @param {Object} config
     * @param {string} [config.title] - Optional title for the checklist
     * @param {Array<string>} config.items - List items
     * @param {HTMLElement} container
     * @param {number} z - Z-index
     * @returns {HTMLElement}
     */
    'checklist': (config, container, z) => {
        const checklistContainer = document.createElement('div');
        checklistContainer.className = 'visual-container checklist';
        checklistContainer.dataset.section = container.dataset.sectionId;
        checklistContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translateX(-50%);
            z-index: ${z};
            opacity: 0;
            transition: opacity 0.3s ease-out;
            text-align: center;
            width: 100%;
            max-width: 90%;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: clamp(20px, 3vw, 30px) clamp(25px, 4vw, 35px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            display: inline-block;
            max-width: 650px;
            width: 90%;
            border: 3px solid #F2D6A2;
        `;

        // Add title if provided
        if (config.title) {
            const title = document.createElement('h3');
            title.textContent = config.title;
            title.style.cssText = `
                font-family: 'Caveat', cursive;
                font-size: clamp(1.8rem, 4.5vw, 2.5rem);
                font-weight: 700;
                color: #0B2532;
                margin: 0 0 clamp(15px, 2vh, 20px) 0;
                text-align: center;
            `;
            card.appendChild(title);
        }

        const list = document.createElement('ul');
        list.style.cssText = `
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        `;

        (config.items || []).forEach(item => {
            const li = document.createElement('li');
            li.style.cssText = `
                font-size: clamp(1rem, 3vw, 1.3rem);
                font-weight: 600;
                color: #0B2532;
                margin: clamp(10px, 1.5vh, 12px) 0;
                display: flex;
                align-items: center;
                gap: clamp(12px, 2vw, 15px);
                justify-content: flex-start;
            `;

            const checkmark = document.createElement('span');
            checkmark.textContent = '✓';
            checkmark.style.cssText = `
                color: #7A9E9F;
                font-size: clamp(1.3rem, 4vw, 1.8rem);
                font-weight: 700;
                flex-shrink: 0;
            `;

            const text = document.createElement('span');
            text.textContent = item;

            li.appendChild(checkmark);
            li.appendChild(text);
            list.appendChild(li);
        });

        card.appendChild(list);
        checklistContainer.appendChild(card);
        return checklistContainer;
    },

    /**
     * Jetty Method title renderer
     * @param {Object} config
     * @param {HTMLElement} container
     * @param {number} z - Z-index
     * @returns {HTMLElement}
     */
    'jetty-method-title': (config, container, z) => {
        const titleContainer = document.createElement('div');
        titleContainer.className = 'visual-container jetty-method-title';
        titleContainer.dataset.section = container.dataset.sectionId;
        titleContainer.style.cssText = `
            position: fixed;
            top: 8%;
            left: 50%;
            transform: translateX(-50%);
            z-index: ${z};
            opacity: 0;
            transition: opacity 0.3s ease-out;
            text-align: center;
            width: 100%;
        `;

        const title = document.createElement('h2');
        title.textContent = 'The Jetty Method';
        title.style.cssText = `
            font-family: 'Caveat', cursive;
            color: white;
            font-size: clamp(2rem, 8vw, 3rem);
            font-weight: 700;
            margin: 0;
        `;

        titleContainer.appendChild(title);
        return titleContainer;
    }
};

/**
 * Register a new custom renderer
 * @param {string} name - Renderer name
 * @param {Function} rendererFn - Renderer function (config, container, z) => HTMLElement
 */
function registerRenderer(name, rendererFn) {
    customRenderers[name] = rendererFn;
}

/**
 * Render a layer
 * @param {import('./section-schema.js').Layer} layer
 * @param {HTMLElement} container
 * @returns {HTMLElement}
 */
function renderLayer(layer, container) {
    const renderer = renderers[layer.type];
    if (!renderer) {
        console.error(`No renderer found for layer type: ${layer.type}`);
        return document.createElement('div');
    }
    return renderer(layer, container);
}

export { renderLayer, registerRenderer, customRenderers };
