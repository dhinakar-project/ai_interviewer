"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

interface ChartProps {
    title: string;
    data: ChartDataPoint[];
    type?: 'bar' | 'line' | 'progress';
    height?: number;
    showTrend?: boolean;
    trendValue?: number;
}

export function BarChart({ title, data, height = 200, showTrend, trendValue }: ChartProps) {
    // Safety checks for data
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Filter out invalid data points
    const validData = data.filter(d => typeof d.value === 'number' && !isNaN(d.value));
    
    if (validData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No valid data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxValue = Math.max(...validData.map(d => d.value));
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {showTrend && trendValue !== undefined && (
                    <div className="flex items-center gap-1">
                        {trendValue > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                            trendValue > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {Math.abs(trendValue)}%
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3" style={{ height }}>
                    {validData.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.label}</span>
                                <span className="font-medium text-gray-900">{item.value}</span>
                            </div>
                            <div className="relative bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        item.color || 'bg-blue-500'
                                    }`}
                                    style={{
                                        width: `${Math.max(0, Math.min(100, (item.value / maxValue) * 100))}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function LineChart({ title, data, height = 200 }: ChartProps) {
    // Safety checks for data
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Filter out invalid data points
    const validData = data.filter(d => typeof d.value === 'number' && !isNaN(d.value));
    
    if (validData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No valid data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const maxValue = Math.max(...validData.map(d => d.value));
    const minValue = Math.min(...validData.map(d => d.value));
    const range = maxValue - minValue;
    
    const points = validData.map((item, index) => {
        const x = validData.length === 1 ? 50 : (index / Math.max(validData.length - 1, 1)) * 100;
        const y = range > 0 ? 100 - ((item.value - minValue) / range) * 100 : 50;
        return {
            x: Math.max(0, Math.min(100, x)), // Clamp between 0 and 100
            y: Math.max(0, Math.min(100, y)), // Clamp between 0 and 100
            label: item.label,
            value: item.value,
        };
    });

    const pathData = points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative" style={{ height }}>
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        className="absolute inset-0"
                    >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(y => (
                            <line
                                key={y}
                                x1="0"
                                y1={y}
                                x2="100"
                                y2={y}
                                stroke="#e5e7eb"
                                strokeWidth="0.5"
                            />
                        ))}
                        
                        {/* Line chart */}
                        <path
                            d={pathData}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        
                        {/* Data points */}
                        {points.map((point, index) => (
                            <circle
                                key={index}
                                cx={point.x}
                                cy={point.y}
                                r="2"
                                fill="#3b82f6"
                                className="hover:r-3 transition-all"
                            />
                        ))}
                    </svg>
                    
                    {/* Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                        {data.map((item, index) => (
                            <span key={index} className="text-center">
                                {item.label}
                            </span>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ProgressChart({ title, data }: ChartProps) {
    // Safety checks for data
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Filter out invalid data points
    const validData = data.filter(d => typeof d.value === 'number' && !isNaN(d.value) && d.value >= 0);
    
    if (validData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No valid data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {validData.map((item, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-medium text-gray-900">{item.value}%</span>
                        </div>
                        <div className="relative bg-gray-100 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    item.value >= 80 ? 'bg-green-500' :
                                    item.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export function DonutChart({ title, data }: ChartProps) {
    // Safety checks for data
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Filter out invalid data points
    const validData = data.filter(d => typeof d.value === 'number' && !isNaN(d.value) && d.value > 0);
    
    if (validData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No valid data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const total = validData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg
                            width="128"
                            height="128"
                            viewBox="0 0 128 128"
                            className="transform -rotate-90"
                        >
                            {validData.map((item, index) => {
                                const percentage = (item.value / total) * 100;
                                const angle = (percentage / 100) * 360;
                                const radius = 50;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDasharray = (percentage / 100) * circumference;
                                
                                const x1 = 64 + radius * Math.cos((currentAngle * Math.PI) / 180);
                                const y1 = 64 + radius * Math.sin((currentAngle * Math.PI) / 180);
                                const x2 = 64 + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                                const y2 = 64 + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                                
                                const largeArcFlag = angle > 180 ? 1 : 0;
                                
                                const pathData = [
                                    `M ${x1} ${y1}`,
                                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                ].join(' ');
                                
                                currentAngle += angle;
                                
                                return (
                                    <path
                                        key={index}
                                        d={pathData}
                                        fill="none"
                                        stroke={colors[index % colors.length]}
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{total}</div>
                                <div className="text-sm text-gray-600">Total</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 space-y-2">
                    {validData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                                <span className="text-sm text-gray-600">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}






















