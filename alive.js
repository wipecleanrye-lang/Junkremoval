
(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function ensureProgressBar() {
    if ($(".scroll-progress")) return;

    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.innerHTML = "<span></span>";
    document.body.prepend(bar);
  }

  function updateProgress() {
    const fill = $(".scroll-progress span");
    if (!fill) return;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    fill.style.width = Math.max(0, Math.min(100, percent)) + "%";
  }

  function headerScroll() {
    const header = $(".main-header");
    if (!header) return;
    header.classList.toggle("header-scrolled", window.scrollY > 25);
  }

  function setupReveal() {
    const revealTargets = [
      ".clean-card",
      ".process-card",
      ".review-card",
      ".price-card",
      ".faq-card",
      ".protect-card",
      ".section-head",
      ".cta-band",
      ".quote-shell",
      ".page-hero-card",
      ".alive-estimator"
    ];

    $$(revealTargets.join(",")).forEach((el) => el.classList.add("alive-reveal"));

    if (!("IntersectionObserver" in window)) {
      $$(".alive-reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    $$(".alive-reveal").forEach((el, index) => {
      el.style.transitionDelay = Math.min(index % 5, 4) * 55 + "ms";
      observer.observe(el);
    });
  }

  function setupTilt() {
    const cards = $$(".clean-card, .process-card, .review-card, .price-card, .protect-card");

    cards.forEach((card) => {
      card.classList.add("alive-tilt");

      card.addEventListener("mousemove", (event) => {
        if (window.innerWidth < 900) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateX = ((y / rect.height) - 0.5) * -4;
        const rotateY = ((x / rect.width) - 0.5) * 4;

        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  function setupFloatingActions() {
    if ($(".alive-floating-actions")) return;

    const wrap = document.createElement("div");
    wrap.className = "alive-floating-actions";
    wrap.innerHTML = `
      <a href="contact.html">Get Quote</a>
      <a href="pricing.html">Pricing</a>
    `;
    document.body.appendChild(wrap);
  }

  function toast(message) {
    let el = $(".alive-mini-toast");

    if (!el) {
      el = document.createElement("div");
      el.className = "alive-mini-toast";
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.add("show");

    clearTimeout(window.__aliveToastTimer);
    window.__aliveToastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 2300);
  }

  function estimatePrice(size, access, heavy) {
    let low = 95;
    let high = 150;
    let meter = 30;

    const sizeMap = {
      "Minimum pickup": [95, 150, 25],
      "Single large item": [125, 225, 35],
      "Small pickup": [150, 250, 45],
      "Medium load": [250, 450, 60],
      "Large load": [400, 750, 78],
      "Cleanout": [500, 1200, 90]
    };

    if (sizeMap[size]) {
      [low, high, meter] = sizeMap[size];
    }

    if (access === "Inside pickup") {
      low += 25;
      high += 75;
      meter += 8;
    }

    if (access === "Stairs involved") {
      low += 40;
      high += 125;
      meter += 12;
    }

    if (access === "Long carry") {
      low += 35;
      high += 100;
      meter += 10;
    }

    if (heavy === "One heavy item") {
      low += 25;
      high += 75;
      meter += 8;
    }

    if (heavy === "Multiple heavy items") {
      low += 75;
      high += 175;
      meter += 16;
    }

    meter = Math.min(100, meter);

    return { low, high, meter };
  }

  function estimatorHTML() {
    return `
      <section class="alive-estimator-section">
        <div class="container">
          <div class="alive-estimator">
            <div class="alive-estimator-panel">
              <div class="alive-estimator-title">
                <p class="eyebrow">Interactive Estimate</p>
                <h2>Get a rough idea before you send photos.</h2>
                <p>This is not a final quote. It helps you understand the range before submitting photos and job details.</p>
              </div>

              <div class="alive-choice-group" data-group="size">
                <strong>How much junk?</strong>
                <div class="alive-choice-row">
                  <button class="alive-choice active" type="button" data-value="Minimum pickup">Minimum<small>Small item or tiny pile</small></button>
                  <button class="alive-choice" type="button" data-value="Single large item">One item<small>Couch, mattress, dresser</small></button>
                  <button class="alive-choice" type="button" data-value="Small pickup">Small load<small>Few items or bags</small></button>
                  <button class="alive-choice" type="button" data-value="Medium load">Medium<small>Garage corner or mixed pile</small></button>
                  <button class="alive-choice" type="button" data-value="Large load">Large<small>Multiple bulky items</small></button>
                  <button class="alive-choice" type="button" data-value="Cleanout">Cleanout<small>Move-out or garage cleanout</small></button>
                </div>
              </div>

              <div class="alive-choice-group" data-group="access">
                <strong>Access?</strong>
                <div class="alive-choice-row">
                  <button class="alive-choice active" type="button" data-value="Curbside / easy access">Easy<small>Curbside or driveway</small></button>
                  <button class="alive-choice" type="button" data-value="Inside pickup">Inside<small>We go inside</small></button>
                  <button class="alive-choice" type="button" data-value="Stairs involved">Stairs<small>One or more flights</small></button>
                  <button class="alive-choice" type="button" data-value="Long carry">Long carry<small>Far from truck</small></button>
                </div>
              </div>

              <div class="alive-choice-group" data-group="heavy">
                <strong>Heavy items?</strong>
                <div class="alive-choice-row">
                  <button class="alive-choice active" type="button" data-value="No major heavy items">No<small>Normal household items</small></button>
                  <button class="alive-choice" type="button" data-value="One heavy item">One<small>One heavy item</small></button>
                  <button class="alive-choice" type="button" data-value="Multiple heavy items">Multiple<small>Heavy or awkward items</small></button>
                </div>
              </div>
            </div>

            <div class="alive-estimator-result">
              <div class="alive-result-label">Rough Range</div>
              <div class="alive-result-price" id="aliveEstimatePrice">$95–$150</div>
              <p class="alive-result-note" id="aliveEstimateNote">Easy access minimum pickup. Photos help confirm the final price.</p>

              <div class="alive-meter">
                <span id="aliveEstimateMeter"></span>
              </div>

              <ul class="alive-result-list">
                <li>Final quote depends on photos, volume, weight, stairs, and disposal fees.</li>
                <li>No payment is required to request a quote.</li>
                <li>Photos are used only to review the job.</li>
              </ul>

              <div class="alive-result-actions">
                <button type="button" id="aliveUseEstimate">Start quote with this estimate</button>
                <a href="tel:9143063677">Call instead</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function setupEstimator() {
    const main = $("main");
    if (!main) return;

    const isHome = location.pathname.endsWith("/") || location.pathname.endsWith("index.html") || location.pathname === "/";
    const isPricing = location.pathname.includes("pricing");

    if ((isHome || isPricing) && !$(".alive-estimator-section")) {
      const cta = $(".cta-band");
      if (isPricing) {
        main.insertAdjacentHTML("beforeend", estimatorHTML());
      } else if (cta) {
        cta.insertAdjacentHTML("afterend", estimatorHTML());
      } else {
        main.insertAdjacentHTML("beforeend", estimatorHTML());
      }
    }

    const estimator = $(".alive-estimator");
    if (!estimator) return;

    let values = {
      size: "Minimum pickup",
      access: "Curbside / easy access",
      heavy: "No major heavy items"
    };

    function update() {
      const result = estimatePrice(values.size, values.access, values.heavy);
      const price = $("#aliveEstimatePrice");
      const note = $("#aliveEstimateNote");
      const meter = $("#aliveEstimateMeter");

      if (price) price.textContent = `$${result.low}–$${result.high}`;
      if (meter) meter.style.width = result.meter + "%";

      if (note) {
        note.textContent = `${values.size} with ${values.access.toLowerCase()} and ${values.heavy.toLowerCase()}. Photos help confirm the final price.`;
      }

      const resultBox = $(".alive-estimator-result");
      if (resultBox) {
        resultBox.classList.remove("alive-pulse");
        void resultBox.offsetWidth;
        resultBox.classList.add("alive-pulse");
      }
    }

    $$(".alive-choice", estimator).forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.closest("[data-group]").dataset.group;

        $$(".alive-choice", button.closest("[data-group]")).forEach((b) => b.classList.remove("active"));
        button.classList.add("active");

        values[group] = button.dataset.value;
        update();
      });
    });

    const use = $("#aliveUseEstimate");
    if (use) {
      use.addEventListener("click", () => {
        const result = estimatePrice(values.size, values.access, values.heavy);

        localStorage.setItem("cleanup_quote_prefill", JSON.stringify({
          qJunkSize: values.size,
          qAccess: values.access,
          qHeavyItems: values.heavy,
          qDetails: `Estimator range shown: $${result.low}–$${result.high}. Please review with photos and final job details.`
        }));

        toast("Estimate saved — opening quote form.");
        setTimeout(() => {
          window.location.href = "contact.html";
        }, 600);
      });
    }

    update();
  }

  function prefillQuoteForm() {
    const form = $("#junkQuoteForm");
    if (!form) return;

    try {
      const raw = localStorage.getItem("cleanup_quote_prefill");
      if (!raw) return;

      const data = JSON.parse(raw);

      Object.keys(data).forEach((id) => {
        const el = document.getElementById(id);
        if (el && data[id]) {
          el.value = data[id];
          el.dispatchEvent(new Event("change", { bubbles: true }));
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });

      localStorage.removeItem("cleanup_quote_prefill");
      toast("Estimate details added to the quote form.");
    } catch (error) {}
  }

  function setupFAQ() {
    $$(".faq-card").forEach((card, index) => {
      if (index > 0) card.classList.add("is-collapsed");

      card.addEventListener("click", () => {
        card.classList.toggle("is-collapsed");
      });
    });
  }

  function setupSuccessWatch() {
    const status = $("#quoteStatus");
    if (!status) return;

    const observer = new MutationObserver(() => {
      if (status.classList.contains("success")) {
        toast("Quote request submitted.");
      }
    });

    observer.observe(status, { attributes: true, childList: true, subtree: true });
  }

  ensureProgressBar();
  setupReveal();
  setupTilt();
  setupFloatingActions();
  setupEstimator();
  prefillQuoteForm();
  setupFAQ();
  setupSuccessWatch();

  updateProgress();
  headerScroll();

  window.addEventListener("scroll", () => {
    updateProgress();
    headerScroll();
  }, { passive: true });
})();
