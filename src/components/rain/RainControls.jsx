import React, { memo } from 'react';
import ControlSlider from './ControlSlider';

const PRECIP_TYPES = ['rain', 'sleet', 'snow'];

const RainControls = memo(function RainControls({
  thickness,
  speed,
  precipType,
  onThicknessChange,
  onSpeedChange,
  onPrecipTypeChange,
}) {
  const precipLabel = precipType.toUpperCase();

  return (
    <section className="precip-control-bar glass-panel" aria-label="Precipitation controls">
      <div className="precip-control-bar__header">
        <div>
          <div className="eyebrow">PRECIPITATION CONTROL</div>
          <div className="control-readout">ACTIVE MODE / {precipLabel}</div>
        </div>
        <div className="control-bar__status">LIVE SYNC</div>
      </div>

      <div className="precip-control-bar__body">
        <ControlSlider
          label="RAIN THICKNESS"
          value={thickness}
          min={0.55}
          max={1.9}
          step={0.01}
          onChange={onThicknessChange}
        />
        <ControlSlider
          label="RAIN SPEED"
          value={speed}
          min={0.45}
          max={1.85}
          step={0.01}
          onChange={onSpeedChange}
        />

        <div className="control-field control-field--segmented">
          <div className="control-field__row">
            <span className="control-field__label">PRECIP TYPE</span>
            <span className="control-field__value">{precipLabel}</span>
          </div>

          <div className="segmented-control" role="tablist" aria-label="Precipitation type selector">
            {PRECIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`segmented-control__button ${precipType === type ? 'is-active' : ''}`}
                onClick={() => onPrecipTypeChange(type)}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default RainControls;
