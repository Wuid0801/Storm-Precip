import React, { useEffect, useMemo, useRef } from 'react';
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
        <nav className="left-rail__nav" aria-label="Primary">
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
