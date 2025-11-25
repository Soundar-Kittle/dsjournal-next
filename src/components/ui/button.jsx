// import React, {
//   useState,
//   useRef,
//   useCallback,
//   useEffect,
//   forwardRef,
//   useId,
//   Children,
//   isValidElement,
//   cloneElement,
// } from "react";
// import { Slot } from "@radix-ui/react-slot";
// import { Loader2 } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { buttonVariants } from "./variants";

// // --- Main Button ---
// const Button = forwardRef(
//   (
//     {
//       className,
//       variant,
//       size,
//       rounded,
//       elevation,
//       animation,
//       iconPosition,
//       fullWidth,
//       asChild = false,
//       isLoading = false,
//       loadingText = "Loading...",
//       startIcon,
//       endIcon,
//       leadingIcon: LeadingIcon,
//       trailingIcon: TrailingIcon,
//       disabled = false,
//       disabledTooltip,
//       disabledReason,
//       ariaLabel,
//       ariaDescribedBy,
//       ariaLabelledBy,
//       ariaExpanded,
//       ariaControls,
//       ariaHaspopup,
//       ariaPressed,
//       ariaSelected,
//       children,
//       activeDescendant,
//       longPressTimeMs = 500,
//       onLongPress,
//       ...props
//     },
//     ref
//   ) => {
//     const Comp = asChild ? Slot : "button";
//     const isDisabled = disabled || isLoading;

//     const [showTooltip, setShowTooltip] = useState(false);
//     const tooltipTimeoutRef = useRef(null);
//     const [pressTimer, setPressTimer] = useState(null);
//     const [isPressing, setIsPressing] = useState(false);

//     const startPressTimer = useCallback(() => {
//       if (onLongPress && !isDisabled) {
//         setIsPressing(true);
//         const timer = setTimeout(() => {
//           onLongPress();
//           setIsPressing(false);
//         }, longPressTimeMs);
//         setPressTimer(timer);
//       }
//     }, [onLongPress, longPressTimeMs, isDisabled]);

//     const clearPressTimer = useCallback(() => {
//       if (pressTimer) {
//         clearTimeout(pressTimer);
//         setPressTimer(null);
//         setIsPressing(false);
//       }
//     }, [pressTimer]);

//     useEffect(() => {
//       return () => {
//         clearPressTimer();
//         if (tooltipTimeoutRef.current) {
//           clearTimeout(tooltipTimeoutRef.current);
//         }
//       };
//     }, [clearPressTimer]);

//     const renderContent = () => {
//       if (isLoading) {
//         return (
//           <>
//             <Loader2 className="animate-spin" aria-hidden="true" />
//             {loadingText && <span>{loadingText}</span>}
//             <span className="sr-only">Loading</span>
//           </>
//         );
//       }
//       return (
//         <>
//           {startIcon || (LeadingIcon && <LeadingIcon aria-hidden="true" />)}
//           {children}
//           {endIcon || (TrailingIcon && <TrailingIcon aria-hidden="true" />)}
//         </>
//       );
//     };

//     return (
//       <div className="relative inline-block scale-105 active:scale-100">
//         <Comp
//           ref={ref}
//           data-slot="button"
//           data-loading={isLoading || undefined}
//           data-disabled={isDisabled || undefined}
//           data-variant={variant}
//           data-pressing={isPressing || undefined}
//           type={Comp === "button" ? props.type || "button" : undefined}
//           className={cn(
//             buttonVariants({
//               variant,
//               size,
//               rounded,
//               elevation,
//               animation,
//               iconPosition,
//               fullWidth,
//               disabled: isDisabled,
//               className,
//             })
//           )}
//           disabled={isDisabled}
//           aria-disabled={isDisabled}
//           aria-busy={isLoading}
//           aria-label={ariaLabel}
//           aria-describedby={ariaDescribedBy}
//           aria-labelledby={ariaLabelledBy}
//           aria-expanded={ariaExpanded}
//           aria-controls={ariaControls}
//           aria-haspopup={ariaHaspopup}
//           aria-pressed={ariaPressed}
//           aria-selected={ariaSelected}
//           aria-activedescendant={activeDescendant}
//           role={props.role || "button"}
//           tabIndex={isDisabled ? -1 : props.tabIndex || 0}
//           onMouseEnter={(e) => {
//             if (isDisabled && disabledTooltip) {
//               tooltipTimeoutRef.current = setTimeout(() => {
//                 setShowTooltip(true);
//               }, 500);
//             }
//             props.onMouseEnter?.(e);
//           }}
//           onMouseLeave={(e) => {
//             if (tooltipTimeoutRef.current) {
//               clearTimeout(tooltipTimeoutRef.current);
//               tooltipTimeoutRef.current = null;
//             }
//             setShowTooltip(false);
//             props.onMouseLeave?.(e);
//           }}
//           onMouseDown={startPressTimer}
//           onMouseUp={clearPressTimer}
//           onTouchStart={startPressTimer}
//           onTouchEnd={clearPressTimer}
//           onKeyDown={(e) => {
//             if ((e.key === " " || e.key === "Enter") && !isDisabled) {
//               props.onClick?.(e);
//             }
//             if (e.key === " ") startPressTimer();
//             props.onKeyDown?.(e);
//           }}
//           onKeyUp={(e) => {
//             if (e.key === " " || e.key === "Enter") clearPressTimer();
//             props.onKeyUp?.(e);
//           }}
//           {...props}
//         >
//           {renderContent()}
//         </Comp>

