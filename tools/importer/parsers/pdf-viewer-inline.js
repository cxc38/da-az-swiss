/* eslint-disable */
/* global WebImporter */
/**
 * Parser for pdf-viewer-inline. Base: pdf-viewer (custom block).
 * Source: https://www.myastrazeneca.ch/it/startseite/produkte/wainzua/brochure.html (instance: .pdfviewer)
 * Generated: 2026-10-12
 *
 * Block table (1 column): one row, one cell holding a single <a> to the PDF.
 *   href: data-cmp-document-path, fallback data-adobe-pdf-document-path (source DAM path,
 *         rewritten to the DA-hosted copy later by the import script)
 *   text: data-cmp-document-file-name, fallback data-adobe-pdf-document-title, then last path segment
 *
 * Validated selectors (source.html):
 *   .cmp-pdfviewer[data-cmp-document-path] - viewer root carrying the document attributes
 *   The iframe (./Brochure_files/iframe.html), link and script tags are ignored.
 */
export default function parse(element, { document }) {
  const viewer = element.matches('[data-cmp-document-path], [data-adobe-pdf-document-path]')
    ? element
    : element.querySelector('.cmp-pdfviewer, [data-cmp-document-path], [data-adobe-pdf-document-path]');

  const attr = (name) => (viewer?.getAttribute(name) || '').trim();
  const href = attr('data-cmp-document-path') || attr('data-adobe-pdf-document-path');

  if (!href) {
    element.remove();
    return;
  }

  const fileName = attr('data-cmp-document-file-name')
    || attr('data-adobe-pdf-document-title')
    || decodeURIComponent(href.split('?')[0].split('/').filter(Boolean).pop() || 'PDF');

  const link = document.createElement('a');
  link.href = href;
  link.textContent = fileName;

  const cells = [[link]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'pdf-viewer-inline', cells });
  element.replaceWith(block);
}
