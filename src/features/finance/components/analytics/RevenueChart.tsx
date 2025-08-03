import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DataPoint {
  date: string
  value: number
}

interface RevenueChartProps {
  data: DataPoint[]
  title: string
  description?: string
  type?: 'line' | 'area'
  color?: string
  height?: number
}

export function RevenueChart({
  data,
  title,
  description,
  type = 'area',
  color = '#3b82f6',
  height = 300
}: RevenueChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return format(date, 'dd MMM', { locale: fr })
    } catch {
      return dateStr
    }
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm text-muted-foreground">
            {formatValue(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const Chart = type === 'line' ? LineChart : AreaChart
  const DataComponent = type === 'line' ? Line : Area

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <Chart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <DataComponent
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={type === 'area' ? 0.2 : undefined}
              strokeWidth={2}
            />
          </Chart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}