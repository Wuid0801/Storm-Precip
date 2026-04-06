import React, { memo } from 'react';
import RainControls from './RainControls';

const RainHero = memo(function RainHero({
  titleTransform,
  subTransform,
  thickness,
  speed,
  precipType,
  onThicknessChange,
  onSpeedChange,
  onPrecipTypeChange,
}) {
  return (
    <section className="hero glass-panel">
      <div className="hero__meta" style={subTransform}>
        <span>ENVIRONMENT TERMINAL</span>
        <span className="hero__meta-line" />
      </div>

      <div className="hero__title-wrap" style={titleTransform}>
        <h1 className="hero__title">
          STORM
          <br />
          PRECIP
        </h1>
      </div>

      <div className="hero__footer" style={subTransform}>
        <span>SECTOR 7-G / URBAN CORE / HIGH DENSITY</span>
        <span className="hero__meta-line hero__meta-line--short" />
      </div>

      <RainControls
        thickness={thickness}
        speed={speed}
        precipType={precipType}
        onThicknessChange={onThicknessChange}
        onSpeedChange={onSpeedChange}
        onPrecipTypeChange={onPrecipTypeChange}
      />
    </section>
  );
});

export default RainHero;
