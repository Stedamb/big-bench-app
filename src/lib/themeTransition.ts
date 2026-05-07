let timeouts: ReturnType<typeof setTimeout>[] = [];

export function startThemeTransition(callback: () => void) {
  timeouts.forEach(clearTimeout);
  timeouts = [];

  document.documentElement.classList.add("theme-wipe");

  timeouts.push(setTimeout(() => {
    callback();
  }, 550));

  timeouts.push(setTimeout(() => {
    document.documentElement.classList.remove("theme-wipe");
    timeouts = [];
  }, 1200));
}
