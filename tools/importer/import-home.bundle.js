/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image-desktop img") || element.querySelector(".cmp-teaser__image-mobile img") || element.querySelector("img");
    const titleEl = element.querySelector(".cmp-teaser__title") || element.querySelector("h1, h2, h3");
    let heading = null;
    if (titleEl && titleEl.textContent.trim()) {
      const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h1";
      heading = document2.createElement(level);
      heading.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
    }
    const descWrap = element.querySelector(".cmp-teaser__description");
    let description = [];
    if (descWrap) {
      description = [...descWrap.querySelectorAll(":scope > p")].filter((p) => p.textContent.replace(/ /g, " ").trim() || p.querySelector("a, img"));
      if (!description.length && descWrap.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descWrap.textContent.trim();
        description = [p];
      }
    }
    const ctas = [...element.querySelectorAll(".cmp-teaser__action-link")];
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
      const p = document2.createElement("p");
      a.textContent = a.textContent.trim();
      p.append(a);
      contentCell.push(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-therapy.js
  function isEmptyParagraph(p) {
    return !p.textContent.replace(/ /g, " ").trim() && !p.querySelector("a, img");
  }
  function parse2(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(".cmp-teaser")];
    if (!cards.length) cards = [...element.querySelectorAll(":scope > div > .teaser, :scope > .teaser")];
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".cmp-teaser__image-desktop img") || card.querySelector(".cmp-teaser__image-mobile img") || card.querySelector("img");
      const contentCell = [];
      const titleEl = card.querySelector(".cmp-teaser__title") || card.querySelector("h2, h3, h4, h5");
      if (titleEl && titleEl.textContent.trim()) {
        const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h3";
        const heading = document2.createElement(level);
        const titleLink = titleEl.querySelector("a[href]");
        const text = titleEl.textContent.replace(/\s+/g, " ").trim();
        if (titleLink) {
          const a = document2.createElement("a");
          a.href = titleLink.getAttribute("href");
          a.textContent = text;
          heading.append(a);
        } else {
          heading.textContent = text;
        }
        contentCell.push(heading);
      }
      const descWrap = card.querySelector(".cmp-teaser__description");
      if (descWrap) {
        const paras = [...descWrap.querySelectorAll(":scope > p")].filter((p) => !isEmptyParagraph(p));
        if (paras.length) {
          contentCell.push(...paras);
        } else if (descWrap.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = descWrap.textContent.trim();
          contentCell.push(p);
        }
      }
      card.querySelectorAll(".cmp-teaser__action-link").forEach((a) => {
        const p = document2.createElement("p");
        a.textContent = a.textContent.trim();
        p.append(a);
        contentCell.push(p);
      });
      if (!image && !contentCell.length) return;
      cells.push([image || "", contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-therapy", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-teaser.js
  function parse3(element, { document: document2 }) {
    const textCell = [];
    const titleEl = element.querySelector(".cmp-teaser__title");
    if (titleEl && titleEl.textContent.trim()) {
      const level = /^H[1-6]$/.test(titleEl.tagName) ? titleEl.tagName.toLowerCase() : "h3";
      const heading = document2.createElement(level);
      heading.textContent = titleEl.textContent.replace(/\s+/g, " ").trim();
      textCell.push(heading);
    }
    const descWrap = element.querySelector(".cmp-teaser__description");
    if (descWrap) {
      const paras = [...descWrap.querySelectorAll(":scope > p")].filter((p) => p.textContent.replace(/ /g, " ").trim() || p.querySelector("a, img"));
      if (paras.length) {
        textCell.push(...paras);
      } else if (descWrap.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descWrap.textContent.trim();
        textCell.push(p);
      }
    }
    let ctas = [...element.querySelectorAll(".cmp-teaser__action-container a[href]")];
    if (!ctas.length) ctas = [...element.querySelectorAll("a.cmp-teaser__action-link")];
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.replace(/\s+/g, " ").trim();
      p.append(link);
      textCell.push(p);
    });
    const image = element.querySelector(".cmp-teaser__image-desktop img") || element.querySelector(".cmp-teaser__image-mobile img") || element.querySelector("img");
    if (!textCell.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell, image || ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/myastrazeneca-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Cookie consent banner: <div id="CookieReportsPanel"> (line ~1018)
        "#CookieReportsPanel",
        // Hidden personalization grid columns wrapping #specialityParentDiv / #interestParentDiv
        // <div class="container responsivegrid container--fixed container--tb-space hidden ... aem-GridColumn ...">
        ".aem-GridColumn.hidden",
        "#specialityParentDiv",
        "#interestParentDiv",
        // Empty dynamic list: <div class="masterContentList"> with empty .cmp-masterlist__items
        "div.masterContentList"
      ]);
      const doc = payload && payload.document || element.ownerDocument;
      doc.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"], meta[property="og:image:url"]').forEach((meta) => {
        const value = meta.getAttribute("content");
        if (value) meta.setAttribute("content", value.replace(/^(https?:\/\/[^/]+)\/{2,}/, "$1/"));
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Global header experience fragment (includes megamenu, search box)
        "div.experiencefragment.cmp-experiencefragment--customMenu",
        // Global footer experience fragment
        "div.experiencefragment.cmp-experiencefragment--footerSocial",
        // Language switcher (DE/EN/FR/IT)
        "div.languagenavigation",
        // Breadcrumb (single "Startseite" item)
        "div.breadcrumb",
        // Non-authorable leftovers: stylesheet links and hidden inputs (<input>, #identityLogoutURL)
        "link",
        "input"
      ]);
    }
  }

  // tools/importer/transformers/myastrazeneca-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-banner": parse,
    "cards-therapy": parse2,
    "columns-teaser": parse3
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Homepage: full-width welcome hero, intro text, therapy-area cards and a product-information teaser",
    urls: [
      "https://www.myastrazeneca.ch/"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [".teaser.teaser--home-hero"]
      },
      {
        name: "cards-therapy",
        instances: [".container--3-column-wrap"]
      },
      {
        name: "columns-teaser",
        instances: [".teaser.teaser--text-image"]
      }
    ],
    sections: [
      {
        id: "1",
        name: "Welcome hero",
        selector: [".aem-GridColumn:has(> .cmp-container > .teaser--home-hero)"],
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "2",
        name: "Intro, therapy areas and product information",
        selector: [
          ".aem-GridColumn.container--fixed:not(.hidden):has(.container--3-column-wrap)",
          ".aem-GridColumn.container--fixed:not(.hidden):has(.teaser--text-image)"
        ],
        style: null,
        blocks: ["cards-therapy", "columns-teaser"],
        defaultContent: [".container--tb-space-md:first-child .cmp-text", ".cmp-title h3"]
      },
      {
        id: "3",
        name: "Revision / job code",
        selector: [".aem-GridColumn:has(#vivo-id-wrap)"],
        style: null,
        blocks: [],
        defaultContent: ["#vivo-id-wrap"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  var PATH_OVERRIDES = {
    "": "/home"
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      var _a;
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const targetPath = (_a = PATH_OVERRIDES[rawPath]) != null ? _a : rawPath === "" ? "/index" : rawPath;
      const path = WebImporter.FileUtils.sanitizePath(targetPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
