/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-teaser. Base: columns.
 * Source: https://www.myastrazeneca.ch/ (instance: .teaser.teaser--text-image)
 * Generated: 2026-10-06
 *
 * Block table (2 columns, 1 row):
 *   cell 1: optional title + description paragraphs + CTA link ("Jetzt entdecken")
 *   cell 2: image (desktop rendition)
 *
 * Validated selectors (source.html):
 *   .cmp-teaser__description > p            - description paragraphs
 *   .cmp-teaser__action-container a         - CTA link
 *   .cmp-teaser__image-desktop img          - desktop image (mobile rendition, wrapped in a link, is skipped)
 *   .cmp-teaser__title                      - optional title (not present on home page)
 */
export default function parse(element, { document }) {
  const textCell = [];

  // Optional title (AEM core teaser may render one)
  const titleEl = element.querySelector('.cmp-teaser__title');
  if (titleEl && titleEl.textContent.trim()) {
    const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h3';
    const heading = document.createElement(level);
    heading.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
    textCell.push(heading);
  }

  // Description paragraphs
  const descWrap = element.querySelector('.cmp-teaser__description');
  if (descWrap) {
    const paras = [...descWrap.querySelectorAll(':scope > p')]
      .filter((p) => p.textContent.replace(/ /g, ' ').trim() || p.querySelector('a, img'));
    if (paras.length) {
      textCell.push(...paras);
    } else if (descWrap.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descWrap.textContent.trim();
      textCell.push(p);
    }
  }

  // CTA link(s)
  let ctas = [...element.querySelectorAll('.cmp-teaser__action-container a[href]')];
  if (!ctas.length) ctas = [...element.querySelectorAll('a.cmp-teaser__action-link')];
  ctas.forEach((a) => {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
    p.append(link);
    textCell.push(p);
  });

  // Image: desktop rendition preferred
  const image = element.querySelector('.cmp-teaser__image-desktop img')
    || element.querySelector('.cmp-teaser__image-mobile img')
    || element.querySelector('img');

  if (!textCell.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell, image || '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-teaser', cells });
  element.replaceWith(block);
}
