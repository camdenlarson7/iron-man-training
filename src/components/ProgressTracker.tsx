import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrainingWeek } from "@/types/training"
import { formatDuration } from "@/lib/utils"
import { Waves, Bike, FootprintsIcon, ExternalLink } from "lucide-react"

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

      <div className="space-y-4">
        {disciplines.map((discipline) => {
          const Icon = discipline.icon
          const value = values[discipline.key]
          const planned = discipline.planned
          const isOverPlanned = value > planned
          
          return (
            <div key={discipline.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{discipline.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Planned: {formatDuration(planned)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Completed:</span>
                <span className="text-lg font-bold">
                  {formatDuration(value)}
                </span>
              </div>
              
              {isOverPlanned && (
                <p className="text-xs text-orange-600">
                  +{formatDuration(value - planned)} over planned
                </p>
              )}
              {value > 0 && !isOverPlanned && (
                <p className="text-xs text-green-600">
                  {formatDuration(planned - value)} remaining
                </p>
              )}
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
      <div className="text-center">
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
      </div>
    </Card>
  )
}