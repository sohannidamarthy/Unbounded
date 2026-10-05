"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import ArbitrageForm from "./home-calculator/ArbitrageForm";
import EvForm from "./home-calculator/EvForm";
import styles from "./home-calculator/HomeCalculator.module.css";

type BetCalculatorMode = "arb" | "ev";

type DraggableBetCalculatorPopupProps = {
  isOpen: boolean;
  mode: BetCalculatorMode;
  disableBackdropBlur?: boolean;
  onClose: () => void;
  onModeChange: (mode: BetCalculatorMode) => void;
};

const MODAL_WIDTH = 640;
const DEFAULT_MODAL_HEIGHT = 420;
const VIEWPORT_MARGIN = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function DraggableBetCalculatorPopup({
  isOpen,
  mode,
  disableBackdropBlur = false,
  onClose,
  onModeChange,
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
            <h3>Arbitrage / EV</h3>
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
        <div className={styles.tabs} role="tablist" aria-label="Calculator type">
          {(
            [
              { id: "arb", label: "Arbitrage" },
              { id: "ev", label: "EV" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              className={`${styles.tab} ${mode === tab.id ? styles.tabActive : ""}`}
              onClick={() => onModeChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="dashboard-betcalc-body">
          {/* Both forms stay mounted so switching tabs keeps what was typed. */}
          <div role="tabpanel" hidden={mode !== "arb"}>
            <ArbitrageForm />
          </div>
          <div role="tabpanel" hidden={mode !== "ev"}>
            <EvForm />
          </div>
        </div>
      </div>
    </div>
  );
}
