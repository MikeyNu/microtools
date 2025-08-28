"use client"

import React, { useState, useEffect } from 'react'
import { Heart, Clock, TrendingUp, Star, Bookmark, Share2, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

// Types
interface Tool {
  id: string
  name: string
  description: string
  category: string
  url: string
  icon?: string
  popularity?: number
  rating?: number
}

interface UserActivity {
  toolId: string
  timestamp: number
  action: 'view' | 'use' | 'favorite' | 'share'
}

// Local storage keys
const STORAGE_KEYS = {
  FAVORITES: 'toolhub_favorites',
  RECENT_TOOLS: 'toolhub_recent',
  USER_ACTIVITY: 'toolhub_activity',
  PREFERENCES: 'toolhub_preferences'
}

// User engagement hooks
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES)
    if (stored) {
      setFavorites(JSON.parse(stored))
    }
  }, [])
  
  const addFavorite = (toolId: string) => {
    const newFavorites = [...favorites, toolId]
    setFavorites(newFavorites)
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites))
    trackActivity(toolId, 'favorite')
  }
  
  const removeFavorite = (toolId: string) => {
    const newFavorites = favorites.filter(id => id !== toolId)
    setFavorites(newFavorites)
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites))
  }
  
  const isFavorite = (toolId: string) => favorites.includes(toolId)
  
  return { favorites, addFavorite, removeFavorite, isFavorite }
}

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<Tool[]>([])
  
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_TOOLS)
    if (stored) {
      setRecentTools(JSON.parse(stored))
    }
  }, [])
  
  const addRecentTool = (tool: Tool) => {
    const filtered = recentTools.filter(t => t.id !== tool.id)
    const newRecent = [tool, ...filtered].slice(0, 10) // Keep last 10
    setRecentTools(newRecent)
    localStorage.setItem(STORAGE_KEYS.RECENT_TOOLS, JSON.stringify(newRecent))
    trackActivity(tool.id, 'view')
  }
  
  return { recentTools, addRecentTool }
}

// Activity tracking
function trackActivity(toolId: string, action: UserActivity['action']) {
  const activity: UserActivity = {
    toolId,
    timestamp: Date.now(),
    action
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY)
  const activities: UserActivity[] = stored ? JSON.parse(stored) : []
  activities.push(activity)
  
  // Keep last 100 activities
  const trimmed = activities.slice(-100)
  localStorage.setItem(STORAGE_KEYS.USER_ACTIVITY, JSON.stringify(trimmed))
}

// Favorite button component
export function FavoriteButton({ toolId, className = '' }: { toolId: string; className?: string }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const favorite = isFavorite(toolId)
  
  const handleClick = () => {
    if (favorite) {
      removeFavorite(toolId)
    } else {
      addFavorite(toolId)
    }
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`${className} ${favorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
    >
      <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
    </Button>
  )
}

// Share button component
export function ShareButton({ tool, className = '' }: { tool: Tool; className?: string }) {
  const handleShare = async () => {
    const shareData = {
      title: `${tool.name} - Free Online Tool`,
      text: tool.description,
      url: window.location.origin + tool.url
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        trackActivity(tool.id, 'share')
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.url)
      trackActivity(tool.id, 'share')
      // You could show a toast notification here
    }
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      className={`${className} text-muted-foreground hover:text-foreground`}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  )
}

// Recent tools component
export function RecentTools({ limit = 5 }: { limit?: number }) {
  const { recentTools } = useRecentTools()
  
  if (recentTools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No recent tools yet. Start using tools to see them here!
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentTools.slice(0, limit).map((tool) => (
            <Link
              key={tool.id}
              href={tool.url}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{tool.name}</p>
                <p className="text-xs text-muted-foreground">{tool.category}</p>
              </div>
              <FavoriteButton toolId={tool.id} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Favorites component
export function FavoriteTools() {
  const { favorites } = useFavorites()
  
  // In a real app, you'd fetch tool details by IDs
  const favoriteTools: Tool[] = []
  
  if (favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Favorite Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No favorite tools yet. Click the heart icon on any tool to add it to your favorites!
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Favorite Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {favoriteTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.url}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{tool.name}</p>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <Badge variant="secondary" className="mt-1">
                  {tool.category}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Tool recommendations
export function ToolRecommendations({ currentToolId }: { currentToolId?: string }) {
  const [recommendations, setRecommendations] = useState<Tool[]>([])
  
  useEffect(() => {
    // Generate recommendations based on user activity
    const stored = localStorage.getItem(STORAGE_KEYS.USER_ACTIVITY)
    const activities: UserActivity[] = stored ? JSON.parse(stored) : []
    
    // Simple recommendation logic - in a real app this would be more sophisticated
    const toolUsage = activities.reduce((acc, activity) => {
      acc[activity.toolId] = (acc[activity.toolId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Mock recommendations for now
    const mockRecommendations: Tool[] = [
      {
        id: 'percentage-calc',
        name: 'Percentage Calculator',
        description: 'Calculate percentages, increases, and decreases',
        category: 'Calculators',
        url: '/calculators/percentage',
        popularity: 95
      },
      {
        id: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between different units of measurement',
        category: 'Converters',
        url: '/converters/units',
        popularity: 88
      },
      {
        id: 'color-picker',
        name: 'Color Picker',
        description: 'Pick and convert colors between formats',
        category: 'Design',
        url: '/design/color-picker',
        popularity: 82
      }
    ]
    
    setRecommendations(mockRecommendations.filter(tool => tool.id !== currentToolId))
  }, [currentToolId])
  
  if (recommendations.length === 0) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommended for You
        </CardTitle>
        <CardDescription>
          Based on your usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((tool) => (
            <Link
              key={tool.id}
              href={tool.url}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{tool.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {tool.popularity}% popular
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
              <FavoriteButton toolId={tool.id} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// User dashboard component
export function UserDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Dashboard</h2>
      </div>
      
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="mt-6">
          <RecentTools limit={10} />
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          <FavoriteTools />
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-6">
          <ToolRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Quick access sidebar
export function QuickAccessSidebar() {
  return (
    <div className="space-y-4">
      <RecentTools limit={3} />
      <ToolRecommendations />
    </div>
  )
}