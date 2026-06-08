
(function () {
  const form = document.getElementById("junkQuoteForm");
  if (!form) return;

  const statusBox = document.getElementById("quoteStatus");
  const preview = document.getElementById("quotePreview");
  const photoInput = document.getElementById("qPhotos");
  const photoPreview = document.getElementById("photoPreview");
  const submitBtn = document.getElementById("quoteSubmit");

  const MAX_PHOTOS = 6;
  const MAX_IMAGE_SIZE = 1280;
  const JPEG_QUALITY = 0.72;

  function value(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setStatus(message, type) {
    statusBox.classList.remove("loading", "success", "error");
    if (type) statusBox.classList.add(type);
    statusBox.textContent = message;
  }

  function files() {
    if (!photoInput || !photoInput.files) return [];
    return Array.from(photoInput.files).filter(file => file.type.startsWith("image/"));
  }

  function isHotLead() {
    const timing = value("qTiming").toLowerCase();
    const requestedDate = value("qRequestedDate");

    if (["asap", "today", "tomorrow", "this week", "soon", "next available"].some(word => timing.includes(word))) {
      return true;
    }

    if (requestedDate) {
      const today = new Date();
      const req = new Date(requestedDate + "T00:00:00");
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diff = Math.ceil((req - start) / (1000 * 60 * 60 * 24));
      return diff <= 7;
    }

    return false;
  }

  function buildDetails() {
    const parts = [];
    parts.push("Item type: " + (value("qItemType") || "Not provided"));
    parts.push("Load size: " + (value("qJunkSize") || "Not provided"));
    parts.push("Access: " + (value("qAccess") || "Not provided"));
    parts.push("Heavy items: " + (value("qHeavyItems") || "Not provided"));
    parts.push("Property type: " + (value("qPropertyType") || "Not provided"));
    parts.push("Customer notes: " + (value("qDetails") || "Not provided"));
    return parts.join("\\n");
  }

  function updatePreview() {
    const text =
`Service: Junk Removal
Priority: ${isHotLead() ? "Hot Lead - respond quickly" : "Normal"}

Name: ${value("qName") || "[Name]"}
Phone: ${value("qPhone") || "[Phone]"}
Town: ${value("qTown") || "[Town]"}

Preferred timing: ${value("qTiming") || "Flexible"}
Requested date: ${value("qRequestedDate") || "Not selected"}
Best time: ${value("qRequestedTime") || "Flexible"}

Junk details:
${buildDetails()}

Photos selected: ${files().length}`;

    preview.textContent = text;
  }

  function renderPhotos() {
    const selected = files();

    if (!selected.length) {
      photoPreview.innerHTML = "<p>No photos selected yet. Photos are optional, but they help us quote faster.</p>";
      return;
    }

    const shown = selected.slice(0, MAX_PHOTOS);
    const html = shown.map(file => {
      const url = URL.createObjectURL(file);
      return `<img src="${url}" alt="Selected junk removal photo">`;
    }).join("");

    const extra = selected.length > MAX_PHOTOS
      ? `<p><strong>${selected.length - MAX_PHOTOS} extra photo${selected.length - MAX_PHOTOS === 1 ? "" : "s"} not attached.</strong> Upload up to ${MAX_PHOTOS} photos per request.</p>`
      : "";

    photoPreview.innerHTML = `
      <p><strong>${shown.length} photo${shown.length === 1 ? "" : "s"} selected.</strong> We’ll use these only to review the quote.</p>
      <div class="photo-grid">${html}</div>
      ${extra}
    `;
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
        name: file.name || `junk-photo-${index + 1}.jpg`,
        type: "image/jpeg",
        data: dataUrl.split(",")[1],
        originalSize: file.size
      };
    } catch (error) {
      return {
        name: file.name || `junk-photo-${index + 1}.jpg`,
        type: file.type || "image/jpeg",
        data: String(original).split(",")[1],
        originalSize: file.size
      };
    }
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

  async function buildPayload() {
    const selected = files().slice(0, MAX_PHOTOS);

    if (selected.length) {
      setStatus(`Preparing ${selected.length} photo${selected.length === 1 ? "" : "s"}...`, "loading");
    }

    const photos = await Promise.all(selected.map((file, index) => compressImage(file, index)));

    return {
      source: "Website Junk Removal Quote Form",
      website: window.location.href,
      name: value("qName"),
      phone: value("qPhone"),
      town: value("qTown"),
      service: "Junk Removal",
      timing: value("qTiming"),
      requestedDate: value("qRequestedDate"),
      requestedTime: value("qRequestedTime"),
      junkSize: value("qJunkSize"),
      access: value("qAccess"),
      windowCount: "",
      windowExtras: "",
      washSurface: "",
      washCondition: "",
      details: buildDetails(),
      priorityHint: isHotLead() ? "Hot" : "Normal",
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      photos
    };
  }

  async function submitQuote(event) {
    event.preventDefault();

    if (!validate()) return;

    const backendUrl = window.CLEANUP_BACKEND_URL;

    if (!backendUrl) {
      setStatus("Quote system is not connected yet. Please call instead.", "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      setStatus("Submitting your junk removal quote request...", "loading");

      const payload = await buildPayload();

      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(payload));

      await fetch(backendUrl, {
        method: "POST",
        mode: "no-cors",
        body
      });

      setStatus("Quote request submitted. We’ll review it and reach out soon.", "success");
      form.reset();
      renderPhotos();
      updatePreview();
    } catch (error) {
      setStatus("Something went wrong. Please call us or try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Quote Request";
    }
  }

  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  form.addEventListener("submit", submitQuote);

  photoInput.addEventListener("change", () => {
    renderPhotos();
    updatePreview();
  });

  renderPhotos();
  updatePreview();
})();
