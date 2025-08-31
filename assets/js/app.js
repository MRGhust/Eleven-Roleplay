
/* ====== Config & State ====== */
const THEME_KEY = 'er_theme';
const AUTH_KEY = 'er_auth';
const CART_KEY = 'er_cart';

/* Products catalog (shared across pages) */
const ER_PRODUCTS = [
  {id:'p1', name:'پکیج استارتر', price:50000, img:'https://placehold.co/600x400/427c77/ffffff?text=Starter+Pack', thumb:'https://placehold.co/80x80/427c77/ffffff?text=SP', desc:'شامل پول اولیه، یک ماشین معمولی و گواهینامه.'},
  {id:'p2', name:'اشتراک VIP (۱ ماهه)', price:150000, img:'https://placehold.co/600x400/5fb1a7/ffffff?text=VIP', thumb:'https://placehold.co/80x80/5fb1a7/ffffff?text=VIP', desc:'دسترسی به ماشین‌های خاص، اسکین‌های ویژه و اولویت در ورود.'},
  {id:'p3', name:'پکیج ماشین اسپرت', price:200000, img:'https://placehold.co/600x400/427c77/ffffff?text=Car+Pack', thumb:'https://placehold.co/80x80/427c77/ffffff?text=Car', desc:'یک ماشین اسپرت رده بالا به انتخاب شما.'},
  {id:'p4', name:'نام اختصاصی پلاک', price:80000, img:'https://placehold.co/600x400/2e5f5a/ffffff?text=Plate+Name', thumb:'https://placehold.co/80x80/2e5f5a/ffffff?text=PL', desc:'رزرو یک پلاک اختصاصی مطابق قوانین.'},
  {id:'p5', name:'خانه متوسط در شهر', price:350000, img:'https://placehold.co/600x400/375f5a/ffffff?text=House', thumb:'https://placehold.co/80x80/375f5a/ffffff?text=H', desc:'ملک مسکونی با پارکینگ (در صورت موجودی).'},
  {id:'p6', name:'درخواست انتقال نقش', price:30000, img:'https://placehold.co/600x400/6aaea4/ffffff?text=Role+Transfer', thumb:'https://placehold.co/80x80/6aaea4/ffffff?text=RT', desc:'انتقال نقش/شخصیت بین اکانت‌ها (قوانین انتقال اعمال می‌شود).'},
];

/* ====== Utilities ====== */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const isDark = () => document.documentElement.classList.contains('dark');

function formatPrice(num){ try { return num.toLocaleString('fa-IR') + ' تومان'; } catch { return num + ' تومان'; } }

/* ====== Theme ====== */
function setTheme(mode){
  document.documentElement.classList.toggle('dark', mode==='dark');
  localStorage.setItem(THEME_KEY, mode);
  const icon = $('#themeIcon'); const text = $('#themeText');
  if(icon) icon.textContent = (mode==='dark') ? '☀️' : '🌙';
  if(text) text.textContent = (mode==='dark') ? 'لایت' : 'دارک';
}
function initTheme(){
  const stored = localStorage.getItem(THEME_KEY);
  const preferred = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(preferred);
  const btn = $('#themeToggle');
  if(btn){
    btn.addEventListener('click', ()=> setTheme(isDark() ? 'light' : 'dark'));
  }
}

/* ====== Auth (mock) ====== */
function getAuth(){ try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; } }
function saveAuth(u, e){ localStorage.setItem(AUTH_KEY, JSON.stringify({u,e})); renderAuth(); }
function logout(){ localStorage.removeItem(AUTH_KEY); renderAuth(); }
function renderAuth(){
  const btn = $('#authBtn');
  if(!btn) return;
  const data = getAuth();
  if(data){
    btn.innerHTML = "<img src='assets/img/logo.png' alt='' class='h-5 w-5'/>" +
      "<span class='hidden xs:inline'> " + data.u + " </span>";
    btn.title = 'خروج از حساب';
    btn.onclick = logout;
  } else {
    btn.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' class='h-5 w-5'><path d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z'/><path fill-rule='evenodd' d='M3.75 20.1a8.25 8.25 0 1116.5 0 .9.9 0 01-.9.9H4.65a.9.9 0 01-.9-.9z' clip-rule='evenodd'/></svg><span class='hidden xs:inline'> ورود / ساخت حساب </span>";
    btn.title = 'ورود به حساب';
    btn.onclick = () => { window.location.href = 'login.html'; };
  }
}

