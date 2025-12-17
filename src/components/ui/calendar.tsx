"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation } from "react-day-picker"
import { setMonth, setYear } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Aktifkan dropdown untuk memilih bulan dan tahun
   * Jika true, tombol prev/next akan diganti dengan dropdown
   */
  showMonthYearDropdown?: boolean
  /**
   * Tahun awal untuk dropdown tahun
   * Default: 20 tahun ke belakang dari tahun sekarang
   */
  fromYear?: number
  /**
   * Tahun akhir untuk dropdown tahun
   * Default: 10 tahun ke depan dari tahun sekarang
   */
  toYear?: number
}

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

interface DropdownCaptionProps {
  displayMonth: Date
  fromYear: number
  toYear: number
}

function DropdownCaption({ displayMonth, fromYear, toYear }: DropdownCaptionProps) {
  const { goToMonth } = useNavigation()

  const years = React.useMemo(() => {
    const result: number[] = []
    for (let year = fromYear; year <= toYear; year++) {
      result.push(year)
    }
    return result
  }, [fromYear, toYear])

  const handleMonthChange = (value: string) => {
    const newDate = setMonth(displayMonth, parseInt(value))
    goToMonth(newDate)
  }

  const handleYearChange = (value: string) => {
    const newDate = setYear(displayMonth, parseInt(value))
    goToMonth(newDate)
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Select
        value={displayMonth.getMonth().toString()}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="h-7 w-[110px] text-xs font-medium focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto">
          {MONTHS.map((month, index) => (
            <SelectItem key={month} value={index.toString()} className="text-xs">
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={displayMonth.getFullYear().toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="h-7 w-[80px] text-xs font-medium focus:ring-0 focus:ring-offset-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="text-xs">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showMonthYearDropdown = false,
  fromYear: fromYearProp,
  toYear: toYearProp,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear()
  const fromYear = fromYearProp ?? currentYear - 20
  const toYear = toYearProp ?? currentYear + 10

  const isDropdown = showMonthYearDropdown

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: cn(
          "flex justify-center pt-1 relative items-center",
          isDropdown && "justify-center"
        ),
        caption_label: cn("text-sm font-medium", isDropdown && "hidden"),
        nav: cn("space-x-1 flex items-center", isDropdown && "hidden"),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between",
        weekday:
          "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2 justify-between",
        day: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button:
          "h-10 w-10 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" {...props} />
        },
        ...(isDropdown && {
          MonthCaption: ({ calendarMonth }) => (
            <DropdownCaption
              displayMonth={calendarMonth.date}
              fromYear={fromYear}
              toYear={toYear}
            />
          ),
        }),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
