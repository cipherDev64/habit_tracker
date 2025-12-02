"use client"

import React from 'react'
import { useHabits } from '@/context/HabitContext'
import { getHeatmapData } from '@/lib/stats'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip' // Need to create Tooltip
import { cn } from '@/lib/utils'
import { parseISO, format } from 'date-fns'

// I need to create a Tooltip component first or use a simple title attribute.
// I'll use a simple title for now to avoid extra files, or create a simple Tooltip component in the same file or separate.
// Let's create a simple tooltip using standard HTML title for MVP, or better, a custom hover.
// Actually, I'll create a `Tooltip` component in `src/components/ui/tooltip.tsx` later or now.
// I'll assume I'll create it.

export function Heatmap() {
    const { logs } = useHabits()

    // Generate full year of data
    const today = new Date()
    const endDate = today
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364) // 52 weeks

    // Adjust start date to be a Sunday to align columns properly
    const dayOfWeek = startDate.getDay()
    if (dayOfWeek !== 0) {
        startDate.setDate(startDate.getDate() - dayOfWeek)
    }

    const data = getHeatmapData(logs, 365) // Get enough data

    // Map data to a map for easy lookup
    const dataMap = new Map(data.map(d => [d.date, d]))

    // Generate weeks
    const weeks: { date: string; count: number }[][] = []
    let currentWeek: { date: string; count: number }[] = []

    let currentDate = new Date(startDate)

    // Generate exactly 53 weeks to cover the year fully
    for (let w = 0; w < 53; w++) {
        for (let d = 0; d < 7; d++) {
            const dateStr = format(currentDate, 'yyyy-MM-dd')
            const dayData = dataMap.get(dateStr) || { date: dateStr, count: 0, dayOfWeek: d }
            currentWeek.push({ date: dateStr, count: dayData.count })
            currentDate.setDate(currentDate.getDate() + 1)
        }
        weeks.push(currentWeek)
        currentWeek = []
    }

    const getColor = (count: number) => {
        if (count === 0) return "bg-muted hover:bg-muted/80"
        // GitHub Light Mode Greens
        if (count === 1) return "bg-[#9be9a8] dark:bg-[#0e4429]"
        if (count === 2) return "bg-[#40c463] dark:bg-[#006d32]"
        if (count === 3) return "bg-[#30a14e] dark:bg-[#26a641]"
        return "bg-[#216e39] dark:bg-[#39d353]"
    }

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-max">
                <TooltipProvider>
                    <div className="flex gap-1">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {week.map((day) => (
                                    <Tooltip key={day.date}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "h-3 w-3 rounded-sm transition-colors cursor-default border border-transparent",
                                                    day.count === 0 && "border-border/50", // Add border for empty cells for better visibility
                                                    getColor(day.count)
                                                )}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{day.date}: {day.count} completed</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        ))}
                    </div>
                </TooltipProvider>
            </div>
        </div>
    )
}
