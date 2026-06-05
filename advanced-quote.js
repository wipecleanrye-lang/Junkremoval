
/* =========================================================
   Advanced backend quote system
   ========================================================= */

(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const form = $("#quoteForm");
  if (!form) return;

  const state = {
    service: "Junk Removal",
    group: "junk",
    panel: 1,
    photos: [],
    objectUrls: []
  };

  const MAX_PHOTOS = 6;
  const MAX_IMAGE_SIZE = 1280;
  const JPEG_QUALITY = 0.72;
  const STORAGE_KEY = "cleanup_advanced_quote_v1";

  const serviceInput = $("#qService");
  const preview = $("#quotePreview");
  const status = $("#quoteStatus");
  const scoreFill = $("#quoteScoreFill");
  const scoreText = $("#quoteScoreText");
  const priorityBox = $("#priorityBox");
  const photoInput = $("#qPhotos");
  const photoPreview = $("#photoPreview");
  const submitButton = $("#quoteSubmit");

  function value(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setValue(id, val) {
    const el = document.getElementById(id);
    if (el && typeof val === "string") el.value = val;
  }

  function setStatus(message, type) {
    if (!status) return;
    status.classList.remove("loading", "success", "error");
    if (type) status.classList.add(type);
    status.textContent = message;
  }

  function setPanel(panel) {
    state.panel = Number(panel);

    $$(".advanced-form-panel").forEach((item) => {
      item.classList.toggle("active", item.dataset.panel === String(panel));
    });

    $$(".advanced-step").forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.stepIndicator) <= Number(panel));
    });

    const anchor = $("#quoteFormSection");
    if (anchor) {
      window.scrollTo({
        top: anchor.offsetTop - 85,
        behavior: "smooth"
      });
    }
  }

  function setService(card) {
    state.service = card.dataset.service || "Junk Removal";
    state.group = card.dataset.group || "junk";

    if (serviceInput) serviceInput.value = state.service;

    $$(".advanced-service-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");

    updateQuestionGroups();
    updatePreview();
    saveDraft();
  }

  function updateQuestionGroups() {
    const group = state.group;

    $$(".question-group").forEach((item) => {
      const name = item.dataset.questionGroup;
      let show = false;

      if (group === "multiple") show = true;
      else show = name === group;

      item.classList.toggle("active", show);
    });
  }

  function getFiles() {
    if (!photoInput || !photoInput.files) return [];
    return Array.from(photoInput.files).filter((file) => file.type.startsWith("image/"));
  }

  function clearObjectUrls() {
    state.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    state.objectUrls = [];
  }

  function renderPhotos() {
    if (!photoPreview) return;

    clearObjectUrls();

    const files = getFiles();

    if (!files.length) {
      photoPreview.innerHTML = "<p>No photos selected yet.</p>";
      return;
    }

    const limited = files.slice(0, MAX_PHOTOS);

    const imgs = limited.map((file) => {
      const url = URL.createObjectURL(file);
      state.objectUrls.push(url);
      return `<img src="${url}" alt="Selected quote photo">`;
    }).join("");

    const extra = files.length > MAX_PHOTOS
      ? `<p><strong>${files.length - MAX_PHOTOS} extra photo${files.length - MAX_PHOTOS === 1 ? "" : "s"} not attached.</strong> Upload up to ${MAX_PHOTOS} photos per request.</p>`
      : "";

    photoPreview.innerHTML = `
      <p><strong>${limited.length} photo${limited.length === 1 ? "" : "s"} selected.</strong> These will be compressed and saved with the quote request.</p>
      <div class="advanced-photo-grid">${imgs}</div>
      ${extra}
    `;
  }

  function checkedPhotoTypes() {
    return $$(".qCheck")
      .filter((item) => item.checked)
      .map((item) => item.value);
  }

  function isHotLead() {
    const timing = value("qTiming").toLowerCase();
    const requestedDate = value("qRequestedDate");
    const requestedTime = value("qRequestedTime").toLowerCase();

    const hotWords = ["asap", "today", "tomorrow", "this week", "next available", "weekend", "soon"];

    if (hotWords.some((word) => timing.includes(word))) return true;

    if (requestedTime && requestedTime !== "flexible") return true;

    if (requestedDate) {
      const now = new Date();
      const req = new Date(requestedDate + "T00:00:00");
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.ceil((req - today) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) return true;
    }

    return false;
  }

  function buildDetailsText() {
    const pieces = [];

    pieces.push(`Property/access type: ${value("qPropertyType") || "Not provided"}`);
    pieces.push(`Preferred contact method: ${value("qContactMethod") || "Not provided"}`);
    pieces.push(`Photo/detail clarity: ${value("qClarity") || "Not provided"}`);

    const checks = checkedPhotoTypes();
    if (checks.length) pieces.push(`Photo types checked: ${checks.join(", ")}`);

    const notes = value("qDetails");
    if (notes) pieces.push(`Customer notes: ${notes}`);

    return pieces.join("\n");
  }

  function buildPreviewText() {
    const lines = [];

    lines.push(`Service: ${state.service}`);
    lines.push(`Priority: ${isHotLead() ? "Hot Lead - respond quickly" : "Normal"}`);
    lines.push("");
    lines.push(`Name: ${value("qName") || "[Name]"}`);
    lines.push(`Phone: ${value("qPhone") || "[Phone]"}`);
    lines.push(`Town: ${value("qTown") || "[Town]"}`);
    lines.push("");
    lines.push(`Preferred timing: ${value("qTiming") || "Flexible timing"}`);
    lines.push(`Requested date: ${value("qRequestedDate") || "Not selected"}`);
    lines.push(`Best time: ${value("qRequestedTime") || "Flexible"}`);
    lines.push("");

    if (state.group === "junk" || state.group === "multiple") {
      lines.push(`Junk size: ${value("qJunkSize") || "Not sure"}`);
      lines.push(`Junk access: ${value("qJunkAccess") || "Not sure"}`);
    }

    if (state.group === "windows" || state.group === "multiple") {
      lines.push(`Exterior windows: ${value("qWindowCount") || "Not sure"}`);
      lines.push(`Window extras: ${value("qWindowExtras") || "Not sure"}`);
    }

    if (state.group === "washing" || state.group === "multiple") {
      lines.push(`Pressure washing surface: ${value("qWashSurface") || "Not sure"}`);
      lines.push(`Surface condition: ${value("qWashCondition") || "Not sure"}`);
    }

    lines.push("");
    lines.push(`Photos selected: ${getFiles().length}`);
    lines.push("");
    lines.push("Extra details:");
    lines.push(buildDetailsText() || "Not provided yet.");

    return lines.join("\n");
  }

  function calculateScore() {
    let score = 20;

    if (value("qName")) score += 12;
    if (value("qPhone")) score += 16;
    if (value("qTown")) score += 14;
    if (value("qRequestedDate")) score += 10;
    if (value("qDetails").length > 18) score += 16;
    if (getFiles().length) score += 16;
    if (checkedPhotoTypes().length) score += 8;

    return Math.min(score, 100);
  }

  function updateScore() {
    const score = calculateScore();

    if (scoreFill) scoreFill.style.width = score + "%";

    if (scoreText) {
      if (score < 45) scoreText.textContent = "Good start";
      else if (score < 76) scoreText.textContent = "Almost ready";
      else scoreText.textContent = "Strong request";
    }
  }

  function updatePriority() {
    if (!priorityBox) return;

    const hot = isHotLead();

    priorityBox.classList.toggle("hot", hot);

    const strong = $("strong", priorityBox);
    const small = $("small", priorityBox);

    if (strong) strong.textContent = hot ? "Hot Lead" : "Normal";

    if (small) {
      small.textContent = hot
        ? "This request should be reviewed quickly based on timing/date."
        : "This request will still be saved and reviewed in the lead dashboard.";
    }
  }

  function updatePreview() {
    if (preview) preview.textContent = buildPreviewText();
    updateScore();
    updatePriority();
  }

  function validate() {
    const missing = [];

    if (!value("qName")) missing.push("name");
    if (!value("qPhone")) missing.push("phone number");
    if (!value("qTown")) missing.push("town");

    if (missing.length) {
      setStatus("Please add: " + missing.join(", ") + ".", "error");
      return false;
    }

    return true;
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
    const original = await readFile(file);

    try {
      const img = await loadImage(original);
      const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      return {
        name: file.name || `quote-photo-${index + 1}.jpg`,
        type: "image/jpeg",
        data: dataUrl.split(",")[1],
        originalSize: file.size
      };

    } catch (error) {
      return {
        name: file.name || `quote-photo-${index + 1}.jpg`,
        type: file.type || "image/jpeg",
        data: String(original).split(",")[1],
        originalSize: file.size
      };
    }
  }

  async function buildPayload() {
    const files = getFiles().slice(0, MAX_PHOTOS);

    if (files.length) {
      setStatus(`Preparing ${files.length} photo${files.length === 1 ? "" : "s"}...`, "loading");
    }

    const photos = await Promise.all(files.map((file, index) => compressImage(file, index)));

    return {
      source: "Website Quote Form",
      website: window.location.href,
      name: value("qName"),
      phone: value("qPhone"),
      town: value("qTown"),
      service: state.service,
      timing: value("qTiming"),
      requestedDate: value("qRequestedDate"),
      requestedTime: value("qRequestedTime"),
      junkSize: state.group === "junk" || state.group === "multiple" ? value("qJunkSize") : "",
      access: state.group === "junk" || state.group === "multiple" ? value("qJunkAccess") : "",
      windowCount: state.group === "windows" || state.group === "multiple" ? value("qWindowCount") : "",
      windowExtras: state.group === "windows" || state.group === "multiple" ? value("qWindowExtras") : "",
      washSurface: state.group === "washing" || state.group === "multiple" ? value("qWashSurface") : "",
      washCondition: state.group === "washing" || state.group === "multiple" ? value("qWashCondition") : "",
      details: buildDetailsText(),
      photoTypes: checkedPhotoTypes(),
      priorityHint: isHotLead() ? "Hot" : "Normal",
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      photos
    };
  }

  function saveDraft() {
    const data = {
      service: state.service,
      group: state.group,
      qName: value("qName"),
      qPhone: value("qPhone"),
      qTown: value("qTown"),
      qTiming: value("qTiming"),
      qRequestedDate: value("qRequestedDate"),
      qRequestedTime: value("qRequestedTime"),
      qPropertyType: value("qPropertyType"),
      qContactMethod: value("qContactMethod"),
      qClarity: value("qClarity"),
      qJunkSize: value("qJunkSize"),
      qJunkAccess: value("qJunkAccess"),
      qWindowCount: value("qWindowCount"),
      qWindowExtras: value("qWindowExtras"),
      qWashSurface: value("qWashSurface"),
      qWashCondition: value("qWashCondition"),
      qDetails: value("qDetails"),
      checks: checkedPhotoTypes()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);

      state.service = data.service || "Junk Removal";
      state.group = data.group || "junk";

      if (serviceInput) serviceInput.value = state.service;

      $$(".advanced-service-card").forEach((card) => {
        card.classList.toggle("active", card.dataset.service === state.service);
      });

      [
        "qName",
        "qPhone",
        "qTown",
        "qTiming",
        "qRequestedDate",
        "qRequestedTime",
        "qPropertyType",
        "qContactMethod",
        "qClarity",
        "qJunkSize",
        "qJunkAccess",
        "qWindowCount",
        "qWindowExtras",
        "qWashSurface",
        "qWashCondition",
        "qDetails"
      ].forEach((id) => setValue(id, data[id] || ""));

      $$(".qCheck").forEach((check) => {
        check.checked = Array.isArray(data.checks) && data.checks.includes(check.value);
      });

    } catch (error) {}
  }

  async function submitQuote(event) {
    event.preventDefault();

    if ($("#website") && $("#website").value) {
      setStatus("Quote request submitted.", "success");
      return;
    }

    if (!validate()) return;

    const backendUrl = window.CLEANUP_BACKEND_URL;

    if (!backendUrl) {
      setStatus("Backend is not connected yet. Please call instead.", "error");
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
      setStatus("Submitting quote request...", "loading");

      const payload = await buildPayload();

      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(payload));

      await fetch(backendUrl, {
        method: "POST",
        mode: "no-cors",
        body
      });

      setStatus("Quote request submitted. We’ll review it and reach out soon.", "success");

      try {
        localStorage.setItem("cleanup_last_successful_quote", JSON.stringify({
          time: new Date().toISOString(),
          name: payload.name,
          phone: payload.phone,
          service: payload.service,
          town: payload.town
        }));
      } catch (error) {}

    } catch (error) {
      setStatus("Something went wrong. Please call us or try submitting again.", "error");

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Quote Request";
    }
  }

  $$(".advanced-service-card").forEach((card) => {
    card.addEventListener("click", () => setService(card));
  });

  $$(".quote-next").forEach((button) => {
    button.addEventListener("click", () => setPanel(button.dataset.nextPanel));
  });

  $$(".quote-back").forEach((button) => {
    button.addEventListener("click", () => setPanel(button.dataset.prevPanel));
  });

  [
    "qName",
    "qPhone",
    "qTown",
    "qTiming",
    "qRequestedDate",
    "qRequestedTime",
    "qPropertyType",
    "qContactMethod",
    "qClarity",
    "qJunkSize",
    "qJunkAccess",
    "qWindowCount",
    "qWindowExtras",
    "qWashSurface",
    "qWashCondition",
    "qDetails"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", () => {
      updatePreview();
      saveDraft();
    });

    el.addEventListener("change", () => {
      updatePreview();
      saveDraft();
    });
  });

  $$(".qCheck").forEach((check) => {
    check.addEventListener("change", () => {
      updatePreview();
      saveDraft();
    });
  });

  if (photoInput) {
    photoInput.addEventListener("change", () => {
      renderPhotos();
      updatePreview();
    });
  }

  form.addEventListener("submit", submitQuote);

  loadDraft();
  updateQuestionGroups();
  renderPhotos();
  updatePreview();
})();
