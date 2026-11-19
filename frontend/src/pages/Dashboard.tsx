import { useState } from 'react';
import { Search, Sparkles, Filter, Plus, Check } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  imageUrl: string;
  stock: number;
  tags: string[];
}

interface DashboardProps {
  products: Product[];
  onOpenPlanner: () => void;
  onOpenCart: () => void;
}

export default function Dashboard({ products, onOpenPlanner, onOpenCart }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { items: cartItems, addItem } = useCartStore();

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'fruits-vegetables', label: 'Produce' },
    { id: 'dairy-eggs', label: 'Dairy & Eggs' },
    { id: 'grocery-pantry', label: 'Pantry' }
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getProductQuantity = (productId: string) => {
    return cartItems.find((item) => item.productId === productId)?.quantity || 0;
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Hero Card */}
      <div className="bg-gradient-to-r from-brand-850 to-brand-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 w-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="max-w-md space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-brand-600/40 border border-brand-500/25 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>AI Powered</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-none">SmartCart Grocery Planner</h1>
          <p className="text-xs text-brand-100 font-medium">Specify your diet, household size, and budget. Our agent constructs your personalized week of meals and matches them to our current stock instantly.</p>
          <button
            onClick={onOpenPlanner}
            className="px-5 py-2.5 bg-gradient-to-r from-accent to-amber-500 text-brand-850 text-xs font-black rounded-xl hover:opacity-95 shadow-lg shadow-black/10 hover:shadow-black/15 transition-all flex items-center space-x-1"
          >
            <span>Open AI Planner</span>
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Search Bar / Filter Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search fresh apples, organic oats, eggs..."
            className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-300 text-sm shadow-sm placeholder:text-slate-400 text-slate-700" 
          />
        </div>

        {/* Category filters */}
        <div className="flex space-x-2 overflow-x-auto pb-1 select-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid displays */}
      <div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Store Shelf ({filteredProducts.length})</h3>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 space-y-3">
            <Filter className="w-12 h-12 stroke-1 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm font-semibold">No items match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const qty = getProductQuantity(product.id);
              
              return (
                <div 
                  key={product.id} 
                  className="bg-white border border-slate-100 rounded-3xl p-3 flex flex-col hover-lift relative"
                >
                  {/* Category Pill Tag */}
                  <span className="absolute top-2 left-2 bg-slate-100/80 text-slate-500 text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {product.unit}
                  </span>

                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-32 object-cover rounded-2xl bg-slate-50 mb-3"
                  />
                  <div className="flex-1 space-y-1 mb-3">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{product.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {product.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[8px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">$</span>
                      <span className="text-sm font-black text-slate-850">{product.price}</span>
                    </div>

                    {/* Quick action button */}
                    {qty > 0 ? (
                      <button
                        onClick={onOpenCart}
                        className="px-2.5 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-[10px] font-black flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>{qty} Added</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => addItem({
                          productId: product.id,
                          sku: product.sku,
                          name: product.name,
                          price: product.price,
                          unit: product.unit,
                          imageUrl: product.imageUrl
                        })}
                        className="p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
