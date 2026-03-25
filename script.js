document.addEventListener("DOMContentLoaded", () => {
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const navLinks = Array.from(document.querySelectorAll('.nav-list a[href^="#"]'));
  const themeToggle = document.getElementById("theme-toggle");
  const yearElement = document.getElementById("year");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const themeStorageKey = "portfolio-theme";

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const setActiveLink = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const updateHeaderState = () => {
    if (!siteHeader) {
      return;
    }

    siteHeader.classList.toggle("scrolled", window.scrollY > 24);
  };

  const updateActiveSection = () => {
    if (!sections.length) {
      return;
    }

    const headerOffset = siteHeader ? siteHeader.offsetHeight : 0;
    const scrollPosition = window.scrollY + headerOffset + 100;
    let activeSectionId = sections[0].id;

    sections.forEach((section) => {
      if (scrollPosition >= section.offsetTop) {
        activeSectionId = section.id;
      }
    });

    setActiveLink(activeSectionId);
  };

  let isTicking = false;

  const updateNavigationUI = () => {
    updateHeaderState();
    updateActiveSection();
    isTicking = false;
  };

  const requestNavigationUpdate = () => {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(updateNavigationUI);
  };

  window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
  window.addEventListener("load", requestNavigationUpdate);

  const setMenuState = (isOpen) => {
    if (!navToggle || !navList) {
      return;
    }

    navList.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const targetId = link.getAttribute("href").slice(1);
        setActiveLink(targetId);

        if (window.innerWidth <= 820) {
          setMenuState(false);
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth > 820) {
        return;
      }

      if (!(event.target instanceof Element) || !event.target.closest(".main-nav")) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        setMenuState(false);
      }

      requestNavigationUpdate();
    });
  }

  const setTheme = (theme) => {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";

    if (themeToggle) {
      themeToggle.checked = isDark;
    }
  };

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(themeStorageKey);
    } catch (error) {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(themeStorageKey, theme);
    } catch (error) {
      return;
    }
  };

  if (themeToggle) {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = getSavedTheme();
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);

    themeToggle.addEventListener("change", () => {
      const nextTheme = themeToggle.checked ? "dark" : "light";
      setTheme(nextTheme);
      saveTheme(nextTheme);
    });
  }

  if (contactForm) {
    const formFields = Array.from(
      contactForm.querySelectorAll("input[name], textarea[name]")
    );
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const clearFormStatus = () => {
      if (!formStatus) {
        return;
      }

      formStatus.textContent = "";
      formStatus.classList.remove("is-success", "is-error");
    };

    const setFormStatus = (message, statusType) => {
      if (!formStatus) {
        return;
      }

      formStatus.textContent = message;
      formStatus.classList.remove("is-success", "is-error");

      if (statusType) {
        formStatus.classList.add(statusType);
      }
    };

    const getErrorMessage = (field) => {
      const value = field.value.trim();

      if (!value) {
        if (field.name === "name") {
          return "Please enter your name.";
        }

        if (field.name === "email") {
          return "Please enter your email address.";
        }

        return "Please enter your message.";
      }

      if (field.name === "email" && !emailPattern.test(value)) {
        return "Please enter a valid email address.";
      }

      return "";
    };

    const setFieldError = (field, message) => {
      const errorElement = document.getElementById(`${field.id}-error`);

      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }

      if (errorElement) {
        errorElement.textContent = message;
      }
    };

    const validateField = (field) => {
      const errorMessage = getErrorMessage(field);
      setFieldError(field, errorMessage);
      return !errorMessage;
    };

    const resetFieldState = (field) => {
      setFieldError(field, "");
    };

    formFields.forEach((field) => {
      field.addEventListener("blur", () => {
        validateField(field);
      });

      field.addEventListener("input", () => {
        clearFormStatus();

        if (field.hasAttribute("aria-invalid")) {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFormStatus();

      const invalidFields = formFields.filter((field) => !validateField(field));

      if (invalidFields.length) {
        setFormStatus("Please correct the highlighted fields.", "is-error");
        invalidFields[0].focus();
        return;
      }

      setFormStatus(
        "Thanks! Your message passed validation and is ready to send.",
        "is-success"
      );

      contactForm.reset();
      formFields.forEach(resetFieldState);
    });
  }

  requestNavigationUpdate();
});
