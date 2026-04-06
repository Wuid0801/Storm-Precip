import React, { memo, useEffect, useMemo, useRef } from 'react';
import { useEnvironmentData } from '../../hooks/useEnvironmentData';

const SpectrumScene = memo(function SpectrumScene() {
  const canvasRef = useRef(null);
  const graphRef = useRef(null);

  const {
    environmentData,
    isLoading,
    isError,
  } = useEnvironmentData();

  const numericData = useMemo(() => {
    const intensityValue = parseFloat(environmentData.intensity) || 0;
    const windMatch = environmentData.windVector.match(/([0-9.]+)\s*m\/s/i);
    const windSpeed = windMatch ? parseFloat(windMatch[1]) : 0;

    const atmosphere = environmentData.atmosphereType || '';
    const isSaturated = atmosphere.includes('SATURATED');
    const isHumid = atmosphere.includes('HUMID');

    const humidityRatio = isSaturated ? 0.98 : isHumid ? 0.72 : 0.45;

    return {
      intensity: intensityValue,
      windSpeed,
      humidityRatio,
      atmosphere: environmentData.atmosphereType,
    };
  }, [environmentData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const graphEl = graphRef.current;
    if (!canvas || !graphEl) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const resize = () => {
      const rect = graphEl.getBoundingClientRect();
      width = Math.max(120, Math.floor(rect.width));
      height = Math.max(100, Math.floor(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawGrid = () => {
      ctx.save();
      ctx.strokeStyle = 'rgba(180, 200, 240, 0.08)';
      ctx.lineWidth = 1;

      const cols = 12;
      const rows = 6;

      for (let i = 0; i <= cols; i++) {
        const x = (width / cols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        const y = (height / rows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawSignal = (time) => {
      const t = time * 0.001;

      const intensityAmp = Math.min(90, numericData.intensity * 1.4);
      const windAmp = Math.min(40, numericData.windSpeed * 1.1);
      const humidityAmp = numericData.humidityRatio * 28;

      ctx.save();
      ctx.strokeStyle = 'rgba(214, 228, 255, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y =
          height * 0.52 +
          Math.sin(x * 0.012 + t * 1.1) * intensityAmp * 0.22 +
          Math.sin(x * 0.026 + t * 1.7) * windAmp * 0.32 +
          Math.cos(x * 0.008 + t * 0.8) * humidityAmp * 0.5;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.restore();
    };

    const drawSecondarySignal = (time) => {
      const t = time * 0.001;

      ctx.save();
      ctx.strokeStyle = 'rgba(140, 165, 205, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y =
          height * 0.58 +
          Math.sin(x * 0.01 + t * 0.6) * 18 +
          Math.cos(x * 0.018 + t * 1.2) * (numericData.windSpeed * 0.7);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.restore();
    };

    const render = (time) => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawSecondarySignal(time);
      drawSignal(time);
      animationFrame = requestAnimationFrame(render);
    };

    resize();
    animationFrame = requestAnimationFrame(render);

    const ro = new ResizeObserver(resize);
    ro.observe(graphEl);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [numericData]);

  const trendValue = `${numericData.intensity > 0 ? '+' : ''}${(numericData.intensity * 0.05).toFixed(1)}%`;
  const windFluctuation = `±${Math.max(0.4, numericData.windSpeed * 0.08).toFixed(1)} m/s`;
  const saturation = `${(numericData.humidityRatio * 100).toFixed(1)}%`;
  const precipType =
    environmentData.intensity.includes('cm/h') ? 'FROZEN' : numericData.intensity > 0 ? 'LIQUID' : 'TRACE';

  return (
    <section className="spectrum glass-panel">
      <header className="spectrum__header">
        <div className="eyebrow">TELEMETRY FEED // 04</div>
        <h2 className="spectrum__title">ATMOSPHERIC SPECTRUM</h2>
      </header>

      <div ref={graphRef} className="spectrum__graph">
        <canvas ref={canvasRef} />
      </div>

      <div className="spectrum__cards">
        <div className="spectrum-card">
          <span>INTENSITY TREND</span>
          <strong>{isLoading ? 'SYNC...' : trendValue}</strong>
        </div>

        <div className="spectrum-card">
          <span>WIND FLUCTUATION</span>
          <strong>{isLoading ? 'SYNC...' : windFluctuation}</strong>
        </div>

        <div className="spectrum-card">
          <span>SATURATION</span>
          <strong>{isLoading ? 'SYNC...' : saturation}</strong>
        </div>

        <div className="spectrum-card">
          <span>PRECIP TYPE</span>
          <strong>{isLoading ? 'SYNC...' : precipType}</strong>
        </div>
      </div>

      {isError && <div className="status-panel__fetch-state">DATA DEGRADED</div>}
    </section>
  );
});

export default SpectrumScene;