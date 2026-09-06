/* Progressive enhancements. All portfolio content is visible without JavaScript. */
(() => {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const header = document.getElementById("navbar");
  if (toggle && links) {
    document.documentElement.classList.add("has-menu");
    toggle.hidden = false;
    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("open");
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      links.classList.toggle("open", open);
    });
    links.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        close();
        toggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) close();
    });
    header.addEventListener("focusout", (event) => {
      if (!header.contains(event.relatedTarget)) close();
    });
    window.matchMedia("(min-width: 1001px)").addEventListener("change", close);
  }

  const tablist = document.querySelector(".case-tabs");
  if (tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const activate = (tab) => {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute("aria-controls")).hidden =
          !selected;
      });
    };
    tablist.hidden = false;
    activate(tabs[0]);
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft")
          next = tabs[(index + tabs.length - 1) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          activate(next);
          next.focus();
        }
      });
    });
  }

  const toc = document.getElementById("article-toc");
  if (toc) {
    toc.closest("aside").hidden = false;
    document.querySelectorAll(".writeup-body h2").forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      toc.append(link);
    });
  }
  document
    .querySelectorAll("[data-year]")
    .forEach((el) => (el.textContent = new Date().getFullYear()));
  const print = document.getElementById("print-resume");
  if (print) print.addEventListener("click", () => window.print());
})();
