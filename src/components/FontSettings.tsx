import { useRef, useState } from "react";
import type { FontFamily, FontSize } from "../lib/useEditorPreferences";
import "./FontSettings.css";

interface FontSettingsProps {
  fontFamily: FontFamily;
  fontSize: FontSize;
  spellCheck: boolean;
  wordCountGoal: number | null;
  onSetFontFamily: (f: FontFamily) => void;
  onSetFontSize: (s: FontSize) => void;
  onToggleSpellCheck: () => void;
  onSetWordCountGoal: (n: number | null) => void;
}

export function FontSettingsButton({
  fontFamily,
  fontSize,
  spellCheck,
  wordCountGoal,
  onSetFontFamily,
  onSetFontSize,
  onToggleSpellCheck,
  onSetWordCountGoal,
}: FontSettingsProps) {
  const [open, setOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(wordCountGoal !== null ? String(wordCountGoal) : "");
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleSetGoal() {
    const n = Number.parseInt(goalInput, 10);
    if (Number.isFinite(n) && n > 0) {
      onSetWordCountGoal(n);
    }
  }

  function handleClearGoal() {
    setGoalInput("");
    onSetWordCountGoal(null);
  }

  return (
    <div className="font-settings-wrapper">
      {open && (
        <>
          <button
            type="button"
            className="fs-backdrop"
            aria-label="Close font settings"
            onClick={() => setOpen(false)}
          />
          <div className="fs-popover" role="dialog" aria-label="Editor settings">
            <div className="fs-section-label">Font</div>
            <div className="fs-row">
              {(["serif", "sans", "mono"] as FontFamily[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`fs-btn${fontFamily === f ? " active" : ""}`}
                  onClick={() => onSetFontFamily(f)}
                >
                  {f === "serif" ? "Serif" : f === "sans" ? "Sans" : "Mono"}
                </button>
              ))}
            </div>
            <div className="fs-section-label">Size</div>
            <div className="fs-row">
              {(["small", "default", "large"] as FontSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`fs-btn${fontSize === s ? " active" : ""}`}
                  onClick={() => onSetFontSize(s)}
                >
                  {s === "small" ? "S" : s === "default" ? "M" : "L"}
                </button>
              ))}
            </div>
            <div className="fs-divider" />
            <button
              type="button"
              className={`fs-toggle${spellCheck ? " active" : ""}`}
              onClick={onToggleSpellCheck}
            >
              <span>Spell check</span>
              <span className="fs-toggle-indicator">{spellCheck ? "on" : "off"}</span>
            </button>
            <div className="fs-divider" />
            <div className="fs-section-label">Session goal</div>
            <div className="fs-goal-row">
              <input
                className="fs-goal-input"
                type="number"
                min="1"
                placeholder="words"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSetGoal();
                }}
              />
              <button type="button" className="fs-goal-btn" onClick={handleSetGoal}>
                Set
              </button>
              {wordCountGoal !== null && (
                <button
                  type="button"
                  className="fs-goal-btn fs-goal-clear"
                  onClick={handleClearGoal}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </>
      )}
      <button
        ref={btnRef}
        type="button"
        className="statusbar-theme-btn"
        onClick={() => {
          setGoalInput(wordCountGoal !== null ? String(wordCountGoal) : "");
          setOpen((v) => !v);
        }}
        title="Editor settings (font, spell check, session goal)"
        aria-label="Editor settings"
      >
        Aa
      </button>
    </div>
  );
}
