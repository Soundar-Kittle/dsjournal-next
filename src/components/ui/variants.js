import { cva } from "class-variance-authority";

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				success: "bg-green-600 text-white shadow-xs hover:bg-green-700",
				warning: "bg-amber-500 text-white shadow-xs hover:bg-amber-600",
				info: "bg-blue-500 text-white shadow-xs hover:bg-blue-600",
				subtle: "bg-muted/50 text-muted-foreground hover:bg-muted/80",
				glass:
					"bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				xl: "h-12 rounded-md px-8 has-[>svg]:px-6 text-base",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
			rounded: {
				default: "",
				full: "rounded-full",
				none: "rounded-none",
				pill: "rounded-3xl",
			},
			elevation: {
				none: "",
				sm: "shadow-sm",
				md: "shadow-md",
				lg: "shadow-lg",
			},
			animation: { none: "", pulse: "animate-pulse", bounce: "animate-bounce" },
			iconPosition: { left: "flex-row", right: "flex-row-reverse" },
			fullWidth: { true: "w-full" },
			disabled: {
				true: "opacity-50 cursor-not-allowed pointer-events-none",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			iconPosition: "left",
			rounded: "default",
			elevation: "none",
			animation: "none",
			disabled: false,
		},
	}
);

export const inputVariants = cva(
	"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium md:text-sm",
	{
		variants: {
			variant: {
				default: "dark:bg-input/30",
				filled: "bg-muted/50 dark:bg-input/50 border-transparent",
				flushed: "border-x-0 border-t-0 rounded-none px-0",
				unstyled: "border-0 shadow-none p-0 bg-transparent",
				outlined: "bg-transparent",
			},
			size: {
				default: "h-9",
				sm: "h-8 text-xs px-2 py-0.5",
				lg: "h-10 text-base px-4 py-2",
				xl: "h-12 text-lg px-5 py-2.5",
				"2xl": "h-14 text-xl px-6 py-3",
			},
			rounded: {
				default: "rounded-md",
				none: "rounded-none",
				sm: "rounded",
				lg: "rounded-lg",
				full: "rounded-full",
			},
			width: {
				default: "w-full",
				auto: "w-auto",
				xs: "w-20",
				sm: "w-32",
				md: "w-48",
				lg: "w-64",
				xl: "w-80",
				"2xl": "w-96",
			},
			state: {
				default:
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				error:
					"border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
				success:
					"border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40",
				warning:
					"border-amber-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/20 dark:focus-visible:ring-amber-500/40",
			},
			animation: {
				none: "",
				fadeIn: "animate-fadeIn",
				slideIn: "animate-slideIn",
			},
			disabled: {
				true: "pointer-events-none cursor-not-allowed opacity-50",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			rounded: "default",
			width: "default",
			state: "default",
			animation: "none",
			disabled: false,
		},
	}
);

export const switchRootVariants = cva(
	"peer inline-flex items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
	{
		variants: {
			size: {
				sm: "h-4 w-7",
				md: "h-[1.15rem] w-8",
				lg: "h-6 w-12",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

export const switchThumbVariants = cva(
	"pointer-events-none rounded-full ring-0 transition-transform bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground",
	{
		variants: {
			size: {
				// For sm: switch width is 1.75rem (28px), thumb is 0.75rem (12px)
				// Translation should be: 1.75rem - 0.75rem = 1rem
				sm: "h-3 w-3 data-[state=checked]:translate-x-3.5",

				// For md: switch width is 2rem (32px), thumb is 1rem (16px)
				// Translation should be: 2rem - 1rem = 1rem
				md: "h-4 w-4 data-[state=checked]:translate-x-3.5",

				// For lg: switch width is 3rem (48px), thumb is 1.25rem (20px)
				// Translation should be: 3rem - 1.25rem = 1.75rem
				lg: "h-5 w-5 data-[state=checked]:translate-x-6.5",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

export const checkboxVariants = cva(
	"peer border-input dark:bg-input/30 text-primary-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
	{
		variants: {
			size: {
				sm: "w-3.5 h-3.5",
				md: "w-4 h-4",
				lg: "w-5 h-5",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

export const badgeVariants = cva(
	"inline-flex items-center font-medium rounded-full",
	{
		variants: {
			variant: {
				default: "bg-gray-100 text-gray-800",
				destructive: "bg-red-100 text-red-800",
				success: "bg-green-100 text-green-800",
				warning: "bg-yellow-100 text-yellow-800",
				outline: "border border-gray-300 text-gray-700",
			},
			size: {
				sm: "text-xs",
				md: "text-sm",
				lg: "text-base",
			},
			iconOnly: {
				true: "", // we’ll override padding below…
				false: "px-3 py-1", // default padding for text badges
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
			iconOnly: false,
		},
		compoundVariants: [
			{
				size: "sm",
				iconOnly: true,
				className: "p-1", // small icon badges
			},
			{
				size: "md",
				iconOnly: true,
				className: "p-2", // medium icon badges
			},
			{
				size: "lg",
				iconOnly: true,
				className: "p-3", // large icon badges
			},
		],
	}
);

export const selectVariants = cva(
	"border-input flex items-center justify-between gap-2 rounded-md border bg-transparent text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				sm: "h-8 px-2 text-sm",
				md: "h-9 px-3 text-sm",
				lg: "h-10 px-4 text-base",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);

export const radioGroupVariants = cva("grid gap-3", {
	variants: {
		orientation: {
			vertical: "flex flex-col gap-3",
			horizontal: "flex flex-wrap items-center gap-3",
		},
	},
	defaultVariants: {
		orientation: "vertical",
	},
});

export const radioItemVariants = cva(
	"relative flex shrink-0 items-center justify-center rounded-full border shadow-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background",
	{
		variants: {
			size: {
				sm: "size-3",
				md: "size-4",
				lg: "size-5",
			},
			variant: {
				default: "border-input dark:bg-input/30",
				destructive: "border-destructive",
			},
		},
		defaultVariants: {
			size: "md",
			variant: "default",
		},
	}
);
