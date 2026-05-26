document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const menuOpen = document.querySelector("[data-menu-open]");
  const menuClose = document.querySelector("[data-menu-close]");

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const setMenuOpen = (isOpen) => {
    mobileMenu?.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  menuOpen?.addEventListener("click", () => setMenuOpen(true));
  menuClose?.addEventListener("click", () => setMenuOpen(false));

  const floatingChat = document.querySelector("[data-floating-chat]");
  const chatClose = document.querySelector("[data-chat-close]");

  chatClose?.addEventListener("click", () => {
    floatingChat?.classList.add("minimized");
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  const animateCounter = (el, target, suffix = "") => {
    if (prefersReducedMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.floor(eased * target)}${suffix}`;

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll("[data-count]");

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = Number.parseInt(el.getAttribute("data-count"), 10);
          const suffix = el.getAttribute("data-suffix") || "";

          if (!Number.isNaN(target)) animateCounter(el, target, suffix);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.45 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => {
      const target = Number.parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      if (!Number.isNaN(target)) el.textContent = `${target}${suffix}`;
    });
  }

  document.querySelectorAll("[data-drag-scroll]").forEach((track) => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener("pointerdown", (event) => {
      isDown = true;
      startX = event.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.classList.add("dragging");
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener("pointermove", (event) => {
      if (!isDown) return;
      const x = event.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.1;
    });

    const stopDragging = (event) => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("dragging");
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
    };

    track.addEventListener("pointerup", stopDragging);
    track.addEventListener("pointercancel", stopDragging);
    track.addEventListener("pointerleave", stopDragging);
  });
});
