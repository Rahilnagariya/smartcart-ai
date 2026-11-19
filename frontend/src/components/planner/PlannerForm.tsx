import React, { useState } from 'react';
import { Sparkles, Users, DollarSign, Calendar, Heart, ShieldAlert } from 'lucide-react';

interface PlannerFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function PlannerForm({ onSubmit, loading }: PlannerFormProps) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [budget, setBudget] = useState(80);
  const [days, setDays] = useState(5);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');

  const diets = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'keto', label: 'Keto' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'organic', label: 'Organic' }
  ];

  const allergens = [
    { id: 'nuts', label: 'Nuts' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'shellfish', label: 'Shellfish' }
  ];

  const handleDietToggle = (id: string) => {
    setDietary(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAllergyToggle = (id: string) => {
    setAllergies(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      household: { adults, children },
      preferences: {
        budget,
        days,
        dietaryRestrictions: dietary,
        allergies
      },
      customNote
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-50">
        <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Planner Setup</h2>
          <p className="text-xs text-slate-400">Configure parameters for your customized grocery list.</p>
        </div>
      </div>

      {/* Household sizes */}
      <div>
        <label className="text-sm font-semibold text-slate-700 flex items-center mb-3">
          <Users className="w-4 h-4 mr-2 text-slate-400" />
          Household Size
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400">Adults</p>
              <p className="text-lg font-bold text-slate-700">{adults}</p>
            </div>
            <div className="flex space-x-1">
              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-55 flex items-center justify-center">-</button>
              <button type="button" onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-55 flex items-center justify-center">+</button>
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 flex justify-between items-center border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400">Kids</p>
              <p className="text-lg font-bold text-slate-700">{children}</p>
            </div>
            <div className="flex space-x-1">
              <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-55 flex items-center justify-center">-</button>
              <button type="button" onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-55 flex items-center justify-center">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Target Budget & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 flex items-center mb-2">
            <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
            Budget Target
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400 font-semibold">$</span>
            <input 
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-brand-300 font-bold text-slate-700" 
              placeholder="100"
              required
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 flex items-center mb-2">
            <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
            Plan Days
          </label>
          <select 
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-brand-300 font-semibold text-slate-700"
          >
            <option value={3}>3 Days</option>
            <option value={5}>5 Days</option>
            <option value={7}>7 Days</option>
          </select>
        </div>
      </div>

      {/* Dietary selection */}
      <div>
        <label className="text-sm font-semibold text-slate-700 flex items-center mb-2">
          <Heart className="w-4 h-4 mr-2 text-slate-400" />
          Diet Preferences
        </label>
        <div className="flex flex-wrap gap-2">
          {diets.map((diet) => (
            <button
              key={diet.id}
              type="button"
              onClick={() => handleDietToggle(diet.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                dietary.includes(diet.id)
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {diet.label}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies selection */}
      <div>
        <label className="text-sm font-semibold text-slate-700 flex items-center mb-2">
          <ShieldAlert className="w-4 h-4 mr-2 text-slate-400" />
          Exclude Allergens
        </label>
        <div className="flex flex-wrap gap-2">
          {allergens.map((allergy) => (
            <button
              key={allergy.id}
              type="button"
              onClick={() => handleAllergyToggle(allergy.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                allergies.includes(allergy.id)
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {allergy.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom note */}
      <div>
        <label className="text-sm font-semibold text-slate-700 block mb-2">
          Special Directions
        </label>
        <textarea
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
          rows={3}
          className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:border-brand-300 text-sm text-slate-600"
          placeholder="e.g. Include lots of fresh green spinach, love avocados, no onions."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-2xl hover:opacity-95 shadow-md shadow-brand-100 hover:shadow-brand-200 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Smart Cart</span>
          </>
        )}
      </button>
    </form>
  );
}
