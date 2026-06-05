
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

const serviceData = {
  junk: {
    eyebrow: "Junk Removal Done Best",
    title: "Furniture, cleanouts, move-outs, and bulky junk.",
    text: "Send photos of what needs to go. We quote based on job size, access, labor, weight, distance, and disposal fees.",
    img: "assets/img/junk-removal-pro.jpg",
    link: "junk-removal.html",
    price: "pricing.html#junk",
    bullets: ["Furniture and mattresses", "Garage and basement junk", "Storage units", "Move-out and landlord cleanouts"]
  },
  windows: {
    eyebrow: "Exterior Window Cleaning",
    title: "Outside-facing glass, screens, and sills.",
    text: "Exterior-only window cleaning. Great when the house needs a sharper outside look.",
    img: "assets/img/exterior-window-cleaning-pro.jpg",
    link: "window-cleaning.html",
    price: "pricing.html#windows",
    bullets: ["Exterior glass only", "Screens available", "Sills available", "Photo quotes"]
  },
  washing: {
    eyebrow: "Exterior Pressure Washing",
    title: "Driveways, walkways, patios, and hard surfaces.",
    text: "Exterior pressure washing for outdoor hard surfaces. Pricing depends on size, condition, water access, and surface type.",
    img: "assets/img/pressure-washing-pro.jpg",
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
    "Exterior pressure washing depends on surface size, dirt level, water access, surface type, and condition.",
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

const nameInput = document.getElementById("name");
const townInput = document.getElementById("town");
const serviceInput = document.getElementById("service");
const detailsInput = document.getElementById("details");
const photoUpload = document.getElementById("photoUpload");
const photoList = document.getElementById("photoList");
const preview = document.getElementById("messagePreview");
const textMessage = document.getElementById("textMessage");
const copyButton = document.getElementById("copyMessage");
const sharePhotosButton = document.getElementById("sharePhotosMessage");

let activePreviewUrls = [];

function cleanupPreviewUrls() {
  activePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  activePreviewUrls = [];
}

function getSelectedFiles() {
  if (!photoUpload || !photoUpload.files) return [];
  return Array.from(photoUpload.files).filter((file) => file.type.startsWith("image/"));
}

function getPhotoText() {
  const files = getSelectedFiles();

  if (!files.length) {
    return "I can send photos if needed.";
  }

  return `I have ${files.length} photo${files.length === 1 ? "" : "s"} ready to attach.`;
}

function updatePhotoList() {
  if (!photoUpload || !photoList) return;

  cleanupPreviewUrls();

  const files = getSelectedFiles();

  if (!files.length) {
    photoList.classList.remove("preview-mode");
    photoList.textContent = "No photos selected yet.";
    return;
  }

  photoList.classList.add("preview-mode");

  const images = files.slice(0, 6).map((file) => {
    const url = URL.createObjectURL(file);
    activePreviewUrls.push(url);
    return `<img src="${url}" alt="Selected quote photo">`;
  }).join("");

  const more = files.length > 6 ? `<small>+ ${files.length - 6} more photo${files.length - 6 === 1 ? "" : "s"} selected</small>` : "";

  photoList.innerHTML = `
    <strong>${files.length} photo${files.length === 1 ? "" : "s"} selected</strong>
    <div class="photo-preview-grid">${images}</div>
    ${more}
    <small>Use Share Photos + Message on your phone, then choose Messages.</small>
  `;
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

function setShareStatus(message) {
  if (!photoList) return;

  let status = photoList.querySelector(".native-share-status");

  if (!status) {
    status = document.createElement("div");
    status.className = "native-share-status";
    photoList.appendChild(status);
  }

  status.textContent = message;
}

async function sharePhotosAndMessage() {
  const files = getSelectedFiles();
  const message = updateMessage();

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(message);
    }
  } catch (e) {}

  if (!navigator.share) {
    setShareStatus("Your browser does not support photo sharing from the website. Use Text Us, then attach the photos manually.");
    if (preview) preview.textContent = "Please submit the quote form or call us directly.";
    return;
  }

  if (files.length && navigator.canShare && navigator.canShare({ files })) {
    try {
      await navigator.share({
        title: "Quote request",
        text: message,
        files
      });

      setShareStatus("Share sheet opened. Choose Messages and send the photos with the quote.");
      return;
    } catch (error) {
      try {
        await navigator.share({ files });
        setShareStatus("Photos shared. The quote message was copied, so paste it into Messages if needed.");
        return;
      } catch (secondError) {
        setShareStatus("Photo sharing was canceled or not supported. Use Text Us and attach photos manually.");
        if (preview) preview.textContent = "Please submit the quote form or call us directly.";
      }
    }
  } else {
    try {
      await navigator.share({
        title: "Quote request",
        text: message
      });
      setShareStatus("Message shared. Attach photos manually if they did not transfer.");
    } catch (error) {
      setShareStatus("Sharing was canceled or not supported. Use Text Us and attach photos manually.");
      if (preview) preview.textContent = "Please submit the quote form or call us directly.";
    }
  }
}

if (sharePhotosButton) {
  sharePhotosButton.addEventListener("click", sharePhotosAndMessage);
}

updatePhotoList();
updateMessage();


/* ===== Ultra Smart Quote System ===== */

(function () {
  const form = document.getElementById("smartQuoteForm");
  if (!form) return;

  const steps = document.querySelectorAll(".quote-step");
  const progressSteps = document.querySelectorAll(".quote-progress-step");
  const serviceCards = document.querySelectorAll(".quote-service-card");

  const qName = document.getElementById("qName");
  const qTown = document.getElementById("qTown");
  const qTiming = document.getElementById("qTiming");
  const qDetails = document.getElementById("qDetails");

  const qJunkSize = document.getElementById("qJunkSize");
  const qJunkAccess = document.getElementById("qJunkAccess");
  const qWindowCount = document.getElementById("qWindowCount");
  const qWindowExtras = document.getElementById("qWindowExtras");
  const qWashSurface = document.getElementById("qWashSurface");
  const qWashCondition = document.getElementById("qWashCondition");

  const qPhotos = document.getElementById("qPhotos");
  const smartPhotoList = document.getElementById("smartPhotoList");
  const checks = document.querySelectorAll(".qCheck");

  const qPreview = document.getElementById("qPreview");
  const qText = document.getElementById("qText");
  const qTextMini = document.getElementById("qTextMini");
  const qCopy = document.getElementById("qCopy");
  const qCopyMini = document.getElementById("qCopyMini");
  const qShare = document.getElementById("qShare");
  const qStatus = document.getElementById("qStatus");
  const quoteScoreFill = document.getElementById("quoteScoreFill");
  const quoteScoreText = document.getElementById("quoteScoreText");

  const junkQuestions = document.getElementById("junkQuestions");
  const windowQuestions = document.getElementById("windowQuestions");
  const washingQuestions = document.getElementById("washingQuestions");

  let selectedService = "Junk Removal";
  let previewUrls = [];

  const storageKey = "cleanup_quote_builder_v2";

  function showStep(step) {
    steps.forEach((panel) => panel.classList.toggle("active", panel.dataset.step === String(step)));
    progressSteps.forEach((p) => p.classList.toggle("active", Number(p.dataset.progress) <= Number(step)));
    window.scrollTo({ top: document.getElementById("smartQuote").offsetTop - 90, behavior: "smooth" });
  }

  document.querySelectorAll(".quote-next").forEach((button) => {
    button.addEventListener("click", () => showStep(button.dataset.next));
  });

  document.querySelectorAll(".quote-back").forEach((button) => {
    button.addEventListener("click", () => showStep(button.dataset.back));
  });

  function updateQuestionGroups() {
    const isJunk = selectedService.includes("Junk");
    const isWindows = selectedService.includes("Window");
    const isWashing = selectedService.includes("Pressure");

    if (junkQuestions) junkQuestions.classList.toggle("active", isJunk);
    if (windowQuestions) windowQuestions.classList.toggle("active", isWindows || selectedService.includes("Add-On"));
    if (washingQuestions) washingQuestions.classList.toggle("active", isWashing || selectedService.includes("Add-On"));
  }

  serviceCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectedService = card.dataset.quoteService;
      serviceCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      updateQuestionGroups();
      updateQuote();
      saveDraft();
    });
  });

  function getFiles() {
    if (!qPhotos || !qPhotos.files) return [];
    return Array.from(qPhotos.files).filter((file) => file.type.startsWith("image/"));
  }

  function cleanupUrls() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls = [];
  }

  function renderPhotos() {
    if (!smartPhotoList) return;

    cleanupUrls();

    const files = getFiles();

    if (!files.length) {
      smartPhotoList.classList.remove("preview-mode");
      smartPhotoList.textContent = "No photos selected yet.";
      return;
    }

    smartPhotoList.classList.add("preview-mode");

    const images = files.slice(0, 8).map((file) => {
      const url = URL.createObjectURL(file);
      previewUrls.push(url);
      return `<img src="${url}" alt="Selected quote photo">`;
    }).join("");

    const extra = files.length > 8 ? `<small>+ ${files.length - 8} more photo${files.length - 8 === 1 ? "" : "s"} selected</small>` : "";

    smartPhotoList.innerHTML = `
      <strong>${files.length} photo${files.length === 1 ? "" : "s"} selected</strong>
      <div class="smart-photo-preview-grid">${images}</div>
      ${extra}
      <small>Use Share Photos + Message on your phone, then choose Messages.</small>
    `;
  }

  function getCheckedPhotoTypes() {
    return Array.from(checks)
      .filter((check) => check.checked)
      .map((check) => check.value);
  }

  function getDetailLines() {
    const lines = [];

    if (selectedService.includes("Junk")) {
      lines.push(`Junk size: ${qJunkSize?.value || "Not sure"}`);
      lines.push(`Access: ${qJunkAccess?.value || "Not sure"}`);
    }

    if (selectedService.includes("Window") || selectedService.includes("Add-On")) {
      lines.push(`Exterior windows: ${qWindowCount?.value || "Not sure"}`);
      lines.push(`Window add-ons: ${qWindowExtras?.value || "Not sure"}`);
    }

    if (selectedService.includes("Pressure") || selectedService.includes("Add-On")) {
      lines.push(`Pressure washing surface: ${qWashSurface?.value || "Not sure"}`);
      lines.push(`Surface condition: ${qWashCondition?.value || "Not sure"}`);
    }

    if (qTiming && qTiming.value) {
      lines.push(`Preferred timing: ${qTiming.value}`);
    }

    if (qDetails && qDetails.value.trim()) {
      lines.push(`Extra details: ${qDetails.value.trim()}`);
    }

    return lines;
  }

  function buildSmartMessage() {
    const name = qName?.value.trim() || "[Name]";
    const town = qTown?.value.trim() || "[Town]";
    const files = getFiles();
    const checked = getCheckedPhotoTypes();

    let photoText = "I can send photos if needed.";

    if (files.length) {
      photoText = `I have ${files.length} photo${files.length === 1 ? "" : "s"} ready to attach.`;
    }

    if (checked.length) {
      photoText += ` Photo types: ${checked.join(", ")}.`;
    }

    const details = getDetailLines();

    return `Hi, my name is ${name}. I need a free quote for ${selectedService} in ${town}.

Job details:
${details.length ? details.map((line) => "- " + line).join("\n") : "- [Add job details]"}

${photoText}

Please let me know the final price and your next available opening.

Thank you.`;
  }

  function calculateScore() {
    let score = 20;

    if (qName?.value.trim()) score += 12;
    if (qTown?.value.trim()) score += 18;
    if (qDetails?.value.trim().length > 15) score += 18;
    if (getFiles().length) score += 20;
    if (getCheckedPhotoTypes().length) score += 12;

    return Math.min(100, score);
  }

  function updateScore() {
    const score = calculateScore();

    if (quoteScoreFill) quoteScoreFill.style.width = score + "%";

    if (quoteScoreText) {
      if (score < 45) quoteScoreText.textContent = "Good start";
      else if (score < 75) quoteScoreText.textContent = "Almost ready";
      else quoteScoreText.textContent = "Strong quote request";
    }
  }

  function updateSendLinks(message) {
    const href = "sms:9143063677?&body=" + encodeURIComponent(message);

    if (qText) qText.href = href;
    if (qTextMini) qTextMini.href = href;
  }

  function updateQuote() {
    const message = buildSmartMessage();

    if (qPreview) qPreview.textContent = message;

    updateSendLinks(message);
    updateScore();

    return message;
  }

  function saveDraft() {
    const data = {
      service: selectedService,
      name: qName?.value || "",
      town: qTown?.value || "",
      timing: qTiming?.value || "",
      details: qDetails?.value || "",
      junkSize: qJunkSize?.value || "",
      junkAccess: qJunkAccess?.value || "",
      windowCount: qWindowCount?.value || "",
      windowExtras: qWindowExtras?.value || "",
      washSurface: qWashSurface?.value || "",
      washCondition: qWashCondition?.value || "",
      checks: getCheckedPhotoTypes()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const data = JSON.parse(raw);

      selectedService = data.service || "Junk Removal";

      serviceCards.forEach((card) => {
        card.classList.toggle("active", card.dataset.quoteService === selectedService);
      });

      if (qName) qName.value = data.name || "";
      if (qTown) qTown.value = data.town || "";
      if (qTiming && data.timing) qTiming.value = data.timing;
      if (qDetails) qDetails.value = data.details || "";
      if (qJunkSize && data.junkSize) qJunkSize.value = data.junkSize;
      if (qJunkAccess && data.junkAccess) qJunkAccess.value = data.junkAccess;
      if (qWindowCount && data.windowCount) qWindowCount.value = data.windowCount;
      if (qWindowExtras && data.windowExtras) qWindowExtras.value = data.windowExtras;
      if (qWashSurface && data.washSurface) qWashSurface.value = data.washSurface;
      if (qWashCondition && data.washCondition) qWashCondition.value = data.washCondition;

      checks.forEach((check) => {
        check.checked = Array.isArray(data.checks) && data.checks.includes(check.value);
      });

      updateQuestionGroups();
    } catch (e) {}
  }

  async function copyMessage(button) {
    const message = updateQuote();

    try {
      await navigator.clipboard.writeText(message);
      const old = button.textContent;
      button.textContent = "Copied!";
      setTimeout(() => (button.textContent = old), 1400);
    } catch (e) {
      if (qStatus) qStatus.textContent = "Could not copy automatically. Highlight the preview message and copy it manually.";
    }
  }

  if (qCopy) qCopy.addEventListener("click", () => copyMessage(qCopy));
  if (qCopyMini) qCopyMini.addEventListener("click", () => copyMessage(qCopyMini));

  async function sharePhotosAndMessage() {
    const files = getFiles();
    const message = updateQuote();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
      }
    } catch (e) {}

    if (!navigator.share) {
      if (qStatus) qStatus.textContent = "Please use Submit Quote Request to send the form directly.";
      if (qStatus) qStatus.textContent = "Please submit the quote form or call us directly.";
      return;
    }

    if (files.length && navigator.canShare && navigator.canShare({ files })) {
      try {
        await navigator.share({
          title: "Quote request",
          text: message,
          files
        });

        if (qStatus) qStatus.textContent = "Share sheet opened. Choose Messages and send the photos with the quote.";
        return;
      } catch (error) {
        try {
          await navigator.share({ files });
          if (qStatus) qStatus.textContent = "Photos shared. The quote message was copied, so paste it into Messages if needed.";
          return;
        } catch (secondError) {
          if (qStatus) qStatus.textContent = "Please use Submit Quote Request to send the form directly.";
          if (qStatus) qStatus.textContent = "Please submit the quote form or call us directly.";
          return;
        }
      }
    }

    try {
      await navigator.share({
        title: "Quote request",
        text: message
      });

      if (qStatus) qStatus.textContent = "Message shared. Attach photos manually if they did not transfer.";
    } catch (error) {
      if (qStatus) qStatus.textContent = "Sharing was canceled or not supported. Use Text Message and attach photos manually.";
      if (qStatus) qStatus.textContent = "Please submit the quote form or call us directly.";
    }
  }

  if (qShare) qShare.addEventListener("click", sharePhotosAndMessage);

  [
    qName,
    qTown,
    qTiming,
    qDetails,
    qJunkSize,
    qJunkAccess,
    qWindowCount,
    qWindowExtras,
    qWashSurface,
    qWashCondition
  ].forEach((field) => {
    if (!field) return;

    field.addEventListener("input", () => {
      updateQuote();
      saveDraft();
    });

    field.addEventListener("change", () => {
      updateQuote();
      saveDraft();
    });
  });

  checks.forEach((check) => {
    check.addEventListener("change", () => {
      updateQuote();
      saveDraft();
    });
  });

  if (qPhotos) {
    qPhotos.addEventListener("change", () => {
      renderPhotos();
      updateQuote();
    });
  }

  loadDraft();
  updateQuestionGroups();
  renderPhotos();
  updateQuote();
})();