/* ====== Cart ====== */
function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } }
function setCart(items){ localStorage.setItem(CART_KEY, JSON.stringify(items)); }
function addToCartById(id){
  const product = ER_PRODUCTS.find(p => p.id === id);
  if(!product) return;
  addToCart(product);
}
function addToCart(product){
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if(idx > -1){ cart[idx].quantity += 1; } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.thumb || product.img, quantity: 1 });
  }
  setCart(cart); pulseCartCount(); renderCartUI();
}
function changeQty(id, delta){
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if(idx === -1) return;
  cart[idx].quantity += delta;
  if(cart[idx].quantity <= 0) cart.splice(idx,1);
  setCart(cart); renderCartUI();
}
function cartTotals(){
  const cart = getCart();
  const totalItems = cart.reduce((s,i)=>s+i.quantity,0);
  const total = cart.reduce((s,i)=>s+i.quantity*i.price,0);
  return { totalItems, total };
}
function clearCart(){ setCart([]); renderCartUI(); }

/* ====== Cart UI (header badge + modal) ====== */
function pulseCartCount(){
  const badge = $('#cartCount'); if(!badge) return;
  badge.classList.add('scale-125'); setTimeout(()=> badge.classList.remove('scale-125'), 180);
}
function updateCartBadge(){
  const badge = $('#cartCount'); if(!badge) return;
  badge.textContent = cartTotals().totalItems;
}
function ensureCartModal(){
  if($('#cartModal')) return; // already present
  const modal = document.createElement('div');
  modal.id = 'cartModal';
  modal.className = 'modal modal-cart fixed inset-0 z-[70] hidden';
  modal.setAttribute('onclick', "toggleModal(this, false)");
  modal.innerHTML = `
    <div class="modal-backdrop absolute inset-0"></div>
    <div class="modal-content absolute inset-y-0 left-0 w-full max-w-md shadow-2xl p-6" style="background:var(--card-bg); border-right:1px solid var(--glass-br);" onclick="event.stopPropagation()">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-[color:var(--glass-br)]">
          <h2 class="text-2xl font-extrabold">سبد خرید</h2>
          <button class="rounded-lg p-2 hover:bg-white/60 dark:hover:bg-white/10" onclick="toggleModal(document.getElementById('cartModal'), false)" title="بستن">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
          </button>
        </div>
        <div id="cartItemsContainer" class="flex-grow overflow-y-auto -mr-2 pr-2"></div>
        <div id="cartFooter" class="pt-4 border-t border-[color:var(--glass-br)]"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}
function renderCartUI(){
  updateCartBadge();
  const cont = $('#cartItemsContainer');
  const foot = $('#cartFooter');
  if(!cont || !foot) return;
  const items = getCart();
  if(items.length === 0){
    cont.innerHTML = `
      <div class="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l.383-1.437M7.5 14.25L5.106 5.165A2.25 2.25 0 002.854 3H2.25" /></svg>
        <p class="font-bold">سبد خرید شما خالی است.</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">به <a class="underline" href="shop.html">فروشگاه</a> سر بزنید.</p>
      </div>`;
    foot.innerHTML = '';
    return;
  }
  cont.innerHTML = items.map(item => `
    <div class="cart-item flex items-center gap-4 py-3" data-product-id="${item.id}">
      <img src="${item.img}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
      <div class="flex-grow">
        <p class="font-bold">${item.name}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">${formatPrice(item.price)}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="changeQty('${item.id}', -1)" class="w-7 h-7 rounded-md flex items-center justify-center bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300 dark:hover:bg-slate-600">-</button>
        <span class="w-6 text-center font-bold">${item.quantity}</span>
        <button onclick="changeQty('${item.id}', 1)" class="w-7 h-7 rounded-md flex items-center justify-center bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300 dark:hover:bg-slate-600">+</button>
      </div>
    </div>
  `).join('');
  const totals = cartTotals();
  foot.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <span class="text-lg font-bold">جمع کل:</span>
      <span class="text-xl font-extrabold grad-text">${formatPrice(totals.total)}</span>
    </div>
    <button id="checkoutBtn" class="interactive-button w-full rounded-xl grad text-white py-3 font-bold hover:opacity-90 transition">پرداخت</button>
  `;
  $('#checkoutBtn')?.addEventListener('click', ()=>{
    const user = getAuth();
    if(!user){
      alert('برای پرداخت لطفاً ابتدا وارد شوید.');
      window.location.href = 'login.html';
      return;
    }
    const { totalItems, total } = cartTotals();
    alert(`پرداخت موفق! \nآیتم‌ها: ${totalItems}\nمبلغ: ${formatPrice(total)}\nرسید به ایمیل شما ارسال شد (نمایشی).`);
    clearCart();
    toggleModal($('#cartModal'), false);
  });
}

