import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrainingWeek } from "@/types/training"
import { formatDuration } from "@/lib/utils"
import { Waves, Bike, FootprintsIcon, ExternalLink } from "lucide-react"
import { CircularProgress } from "./CircularProgress"

interface ProgressTrackerProps {
  week: TrainingWeek
  startDate: string
  stravaData: { swim: number; bike: number; run: number; total: number } | null
  stravaError: string | null
  onProgressUpdate?: () => void
}

export function ProgressTracker({ week, stravaData, stravaError }: ProgressTrackerProps) {
  const values = stravaData || { swim: 0, bike: 0, run: 0, total: 0 }


  const total = values.swim + values.bike + values.run

  const disciplines = [
    {
      key: 'swim' as const,
      name: 'Swim',
      icon: Waves,
      color: 'blue',
      planned: week.swim
    },
    {
      key: 'bike' as const,
      name: 'Bike',
      icon: Bike,
      color: 'green',
      planned: week.bike
    },
    {
      key: 'run' as const,
      name: 'Run (or Tennis)',
      icon: FootprintsIcon,
      color: 'orange',
      planned: week.run
    }
  ]


  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Strava Training Data</h3>
        <p className="text-sm text-muted-foreground">
          Completed training for Week {week.week}
        </p>
        {stravaError ? (
          <p className="text-xs text-red-600">
            ⚠ {stravaError}
          </p>
        ) : (
          <p className="text-xs text-green-600">
            ✓ Synced from Strava
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {disciplines.map((discipline) => {
          const Icon = discipline.icon
          const value = values[discipline.key]
          const planned = discipline.planned
          const percentage = planned > 0 ? (value / planned) * 100 : 0
          
          const getColorClass = (color: string) => {
            const colors = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              orange: 'text-orange-600'
            }
            return colors[color as keyof typeof colors]
          }
          
          return (
            <div key={discipline.key} className="flex flex-col items-center space-y-3">
              <CircularProgress
                percentage={percentage}
                size={100}
                strokeWidth={8}
                color={getColorClass(discipline.color)}
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
                  {formatDuration(value)} / {formatDuration(planned)}
                </div>
                {planned > 0 && value !== planned && (
                  <div className={`text-xs ${value > planned ? 'text-orange-600' : 'text-green-600'}`}>
                    {value > planned ? '+' : ''}
                    {formatDuration(Math.abs(value - planned))} vs planned
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Display */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
          <span className="font-medium">Total Hours</span>
          <span className="text-xl font-bold">
            {formatDuration(total)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <span>Planned: {formatDuration(week.total)}</span>
          <span className={total > week.total ? 'text-orange-600' : 'text-muted-foreground'}>
            {total > week.total ? '+' : ''}{formatDuration(Math.abs(total - week.total))} vs planned
          </span>
        </div>
      </div>

      {/* Strava Link */}
      { /* <div className="text-center">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href="https://www.strava.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View on Strava
          </a>
        </Button> 
      </div>*/}
    </Card>
  )
}
