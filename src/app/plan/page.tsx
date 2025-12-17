import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrainingPlan } from "@/types/training"
import { getCurrentWeek, formatDuration, getCurrentPhase } from "@/lib/utils"
import { 
  Activity, 
  Zap, 
  Mountain, 
  Target, 
  Sparkles, 
  Trophy,
  ArrowLeft,
  Calendar,
  Clock
} from "lucide-react"
import Link from "next/link"
import trainingPlan from "@/training-plan.json"
import stravaClient from "@/strava"

// Revalidate every 24 hours
export const revalidate = 86400

function getPhaseIcon(phaseName: string) {
  switch (phaseName) {
    case 'Base Building':
      return Activity
    case 'Build':
      return Zap
    case 'Peak Volume':
      return Mountain
    case 'Race Prep':
      return Target
    case 'Taper':
      return Sparkles
    case 'Race Week':
      return Trophy
    default:
      return Activity
  }
}

function getPhaseColor(phaseName: string) {
  switch (phaseName) {
    case 'Base Building':
      return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'Build':
      return 'bg-green-50 border-green-200 text-green-700'
    case 'Peak Volume':
      return 'bg-purple-50 border-purple-200 text-purple-700'
    case 'Race Prep':
      return 'bg-orange-50 border-orange-200 text-orange-700'
    case 'Taper':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    case 'Race Week':
      return 'bg-red-50 border-red-200 text-red-700'
    default:
      return 'bg-muted border-muted-foreground text-muted-foreground'
  }
}

export default async function PlanPage() {
  const plan = trainingPlan as TrainingPlan
  const currentWeek = getCurrentWeek(plan.startDate)
  const currentPhase = getCurrentPhase(currentWeek, plan.phases)

  // Fetch Strava weekly stats for the plan weeks (server-side)
  const weekStatsArray = await Promise.all(
    plan.weeks.map((w) => stravaClient.getWeekProgress(w.week, plan.startDate))
  )
  const weekStatsMap = new Map<number, import("@/types/training").StravaWeeklyStats | null>()
  plan.weeks.forEach((w, i) => weekStatsMap.set(w.week, weekStatsArray[i]))

  // Group weeks by phase
  const phaseGroups = plan.phases.map(phase => {
    const phaseWeeks = plan.weeks.filter(
      week => week.week >= phase.weeks[0] && week.week <= phase.weeks[1]
    )
    return { phase, weeks: phaseWeeks }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tracker
              </Link>
            </Button>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              41-Week Ironman Training Plan
            </h1>
            <p className="text-muted-foreground">
              Complete training schedule from base building to race day
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Started: {new Date(plan.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Current: Week {currentWeek}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Current Phase Indicator */}
        {currentPhase.isActive && (
          <Card className={`p-4 mb-6 border-2 ${getPhaseColor(currentPhase.phase.name)}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/50">
                {(() => {
                  const Icon = getPhaseIcon(currentPhase.phase.name)
                  return <Icon className="h-5 w-5" />
                })()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Current Phase: {currentPhase.phase.name}</h3>
                <p className="text-sm opacity-80">{currentPhase.phase.description}</p>
              </div>
              <Badge variant="secondary">
                Week {currentWeek - currentPhase.phase.weeks[0] + 1} of {currentPhase.phase.weeks[1] - currentPhase.phase.weeks[0] + 1}
              </Badge>
            </div>
          </Card>
        )}

        {/* Training Phases */}
        <div className="space-y-8">
          {phaseGroups.map((group, phaseIndex) => {
            const Icon = getPhaseIcon(group.phase.name)
            const isCurrentPhase = currentWeek >= group.phase.weeks[0] && currentWeek <= group.phase.weeks[1]
            const isPastPhase = currentWeek > group.phase.weeks[1]
            
            return (
              <div key={phaseIndex}>
                {/* Phase Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${getPhaseColor(group.phase.name)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold">{group.phase.name}</h2>
                      <Badge variant={isCurrentPhase ? "default" : isPastPhase ? "secondary" : "outline"}>
                        Weeks {group.phase.weeks[0]}-{group.phase.weeks[1]}
                      </Badge>
                      {isCurrentPhase && (
                        <Badge variant="default" className="bg-green-600">
                          Current
                        </Badge>
                      )}
                      {isPastPhase && (
                        <Badge variant="secondary" className="bg-gray-500 text-white">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1">{group.phase.description}</p>
                  </div>
                </div>

                {/* Weeks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.weeks.map((week) => {
                    const isCurrent = week.week === currentWeek
                    const isPast = week.week < currentWeek

                    // Get actuals from Strava if available
                    const stats = weekStatsMap.get(week.week) ?? null
                    const swimCompleted = stats?.swim ?? 0
                    const bikeCompleted = stats?.bike ?? 0
                    const runCompleted = stats?.run ?? 0
                    const totalCompleted = stats?.total ?? 0

                    return (
                      <Link key={week.week} href={`/?week=${week.week}`}>
                        <Card className={`p-4 transition-all hover:shadow-md cursor-pointer ${
                          isCurrent 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : isPast 
                              ? 'bg-green-50 border-green-200' 
                              : 'hover:bg-muted/50'
                        }`}>
                          <div className="space-y-3">
                            {/* Week Header */}
                            <div className="flex items-center justify-between">
                              <h3 className={`font-semibold ${
                                isCurrent ? 'text-primary' : isPast ? 'text-green-700' : ''
                              }`}>
                                Week {week.week}
                              </h3>
                              {isCurrent && (
                                <Badge variant="default" className="text-xs">
                                  Current
                                </Badge>
                              )}
                              {isPast && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  Past
                                </Badge>
                              )}
                            </div>

                            {/* Training Hours */}
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-600">Swim:</span>
                                <span className="font-medium">{formatDuration(swimCompleted)} / {formatDuration(week.swim)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">Bike:</span>
                                <span className="font-medium">{formatDuration(bikeCompleted)} / {formatDuration(week.bike)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-orange-600">Run:</span>
                                <span className="font-medium">{formatDuration(runCompleted)} / {formatDuration(week.run)}</span>
                              </div>
                              <div className="border-t pt-2 flex justify-between font-semibold">
                                <span>Total:</span>
                                <span>{formatDuration(totalCompleted)} / {formatDuration(week.total)}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Plan Summary */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold mb-4">Plan Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{plan.totalWeeks}</div>
              <div className="text-sm text-muted-foreground">Total Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{plan.phases.length}</div>
              <div className="text-sm text-muted-foreground">Training Phases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatDuration(plan.weeks.reduce((sum, week) => sum + week.total, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Training Hours</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
