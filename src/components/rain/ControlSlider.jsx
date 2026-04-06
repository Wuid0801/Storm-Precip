import React, { memo } from 'react';

const ControlSlider = memo(function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) {
  return (
    <label className="control-field">
      <div className="control-field__row">
        <span className="control-field__label">{label}</span>
        <span className="control-field__value">{value.toFixed(2)}×</span>
      </div>
      <input
        className="control-field__slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
});

export default ControlSlider;
