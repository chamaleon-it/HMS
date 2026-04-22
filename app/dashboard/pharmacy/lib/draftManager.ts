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

// Periodically prune and ensure "always on top" behavior
if (typeof window !== 'undefined') {
  setInterval(notify, 2000);


  window.addEventListener('focus', () => draftManager.bringToFront());
  window.addEventListener('click', () => draftManager.bringToFront());
}

export const draftManager = {
  bringToFront: () => {
    if (typeof window === 'undefined' || window.opener || activeDrafts.length === 0) return;

    // Use a small timeout to allow the browser to finish its own focus handling
    setTimeout(() => {
      activeDrafts.forEach(d => {
        if (d.win && !d.win.closed) {
          try {
            d.win.focus();
          } catch (e) {}
        }
      });
    }, 50);
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

