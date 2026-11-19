import React from 'react';
import { X, ShoppingBag, Trash2, ShieldAlert, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 15 ? 0 : 3.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + deliveryFee + tax).toFixed(2));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer content panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <span className="font-bold text-slate-800 text-lg">My Cart ({items.length})</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Rows */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 animate-bounce-slow" />
              <p className="font-semibold text-sm">Your cart is feeling empty!</p>
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.productId} 
                className="flex items-center space-x-3 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl relative"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-14 h-14 object-cover rounded-xl bg-white border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <h4 className="text-xs font-bold text-slate-700 truncate">{item.name}</h4>
                    {item.isAiSuggested && (
                      <span className="bg-brand-100 text-brand-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full flex-shrink-0">
                        AI Pick
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mb-1.5">{item.unit}</p>
                  <p className="text-xs font-black text-slate-800">${item.price}</p>
                </div>

                {/* Adjusting quantity controls */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-50"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="text-slate-300 hover:text-rose-500 transition-all p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing calculations footer */}
        {items.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-700">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-700">
                  {deliveryFee === 0 ? <span className="text-brand-600 font-extrabold">FREE</span> : `$${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-bold text-slate-700">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-black text-slate-900">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Threshold message */}
            {subtotal < 15 && (
              <div className="flex items-center space-x-2 bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-[10px] text-amber-700">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Add <strong>${(15 - subtotal).toFixed(2)}</strong> more to unlock <strong>FREE Delivery</strong>!</span>
              </div>
            )}

            <div className="flex space-x-2">
              <button 
                onClick={clearCart} 
                className="px-3 border border-slate-200 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={onCheckout}
                className="flex-1 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-2xl shadow-md shadow-brand-100 hover:shadow-brand-200 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Checkout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
