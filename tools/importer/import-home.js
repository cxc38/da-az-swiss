/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsTherapyParser from './parsers/cards-therapy.js';
import columnsTeaserParser from './parsers/columns-teaser.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/myastrazeneca-cleanup.js';
import sectionsTransformer from './transformers/myastrazeneca-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-therapy': cardsTherapyParser,
  'columns-teaser': columnsTeaserParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Homepage: full-width welcome hero, intro text, therapy-area cards and a product-information teaser',
  urls: [
    'https://www.myastrazeneca.ch/',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['.teaser.teaser--home-hero'],
    },
    {
      name: 'cards-therapy',
      instances: ['.container--3-column-wrap'],
    },
    {
      name: 'columns-teaser',
      instances: ['.teaser.teaser--text-image'],
    },
  ],
  sections: [
    {
      id: '1',
      name: 'Welcome hero',
      selector: ['.aem-GridColumn:has(> .cmp-container > .teaser--home-hero)'],
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: '2',
      name: 'Intro, therapy areas and product information',
      selector: [
        '.aem-GridColumn.container--fixed:not(.hidden):has(.container--3-column-wrap)',
        '.aem-GridColumn.container--fixed:not(.hidden):has(.teaser--text-image)',
      ],
      style: null,
      blocks: ['cards-therapy', 'columns-teaser'],
      defaultContent: ['.container--tb-space-md:first-child .cmp-text', '.cmp-title h3'],
    },
    {
      id: '3',
      name: 'Revision / job code',
      selector: ['.aem-GridColumn:has(#vivo-id-wrap)'],
      style: 'revision',
      blocks: [],
      defaultContent: ['#vivo-id-wrap'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

// Source URL path -> target document path overrides.
// The homepage is imported to /home so the project's existing /index page is preserved.
const PATH_OVERRIDES = {
  '': '/home',
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (homepage -> /home; never an empty path)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const targetPath = PATH_OVERRIDES[rawPath] ?? (rawPath === '' ? '/index' : rawPath);
    const path = WebImporter.FileUtils.sanitizePath(targetPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
