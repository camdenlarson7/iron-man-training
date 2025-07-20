import { WeekDisplay } from "@/components/WeekDisplay"
import { ProgressTracker } from "@/components/ProgressTracker"
import { WeekNavigator } from "@/components/WeekNavigator"
import { PhaseIndicator, PhaseOverview } from "@/components/PhaseIndicator"
import { TrainingPlan } from "@/types/training"
import { getCurrentWeek } from "@/lib/utils"
import stravaClient from "@/strava"
import { Separator } from "@/components/ui/separator"
import { TabsWithParams, TabsListWithParams, TabsTriggerWithParams, TabsContentWithParams } from "@/components/TabsWithParams"
import Link from "next/link"
import trainingPlan from "@/training-plan.json"

// Revalidate every 2 hours to cache Strava data
export const revalidate = 7200 

interface HomeProps {
  searchParams: Promise<{ week?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const plan = trainingPlan as TrainingPlan
  
  // Get week from query param or default to current week
  const weekParam = params.week ? parseInt(params.week) : null
  const currentTrainingWeek = getCurrentWeek(plan.startDate)
  const currentWeek = weekParam || currentTrainingWeek
  
  // Ensure week is within valid range
  const validWeek = Math.max(1, Math.min(currentWeek, plan.totalWeeks))
  
  const currentWeekData = plan.weeks.find(week => week.week === validWeek)
  
  // Fetch Strava data on the server
  let stravaData: { swim: number; bike: number; run: number; total: number } | null = null
  let stravaError: string | null = null
  
  try {
    stravaData = await stravaClient.getWeekProgress(validWeek, plan.startDate)
  } catch (error) {
    console.error('Failed to fetch Strava data:', error)
    stravaError = 'Failed to load Strava data'
  }

  if (!currentWeekData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">Unable to load training data for week {validWeek}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
              <h1 className="text-xl font-bold">
                Ironman Training Tracker
              </h1>
              <Link
                href="/plan"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View Full Plan →
              </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Week Navigator */}
          <WeekNavigator
            currentWeek={validWeek}
            totalWeeks={plan.totalWeeks}
            currentTrainingWeek={currentTrainingWeek}
          />

          {/* Phase Indicator */}
          <PhaseIndicator
            currentWeek={validWeek}
            phases={plan.phases}
          />

          {/* Main Dashboard - Mobile First Layout */}
          <TabsWithParams defaultValue="overview" className="w-full lg:hidden">
            <TabsListWithParams className="grid w-full grid-cols-3">
              <TabsTriggerWithParams value="overview">Overview</TabsTriggerWithParams>
              <TabsTriggerWithParams value="log">Data</TabsTriggerWithParams>
              <TabsTriggerWithParams value="phases">Phases</TabsTriggerWithParams>
            </TabsListWithParams>
            
            <TabsContentWithParams value="overview" className="space-y-6 mt-6">
              <WeekDisplay
                week={currentWeekData}
                phases={plan.phases}
                startDate={plan.startDate}
                stravaData={stravaData}
                stravaError={stravaError}
              />
            </TabsContentWithParams>
            
            <TabsContentWithParams value="log" className="space-y-6 mt-6">
              <ProgressTracker
                week={currentWeekData}
                startDate={plan.startDate}
                stravaData={stravaData}
                stravaError={stravaError}
              />
            </TabsContentWithParams>
            
            <TabsContentWithParams value="phases" className="space-y-6 mt-6">
              <PhaseOverview
                phases={plan.phases}
                currentWeek={validWeek}
              />
            </TabsContentWithParams>
          </TabsWithParams>

          {/* Desktop Layout - Hidden on Mobile */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <WeekDisplay
                  week={currentWeekData}
                  phases={plan.phases}
                  startDate={plan.startDate}
                  stravaData={stravaData}
                  stravaError={stravaError}
                />
              </div>
              
              <div className="space-y-6">
                <ProgressTracker
                  week={currentWeekData}
                  startDate={plan.startDate}
                  stravaData={stravaData}
                  stravaError={stravaError}
                />
                
                <Separator className="my-6" />
                
                <PhaseOverview
                  phases={plan.phases}
                  currentWeek={validWeek}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
