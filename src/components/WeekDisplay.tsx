import { Card } from "@/components/ui/card"
import { TrainingWeek, TrainingPhase, StravaWeeklyStats } from "@/types/training"
import { 
  formatDuration, 
  formatDateRange, 
  getWeekDateRange, 
  calculateWeekProgress,
  getCurrentPhase
} from "@/lib/utils"
import { Waves, Bike, FootprintsIcon } from "lucide-react"
import { CircularProgress } from "./CircularProgress"

interface WeekDisplayProps {
  week: TrainingWeek
  phases: TrainingPhase[]
  startDate: string
  stravaData: StravaWeeklyStats | null
  stravaError: string | null
}

export function WeekDisplay({ week, phases, startDate, stravaData, stravaError }: WeekDisplayProps) {
  const weekDateRange = getWeekDateRange(week.week, startDate)
  const currentPhase = getCurrentPhase(week.week, phases)
  
  const completed = stravaData || { swim: 0, bike: 0, run: 0, total: 0 }
  const progress = calculateWeekProgress(week, completed)

  const disciplines = [
    {
      name: 'Swim',
      key: 'swim' as const,
      icon: Waves,
      planned: week.swim,
      completed: completed.swim,
      color: 'blue'
    },
    {
      name: 'Bike', 
      key: 'bike' as const,
      icon: Bike,
      planned: week.bike,
      completed: completed.bike,
      color: 'green'
    },
    {
      name: 'Run (or Tennis)',
      key: 'run' as const, 
      icon: FootprintsIcon,
      planned: week.run,
      completed: completed.run,
      color: 'orange'
    }
  ]

  const getProgressBarColor = (discipline: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600'
    }
    return colors[discipline as keyof typeof colors]
  }

  const getProgressPercentage = (completed: number, planned: number) => {
    if (planned === 0) return 0
    return (completed / planned) * 100 // Allow over 100% for circular progress
  }


  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold">Week {week.week}</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            {currentPhase.phase.name}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(weekDateRange.start, weekDateRange.end)}
        </p>
        {stravaError ? (
          <p className="text-xs text-red-600">
            ⚠ {stravaError}
          </p>
        ) : (
          <p className="text-xs text-green-600">
            ✓ Synced with Strava
          </p>
        )}
      </div>

      {/* Total Progress */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Progress</span>
          <span className="text-sm text-muted-foreground">
            {formatDuration(completed.total)} / {formatDuration(week.total)}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {progress.percentage.toFixed(1)}% Complete
        </p>
      </div>

      {/* Discipline Breakdown - Circular Progress */}
      <div className="grid grid-cols-3 gap-4">
        {disciplines.map((discipline) => {
          const percentage = getProgressPercentage(discipline.completed, discipline.planned)
          const Icon = discipline.icon
          
          return (
            <div key={discipline.key} className="flex flex-col items-center space-y-3">
              <CircularProgress
                percentage={percentage}
                size={100}
                strokeWidth={8}
                color={getProgressBarColor(discipline.color)}
              >
                <div className="text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">
                    {percentage > 999 ? '999+' : Math.round(percentage)}%
                  </div>
                </div>
              </CircularProgress>
              
              <div className="text-center space-y-1">
                <div className="font-medium text-sm">{discipline.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDuration(discipline.completed)} / {formatDuration(discipline.planned)}
                </div>
                {discipline.planned > 0 && discipline.completed !== discipline.planned && (
                  <div className={`text-xs ${discipline.completed > discipline.planned ? 'text-orange-600' : 'text-green-600'}`}>
                    {discipline.completed > discipline.planned ? '+' : ''}
                    {formatDuration(Math.abs(discipline.completed - discipline.planned))} vs planned
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Phase Info */}
      <div className="border-t pt-4">
        <div className="text-center space-y-1">
          <h3 className="font-medium text-sm">Training Phase</h3>
          <p className="text-xs text-muted-foreground">
            {currentPhase.phase.description}
          </p>
          {currentPhase.weeksRemaining > 0 && (
            <p className="text-xs text-muted-foreground">
              {currentPhase.weeksRemaining} weeks remaining in phase
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
