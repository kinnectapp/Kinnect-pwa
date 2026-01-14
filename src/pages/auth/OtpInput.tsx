import React from "react";

type OtpInputProps = {
  length?: number;               // total digits, default 6
  onChange?: (value: string) => void;
  splitAfter?: number;           // index after which to show the "-" separator (e.g. 3)
};

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onChange,
  splitAfter = 3,
}) => {
  const [values, setValues] = React.useState<string[]>(
    () => Array.from({ length }, () => "")
  );

  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, val: string) => {
    const trimmed = val.replace(/\D/g, "").slice(-1); // numeric only, last digit
    const next = [...values];
    next[index] = trimmed;
    setValues(next);
    onChange?.(next.join(""));

    if (trimmed && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
      return;
    }
  };

  const boxes = Array.from({ length }, (_, i) => i);

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      {boxes.map((index) => (
        <React.Fragment key={index}>
          {index === splitAfter && (
            <span className="mx-1 text-xl leading-none text-[#3B0056]">-</span>
          )}

          <input
            ref={(el) => (refs.current[index] = el)}
            value={values[index]}
            maxLength={1}
            inputMode="numeric"
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="aspect-square max-h-11 max-w-11 min-w-8 rounded-md border border-[#D8D8F0] text-center text-[18px] font-semibold text-[#3B0056] outline-none focus:border-[#f500c3]"
          />
        </React.Fragment>
      ))}
    </div>
  );
};
