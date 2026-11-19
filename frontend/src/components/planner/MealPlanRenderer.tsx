import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, Check, AlertCircle, TrendingDown, RefreshCw } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface RecommendedGrocery {
  sku: string;
  name: string;
  quantityNeeded: number;
  matchedPrice: number;
  reason: string;
}

interface MealPlanDay {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface MealPlanResponse {
  summary: {
    totalEstimatedCost: number;
    budgetCompliance: boolean;
    caloriesPerDayAverage: number;
  };
  mealPlan: MealPlanDay[];
  recommendedGroceries: RecommendedGrocery[];
}

interface MealPlanRendererProps {
  plan: MealPlanResponse;
  allProducts: any[]; // Used to map SKUs to actual Firestore product IDs
  onReset: () => void;
}

export default function MealPlanRenderer({ plan, allProducts, onReset }: MealPlanRendererProps) {
  const addMultipleToCart = useCartStore((state) => state.addMultipleItems);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'groceries'>('schedule');

  const { summary, mealPlan, recommendedGroceries } = plan;

  const handleAddAllToCart = () => {
    // Map items from SKUs to items ready for Zustand store
    const itemsToAdd = recommendedGroceries.map((item) => {
      const match = allProducts.find((p) => p.sku === item.sku);
      return {
        productId: match?.id || 'mock_' + item.sku,
        sku: item.sku,
        name: item.name,
        price: item.matchedPrice,
        unit: match?.unit || '1 unit',
        imageUrl: match?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
        isAiSuggested: true
      };
    });

    addMultipleToCart(itemsToAdd);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full space-y-6">
      {/* Upper Scorecard summary */}
      <div className="bg-slate-50 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between border border-slate-100">
        <div>
          <p className="text-xs font-semibold text-slate-400">Total Estimated Cost</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black text-slate-800">${summary.totalEstimatedCost}</span>
            <span className="text-xs font-semibold text-slate-400">est. total</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {summary.budgetCompliance ? (
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              Within Budget
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              Exceeded Budget
            </div>
          )}
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400">Daily Calorie Target</p>
            <p className="text-sm font-bold text-slate-700">{summary.caloriesPerDayAverage} kcal</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'schedule' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Meal Schedule
        </button>
        <button
          onClick={() => setActiveTab('groceries')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'groceries' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Grocery List ({recommendedGroceries.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1">
        {activeTab === 'schedule' ? (
          <div className="space-y-4">
            {mealPlan.map((day) => (
              <div key={day.day} className="border-b border-slate-50 pb-3 last:border-b-0">
                <p className="text-xs font-black text-brand-600 uppercase tracking-wider mb-2">Day {day.day}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-amber-50/50 p-2.5 rounded-xl">
                    <p className="text-[10px] font-semibold text-amber-700">Breakfast</p>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{day.breakfast}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-2.5 rounded-xl">
                    <p className="text-[10px] font-semibold text-emerald-700">Lunch</p>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{day.lunch}</p>
                  </div>
                  <div className="bg-purple-50/50 p-2.5 rounded-xl">
                    <p className="text-[10px] font-semibold text-purple-700">Dinner</p>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{day.dinner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recommendedGroceries.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-2 bg-slate-50 rounded-xl hover:bg-slate-100/70 transition-all">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                  {item.quantityNeeded}x
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 italic line-clamp-1">{item.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-700">${parseFloat((item.matchedPrice * item.quantityNeeded).toFixed(2))}</p>
                  <p className="text-[10px] text-slate-400">${item.matchedPrice}/{item.sku.includes('APL') || item.sku.includes('TOM') ? '500g' : 'unit'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action panel footer */}
      <div className="flex space-x-2 pt-4 border-t border-slate-50">
        <button
          onClick={onReset}
          className="p-3 border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={handleAddAllToCart}
          className={`flex-1 py-3 px-4 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 ${
            added
              ? 'bg-emerald-500 shadow-emerald-100 hover:shadow-emerald-200'
              : 'bg-brand-500 shadow-brand-100 hover:shadow-brand-200 hover:opacity-95'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added All to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add AI List to Cart</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
