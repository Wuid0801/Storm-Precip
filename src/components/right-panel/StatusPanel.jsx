import React, { memo } from 'react';
import EnvironmentMetrics from './EnvironmentMetrics';
import GeoStatusPanel from './GeoStatusPanel';
import { useEnvironmentData } from '../../hooks/useEnvironmentData';

const StatusPanel = memo(function StatusPanel() {
  const {
    environmentData,
    isLoading,
    isError,
    hasFallbackLocation,
  } = useEnvironmentData();

  const syncLabel = isLoading
    ? 'SYNCING DATA'
    : isError
      ? 'DATA DEGRADED'
      : hasFallbackLocation
        ? 'FALLBACK LOCATION'
        : 'LIVE GEO DATA';

  return (
    <aside className="status-panel glass-panel">
      <div className="status-panel__header">
        <div>
          <div className="eyebrow">SYSTEM STATUS</div>
          <div className="status-pill">
            <span className="status-pill__dot" />
            NOMINAL
          </div>
        </div>
        <div className="version-chip">V.4.02.R</div>
      </div>

      <EnvironmentMetrics
        intensity={environmentData.intensity}
        windVector={environmentData.windVector}
        atmosphereType={environmentData.atmosphereType}
      />

      <GeoStatusPanel
        latitude={environmentData.latitude}
        longitude={environmentData.longitude}
      />

      <div className="status-panel__fetch-state">{syncLabel}</div>
    </aside>
  );
});

export default StatusPanel;