import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, X, AlertCircle } from "lucide-react";
import { inputVariants } from "./variants";

/* ------------------------------------------------------------------ */
/*  INPUT                                                             */
/* ------------------------------------------------------------------ */

const Input = React.forwardRef(
  (
    {
      className,
      type = "text",
      variant,
      size,
      rounded,
      width,
      state: stateProp,
      animation,
      label,
      error,
      hint,
      leftElement,
      rightElement,
      leftAddon,
      rightAddon,
      isRequired = false,
      isReadOnly = false,
      isInvalid = false,
      isDisabled = false,
      isSuccess = false,
      isWarning = false,
      clearable = false,
      onClear,
      showPasswordToggle = false,
      containerClassName,
      labelClassName,
      errorClassName,
      hintClassName,
      onValueChange,
      id: propId,
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      inputMode,
      autoComplete,
      onChange,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId();
    const id = propId || `input-${uniqueId}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === "password" && showPassword ? "text" : type;

    const inputRef = useRef(null);
    useImperativeHandle(ref, () => inputRef.current);

    const computedState =
      isInvalid || error
        ? "error"
        : isSuccess
        ? "success"
        : isWarning
        ? "warning"
        : "default";

    const inputState = stateProp ?? computedState;

    const handleClear = (e) => {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
        inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
        inputRef.current.focus();
      }
      onClear?.(e);
    };

    const handleChange = (e) => {
      onValueChange?.(e.target.value, e);
      onChange?.(e);
    };

    const describedById =
      [ariaDescribedBy, hint ? hintId : null, error ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={cn("relative flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              isRequired &&
                "after:text-destructive after:content-['*'] after:ml-0.5",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="inline-flex h-full items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground">
              {leftAddon}
            </div>
          )}

          <div
            className={cn(
              "relative flex items-center w-full",
              leftAddon && "rounded-l-none",
              rightAddon && "rounded-r-none"
            )}
          >
            {leftElement && (
              <div className="absolute left-2.5 flex h-full items-center pointer-events-none text-muted-foreground">
                {leftElement}
              </div>
            )}

            <input
              id={id}
              ref={inputRef}
              type={inputType}
              data-slot="input"
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
              aria-invalid={isInvalid || !!error}
              aria-describedby={describedById}
              aria-labelledby={ariaLabelledBy}
              aria-required={isRequired}
              inputMode={inputMode}
              autoComplete={autoComplete}
              data-state={inputState}
              onChange={handleChange}
              className={cn(
                inputVariants({
                  variant,
                  size,
                  rounded,
                  width,
                  state: inputState,
                  animation,
                  disabled: isDisabled,
                }),
                leftElement && "pl-9",
                (rightElement ||
                  (clearable && props.value) ||
                  (type === "password" && showPasswordToggle)) &&
                  "pr-9",
                className
              )}
              {...props}
            />

            {inputState === "error" && !rightElement && (
              <div className="absolute right-2.5 text-destructive">
                <AlertCircle aria-hidden="true" size={16} />
              </div>
            )}

            {type === "password" && showPasswordToggle && (
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}

            {clearable &&
              props.value &&
              !(type === "password" && showPasswordToggle) && (
                <button
                  type="button"
                  aria-label="Clear input"
                  onClick={handleClear}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  <X size={16} />
                </button>
              )}

            {rightElement &&
              !(type === "password" && showPasswordToggle) &&
              !clearable && (
                <div className="absolute right-2.5 flex h-full items-center pointer-events-none text-muted-foreground">
                  {rightElement}
                </div>
              )}
          </div>

          {rightAddon && (
            <div className="inline-flex h-full items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-muted-foreground">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className={cn(
              "text-xs font-medium text-destructive",
              errorClassName
            )}
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={hintId}
            className={cn("text-xs text-muted-foreground", hintClassName)}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

/* ------------------------------------------------------------------ */
/*  NumberInput                                                       */
/* ------------------------------------------------------------------ */
const NumberInput = React.forwardRef(
  (
    {
      min,
      max,
      step = 1,
      precision = 0,
      onValueChange,
      defaultValue,
      value: controlledValue,
      allowMouseWheel = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const format = useCallback(
      (v) => (precision != null ? v.toFixed(precision) : v.toString()),
      [precision]
    );

    const increment = () => {
      const current = parseFloat(value) || 0;
      const next = Math.min(max ?? Infinity, current + step);
      const formatted = format(next);
      if (!isControlled) setInternalValue(formatted);
      onValueChange?.(formatted);
    };

    const decrement = () => {
      const current = parseFloat(value) || 0;
      const next = Math.max(min ?? -Infinity, current - step);
      const formatted = format(next);
      if (!isControlled) setInternalValue(formatted);
      onValueChange?.(formatted);
    };

    const handleWheel = (e) => {
      if (!allowMouseWheel) return;
      e.preventDefault();
      e.deltaY < 0 ? increment() : decrement();
    };

    const handleChange = (e) => {
      const newVal = e.target.value;
      if (!isControlled) setInternalValue(newVal);
      onValueChange?.(newVal);
      onChange?.(e);
    };

    return (
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={handleChange}
        onWheel={handleWheel}
        min={min}
        max={max}
        step={step}
        rightAddon={
          <div className="flex flex-col">
            <button
              type="button"
              onClick={increment}
              className="flex h-4 w-6 items-center justify-center text-xs hover:bg-accent"
              tabIndex={-1}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={decrement}
              className="flex h-4 w-6 items-center justify-center text-xs hover:bg-accent"
              tabIndex={-1}
            >
              ▼
            </button>
          </div>
        }
        {...props}
      />
    );
  }
);
NumberInput.displayName = "NumberInput";

/* ------------------------------------------------------------------ */
/*  TextArea                                                          */
/* ------------------------------------------------------------------ */
const TextArea = React.forwardRef(
  (
    {
      className,
      variant,
      rounded,
      width,
      state: stateProp,
      animation,
      label,
      error,
      hint,
      isRequired = false,
      isReadOnly = false,
      isInvalid = false,
      isDisabled = false,
      isSuccess = false,
      isWarning = false,
      autoResize = false,
      maxRows,
      minRows = 3,
      containerClassName,
      labelClassName,
      errorClassName,
      hintClassName,
      onValueChange,
      id: propId,
      "aria-describedby": ariaDescribedBy,
      "aria-labelledby": ariaLabelledBy,
      onChange,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId();
    const id = propId || `textarea-${uniqueId}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const textareaRef = useRef(null);
    useImperativeHandle(ref, () => textareaRef.current);

    const adjustHeight = useCallback(() => {
      if (!autoResize || !textareaRef.current) return;
      textareaRef.current.style.height = "auto";
      const lineHeight =
        parseInt(getComputedStyle(textareaRef.current).lineHeight) || 20;
      let newHeight = Math.max(
        minRows * lineHeight,
        textareaRef.current.scrollHeight
      );
      if (maxRows) {
        const maxHeight = maxRows * lineHeight;
        newHeight = Math.min(newHeight, maxHeight);
        textareaRef.current.style.overflowY =
          newHeight >= maxHeight ? "auto" : "hidden";
      }
      textareaRef.current.style.height = `${newHeight}px`;
    }, [autoResize, maxRows, minRows]);

    const handleChange = (e) => {
      if (autoResize) adjustHeight();
      onValueChange?.(e.target.value, e);
      onChange?.(e);
    };

    useEffect(() => {
      if (autoResize) adjustHeight();
    }, [autoResize, adjustHeight, props.value, props.defaultValue]);

    const computedState =
      isInvalid || error
        ? "error"
        : isSuccess
        ? "success"
        : isWarning
        ? "warning"
        : "default";
    const inputState = stateProp ?? computedState;
    const describedById =
      [ariaDescribedBy, hint ? hintId : null, error ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={cn("relative flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              isRequired &&
                "after:text-destructive after:content-['*'] after:ml-0.5",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        <textarea
          id={id}
          ref={textareaRef}
          data-slot="textarea"
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          aria-invalid={isInvalid || !!error}
          aria-describedby={describedById}
          aria-labelledby={ariaLabelledBy}
          aria-required={isRequired}
          data-state={inputState}
          onChange={handleChange}
          className={cn(
            inputVariants({
              variant,
              rounded,
              width,
              state: inputState,
              animation,
              disabled: isDisabled,
            }),
            "min-h-[80px] resize-y",
            className
          )}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className={cn(
              "text-xs font-medium text-destructive",
              errorClassName
            )}
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={hintId}
            className={cn("text-xs text-muted-foreground", hintClassName)}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

/* ------------------------------------------------------------------ */
/*  Search Input                                                      */
/* ------------------------------------------------------------------ */
const SearchInput = React.forwardRef(
  (
    { onSearch, onValueChange, onClear, searchDelay = 300, onChange, ...props },
    ref
  ) => {
    const timerRef = useRef(null);

    const handleChange = (e) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      onValueChange?.(e.target.value, e);
      onChange?.(e);
      if (onSearch) {
        timerRef.current = setTimeout(() => {
          onSearch(e.target.value, e);
        }, searchDelay);
      }
    };

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    return (
      <Input
        ref={ref}
        type="search"
        onChange={handleChange}
        onClear={(e) => {
          onClear?.(e);
          onSearch?.("", e);
        }}
        clearable
        leftElement={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        {...props}
      />
    );
  }
);
SearchInput.displayName = "SearchInput";

export { Input, NumberInput, TextArea, SearchInput };
