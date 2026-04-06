import React, { memo } from 'react';
import './system-scene.css';
const formatValue = (value, decimals = 2) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(decimals) : String(value);

const ControlSlider = ({ label, value, min, max, step, onChange, decimals = 2 }) => (
  <label className="control-field">
    <div className="control-field__row">
      <span className="control-field__label">{label}</span>
      <span className="control-field__value">{formatValue(value, decimals)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="control-field__slider"
    />
  </label>
);

const PRECIP_TYPES = ['rain', 'sleet', 'snow'];

const PRESET_BUTTONS = [
  { id: 'lightRain', label: 'LIGHT RAIN' },
  { id: 'heavyStorm', label: 'HEAVY STORM' },
  { id: 'snowMode', label: 'SNOW MODE' },
  { id: 'extreme', label: 'EXTREME' },
  { id: 'drizzle', label: 'DRIZZLE' },
  { id: 'sleet', label: 'SLEET' },
  { id: 'monsoon', label: 'MONSOON' },
  { id: 'calmClear', label: 'CALM CLEAR' },
];

const SystemScene = memo(function SystemScene(props) {
  const {
    thickness,
    speed,
    precipType,
    density,
    wind,
    dropLength,
    turbulence,
    onThicknessChange,
    onSpeedChange,
    onPrecipTypeChange,
    onDensityChange,
    onWindChange,
    onDropLengthChange,
    onTurbulenceChange,
    onApplyPreset,
    onPersist,
    onReset,
    onEmergency,
  } = props;

  return (
    <section className="system-panel glass-panel">
      <div className="system-panel__primary-advanced">
        {/* PRIMARY */}
        <div className="system-block">
          <div className="eyebrow">PRIMARY PARAMETERS</div>

          <ControlSlider
            label="RAIN THICKNESS"
            value={thickness}
            min={0.5}
            max={2}
            step={0.01}
            onChange={onThicknessChange}
          />

          <ControlSlider
            label="RAIN SPEED"
            value={speed}
            min={0.5}
            max={2}
            step={0.01}
            onChange={onSpeedChange}
          />

          <div className="segmented-control segmented-control--primary">
            {PRECIP_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`segmented-control__button ${precipType === t ? 'is-active' : ''}`}
                onClick={() => onPrecipTypeChange(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ADVANCED */}
        <div className="system-block">
          <div className="eyebrow">ADVANCED TUNING</div>

          <ControlSlider
            label="PARTICLE DENSITY"
            value={density}
            min={50}
            max={500}
            step={10}
            decimals={0}
            onChange={onDensityChange}
          />
          <ControlSlider label="WIND FORCE" value={wind} min={0} max={2} step={0.01} onChange={onWindChange} />
          <ControlSlider
            label="DROP LENGTH"
            value={dropLength}
            min={5}
            max={40}
            step={1}
            decimals={0}
            onChange={onDropLengthChange}
          />
          <ControlSlider label="TURBULENCE" value={turbulence} min={0} max={1} step={0.01} onChange={onTurbulenceChange} />
        </div>
      </div>

      {/* PRESET */}
      <div className="system-block">
        <div className="eyebrow">PRESETS</div>
        <div className="preset-grid">
          {PRESET_BUTTONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="segmented-control__button"
              onClick={() => onApplyPreset(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTION */}
      <div className="system-block">
        <div className="eyebrow">SYSTEM CONTROL</div>
        <div className="system-actions">
          <button type="button" className="segmented-control__button" onClick={onPersist}>
            APPLY CONFIG
          </button>
          <button type="button" className="segmented-control__button" onClick={onReset}>
            RESET
          </button>
          <button
            type="button"
            className="segmented-control__button system-actions__danger"
            onClick={onEmergency}
          >
            EMERGENCY
          </button>
        </div>
      </div>

    </section>
  );
});

export default SystemScene;