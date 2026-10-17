/* OWNER-EDITABLE CONTENT -------------------------------------------------
 * Add objects to a section's entries array; they appear from top to bottom.
 * Each entry can have image or video, title, subtitle, extraInformation, and HTML body.
 * Use ordinary HTML in body for paragraphs, videos, or other media.
 * Section IDs must stay unique. See README.md for examples.
 * A blank symbolImage.src deliberately leaves Alive/Breath completely empty.
 * Add a recommendation URL to make its label a link.
 */
const siteConfig = {
  title: ["Digitally Free,", "Spiritually in Love"],
  mastheadImage: { src: "", alt: "Site Buddy" },
  symbolImage: { src: "", alt: "" },
  recommendations: [
    { label: "Sweetheart - Effin", url: "https://soundcloud.com/effin/sweetheart-1" },
    { label: "Barrel Meet Head (feat. yvm3) - Nimda", url: "https://soundcloud.com/nimda_uk/nimda-barrel-meet-head-ft-yvm3" },
    { label: "Don't Get Lost in Heaven - Gorillaz", url: "https://www.youtube.com/watch?v=1L0bdrrJegA" },
    { label: "Lamenting Malice - Cynthoni", url: "https://cynthoni.bandcamp.com/album/lamenting-malice" },
    { label: "Marathon, Vol I: Somehwere in the Heavens (Original Game Soundtrack) - Ryan Lott", url: "https://www.youtube.com/watch?v=yGqg1PGp1Vc&list=PLml527USuL711E6pP8s37-TVWq_mDOr4D" },
  ],
  connections: {
    friends: { title: "Redirection Hub", body: "<p>Wouldn't you like to know. ₍^. .^₎⟆</p>" },
  },
};

const layers = [
  { id: "blog", title: "MySoapBox.000", layout: "writing", sections: [
    { id: "blog-1", title: "O' Brave New World", layout: "writing", entries: [
      { image: { src: "", alt: "" }, title: "Hello Brave New World", subtitle: "10-15/16/17-26", extraInformation: "BraveNewW0rld.Dystopia", body: "<p>Paragraph 1</p>" }, 
  ] },
  ] },
  { id: "writings", title: "Writings", layout: "writing", sections: [
    { id: "writings-1", title: "Endless Nightmare", layout: "writing", entries: [
      { image: { src: "", alt: "" }, title: "Title", subtitle: "Subtitle", extraInformation: "Extra Information", body: "<p>Paragraph 1</p>" },
    ] },
    { id: "writings-2", title: "Beautiful Weapons", layout: "writing", entries: [
      { image: { src: "", alt: "" }, title: "Title", subtitle: "Subtitle", extraInformation: "Extra Information", body: "<p>Paragraph 1</p>" },
    ] },
  ] },
  { id: "random", title: "Random", sections: [
    { id: "random-2", title: "(ó﹏ò｡).exe", layout: "media", entries: [
      { image: { src: "", alt: "" }, audio: { src: "", label: "" }, video: { src: "", label: "" } },
    ] },
  ] },
];

/* FIXED WINDOW / TABS -------------------------------------------------- */
const MAX_TABS = 7;
const entries = new Map();
const openTabs = [];
let activeId = null;
let connectionTrigger = null;
const tabs = document.querySelector("#tabs");
const panels = document.querySelector("#panels");
const message = document.querySelector("#tab-message");
const symbolImage = document.querySelector("#symbol-image");
const connectionPanel = document.querySelector("#connection-panel");
const closeConnectionButton = document.querySelector("#close-connection");

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function openButton(entry, className, label = entry.title) {
  const button = element("button", className, label);
  button.type = "button";
  button.dataset.open = entry.id;
  return button;
}

const title = document.querySelector("#site-title");
function renderSiteTitle(lines) {
  title.replaceChildren();
  lines.forEach((line, index) => {
    if (index) title.append(document.createElement("br"));
    title.append(document.createTextNode(line));
  });
  title.setAttribute("aria-label", lines.join(" "));
}
renderSiteTitle(siteConfig.title);

