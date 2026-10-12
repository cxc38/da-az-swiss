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

  // tools/importer/import-wainzua.js
  var import_wainzua_exports = {};
  __export(import_wainzua_exports, {
    default: () => import_wainzua_default
  });

  // tools/importer/parsers/pdf-viewer-inline.js
  function parse(element, { document: document2 }) {
    const viewer = element.matches("[data-cmp-document-path], [data-adobe-pdf-document-path]") ? element : element.querySelector(".cmp-pdfviewer, [data-cmp-document-path], [data-adobe-pdf-document-path]");
    const attr = (name) => ((viewer == null ? void 0 : viewer.getAttribute(name)) || "").trim();
    const href = attr("data-cmp-document-path") || attr("data-adobe-pdf-document-path");
    if (!href) {
      element.remove();
      return;
    }
    const fileName = attr("data-cmp-document-file-name") || attr("data-adobe-pdf-document-title") || decodeURIComponent(href.split("?")[0].split("/").filter(Boolean).pop() || "PDF");
    const link = document2.createElement("a");
    link.href = href;
    link.textContent = fileName;
    const cells = [[link]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "pdf-viewer-inline", cells });
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
        const value = (meta.getAttribute("content") || "").replace(/^(https?:\/\/[^/]+)\/{2,}/, "$1/");
        if (!value || /^(https?:\/\/[^/]+)?\/?$/.test(value)) meta.remove();
        else meta.setAttribute("content", value);
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
        // HCP login/account header column (wainzua brochure snapshot)
        ".container--headerLogin",
        // Signed-in like/share/save widget incl. its hidden "errorMessage" popup (wainzua brochure snapshot)
        "div.socialFeatures",
        // Non-authorable leftovers: stylesheet links, hidden inputs (<input>, #identityLogoutURL),
        // and ./Brochure_files/ scripts/styles from the saved raw snapshot
        "link",
        "input",
        "script",
        "style",
        "noscript"
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

  // tools/importer/import-wainzua.js
  var parsers = {
    "pdf-viewer-inline": parse
  };
  var PAGE_TEMPLATE = {
    name: "wainzua",
    description: "HCP product brochure page: a single inline PDF viewer (source pages are HCP-login restricted; imported from saved snapshot)",
    urls: [
      "https://www.myastrazeneca.ch/it/startseite/produkte/wainzua/brochure.html"
    ],
    blocks: [
      {
        name: "pdf-viewer-inline",
        instances: [".pdfviewer"]
      }
    ],
    sections: [
      {
        id: "1",
        name: "Brochure PDF viewer",
        selector: [
          ".aem-GridColumn.container--fixed:has(> .cmp-container > .pdfviewer)",
          ".container--fixed:has(.pdfviewer)"
        ],
        style: null,
        blocks: ["pdf-viewer-inline"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  var PATH_OVERRIDES = {
    "/it/startseite/produkte/wainzua/brochure": "/hero/brochure"
  };
  function rewritePdfLinks(main, targetPath) {
    const folder = targetPath.substring(0, targetPath.lastIndexOf("/"));
    main.querySelectorAll('a[href*="/content/dam/"]').forEach((a) => {
      const href = a.getAttribute("href");
      const { pathname } = new URL(href, "https://www.myastrazeneca.ch");
      if (!/\.pdf$/i.test(pathname)) return;
      a.setAttribute("href", `${folder}/${pathname.split("/").pop()}`);
    });
  }
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
  var import_wainzua_default = {
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
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const targetPath = (_a = PATH_OVERRIDES[rawPath]) != null ? _a : rawPath === "" ? "/index" : rawPath;
      const path = WebImporter.FileUtils.sanitizePath(targetPath);
      rewritePdfLinks(main, targetPath);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
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
  return __toCommonJS(import_wainzua_exports);
})();
