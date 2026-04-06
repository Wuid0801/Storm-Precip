import React, { memo } from 'react';

const MetricRow = memo(function MetricRow({ label, value }) {
  return (
    <div className="environment-metric">
      <div className="eyebrow">{label}</div>
      <div className="environment-metric__value">{value}</div>
      <div className="environment-metric__line" aria-hidden="true" />
    </div>
  );
});

const EnvironmentMetrics = memo(function EnvironmentMetrics({ intensity, windVector, atmosphereType }) {
  return (
    <section className="environment-metrics" aria-label="Environmental metrics">
      <MetricRow label="INTENSITY" value={intensity} />
      <MetricRow label="WIND VECTOR" value={windVector} />
      <MetricRow label="ATMOSPHERE TYPE" value={atmosphereType} />
    </section>
  );
});

export default EnvironmentMetrics;
