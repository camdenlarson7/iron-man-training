import { WeekDisplay } from "@/components/WeekDisplay"
import { ProgressTracker } from "@/components/ProgressTracker"
import { WeekNavigator } from "@/components/WeekNavigator"
import { PhaseIndicator, PhaseOverview } from "@/components/PhaseIndicator"
import { TrainingPlan } from "@/types/training"
import { getCurrentWeek } from "@/lib/utils"
import stravaClient from "@/strava"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import trainingPlan from "@/training-plan.json"

// Revalidate every hour to cache Strava data
export const revalidate = 3600

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
            <h1 className="text-3xl font-bold tracking-tight">
              Ironman Training Tracker
            </h1>
            <p className="text-muted-foreground">
              49-week journey to race day
            </p>
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
          <Tabs defaultValue="overview" className="w-full lg:hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="log">Data</TabsTrigger>
              <TabsTrigger value="phases">Phases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <WeekDisplay
                week={currentWeekData}
                phases={plan.phases}
                startDate={plan.startDate}
                stravaData={stravaData}
                stravaError={stravaError}
              />
            </TabsContent>
            
            <TabsContent value="log" className="space-y-6 mt-6">
              <ProgressTracker
                week={currentWeekData}
                startDate={plan.startDate}
                stravaData={stravaData}
                stravaError={stravaError}
              />
            </TabsContent>
            
            <TabsContent value="phases" className="space-y-6 mt-6">
              <PhaseOverview
                phases={plan.phases}
                currentWeek={validWeek}
              />
            </TabsContent>
          </Tabs>

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