//         {isDisabled && disabledTooltip && showTooltip && (
//           <div
//             role="tooltip"
//             className="absolute z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg -top-8 whitespace-nowrap"
//           >
//             {disabledTooltip}
//           </div>
//         )}
//         {isDisabled && disabledReason && (
//           <span className="sr-only">{disabledReason}</span>
//         )}
//       </div>
//     );
//   }
// );
// Button.displayName = "Button";

// // --- Button Group ---
// const ButtonGroup = forwardRef(
//   (
//     {
//       children,
//       variant = "default",
//       size = "default",
//       orientation = "horizontal",
//       attached = false,
//       label,
//       className,
//       ...props
//     },
//     ref
//   ) => {
//     const isVertical = orientation === "vertical";
//     const groupId = useId();

//     return (
//       <div
//         ref={ref}
//         role="group"
//         aria-label={label || "Button group"}
//         id={groupId}
//         className={cn(
//           "inline-flex",
//           isVertical ? "flex-col" : "flex-row",
//           attached &&
//             !isVertical &&
//             "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-px",
//           attached &&
//             isVertical &&
//             "[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px",
//           className
//         )}
//         {...props}
//       >
//         {Children.map(children, (child, index) => {
//           if (!isValidElement(child)) return child;
//           return cloneElement(child, {
//             variant: child.props.variant ?? variant,
//             size: child.props.size ?? size,
//             "data-group-id": groupId,
//             "data-group-item": true,
//             "data-group-index": index,
//             "data-group-position":
//               index === 0
//                 ? "first"
//                 : index === Children.count(children) - 1
//                 ? "last"
//                 : "middle",
//             className: cn(child.props.className),
//           });
//         })}
//       </div>
//     );
//   }
// );
// ButtonGroup.displayName = "ButtonGroup";

// // --- Icon Button ---
// const IconButton = forwardRef(
//   ({ icon: Icon, children, size = "icon", ariaLabel, ...props }, ref) => {
//     const accessibleLabel =
//       ariaLabel ||
//       (typeof children === "string"
//         ? children
//         : props["aria-label"] || "Button");

//     return (
//       <Button ref={ref} size={size} aria-label={accessibleLabel} {...props}>
//         {Icon && <Icon aria-hidden="true" />}
//         {children}
//       </Button>
//     );
//   }
// );
// IconButton.displayName = "IconButton";

// // --- Toggle Button ---
// const ToggleButton = forwardRef(
//   (
//     {
//       pressed,
//       defaultPressed = false,
//       onPressedChange,
//       pressedVariant = "default",
//       unpressedVariant = "outline",
//       ariaControls,
//       ariaLabel,
//       ...props
//     },
//     ref
//   ) => {
//     const [isPressedState, setIsPressedState] = useState(defaultPressed);
//     const isControlled = pressed !== undefined;
//     const isPressed = isControlled ? pressed : isPressedState;

//     const handleClick = (e) => {
//       if (!isControlled) setIsPressedState(!isPressedState);
//       onPressedChange?.(!isPressed);
//       props.onClick?.(e);
//     };

//     return (
//       <Button
//         ref={ref}
//         variant={isPressed ? pressedVariant : unpressedVariant}
//         aria-pressed={isPressed}
//         aria-controls={ariaControls}
//         aria-label={ariaLabel}
//         role="switch"
//         onClick={handleClick}
//         {...props}
//       />
//     );
//   }
// );
// ToggleButton.displayName = "ToggleButton";

