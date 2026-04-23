"use client";

export type Draft = {
  id: string;
  win: Window;
  label: string;
};

let activeDrafts: Draft[] = [];
let listeners: ((drafts: Draft[]) => void)[] = [];

const notify = () => {
  // Prune closed windows before notifying
  activeDrafts = activeDrafts.filter(d => !d.win.closed);
  listeners.forEach(l => l([...activeDrafts]));
};

if (typeof window !== 'undefined') {
  setInterval(notify, 2000);

  // Keep popups in front of the main window. We focus only the most recently
  // active popup (not all of them), so the relative z-order between popups
  // is preserved across main-window clicks.
  window.addEventListener('click', () => {
    if (!window.opener) {
      draftManager.bringToFront(true);
    }
  });
}

export const draftManager = {
  bringToFront: (immediate = false) => {
    if (typeof window === 'undefined' || window.opener || activeDrafts.length === 0) return;

    const performFocus = () => {
      // Focus only the most recently active draft (last in array).
      // Focusing all windows sequentially would always end with the last one
      // on top, blocking the earlier windows from being reachable by click.
      const top = activeDrafts[activeDrafts.length - 1];
      if (top && !top.win.closed) {
        try {
          top.win.focus();
        } catch (e) {}
      }
    };

    if (immediate) {
      performFocus();
    } else {
      if ((window as any)._btfTimeout) {
        clearTimeout((window as any)._btfTimeout);
      }
      (window as any)._btfTimeout = setTimeout(performFocus, 100);
    }
  },
  handleWindowFocus: (winName: string) => {
    const index = activeDrafts.findIndex(d => d.win.name === winName);
    if (index !== -1) {
      const [draft] = activeDrafts.splice(index, 1);
      activeDrafts.push(draft);
      notify();
      // Do NOT call bringToFront here. The popup is already focused by the OS.
      // A deferred bringToFront would steal focus from the main window if the
      // user clicks there within the debounce window.
    }
  },
  addDraft: (win: Window, label: string = "Empty Draft") => {
    const id = `draft_${Date.now()}`;
    activeDrafts.push({ id, win, label });
    notify();
    return id;
  },
  removeDraft: (win: Window) => {
    activeDrafts = activeDrafts.filter(d => d.win !== win);
    notify();
  },
  updateLabel: (win: Window, label: string) => {
    const draft = activeDrafts.find(d => d.win === win);
    if (draft) {
      draft.label = label;
      notify();
    }
  },
  getDrafts: () => activeDrafts,
  subscribe: (listener: (drafts: Draft[]) => void) => {
    listeners.push(listener);
    listener([...activeDrafts]);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};
