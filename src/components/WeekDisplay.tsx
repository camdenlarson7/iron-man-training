import { Card } from "@/components/ui/card"
import { TrainingWeek, TrainingPhase } from "@/types/training"
import { 
  formatDuration, 
  formatDateRange, 
  getWeekDateRange, 
  calculateWeekProgress,
  getCurrentPhase
} from "@/lib/utils"
import { Waves, Bike, FootprintsIcon } from "lucide-react"

interface WeekDisplayProps {
  week: TrainingWeek
  phases: TrainingPhase[]
  startDate: string
  stravaData: { swim: number; bike: number; run: number; total: number } | null
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
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      orange: 'bg-orange-600'
    }
    return colors[discipline as keyof typeof colors]
  }

  const getProgressPercentage = (completed: number, planned: number) => {
    if (planned === 0) return 0
    return Math.min(100, (completed / planned) * 100)
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

      {/* Discipline Breakdown */}
      <div className="space-y-4">
        {disciplines.map((discipline) => {
          const percentage = getProgressPercentage(discipline.completed, discipline.planned)
          const Icon = discipline.icon
          
          return (
            <div key={discipline.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{discipline.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDuration(discipline.completed)} / {formatDuration(discipline.planned)}
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(discipline.color)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(1)}% complete</span>
                {discipline.planned > 0 && (
                  <span>
                    {discipline.completed > discipline.planned ? '+' : ''}
                    {formatDuration(discipline.completed - discipline.planned)} vs planned
                  </span>
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