import React, { useEffect, useState } from 'react';
import { Package, Truck, Compass, MapPin, CheckCircle } from 'lucide-react';

interface OrderTrackingProps {
  orderId: string;
  onReset: () => void;
}

export default function OrderTracking({ orderId, onReset }: OrderTrackingProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  const steps = [
    { label: 'Order Placed', desc: 'We have received your order.', icon: CheckCircle, color: 'text-brand-500 bg-brand-50 border-brand-500' },
    { label: 'Packing Items', desc: 'Our store executives are packing your groceries.', icon: Package, color: 'text-amber-500 bg-amber-50 border-amber-500' },
    { label: 'Out for Delivery', desc: 'Valet is out for delivery with your package.', icon: Truck, color: 'text-blue-500 bg-blue-50 border-blue-500' },
    { label: 'Arrived', desc: 'Valet has reached your destination.', icon: Compass, color: 'text-emerald-500 bg-emerald-50 border-emerald-500' }
  ];

  // Simulating live stepper progress
  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 8000); // Progress step every 8 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Upper Panel */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 animate-pulse-slow">
            {React.createElement(steps[statusIndex].icon, { className: "w-8 h-8" })}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tracking Order</h2>
          <p className="text-xs text-brand-600 font-extrabold uppercase mt-0.5">{orderId}</p>
        </div>
        <p className="text-sm text-slate-500 font-medium">Estimated Delivery in <strong>12-15 mins</strong></p>
      </div>

      {/* Timeline tracker */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Updates</h3>
        <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8">
          {steps.map((step, idx) => {
            const isCompleted = statusIndex >= idx;
            const isActive = statusIndex === idx;

            return (
              <div key={idx} className="relative">
                {/* Node indicator */}
                <div className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted 
                    ? step.color 
                    : 'bg-white text-slate-300 border-slate-200'
                }`}>
                  {React.createElement(step.icon, { className: "w-4 h-4" })}
                </div>

                {/* Details */}
                <div className={isActive ? 'opacity-100' : 'opacity-60'}>
                  <h4 className="text-sm font-bold text-slate-800">{step.label}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map visualization placeholder */}
      <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200 h-44 relative flex flex-col justify-end overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),_linear-gradient(90deg,_rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 border-2 border-white animate-bounce">
          <Truck className="w-4 h-4" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 border-2 border-white">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl border border-slate-200 relative z-10 flex justify-between items-center shadow-md">
          <div>
            <p className="text-xs font-bold text-slate-800">Simulated Valet Path</p>
            <p className="text-[10px] text-slate-400">Driver: Rohan Sharma • 4.9★</p>
          </div>
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Order Again
          </button>
        </div>
      </div>

    </div>
  );
}
