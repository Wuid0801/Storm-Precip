import { useCallback, useEffect, useState } from 'react';

const ACTIVE_VIEW_KEY = 'storm-active-view';
const DEFAULT_VIEW = 'OVERVIEW';

function getStoredView() {
  if (typeof window === 'undefined') return DEFAULT_VIEW;

  const stored = window.localStorage.getItem(ACTIVE_VIEW_KEY);
  return stored || DEFAULT_VIEW;
}

export default function useActiveView() {
  const [activeView, setActiveViewState] = useState(getStoredView);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_VIEW_KEY, activeView);
  }, [activeView]);

  const setActiveView = useCallback((nextView) => {
    setActiveViewState(nextView);
    window.localStorage.setItem(ACTIVE_VIEW_KEY, nextView);
  }, []);

  return {
    activeView,
    setActiveView,
  };
}