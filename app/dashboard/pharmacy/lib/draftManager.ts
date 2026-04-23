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

  // Re-adding the click listener to ensure popups stay above the dashboard
  // even in non-Electron environments. Our debounced/interrupted bringToFront
  // makes this safe for Windows too.
  window.addEventListener('click', () => {
    if (!window.opener) {
      draftManager.bringToFront();
    }
  });
}

export const draftManager = {
  bringToFront: () => {
    if (typeof window === 'undefined' || window.opener || activeDrafts.length === 0) return;

    // Clear any existing timeout to debounce
    if ((window as any)._btfTimeout) {
      clearTimeout((window as any)._btfTimeout);
    }

    (window as any)._btfTimeout = setTimeout(() => {
      activeDrafts.forEach(d => {
        if (d.win && !d.win.closed) {
          try {
            d.win.focus();
            // Double-focus pattern for Windows/Electron stability
            setTimeout(() => {
              if (d.win && !d.win.closed) d.win.focus();
            }, 10);
          } catch (e) {}
        }
      });
      delete (window as any)._btfTimeout;
    }, 100);
  },
  // New method to handle focus from children
  handleWindowFocus: (winName: string) => {
    // If a child is focused, cancel any pending "bring all to front" 
    // to prevent the parent from stealing focus back with a stale order.
    if ((window as any)._btfTimeout) {
      clearTimeout((window as any)._btfTimeout);
      delete (window as any)._btfTimeout;
    }

    const index = activeDrafts.findIndex(d => d.win.name === winName);
    if (index !== -1) {
      const [draft] = activeDrafts.splice(index, 1);
      activeDrafts.push(draft);
      
      // Ensure the clicked window actually gets the top-most position
      try {
        draft.win.focus();
        setTimeout(() => {
          if (draft.win && !draft.win.closed) draft.win.focus();
        }, 5);
      } catch (e) {}
      
      notify();
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

