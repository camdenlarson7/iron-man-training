'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Home,
  Target
} from "lucide-react"
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface WeekNavigatorProps {
  currentWeek: number
  totalWeeks: number
  currentTrainingWeek: number
}

export function WeekNavigator({ 
  currentWeek, 
  totalWeeks, 
  currentTrainingWeek
}: WeekNavigatorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToWeek = (week: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (week === currentTrainingWeek) {
      params.delete('week')
    } else {
      params.set('week', week.toString())
    }
    
    const queryString = params.toString()
    const url = queryString ? `/?${queryString}` : '/'
    router.push(url)
  }

  const handlePrevious = () => {
    if (currentWeek > 1) {
      navigateToWeek(currentWeek - 1)
    }
  }

  const handleNext = () => {
    if (currentWeek < totalWeeks) {
      navigateToWeek(currentWeek + 1)
    }
  }

  const handleJumpToWeek = (week: number) => {
    navigateToWeek(week)
    setIsDrawerOpen(false)
  }

  const handleGoToCurrent = () => {
    navigateToWeek(currentTrainingWeek)
  }

  const generateWeekGrid = () => {
    const weeks = []
    for (let i = 1; i <= totalWeeks; i++) {
      weeks.push(i)
    }
    return weeks
  }

  const getWeekButtonStyle = (week: number) => {
    if (week === currentWeek) {
      return "bg-primary text-primary-foreground"
    }
    if (week === currentTrainingWeek) {
      return "bg-blue-100 text-blue-700 border-blue-300"
    }
    if (week < currentTrainingWeek) {
      return "bg-green-50 text-green-700 border-green-200"
    }
    return "bg-muted text-muted-foreground border-muted"
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentWeek <= 1}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Week Display and Actions */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="text-center">
            <div className="text-lg font-bold">Week {currentWeek}</div>
            <div className="text-xs text-muted-foreground">
              of {totalWeeks}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentWeek >= totalWeeks}
          className="h-10 w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoToCurrent}
          disabled={currentWeek === currentTrainingWeek}
          className="flex-1"
        >
          <Home className="h-3 w-3 mr-1" />
          Current
        </Button>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="h-3 w-3 mr-1" />
              Jump to
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Select Training Week</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-8">
              <div className="grid grid-cols-7 gap-2 max-h-96 overflow-y-auto">
                {generateWeekGrid().map((week) => (
                  <Button
                    key={week}
                    variant="outline"
                    size="sm"
                    onClick={() => handleJumpToWeek(week)}
                    className={`h-12 ${getWeekButtonStyle(week)}`}
                  >
                    {week}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded border"></div>
                  <span>Selected Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-blue-300 rounded border"></div>
                  <span>Current Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border-green-200 rounded border"></div>
                  <span>Past Weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted border-muted rounded border"></div>
                  <span>Future Weeks</span>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Week Status Indicator */}
      <div className="mt-3 text-center">
        {currentWeek === currentTrainingWeek && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            This Week
          </span>
        )}
        {currentWeek < currentTrainingWeek && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Past Week
          </span>
        )}
        {currentWeek > currentTrainingWeek && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            Future Week
          </span>
        )}
      </div>
    </Card>
  )
}
