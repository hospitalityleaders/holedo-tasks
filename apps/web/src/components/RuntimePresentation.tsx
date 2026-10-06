import { useRouter } from "next/router";
import { useEffect } from "react";

import { useTaskSettings } from "~/hooks/useTaskSettings";

const appendTrustedHtml = (
  target: HTMLElement,
  html: string,
  location: "head" | "footer",
) => {
  const template = document.createElement("template");
  template.innerHTML = html;
  const inserted: Node[] = [];

  for (const sourceNode of Array.from(template.content.childNodes)) {
    let node: Node;

    if (sourceNode instanceof HTMLScriptElement) {
      const script = document.createElement("script");
      for (const attribute of Array.from(sourceNode.attributes)) {
        script.setAttribute(attribute.name, attribute.value);
      }
      script.text = sourceNode.text;
      node = script;
    } else {
      node = sourceNode.cloneNode(true);
    }

    if (node instanceof Element) {
      node.setAttribute("data-holedo-injection", location);
    }
    target.appendChild(node);
    inserted.push(node);
  }

  return () => inserted.forEach((node) => node.parentNode?.removeChild(node));
};

export function RuntimePresentation() {
  const router = useRouter();
  const { data: settings, dataUpdatedAt } = useTaskSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    root.style.setProperty("--holedo-accent", settings.accentColor);
    root.style.setProperty(
      "--holedo-header-background",
      settings.headerBackgroundColor,
    );
    root.style.setProperty("--holedo-header-font", settings.headerFontColor);

    if (settings.siteIconUrl) {
      const iconUrl = `${settings.siteIconUrl}${settings.siteIconUrl.includes("?") ? "&" : "?"}holedo-v=${dataUpdatedAt}`;
      for (const rel of ["icon", "apple-touch-icon"]) {
        let link = document.head.querySelector<HTMLLinkElement>(
          `link[rel="${rel}"][data-holedo-runtime-branding]`,
        );
        if (!link) {
          link = document.createElement("link");
          link.rel = rel;
          link.dataset.holedoRuntimeBranding = "true";
          document.head.appendChild(link);
        }
        link.href = iconUrl;
      }
    }

    if (settings.openGraphImageUrl) {
      const metadata = [
        ["property", "og:image"],
        ["name", "twitter:image"],
      ] as const;
      for (const [attribute, value] of metadata) {
        let meta = document.head.querySelector<HTMLMetaElement>(
          `meta[${attribute}="${value}"][data-holedo-runtime-branding]`,
        );
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute(attribute, value);
          meta.dataset.holedoRuntimeBranding = "true";
          document.head.appendChild(meta);
        }
        meta.content = settings.openGraphImageUrl;
      }
    }
  }, [dataUpdatedAt, settings]);

  useEffect(() => {
    if (!settings || router.pathname.startsWith("/admin")) return;

    const removeHeader = settings.headerCode
      ? appendTrustedHtml(document.head, settings.headerCode, "head")
      : undefined;
    const removeFooter = settings.footerCode
      ? appendTrustedHtml(document.body, settings.footerCode, "footer")
      : undefined;

    return () => {
      removeHeader?.();
      removeFooter?.();
    };
  }, [router.pathname, settings]);

  return null;
}
