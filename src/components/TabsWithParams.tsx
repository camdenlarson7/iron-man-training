'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TabsWithParamsProps {
  defaultValue?: string
  className?: string
  children: React.ReactNode
}

export function TabsWithParams({ defaultValue = "overview", className, children }: TabsWithParamsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get current tab from URL params or use default
  const currentTab = searchParams.get('tab') || defaultValue
  
  const handleTabChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className={className}>
      {children}
    </Tabs>
  )
}

interface TabsListWithParamsProps {
  className?: string
  children: React.ReactNode
}

export function TabsListWithParams({ className, children }: TabsListWithParamsProps) {
  return (
    <TabsList className={className}>
      {children}
    </TabsList>
  )
}

interface TabsTriggerWithParamsProps {
  value: string
  children: React.ReactNode
}

export function TabsTriggerWithParams({ value, children }: TabsTriggerWithParamsProps) {
  return (
    <TabsTrigger value={value}>
      {children}
    </TabsTrigger>
  )
}

interface TabsContentWithParamsProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsContentWithParams({ value, className, children }: TabsContentWithParamsProps) {
  return (
    <TabsContent value={value} className={className}>
      {children}
    </TabsContent>
  )
}