/* ====== Modals & Misc ====== */
function toggleModal(el, state){ if(!el) return; el.classList.toggle('hidden', !state); }
function copyIP(){
  const code = $('#serverIP'); if(!code) return;
  const ip = code.textContent.trim();
  navigator.clipboard.writeText(ip).then(()=>{
    const note = $('#copyNote'); if(note){ note.style.opacity = '1'; setTimeout(()=> note.style.opacity= '0', 1500); }
  });
}
function mountHeroCounters(){
  const oc = $('#onlineCount'); if(!oc) return;
  const base = 120; const jitter = ()=> Math.floor(base + Math.random()*20);
  setInterval(()=>{ oc.textContent = jitter(); }, 4000);
}

/* ====== Nav Active State ====== */
function markActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('#topnav a[data-nav]').forEach(a => {
    const match = a.getAttribute('data-nav');
    if((path === '' && match==='index.html') || path === match){
      a.classList.add('bg-white/60','dark:bg-white/10');
    }
  });
}

/* ====== Shop Page Builder ====== */
function buildShopGrid(){
  const grid = $('#shopGrid'); if(!grid) return;
  grid.innerHTML = ER_PRODUCTS.map(p => `
    <div class="rounded-2xl overflow-hidden brand-border" style="background:var(--card-bg); border:1px solid var(--glass-br); box-shadow:0 6px 20px rgba(0,0,0,.06)">
      <img src="${p.img}" alt="${p.name}" class="w-full h-48 object-cover">
      <div class="p-5">
        <p class="font-extrabold text-lg">${p.name}</p>
        <p class="text-slate-600 dark:text-slate-300 text-sm mt-1 mb-4">${p.desc}</p>
        <div class="flex items-center justify-between">
          <p class="font-bold text-lg grad-text">${formatPrice(p.price)}</p>
          <button data-add="${p.id}" class="interactive-button rounded-lg px-4 py-2 text-sm font-semibold" style="background:var(--brand); color:white;">خرید</button>
        </div>
      </div>
    </div>
  `).join('');
  // bind buttons
  $$('button[data-add]').forEach(btn => {
    btn.addEventListener('click', ()=> addToCartById(btn.getAttribute('data-add')));
  });
}

/* ====== DOM Ready ====== */
document.addEventListener('DOMContentLoaded', ()=>{
  // Year
  $$('#year').forEach(el => el.textContent = new Date().getFullYear());
  // Theme
  initTheme();
  // Auth
  renderAuth();
  // Cart modal injection + bind header cart button
  ensureCartModal();
  renderCartUI();
  $('#cartBtn')?.addEventListener('click', ()=> toggleModal($('#cartModal'), true));
  // Utilities
  markActiveNav();
  mountHeroCounters();
  // Shop grid (if present)
  buildShopGrid();

  // Intersection observer for animated cards
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, {threshold: .1});
  $$('.animated-card').forEach(c => observer.observe(c));
});

/* ====== Login page handler ====== */
function handleLoginSubmit(e){
  e.preventDefault();
  const u = $('#username')?.value.trim();
  const em = $('#email')?.value.trim();
  const err = $('#authError');
  if(!u || !em){
    if(err){ err.textContent = 'نام کاربری و ایمیل را وارد کنید.'; err.classList.remove('hidden'); }
    return;
  }
  if(err) err.classList.add('hidden');
  saveAuth(u, em);
  window.location.href = 'index.html';
}
