
const header = document.querySelector(".header");
const menu = document.getElementById("menu");

if (menu && header) {
  menu.addEventListener("click", () => header.classList.toggle("open"));
}

document.querySelectorAll(".nav a").forEach((a) => {
  a.addEventListener("click", () => {
    if (header) header.classList.remove("open");
  });
});

const progress = document.querySelector(".progress span");

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = percent + "%";
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* Front-page service switch */
const serviceData = {
  junk: {
    eyebrow: "Junk Removal Done Best",
    title: "Furniture, cleanouts, move-outs, and bulky junk.",
    text: "Send photos of what needs to go. We quote based on job size, access, labor, weight, distance, and disposal fees.",
    img: "https://images.unsplash.com/photo-1698917414969-feade59e3343?auto=format&fit=crop&w=1800&q=85",
    link: "junk-removal.html",
    price: "pricing.html#junk",
    bullets: ["Furniture and mattresses", "Garage and basement junk", "Storage units", "Move-out and landlord cleanouts"]
  },
  windows: {
    eyebrow: "Exterior Window Cleaning",
    title: "Outside-facing glass, screens, and sills.",
    text: "Exterior-only window cleaning. Great when the house needs a sharper outside look.",
    img: "https://images.unsplash.com/photo-1721620780493-e905708eba0b?auto=format&fit=crop&w=1800&q=85",
    link: "window-cleaning.html",
    price: "pricing.html#windows",
    bullets: ["Exterior glass only", "Screens available", "Sills available", "Photo quotes"]
  },
  washing: {
    eyebrow: "Exterior Pressure Washing",
    title: "Driveways, walkways, patios, and hard surfaces.",
    text: "Exterior-only washing for outdoor hard surfaces. Pricing depends on size, condition, water access, and surface type.",
    img: "https://images.unsplash.com/photo-1718152521364-b9655b8a7926?auto=format&fit=crop&w=1800&q=85",
    link: "power-washing.html",
    price: "pricing.html#washing",
    bullets: ["Driveways", "Walkways", "Patios", "Outdoor hard surfaces"]
  }
};

const serviceTabs = document.querySelectorAll("[data-service]");
const servicePhoto = document.getElementById("servicePhoto");
const serviceEyebrow = document.getElementById("serviceEyebrow");
const serviceTitle = document.getElementById("serviceTitle");
const serviceText = document.getElementById("serviceText");
const serviceList = document.getElementById("serviceList");
const serviceLink = document.getElementById("serviceLink");
const servicePrice = document.getElementById("servicePrice");

function setService(type) {
  const data = serviceData[type];
  if (!data) return;

  if (servicePhoto) servicePhoto.style.backgroundImage = `url('${data.img}')`;
  if (serviceEyebrow) serviceEyebrow.textContent = data.eyebrow;
  if (serviceTitle) serviceTitle.textContent = data.title;
  if (serviceText) serviceText.textContent = data.text;
  if (serviceList) serviceList.innerHTML = data.bullets.map((b) => `<li>${b}</li>`).join("");
  if (serviceLink) serviceLink.href = data.link;
  if (servicePrice) servicePrice.href = data.price;

  serviceTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.service === type));
}

serviceTabs.forEach((tab) => {
  tab.addEventListener("click", () => setService(tab.dataset.service));
});

if (serviceTabs.length) setService("junk");

/* Before/after sliders */
document.querySelectorAll(".ba-slider").forEach((slider) => {
  const range = slider.querySelector(".ba-range");
  const after = slider.querySelector(".ba-after");
  const handle = slider.querySelector(".ba-handle");

  function updateSlider() {
    if (!range || !after || !handle) return;
    const value = range.value;
    after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    handle.style.left = value + "%";
  }

  if (range) {
    range.addEventListener("input", updateSlider);
    updateSlider();
  }
});

/* Pricing page tabs */
const priceTabs = document.querySelectorAll("[data-price-tab]");
const pricePanels = document.querySelectorAll("[data-price-panel]");

function setPriceTab(type) {
  priceTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.priceTab === type));
  pricePanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.pricePanel === type));
}

priceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const type = tab.dataset.priceTab;
    history.replaceState(null, "", "#" + type);
    setPriceTab(type);
  });
});

const hash = window.location.hash.replace("#", "");
if (["junk", "windows", "washing"].includes(hash)) {
  setPriceTab(hash);
} else if (priceTabs.length) {
  setPriceTab("junk");
}

/* Pricing estimator */
const estimateTabs = document.querySelectorAll("[data-estimate-tab]");
const estimatePanels = document.querySelectorAll("[data-estimate-panel]");
const smartEstimate = document.getElementById("smartEstimate");
const smartEstimateText = document.getElementById("smartEstimateText");
const estimateMeterFill = document.getElementById("estimateMeterFill");
const estimateTextBtn = document.getElementById("estimateTextBtn");

let currentEstimateType = "junk";

const junkRanges = {
  minimum: [125, 175, 15],
  single: [150, 250, 22],
  small: [225, 325, 34],
  medium: [375, 575, 52],
  large: [575, 825, 72],
  full: [825, 1150, 88],
  cleanout: [499, 3500, 100]
};

const windowRanges = {
  minimum: [149, 189, 18],
  up15: [179, 229, 30],
  up20: [249, 309, 45],
  up30: [359, 429, 65],
  custom: [429, 750, 85]
};

const washRanges = {
  small: [175, 275, 25],
  standard: [225, 425, 45],
  large: [425, 700, 70],
  multiple: [650, 1100, 90]
};

function money(n) {
  return "$" + Math.round(n).toLocaleString();
}