// // --- Loading Button ---
// const LoadingButton = forwardRef(
//   (
//     {
//       onClick,
//       loadingText = "Loading...",
//       loadingDelay = 400,
//       onLoadingComplete,
//       children,
//       ...props
//     },
//     ref
//   ) => {
//     const [isLoading, setIsLoading] = useState(false);
//     const isMounted = useRef(true);

//     useEffect(() => {
//       return () => {
//         isMounted.current = false;
//       };
//     }, []);

//     const handleClick = async (e) => {
//       if (isLoading || !onClick) return;
//       try {
//         setIsLoading(true);
//         const [result] = await Promise.all([
//           onClick(e),
//           new Promise((resolve) => setTimeout(resolve, loadingDelay)),
//         ]);
//         if (isMounted.current) {
//           setIsLoading(false);
//           onLoadingComplete?.(result);
//         }
//       } catch (err) {
//         if (isMounted.current) {
//           setIsLoading(false);
//           console.error("Button action failed:", err);
//         }
//       }
//     };

//     return (
//       <Button
//         ref={ref}
//         isLoading={isLoading}
//         loadingText={loadingText}
//         onClick={handleClick}
//         {...props}
//       >
//         {children}
//       </Button>
//     );
//   }
// );
// LoadingButton.displayName = "LoadingButton";

// export { Button, ButtonGroup, IconButton, ToggleButton, LoadingButton };


import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useId,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./variants";

// --- Main Button ---
const Button = forwardRef(
  (
    {
      className,
      variant,
      size,
      rounded,
      elevation,
      animation,
      iconPosition,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText = "Loading...",
      startIcon,
      endIcon,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      disabled = false,
      disabledTooltip,
      disabledReason,
      ariaLabel,
      ariaDescribedBy,
      ariaLabelledBy,
      ariaExpanded,
      ariaControls,
      ariaHaspopup,
      ariaPressed,
      ariaSelected,
      children,
      activeDescendant,
      longPressTimeMs = 500,
      onLongPress,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || isLoading;

    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipTimeoutRef = useRef(null);
    const [pressTimer, setPressTimer] = useState(null);
    const [isPressing, setIsPressing] = useState(false);

    const startPressTimer = useCallback(() => {
      if (onLongPress && !isDisabled) {
        setIsPressing(true);
        const timer = setTimeout(() => {
          onLongPress();
          setIsPressing(false);
        }, longPressTimeMs);
        setPressTimer(timer);
      }
    }, [onLongPress, longPressTimeMs, isDisabled]);

    const clearPressTimer = useCallback(() => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        setPressTimer(null);
        setIsPressing(false);
      }
    }, [pressTimer]);

    useEffect(() => {
      return () => {
        clearPressTimer();
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }, [clearPressTimer]);

    const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {loadingText && <span>{loadingText}</span>}
            <span className="sr-only">Loading</span>
          </>
        );
      }
      return (
        <>
          {startIcon || (LeadingIcon && <LeadingIcon aria-hidden="true" />)}
          {children}
          {endIcon || (TrailingIcon && <TrailingIcon aria-hidden="true" />)}
        </>
      );
    };

    return (
      <div className="relative inline-block scale-105 active:scale-100">
        <Comp
          ref={ref}
          data-slot="button"
          data-loading={isLoading || undefined}
          data-disabled={isDisabled || undefined}
          data-variant={variant}
          data-pressing={isPressing || undefined}
          type={Comp === "button" ? props.type || "button" : undefined}
          className={cn(
            buttonVariants({
              variant,
              size,
              rounded,
              elevation,
              animation,
              iconPosition,
              fullWidth,
              disabled: isDisabled,
              className,
            })
          )}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={isLoading}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={ariaLabelledBy}
          aria-expanded={ariaExpanded}
          aria-controls={ariaControls}
          aria-haspopup={ariaHaspopup}
          aria-pressed={ariaPressed}
          aria-selected={ariaSelected}
          aria-activedescendant={activeDescendant}
          role={props.role || "button"}
          tabIndex={isDisabled ? -1 : props.tabIndex || 0}
          onMouseEnter={(e) => {
            if (isDisabled && disabledTooltip) {
              tooltipTimeoutRef.current = setTimeout(() => {
                setShowTooltip(true);
              }, 500);
            }
            props.onMouseEnter?.(e);
          }}
          onMouseLeave={(e) => {
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
              tooltipTimeoutRef.current = null;
            }
            setShowTooltip(false);
            props.onMouseLeave?.(e);
          }}
          onMouseDown={startPressTimer}
          onMouseUp={clearPressTimer}
          onTouchStart={startPressTimer}
          onTouchEnd={clearPressTimer}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !isDisabled) {
              props.onClick?.(e);
            }
            if (e.key === " ") startPressTimer();
            props.onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") clearPressTimer();
            props.onKeyUp?.(e);
          }}
          {...props}
        >
          {renderContent()}
        </Comp>

        {isDisabled && disabledTooltip && showTooltip && (
          <div
            role="tooltip"
            className="absolute z-50 px-2 py-1 text-xs text-white bg-black rounded shadow-lg -top-8 whitespace-nowrap"
          >
            {disabledTooltip}
          </div>
        )}
        {isDisabled && disabledReason && (
          <span className="sr-only">{disabledReason}</span>
        )}
      </div>
    );
  }
);
Button.displayName = "Button";

