/* KOV redesign — shared chrome + motion */
(() => {
  const page = document.body.dataset.page || "home";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) document.documentElement.classList.add("reduced");
  const arrow = '<svg viewBox="0 0 16 16" fill="none"><path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" stroke-width="1.6"/></svg>';
  const links = [
    ["index.html", "Prva stran", "home"],
    ["nas-svet.html", "Naš svet", "svet"],
    ["smo-drugacni.html", "Smo drugačni", "drugacni"],
    ["projekti.html", "Projekti", "projekti"],
    ["kontakt.html", "Kontakt", "kontakt"],
  ];

  /* ---------- chrome ---------- */
  const nav = document.querySelector("[data-nav]");
  if (nav) {
    nav.outerHTML = `
    <header class="nav" id="nav">
      <a href="index.html" class="nav__logo" aria-label="Kolektor KOV"><img src="assets/src/kov-d1.png" alt="KOV"></a>
      <nav class="nav__links">${links.slice(1).map(([h, t, k]) => `<a href="${h}" class="${k === page ? "is-active" : ""}">${t}</a>`).join("")}</nav>
      <div class="nav__right">
        <div class="lang"><b>SL</b><a href="https://kov.si/?lang=en">EN</a></div>
        <a href="kontakt.html" class="btn">Povpraševanje ${arrow}</a>
        <button class="burger" aria-label="Meni"><i></i><i></i></button>
      </div>
    </header>
    <div class="mmenu">
      <div>${links.map(([h, t]) => `<a class="big" href="${h}">${t}</a>`).join("")}</div>
      <div class="mute">info@kov.si<br>+386 45 835 745</div>
    </div>`;
  }
  const foot = document.querySelector("[data-foot]");
  if (foot) {
    foot.outerHTML = `
    <footer class="foot">
      <div class="foot__top">
        <div>
          <h4>Pišite nam</h4>
          <a class="foot__mail" href="mailto:info@kov.si">info@kov.si</a>
          <a class="foot__mail" href="tel:+38645835745">+386 45 835 745</a>
        </div>
        <div><h4>Obiščite nas</h4><p>Cesta Franceta Prešerna 50<br>4270 Jesenice, Slovenija</p></div>
        <div><h4>Delovni čas</h4><p>Ponedeljek do petek<br>7:00 do 15:00</p></div>
        <div><h4>Razišči</h4>${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div>
      </div>
      <div class="foot__logo"><img src="assets/src/kov-d1.png" alt="KOV"></div>
      <div class="foot__bottom">
        <span>© Kolektor KOV d.o.o. ${new Date().getFullYear()}. Vse pravice pridržane.</span>
        <img src="assets/src/KOLEKTOR_RGB-e1732623594227.png" alt="Kolektor">
      </div>
    </footer>`;
  }
  const navEl = document.getElementById("nav");
  document.querySelector(".burger")?.addEventListener("click", () => document.body.classList.toggle("menu-open"));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  const hasGsap = window.gsap && window.ScrollTrigger;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    window.__lenis = lenis;
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* nav solid / hide on scroll */
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    navEl?.classList.toggle("is-solid", y > 40);
    navEl?.classList.toggle("is-hidden", y > lastY && y > window.innerHeight * 0.9 && !document.body.classList.contains("menu-open"));
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- loader ---------- */
  const loader = document.querySelector(".loader");
  const intro = () => {
    if (!hasGsap || reduced) return;
    gsap.from(".hero__media img, .phero__img img", { scale: 1.18, duration: 2.6, ease: "expo.out" });
    gsap.from(".js-hero-line > span", { yPercent: 110, duration: 1.3, stagger: 0.09, ease: "expo.out", delay: 0.15 });
    gsap.from(".js-hero-fade", { opacity: 0, y: 24, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 0.45 });
    gsap.from(".nav, .nav__logo", { opacity: 0, y: -16, duration: 1, ease: "expo.out", delay: 0.3 });
  };
  if (loader) {
    const seen = sessionStorageSafe("kov-loaded");
    if (!hasGsap || reduced || seen) { loader.remove(); intro(); }
    else {
      sessionStorageSafe("kov-loaded", "1");
      const tl = gsap.timeline({ onComplete: () => loader.remove() });
      tl.to(".loader__logo img", { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power3.inOut" })
        .to(".loader__bar i", { width: "100%", duration: 1.2, ease: "power3.inOut" }, 0)
        .to(".loader__logo", { yPercent: -30, opacity: 0, duration: 0.7, ease: "power3.in" }, "+=0.15")
        .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.25")
        .add(intro, "-=0.6");
    }
  } else intro();

  function sessionStorageSafe(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }

  /* ---------- hero embers ---------- */
  const cv = document.querySelector(".hero canvas");
  if (cv && !reduced) {
    const ctx = cv.getContext("2d");
    let W, H, dpr, parts = [];
    const size = () => { dpr = Math.min(devicePixelRatio, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);
    let mx = 0.5, my = 0.5;
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; });
    const spawn = () => {
      const burst = Math.random() < 0.6;
      // source near the welding point (right-centre of frame), plus ambient embers
      const sx = burst ? W * (0.6 + Math.random() * 0.06) : Math.random() * W;
      const sy = burst ? H * (0.6 + Math.random() * 0.05) : H * (0.6 + Math.random() * 0.45);
      const a = burst ? -Math.PI * (0.55 + Math.random() * 0.4) : -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      const sp = burst ? 2 + Math.random() * 5 : 0.3 + Math.random() * 0.8;
      parts.push({ x: sx, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: burst ? 40 + Math.random() * 60 : 160 + Math.random() * 200, r: burst ? 0.6 + Math.random() * 1.2 : 0.8 + Math.random() * 1.8, burst });
    };
    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(cv);
    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) spawn();
      parts = parts.filter((p) => p.life < p.max);
      for (const p of parts) {
        p.life++;
        if (p.burst) { p.vy += 0.09; p.vx *= 0.985; }
        else { p.vx += (mx - 0.5) * 0.004 + Math.sin(p.life * 0.03 + p.y * 0.01) * 0.01; p.vy -= 0.002; }
        const ox = p.x, oy = p.y;
        p.x += p.vx; p.y += p.vy;
        const t = 1 - p.life / p.max;
        ctx.strokeStyle = `rgba(255,${140 + 90 * t | 0},${50 + 60 * t | 0},${t * (p.burst ? 0.9 : 0.55)})`;
        ctx.lineWidth = p.r;
        ctx.beginPath(); ctx.moveTo(ox - p.vx * (p.burst ? 2.5 : 1), oy - p.vy * (p.burst ? 2.5 : 1)); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
    };
    loop();
  }

  if (!hasGsap || reduced) {
    document.querySelectorAll(".rv").forEach((el) => (el.style.opacity = 1));
    document.querySelectorAll(".statement .w").forEach((w) => (w.style.color = "var(--ink)"));
    return;
  }

  /* ---------- reveals ---------- */
  gsap.utils.toArray(".rv").forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  gsap.utils.toArray(".js-lines").forEach((el) => {
    gsap.from(el.querySelectorAll(".line-mask > span"), { yPercent: 110, duration: 1.3, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
  });

  /* hero parallax out */
  if (document.querySelector(".hero")) {
    gsap.to(".hero__media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__content", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "30% top", end: "bottom top", scrub: true } });
  }
  document.querySelectorAll(".phero").forEach((s) => {
    gsap.to(s.querySelector(".phero__img"), { yPercent: 12, ease: "none", scrollTrigger: { trigger: s, start: "top top", end: "bottom top", scrub: true } });
  });

  /* statement word light-up */
  const st = document.querySelector(".statement .d2");
  if (st) {
    st.innerHTML = st.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    gsap.to(st.querySelectorAll(".w"), { color: "#eef0f2", stagger: 0.1, ease: "none", scrollTrigger: { trigger: st, start: "top 78%", end: "bottom 45%", scrub: true } });
  }

  /* services pinned image swap */
  const svc = document.querySelector(".svc");
  if (svc && innerWidth > 800) {
    const imgs = svc.querySelectorAll(".svc__img");
    const items = svc.querySelectorAll(".svc__item");
    const count = svc.querySelector(".svc__count span");
    items.forEach((it, i) => {
      if (i > 0) {
        gsap.fromTo(imgs[i], { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", ease: "none", scrollTrigger: { trigger: it, start: "top bottom", end: "top 25%", scrub: true } });
      }
      ScrollTrigger.create({ trigger: it, start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive && count) count.style.transform = `translateY(${-i * 100}%)`; } });
    });
    imgs.forEach((im) => gsap.fromTo(im.querySelector("img"), { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: svc, start: "top bottom", end: "bottom top", scrub: true } }));
  }

  /* numbers count-up */
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("sl-SI")) });
  });
  gsap.utils.toArray(".nums__row").forEach((r, i) => {
    gsap.from(r, { opacity: 0, y: 60, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: r, start: "top 90%" } });
  });

  /* image inner parallax */
  gsap.utils.toArray(".tile--photo img, .media-wide img").forEach((im) => {
    gsap.fromTo(im, { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.utils.toArray(".alps__img").forEach((im) => {
    gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: im.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* projects horizontal pin */
  const pin = document.querySelector(".proj__pin");
  if (pin && innerWidth > 800) {
    const track = pin.querySelector(".proj__track");
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    track.querySelectorAll(".card__img img").forEach((im) => {
      gsap.fromTo(im, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + dist(), scrub: true } });
    });
  }

  /* process steps fill */
  gsap.utils.toArray(".step").forEach((s, i) => {
    gsap.to(s, { "--p": "100%", duration: 1.2, delay: i * 0.25, ease: "power2.inOut", scrollTrigger: { trigger: ".steps", start: "top 80%" } });
  });

  /* timeline */
  gsap.utils.toArray(".tl__row").forEach((r) => ScrollTrigger.create({ trigger: r, start: "top 65%", end: "bottom 35%", toggleClass: "is-on" }));

  /* lightbox */
  const lb = document.createElement("div");
  lb.className = "lb";
  lb.innerHTML = '<button>Zapri</button><img alt="">';
  document.body.appendChild(lb);
  document.querySelectorAll("[data-lb]").forEach((el) =>
    el.addEventListener("click", () => { lb.querySelector("img").src = el.dataset.lb; lb.classList.add("is-open"); lenis?.stop(); })
  );
  lb.addEventListener("click", () => { lb.classList.remove("is-open"); lenis?.start(); });

  /* form */
  document.querySelector(".form")?.addEventListener("submit", (e) => { e.preventDefault(); e.target.classList.add("sent"); });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
