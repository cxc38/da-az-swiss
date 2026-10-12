/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.myastrazeneca.ch/ (instance: .teaser.teaser--home-hero)
 * Generated: 2026-10-06
 *
 * Block table (1 column):
 *   row 1: background image (desktop rendition)
 *   row 2: h1 heading + description paragraph(s) (+ CTA if present)
 *
 * Validated selectors (source.html):
 *   .cmp-teaser__image-desktop img  - desktop image (mobile rendition .cmp-teaser__image-mobile is skipped)
 *   h1.cmp-teaser__title            - title; contains a nested <p>, so text is re-wrapped in a clean h1
 *   .cmp-teaser__description        - description paragraphs
 *   .cmp-teaser__action-link        - optional CTA (not present on home page)
 */
export default function parse(element, { document }) {
  // Image: prefer desktop rendition, fall back to mobile or any image
  const image = element.querySelector('.cmp-teaser__image-desktop img')
    || element.querySelector('.cmp-teaser__image-mobile img')
    || element.querySelector('img');

  // Title: source wraps text in <p> inside <h1>; rebuild a clean heading
  const titleEl = element.querySelector('.cmp-teaser__title')
    || element.querySelector('h1, h2, h3');
  let heading = null;
  if (titleEl && titleEl.textContent.trim()) {
    const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h1';
    heading = document.createElement(level);
    heading.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
  }

  // Description paragraphs
  const descWrap = element.querySelector('.cmp-teaser__description');
  let description = [];
  if (descWrap) {
    description = [...descWrap.querySelectorAll(':scope > p')]
      .filter((p) => p.textContent.replace(/ /g, ' ').trim() || p.querySelector('a, img'));
    if (!description.length && descWrap.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descWrap.textContent.trim();
      description = [p];
    }
  }

  // Optional CTA(s)
  const ctas = [...element.querySelectorAll('.cmp-teaser__action-link')];

  if (!heading && !description.length && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (image) cells.push([image]);
  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...description);
  ctas.forEach((a) => {
    const p = document.createElement('p');
    a.textContent = a.textContent.trim();
    p.append(a);
    contentCell.push(p);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