let glitchTimer;
let glitchRestoreTimer;
function scheduleTitleGlitch() {
  window.clearTimeout(glitchTimer);
  if (document.hidden) return;
  glitchTimer = window.setTimeout(() => {
    const distortedTitle = ["Digitally (not) Free", "Spirtual(ly in) Love"];
    renderSiteTitle(distortedTitle);
    title.dataset.glitch = distortedTitle.join("\\n");
    title.classList.add("glitching");
    window.clearTimeout(glitchRestoreTimer);
    glitchRestoreTimer = window.setTimeout(() => {
      title.classList.remove("glitching");
      title.removeAttribute("data-glitch");
      renderSiteTitle(siteConfig.title);
      scheduleTitleGlitch();
    }, 900);
  }, 90000 + Math.random() * 60000);
}
scheduleTitleGlitch();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearTimeout(glitchTimer);
    window.clearTimeout(glitchRestoreTimer);
    title.classList.remove("glitching");
    title.removeAttribute("data-glitch");
    renderSiteTitle(siteConfig.title);
  } else {
    scheduleTitleGlitch();
  }
});

// Show the pet artwork only when an image has been supplied.
if (siteConfig.mastheadImage.src) {
  const masthead = document.querySelector(".masthead");
  const pet = element("img", "masthead-pet");
  pet.src = siteConfig.mastheadImage.src;
  pet.alt = siteConfig.mastheadImage.alt;
  pet.width = 96;
  pet.height = 128;
  masthead.classList.add("has-pet");
  masthead.append(pet);
}
const entryPoint = { id: "entry-point", title: "Entry Point", layerTitle: "Welcome", layout: "welcome" };
entries.set(entryPoint.id, entryPoint);
const entryPointGroup = element("div", "layer-group");
entryPointGroup.append(openButton(entryPoint, "layer-heading layer-open", entryPoint.layerTitle));
document.querySelector("#layer-tree").append(entryPointGroup);

layers.forEach((layer) => {
  layer.sections.forEach((section) => entries.set(section.id, { layout: layer.layout, ...section, parent: layer.title }));
  const group = element("div", "layer-group");
  const toggle = element("button", "layer-heading");
  toggle.type = "button";
  const label = element("span", "layer-open", layer.title);
  const arrow = element("span", "layer-toggle", "›");
  arrow.setAttribute("aria-hidden", "true");
  toggle.append(label, arrow);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", `Expand ${layer.title} subsections`);
  toggle.setAttribute("aria-controls", `sections-${layer.id}`);
  const list = element("ul", "sublayers");
  list.id = `sections-${layer.id}`;
  list.hidden = true;
  layer.sections.forEach((section) => {
    const item = element("li");
    item.append(openButton(section, "sublayer"));
    list.append(item);
  });
  toggle.addEventListener("click", () => {
    list.hidden = !list.hidden;
    toggle.setAttribute("aria-expanded", String(!list.hidden));
    toggle.setAttribute("aria-label", `${list.hidden ? "Expand" : "Collapse"} ${layer.title} subsections`);
  });
  group.append(toggle, list);
  document.querySelector("#layer-tree").append(group);
});

function makeContentEntry(item, writingLayout, drawingLayout = false) {
  const article = element("article", "content-entry");
  if (item.image?.src) {
    const image = element("img", "entry-image");
    image.src = item.image.src;
    image.alt = item.image.alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    article.append(image);
  } else if (item.video?.src) {
    const video = element("video", "entry-video");
    video.src = item.video.src;
    video.setAttribute("aria-label", item.video.label || "Video entry");
    video.controls = true;
    video.playsInline = true;
    video.autoplay = false;
    video.preload = "none";
    article.append(video);
  } else if (drawingLayout) {
    const placeholder = drawingLayout
      ? element("div", "media-placeholder", "Image file placeholder")
      : element("div", "entry-image-placeholder");
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", drawingLayout ? "Image file placeholder" : "Image or video placeholder");
    article.append(placeholder);
  }
  if (item.title) article.append(element(writingLayout ? "h2" : "h3", "entry-title", item.title));
  if (item.subtitle) article.append(element("p", "entry-subtitle", item.subtitle));
  if (item.extraInformation) article.append(element("p", "entry-information", item.extraInformation));
  if (item.body) {
    const body = element("div", "entry-body");
    // Only the owner's authored content is rendered as HTML; labels use textContent.
    body.innerHTML = item.body;
    body.querySelectorAll("img").forEach((image) => { image.loading = "lazy"; });
    body.querySelectorAll("video").forEach((video) => {
      video.controls = true;
      video.playsInline = true;
      video.autoplay = false;
      video.preload = "none";
    });
    article.append(body);
  }
  return article;
}

