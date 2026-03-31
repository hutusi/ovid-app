import { useEffect, useState } from "react";
import { getPerfEvents, isPerfLoggingEnabled, subscribePerfEvents } from "../lib/perf";

function formatDetail(detail?: Record<string, string | number | boolean>): string {
  if (!detail) return "";
  return Object.entries(detail)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" ");
}

export function PerfPanel() {
  const [events, setEvents] = useState(() => getPerfEvents());

  useEffect(() => subscribePerfEvents(() => setEvents(getPerfEvents())), []);

  if (!isPerfLoggingEnabled() || events.length === 0) return null;

  return (
    <aside className="perf-panel" aria-label="Performance events">
      <div className="perf-panel-header">
        <strong>Perf</strong>
        <span>{events.length}</span>
      </div>
      <div className="perf-panel-list">
        {events.map((event) => (
          <div key={event.id} className="perf-panel-item">
            <div className="perf-panel-row">
              <span className="perf-panel-name">{event.name}</span>
              <span className="perf-panel-time">{event.elapsedMs}ms</span>
            </div>
            {event.detail && <div className="perf-panel-detail">{formatDetail(event.detail)}</div>}
          </div>
        ))}
      </div>
    </aside>
  );
}
