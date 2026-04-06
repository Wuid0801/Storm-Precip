import React, { memo } from 'react';
import { useTemporalLog } from '../../hooks/useTemporalLog';

const RADAR_CELLS = Array.from({ length: 20 }, (_, index) => index);

const GeoStatusPanel = memo(function GeoStatusPanel({ latitude, longitude }) {
  const temporalLog = useTemporalLog();

  return (
    <>
      <div className="radar-card">
        <div className="radar-grid">
          {RADAR_CELLS.map((cell) => (
            <span key={cell} />
          ))}
          <i className="radar-grid__point" />
        </div>

        <div className="radar-meta">
          <span>LAT: {latitude}</span>
          <span>LON: {longitude}</span>
        </div>
      </div>

      <div className="temporal-log">
        <div className="eyebrow">TEMPORAL LOG</div>
        <div className="temporal-log__time">{temporalLog}</div>
      </div>
    </>
  );
});

export default GeoStatusPanel;
