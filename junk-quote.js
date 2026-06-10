
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
    if (!statusBox) return;
    statusBox.classList.remove("loading", "success", "error");
    if (type) statusBox.classList.add(type);
    statusBox.textContent = message;
  }

  function files() {
    if (!photoInput || !photoInput.files) return [];
    return Array.from(photoInput.files).filter(file => file.type.startsWith("image/"));
  }

  function buildDetails() {
    return [
      "Property type: " + (value("qPropertyType") || "Not provided"),
      "Best time of day: " + (value("qRequestedTime") || "Flexible"),
      "Photos selected: " + files().length,
      "Photos are highly requested for faster quote review."
    ].join("\\n");
  }

  function updatePreview() {
    if (!preview) return;

    const selectedPhotos = files().length;

    const text =
`Service: Junk Removal

Name: ${value("qName") || "[Name]"}
Phone: ${value("qPhone") || "[Phone]"}
Town: ${value("qTown") || "[Town]"}
Property type: ${value("qPropertyType") || "Not selected"}
Best time: ${value("qRequestedTime") || "Flexible"}

Photos selected: ${selectedPhotos}
Photo status: ${selectedPhotos > 0 ? "Photos added - easier to quote" : "No photos yet - photos are highly requested"}`;

    preview.textContent = text;
  }

  function renderPhotos() {
    if (!photoPreview) return;

    const selected = files();

    if (!selected.length) {
      photoPreview.innerHTML = "<p>No photos selected yet. <strong>Photos are highly requested</strong> because they help us quote faster.</p>";
      return;
    }

    const shown = selected.slice(0, MAX_PHOTOS);
    const html = shown.map(file => {
      const url = URL.createObjectURL(file);
      return `<img src="${url}" alt="Selected junk removal photo">`;
    }).join("");

    const extra = selected.length > MAX_PHOTOS
      ? `<p><strong>${selected.length - MAX_PHOTOS} extra photo${selected.length - MAX_PHOTOS === 1 ? "" : "s"} not attached.</strong> Upload up to ${MAX_PHOTOS} photos per quote request.</p>`
      : "";

    photoPreview.innerHTML = `
      <p><strong>${shown.length} photo${shown.length === 1 ? "" : "s"} selected.</strong> This helps us give a faster quote.</p>
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
      timing: "",
      requestedDate: "",
      requestedTime: value("qRequestedTime"),
      junkSize: "",
      access: "",
      windowCount: "",
      windowExtras: "",
      washSurface: "",
      washCondition: "",
      details: buildDetails(),
      priorityHint: photos.length > 0 ? "Photos Added" : "No Photos",
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
      setStatus("Submitting your quote request...", "loading");

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

  if (photoInput) {
    photoInput.addEventListener("change", () => {
      renderPhotos();
      updatePreview();
    });
  }

  renderPhotos();
  updatePreview();
})();
