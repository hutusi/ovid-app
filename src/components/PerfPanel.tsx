import { useEffect, useState } from "react";
import {
  clearPerfEvents,
  formatDetail,
  getPerfEvents,
  isPerfLoggingEnabled,
  type PerfEvent,
  subscribePerfEvents,
} from "../lib/perf";

interface PerfEventSummary {
  name: string;
  count: number;
  maxElapsedMs: number;
  latestElapsedMs: number;
  latestDetail?: Record<string, string | number | boolean>;
}

export function PerfPanel() {
  const [events, setEvents] = useState(() => getPerfEvents());
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => subscribePerfEvents(() => setEvents(getPerfEvents())), []);

  if (!isPerfLoggingEnabled() || events.length === 0) return null;

  const groupedEvents = Array.from(
    events.reduce((groups, event) => {
      const existing = groups.get(event.name);
      if (existing) {
        existing.count += 1;
        existing.maxElapsedMs = Math.max(existing.maxElapsedMs, event.elapsedMs);
        existing.latestElapsedMs = event.elapsedMs;
        existing.latestDetail = event.detail;
        return groups;
      }
      groups.set(event.name, {
        name: event.name,
        count: 1,
        maxElapsedMs: event.elapsedMs,
        latestElapsedMs: event.elapsedMs,
        latestDetail: event.detail,
      });
      return groups;
    }, new Map<string, PerfEventSummary>())
  )
    .map(([, group]) => group)
    .sort((left, right) => right.maxElapsedMs - left.maxElapsedMs || right.count - left.count);

  return (
    <aside className="perf-panel" aria-label="Performance events">
      <div className="perf-panel-header">
        <strong>Perf</strong>
        <div className="perf-panel-actions">
          <button
            type="button"
            className={`perf-panel-toggle${showRecent ? "" : " is-active"}`}
            onClick={() => setShowRecent(false)}
          >
            Summary
          </button>
          <button
            type="button"
            className={`perf-panel-toggle${showRecent ? " is-active" : ""}`}
            onClick={() => setShowRecent(true)}
          >
            Recent
          </button>
          <button type="button" className="perf-panel-clear" onClick={clearPerfEvents}>
            Clear
          </button>
        </div>
      </div>
      <div className="perf-panel-list">
        {showRecent
          ? events.map((event: PerfEvent) => (
              <div key={event.id} className="perf-panel-item">
                <div className="perf-panel-row">
                  <span className="perf-panel-name">{event.name}</span>
                  <span className="perf-panel-time">{event.elapsedMs}ms</span>
                </div>
                {event.detail && (
                  <div className="perf-panel-detail">{formatDetail(event.detail, false)}</div>
                )}
              </div>
            ))
          : groupedEvents.map((event) => (
              <div key={event.name} className="perf-panel-item">
                <div className="perf-panel-row">
                  <span className="perf-panel-name">{event.name}</span>
                  <span className="perf-panel-time">{event.maxElapsedMs}ms</span>
                </div>
                {event.count > 1 && (
                  <div className="perf-panel-detail">
                    latest={event.latestElapsedMs}ms count={event.count}
                  </div>
                )}
                {event.latestDetail && (
                  <div className="perf-panel-detail">{formatDetail(event.latestDetail, false)}</div>
                )}
              </div>
            ))}
      </div>
    </aside>
  );
}
