"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type BetCalculatorMode = "arb" | "ev";

type DraggableBetCalculatorPopupProps = {
  isOpen: boolean;
  mode: BetCalculatorMode;
  stake: string;
  oddsA: string;
  oddsB: string;
  disableBackdropBlur?: boolean;
  onClose: () => void;
  onModeChange: (mode: BetCalculatorMode) => void;
  onStakeChange: (value: string) => void;
  onOddsAChange: (value: string) => void;
  onOddsBChange: (value: string) => void;
};

const MODAL_WIDTH = 560;
const DEFAULT_MODAL_HEIGHT = 420;
const VIEWPORT_MARGIN = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function DraggableBetCalculatorPopup({
  isOpen,
  mode,
  stake,
  oddsA,
  oddsB,
  disableBackdropBlur = false,
  onClose,
  onModeChange,
  onStakeChange,
  onOddsAChange,
  onOddsBChange,
}: DraggableBetCalculatorPopupProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    offsetX: number;
    offsetY: number;
    pointerId: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: VIEWPORT_MARGIN, y: VIEWPORT_MARGIN });
  const [isDragging, setIsDragging] = useState(false);

  const getClampedPosition = (nextX: number, nextY: number) => {
    if (typeof window === "undefined") {
      return { x: nextX, y: nextY };
    }

    const modalWidth =
      modalRef.current?.offsetWidth ??
      Math.min(MODAL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    const modalHeight = modalRef.current?.offsetHeight ?? DEFAULT_MODAL_HEIGHT;
    const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - modalWidth - VIEWPORT_MARGIN);
    const maxY = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - modalHeight - VIEWPORT_MARGIN
    );

    return {
      x: clamp(nextX, VIEWPORT_MARGIN, maxX),
      y: clamp(nextY, VIEWPORT_MARGIN, maxY),
    };
  };

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return;
    }

    const centerModal = () => {
      const modalWidth =
        modalRef.current?.offsetWidth ??
        Math.min(MODAL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
      const modalHeight = modalRef.current?.offsetHeight ?? DEFAULT_MODAL_HEIGHT;
      setPosition(
        getClampedPosition(
          (window.innerWidth - modalWidth) / 2,
          (window.innerHeight - modalHeight) / 2
        )
      );
    };

    const frameId = window.requestAnimationFrame(centerModal);
    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      dragStateRef.current = null;
      setIsDragging(false);
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      event.preventDefault();
      setPosition(getClampedPosition(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY));
    };

    const stopDragging = () => {
      dragStateRef.current = null;
      setIsDragging(false);
    };

    const handleResize = () => {
      setPosition((current) => getClampedPosition(current.x, current.y));
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    const modal = modalRef.current;
    if (!modal) {
      return;
    }

    const rect = modal.getBoundingClientRect();
    dragStateRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      pointerId: event.pointerId,
    };
    setIsDragging(true);
  };

  const toDecimalOdds = (americanOdds: string) => {
    const value = Number(americanOdds);
    if (Number.isNaN(value) || value === 0) {
      return null;
    }
    return value > 0 ? 1 + value / 100 : 1 + 100 / Math.abs(value);
  };

  const calculatorDecimalOddsA = toDecimalOdds(oddsA.trim());
  const calculatorDecimalOddsB = toDecimalOdds(oddsB.trim());
  const calculatorStakeValue = Math.max(0, Number(stake || 0));
  const canCalculate =
    Boolean(calculatorDecimalOddsA && calculatorDecimalOddsB) && calculatorStakeValue > 0;
  const impliedProbabilitySum =
    canCalculate && calculatorDecimalOddsA && calculatorDecimalOddsB
      ? 1 / calculatorDecimalOddsA + 1 / calculatorDecimalOddsB
      : null;
  const hasArbitrage = impliedProbabilitySum !== null && impliedProbabilitySum < 1;
  const arbStakeA =
    canCalculate && calculatorDecimalOddsA && calculatorDecimalOddsB
      ? (calculatorStakeValue * calculatorDecimalOddsB) /
        (calculatorDecimalOddsA + calculatorDecimalOddsB)
      : 0;
  const arbStakeB = canCalculate ? calculatorStakeValue - arbStakeA : 0;
  const arbPayout =
    canCalculate && calculatorDecimalOddsA ? arbStakeA * calculatorDecimalOddsA : 0;
  const arbNetProfit = arbPayout - calculatorStakeValue;
  const evProfitSideA =
    canCalculate && calculatorDecimalOddsA
      ? calculatorStakeValue * (calculatorDecimalOddsA - 1)
      : 0;
  const evProfitSideB =
    canCalculate && calculatorDecimalOddsB
      ? calculatorStakeValue * (calculatorDecimalOddsB - 1)
      : 0;
  const formatSignedUsd = (value: number) =>
    `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(2)}`;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="dashboard-betcalc-overlay"
      role="presentation"
      style={disableBackdropBlur ? { backdropFilter: "none" } : undefined}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="dashboard-betcalc-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Bet calculator"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`dashboard-betcalc-head${isDragging ? " is-dragging" : ""}`}
          onPointerDown={handleDragStart}
        >
          <div>
            <span>Bet calculator</span>
            <h3>Arb / EV</h3>
          </div>
          <button
            type="button"
            aria-label="Close bet calculator"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="dashboard-betcalc-toggle">
          <button
            type="button"
            className={mode === "arb" ? "is-active" : "is-off"}
            onClick={() => onModeChange("arb")}
          >
            Arb
          </button>
          <button
            type="button"
            className={mode === "ev" ? "is-active" : "is-off"}
            onClick={() => onModeChange("ev")}
          >
            EV
          </button>
        </div>
        <div className="dashboard-betcalc-inputs">
          <label className="dashboard-betcalc-field">
            <span>Odds side A</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="+110"
              value={oddsA}
              onChange={(event) => onOddsAChange(event.target.value)}
            />
          </label>
          <label className="dashboard-betcalc-field">
            <span>Odds side B</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="-110"
              value={oddsB}
              onChange={(event) => onOddsBChange(event.target.value)}
            />
          </label>
          <label className="dashboard-betcalc-field">
            <span>Total stake</span>
            <input
              type="number"
              min="0"
              placeholder="100"
              value={stake}
              onChange={(event) => onStakeChange(event.target.value)}
            />
          </label>
        </div>
        <div className="dashboard-betcalc-result">
          {!canCalculate ? (
            <p>Enter valid + / - American odds for both sides and a stake.</p>
          ) : mode === "arb" ? (
            <div className="dashboard-betcalc-arb-result">
              <div className={`dashboard-betcalc-status${hasArbitrage ? " is-yes" : ""}`}>
                Arbitrage: {hasArbitrage ? "Yes" : "No"}
              </div>
              {hasArbitrage ? (
                <>
                  <strong>Net profit: {formatSignedUsd(arbNetProfit)}</strong>
                  <div className="dashboard-betcalc-meta">
                    <span>Stake A: ${arbStakeA.toFixed(2)}</span>
                    <span>Stake B: ${arbStakeB.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <strong>Net profit: none</strong>
              )}
            </div>
          ) : (
            <div className="dashboard-betcalc-ev-result">
              <div className="dashboard-betcalc-ev-row">
                <span>If side A wins</span>
                <strong>Profit A: {formatSignedUsd(evProfitSideA)}</strong>
                <strong>Loss B: {formatSignedUsd(-calculatorStakeValue)}</strong>
              </div>
              <div className="dashboard-betcalc-ev-row">
                <span>If side B wins</span>
                <strong>Profit B: {formatSignedUsd(evProfitSideB)}</strong>
                <strong>Loss A: {formatSignedUsd(-calculatorStakeValue)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
