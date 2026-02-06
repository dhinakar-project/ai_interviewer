"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
    label: string;
    value: number;
}

interface ChartProps {
    title: string;
    data: ChartDataPoint[];
    height?: number;
}

// Simple Bar Chart Component
export function BarChart({ title, data, height = 300 }: ChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <Card className="card-elevated">
            <CardHeader>
                <CardTitle className="text-gray-900">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4" style={{ height: `${height}px`, overflowY: 'auto' }}>
                    {data.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{item.label}</span>
                                <span className="font-semibold text-blue-600">{item.value}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Simple Line Chart Component (rendered as area chart)
export function LineChart({ title, data, height = 300 }: ChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <Card className="card-elevated">
            <CardHeader>
                <CardTitle className="text-gray-900">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative" style={{ height: `${height}px` }}>
                    <div className="absolute inset-0 flex items-end justify-between gap-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end justify-center" style={{ height: '240px' }}>
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-indigo-500"
                                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                                    >
                                        <div className="text-xs font-semibold text-white text-center pt-2">
                                            {item.value}%
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 text-center truncate w-full">
                                    {item.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Simple Donut Chart Component (rendered as a grid of colored boxes)
export function DonutChart({ title, data }: Omit<ChartProps, 'height'>) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-red-500',
        'bg-orange-500',
    ];

    return (
        <Card className="card-elevated">
            <CardHeader>
                <CardTitle className="text-gray-900">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Visual representation */}
                    <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            return (
                                <div
                                    key={index}
                                    className={`${colors[index % colors.length]} transition-all duration-300 hover:opacity-80`}
                                    style={{ width: `${percentage}%` }}
                                    title={`${item.label}: ${item.value}`}
                                />
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3">
                        {data.map((item, index) => {
                            const percentage = ((item.value / total) * 100).toFixed(1);
                            return (
                                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                    <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-700">{item.label}</div>
                                        <div className="text-xs text-gray-500">{percentage}%</div>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
