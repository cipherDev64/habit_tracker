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

    // Generate months labels
    const months: { name: string; weekIndex: number }[] = []
    let lastMonth = -1

    weeks.forEach((week, weekIndex) => {
        const firstDayOfWeek = parseISO(week[0].date)
        const month = firstDayOfWeek.getMonth()
        if (month !== lastMonth) {
            months.push({ name: format(firstDayOfWeek, 'MMM'), weekIndex })
            lastMonth = month
        }
    })

    const getColor = (count: number) => {
        if (count === 0) return "bg-[#161b22]"
        if (count === 1) return "bg-[#0e4429]"
        if (count === 2) return "bg-[#006d32]"
        if (count === 3) return "bg-[#26a641]"
        return "bg-[#39d353]"
    }

    return (
        <div className="w-full overflow-x-auto p-4 bg-[#0d1117] rounded-md border border-[#30363d]">
            <div className="min-w-max flex flex-col gap-2">
                {/* Month Labels */}
                <div className="flex text-[11px] text-[#7d8590] ml-8 mb-2 relative h-4">
                    {months.map((month, i) => (
                        <span
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${month.weekIndex * 14}px` // 10px width + 4px gap approx
                            }}
                        >
                            {month.name}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-[3px] text-[11px] text-[#7d8590] pt-[15px] pr-2">
                        <span className="h-[10px] leading-[10px] opacity-0">Sun</span>
                        <span className="h-[10px] leading-[10px]">Mon</span>
                        <span className="h-[10px] leading-[10px] opacity-0">Tue</span>
                        <span className="h-[10px] leading-[10px]">Wed</span>
                        <span className="h-[10px] leading-[10px] opacity-0">Thu</span>
                        <span className="h-[10px] leading-[10px]">Fri</span>
                        <span className="h-[10px] leading-[10px] opacity-0">Sat</span>
                    </div>

                    {/* Grid */}
                    <TooltipProvider>
                        <div className="flex gap-[3px]">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-[3px]">
                                    {week.map((day) => (
                                        <Tooltip key={day.date}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "h-[10px] w-[10px] rounded-[2px] cursor-default transition-colors",
                                                        getColor(day.count)
                                                    )}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-[#6e7681] text-white border-none text-xs px-2 py-1">
                                                <p>{day.count === 0 ? 'No contributions' : `${day.count} contributions`} on {format(parseISO(day.date), 'MMM d, yyyy')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </TooltipProvider>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 text-xs text-[#7d8590]">
                    <a href="#" className="hover:text-[#58a6ff] hover:underline">Learn how we count contributions</a>
                    <div className="flex items-center gap-1">
                        <span>Less</span>
                        <div className="flex gap-[3px] mx-1">
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22]" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#0e4429]" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32]" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641]" />
                            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#39d353]" />
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
