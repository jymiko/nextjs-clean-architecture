// Responsive calendar classNames for shadcn Calendar component
// Used with Popover to match trigger button width and fill without whitespace

// Full-width responsive calendar (fills parent width)
export const responsiveCalendarClassNames = {
  months: "w-full",
  month: "w-full space-y-2",
  month_caption: "flex justify-center pt-1 relative items-center mb-2",
  caption_label: "text-sm font-medium",
  nav: "space-x-1 flex items-center",
  button_previous: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 border rounded-md hover:bg-accent",
  button_next: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 border rounded-md hover:bg-accent",
  month_grid: "w-full border-collapse",
  weekdays: "flex w-full",
  weekday: "flex-1 text-muted-foreground font-normal text-[0.75rem] text-center py-1",
  week: "flex w-full",
  day: "flex-1 text-center text-sm p-0.5",
  day_button: "w-full h-8 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground [&[data-selected=true]]:bg-primary [&[data-selected=true]]:text-primary-foreground [&[data-selected=true]]:hover:bg-primary [&[data-selected=true]]:hover:text-primary-foreground",
  selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
  today: "bg-accent text-accent-foreground",
  outside: "text-muted-foreground opacity-50",
  disabled: "text-muted-foreground opacity-50",
  hidden: "invisible",
};

// Compact calendar (auto width, standard sizing)
export const compactCalendarClassNames = {
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  month_caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-sm font-medium",
  nav: "space-x-1 flex items-center",
  button_previous: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 border rounded-md hover:bg-accent",
  button_next: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 border rounded-md hover:bg-accent",
  month_grid: "w-full border-collapse space-y-1",
  weekdays: "flex",
  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
  week: "flex w-full mt-2",
  day: "h-9 w-9 text-center text-sm p-0 relative",
  day_button: "h-9 w-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 [&[data-selected=true]]:bg-primary [&[data-selected=true]]:text-primary-foreground",
  selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
  today: "bg-accent text-accent-foreground",
  outside: "day-outside text-muted-foreground opacity-50",
  disabled: "text-muted-foreground opacity-50",
  hidden: "invisible",
};

// PopoverContent className for calendar - full width (matches trigger width)
export const calendarPopoverClassName = "w-[var(--radix-popover-trigger-width)] p-2";

// PopoverContent className for calendar - compact/auto width
export const calendarPopoverCompactClassName = "w-auto p-2";

// Helper function to get calendar config based on mode
export function getCalendarConfig(mode: "responsive" | "compact" = "responsive") {
  return {
    classNames: mode === "responsive" ? responsiveCalendarClassNames : compactCalendarClassNames,
    popoverClassName: mode === "responsive" ? calendarPopoverClassName : calendarPopoverCompactClassName,
  };
}
