'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts'
import { clsx } from 'clsx'

interface ChartProps {
  data: Array<Record<string, unknown>>
  type?: 'line' | 'area' | 'bar' | 'pie' | 'funnel'
  xKey: string
  yKeys: string[]
  colors?: string[]
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  formatY?: 'currency' | 'number' | 'percentage'
  stacked?: boolean
  title?: string
}

const DEFAULT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function Chart({
  data,
  type = 'line',
  xKey,
  yKeys,
  colors = DEFAULT_COLORS,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  formatY,
  stacked = false,
  title,
}: ChartProps) {
  const formattedData = useMemo(() => {
    return data.map(item => {
      const formatted: Record<string, unknown> = { [xKey]: item[xKey] }
      yKeys.forEach((key) => {
        if (typeof item[key] === 'number') {
          formatted[key] = item[key]
        }
      })
      return formatted
    })
  }, [data, xKey, yKeys])

  const formatValue = (value: number): string => {
    switch (formatY) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value)
      case 'percentage':
        return `${value}%`
      case 'number':
      default:
        return new Intl.NumberFormat('es-MX').format(value)
    }
  }

  const renderChart = () => {
    const grid = showGrid ? <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" /> : null
    const tooltip = showTooltip ? (
      <Tooltip
        contentStyle={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
        formatter={(value: number) => [formatValue(value), '']}
      />
    ) : null
    const legend = showLegend ? (
      <Legend
        wrapperStyle={{ paddingTop: '20px' }}
        formatter={(value) => <span className="text-sm text-gray-600">{String(value)}</span>}
      />
    ) : null

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={formattedData}>
              {grid}
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatValue}
                dx={-10}
              />
              {tooltip}
              {legend}
              {yKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={formattedData}>
              {grid}
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatValue}
                dx={-10}
              />
              {tooltip}
              {legend}
              {yKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId={stacked ? 'stack' : undefined}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={formattedData}>
              {grid}
              <XAxis
                dataKey={xKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={formatValue}
                dx={-10}
              />
              {tooltip}
              {legend}
              {yKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey={yKeys[0]}
                nameKey={xKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {formattedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {tooltip}
              {legend}
            </PieChart>
          </ResponsiveContainer>
        )

      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <FunnelChart>
              <Tooltip />
              <Funnel
                data={formattedData}
                dataKey={yKeys[0]}
                nameKey={xKey}
                isAnimationActive
              >
                <LabelList
                  position="right"
                  fill="#6b7280"
                  stroke="none"
                  dataKey={xKey}
                  fontSize={12}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {renderChart()}
    </div>
  )
}

interface MiniChartProps {
  data: Array<{ value: number }>
  color?: string
  height?: number
  className?: string
}

export function MiniSparkline({ data, color = '#6366f1', height = 40 }: MiniChartProps) {
  const chartData = data.map((item, index) => ({ index, ...item }))

  return (
    <div className={clsx('w-full')}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#spark-${color})`}
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
