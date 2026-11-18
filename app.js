// Kontakt obrazac: priprema teksta upita, bez slanja podataka.
const form = document.querySelector("#inquiry");
if (form) {
  // Odabir paketa preko poveznice s cjenika.
  const chosen = new URLSearchParams(location.search).get("paket");
  if (chosen && Array.from(form.elements.usluga.options).some((o) => o.value === chosen))
    form.elements.usluga.value = chosen;
  // Sastavljanje poruke iz unesenih podataka.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const d = new FormData(form);
    document.querySelector("#draft").value =
      `Poštovani BRANDEIS,\n\nZanima me: ${d.get("usluga")}.\n${d.get("opis")}\n\nIme: ${d.get("ime")}\nKontakt: ${d.get("kontakt")}\n\nMolim vas za procjenu i dogovor termina.`;
    document.querySelector("#result").hidden = false;
    document
      .querySelector("#result")
      .scrollIntoView({ behavior: "smooth", block: "center" });
  });
  // Kopiranje pripremljene poruke.
  document.querySelector("#copy").addEventListener("click", async () => {
    const draft = document.querySelector("#draft");
    try {
      await navigator.clipboard.writeText(draft.value);
      document.querySelector("#copy-status").textContent =
        "Tekst je kopiran. Upit još nije poslan.";
    } catch {
      draft.focus();
      draft.select();
      document.querySelector("#copy-status").textContent =
        "Označen tekst kopirajte pomoću Ctrl+C ili ⌘C. Upit još nije poslan.";
    }
  });
}

// USLUGE: detalji ostaju u HTML-u radi lakšeg uređivanja.
// JavaScript ih prikazuje u prozoru tek kada se odabere usluga.
const servicesPage = document.querySelector("#dom");
if (servicesPage && typeof HTMLDialogElement !== "undefined") {
  const dialog = document.createElement("dialog");
  dialog.className = "service-dialog";
  dialog.setAttribute("aria-labelledby", "service-dialog-title");
  dialog.innerHTML = `
    <button type="button" class="dialog-close" aria-label="Zatvori detalje">×</button>
    <p class="eyebrow">BRANDEIS · DETALJI USLUGE</p>
    <h2 id="service-dialog-title"></h2>
    <div class="service-dialog-content"></div>
  `;
  document.body.append(dialog);
  const title = dialog.querySelector("h2");
  const content = dialog.querySelector(".service-dialog-content");
  const close = dialog.querySelector(".dialog-close");
  let opener;

  function openService(button, name, details) {
    opener = button;
    title.textContent = name;
    content.replaceChildren(...details.map((node) => node.cloneNode(true)));
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("service-dialog-open");
    close.focus();
  }

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog &&
        (event.clientX < bounds.left || event.clientX > bounds.right ||
         event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("service-dialog-open");
    opener?.focus();
  });

  // Kartice doma, vozila i paketa. Originalni tekst se ne briše iz fajla.
  document.querySelectorAll("main article.price-card, main article.special").forEach((card) => {
    const heading = card.querySelector("h3");
    const label = card.querySelector(".eyebrow");
    const name = label ? label.textContent.trim() : heading.textContent.trim();
    const details = Array.from(card.children).filter((node) =>
      node !== heading && node !== label && node.tagName !== "A" && node.textContent.trim()
    );
    if (label) details.unshift(heading);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-trigger";
    button.setAttribute("aria-haspopup", "dialog");
    const nameText = document.createElement("span");
    nameText.className = "service-name";
    nameText.textContent = name;
    const cue = document.createElement("span");
    cue.className = "service-cue";
    cue.textContent = "Što uključuje?  +";
    button.append(nameText, cue);
    button.addEventListener("click", () => openService(button, name, details));
    card.replaceChildren(button);
    card.classList.add("service-compact");
  });

  // Namještaj: koristimo samo postojeći opis, bez izmišljanja opsega usluge.
  document.querySelectorAll("#dubinsko .price-list > div").forEach((row) => {
    const name = row.querySelector("span").textContent.trim();
    const details = document.createElement("p");
    details.textContent = `Dubinsko čišćenje: ${name.toLocaleLowerCase("hr")}. Opseg i cijenu dogovaramo nakon procjene dimenzija, materijala i stanja.`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "furniture-trigger";
    button.setAttribute("aria-haspopup", "dialog");
    const nameText = document.createElement("span");
    nameText.textContent = name;
    const cue = document.createElement("span");
    cue.textContent = "+";
    cue.setAttribute("aria-hidden", "true");
    button.append(nameText, cue);
    button.addEventListener("click", () => openService(button, name, [details]));
    row.replaceChildren(button);
  });
}

// Karusel: strelice, tipkovnica i prirodno prevlačenje na telefonu.
const serviceTrack = document.querySelector("#home-services");
if (serviceTrack) {
  const controls = document.querySelector("#dom .carousel-controls");
  const previous = controls.querySelector(".carousel-prev");
  const next = controls.querySelector(".carousel-next");
  controls.hidden = false;
  function updateArrows() {
    previous.disabled = serviceTrack.scrollLeft <= 2;
    next.disabled = serviceTrack.scrollLeft >= serviceTrack.scrollWidth - serviceTrack.clientWidth - 2;
  }
  function slide(direction) {
    const card = serviceTrack.querySelector(".price-card");
    const gap = parseFloat(getComputedStyle(serviceTrack).gap) || 0;
    serviceTrack.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  }
  previous.addEventListener("click", () => slide(-1));
  next.addEventListener("click", () => slide(1));
  serviceTrack.addEventListener("keydown", (event) => {
    if (event.target !== serviceTrack) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      slide(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  serviceTrack.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  updateArrows();
}