function updateEstimateText(range, service, note, meter) {
  if (!smartEstimate) return;

  const label = money(range[0]) + "–" + money(range[1]);
  smartEstimate.textContent = label;

  if (smartEstimateText) smartEstimateText.textContent = note;
  if (estimateMeterFill) estimateMeterFill.style.width = meter + "%";

  if (estimateTextBtn) {
    const msg = `Hi, I used the website price helper. I need a quote for ${service}. The rough estimate showed ${label}. I can send photos. Please let me know the final price and your next available opening.`;
    estimateTextBtn.href = "sms:9143063677?&body=" + encodeURIComponent(msg);
  }
}

function updateJunkEstimate() {
  const load = document.getElementById("junkLoad");
  const access = document.getElementById("junkAccess");
  if (!load || !access) return;

  const base = junkRanges[load.value] || junkRanges.minimum;
  const add = Number(access.value || 0);

  updateEstimateText(
    [base[0] + add, base[1] + add],
    "Junk Removal",
    "Junk removal depends on photos, stairs, access, weight, distance, labor, disposal fees, and whether more than one trip is needed.",
    base[2]
  );
}

function updateWindowEstimate() {
  const pack = document.getElementById("windowPackage");
  const access = document.getElementById("windowAccess");
  const extras = document.getElementById("windowExtras");
  if (!pack || !access || !extras) return;

  const base = windowRanges[pack.value] || windowRanges.minimum;
  const add = Number(access.value || 0) + Number(extras.value || 0);

  updateEstimateText(
    [base[0] + add, base[1] + add],
    "Exterior Window Cleaning",
    "Exterior window cleaning depends on window count, height, access, screens, sills, buildup, and condition.",
    Math.min(100, base[2] + add / 5)
  );
}

function updateWashingEstimate() {
  const type = document.getElementById("washType");
  const size = document.getElementById("washSize");
  const condition = document.getElementById("washCondition");
  if (!type || !size || !condition) return;

  const base = washRanges[size.value] || washRanges.small;
  const add = Number(condition.value || 0);

  updateEstimateText(
    [base[0] + add, base[1] + add],
    type.value,
    "Exterior washing depends on surface size, dirt level, water access, surface type, and condition.",
    Math.min(100, base[2] + add / 5)
  );
}

function updateCurrentEstimate() {
  if (currentEstimateType === "junk") updateJunkEstimate();
  if (currentEstimateType === "windows") updateWindowEstimate();
  if (currentEstimateType === "washing") updateWashingEstimate();
}

estimateTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentEstimateType = tab.dataset.estimateTab;

    estimateTabs.forEach((t) => t.classList.toggle("active", t === tab));
    estimatePanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.estimatePanel === currentEstimateType);
    });

    updateCurrentEstimate();
  });
});

[
  "junkLoad",
  "junkAccess",
  "junkSchedule",
  "windowPackage",
  "windowAccess",
  "windowExtras",
  "washType",
  "washSize",
  "washCondition"
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", updateCurrentEstimate);
    el.addEventListener("change", updateCurrentEstimate);
  }
});

updateCurrentEstimate();

/* Quote builder with photo selection reminder */
const nameInput = document.getElementById("name");
const townInput = document.getElementById("town");
const serviceInput = document.getElementById("service");
const detailsInput = document.getElementById("details");
const photoUpload = document.getElementById("photoUpload");
const photoList = document.getElementById("photoList");
const preview = document.getElementById("messagePreview");
const textMessage = document.getElementById("textMessage");
const copyButton = document.getElementById("copyMessage");

function getPhotoText() {
  if (!photoUpload || !photoUpload.files || photoUpload.files.length === 0) {
    return "I can send photos if needed.";
  }

  const count = photoUpload.files.length;
  return `I have ${count} photo${count === 1 ? "" : "s"} ready to attach.`;
}

function updatePhotoList() {
  if (!photoUpload || !photoList) return;

  if (!photoUpload.files || photoUpload.files.length === 0) {
    photoList.textContent = "No photos selected yet.";
    return;
  }

  const names = Array.from(photoUpload.files).map((file) => file.name);
  photoList.innerHTML =
    "<strong>Selected photos:</strong><br>" +
    names.map((name) => "• " + name).join("<br>") +
    "<br><small>After the text app opens, attach these photos manually.</small>";
}

function buildMessage() {
  if (!nameInput || !townInput || !serviceInput || !detailsInput) return "";

  const name = nameInput.value.trim() || "[Name]";
  const town = townInput.value.trim() || "[Town]";
  const service = serviceInput.value;
  const details = detailsInput.value.trim() || "[Details]";
  const photoText = getPhotoText();

  return `Hi, my name is ${name}. I need a free quote for ${service} in ${town}.

Details:
${details}

${photoText}

Please let me know the final price and your next available opening.`;
}

function updateMessage() {
  const msg = buildMessage();

  if (preview) preview.textContent = msg;
  if (textMessage) textMessage.href = "sms:9143063677?&body=" + encodeURIComponent(msg);

  return msg;
}

[nameInput, townInput, serviceInput, detailsInput, photoUpload].forEach((field) => {
  if (!field) return;

  field.addEventListener("input", () => {
    updatePhotoList();
    updateMessage();
  });

  field.addEventListener("change", () => {
    updatePhotoList();
    updateMessage();
  });
});

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const msg = updateMessage();

    try {
      await navigator.clipboard.writeText(msg);
      copyButton.textContent = "Copied!";
      setTimeout(() => (copyButton.textContent = "Copy Message"), 1400);
    } catch {
      if (preview) preview.textContent = msg + "\n\nCopy this manually.";
    }
  });
}

updatePhotoList();
updateMessage();
