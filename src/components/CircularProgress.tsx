interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color: string
  children?: React.ReactNode
}

export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 8, 
  color,
  children 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  
  // Calculate how many complete circles and remainder
  const fullCircles = Math.floor(percentage / 100)
  const remainderPercentage = percentage % 100
  
  // For the base circle: if over 100%, show full circle, otherwise show percentage
  const basePercentage = percentage >= 100 ? 100 : percentage
  const baseStrokeDashoffset = circumference - (basePercentage / 100) * circumference
  
  // For the overlay circle: show the remainder percentage
  const overlayStrokeDashoffset = circumference - (remainderPercentage / 100) * circumference
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        
        {/* Base progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={baseStrokeDashoffset}
          className={`transition-all duration-500 ${color}`}
          strokeLinecap="round"
        />
        
        {/* Overlay circle for >100% - shows the remainder on top */}
        {percentage > 100 && remainderPercentage > 0 && (
          <>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={overlayStrokeDashoffset}
              className={`transition-all duration-500 ${color}`}
              strokeLinecap="round"
              style={{ opacity: 0.7 }}
            />
            {/* End indicator dot for the overlay circle */}
            <circle
              cx={size / 2 + radius * Math.cos((remainderPercentage / 100) * 2 * Math.PI)}
              cy={size / 2 + radius * Math.sin((remainderPercentage / 100) * 2 * Math.PI)}
              r={strokeWidth / 1.5}
              fill="white"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-all duration-500 ${color}`}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
          </>
        )}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
     
    </div>
  )
}
