import { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, MapPin, Database } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PlannerForm from './components/planner/PlannerForm';
import MealPlanRenderer from './components/planner/MealPlanRenderer';
import CartDrawer from './components/cart/CartDrawer';
import OrderTracking from './pages/OrderTracking';
import { useCartStore } from './store/cartStore';
import { useAuthStore } from './store/authStore';

// Catalog local state interface
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'planner' | 'tracking'>('store');
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [seeding, setSeeding] = useState(false);
  
  // AI Planner generation states
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<any | null>(null);
  
  // Order checkout states
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const { items: cartItems, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // Load products list on mount (simulating cloud fetching with fallback mockup)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Try to connect to firebase functions local proxy or backend
      const res = await fetch('/api/products'); // If running within hosting
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        // Fallback local products array if backend is not started/configured
        setProducts(getMockCatalogProducts());
      }
    } catch {
      setProducts(getMockCatalogProducts());
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSeedCatalog = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ force: true }) });
      if (res.ok) {
        await fetchProducts();
        alert("Products successfully seeded in Firestore!");
      } else {
        alert("Failed to hit seeder endpoint. Using local client mock memory.");
      }
    } catch {
      alert("Local backend proxy offline. Operating on client mock memory.");
    } finally {
      setSeeding(false);
    }
  };

  const handlePlannerSubmit = async (formData: any) => {
    setPlannerLoading(true);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Feed a snapshot of current catalog so Gemini knows what's available
          catalogSnapshot: products.map(p => ({ sku: p.sku, name: p.name, price: p.price, stock: p.stock, tags: p.tags }))
        })
      });

      if (res.ok) {
        const payload = await res.json();
        setMealPlan(payload.data);
      } else {
        // Create mock meal plan client side if backend is not online
        throw new Error("Local backend offline. Initiating client-side mockup.");
      }
    } catch {
      // Simulate client side generation
      setTimeout(() => {
        setMealPlan(generateClientMockPlan(formData.preferences.budget, formData.preferences.days, formData.preferences.dietaryRestrictions, formData.preferences.allergies));
        setPlannerLoading(false);
      }, 1500);
      return;
    }
    setPlannerLoading(false);
  };

  const handleCheckoutProcess = async () => {
    setCartOpen(false);
    
    const address = user?.savedAddresses[0] || {
      label: "Home",
      addressLine: "Flat 405, Green Valley Apartments, Sector 56",
      city: "Gurugram",
      zipCode: "122011"
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || "usr_guest",
          items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, sku: item.sku })),
          address,
          paymentMethodId: "tok_mock_success"
        })
      });

      if (res.ok) {
        const payload = await res.json();
        setActiveOrderId(payload.orderId);
        clearCart();
        setActiveTab('tracking');
      } else {
        throw new Error();
      }
    } catch {
      // Client checkout fallback
      const mockId = "ord_" + Math.random().toString(36).substr(2, 9).toUpperCase();
      setActiveOrderId(mockId);
      clearCart();
      setActiveTab('tracking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-6">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div onClick={() => setActiveTab('store')} className="flex items-center space-x-2 cursor-pointer select-none">
            <div className="p-2 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-lg leading-none block">SmartCart</span>
              <span className="text-[10px] text-brand-600 font-black tracking-widest uppercase">AI Engine</span>
            </div>
          </div>

          {/* Address pill */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-100/70 border border-slate-150 px-3 py-1.5 rounded-full text-xs max-w-xs truncate text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span>Delivering to: <strong className="text-slate-700">Gurugram Sec 56</strong></span>
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-3">
            
            {/* Database seed action */}
            <button 
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center space-x-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{seeding ? "Seeding..." : "Seed Database"}</span>
            </button>

            {/* Cart trigger button */}
            <button 
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 bg-slate-100 hover:bg-slate-200/60 rounded-xl text-slate-700 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white border-2 border-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Loader */}
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-400">Loading catalog items...</p>
          </div>
        ) : (
          <>
            {activeTab === 'store' && (
              <Dashboard 
                products={products} 
                onOpenPlanner={() => setActiveTab('planner')} 
                onOpenCart={() => setCartOpen(true)}
              />
            )}

            {activeTab === 'planner' && (
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <PlannerForm onSubmit={handlePlannerSubmit} loading={plannerLoading} />
                
                {mealPlan ? (
                  <MealPlanRenderer 
                    plan={mealPlan} 
                    allProducts={products}
                    onReset={() => setMealPlan(null)} 
                  />
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 h-96 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                    <Sparkles className="w-12 h-12 stroke-1 text-slate-300 animate-pulse" />
                    <div>
                      <p className="font-bold text-slate-600 text-sm">Meal Planner Output</p>
                      <p className="text-xs max-w-xs mt-1">Configure choices on the form to view your calendar details and grocery breakdown.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tracking' && activeOrderId && (
              <OrderTracking orderId={activeOrderId} onReset={() => {
                setActiveOrderId(null);
                setActiveTab('store');
              }} />
            )}
          </>
        )}
      </main>

      {/* Slide-out cart drawer component */}
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        onCheckout={handleCheckoutProcess} 
      />

      {/* Mobile Sticky Navigation Footer */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 py-2.5 px-6 flex justify-around items-center sm:hidden shadow-lg shadow-black/10">
        <button 
          onClick={() => setActiveTab('store')}
          className={`flex flex-col items-center ${activeTab === 'store' ? 'text-brand-500' : 'text-slate-400'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Store</span>
        </button>
        <button 
          onClick={() => setActiveTab('planner')}
          className={`flex flex-col items-center ${activeTab === 'planner' ? 'text-brand-500' : 'text-slate-400'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">AI Planner</span>
        </button>
        <button 
          onClick={() => {
            if (activeOrderId) setActiveTab('tracking');
            else alert("No active order currently placed.");
          }}
          className={`flex flex-col items-center ${activeTab === 'tracking' ? 'text-brand-500' : 'text-slate-400'} ${!activeOrderId ? 'opacity-40' : ''}`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Track Order</span>
        </button>
      </nav>

    </div>
  );
}

// Fallback catalog list if fetch fails
function getMockCatalogProducts(): Product[] {
  return [
    {
      id: "p1",
      sku: "FRUIT-APL-01",
      name: "Fresh Red Apples",
      description: "Sweet and crunchy organic red apples, packed with nutrients.",
      price: 3.49,
      unit: "500g",
      category: "fruits-vegetables",
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
      stock: 50,
      tags: ["fresh", "organic", "vegan", "vegetarian", "gluten-free"]
    },
    {
      id: "p2",
      sku: "FRUIT-BAN-01",
      name: "Organic Bananas",
      description: "Rich in potassium, perfect for morning shakes or quick snacks.",
      price: 1.99,
      unit: "1 bunch",
      category: "fruits-vegetables",
      imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
      stock: 40,
      tags: ["fresh", "organic", "vegan", "vegetarian", "gluten-free"]
    },
    {
      id: "p3",
      sku: "VEG-TOM-01",
      name: "Roma Tomatoes",
      description: "Juicy vine-ripened tomatoes, great for salads, sauces, and curries.",
      price: 2.79,
      unit: "500g",
      category: "fruits-vegetables",
      imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400",
      stock: 35,
      tags: ["fresh", "vegan", "vegetarian"]
    },
    {
      id: "p4",
      sku: "DAIRY-MILK-01",
      name: "Whole Milk 1L",
      description: "High-calcium organic milk from pasture-fed cows.",
      price: 2.29,
      unit: "1 Bottle",
      category: "dairy-eggs",
      imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
      stock: 25,
      tags: ["fresh", "organic", "vegetarian"]
    },
    {
      id: "p5",
      sku: "DAIRY-EGG-01",
      name: "Free-Range Large Eggs",
      description: "Grade A fresh eggs, sourced from local ethical farms.",
      price: 4.89,
      unit: "12 Pack",
      category: "dairy-eggs",
      imageUrl: "https://images.unsplash.com/photo-1516448424440-9dbca97779c1?w=400",
      stock: 30,
      tags: ["fresh", "keto", "high-protein", "vegetarian"]
    },
    {
      id: "p6",
      sku: "GRAIN-QUN-01",
      name: "Organic White Quinoa",
      description: "High-protein ancient grain, perfect gluten-free rice substitute.",
      price: 4.99,
      unit: "500g",
      category: "grocery-pantry",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      stock: 45,
      tags: ["organic", "vegan", "vegetarian", "gluten-free"]
    }
  ];
}

// Fallback meal plan generator for local sandbox testing
function generateClientMockPlan(budget: number, days: number, dietary: string[], allergies: string[]) {
  const catalog = getMockCatalogProducts();
  
  // Exclude allergies
  const safeCatalog = catalog.filter(p => !allergies.some(a => p.tags.includes(a)));
  
  // Prioritize dietary
  let candidates = safeCatalog.filter(p => dietary.every(d => p.tags.includes(d)));
  if (candidates.length === 0) candidates = safeCatalog;

  const mealPlan = [];
  for (let i = 1; i <= days; i++) {
    mealPlan.push({
      day: i,
      breakfast: "Whole Milk oatmeal with diced Red Apples",
      lunch: "Organic Quinoa bowl tossed with Vine Roma Tomatoes",
      dinner: "Stir fried produce skillet accompanied by fresh fruits"
    });
  }

  const recommendedGroceries = candidates.slice(0, 3).map((item, idx) => ({
    sku: item.sku,
    name: item.name,
    quantityNeeded: 2,
    matchedPrice: item.price,
    reason: `Used for Day ${idx + 1} meals preparations.`
  }));

  const totalCost = recommendedGroceries.reduce((sum, item) => sum + item.matchedPrice * item.quantityNeeded, 0);

  return {
    summary: {
      totalEstimatedCost: parseFloat(totalCost.toFixed(2)),
      budgetCompliance: totalCost <= budget,
      caloriesPerDayAverage: 1850
    },
    mealPlan,
    recommendedGroceries
  };
}