/* ===== Quote Backend Submit Button Fix ===== */

(function () {
  const submitButton = document.getElementById("qSubmitLead");
  const statusBox = document.getElementById("backendSubmitStatus");

  if (!submitButton) return;

  const MAX_PHOTOS = 6;
  const MAX_IMAGE_SIZE = 1280;
  const JPEG_QUALITY = 0.72;

  function setBackendStatus(message, type) {
    if (!statusBox) return;

    statusBox.classList.remove("success", "error", "loading");

    if (type) {
      statusBox.classList.add(type);
    }

    statusBox.textContent = message;
  }

  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function getSelectedService() {
    const active = document.querySelector(".quote-service-card.active");
    return active ? active.dataset.quoteService : getValue("service") || "Junk Removal";
  }

  function getSelectedFiles() {
    const input = document.getElementById("qPhotos") || document.getElementById("photoUpload");
    if (!input || !input.files) return [];
    return Array.from(input.files).filter(file => file.type.startsWith("image/"));
  }

  function getCheckedPhotoTypes() {
    return Array.from(document.querySelectorAll(".qCheck"))
      .filter(check => check.checked)
      .map(check => check.value);
  }

  function buildBasePayload() {
    return {
      source: "Website Quote Form",
      website: window.location.href,
      name: getValue("qName") || getValue("name"),
      phone: getValue("qPhone") || getValue("phone"),
      town: getValue("qTown") || getValue("town"),
      service: getSelectedService(),
      timing: getValue("qTiming"),
      junkSize: getValue("qJunkSize"),
      access: getValue("qJunkAccess"),
      windowCount: getValue("qWindowCount"),
      windowExtras: getValue("qWindowExtras"),
      washSurface: getValue("qWashSurface"),
      washCondition: getValue("qWashCondition"),
      details: getValue("qDetails") || getValue("details"),
      photoTypes: getCheckedPhotoTypes(),
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      photos: []
    };
  }

  function validatePayload(payload) {
    const missing = [];

    if (!payload.name) missing.push("name");
    if (!payload.phone) missing.push("phone number");
    if (!payload.town) missing.push("town");
    if (!payload.service) missing.push("service");

    if (missing.length) {
      return "Please add: " + missing.join(", ") + ".";
    }

    return "";
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  async function compressImage(file, index) {
    const dataUrl = await readFile(file);

    try {
      const img = await loadImage(dataUrl);
      const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      return {
        name: file.name || `quote-photo-${index + 1}.jpg`,
        type: "image/jpeg",
        data: compressed.split(",")[1],
        originalSize: file.size
      };
    } catch (error) {
      return {
        name: file.name || `quote-photo-${index + 1}.jpg`,
        type: file.type || "image/jpeg",
        data: String(dataUrl).split(",")[1],
        originalSize: file.size
      };
    }
  }

  async function buildPayloadWithPhotos() {
    const payload = buildBasePayload();
    const files = getSelectedFiles().slice(0, MAX_PHOTOS);

    if (files.length) {
      setBackendStatus(`Preparing ${files.length} photo${files.length === 1 ? "" : "s"}...`, "loading");
    }

    payload.photos = await Promise.all(
      files.map((file, index) => compressImage(file, index))
    );

    return payload;
  }

  async function submitLead() {
    const backendUrl = window.CLEANUP_BACKEND_URL;

    if (!backendUrl) {
      setBackendStatus("Backend is not connected yet.", "error");
      return;
    }

    const basePayload = buildBasePayload();
    const validationError = validatePayload(basePayload);

    if (validationError) {
      setBackendStatus(validationError, "error");
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.style.opacity = "0.7";

      setBackendStatus("Submitting quote request...", "loading");

      const payload = await buildPayloadWithPhotos();

      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(payload));

      await fetch(backendUrl, {
        method: "POST",
        mode: "no-cors",
        body
      });

      setBackendStatus("Quote request submitted. We’ll review it and reach out soon.", "success");

    } catch (error) {
      setBackendStatus("Something went wrong. Please call us or try submitting again.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
    }
  }

  submitButton.addEventListener("click", submitLead);
})();
