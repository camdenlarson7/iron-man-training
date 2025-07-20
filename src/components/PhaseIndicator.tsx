'use client'

import { Card } from "@/components/ui/card"
import { TrainingPhase, PhaseInfo } from "@/types/training"
import { getCurrentPhase } from "@/lib/utils"
import { 
  Activity, 
  Zap, 
  Mountain, 
  Target, 
  Sparkles, 
  Trophy,
  Clock
} from "lucide-react"

interface PhaseIndicatorProps {
  currentWeek: number
  phases: TrainingPhase[]
}

export function PhaseIndicator({ currentWeek, phases }: PhaseIndicatorProps) {
  const phaseInfo = getCurrentPhase(currentWeek, phases)

  const getPhaseIcon = (phaseName: string) => {
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

  const getPhaseColor = (phaseName: string) => {
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

  const getProgressBarColor = (phaseName: string) => {
    switch (phaseName) {
      case 'Base Building':
        return 'bg-blue-600'
      case 'Build':
        return 'bg-green-600'
      case 'Peak Volume':
        return 'bg-purple-600'
      case 'Race Prep':
        return 'bg-orange-600'
      case 'Taper':
        return 'bg-yellow-600'
      case 'Race Week':
        return 'bg-red-600'
      default:
        return 'bg-primary'
    }
  }

  if (!phaseInfo.isActive) {
    return null
  }

  const Icon = getPhaseIcon(phaseInfo.phase.name)
  const phaseColorClass = getPhaseColor(phaseInfo.phase.name)
  const progressColorClass = getProgressBarColor(phaseInfo.phase.name)
  const weeksInPhase = phaseInfo.phase.weeks[1] - phaseInfo.phase.weeks[0] + 1
  const currentWeekInPhase = currentWeek - phaseInfo.phase.weeks[0] + 1

  return (
    <Card className={`p-4 border-2 ${phaseColorClass}`}>
      <div className="space-y-4">
        {/* Phase Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/50">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{phaseInfo.phase.name}</h3>
            <p className="text-sm opacity-80">
              Week {currentWeekInPhase} of {weeksInPhase}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-80">Phase Progress</span>
            <span className="font-medium">{Math.round(phaseInfo.progress)}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${progressColorClass}`}
              style={{ width: `${phaseInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Phase Description */}
        <p className="text-sm opacity-90 leading-relaxed">
          {phaseInfo.phase.description}
        </p>

        {/* Time Remaining */}
        {phaseInfo.weeksRemaining > 0 && (
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Clock className="h-4 w-4" />
            <span>
              {phaseInfo.weeksRemaining} week{phaseInfo.weeksRemaining !== 1 ? 's' : ''} remaining
            </span>
          </div>
        )}

        {/* Phase Boundaries */}
        <div className="flex justify-between text-xs opacity-70">
          <span>Week {phaseInfo.phase.weeks[0]}</span>
          <span>Week {phaseInfo.phase.weeks[1]}</span>
        </div>
      </div>
    </Card>
  )
}

export function PhaseOverview({ phases, currentWeek }: { phases: TrainingPhase[], currentWeek: number }) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Training Phases</h3>
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const isActive = currentWeek >= phase.weeks[0] && currentWeek <= phase.weeks[1]
          const isPast = currentWeek > phase.weeks[1]
          const Icon = getPhaseIcon(phase.name)
          
          return (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary/10 border border-primary/20' 
                  : isPast 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-muted/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${
                isActive ? 'text-primary' : isPast ? 'text-green-600' : 'text-muted-foreground'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-primary' : isPast ? 'text-green-700' : 'text-muted-foreground'
                  }`}>
                    {phase.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Weeks {phase.weeks[0]}-{phase.weeks[1]}
                  </span>
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
              {isPast && (
                <div className="w-2 h-2 bg-green-600 rounded-full" />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

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