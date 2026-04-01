import { useMemo, useState, useEffect, useCallback } from "react";
import ScannerModal from "./ScannerModal.jsx";

const PRODUCTS = [
  { id: "bread-artisan", name: "Artisan Bread", category: "Bakery", price: 450, stock: 40, image: "linear-gradient(135deg, #3b2c1f 0%, #1f1a16 100%)" },
  { id: "bread-whole", name: "Whole Grain Bread", category: "Bakery", price: 350, stock: 35, image: "linear-gradient(135deg, #b57e4b 0%, #6f4a2f 100%)" },
  { id: "milk-1l", name: "Whole Milk 1L", category: "Dairy", price: 280, stock: 60, image: "linear-gradient(135deg, #c4ddf0 0%, #95b7d6 100%)" },
  { id: "eggs-6", name: "Organic Eggs 6pk", category: "Dairy", price: 420, stock: 50, image: "linear-gradient(135deg, #efe8d9 0%, #cabf9f 100%)" },
  { id: "coffee", name: "Americano", category: "Beverages", price: 550, stock: 100, image: "linear-gradient(135deg, #3d3732 0%, #1d1f24 100%)" },
  { id: "soda", name: "Sparkling Soda", category: "Beverages", price: 180, stock: 80, image: "linear-gradient(135deg, #09132b 0%, #c7292b 100%)" },
  { id: "fruit-apple", name: "Red Apple", category: "Fruits", price: 120, stock: 120, image: "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)" },
  { id: "fruit-banana", name: "Banana Bunch", category: "Fruits", price: 90, stock: 150, image: "linear-gradient(135deg, #854d0e 0%, #422006 100%)" },
  { id: "veg-carrot", name: "Fresh Carrots", category: "Vegetables", price: 150, stock: 90, image: "linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)" },
  { id: "snack-chips", name: "Potato Chips", category: "Snacks", price: 200, stock: 75, image: "linear-gradient(135deg, #ca8a04 0%, #713f12 100%)" }
];

const INITIAL_ORDERS = [
  { id: 101, at: new Date().toISOString(), when: "2 mins ago", title: "Order #101", amount: 2450, method: "visa", day: "today" },
  { id: 100, at: new Date(Date.now() - 720000).toISOString(), when: "12 mins ago", title: "Order #100", amount: 1200, method: "cash", day: "today" }
];

const TABS = [
  { id: "sell", label: "Sell", icon: "register" },
  { id: "history", label: "History", icon: "history" },
  { id: "inventory", label: "Inventory", icon: "box" },
  { id: "more", label: "More", icon: "menu" }
];

const CATEGORY_OPTIONS = ["All Products", "Bakery", "Beverages", "Dairy", "Fruits", "Vegetables", "Snacks"];

const getImageStyle = (img) => {
  if (!img) return 'var(--glass)';
  if (img.startsWith('http') || img.startsWith('data:')) return `url("${img}") center/cover`;
  return img;
};

const money = (value, settings) =>
  value.toLocaleString("en-PK", {
    style: "currency",
    currency: settings?.currency === "PKR" ? "PKR" : "USD",
    maximumFractionDigits: 0
  }).replace("PKR", settings?.currency || "PKR").replace("$", settings?.currency || "PKR");

const Icon = ({ name, className = "", style = {} }) => {
  const size = 20;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className, style };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
  if (name === "cart") return <svg {...common}><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /><path d="M3 4h2l2.2 10.3a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 2-1.6L21 8H7" /></svg>;
  if (name === "scan") return <svg {...common}><path d="M4 7V5a1 1 0 0 1 1-1h2" /><path d="M20 7V5a1 1 0 0 0-1-1h-2" /><path d="M4 17v2a1 1 0 0 0 1 1h2" /><path d="M20 17v2a1 1 0 0 1-1 1h-2" /><line x1="8" y1="8" x2="8" y2="16" /><line x1="11" y1="8" x2="11" y2="16" /><line x1="14" y1="8" x2="14" y2="16" /><line x1="17" y1="8" x2="17" y2="16" /></svg>;
  if (name === "register") return <svg {...common}><rect x="4" y="10" width="16" height="10" rx="2" /><rect x="6" y="4" width="12" height="5" rx="1" /><line x1="8" y1="14" x2="16" y2="14" /></svg>;
  if (name === "history") return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 10 9 10" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="13" x2="15" y2="15" /></svg>;
  if (name === "box") return <svg {...common}><path d="M3 7 12 3l9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /></svg>;
  if (name === "menu") return <svg {...common}><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>;
  if (name === "check") return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="m8 12 2.5 2.5L16 9" /></svg>;
  if (name === "chevron") return <svg {...common}><polyline points="9 18 15 12 9 6" /></svg>;
  if (name === "plus") return <svg {...common}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
  if (name === "minus") return <svg {...common}><line x1="5" y1="12" x2="19" y2="12" /></svg>;
  if (name === "user") return <svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  if (name === "logout") return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
  return null;
};

