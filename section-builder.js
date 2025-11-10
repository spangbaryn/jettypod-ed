import { renderLayer } from './section-renderer.js';

/**
 * Builds a complete fullscreen section from schema
 * @param {import('./section-schema.js').Section} section
 * @returns {HTMLElement}
 */
function buildSection(section) {
    // Main section container
    const sectionContainer = document.createElement('div');
    sectionContainer.id = section.id;
    sectionContainer.className = 'fullscreen-section';
    sectionContainer.dataset.sectionId = section.id;
    sectionContainer.style.cssText = `
        height: ${section.scroll?.height || '250vh'};
        position: relative;
    `;

    // Build layers (backgrounds, images, custom visuals)
    const layerElements = [];
    section.layers.forEach(layer => {
        const el = renderLayer(layer, sectionContainer);
        layerElements.push(el);
    });

    // Build hero content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'section-content';
    contentContainer.dataset.section = section.id;
    const heroTop = section.hero.top || '30%';
    contentContainer.style.cssText = `
        position: fixed;
        top: ${heroTop};
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        max-width: 1200px;
        padding: 40px;
        z-index: 100;
        opacity: 0;
        transition: opacity 0.3s ease-out;
        pointer-events: none;
    `;

    // Build hero text
    const heroText = document.createElement('h1');
    heroText.className = 'section-text';
    heroText.innerHTML = section.hero.text;
    heroText.style.cssText = `
        font-size: ${section.hero.fontSize || 'clamp(2rem, 5vw, 3.5rem)'};
        font-weight: 900;
        text-align: ${section.hero.style || 'center'};
        max-width: 1000px;
        margin: 0 auto;
        line-height: 1.2;
        position: relative;
        z-index: 100;
    `;

    contentContainer.appendChild(heroText);

    // Append all elements to body (fixed positioning requires this)
    // Background layers first
    layerElements.forEach(el => {
        if (el.className.includes('section-background')) {
            document.body.appendChild(el);
        }
    });

    // Visual layers (images, custom) - append to body so their positioning is viewport-relative
    layerElements.forEach(el => {
        if (!el.className.includes('section-background')) {
            el.dataset.section = section.id; // Track which section this belongs to
            document.body.appendChild(el);
        }
    });

    // Content container (hero text) - last so it's on top in DOM order
    document.body.appendChild(contentContainer);

    return sectionContainer;
}

/**
 * Builds all sections from a schema and inserts them into the DOM
 * @param {import('./section-schema.js').SectionSchema} schema
 * @param {HTMLElement} insertBeforeElement - Element to insert sections before
 */
function buildAllSections(schema, insertBeforeElement) {
    const sections = schema.sections.map(buildSection);

    sections.forEach(section => {
        insertBeforeElement.parentNode.insertBefore(section, insertBeforeElement);
    });

    return sections;
}

/**
 * Setup scroll-based fade behavior for all sections
 * @param {number} [fadeZone=0.7] - Default fade zone (can be overridden per section)
 */
function setupScrollBehavior(fadeZone = 0.7) {
    function updateSectionOpacity() {
        const sections = document.querySelectorAll('.fullscreen-section');
        const backgrounds = document.querySelectorAll('.section-background');
        const contents = document.querySelectorAll('.section-content');
        const comparisonContainer = document.getElementById('comparison-container');
        const windowHeight = window.innerHeight;

        // Hide comparison container until last fullscreen section is done
        if (comparisonContainer) {
            const lastSection = sections[sections.length - 1];
            const lastRect = lastSection?.getBoundingClientRect();

            if (lastRect && lastRect.bottom > windowHeight * 0.5) {
                comparisonContainer.style.opacity = '0';
                comparisonContainer.style.pointerEvents = 'none';
            } else if (lastRect) {
                const fadeIn = Math.min(1, (windowHeight * 0.5 - lastRect.bottom) / (windowHeight * 0.3));
                comparisonContainer.style.opacity = fadeIn;
                comparisonContainer.style.pointerEvents = fadeIn > 0.5 ? 'auto' : 'none';
            }
        }

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionId = section.id;

            // Find all elements for this section
            const sectionBg = backgrounds[index];
            const sectionContent = contents[index];
            const sectionImages = document.querySelectorAll(`img[data-section="${sectionId}"]`);
            const sectionVisuals = document.querySelectorAll(`.visual-container[data-section="${sectionId}"]`);

            // Hide completely when out of view
            if (rect.bottom < 0 || rect.top > windowHeight) {
                if (sectionBg) sectionBg.style.display = 'none';
                if (sectionContent) sectionContent.style.display = 'none';
                sectionImages.forEach(img => img.style.display = 'none');
                sectionVisuals.forEach(vis => vis.style.display = 'none');
                return;
            }

            // Show when in view range
            if (sectionBg) sectionBg.style.display = 'block';
            if (sectionContent) sectionContent.style.display = 'block';
            sectionImages.forEach(img => img.style.display = 'block');
            sectionVisuals.forEach(vis => vis.style.display = 'block');

            // Calculate center of section relative to viewport center
            const sectionCenter = rect.top + (rect.height / 2);
            const viewportCenter = windowHeight / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);

            // Use section-specific fade zone or default
            const sectionFadeZone = windowHeight * fadeZone;
            const holdZone = windowHeight * 0.4; // Hold at 100% opacity within 40vh of center

            // Calculate opacity based on distance from center
            let opacity = 0;
            if (distance < holdZone) {
                // Stay at full opacity when close to center
                opacity = 1;
            } else if (distance < sectionFadeZone) {
                // Fade out only after leaving the hold zone
                opacity = 1 - ((distance - holdZone) / (sectionFadeZone - holdZone));
            }

            // Apply opacity to background, content, and images
            if (sectionBg) {
                sectionBg.style.opacity = Math.max(0, Math.min(1, opacity));
            }
            if (sectionContent) {
                sectionContent.style.opacity = Math.max(0, Math.min(1, opacity));
            }
            sectionImages.forEach(img => {
                img.style.opacity = Math.max(0, Math.min(1, opacity));
            });

            // Special handling for challenge cards - they fade in AFTER section is at full opacity
            sectionVisuals.forEach(vis => {
                if (vis.classList.contains('challenge-cards')) {
                    // Trigger animation sequence when section reaches full opacity
                    if (opacity >= 1 && !vis.dataset.animationTriggered) {
                        vis.dataset.animationTriggered = 'true';
                        vis.classList.add('section-active');

                        // Total animation: cards in (0.4s * 4 = 1.6s) + hold (3s) + cards out (0.3s * 4 = 1.2s) = 5.8s
                        setTimeout(() => {
                            vis.classList.add('cards-exit');
                        }, 4600); // Start exit after cards are in + hold time
                    }
                    // Reset if scrolled away
                    if (opacity < 0.5 && vis.dataset.animationTriggered) {
                        vis.dataset.animationTriggered = '';
                        vis.classList.remove('section-active', 'cards-exit');
                    }
                } else {
                    // Other visuals follow normal opacity
                    vis.style.opacity = Math.max(0, Math.min(1, opacity));
                }
            });
        });
    }

    // Run on scroll and on load
    window.addEventListener('scroll', updateSectionOpacity);
    updateSectionOpacity();
}

export { buildSection, buildAllSections, setupScrollBehavior };
