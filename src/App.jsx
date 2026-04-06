import React from 'react';
import RainScene from './components/rain/RainScene';
import StatusPanel from './components/right-panel/StatusPanel';

export default function App() {
  return (
    <main className="app-shell">
      <section className="frame">
        <RainScene />
        <StatusPanel />
      </section>
    </main>
  );
}
