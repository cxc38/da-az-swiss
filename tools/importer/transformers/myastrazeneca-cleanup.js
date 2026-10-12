/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: myastrazeneca.ch site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Cookie consent banner: <div id="CookieReportsPanel"> (line ~1018)
      '#CookieReportsPanel',
      // Hidden personalization grid columns wrapping #specialityParentDiv / #interestParentDiv
      // <div class="container responsivegrid container--fixed container--tb-space hidden ... aem-GridColumn ...">
      '.aem-GridColumn.hidden',
      '#specialityParentDiv',
      '#interestParentDiv',
      // Empty dynamic list: <div class="masterContentList"> with empty .cmp-masterlist__items
      'div.masterContentList',
    ]);

    // Source og:image has a double slash after the host ("https://www.myastrazeneca.ch//content/dam/...");
    // adjustImageUrls turns that into "https://content/dam/...", so normalize it before metadata is created.
    const doc = (payload && payload.document) || element.ownerDocument;
    doc.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"], meta[property="og:image:url"]').forEach((meta) => {
      const value = meta.getAttribute('content');
      if (value) meta.setAttribute('content', value.replace(/^(https?:\/\/[^/]+)\/{2,}/, '$1/'));
    });
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Global header experience fragment (includes megamenu, search box)
      'div.experiencefragment.cmp-experiencefragment--customMenu',
      // Global footer experience fragment
      'div.experiencefragment.cmp-experiencefragment--footerSocial',
      // Language switcher (DE/EN/FR/IT)
      'div.languagenavigation',
      // Breadcrumb (single "Startseite" item)
      'div.breadcrumb',
      // Non-authorable leftovers: stylesheet links and hidden inputs (<input>, #identityLogoutURL)
      'link',
      'input',
    ]);
  }
}
