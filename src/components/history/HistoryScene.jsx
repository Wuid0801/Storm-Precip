import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useEnvironmentHistory } from '../../hooks/useEnvironmentHistory';
import { useTemporalLog } from '../../hooks/useTemporalLog';
import './history-section.css';

function pad(value, size = 2) {
  return String(value).padStart(size, '0');
}

function parseWindValue(windVector) {
  const match = String(windVector || '').match(/([A-Z]+)\s+([\d.]+)\s*m\/s/i);
  if (!match) return { direction: '—', speed: 0 };

  return {
    direction: match[1].toUpperCase(),
    speed: Number(match[2]) || 0,
  };
}

function parseIntensityValue(intensity) {
  const match = String(intensity || '').match(/([\d.]+)/);
  return match ? Number(match[1]) || 0 : 0;
}

const HistoryScene = memo(function HistoryScene() {
  const { entries, environmentData, isLoading, isError, captureManualSnapshot } =
    useEnvironmentHistory();
  const temporalLog = useTemporalLog();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    const root = streamRef.current;
    if (!root) return;
    const active = root.querySelector('.history-log-row.is-active');
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  useEffect(() => {
    if (!entries.length) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex(0);
  }, [entries.length]);

  useEffect(() => {
    if (!isPlaying || entries.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % entries.length);
    }, 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [entries.length, isPlaying]);

  const selectedEntry = entries[selectedIndex] ?? null;
  const selectedEnvironment = selectedEntry?.environmentData ?? environmentData;

  const wind = useMemo(
    () => parseWindValue(selectedEnvironment?.windVector),
    [selectedEnvironment?.windVector],
  );

  const intensityValue = useMemo(
    () => parseIntensityValue(selectedEnvironment?.intensity),
    [selectedEnvironment?.intensity],
  );

  const playbackLabel = `01:${pad(5 + selectedIndex * 4)}:12:44`;

  if (!entries.length && isLoading) {
    return (
      <section className="history-scene glass-panel">
        <div className="history-scene__main">
          <header className="history-scene__header">
            <div>
              <div className="eyebrow">TEMPORAL MODULE</div>
              <h2 className="history-scene__title">EVENT LOG ANALYSIS</h2>
            </div>
            <div className="history-scene__cycle-row">
              <span className="history-scene__cycle">CYCLE: LIVE / INIT</span>
              <button
                type="button"
                className="history-scene__capture"
                disabled
                aria-label="Capture snapshot (available when data is ready)"
              >
                CAPTURE
              </button>
            </div>
          </header>

          <div className="history-scene__stream">
            <div className="history-log-row is-active">
              <span className="history-log-row__time">--:--:--:--</span>
              <span className="history-log-row__label">INITIALIZING HISTORY BUFFER</span>
              <span className="history-log-row__value">SYNC...</span>
            </div>
          </div>
        </div>

        <aside className="history-scene__snapshot">
          <div className="status-panel__fetch-state">TEMPORAL LOG {temporalLog}</div>
        </aside>
      </section>
    );
  }

  return (
    <section className="history-scene glass-panel">
      <div className="history-scene__main">
        <header className="history-scene__header">
          <div>
            <div className="eyebrow">TEMPORAL MODULE</div>
            <h2 className="history-scene__title">EVENT LOG ANALYSIS</h2>
          </div>
          <div className="history-scene__cycle-row">
            <span className="history-scene__cycle">CYCLE: LIVE / BUFFERED</span>
            <button
              type="button"
              className="history-scene__capture"
              disabled={isLoading || isError || environmentData?.intensity === '—'}
              onClick={captureManualSnapshot}
              aria-label="Capture current environment snapshot"
            >
              CAPTURE
            </button>
          </div>
        </header>

        <div
          ref={streamRef}
          className="history-scene__stream"
          role="list"
          aria-label="Event history log"
        >
          {entries.map((entry, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={entry.id}
                type="button"
                className={`history-log-row ${isActive ? 'is-active' : ''}`}
                onClick={() => setSelectedIndex(index)}
                role="listitem"
              >
                <span className="history-log-row__time">{entry.timestamp}</span>
                <span className="history-log-row__label">{entry.label}</span>
                <span className="history-log-row__value">{entry.value}</span>
              </button>
            );
          })}
        </div>

        <div className="history-timeline">
          <div className="history-timeline__track" aria-hidden="true">
            {entries.map((entry, index) => {
              const isActive = index === selectedIndex;
              const isMarker = ['spike', 'shift', 'transition', 'manual'].includes(entry.marker);

              return (
                <button
                  key={`${entry.id}-marker`}
                  type="button"
                  className={`history-timeline__point ${isActive ? 'is-active' : ''} ${isMarker ? 'is-marker' : ''}`}
                  style={{ left: `${entry.point * 100}%` }}
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`${entry.label} ${entry.timestamp}`}
                />
              );
            })}

            <div
              className="history-timeline__cursor"
              style={{ left: `${(selectedEntry?.point ?? 0) * 100}%` }}
            />
          </div>

          <div className="history-timeline__controls">
            <button
              type="button"
              className="history-control-button"
              onClick={() => setIsPlaying((prev) => !prev)}
            >
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>

            <div className="history-timeline__status">PLAYBACK: {isPlaying ? 'LIVE' : '1.0X'}</div>
            <div className="history-timeline__time">{playbackLabel}</div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HistoryScene;