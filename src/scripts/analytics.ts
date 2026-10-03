// Tags links with Umami's data-umami-event attributes. Umami's tracker records them on click and
// holds same-tab navigations until the event is sent. A no-op when Umami isn't loaded.

function where(a: Element): string {
  const explicit = a.closest<HTMLElement>("[data-track-from]")?.dataset.trackFrom;
  if (explicit) return explicit;
  if (a.closest("#menu")) return "menu";
  if (a.closest("header")) return "header";
  if (a.closest("footer")) return "footer";
  if (a.closest(".sheet")) return "cv";
  return a.closest("section[id]")?.id ?? "page";
}

function tag(a: HTMLAnchorElement, event: string, data: Record<string, string>) {
  a.dataset.umamiEvent = event;
  for (const [k, v] of Object.entries(data)) a.setAttribute(`data-umami-event-${k}`, v);
}

document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
  const href = a.getAttribute("href") ?? "";
  const from = where(a);
  if (a.dataset.project) tag(a, "project-open", { project: a.dataset.project, from });
  else if (/^\/cv\/?$/.test(href)) tag(a, "cv-open", { from });
  else if (href.startsWith("mailto:")) tag(a, "outbound", { to: "email", from });
  else if (href.includes("linkedin.com")) tag(a, "outbound", { to: "linkedin", from });
  else if (href.includes("github.com")) tag(a, "outbound", { to: "github", from });
});