// Media tabs contain only files or their empty slots, without entry headings.
function makeMediaEntry(item) {
  const kind = ["image", "audio", "video"].find((type) => item[type]?.src);
  const media = item[kind] || {};
  if (!media.src) {
    const placeholder = element("div", "media-placeholder", "Media placeholder");
    placeholder.setAttribute("aria-label", "Placeholder for an image, audio, or video file");
    return placeholder;
  }
  if (kind === "audio") {
    const audio = element("audio", "entry-audio");
    audio.src = media.src;
    audio.controls = true;
    audio.preload = "none";
    audio.setAttribute("aria-label", media.label || "Audio entry");
    return audio;
  }
  return makeContentEntry({ [kind]: media }, false);
}

function makePanel(entry) {
  const panel = element("section", "content-panel");
  panel.id = `panel-${entry.id}`;
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `tab-${entry.id}`);
  panel.tabIndex = 0;
  if (entry.layout === "welcome") {
    panel.classList.add("entry-point-panel");
    const welcome = document.querySelector("#entry-point-template").content.cloneNode(true);
    panel.append(welcome);
    return panel;
  }
  const writingLayout = entry.layout === "writing";
  const mediaLayout = entry.layout === "media";
  const drawingLayout = entry.layout === "drawing";
  if (!writingLayout && !mediaLayout && !drawingLayout) {
    panel.append(element("p", "eyebrow", entry.parent || "Layer"), element("h2", "", entry.title));
  }
  const feed = element("div", "entry-list");
  // Legacy section bodies still work; new content belongs in the entries array.
  const items = mediaLayout ? (entry.entries || []) : entry.entries?.length ? entry.entries : [
    { body: entry.body || "<p>Something will find its way here.</p>" },
  ];
  items.forEach((item) => {
    const content = mediaLayout ? makeMediaEntry(item)
      : drawingLayout ? makeContentEntry({ image: item.image, body: item.body }, false, true)
      : makeContentEntry(item, writingLayout);
    feed.append(content);
  });
  panel.append(feed);
  return panel;
}

function renderTabs() {
  tabs.replaceChildren();
  openTabs.forEach((id) => {
    const entry = entries.get(id);
    const active = id === activeId;
    const tab = element("div", `tab${active ? " active" : ""}`);
    tab.setAttribute("role", "presentation");
    const select = element("button", "tab-select", entry.title.replace(" Placeholder ", " "));
    select.type = "button";
    select.id = `tab-${id}`;
    select.title = entry.title;
    select.setAttribute("aria-label", entry.title);
    select.dataset.select = id;
    select.setAttribute("role", "tab");
    select.setAttribute("aria-selected", String(active));
    select.setAttribute("aria-controls", `panel-${id}`);
    select.tabIndex = active ? 0 : -1;
    const close = element("button", "tab-close", "×");
    close.type = "button";
    close.dataset.close = id;
    close.setAttribute("aria-label", `Close ${entry.title}`);
    tab.append(select, close);
    tabs.append(tab);
    const panel = document.getElementById(`panel-${id}`);
    panel.hidden = !active;
    if (!active) panel.querySelectorAll("video, audio").forEach((media) => media.pause());
  });
  const count = document.querySelector("#tab-count");
  count.textContent = `${openTabs.length} / ${MAX_TABS}`;
  count.setAttribute("aria-label", `${openTabs.length} of ${MAX_TABS} tabs open`);
}

