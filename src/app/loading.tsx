import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
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
              41-week journey to race day
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Loading skeleton */}
          <Card className="p-6">
            <div className="flex items-center justify-center space-y-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Loading training data...</p>
                <p className="text-sm text-muted-foreground">Fetching your Strava activities</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}