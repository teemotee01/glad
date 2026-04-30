import React, { useState } from 'react'
import { useRestaurantStore, useDashboardStore } from '../../lib/store'
import { saveOrder } from '../../lib/supabase'
import { useToast } from '../shared/Toast'
import './Menu.css'

const MENU = {
  Starters: [
    { id:'s1', name:'Truffle Arancini',       desc:'Risotto, black truffle, parmesan foam',       price:12500 },
    { id:'s2', name:'Seared Scallops',        desc:'Cauliflower purée, crispy capers, lemon oil', price:18000 },
    { id:'s3', name:'Burrata Caprese',        desc:'Heirloom tomatoes, aged balsamic, basil oil', price:14000 },
  ],
  Mains: [
    { id:'m1', name:'Wagyu Tenderloin',       desc:'220g A5 wagyu, bordelaise, truffle butter',   price:65000 },
    { id:'m2', name:'Lobster Thermidor',      desc:'Half Maine lobster, cognac cream, gruyère',   price:55000 },
    { id:'m3', name:'Wild Mushroom Risotto',  desc:'Porcini, chanterelle, aged pecorino',         price:28000 },
    { id:'m4', name:'Duck Confit',            desc:'Cherry gastrique, potato dauphinoise',        price:38000 },
  ],
  Desserts: [
    { id:'d1', name:'Valrhona Fondant',       desc:'66% dark chocolate, vanilla bean ice cream',  price:9500 },
    { id:'d2', name:'Crème Brûlée',           desc:'Madagascan vanilla, caramelised crust',       price:8000 },
    { id:'d3', name:'Seasonal Sorbet',        desc:"Three scoops, chef's daily selection",        price:6500 },
  ],
}

const fmt = n => `₦${n.toLocaleString()}`

export default function Menu() {
  const { cart, addToCart, updateQty, clearCart, cartTotal, cartCount } = useRestaurantStore()
  const { addActivity } = useDashboardStore()
  const toast = useToast()
  const [cat,       setCat]       = useState('Mains')
  const [cartOpen,  setCartOpen]  = useState(false)
  const [ordering,  setOrdering]  = useState(false)

  const handleAdd = item => { addToCart(item); toast(`${item.name} added`, 'success') }

  const handleOrder = async () => {
    if (!cart.length) { toast('Add items first', 'error'); return }
    setOrdering(true)
    try {
      await saveOrder(cart, cartTotal())
    } catch { /* local fallback */ }
    addActivity({ text: `Order placed — ${fmt(cartTotal())}`, color: 'crimson' })
    clearCart()
    setCartOpen(false)
    toast(`Order placed! ${fmt(cartTotal())}`, 'success')
    setOrdering(false)
  }

  return (
    <div className="menu-wrap">
      {/* Tab bar */}
      <div className="menu-tabs">
        {Object.keys(MENU).map(c => (
          <button key={c} className={`menu-tab${cat===c?' active':''}`} onClick={() => { setCat(c); setCartOpen(false) }}>{c}</button>
        ))}
        <button className="cart-btn" onClick={() => setCartOpen(o => !o)}>
          🛒 {cartCount() > 0 && <span className="cart-chip">{cartCount()}</span>}
          {cartCount() > 0 ? ` ${fmt(cartTotal())}` : ' Order'}
        </button>
      </div>

      {/* Menu items */}
      {!cartOpen && MENU[cat].map(item => {
        const inCart = cart.find(c => c.id === item.id)
        return (
          <div key={item.id} className="menu-item">
            <div className="mi-info">
              <div className="mi-name">{item.name}</div>
              <div className="mi-desc">{item.desc}</div>
            </div>
            <div className="mi-right">
              <span className="mi-price">{fmt(item.price)}</span>
              {inCart ? (
                <div className="qty-ctrl">
                  <button onClick={() => updateQty(item.id, inCart.qty-1)}>−</button>
                  <span>{inCart.qty}</span>
                  <button onClick={() => updateQty(item.id, inCart.qty+1)}>+</button>
                </div>
              ) : (
                <button className="add-btn" onClick={() => handleAdd(item)}>+</button>
              )}
            </div>
          </div>
        )
      })}

      {/* Cart */}
      {cartOpen && (
        <div className="cart-panel">
          <div className="cart-heading">Your Order</div>
          {!cart.length ? (
            <div className="cart-empty">No items yet. Browse the menu above.</div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-row">
                  <span className="cart-name">{item.name}</span>
                  <div className="cart-right">
                    <div className="qty-ctrl">
                      <button onClick={() => updateQty(item.id, item.qty-1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty+1)}>+</button>
                    </div>
                    <span className="cart-line-price">{fmt(item.price*item.qty)}</span>
                  </div>
                </div>
              ))}
              <div className="cart-total-row">
                <span>Total</span>
                <span className="cart-total">{fmt(cartTotal())}</span>
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center'}}
                onClick={handleOrder} disabled={ordering}>
                {ordering ? <><div className="spinner"/>Placing…</> : 'Place Order'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
