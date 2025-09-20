import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/financial-utils";
import type { Investment, DashboardSummary } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

/**
 * Componente grafico per visualizzare la performance del portafoglio investimenti.
 * Implementa grafico interattivo con tooltip e selettore periodo temporale.
 * Calcola e visualizza dati storici con animazioni e gestione eventi mouse.
 */
export default function PortfolioChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [timePeriod, setTimePeriod] = useState("12M");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; label: string; visible: boolean }>({
    x: 0, y: 0, value: 0, label: '', visible: false
  });

  
  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments", DEMO_USER_ID],
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard", DEMO_USER_ID],
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  
  const getPortfolioData = (period: string) => {
    const currentValue = investments.reduce((total, inv) => {
      const shares = parseFloat(String(inv.shares || 0));
      const price = parseFloat(String(inv.currentPrice || 0));
      return total + (shares * price);
    }, 0);
    
    
    if (currentValue === 0) {
      return {
        data: [0],
        labels: ['Oggi'],
        title: "Performance Portfolio - Nessun dato"
      };
    }

    
    const now = new Date();
    
    
    
    const portfolioMilestones = [
      { date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), value: 1450 }, 
      { date: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000), value: 4875 }, 
      { date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), value: 7691 }, 
      { date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), value: 9755 },  
      { date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), value: 15645 }, 
      { date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), value: 14920 }, 
      { date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), value: 15185 }, 
      { date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), value: 16158 },  
      { date: now, value: Math.round(currentValue) }
    ];

    
    const groupMilestonesByPeriod = (milestones: typeof portfolioMilestones, periodType: 'day' | 'week' | 'month') => {
      const groups = new Map<string, typeof portfolioMilestones[0]>();
      
      milestones.forEach(milestone => {
        let key: string;
        if (periodType === 'day') {
          key = milestone.date.toDateString();
        } else if (periodType === 'week') {
          const weekStart = new Date(milestone.date);
          weekStart.setDate(milestone.date.getDate() - milestone.date.getDay());
          key = weekStart.toDateString();
        } else { 
          key = `${milestone.date.getFullYear()}-${milestone.date.getMonth()}`;
        }
        
        
        if (!groups.has(key) || milestone.date > groups.get(key)!.date) {
          groups.set(key, milestone);
        }
      });
      
      return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    };

    switch (period) {
      case "1M": {
        
        const recentMilestones = portfolioMilestones.filter(m => 
          m.date >= new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)
        );
        
        const weeklyData = groupMilestonesByPeriod(recentMilestones, 'week');
        
        return {
          data: weeklyData.map(m => m.value),
          labels: weeklyData.map(m => {
            const daysDiff = Math.ceil((now.getTime() - m.date.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 0) return 'Oggi';
            if (daysDiff <= 7) return '1 sett fa';
            if (daysDiff <= 14) return '2 sett fa';
            if (daysDiff <= 21) return '3 sett fa';
            return '4 sett fa';
          }),
          title: "Performance Portfolio - Ultimo Mese"
        };
      }
      
      case "3M": {
        
        const milestones3M = portfolioMilestones.filter(m => 
          m.date >= new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000)
        );
        
        const monthlyData = groupMilestonesByPeriod(milestones3M, 'month');
        
        return {
          data: monthlyData.map(m => m.value),
          labels: monthlyData.map(m => 
            m.date.toLocaleDateString('it-IT', { month: 'short' })
          ),
          title: "Performance Portfolio - Ultimi 3 Mesi"
        };
      }
      
      case "6M": {
        
        const milestones6M = portfolioMilestones.filter(m => 
          m.date >= new Date(now.getTime() - 185 * 24 * 60 * 60 * 1000)
        );
        
        const monthlyData = groupMilestonesByPeriod(milestones6M, 'month');
        
        return {
          data: monthlyData.map(m => m.value),
          labels: monthlyData.map(m => 
            m.date.toLocaleDateString('it-IT', { month: 'short' })
          ),
          title: "Performance Portfolio - Ultimi 6 Mesi"
        };
      }
      
      case "12M":
      default: {
        
        const monthlyData = groupMilestonesByPeriod(portfolioMilestones, 'month');
        
        return {
          data: monthlyData.map(m => m.value),
          labels: monthlyData.map(m => 
            m.date.toLocaleDateString('it-IT', { month: 'short' })
          ),
          title: "Performance Portfolio - Ultimo Anno"
        };
      }
      
      case "ALL": {
        
        const allTimeMilestones = [
          { date: new Date('2024-08-01'), value: 0 },     
          ...portfolioMilestones
        ];
        
        const monthlyData = groupMilestonesByPeriod(allTimeMilestones, 'month');
        
        return {
          data: monthlyData.map(m => m.value),
          labels: monthlyData.map(m => {
            if (m.value === 0) return 'Inizio';
            return m.date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
          }),
          title: "Performance Portfolio - Da Sempre"
        };
      }
    }
  };

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const portfolioData = getPortfolioData(timePeriod);
    const { data, labels } = portfolioData;

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    
    ctx.clearRect(0, 0, width, height);
    
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const valueRange = maxValue - minValue;

    
    ctx.strokeStyle = "#F1F5F9";
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    
    for (let i = 0; i <= data.length - 1; i += Math.max(1, Math.floor(data.length / 6))) {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#3B82F6");
    gradient.addColorStop(1, "#1E40AF");
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    
    const areaGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    areaGradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
    areaGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.1)");
    areaGradient.addColorStop(1, "rgba(59, 130, 246, 0.05)");
    
    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      ctx.lineTo(x, y);
    });
    
    ctx.lineTo(width - padding, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

    
    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      
      ctx.shadowColor = "#3B82F6";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      
      ctx.fillStyle = "#1E40AF";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      
      ctx.shadowBlur = 0;
      
      
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      
      ctx.fillStyle = "#60A5FA";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    
    ctx.fillStyle = "#64748B";
    ctx.font = "600 11px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    labels.forEach((label, index) => {
      const x = padding + (chartWidth / (labels.length - 1)) * index;
      ctx.fillText(label, x, height - 15);
    });
    
    
    (canvas as any).__chartData = {
      data,
      labels,
      minValue,
      valueRange,
      padding,
      chartWidth,
      chartHeight,
      width: rect.width,
      height: rect.height
    };

  }, [timePeriod, investments, summary]);

  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = chartRef.current;
    if (!canvas || !(canvas as any).__chartData) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const chartData = (canvas as any).__chartData;
    const { data, labels, padding, chartWidth, chartHeight, minValue, valueRange } = chartData;

    
    if (x >= padding && x <= padding + chartWidth && y >= padding && y <= padding + chartHeight) {
      
      const pointIndex = Math.round(((x - padding) / chartWidth) * (data.length - 1));
      if (pointIndex >= 0 && pointIndex < data.length) {
        const value = data[pointIndex];
        const label = labels[pointIndex];
        const dataX = padding + (chartWidth / (data.length - 1)) * pointIndex;
        const dataY = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

        
        const distance = Math.sqrt(Math.pow(x - dataX, 2) + Math.pow(y - dataY, 2));
        if (distance <= 20) {
          
          const canvasRect = canvas.getBoundingClientRect();
          const tooltipX = canvasRect.left + dataX;
          const tooltipY = canvasRect.top + dataY - 15;

          setTooltip({
            x: tooltipX,
            y: tooltipY,
            value,
            label,
            visible: true
          });
          canvas.style.cursor = 'pointer';
          return;
        }
      }
    }

    setTooltip(prev => ({ ...prev, visible: false }));
    canvas.style.cursor = 'default';
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
    if (chartRef.current) {
      chartRef.current.style.cursor = 'default';
    }
  };

  const portfolioData = getPortfolioData(timePeriod);
  const currentValue = investments.reduce((total, inv) => {
    const shares = parseFloat(String(inv.shares || 0));
    const price = parseFloat(String(inv.currentPrice || 0));
    return total + (shares * price);
  }, 0);

  return (
    <Card className="chart-container">
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div>
          <CardTitle className="text-base sm:text-lg font-semibold">Performance Portfolio</CardTitle>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
            {formatCurrency(currentValue.toString())}
          </p>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            {investments.length} {investments.length === 1 ? 'investimento' : 'investimenti'} attivi
          </p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1M">1 Mese</SelectItem>
            <SelectItem value="3M">3 Mesi</SelectItem>
            <SelectItem value="6M">6 Mesi</SelectItem>
            <SelectItem value="12M">1 Anno</SelectItem>
            <SelectItem value="ALL">Da Sempre</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative h-48 sm:h-56 lg:h-64 w-full">
          <canvas
            ref={chartRef}
            className="absolute inset-0 w-full h-full"
            style={{ display: 'block' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          {tooltip.visible && (
            <div
              className="fixed z-50 bg-neutral-900 text-white px-3 py-2.5 rounded-lg shadow-xl text-sm font-medium pointer-events-none border border-neutral-700"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translateX(-50%) translateY(-100%)',
                maxWidth: '200px'
              }}
            >
              <div className="text-center">
                <div className="text-xs text-neutral-300 mb-1">{tooltip.label}</div>
                <div className="font-semibold">{formatCurrency(tooltip.value.toString())}</div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
