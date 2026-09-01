import { useEffect } from "react";

export function AboutCreditFix() {
  useEffect(() => {
    const apply = () => {
      const headings = Array.from(document.querySelectorAll("h2"));
      const aboutHeading = headings.find((el) => el.textContent?.trim() === "درباره ما");
      if (!aboutHeading) return false;

      const container = aboutHeading.parentElement;
      if (!container) return false;

      const oldParagraph = container.querySelector("p");
      if (!oldParagraph) return false;

      oldParagraph.innerHTML = `
        <span style="font-weight:800">
          💗 این اولین برنامه <span style="color:var(--accent);font-weight:900">زهرا ۱۱ ساله از دبی</span>
          است که در کلاس <span style="color:var(--accent);font-weight:900">خانم دکتر ماه منیر آقایی</span>
          ساخته شده است.
        </span>
        <br />
        <span style="display:inline-block;margin-top:6px;font-weight:800">
          شماره تماس استاد:
          <a
            href="tel:00971551544988"
            dir="ltr"
            style="color:var(--accent);font-weight:900;text-decoration:underline;text-underline-offset:4px"
          >
            00971551544988
          </a>
        </span>
      `;
      return true;
    };

    if (apply()) return;

    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
