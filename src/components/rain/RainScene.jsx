import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useMouseParallax from '../../hooks/useMouseParallax';
import useSystemConfig from '../../hooks/useSystemConfig';
import RainCanvas from './RainCanvas';
import RainHero from './RainHero';
import SpectrumScene from '../spectrum/SpectrumScene.jsx';
import useActiveView from '../../hooks/useActiveView';
import HistoryScene from '../history/HistoryScene';
import SystemScene from '../system/SystemScene';

const MENU_ITEMS = ['OVERVIEW', 'SPECTRUM', 'HISTORY', 'SYSTEM'];

export default function RainScene() {
  const pointer = useMouseParallax();
  const {
    thickness,
    speed,
    precipType,
    density,
    wind,
    dropLength,
    turbulence,
    setThickness,
    setSpeed,
    setPrecipType,
    setDensity,
    setWind,
    setDropLength,
    setTurbulence,
    applyPreset,
    resetToDefaults,
    applyEmergency,
    persistNow,
  } = useSystemConfig();

  const precipitationConfigRef = useRef({
    thickness,
    speed,
    precipType,
    density,
    wind,
    dropLength,
    turbulence,
  });
  const { activeView, setActiveView } = useActiveView();
  const [navOpen, setNavOpen] = useState(false);
  const navDropdownRef = useRef(null);

  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    if (!navOpen) return undefined;
    const onDocPointerDown = (e) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
        closeNav();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeNav();
    };
    document.addEventListener('pointerdown', onDocPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [navOpen, closeNav]);

  useEffect(() => {
    precipitationConfigRef.current = {
      thickness,
      speed,
      precipType,
      density,
      wind,
      dropLength,
      turbulence,
    };
  }, [thickness, speed, precipType, density, wind, dropLength, turbulence]);

  const titleTransform = useMemo(
    () => ({
      transform: `translate3d(${pointer.x * 18}px, ${pointer.y * 12}px, 0)`,
    }),
    [pointer.x, pointer.y],
  );

  const subTransform = useMemo(
    () => ({
      transform: `translate3d(${pointer.x * 8}px, ${pointer.y * 5}px, 0)`,
    }),
    [pointer.x, pointer.y],
  );

  return (
    <>
      <RainCanvas configRef={precipitationConfigRef} />
      <div className="background-grid" aria-hidden="true" />
      <div className="background-glow" aria-hidden="true" />

      <aside className="left-rail glass-panel">
        <div className="left-rail__top">PLVL-01</div>
        <nav className="left-rail__nav left-rail__nav--desktop" aria-label="Primary">
          {MENU_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={`rail-link ${activeView === item ? 'is-active' : ''}`}
              onClick={() => setActiveView(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div
          className="left-rail__dropdown"
          ref={navDropdownRef}
        >
          <button
            type="button"
            className="left-rail__dropdown-trigger"
            aria-expanded={navOpen}
            aria-haspopup="true"
            aria-controls="primary-nav-dropdown-panel"
            id="primary-nav-dropdown-trigger"
            onClick={() => setNavOpen((o) => !o)}
          >
            <span className="left-rail__dropdown-label">{activeView}</span>
            <span className="left-rail__dropdown-chevron" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.5 5.25L7 8.75L10.5 5.25"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          <div
            className={`left-rail__dropdown-panel ${navOpen ? 'is-open' : ''}`}
            id="primary-nav-dropdown-panel"
            role="menu"
            aria-labelledby="primary-nav-dropdown-trigger"
            aria-hidden={!navOpen}
          >
            {MENU_ITEMS.map((item, index) => (
              <button
                key={item}
                type="button"
                role="menuitem"
                className={`rail-link rail-link--dropdown ${activeView === item ? 'is-active' : ''}`}
                style={{ '--rail-dropdown-i': index }}
                onClick={() => {
                  setActiveView(item);
                  closeNav();
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="left-rail__year">©2026</div>
      </aside>

      {activeView === 'OVERVIEW' && ( 
        <RainHero
          titleTransform={titleTransform}
          subTransform={subTransform}
          thickness={thickness}
          speed={speed}
          precipType={precipType}
          onThicknessChange={setThickness}
          onSpeedChange={setSpeed}
          onPrecipTypeChange={setPrecipType}
        />
      )}
      {activeView === 'SPECTRUM' && (
        <SpectrumScene />
      )}
      {activeView === 'HISTORY' && (
        <HistoryScene />
      )}
      {activeView === 'SYSTEM' && (
        <SystemScene
          thickness={thickness}
          speed={speed}
          precipType={precipType}
          density={density}
          wind={wind}
          dropLength={dropLength}
          turbulence={turbulence}
          onThicknessChange={setThickness}
          onSpeedChange={setSpeed}
          onPrecipTypeChange={setPrecipType}
          onDensityChange={setDensity}
          onWindChange={setWind}
          onDropLengthChange={setDropLength}
          onTurbulenceChange={setTurbulence}
          onApplyPreset={applyPreset}
          onPersist={persistNow}
          onReset={resetToDefaults}
          onEmergency={applyEmergency}
        />
      )}
    </>
  );
}
