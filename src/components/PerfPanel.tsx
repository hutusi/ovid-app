import { useEffect, useState } from "react";
import {
  formatDetail,
  getPerfEvents,
  isPerfLoggingEnabled,
  subscribePerfEvents,
} from "../lib/perf";

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
            {event.detail && (
              <div className="perf-panel-detail">{formatDetail(event.detail, false)}</div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
