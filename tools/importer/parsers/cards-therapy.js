/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-therapy. Base: cards.
 * Source: https://www.myastrazeneca.ch/ (instance: .container--3-column-wrap)
 * Generated: 2026-10-06
 *
 * Block table (2 columns, one row per card):
 *   cell 1: card image (desktop rendition)
 *   cell 2: heading + description paragraphs + indication links (line-break separated)
 *
 * Validated selectors (source.html):
 *   .cmp-teaser                       - one per card (block-level inner wrapper; iterationSafe per structure.json)
 *   .cmp-teaser__image-desktop img    - card image (mobile rendition skipped)
 *   .cmp-teaser__title                - h4 containing a nested <p>; rebuilt as clean heading
 *   .cmp-teaser__description > p      - description, intro line and indication links paragraphs
 *   .cmp-teaser__action-link          - optional CTA (not present on home page)
 */
function isEmptyParagraph(p) {
  return !p.textContent.replace(/ /g, ' ').trim() && !p.querySelector('a, img');
}

export default function parse(element, { document }) {
  // Iterate the stable block-level teaser wrappers (3 on home page)
  let cards = [...element.querySelectorAll('.cmp-teaser')];
  if (!cards.length) cards = [...element.querySelectorAll(':scope > div > .teaser, :scope > .teaser')];

  const cells = [];
  cards.forEach((card) => {
    const image = card.querySelector('.cmp-teaser__image-desktop img')
      || card.querySelector('.cmp-teaser__image-mobile img')
      || card.querySelector('img');

    const contentCell = [];

    const titleEl = card.querySelector('.cmp-teaser__title') || card.querySelector('h2, h3, h4, h5');
    if (titleEl && titleEl.textContent.trim()) {
      const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : 'h3';
      const heading = document.createElement(level);
      const titleLink = titleEl.querySelector('a[href]');
      const text = titleEl.textContent.replace(/\s+/g, ' ').trim();
      if (titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.getAttribute('href');
        a.textContent = text;
        heading.append(a);
      } else {
        heading.textContent = text;
      }
      contentCell.push(heading);
    }

    const descWrap = card.querySelector('.cmp-teaser__description');
    if (descWrap) {
      const paras = [...descWrap.querySelectorAll(':scope > p')].filter((p) => !isEmptyParagraph(p));
      if (paras.length) {
        contentCell.push(...paras);
      } else if (descWrap.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = descWrap.textContent.trim();
        contentCell.push(p);
      }
    }

    card.querySelectorAll('.cmp-teaser__action-link').forEach((a) => {
      const p = document.createElement('p');
      a.textContent = a.textContent.trim();
      p.append(a);
      contentCell.push(p);
    });

    if (!image && !contentCell.length) return;
    cells.push([image || '', contentCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-therapy', cells });
  element.replaceWith(block);
}
