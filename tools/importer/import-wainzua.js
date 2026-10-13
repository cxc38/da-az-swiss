/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import pdfViewerInlineParser from './parsers/pdf-viewer-inline.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/myastrazeneca-cleanup.js';
import sectionsTransformer from './transformers/myastrazeneca-sections.js';

// PARSER REGISTRY
const parsers = {
  'pdf-viewer-inline': pdfViewerInlineParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'wainzua',
  description: 'HCP product brochure page: a single inline PDF viewer (source pages are HCP-login restricted; imported from saved snapshot)',
  urls: [
    'https://www.myastrazeneca.ch/it/startseite/produkte/wainzua/brochure.html',
  ],
  blocks: [
    {
      name: 'pdf-viewer-inline',
      instances: ['.pdfviewer'],
    },
  ],
  sections: [
    {
      id: '1',
      name: 'Brochure PDF viewer',
      selector: [
        '.aem-GridColumn.container--fixed:has(> .cmp-container > .pdfviewer)',
        '.container--fixed:has(.pdfviewer)',
      ],
      style: null,
      blocks: ['pdf-viewer-inline'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

// Source URL path -> target document path overrides.
const PATH_OVERRIDES = {
  '/it/startseite/produkte/wainzua/brochure': '/hero/brochure',
};

/**
 * Point source DAM PDF links at the copy uploaded next to the target page
 * (e.g. /content/dam/.../file.pdf -> /hero/file.pdf for /hero/brochure).
 */
function rewritePdfLinks(main, targetPath) {
  const folder = targetPath.substring(0, targetPath.lastIndexOf('/'));
  main.querySelectorAll('a[href*="/content/dam/"]').forEach((a) => {
    const href = a.getAttribute('href');
    const { pathname } = new URL(href, 'https://www.myastrazeneca.ch');
    if (!/\.pdf$/i.test(pathname)) return;
    a.setAttribute('href', `${folder}/${pathname.split('/').pop()}`);
  });
}

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

    // 1. Initial cleanup
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

    // 4. Final cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. Target path (never empty)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const targetPath = PATH_OVERRIDES[rawPath] ?? (rawPath === '' ? '/index' : rawPath);
    const path = WebImporter.FileUtils.sanitizePath(targetPath);

    // 6. PDF links -> DA-hosted copy next to the page
    rewritePdfLinks(main, targetPath);

    // 7. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
