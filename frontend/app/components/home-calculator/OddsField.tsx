import styles from "./HomeCalculator.module.css";

type OddsFieldProps = {
  id: string;
  label: string;
  hint?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  /** Uppercase label style used by the EV tab. */
  caps?: boolean;
  inputMode?: "text" | "decimal";
  maxLength?: number;
};

export default function OddsField({
  id,
  label,
  hint,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  caps = false,
  inputMode = "text",
  maxLength = 12,
}: OddsFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={caps ? styles.labelCaps : styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