// --- Button Group ---
const ButtonGroup = forwardRef(
  (
    {
      children,
      variant = "default",
      size = "default",
      orientation = "horizontal",
      attached = false,
      label,
      className,
      ...props
    },
    ref
  ) => {
    const isVertical = orientation === "vertical";
    const groupId = useId();

    return (
      <div
        ref={ref}
        role="group"
        aria-label={label || "Button group"}
        id={groupId}
        className={cn(
          "inline-flex",
          isVertical ? "flex-col" : "flex-row",
          attached &&
            !isVertical &&
            "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:-ml-px",
          attached &&
            isVertical &&
            "[&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:-mt-px",
          className
        )}
        {...props}
      >
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) return child;
          return cloneElement(child, {
            variant: child.props.variant ?? variant,
            size: child.props.size ?? size,
            "data-group-id": groupId,
            "data-group-item": true,
            "data-group-index": index,
            "data-group-position":
              index === 0
                ? "first"
                : index === Children.count(children) - 1
                ? "last"
                : "middle",
            className: cn(child.props.className),
          });
        })}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

// --- Icon Button ---
const IconButton = forwardRef(
  ({ icon: Icon, children, size = "icon", ariaLabel, ...props }, ref) => {
    const accessibleLabel =
      ariaLabel ||
      (typeof children === "string"
        ? children
        : props["aria-label"] || "Button");

    return (
      <Button ref={ref} size={size} aria-label={accessibleLabel} {...props}>
        {Icon && <Icon aria-hidden="true" />}
        {children}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

// --- Toggle Button ---
const ToggleButton = forwardRef(
  (
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      pressedVariant = "default",
      unpressedVariant = "outline",
      ariaControls,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const [isPressedState, setIsPressedState] = useState(defaultPressed);
    const isControlled = pressed !== undefined;
    const isPressed = isControlled ? pressed : isPressedState;

    const handleClick = (e) => {
      if (!isControlled) setIsPressedState(!isPressedState);
      onPressedChange?.(!isPressed);
      props.onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        variant={isPressed ? pressedVariant : unpressedVariant}
        aria-pressed={isPressed}
        aria-controls={ariaControls}
        aria-label={ariaLabel}
        role="switch"
        onClick={handleClick}
        {...props}
      />
    );
  }
);
ToggleButton.displayName = "ToggleButton";

// --- Loading Button ---
const LoadingButton = forwardRef(
  (
    {
      onClick,
      loadingText = "Loading...",
      loadingDelay = 400,
      onLoadingComplete,
      children,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
      return () => {
        isMounted.current = false;
      };
    }, []);

    const handleClick = async (e) => {
      if (isLoading || !onClick) return;
      try {
        setIsLoading(true);
        const [result] = await Promise.all([
          onClick(e),
          new Promise((resolve) => setTimeout(resolve, loadingDelay)),
        ]);
        if (isMounted.current) {
          setIsLoading(false);
          onLoadingComplete?.(result);
        }
      } catch (err) {
        if (isMounted.current) {
          setIsLoading(false);
          console.error("Button action failed:", err);
        }
      }
    };

    return (
      <Button
        ref={ref}
        isLoading={isLoading}
        loadingText={loadingText}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export { Button, ButtonGroup, IconButton, ToggleButton, LoadingButton };