function focusActiveTab() {
  const select = document.getElementById(`tab-${activeId}`);
  if (!select) return;
  select.focus({ preventScroll: true });
  // Scroll only the tab strip; the main frame and the page do not move.
  const rect = select.parentElement.getBoundingClientRect();
  const strip = tabs.getBoundingClientRect();
  if (rect.left < strip.left) tabs.scrollLeft += rect.left - strip.left;
  else if (rect.right > strip.right) tabs.scrollLeft += rect.right - strip.right;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = "";
}

function openEntry(id) {
  if (!entries.has(id)) return;
  if (!openTabs.includes(id)) {
    if (openTabs.length >= MAX_TABS) {
      message.textContent = "You are in too many places, remove layer to open new one.";
      message.hidden = false;
      return;
    }
    openTabs.push(id);
    panels.append(makePanel(entries.get(id)));
  }
  activeId = id;
  clearMessage();
  renderTabs();
  focusActiveTab();
}

function closeTab(id) {
  const index = openTabs.indexOf(id);
  if (index === -1) return;
  const panel = document.getElementById(`panel-${id}`);
  panel.querySelectorAll("video, audio").forEach((media) => media.pause());
  panel.remove();
  openTabs.splice(index, 1);
  if (activeId === id) activeId = openTabs[Math.min(index, openTabs.length - 1)] || null;
  clearMessage();
  renderTabs();
  if (activeId) focusActiveTab();
  else document.querySelector(`[data-open="${id}"]`)?.focus({ preventScroll: true });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.open) openEntry(button.dataset.open);
  if (button.dataset.select) openEntry(button.dataset.select);
  if (button.dataset.close) closeTab(button.dataset.close);
  if (button.dataset.connection) showConnection(button.dataset.connection, button);
});

tabs.addEventListener("keydown", (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return;
  const index = openTabs.indexOf(tab.dataset.select);
  let nextIndex;
  if (event.key === "ArrowRight") nextIndex = (index + 1) % openTabs.length;
  if (event.key === "ArrowLeft") nextIndex = (index - 1 + openTabs.length) % openTabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = openTabs.length - 1;
  if (nextIndex !== undefined) {
    event.preventDefault();
    openEntry(openTabs[nextIndex]);
  }
  if (event.key === "Delete") {
    event.preventDefault();
    closeTab(tab.dataset.select);
  }
});

/* RIGHT RAIL ---------------------------------------------------------- */
if (siteConfig.symbolImage.src) {
  const image = element("img");
  image.src = siteConfig.symbolImage.src;
  image.alt = siteConfig.symbolImage.alt;
  symbolImage.append(image);
}

siteConfig.recommendations.forEach((recommendation) => {
  const item = element("li");
  const label = element(recommendation.url ? "a" : "span", "", recommendation.label);
  if (recommendation.url) {
    label.href = recommendation.url;
    label.target = "_blank";
    label.rel = "noopener noreferrer";
  }
  item.append(label);
  document.querySelector("#recommendation-list").append(item);
});

function showConnection(id, trigger) {
  const connection = siteConfig.connections[id];
  if (!connection) return;
  connectionTrigger = trigger;
  document.querySelector("#connection-title").textContent = connection.title;
  document.querySelector("#connection-body").innerHTML = connection.body;
  symbolImage.hidden = true;
  connectionPanel.hidden = false;
  connectionPanel.scrollTop = 0;
  document.querySelectorAll("[data-connection]").forEach((button) => {
    button.setAttribute("aria-expanded", String(button === trigger));
  });
  closeConnectionButton.focus({ preventScroll: true });
  // The right rail stacks below the archive on mobile, so reveal the information.
  if (window.matchMedia("(max-width: 760px)").matches) {
    document.querySelector(".symbol").scrollIntoView({ block: "start" });
  }
}

function closeConnection() {
  connectionPanel.hidden = true;
  symbolImage.hidden = false;
  document.querySelectorAll("[data-connection]").forEach((button) => button.setAttribute("aria-expanded", "false"));
  connectionTrigger?.focus({ preventScroll: true });
}
closeConnectionButton.addEventListener("click", closeConnection);
connectionPanel.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeConnection();
});
// Open the welcome tab on load without moving keyboard focus or the page.
openTabs.push(entryPoint.id);
panels.append(makePanel(entryPoint));
activeId = entryPoint.id;
renderTabs();
