import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, X } from "lucide-react";
import { selectVariants } from "./variants";

// --- Main Select Component ---
export function Select({
  options,
  placeholder = "Select an option",
  clearLabel = "Clear selection",
  allowClear = true,
  isInvalid,
  label,
  error,
  size = "md",
  contentClassName,
  triggerClassName,
  showIcons = true,
  value = "",
  onValueChange,
  ...props
}) {
  const flatOptions = options?.flatMap((o) => ("options" in o ? o.options : o));
  // const selectedOption = flatOptions.find((o) => o.value === value);
  const selectedOption = flatOptions?.find(
    (o) => String(o.value) === String(value)
  );
  const hasAnyIcon = showIcons && flatOptions?.some((o) => o.icon);
  const handleValueChange = (newValue) =>
    onValueChange?.(newValue === "__clear__" ? "" : newValue);

  return (
    <div>
      <SelectPrimitive.Root
        value={value}
        onValueChange={handleValueChange}
        {...props}
      >
        {label && (
          <label
            className={cn(
              "mb-1 block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            )}
          >
            {label}
          </label>
        )}
        <SelectTrigger
          size={size}
          isInvalid={isInvalid}
          className={`w-full ${triggerClassName}`}
        >
          <SelectValue
            selectedOption={selectedOption}
            placeholder={placeholder}
            showIcons={hasAnyIcon}
            allowClear={allowClear}
            onClear={() => onValueChange?.("")}
            hasValue={!!value}
          />
        </SelectTrigger>

        <SelectContent className={contentClassName}>
          {allowClear && value !== 0 && (
            <SelectItem value="__clear__" icon={X} hasIconSlot>
              {clearLabel}
            </SelectItem>
          )}

          {options?.map((groupOrOption, idx) =>
            "options" in groupOrOption ? (
              <React.Fragment key={groupOrOption.label}>
                <SelectGroup>
                  <SelectLabel>{groupOrOption.label}</SelectLabel>
                  {groupOrOption.options.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      icon={opt.icon}
                      hasIconSlot={hasAnyIcon}
                      disabled={opt.disabled}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                {idx < options.length - 1 && <SelectSeparator />}
              </React.Fragment>
            ) : (
              <SelectItem
                key={groupOrOption.value}
                value={groupOrOption.value}
                icon={groupOrOption.icon}
                hasIconSlot={hasAnyIcon}
                disabled={groupOrOption.disabled}
              >
                {groupOrOption.label}
              </SelectItem>
            )
          )}
        </SelectContent>
      </SelectPrimitive.Root>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

// --- Trigger Button ---
function SelectTrigger({ className, size, isInvalid, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        selectVariants({ size }),
        "flex items-center justify-between gap-2",
        isInvalid && "border-destructive ring-destructive/20",
        className
      )}
      aria-invalid={isInvalid}
      {...props}
    >
      <div className="flex-1 min-w-0 truncate">{children}</div>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// --- Selected Value Display ---
function SelectValue({ selectedOption, placeholder, showIcons }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {selectedOption ? (
        <>
          {showIcons && selectedOption.icon && (
            <selectedOption.icon className="size-4 shrink-0" />
          )}
          <span className="truncate block">{selectedOption.label}</span>
        </>
      ) : (
        <span className="text-muted-foreground truncate block">
          {placeholder}
        </span>
      )}
    </div>
  );
}

// --- Select Content Wrapper ---
function SelectContent({ className, children, position = "popper", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] origin-[var(--radix-select-content-transform-origin)] overflow-hidden rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// --- Individual Select Item ---
function SelectItem({
  className,
  children,
  icon: Icon,
  hasIconSlot = false,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {hasIconSlot && (
        <div className="size-4 shrink-0 flex items-center justify-center">
          {Icon ? <Icon className="size-4" /> : null}
        </div>
      )}
      <SelectPrimitive.ItemText className="truncate">
        {children}
      </SelectPrimitive.ItemText>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

// --- Group ---
function SelectGroup(props) {
  return <SelectPrimitive.Group {...props} />;
}

// --- Label ---
function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

// --- Separator ---
function SelectSeparator({ className, ...props }) {
  return (
    <SelectPrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// --- Scroll Buttons ---
function SelectScrollUpButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}