const AppHeader = ({ right, user, onLogout, settings }) => (
  <header className="app-header">
    <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', boxShadow: '0 0 20px var(--primary-glow)' }} />
      <h1>{settings?.storeName || 'Mart POS'}</h1>
      {user && <div className="user-badge">{user.role.toUpperCase()}</div>}
    </div>
    <div className="header-right" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      {right}
      {user && <button className="logout-btn" onClick={onLogout} style={{ background: 'var(--glass)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '14px', cursor: 'pointer' }}><Icon name="logout" style={{ width: '16px', height: '16px' }} /> Logout</button>}
    </div>
  </header>
);

const SectionTitle = ({ label, right }) => <div className="section-title"><span>{label}</span>{right}</div>;

const ProductCard = ({ product, qtyInCart, onAdd, settings }) => {
  const [showPop, setShowPop] = useState(false);
  const stockAvailable = (product.stock || 0) - qtyInCart;
  
  const handleAdd = () => {
    if (stockAvailable <= 0) return;
    setShowPop(true);
    onAdd();
    setTimeout(() => setShowPop(false), 600);
  };
  return (
    <article className="product-card" style={{ position: 'relative', opacity: stockAvailable <= 0 ? 0.6 : 1 }}>
      {showPop && <div className="floating-feedback">+1</div>}
      <div className="product-image" style={{ background: getImageStyle(product.image), width: '100%', height: '180px', borderRadius: '18px', marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
         <p className="product-category" style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 800, margin: 0 }}>{product.category}</p>
         <span style={{ fontSize: '0.8rem', color: stockAvailable <= 0 ? '#ef4444' : 'var(--success)', fontWeight: 800 }}>{stockAvailable} in stock</span>
      </div>
      <h3 style={{ margin: '0 0 16px' }}>{product.name}</h3>
      <div className="product-footer">
        <strong>{money(product.price, settings)}</strong>
        <button type="button" onClick={handleAdd} disabled={stockAvailable <= 0} style={{ opacity: stockAvailable <= 0 ? 0.5 : 1 }}>
          <Icon name="plus" /> 
           <span>{stockAvailable <= 0 ? 'Empty' : 'Add'} {qtyInCart > 0 && <span className="qty-tag">({qtyInCart})</span>}</span>
        </button>
      </div>
    </article>
  );
};

function SellScreen({ products, cartCount, cartTotal, query, onQueryChange, activeCategory, onCategory, onAdd, onOpenCheckout, onToggleScanner, user, onLogout, settings }) {
  return (
    <section className="screen">
      <AppHeader user={user} onLogout={onLogout} settings={settings} right={<button className="search-trigger" onClick={onToggleScanner} style={{ background: 'var(--primary)', border: 'none', padding: '12px', borderRadius: '14px', color: '#fff' }}><Icon name="scan" /></button>} />
      <div className="search-section">
        <div className="search-bar">
          <Icon name="search" className="icon-muted" />
          <input type="text" placeholder="Search products..." className="search-input" value={query} onChange={e => onQueryChange(e.target.value)} />
        </div>
      </div>
      <div className="categories-strip" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
        {CATEGORY_OPTIONS.map(c => <button key={c} className={`cat-pill ${activeCategory === c ? "active" : ""}`} onClick={() => onCategory(c)}>{c}</button>)}
      </div>
      <div className="product-grid">
        {products.map(p => <ProductCard key={p.id} product={p} qtyInCart={cartCount[p.id] || 0} onAdd={() => onAdd(p.id)} settings={settings} />)}
      </div>
      {Object.keys(cartCount).length > 0 && (
        <div className="floating-cart" onClick={onOpenCheckout}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Icon name="cart" style={{ width: '30px', height: '30px' }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 800 }}>MY BASKET</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{Object.values(cartCount).reduce((a, b) => a + b, 0)} Items</p>
            </div>
          </div>
          <strong>{money(cartTotal, settings)}</strong>
        </div>
      )}
    </section>
  );
}

function CheckoutScreen({ lines, subtotal, total, paymentMethod, setPaymentMethod, customer, setCustomer, onIncrement, onDecrement, onComplete, onBack, success, user, onLogout, settings }) {
  if (success) {
    return (
      <section className="screen success-screen" style={{ textAlign: 'center', padding: '100px 40px' }}>
        <div style={{ background: 'var(--success)', color: '#fff', width: '120px', height: '120px', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', boxShadow: '0 20px 40px rgba(16,185,129,0.4)' }}><Icon name="check" style={{ width: '60px', height: '60px' }} /></div>
        <h2 style={{ fontSize: '3rem', fontWeight: 800 }}>Payment Received</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginTop: '20px' }}>Transaction #TXN-{Date.now().toString().slice(-6)} successful.</p>
        <button className="pay-now" style={{ marginTop: '60px', padding: '24px 80px', borderRadius: '24px', fontSize: '1.5rem' }} onClick={onBack}>Done</button>
      </section>
    );
  }

  return (
    <section className="screen">
      <AppHeader user={user} onLogout={onLogout} settings={settings} right={<button className="text-btn" onClick={onBack}>Back</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', marginTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SectionTitle label="Review Order" />
          {lines.map(l => (
            <div key={l.id} style={{ background: 'var(--glass)', padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: getImageStyle(l.image) }} />
                <div><h4 style={{ fontSize: '1.3rem', margin: 0 }}>{l.name}</h4><p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>{money(l.price, settings)}</p></div>
              </div>
              <div className="cart-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => onDecrement(l.id)} style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--glass', border: '1px solid var(--line)', color: '#fff' }}><Icon name="minus" /></button>
                <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{l.qty}</span>
                <button onClick={() => onIncrement(l.id)} style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', border: 'none', color: '#fff' }}><Icon name="plus" /></button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--glass)', padding: '32px', borderRadius: '32px', border: '1px solid var(--line)', alignSelf: 'start' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '1.2rem' }}>Customer Info (Optional)</h4>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input placeholder="Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', color: '#fff' }} />
            <input placeholder="Mobile" value={customer.mobile} onChange={e => setCustomer({...customer, mobile: e.target.value})} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', color: '#fff' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span style={{ color: 'var(--muted)', fontWeight: 700 }}>SUBTOTAL</span><strong>{money(subtotal, settings)}</strong></div>
          <div style={{ fontSize: '2.5rem', display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '24px', borderTop: '2px solid var(--line)' }}><span>TOTAL</span><strong>{money(total, settings)}</strong></div>
          <div className="payment-methods" style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            {['card', 'cash', 'upi'].map(m => <button key={m} className={`method-btn ${paymentMethod === m ? 'active' : ''}`} onClick={() => setPaymentMethod(m)} style={{ flex: 1, height: '70px', borderRadius: '20px', background: paymentMethod === m ? 'var(--primary)' : 'var(--glass)', color: '#fff', border: 'none', fontWeight: 800 }}>{m.toUpperCase()}</button>)}
          </div>
          <button className="pay-now" onClick={onComplete} style={{ width: '100%', marginTop: '32px', height: '80px', fontSize: '1.5rem', background: 'var(--primary)', borderRadius: '24px' }}>Checkout Order</button>
        </div>
      </div>
    </section>
  );
}

function HistoryScreen({ orders, user, onLogout, settings, onPrint, onRefund }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return orders.filter(o => 
      (o.id ? o.id.toString().toLowerCase() : "").includes(s) || 
      (o.customer?.name || "").toLowerCase().includes(s) || 
      (o.customer?.mobile || "").includes(s)
    );
  }, [orders, search]);

  return (
    <section className="screen">
      <AppHeader user={user} onLogout={onLogout} settings={settings} right={<button className="logout-btn" style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer' }} onClick={onPrint}>Print All Reports</button>} />
      <div style={{ padding: '0 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div><p style={{ color: 'var(--muted)', fontWeight: 800 }}>SALES HISTORY</p><h2 style={{ fontSize: '3rem', margin: 0 }}>Transactions</h2></div>
        <input placeholder="Search by Order ID, Name, or Phone..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" style={{ width: '100%', maxWidth: '400px', padding: '16px 20px', borderRadius: '16px', background: 'var(--glass)', border: '1px solid var(--line)', color: '#fff' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(o => (
          <div key={o.id} className="history-item" style={{ padding: '24px', borderRadius: '24px', background: expanded === o.id ? 'rgba(255,255,255,0.05)' : 'var(--glass)', border: expanded === o.id ? '1px solid var(--primary)' : '1px solid transparent', transition: '0.2s' }}>
            <div onClick={() => setExpanded(expanded === o.id ? null : o.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--glass)', borderRadius: '18px', display: 'grid', placeItems: 'center', border: '1px solid var(--line)' }}><Icon name="register" /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.4rem' }}>{o.title} {o.customer?.name && <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 'normal' }}>({o.customer.name})</span>}</h4>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>{new Date(o.at).toLocaleString()} • {o.method.toUpperCase()} • ID: {o.id}</p>
                </div>
              </div>
              <strong style={{ fontSize: '1.8rem', color: 'var(--success)' }}>{money(o.amount, settings)}</strong>
            </div>
            {expanded === o.id && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                {o.customer?.mobile && <p style={{ margin: '0 0 16px', color: 'var(--muted)' }}>Phone: {o.customer.mobile}</p>}
                {!o.items ? (
                  <p style={{ margin: 0, color: 'var(--muted)', fontStyle: 'italic' }}>No detailed items recorded for this legacy order.</p>
                ) : (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ color: 'var(--muted)', fontSize: '0.9rem' }}><th style={{ paddingBottom: '8px' }}>Item</th><th style={{ paddingBottom: '8px' }}>Qty</th><th style={{ paddingBottom: '8px', textAlign: 'right' }}>Total</th><th style={{ paddingBottom: '8px', width: '80px', textAlign: 'right' }}>Return</th></tr></thead>
                    <tbody>
                      {o.items.map((i, idx) => (
                        <tr key={idx} style={{ opacity: i.qty === 0 ? 0.4 : 1 }}>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>{i.name} {i.qty === 0 && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '8px' }}>(Refunded)</span>}</td>
                          <td style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>{i.qty}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid var(--line)' }}>{money(i.total, settings)}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', borderBottom: '1px solid var(--line)' }}>
                            <button disabled={i.qty <= 0} onClick={(e) => { e.stopPropagation(); onRefund(o.id, idx); }} style={{ background: i.qty > 0 ? '#ef4444' : 'var(--line)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: i.qty > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>-1</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No orders found.</div>}
      </div>
    </section>
  );
}

function InventoryScreen({ user, onLogout, inventory, onAddProduct, settings }) {
  return (
    <section className="screen">
      <AppHeader user={user} onLogout={onLogout} settings={settings} right={<button style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--primary)', border: 'none', color: '#fff' }} onClick={onAddProduct}><Icon name="plus" /></button>} />
      <div style={{ padding: '0 0 20px' }}><p style={{ color: 'var(--muted)', fontWeight: 800 }}>STOCK OVERVIEW</p><h2 style={{ fontSize: '3rem' }}>Inventory</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {inventory.map(item => (
          <div key={item.id} onClick={() => onAddProduct(item.id)} style={{ background: 'var(--glass)', padding: '24px', borderRadius: '28px', border: '1px solid var(--line)', cursor: 'pointer', transition: '0.2s' }}>
             <div style={{ width: '100%', height: '180px', borderRadius: '20px', background: getImageStyle(item.image), marginBottom: '20px' }} />
             <h4 style={{ fontSize: '1.4rem', margin: 0 }}>{item.name}</h4>
             <p style={{ color: 'var(--muted)', margin: '8px 0' }}>SKU: {item.id}</p>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
               <div><p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.8rem', fontWeight: 800 }}>STOCK</p><strong style={{ fontSize: '2rem', color: item.stock < 10 ? 'var(--accent)' : 'var(--success)' }}>{item.stock || 0}</strong></div>
               <strong style={{ fontSize: '1.8rem' }}>{money(item.price, settings)}</strong>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MoreScreen({ user, onLogout, onOpenReports, onOpenSettings, settings }) {
  return (
    <section className="screen">
      <AppHeader user={user} onLogout={onLogout} settings={settings} />
      <h2 style={{ fontSize: '3rem', marginBottom: '40px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <button onClick={onOpenReports} style={{ background: 'var(--glass)', border: '1px solid var(--line)', padding: '40px', borderRadius: '32px', textAlign: 'left', cursor: 'pointer' }}>
          <Icon name="history" style={{ width: '40px', height: '40px', color: 'var(--primary)', marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.8rem', margin: '0 0 8px', color: '#fff' }}>Analytics</h3>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>View detailed sales performance</p>
        </button>
        {user.role === 'admin' && (
          <button onClick={onOpenSettings} style={{ background: 'var(--glass)', border: '1px solid var(--line)', padding: '40px', borderRadius: '32px', textAlign: 'left', cursor: 'pointer' }}>
            <Icon name="menu" style={{ width: '40px', height: '40px', color: 'var(--primary)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.8rem', margin: '0 0 8px', color: '#fff' }}>Settings</h3>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Manage store configuration</p>
          </button>
        )}
      </div>
    </section>
  );
}

function ReportsScreen({ orders, user, onLogout, onBack, settings }) {
  const daily = orders.filter(o => o.day === 'today').reduce((s, o) => s + o.amount, 0);
  const totalVal = orders.reduce((s, o) => s + o.amount, 0);
  return (
    <section className="screen">
      <AppHeader user={user} onLogout={onLogout} settings={settings} right={<button className="text-btn" onClick={onBack}>Back</button>} />
      <div style={{ padding: '0 0 20px' }}><p style={{ color: 'var(--muted)', fontWeight: 800 }}>PERFORMANCE</p><h2 style={{ fontSize: '3rem' }}>Sales Reports</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #4f46e5)', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px var(--primary-glow)' }}>
            <p style={{ margin: 0, fontWeight: 800, opacity: 0.8 }}>DAILY REVENUE</p>
            <h2 style={{ fontSize: '3.5rem', margin: '12px 0 0' }}>{money(daily, settings)}</h2>
          </div>
          <div style={{ background: 'var(--glass)', padding: '40px', borderRadius: '32px', border: '1px solid var(--line)' }}>
            <p style={{ margin: 0, fontWeight: 800, color: 'var(--muted)' }}>TOTAL TURNOVER</p>
            <h2 style={{ fontSize: '3.5rem', margin: '12px 0 0' }}>{money(totalVal, settings)}</h2>
          </div>
        </div>
        <div style={{ background: 'var(--glass)', padding: '40px', borderRadius: '32px', border: '1px solid var(--line)' }}>
          <h4 style={{ fontSize: '1.5rem', margin: '0 0 24px' }}>Transaction Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['card', 'cash', 'upi'].map(m => {
              const val = orders.filter(o => o.method === m).reduce((s, o) => s + o.amount, 0);
              return (
                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontWeight: 800, textTransform: 'uppercase' }}>{m}</span>
                  <strong style={{ fontSize: '1.4rem' }}>{money(val, settings)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SettingsScreen({ user, settings, onSave, onBack, onLogout, cashierCreds, onUpdateCashier }) {
  const [localSet, setLocalSet] = useState(settings);
  const [localCashier, setLocalCashier] = useState(cashierCreds);

  useEffect(() => {
    onSave(localSet);
  }, [localSet, onSave]);

  useEffect(() => {
    onUpdateCashier(localCashier);
  }, [localCashier, onUpdateCashier]);

  return (
    <section className="screen fade-in">
      <AppHeader user={user} onLogout={onLogout} settings={settings} right={<button className="text-btn" onClick={onBack}>Back</button>} />
      <h2 style={{ fontSize: '3rem', margin: '0 0 32px' }}>Settings</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ background: 'var(--glass)', padding: '40px', borderRadius: '32px', border: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Store Config</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div><label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Shop Name</label><input className="search-input" style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)' }} value={localSet.storeName || ''} onChange={e => setLocalSet({...localSet, storeName: e.target.value})} /></div>
            <div><label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Currency</label><input className="search-input" style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)' }} value={localSet.currency || ''} onChange={e => setLocalSet({...localSet, currency: e.target.value})} /></div>
          </div>
        </div>
        <div style={{ background: 'var(--glass)', padding: '40px', borderRadius: '32px', border: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Login Screen Branding</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div><label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Login Title</label><input className="search-input" style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)' }} value={localSet.loginTitle || ""} onChange={e => setLocalSet({...localSet, loginTitle: e.target.value})} /></div>
            <div><label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Login Subtitle</label><textarea className="search-input" style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)', resize: 'vertical' }} value={localSet.loginSubtitle || ""} onChange={e => setLocalSet({...localSet, loginSubtitle: e.target.value})} /></div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Login Background Image</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setLocalSet({...localSet, loginImage: reader.result});
                  reader.readAsDataURL(file);
                }
              }} style={{ display: 'block', width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)' }} />
            </div>
          </div>
        </div>
        {user.role === 'admin' && (
          <div style={{ background: 'var(--glass)', padding: '40px', borderRadius: '32px', border: '1px solid var(--line)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Account Management</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div><label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Cashier Email</label><input className="search-input" style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)' }} value={localCashier.email} onChange={e => setLocalCashier({...localCashier, email: e.target.value})} /></div>
              <div><label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>New Password</label><input className="search-input" type="password" style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--line)' }} value={localCashier.password} onChange={e => setLocalCashier({...localCashier, password: e.target.value})} /></div>
            </div>
          </div>
        )}
        <div style={{ marginTop: '40px' }}>
          <button onClick={() => { onBack(); }} style={{ background: 'var(--primary)', color: '#fff', padding: '16px 32px', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '1.2rem', cursor: 'pointer' }}>Return to Menu</button>
        </div>
      </div>
    </section>
  );
}

function LoginScreen({ onLogin, cashierCreds, settings }) {
  const [stage, setStage] = useState("role");
  const [selectedRole, setSelectedRole] = useState(null);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState("");
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const isAdmin = (selectedRole.role === 'admin' && creds.email === 'admin@pos.com' && creds.password === 'admin123');
    const isCashier = (selectedRole.role === 'cashier' && creds.email === cashierCreds.email && creds.password === cashierCreds.password);
    if (isAdmin || isCashier) onLogin({ ...selectedRole, email: creds.email });
    else setError("Invalid credentials");
  };
  return (
    <section className="login-screen-outer" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: '100vh', background: '#020617' }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={settings?.loginImage || "/pos_login_hero_1775025470135.png"} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="Store" />
        <div style={{ position: 'absolute', bottom: '100px', left: '80px', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 800, color: '#fff', letterSpacing: '-0.05em' }}>{settings?.loginTitle || "Mart POS."}</h1>
          <p style={{ fontSize: '1.8rem', color: 'var(--muted)', marginTop: '20px' }}>{settings?.loginSubtitle || "Elevate your retail experience with our intelligent management suite."}</p>
        </div>
      </div>
      <div style={{ padding: '80px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {stage === "role" ? (
            <>
              <h2 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>Login</h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '50px' }}>Select an account type to continue</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <button onClick={() => { setSelectedRole({ role: 'admin', name: 'Admin' }); setStage("auth"); }} style={{ padding: '32px', textAlign: 'left', borderRadius: '24px', background: 'var(--glass)', border: '1px solid var(--line)', cursor: 'pointer', transition: '0.3s' }}>
                  <h4 style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>Administrator</h4>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>System configuration and analytics</p>
                </button>
                <button onClick={() => { setSelectedRole({ role: 'cashier', name: 'Cashier' }); setStage("auth"); }} style={{ padding: '32px', textAlign: 'left', borderRadius: '24px', background: 'var(--glass)', border: '1px solid var(--line)', cursor: 'pointer', transition: '0.3s' }}>
                   <h4 style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>Cashier Account</h4>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>Point of sale and history access</p>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleAuthSubmit}>
              <button type="button" onClick={() => setStage("role")} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', marginBottom: '30px', fontSize: '1.2rem' }}>← Back</button>
              <h2 style={{ fontSize: '3.5rem', marginBottom: '40px' }}>{selectedRole.name} Login</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <input type="email" placeholder="Email" required style={{ width: '100%', padding: '24px', borderRadius: '18px', background: 'var(--glass)', border: '1px solid var(--line)', color: '#fff', fontSize: '1.1rem' }} value={creds.email} onChange={e => setCreds({...creds, email: e.target.value})} />
                <input type="password" placeholder="Password" required style={{ width: '100%', padding: '24px', borderRadius: '18px', background: 'var(--glass)', border: '1px solid var(--line)', color: '#fff', fontSize: '1.1rem' }} value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} />
                {error && <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: '24px', borderRadius: '18px', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '1.3rem', marginTop: '20px', cursor: 'pointer' }}>Sign In</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductModal({ isOpen, onClose, onSave, onScanTrigger, lastScanned = null, existingProducts = [] }) {
  const [f, setF] = useState({ id: '', name: '', category: 'Bakery', price: '', stock: '', image: '' });
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setF(prev => ({...prev, image: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => { 
    if (lastScanned) {
      const existing = existingProducts?.find(p => p.id === lastScanned);
      if (existing) setF({ ...existing, stock: '' });
      else setF(prev => ({ ...prev, id: lastScanned })); 
    } 
  }, [lastScanned, existingProducts]);
  if (!isOpen) return null;
  return (
    <div className="scanner-modal-overlay" onClick={onClose}>
      <div className="scanner-modal" onClick={e => e.stopPropagation()} style={{ width: '560px', borderRadius: '40px', padding: '40px' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '32px' }}>New Product</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave({...f, price: Number(f.price), stock: Number(f.stock), id: f.id || Date.now().toString(), image: f.image || 'linear-gradient(135deg, #1e293b, #334155)'}); onClose(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', border: '1px solid var(--line)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: getImageStyle(f.image), display: 'grid', placeItems: 'center' }}>
              {!f.image && <Icon name="box" style={{ color: 'var(--muted)' }} />}
            </div>
            <div style={{ flex: 1 }}>
               <label style={{ display: 'block', marginBottom: '4px', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 700 }}>Upload Offline Image</label>
               <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', color: '#fff', fontSize: '0.9rem' }} />
            </div>
          </div>
          <input placeholder="Product Name" required value={f.name} onChange={e => setF({...f, name: e.target.value})} style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: '#fff', borderRadius: '16px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <input placeholder="Price" type="number" required value={f.price} onChange={e => setF({...f, price: e.target.value})} style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: '#fff', borderRadius: '16px' }} />
            <input placeholder="Stock Qty" type="number" required value={f.stock} onChange={e => setF({...f, stock: e.target.value})} style={{ width: '100%', padding: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: '#fff', borderRadius: '16px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--muted)' }}>Product Code / SKU</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input placeholder="Enter code or click scan..." required style={{ flex: 1, padding: '20px', borderRadius: '16px', background: 'var(--glass)', border: '1px solid var(--line)', color: '#fff' }} value={f.id} onChange={e => {
                const val = e.target.value;
                const existing = existingProducts?.find(p => p.id === val);
                if (existing) setF({...existing, stock: ''});
                else setF(prev => ({...prev, id: val}));
              }} />
              <button type="button" onClick={onScanTrigger} style={{ padding: '0 24px', borderRadius: '16px', background: 'var(--primary)', border: 'none', color: '#fff', cursor: 'pointer' }}><Icon name="scan" /></button>
            </div>
          </div>
          <button type="submit" className="pay-now" style={{ height: '70px', marginTop: '20px', borderRadius: '20px' }}>Create Product</button>
        </form>
      </div>
    </div>
  );
}

function BottomNav({ active, onChange, tabs }) {
  return (
    <nav className="bottom-nav">
      {tabs.map(t => <button key={t.id} onClick={() => onChange(t.id)} className={t.id === active ? "active" : ""}><Icon name={t.icon} /><span>{t.label}</span></button>)}
    </nav>
  );
}

function HiddenHistoryReport({ orders, settings }) {
  const totalRev = orders.reduce((s, o) => s + o.amount, 0);
  return (
    <div className="print-only">
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h2 style={{ textAlign: 'center' }}>{settings.storeName} - Sales Report</h2>
        <p style={{ textAlign: 'center' }}>Generated: {new Date().toLocaleString()}</p>
        <hr />
        <p>Total Orders: {orders.length}</p>
        <p>Total Revenue: {money(totalRev, settings)}</p>
        <hr />
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr><th style={{ borderBottom: '1px solid #ccc' }}>Date</th><th style={{ borderBottom: '1px solid #ccc' }}>Order ID</th><th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Total</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ padding: '4px 0', borderBottom: '1px dashed #eee' }}>{new Date(o.at).toLocaleString()}</td>
                <td style={{ padding: '4px 0', borderBottom: '1px dashed #eee' }}>{o.id}</td>
                <td style={{ padding: '4px 0', borderBottom: '1px dashed #eee', textAlign: 'right' }}>{money(o.amount, settings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HiddenReceipt({ order, settings }) {
  if (!order) return null;
  return (
    <div id="receipt-print" className="print-only">
      <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
        <h2>{settings.storeName}</h2>
        <p>Date: {new Date(order.at).toLocaleString()}</p>
        <hr />
        <p>Order ID: {order.id}</p>
        {order.customer?.name && <p>Customer: {order.customer.name}</p>}
        {order.customer?.mobile && <p>Phone: {order.customer.mobile}</p>}
        <hr />
        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
          {order.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>{item.qty}x {item.name}</span>
              <span>{money(item.total, settings)}</span>
            </div>
          ))}
        </div>
        <hr />
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total: {money(order.amount, settings)}</p>
        <p>Method: {order.method.toUpperCase()}</p>
        <hr />
        <p>Thank you for shopping!</p>
      </div>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState(() => {
    let saved = JSON.parse(localStorage.getItem('posProducts'));
    if (saved) {
      return saved.map(p => ({
        ...p,
        stock: typeof p.stock === 'number' ? p.stock : 50,
        image: p.image && (p.image.includes('unsplash.com') || p.image.includes('http')) ? 'linear-gradient(135deg, #1e293b, #334155)' : p.image
      }));
    }
    return PRODUCTS;
  });
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('posUser')) || null);
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('posSettings')) || { storeName: 'Mart POS', currency: 'Rs' });
  const [cashierCreds, setCashierCreds] = useState(() => JSON.parse(localStorage.getItem('posCashierCreds')) || { email: 'cashier@mart.com', password: 'password123' });
  const [activeTab, setActiveTab] = useState("sell");
  const [sellStage, setSellStage] = useState("catalog");
  const [moreStage, setMoreStage] = useState("menu");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState("cart");
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('posOrders')) || INITIAL_ORDERS);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('posCart')) || {});
  const [productModal, setProductModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', mobile: '' });
  const [printTarget, setPrintTarget] = useState("receipt");

  useEffect(() => { localStorage.setItem('posCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('posOrders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('posUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('posProducts', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('posSettings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('posCashierCreds', JSON.stringify(cashierCreds)); }, [cashierCreds]);

  const handleLogin = (u) => { setCurrentUser(u); setActiveTab("sell"); setMoreStage("menu"); setSellStage("catalog"); };
  const handleLogout = () => { setCurrentUser(null); setActiveTab("sell"); setMoreStage("menu"); setSellStage("catalog"); };
  const permittedTabs = useMemo(() => currentUser ? TABS.filter(t => currentUser.role === 'admin' || ['sell', 'history', 'more'].includes(t.id)) : [], [currentUser]);
  const filteredProducts = useMemo(() => products.filter(p => (activeCategory === "All Products" || p.category === activeCategory) && p.name.toLowerCase().includes(query.toLowerCase())), [products, activeCategory, query]);
  const lines = useMemo(() => Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id === id);
    return p ? { ...p, qty, total: p.price * qty } : null;
  }).filter(Boolean), [cart, products]);
  const totalVal = lines.reduce((s, l) => s + l.total, 0);
  const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const handleScan = (code) => { 
    if (scannerTarget === "cart") { const p = products.find(x => x.id === code.trim()); if (p) addToCart(p.id); } 
    else { setLastScannedCode(code.trim()); }
    setScannerOpen(false); 
  };
  const handleRefundItem = (orderId, itemIndex) => {
    let priceToRefund = 0;
    let productNameToRefund = null;

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId || !o.items) return o;
      const itemToRefund = o.items[itemIndex];
      if (itemToRefund.qty > 0) {
        priceToRefund = itemToRefund.price || (itemToRefund.total / itemToRefund.qty);
        productNameToRefund = itemToRefund.name;
        
        const newItems = [...o.items];
        newItems[itemIndex] = { ...itemToRefund, qty: itemToRefund.qty - 1, total: itemToRefund.total - priceToRefund };
        return { ...o, items: newItems, amount: o.amount - priceToRefund };
      }
      return o;
    }));

    if (productNameToRefund) {
        setProducts(currProds => currProds.map(p => (p.name === productNameToRefund) ? { ...p, stock: (p.stock || 0) + 1 } : p));
    }
  };

  const completePayment = () => {
    const orderLines = lines.map(l => ({ name: l.name, qty: l.qty, price: l.price, total: l.total }));
    const o = { id: Date.now(), at: new Date().toISOString(), when: "Just now", title: `Order #${orders.length + 1}`, amount: totalVal, method: paymentMethod, day: "today", items: orderLines, customer: customerInfo };
    setOrders(prev => [o, ...prev]);
    
    setProducts(prev => prev.map(p => {
      if (cart[p.id]) return { ...p, stock: Math.max(0, (p.stock || 0) - cart[p.id]) };
      return p;
    }));

    setCart({});
    setCustomerInfo({ name: '', mobile: '' });
    setCheckoutSuccess(true);
    setPrintTarget("receipt");
    setTimeout(() => {
      window.print();
    }, 100);
  };
  const changeTab = (t) => { setActiveTab(t); setSellStage("catalog"); setMoreStage("menu"); };
  if (!currentUser) return <LoginScreen onLogin={handleLogin} cashierCreds={cashierCreds} settings={settings} />;
  return (
    <div className="app-shell">
      <main className="desktop-frame">
        {activeTab === "sell" && sellStage === "catalog" && <SellScreen products={filteredProducts} cartCount={cart} cartTotal={totalVal} query={query} onQueryChange={setQuery} activeCategory={activeCategory} onCategory={setActiveCategory} onAdd={addToCart} onOpenCheckout={() => { setCheckoutSuccess(false); setSellStage("checkout"); }} onToggleScanner={() => { setScannerTarget("cart"); setScannerOpen(true); }} user={currentUser} onLogout={handleLogout} settings={settings} />}
        {activeTab === "sell" && sellStage === "checkout" && <CheckoutScreen lines={lines} subtotal={totalVal} total={totalVal} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} customer={customerInfo} setCustomer={setCustomerInfo} onIncrement={addToCart} onDecrement={(id) => setCart(c => { const n = { ...c }; n[id] = Math.max(0, (n[id] || 0) - 1); if (n[id] === 0) delete n[id]; return n; })} onComplete={completePayment} onBack={() => setSellStage("catalog")} success={checkoutSuccess} user={currentUser} onLogout={handleLogout} settings={settings} />}
        {activeTab === "history" && <HistoryScreen orders={orders} user={currentUser} onLogout={handleLogout} settings={settings} onPrint={() => { setPrintTarget("history"); setTimeout(() => window.print(), 100); }} onRefund={handleRefundItem} />}
        {activeTab === "inventory" && <InventoryScreen user={currentUser} onLogout={handleLogout} inventory={products} onAddProduct={(existingId) => { 
          if (typeof existingId === 'string') {
            setLastScannedCode(existingId);
          } else {
            setLastScannedCode(null);
          }
          setProductModal(true); 
        }} settings={settings} />}
        {activeTab === "more" && (
          moreStage === "menu" ? <MoreScreen user={currentUser} onLogout={handleLogout} onOpenReports={() => setMoreStage("reports")} onOpenSettings={() => setMoreStage("settings")} settings={settings} /> :
          moreStage === "reports" ? <ReportsScreen orders={orders} user={currentUser} onLogout={handleLogout} onBack={() => setMoreStage("menu")} settings={settings} /> :
          moreStage === "settings" ? <SettingsScreen user={currentUser} settings={settings} onSave={setSettings} onBack={() => setMoreStage("menu")} onLogout={handleLogout} cashierCreds={cashierCreds} onUpdateCashier={setCashierCreds} /> : null
        )}
        {(activeTab !== "sell" || sellStage !== "checkout") && <BottomNav active={activeTab} onChange={changeTab} tabs={permittedTabs} />}
      </main>
      <ScannerModal isOpen={scannerOpen} onScan={handleScan} onClose={() => setScannerOpen(false)} />
      <ProductModal isOpen={productModal} onClose={() => setProductModal(false)} onSave={(p) => { 
        setProducts(prev => {
          const index = prev.findIndex(prod => prod.id === p.id);
          if (index !== -1) {
            const newProds = [...prev];
            newProds[index] = { ...p, stock: (prev[index].stock || 0) + p.stock }; 
            return newProds;
          }
          return [...prev, p];
        }); 
      }} onScanTrigger={() => { setScannerTarget("product"); setScannerOpen(true); }} lastScanned={lastScannedCode} existingProducts={products} />
      {printTarget === "receipt" && <HiddenReceipt order={orders[0]} settings={settings} />}
      {printTarget === "history" && <HiddenHistoryReport orders={orders} settings={settings} />}
    </div>
  );
}
