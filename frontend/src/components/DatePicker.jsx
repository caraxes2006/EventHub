import { useRef } from "react";
import { CalendarDays, X } from "lucide-react";

// Date filter control. Shows "Select date" until a date is chosen, opens the
// browser's native calendar popup (keyboard + touch friendly) and can be cleared.
const formatDisplay = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const DatePicker = ({ value, onChange }) => {
  const inputRef = useRef(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      // Older browsers: fall back to focusing the hidden native input
      el.focus();
      el.click();
    }
  };

  return (
    <div className="date-picker">
      <button type="button" className="date-trigger" onClick={openPicker} aria-label="Select event date">
        <CalendarDays size={20} aria-hidden="true" />
        <span className={value ? "" : "placeholder"}>{value ? formatDisplay(value) : "Select date"}</span>
      </button>

      {value && (
        <button type="button" className="date-clear" onClick={() => onChange("")} aria-label="Clear date filter">
          <X size={16} aria-hidden="true" />
        </button>
      )}

      {/* Native input does the actual calendar UI; hidden from tab order because the button above is the control */}
      <input
        ref={inputRef}
        type="date"
        className="date-native"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

export default DatePicker;
