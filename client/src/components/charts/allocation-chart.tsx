import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Investment } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

/**
 * Componente grafico a torta per visualizzare l'allocazione del portafoglio.
 * Implementa grafico interattivo con percentuali e colori per ogni asset.
 * Calcola automaticamente le percentuali basate sui valori correnti.
 */
export default function AllocationChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);

  
  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments", DEMO_USER_ID],
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  
  const calculateAllocation = () => {
    const totalValue = investments.reduce((total, inv) => {
      const shares = parseFloat(String(inv.shares || 0));
      const price = parseFloat(String(inv.currentPrice || 0));
      return total + (shares * price);
    }, 0);

    if (totalValue === 0 || investments.length === 0) {
      return [
        { label: "Nessun investimento", value: 100, color: "#94A3B8" }
      ];
    }

    
    const stockSymbols = ["ENI", "ENEL", "UCG", "ISP", "TIT", "RACE", "G", "STM"];
    const bondSymbols = ["BTP", "CTZ", "CCT", "CORP-BOND", "BOND"];
    const etfSymbols = ["FTSE-MIB", "MSCI", "ISHARES", "VANGUARD", "ETF"];

    
    const categorizeInvestment = (inv: Investment) => {
      const symbol = (inv.symbol || '').toUpperCase();
      const name = (inv.name || '').toUpperCase();
      
      
      if (bondSymbols.some(s => symbol.includes(s)) || 
          name.includes('BOND') || name.includes('BTP') || name.includes('OBBLIGAZ')) {
        return 'bonds';
      }
      
      
      if (etfSymbols.some(s => symbol.includes(s)) || 
          name.includes('ETF') || name.includes('INDEX')) {
        return 'etf';
      }
      
      
      if (stockSymbols.some(s => symbol.includes(s)) || 
          name.includes('S.P.A') || name.includes('N.V.')) {
        return 'stocks';
      }
      
      
      return 'stocks';
    };

    const stocksValue = investments
      .filter(inv => categorizeInvestment(inv) === 'stocks')
      .reduce((total, inv) => {
        const shares = parseFloat(String(inv.shares || 0));
        const price = parseFloat(String(inv.currentPrice || 0));
        return total + (shares * price);
      }, 0);

    const bondsValue = investments
      .filter(inv => categorizeInvestment(inv) === 'bonds')
      .reduce((total, inv) => {
        const shares = parseFloat(String(inv.shares || 0));
        const price = parseFloat(String(inv.currentPrice || 0));
        return total + (shares * price);
      }, 0);

    const etfValue = investments
      .filter(inv => categorizeInvestment(inv) === 'etf')
      .reduce((total, inv) => {
        const shares = parseFloat(String(inv.shares || 0));
        const price = parseFloat(String(inv.currentPrice || 0));
        return total + (shares * price);
      }, 0);

    const stocksPercent = Math.round((stocksValue / totalValue) * 100);
    const bondsPercent = Math.round((bondsValue / totalValue) * 100);
    const etfPercent = Math.round((etfValue / totalValue) * 100);

    
    const categories = [];
    
    if (stocksPercent > 0) {
      categories.push({ label: "Azioni", value: stocksPercent, color: "#3B82F6" });
    }
    
    if (bondsPercent > 0) {
      categories.push({ label: "Obbligazioni", value: bondsPercent, color: "#10B981" });
    }
    
    if (etfPercent > 0) {
      categories.push({ label: "ETF/Altri", value: etfPercent, color: "#EF4444" });
    }

    
    const totalPercent = stocksPercent + bondsPercent + etfPercent;
    if (totalPercent !== 100 && categories.length > 0) {
      const diff = 100 - totalPercent;
      categories[0].value += diff;
    }

    return categories.length > 0 ? categories : [
      { label: "Portafoglio", value: 100, color: "#6B7280" }
    ];
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

    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const data = calculateAllocation();

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 30;
    const innerRadius = radius * 0.55;

    let currentAngle = -Math.PI / 2;

    
    ctx.clearRect(0, 0, rect.width, rect.height);

    
    const enhancedData = data.map(segment => ({
      ...segment,
      color: segment.label === "Azioni" ? "#3B82F6" : 
             segment.label === "Obbligazioni" ? "#10B981" : "#EF4444"
    }));

    enhancedData.forEach((segment, index) => {
      const sliceAngle = (segment.value / 100) * 2 * Math.PI;

      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, radius
      );
      
      const baseColor = segment.color;
      const lightColor = segment.color + "CC"; 
      
      gradient.addColorStop(0, lightColor);
      gradient.addColorStop(1, baseColor);

      
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    
    const centerGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, innerRadius
    );
    centerGradient.addColorStop(0, "#FFFFFF");
    centerGradient.addColorStop(1, "#F8FAFC");

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [investments]);

  const allocationData = calculateAllocation().map(item => ({
    label: item.label,
    percentage: item.value,
    color: item.label === "Azioni" ? "bg-blue-500" : 
           item.label === "Obbligazioni" ? "bg-green-500" : 
           item.label === "ETF/Altri" ? "bg-red-500" : "bg-gray-400"
  }));

  return (
    <Card className="chart-container">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-semibold">Allocazione Asset</CardTitle>
        <p className="text-xs sm:text-sm text-neutral-600">
          Distribuzione del portafoglio per categoria
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative h-48 sm:h-56 lg:h-64 flex items-center justify-center mb-4 lg:mb-6">
          <canvas
            ref={chartRef}
            className="w-full h-full max-w-[200px] max-h-[200px]"
            style={{ display: 'block' }}
          />
        </div>
        <div className="space-y-2 lg:space-y-3">
          {allocationData.map((asset) => (
            <div key={asset.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className={`w-3 h-3 ${asset.color} rounded-full flex-shrink-0`}></div>
                <span className="text-xs sm:text-sm font-medium text-neutral-700 truncate">{asset.label}</span>
              </div>
              <span className="text-xs sm:text-sm text-neutral-600 font-medium">{asset.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
