// ═══════════════════════════════════════════════════════════
// MENUPLANNER v1.1 - APPLICATION ENGINE (Bug-fixed)
// ═══════════════════════════════════════════════════════════

// --- Constants & Database Templates ---
const DEFAULT_USERS = [
  { id: 'admin', name: 'Admin', role: 'admin', pass: 'admin123' },
  { id: 'editor', name: 'Editor', role: 'editor', pass: 'editor123' },
  { id: 'viewer', name: 'Viewer', role: 'viewer', pass: 'viewer123' }
];

const CATEGORIES = {
  breakfast_main: 'Breakfast Mains',
  rice_main: 'Rice & Lunch Mains',
  curries: 'Curries (Main/Protein)',
  dry_thoran: 'Dry Items & Thorans',
  vegetables: 'Vegetables',
  snacks: 'Snacks',
  salad_fruits: 'Salads & Fruits',
  addons: 'Add-ons'
};

const DEFAULT_DISHES = [
  // Breakfast Mains
  { name: 'Idiyappam', cat: 'breakfast_main' },
  { name: 'Vellayappam', cat: 'breakfast_main' },
  { name: 'Puttu', cat: 'breakfast_main' },
  { name: 'Upuma', cat: 'breakfast_main' },
  { name: 'Kozhukatta', cat: 'breakfast_main' },
  { name: 'Dosa', cat: 'breakfast_main' },
  { name: 'Poori', cat: 'breakfast_main' },
  { name: 'Chapathi', cat: 'breakfast_main' },
  { name: 'Rava Idli', cat: 'breakfast_main' },
  { name: 'Appam', cat: 'breakfast_main' },
  { name: 'Rava Dosa', cat: 'breakfast_main' },

  // Rice / Lunch Mains
  { name: 'Lemon Rice', cat: 'rice_main' },
  { name: 'Pulav', cat: 'rice_main' },
  { name: 'Boiled Rice', cat: 'rice_main' },
  { name: 'Ghee Rice', cat: 'rice_main' },
  { name: 'Puliyogare', cat: 'rice_main' },
  { name: 'Tomato Rice', cat: 'rice_main' },
  { name: 'Curd Rice', cat: 'rice_main' },
  { name: 'Kanji', cat: 'rice_main' },
  { name: 'Soya Bean Pulav', cat: 'rice_main' },
  { name: 'Biriyani', cat: 'rice_main' },

  // Curries
  { name: 'Kadala Curry', cat: 'curries' },
  { name: 'Channa Curry', cat: 'curries' },
  { name: 'Green Peas Curry', cat: 'curries' },
  { name: 'Dal Spinach Curry', cat: 'curries' },
  { name: 'Dal Curry', cat: 'curries' },
  { name: 'Chicken Curry', cat: 'curries' },
  { name: 'Chicken Perattu', cat: 'curries' },
  { name: 'Beef Curry', cat: 'curries' },
  { name: 'Fish Curry', cat: 'curries' },
  { name: 'Cheru Payar Curry', cat: 'curries' },
  { name: 'Multi grain Kootu Curry', cat: 'curries' },
  { name: 'Kadala Soya chunks perattu', cat: 'curries' },
  { name: 'Paneer Curry', cat: 'curries' },
  { name: 'Sambar', cat: 'curries' },
  { name: 'Van Payar Curry', cat: 'curries' },

  // Dry Items / Thorans
  { name: 'Beef Fry', cat: 'dry_thoran' },
  { name: 'Chicken Fry', cat: 'dry_thoran' },
  { name: 'Van Payar Thoran', cat: 'dry_thoran' },
  { name: 'Cheru Payar Thoran', cat: 'dry_thoran' },
  { name: 'Fish Fry', cat: 'dry_thoran' },

  // Vegetables
  { name: 'Kovakkai Fry', cat: 'vegetables' },
  { name: 'Cow peas Masala', cat: 'vegetables' },
  { name: 'Cabbage + Carrot Thoran', cat: 'vegetables' },
  { name: 'Beetroot Thoran', cat: 'vegetables' },
  { name: 'Beans Thoran', cat: 'vegetables' },
  { name: 'Carrot Stir Fry', cat: 'vegetables' },

  // Snacks
  { name: 'Pazham Pori', cat: 'snacks' },
  { name: 'Unniyappam', cat: 'snacks' },
  { name: 'Neyyappam', cat: 'snacks' },
  { name: 'Ela Ada', cat: 'snacks' },
  { name: 'Samosa', cat: 'snacks' },
  { name: 'Cutlet', cat: 'snacks' },
  { name: 'Steamed Banana', cat: 'snacks' },
  { name: 'Vada', cat: 'snacks' },

  // Salads & Fruits
  { name: 'Cucumber Salad', cat: 'salad_fruits' },
  { name: 'Green Salad', cat: 'salad_fruits' },
  { name: 'Fruit Salad', cat: 'salad_fruits' },
  { name: 'Banana', cat: 'salad_fruits' },
  { name: 'Apple', cat: 'salad_fruits' },
  { name: 'Orange', cat: 'salad_fruits' },
  { name: 'Grapes', cat: 'salad_fruits' },
  { name: 'Papaya', cat: 'salad_fruits' },
  { name: 'Mango', cat: 'salad_fruits' },
  { name: 'Watermelon', cat: 'salad_fruits' },

  // Add-ons
  { name: 'Pappadam', cat: 'addons' },
  { name: 'Pickle', cat: 'addons' },
  { name: 'Chammanthi', cat: 'addons' },
  { name: 'Raita', cat: 'addons' },
  { name: 'Ghee', cat: 'addons' },
  { name: 'Curd', cat: 'addons' },
  { name: 'Egg (Omelette)', cat: 'addons' },
  { name: 'Egg (Boiled)', cat: 'addons' },
  { name: 'Buttermilk', cat: 'addons' }
];

// Smart ingredient mapping for automatic shopping list generation
const DISH_INGREDIENTS = {
  'Idiyappam': ['Rice Flour', 'Grated Coconut'],
  'Vellayappam': ['Raw Rice', 'Grated Coconut', 'Yeast', 'Sugar'],
  'Puttu': ['Rice Flour / Wheat Flour', 'Grated Coconut'],
  'Upuma': ['Rava (Semolina)', 'Onion', 'Ginger', 'Green Chilies', 'Mustard Seeds'],
  'Kozhukatta': ['Rice Flour', 'Grated Coconut', 'Jaggery', 'Cardamom'],
  'Dosa': ['Dosa Batter', 'Coconut Chutney ingredients', 'Ghee'],
  'Poori': ['Wheat Flour', 'Potatoes', 'Onion', 'Oil'],
  'Chapathi': ['Wheat Flour', 'Oil'],
  'Rava Idli': ['Rava', 'Curd', 'Carrot', 'Coriander Leaves'],
  'Appam': ['Raw Rice', 'Grated Coconut', 'Yeast', 'Sugar'],
  'Rava Dosa': ['Rava', 'Maida', 'Rice Flour', 'Onion', 'Green Chilies'],

  'Lemon Rice': ['Boiled Rice', 'Lemon', 'Peanuts', 'Mustard Seeds', 'Turmeric'],
  'Pulav': ['Basmati Rice', 'Carrot', 'Beans', 'Green Peas', 'Ghee', 'Spices'],
  'Boiled Rice': ['Kerala Matta Rice'],
  'Ghee Rice': ['Kaima/Jeerakasala Rice', 'Ghee', 'Cashew Nuts', 'Raisins', 'Onion'],
  'Puliyogare': ['Boiled Rice', 'Tamarind Paste', 'Peanuts', 'Spice Mix'],
  'Tomato Rice': ['Boiled Rice', 'Tomatoes', 'Onion', 'Ginger-Garlic', 'Green Chilies'],
  'Curd Rice': ['Boiled Rice', 'Curd (Yogurt)', 'Milk', 'Ginger', 'Mustard Seeds'],
  'Kanji': ['Broken Rice', 'Green Gram (Cheru payar)'],
  'Soya Bean Pulav': ['Basmati Rice', 'Soya Chunks', 'Onion', 'Spices'],
  'Biriyani': ['Basmati Rice/Kaima Rice', 'Chicken/Beef/Egg/Veg', 'Onion', 'Tomato', 'Ghee', 'Mint/Coriander', 'Biriyani Masala'],

  'Kadala Curry': ['Black Chickpeas (Kadala)', 'Grated Coconut', 'Onion', 'Ginger-Garlic', 'Chili-Coriander-Turmeric Powder'],
  'Channa Curry': ['White Chickpeas (Channa)', 'Onion', 'Tomato', 'Ginger-Garlic paste', 'Chana Masala'],
  'Green Peas Curry': ['Dry/Fresh Green Peas', 'Onion', 'Tomato', 'Coconut Milk'],
  'Dal Spinach Curry': ['Toor Dal / Masoor Dal', 'Spinach (Cheera)', 'Garlic', 'Shallots'],
  'Dal Curry': ['Toor Dal', 'Shallots', 'Garlic', 'Green Chilies', 'Coconut oil'],
  'Chicken Curry': ['Chicken', 'Onion', 'Tomato', 'Ginger-Garlic', 'Kerala Spices', 'Coconut slices'],
  'Chicken Perattu': ['Chicken', 'Shallots', 'Ginger-Garlic', 'Curry Leaves', 'Crushed Black Pepper'],
  'Beef Curry': ['Beef', 'Onion', 'Coconut slices', 'Ginger-Garlic', 'Meat Masala', 'Curry Leaves'],
  'Fish Curry': ['Fish', 'Kudampuli (Garcinia)', 'Shallots', 'Ginger', 'Coconut Milk/Paste', 'Chili Powder'],
  'Cheru Payar Curry': ['Green Gram (Cheru payar)', 'Grated Coconut', 'Shallots', 'Garlic', 'Cumin'],
  'Multi grain Kootu Curry': ['Mixed Lentils/Grains', 'Yam/Raw Banana', 'Grated Coconut', 'Black Chickpeas'],
  'Kadala Soya chunks perattu': ['Black Chickpeas', 'Soya Chunks', 'Onion', 'Spices', 'Coconut Oil'],
  'Paneer Curry': ['Paneer', 'Onion', 'Tomato', 'Cream', 'Spices'],
  'Sambar': ['Toor Dal', 'Sambar Vegetables (Muringakka, Vellarikka, Carrot)', 'Tamarind', 'Sambar Powder', 'Asafoetida'],
  'Van Payar Curry': ['Red Cowpeas (Van payar)', 'Grated Coconut', 'Shallots', 'Garlic', 'Coconut Oil'],

  'Beef Fry': ['Beef', 'Coconut Slices (Thenga kothu)', 'Fennel Seeds', 'Garlic', 'Curry Leaves', 'Coconut Oil'],
  'Chicken Fry': ['Chicken', 'Ginger-Garlic paste', 'Chili-Turmeric-Garam Masala', 'Coconut Oil'],
  'Van Payar Thoran': ['Red Cowpeas (Van payar)', 'Grated Coconut', 'Shallots', 'Garlic', 'Green Chilies'],
  'Cheru Payar Thoran': ['Green Gram (Cheru payar)', 'Grated Coconut', 'Shallots', 'Garlic'],
  'Fish Fry': ['Fish', 'Chili Powder', 'Turmeric', 'Coconut Oil'],

  'Kovakkai Fry': ['Ivy Gourd (Kovakkai)', 'Shallots', 'Chili flakes', 'Coconut Oil'],
  'Cow peas Masala': ['Cow peas (Lobia)', 'Onion', 'Tomato', 'Spices'],
  'Cabbage + Carrot Thoran': ['Cabbage', 'Carrot', 'Grated Coconut', 'Shallots', 'Green Chilies', 'Mustard Seeds'],
  'Beetroot Thoran': ['Beetroot', 'Grated Coconut', 'Shallots', 'Mustard Seeds'],
  'Beans Thoran': ['Beans', 'Grated Coconut', 'Shallots', 'Green Chilies', 'Curry Leaves'],
  'Carrot Stir Fry': ['Carrot', 'Onion', 'Mustard Seeds', 'Coconut Oil'],

  'Pazham Pori': ['Ripe Banana (Ethapazham)', 'Maida (All-purpose flour)', 'Rice Flour', 'Sugar', 'Turmeric'],
  'Unniyappam': ['Rice Flour', 'Ripe Banana', 'Jaggery', 'Coconut Slices', 'Cardamom', 'Ghee'],
  'Neyyappam': ['Rice Flour', 'Jaggery', 'Cardamom', 'Ghee/Oil'],
  'Ela Ada': ['Rice Flour', 'Jaggery', 'Grated Coconut', 'Banana Leaves'],
  'Samosa': ['Maida', 'Potatoes/Onion/Meat', 'Oil'],
  'Cutlet': ['Potatoes', 'Fish/Meat/Veg', 'Onion', 'Breadcrumbs', 'Egg (for dipping)'],
  'Steamed Banana': ['Ripe Banana (Ethapazham)'],
  'Vada': ['Urad Dal', 'Onion', 'Green Chilies', 'Ginger', 'Curry Leaves'],

  'Cucumber Salad': ['Cucumber', 'Onion', 'Green Chili', 'Lemon Juice'],
  'Green Salad': ['Cucumber', 'Tomato', 'Onion', 'Carrot', 'Lemon'],
  'Fruit Salad': ['Mixed Fruits (Apple, Banana, Papaya, Grapes)', 'Milk/Custard']
};

const SLOT_MAPPINGS = {
  'breakfast': {
    'main': { label: 'Main Item', cat: 'breakfast_main', shop: [] },
    'curry': { label: 'Curry', cat: 'curries', shop: [] },
    'protein': { label: 'Protein', cat: 'addons', shop: [] },
    'addon': { label: 'Add-on', cat: 'addons', shop: [] }
  },
  'kidsnacks': {
    'main': { label: 'Main Item', cat: 'snacks', shop: [] },
    'salad': { label: 'Salad', cat: 'salad_fruits', shop: [] },
    'fruits': { label: 'Fruits', cat: 'salad_fruits', shop: [] },
    'vegetables': { label: 'Vegetables', cat: 'vegetables', shop: [] },
    'addon': { label: 'Add-on', cat: 'addons', shop: [] }
  },
  'brunch': {
    'fruits': { label: 'Fruits', cat: 'salad_fruits', shop: [] },
    'salad': { label: 'Salad', cat: 'salad_fruits', shop: [] },
    'egg': { label: 'Egg', cat: 'addons', shop: [] },
    'veggies': { label: 'Veggies', cat: 'vegetables', shop: [] },
    'addon': { label: 'Add-on', cat: 'addons', shop: [] }
  },
  'lunch': {
    'main': { label: 'Main Item', cat: 'rice_main', shop: [] },
    'curry': { label: 'Curry', cat: 'curries', shop: [] },
    'veg': { label: 'Vegetable Dish', cat: 'vegetables', shop: [] },
    'curd': { label: 'Curd', cat: 'addons', shop: [] },
    'dry': { label: 'Dry Item', cat: 'dry_thoran', shop: [] },
    'addon1': { label: 'Add-on 1', cat: 'addons', shop: [] },
    'addon2': { label: 'Add-on 2', cat: 'addons', shop: [] }
  },
  'snacks': {
    'main': { label: 'Main Item', cat: 'snacks', shop: [] },
    'addon': { label: 'Add-on', cat: 'addons', shop: [] }
  },
  'dinner': {
    'main': { label: 'Main Course', cat: 'breakfast_main', shop: [] },
    'curd': { label: 'Curd', cat: 'addons', shop: [] },
    'curry': { label: 'Curry', cat: 'curries', shop: [] },
    'protein': { label: 'Protein', cat: 'dry_thoran', shop: [] },
    'addon1': { label: 'Add-on 1', cat: 'addons', shop: [] },
    'fruits': { label: 'Fruits', cat: 'salad_fruits', shop: [] }
  }
};

const MEAL_LABELS = {
  breakfast: '🌅 Morning Breakfast',
  kidsnacks: '🎒 Kids School Snack Box',
  brunch: '🥗 Mini Brunch Box',
  lunch: '🍱 Lunch Feast',
  snacks: '☕ Evening Snacks',
  dinner: '🌙 Dinner'
};

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

// --- Application State ---
let curUser = null;
let curWeekKey = '';
let clipboardDay = null;

let modalTarget = {
  dayIdx: null,
  mealKey: null,
  slotKey: null
};

// --- Utility: XSS-safe text escaping ---
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Storage Helper Utilities ---
function getStorage(key, defaultVal) {
  try {
    const v = localStorage.getItem('mp_' + key);
    return v ? JSON.parse(v) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem('mp_' + key, JSON.stringify(val));
  } catch (e) {
    toast('⚠️ Storage error. Data may not be saved.');
    console.error('localStorage write failed:', e);
  }
}

// --- Week computation helpers ---
function getWeekDetails(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 7) % 7;
  target.setDate(target.getDate() - dayNr);

  const startOfYear = new Date(target.getFullYear(), 0, 1);
  const startDay = (startOfYear.getDay() + 7) % 7;
  startOfYear.setDate(startOfYear.getDate() - startDay);

  const diff = target - startOfYear;
  const weekNumber = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;

  return {
    year: target.getFullYear(),
    week: weekNumber,
    startDate: target
  };
}

function getWeekKey(date) {
  const info = getWeekDetails(date);
  return `${info.year}-W${String(info.week).padStart(2, '0')}`;
}

function getDatesForWeek(weekKey) {
  const parts = weekKey.split('-W');
  const year = parseInt(parts[0]);
  const week = parseInt(parts[1]);

  const firstJan = new Date(year, 0, 1);
  const startDay = (firstJan.getDay() + 7) % 7;
  const firstSunday = new Date(year, 0, 1 - startDay);

  const weekStart = new Date(firstSunday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart.getTime());
    dayDate.setDate(weekStart.getDate() + i);
    dates.push(dayDate);
  }
  return dates;
}

function formatDateDisplay(d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// --- Notifications ---
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// --- Dialog Boxes (Confirm Modal) ---
let confirmCallback = null;

function showConfirm(title, message, callback) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmModal').classList.add('show');
  confirmCallback = callback;
}

function closeConfirmModal() {
  document.getElementById('confirmModal').classList.remove('show');
  confirmCallback = null;
}

// --- Page Navigator ---
function showPage(id, btn) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(id);
  if (targetPage) targetPage.classList.add('active');

  document.querySelectorAll('.bnav button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (id === 'pgPlanner') refreshPlanner();
  if (id === 'pgDatabase') refreshDbPage();
  if (id === 'pgShopping') refreshShoppingPage();
  if (id === 'pgPantry') refreshPantryPage();
  if (id === 'pgSettings') refreshSettingsPage();
}

// --- Auth Operations ---
function login() {
  const userInput = document.getElementById('loginUser');
  const passInput = document.getElementById('loginPass');
  const u = userInput.value.trim().toLowerCase();
  const p = passInput.value;

  if (!u || !p) {
    toast('⚠️ Please enter username and password');
    return;
  }

  const users = getStorage('users', DEFAULT_USERS);
  const user = users.find(x => x.id === u);

  if (user && user.pass === p) {
    curUser = user;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appHeader').style.display = 'block';
    document.getElementById('appContent').style.display = 'block';
    document.getElementById('bnav').style.display = 'flex';
    document.getElementById('userName').textContent = esc(user.name);

    // Toggle sync visibility if configured
    const settings = getStorage('sync_settings', {});
    if (settings.pat) {
      document.getElementById('headerSyncBtn').style.display = 'flex';
    }

    // Set initial week to current week
    curWeekKey = getWeekKey(new Date());

    // Show planner page and set active nav button
    document.querySelectorAll('.bnav button').forEach(b => b.classList.remove('active'));
    document.querySelector('.bnav button').classList.add('active');

    initPlanner();
    toast(`👋 Welcome, ${esc(user.name)}!`);
  } else {
    toast('❌ Invalid Username or Password');
    // Shake animation on login box
    const loginBox = document.querySelector('.login-box');
    loginBox.classList.add('shake');
    setTimeout(() => loginBox.classList.remove('shake'), 500);
  }
}

function logout() {
  curUser = null;
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appHeader').style.display = 'none';
  document.getElementById('appContent').style.display = 'none';
  document.getElementById('bnav').style.display = 'none';
  // Clear password field on logout
  document.getElementById('loginPass').value = '';
}

// --- Dish Database Management ---
function getDbDishes() {
  return getStorage('dishes', DEFAULT_DISHES);
}

function saveDbDishes(dishes) {
  setStorage('dishes', dishes);
  triggerAutoSync();
}

function resetDbToDefault() {
  showConfirm('Reset Database', 'Are you sure you want to reset all custom dishes and reload defaults?', () => {
    saveDbDishes(DEFAULT_DISHES);
    refreshDbPage();
    toast('🔄 Database reset to defaults');
  });
}

function refreshDbPage() {
  const filterDiv = document.getElementById('dbCatFilter');
  if (!filterDiv) return;
  const currentActive = filterDiv.querySelector('.catb.active')?.dataset?.cat || 'all';

  filterDiv.innerHTML = '<div class="catb active" data-cat="all" onclick="filterDbCat(\'all\', this)">All Items</div>';
  for (const [key, label] of Object.entries(CATEGORIES)) {
    filterDiv.innerHTML += `<div class="catb" data-cat="${esc(key)}" onclick="filterDbCat('${esc(key)}', this)">${esc(label)}</div>`;
  }

  // Restore active state
  const activeBtn = filterDiv.querySelector(`[data-cat="${currentActive}"]`);
  if (activeBtn) {
    filterDiv.querySelectorAll('.catb').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  // Populate New Dish category select
  const select = document.getElementById('dbNewCat');
  if (select) {
    select.innerHTML = '';
    for (const [key, label] of Object.entries(CATEGORIES)) {
      select.innerHTML += `<option value="${esc(key)}">${esc(label)}</option>`;
    }
  }

  // Only Admin/Editor can write
  const writeArea = document.getElementById('dbAddContainer');
  const resetBtn = document.getElementById('dbResetDefaultBtn');
  if (curUser && curUser.role === 'viewer') {
    if (writeArea) writeArea.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
  } else {
    if (writeArea) writeArea.style.display = 'block';
    if (resetBtn) resetBtn.style.display = 'inline-flex';
  }

  refreshDbList();
}

function filterDbCat(cat, btn) {
  document.querySelectorAll('#dbCatFilter .catb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  refreshDbList();
}

function refreshDbList() {
  const dishes = getDbDishes();
  const searchEl = document.getElementById('dbSearch');
  const search = searchEl ? searchEl.value.toLowerCase() : '';
  const activeCatEl = document.querySelector('#dbCatFilter .catb.active');
  const filterCat = activeCatEl ? activeCatEl.dataset.cat : 'all';

  const listUl = document.getElementById('dbList');
  if (!listUl) return;
  listUl.innerHTML = '';

  let count = 0;
  dishes.forEach((d, idx) => {
    const matchesSearch = d.name.toLowerCase().includes(search);
    const matchesCat = filterCat === 'all' || d.cat === filterCat;

    if (matchesSearch && matchesCat) {
      count++;
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="dish-info">
          <span class="dish-name-txt">${esc(d.name)}</span>
          <span class="dish-cat-tag">${esc(CATEGORIES[d.cat] || d.cat)}</span>
        </div>
      `;

      if (curUser && curUser.role !== 'viewer') {
        const delBtn = document.createElement('button');
        delBtn.className = 'dish-del-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.onclick = () => deleteDish(idx);
        li.appendChild(delBtn);
      }

      listUl.appendChild(li);
    }
  });

  const countEl = document.getElementById('dbCount');
  if (countEl) countEl.textContent = count;
}

function addNewDish() {
  const nameEl = document.getElementById('dbNewName');
  const catEl = document.getElementById('dbNewCat');
  const name = nameEl ? nameEl.value.trim() : '';
  const cat = catEl ? catEl.value : '';

  if (!name) {
    toast('⚠️ Enter a valid dish name');
    return;
  }

  const dishes = getDbDishes();
  if (dishes.find(x => x.name.toLowerCase() === name.toLowerCase())) {
    toast('⚠️ Dish already exists in template');
    return;
  }

  dishes.push({ name, cat });
  saveDbDishes(dishes);
  if (nameEl) nameEl.value = '';
  refreshDbList();
  toast('✅ Dish added successfully');
}

function deleteDish(idx) {
  showConfirm('Delete Dish', 'Are you sure you want to delete this dish from the database templates?', () => {
    const dishes = getDbDishes();
    if (idx >= 0 && idx < dishes.length) {
      dishes.splice(idx, 1);
      saveDbDishes(dishes);
      refreshDbList();
      toast('🗑️ Dish removed from templates');
    }
  });
}

// --- Weekly Planner ---
function initPlanner() {
  refreshPlanner();
}

function changeWeek(delta) {
  const dates = getDatesForWeek(curWeekKey);
  const sunday = new Date(dates[0].getTime());
  sunday.setDate(sunday.getDate() + delta * 7);
  curWeekKey = getWeekKey(sunday);
  refreshPlanner();
}

function getWeekData(weekKey) {
  const allWeeks = getStorage('weekly_plans', {});
  if (!allWeeks[weekKey]) {
    const dates = getDatesForWeek(weekKey);
    allWeeks[weekKey] = DAYS_OF_WEEK.map((name, idx) => ({
      dayName: name,
      date: dates[idx].toISOString().split('T')[0],
      meals: {
        breakfast: { main: '', curry: '', protein: '', addon: '' },
        kidsnacks: { main: '', salad: '', fruits: '', vegetables: '', addon: '' },
        brunch: { fruits: '', salad: '', egg: '', veggies: '', addon: '' },
        lunch: { main: '', curry: '', veg: '', curd: '', dry: '', addon1: '', addon2: '' },
        snacks: { main: '', addon: '' },
        dinner: { main: '', curd: '', curry: '', protein: '', addon1: '', fruits: '' }
      }
    }));
    setStorage('weekly_plans', allWeeks);
  }
  return allWeeks[weekKey];
}

function saveWeekData(weekKey, data) {
  const allWeeks = getStorage('weekly_plans', {});
  allWeeks[weekKey] = data;
  setStorage('weekly_plans', allWeeks);
  triggerAutoSync();
}

function refreshPlanner() {
  const dates = getDatesForWeek(curWeekKey);
  const weekInfo = getWeekDetails(dates[0]);

  const weekTitleEl = document.getElementById('plannerWeekTitle');
  const weekDatesEl = document.getElementById('plannerWeekDates');
  if (weekTitleEl) weekTitleEl.textContent = `Week ${weekInfo.week}, ${weekInfo.year}`;
  if (weekDatesEl) weekDatesEl.textContent = `${formatDateDisplay(dates[0])} — ${formatDateDisplay(dates[6])}`;

  const weekData = getWeekData(curWeekKey);
  const container = document.getElementById('plannerDaysList');
  if (!container) return;

  // Track expanded states before redraw
  const expandedDays = {};
  container.querySelectorAll('.day-card').forEach((card, idx) => {
    expandedDays[idx] = card.classList.contains('expanded');
  });

  container.innerHTML = '';

  // Check if today is within this week
  const todayStr = new Date().toISOString().split('T')[0];

  weekData.forEach((day, dayIdx) => {
    const dayDate = new Date(day.date + 'T00:00:00');
    const dateStr = formatDateDisplay(dayDate);
    const isToday = day.date === todayStr;

    // Count planned items
    let plannedCount = 0;
    let totalSlots = 0;
    const summaryItems = [];

    for (const [mealKey, meal] of Object.entries(day.meals)) {
      for (const [slotKey, val] of Object.entries(meal)) {
        totalSlots++;
        if (val) {
          plannedCount++;
          if (slotKey === 'main' && summaryItems.length < 3) {
            summaryItems.push(val);
          }
        }
      }
    }

    const summaryText = summaryItems.length > 0
      ? summaryItems.join(' · ')
      : 'No dishes planned yet';

    // Auto-expand today, or preserve previous expanded state
    const shouldExpand = isToday || (expandedDays[dayIdx] === true);

    const card = document.createElement('div');
    card.className = `day-card${shouldExpand ? ' expanded' : ''}${isToday ? ' today' : ''}`;

    card.innerHTML = `
      <div class="day-hdr" onclick="toggleDayExpand(this)">
        <div class="day-title-box">
          <span class="day-name">${esc(day.dayName)}${isToday ? ' <span class="today-badge">TODAY</span>' : ''}</span>
          <span class="day-date">${esc(dateStr)}</span>
        </div>
        <div class="day-progress">${plannedCount}/${totalSlots}</div>
        <div class="day-hdr-actions" onclick="event.stopPropagation()">
          <button class="btn btn-o btn-s" onclick="copyDayPlan(${dayIdx})" title="Copy Day Menu">📋</button>
          <button class="btn btn-o btn-s paste-btn" id="pasteBtn_${dayIdx}" onclick="pasteDayPlan(${dayIdx})" title="Paste Day Menu" style="display: ${clipboardDay ? 'inline-flex' : 'none'}">📥</button>
          <button class="btn btn-no-outline btn-s" onclick="clearDayPlan(${dayIdx})" title="Clear Day Menu">🗑️</button>
        </div>
        <div class="day-chevron">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="day-body">
        <div class="meals-grid"></div>
      </div>
    `;

    const mealsGrid = card.querySelector('.meals-grid');

    for (const [mealKey, mealLabel] of Object.entries(MEAL_LABELS)) {
      const mealBox = document.createElement('div');
      mealBox.className = 'meal-box';
      mealBox.innerHTML = `
        <div class="meal-title-bar">
          <span class="meal-name">${mealLabel}</span>
        </div>
        <div class="meal-slots"></div>
      `;

      const slotsContainer = mealBox.querySelector('.meal-slots');
      const slotsConfig = SLOT_MAPPINGS[mealKey];

      for (const [slotKey, slotConfig] of Object.entries(slotsConfig)) {
        const plannedValue = day.meals[mealKey][slotKey];
        const isFilled = !!plannedValue;

        const slotEl = document.createElement('div');
        slotEl.className = `meal-slot${isFilled ? ' filled' : ''}`;
        slotEl.onclick = () => openSelectorModal(dayIdx, mealKey, slotKey);

        slotEl.innerHTML = `
          <span class="slot-label">${esc(slotConfig.label)}</span>
          <span class="slot-value${isFilled ? '' : ' empty'}">${isFilled ? esc(plannedValue) : 'Tap to select'}</span>
        `;

        slotsContainer.appendChild(slotEl);
      }

      mealsGrid.appendChild(mealBox);
    }

    container.appendChild(card);
  });

  // Hide action buttons if viewer role
  if (curUser && curUser.role === 'viewer') {
    document.querySelectorAll('.day-hdr-actions').forEach(el => el.style.display = 'none');
    const plannerActions = document.querySelector('.planner-actions');
    if (plannerActions) plannerActions.style.display = 'none';
  } else {
    document.querySelectorAll('.day-hdr-actions').forEach(el => el.style.display = 'flex');
    const plannerActions = document.querySelector('.planner-actions');
    if (plannerActions) plannerActions.style.display = 'flex';
  }

  // Update shopping page week title if visible
  const shopWeekEl = document.getElementById('shoppingWeekTitle');
  if (shopWeekEl) shopWeekEl.textContent = curWeekKey;
}

function toggleDayExpand(hdr) {
  const card = hdr.closest('.day-card');
  if (card) card.classList.toggle('expanded');
}

// Day level operations
function copyDayPlan(dayIdx) {
  const weekData = getWeekData(curWeekKey);
  clipboardDay = JSON.parse(JSON.stringify(weekData[dayIdx].meals));

  // Show paste buttons
  document.querySelectorAll('.paste-btn').forEach(btn => btn.style.display = 'inline-flex');
  toast(`📋 Copied menu plan for ${weekData[dayIdx].dayName}`);
}

function pasteDayPlan(dayIdx) {
  if (!clipboardDay) return;
  const weekData = getWeekData(curWeekKey);

  weekData[dayIdx].meals = JSON.parse(JSON.stringify(clipboardDay));
  saveWeekData(curWeekKey, weekData);
  refreshPlanner();
  toast(`📥 Pasted menu plan to ${weekData[dayIdx].dayName}`);
}

function clearDayPlan(dayIdx) {
  showConfirm('Clear Day Plan', `Reset all meal slots for ${DAYS_OF_WEEK[dayIdx]}?`, () => {
    const weekData = getWeekData(curWeekKey);
    const day = weekData[dayIdx];

    for (const mealKey in day.meals) {
      for (const slotKey in day.meals[mealKey]) {
        day.meals[mealKey][slotKey] = '';
      }
    }

    saveWeekData(curWeekKey, weekData);
    refreshPlanner();
    toast(`🗑️ Cleared menu plan for ${day.dayName}`);
  });
}

// Week level operations
function copyPreviousWeek() {
  const parts = curWeekKey.split('-W');
  const year = parseInt(parts[0]);
  const week = parseInt(parts[1]);

  let prevYear = year;
  let prevWeek = week - 1;
  if (prevWeek < 1) {
    prevYear -= 1;
    prevWeek = 52;
  }
  const prevWeekKey = `${prevYear}-W${String(prevWeek).padStart(2, '0')}`;

  const allWeeks = getStorage('weekly_plans', {});
  if (!allWeeks[prevWeekKey]) {
    toast('⚠️ No plan found for the previous week');
    return;
  }

  showConfirm('Copy Previous Week', 'This will overwrite your entire plan for the current week. Do you want to proceed?', () => {
    const curWeekData = getWeekData(curWeekKey);
    const prevWeekData = allWeeks[prevWeekKey];

    curWeekData.forEach((day, idx) => {
      if (prevWeekData[idx]) {
        day.meals = JSON.parse(JSON.stringify(prevWeekData[idx].meals));
      }
    });

    saveWeekData(curWeekKey, curWeekData);
    refreshPlanner();
    toast('📋 Copied menu plans from previous week');
  });
}

function autoGeneratePlan() {
  showConfirm('Auto-Generate Week Menu', 'Generate a random South Indian and Kerala meal plan for empty slots in this week?', () => {
    const weekData = getWeekData(curWeekKey);
    const dishes = getDbDishes();

    weekData.forEach(day => {
      for (const [mealKey, meal] of Object.entries(day.meals)) {
        const slotsConfig = SLOT_MAPPINGS[mealKey];
        for (const [slotKey, config] of Object.entries(slotsConfig)) {
          if (!meal[slotKey]) {
            const matches = dishes.filter(d => d.cat === config.cat);
            if (matches.length > 0) {
              const randomDish = matches[Math.floor(Math.random() * matches.length)];
              meal[slotKey] = randomDish.name;
            }
          }
        }
      }
    });

    saveWeekData(curWeekKey, weekData);
    refreshPlanner();
    toast('🎲 Auto-filled empty meal slots!');
  });
}

function clearCurrentWeek() {
  showConfirm('Clear Week Menu', 'Are you sure you want to empty ALL planned meal slots for the active week?', () => {
    const weekData = getWeekData(curWeekKey);
    weekData.forEach(day => {
      for (const mealKey in day.meals) {
        for (const slotKey in day.meals[mealKey]) {
          day.meals[mealKey][slotKey] = '';
        }
      }
    });
    saveWeekData(curWeekKey, weekData);
    refreshPlanner();
    toast('🗑️ Active week plan cleared');
  });
}

// --- Selector Modal Operations ---
function openSelectorModal(dayIdx, mealKey, slotKey) {
  if (curUser && curUser.role === 'viewer') return;

  modalTarget = { dayIdx, mealKey, slotKey };

  const slotConfig = SLOT_MAPPINGS[mealKey][slotKey];
  document.getElementById('modalTitle').textContent = `Select ${slotConfig.label}`;

  const searchInput = document.getElementById('modalSearch');
  const quickAddInput = document.getElementById('modalQuickAdd');
  if (searchInput) searchInput.value = '';
  if (quickAddInput) quickAddInput.value = '';

  // Show/Hide quick add based on role
  const quickAddArea = document.querySelector('.quick-add-container');
  if (quickAddArea) {
    quickAddArea.style.display = (curUser && curUser.role === 'viewer') ? 'none' : 'flex';
  }

  filterModalItems();
  document.getElementById('selectorModal').classList.add('show');

  // Focus search input for convenience
  setTimeout(() => { if (searchInput) searchInput.focus(); }, 200);
}

function closeSelectorModal() {
  document.getElementById('selectorModal').classList.remove('show');
}

function filterModalItems() {
  const searchEl = document.getElementById('modalSearch');
  const search = searchEl ? searchEl.value.toLowerCase() : '';

  if (!modalTarget.mealKey || !modalTarget.slotKey) return;
  const slotConfig = SLOT_MAPPINGS[modalTarget.mealKey][modalTarget.slotKey];
  if (!slotConfig) return;
  const targetCategory = slotConfig.cat;

  const dishes = getDbDishes();
  const filtered = dishes.filter(d => d.cat === targetCategory && d.name.toLowerCase().includes(search));

  const grid = document.getElementById('modalItemsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  // Clear slot option
  const clearBtn = document.createElement('div');
  clearBtn.className = 'modal-item-btn clear-slot-btn';
  clearBtn.textContent = '❌ Clear Slot';
  clearBtn.onclick = () => selectSlotValue('');
  grid.appendChild(clearBtn);

  // Active selected value
  const weekData = getWeekData(curWeekKey);
  const activeVal = weekData[modalTarget.dayIdx]?.meals[modalTarget.mealKey]?.[modalTarget.slotKey] || '';

  filtered.forEach(d => {
    const btn = document.createElement('div');
    btn.className = `modal-item-btn${d.name === activeVal ? ' selected' : ''}`;
    btn.textContent = d.name;
    btn.onclick = () => selectSlotValue(d.name);
    grid.appendChild(btn);
  });

  if (filtered.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'modal-empty-msg';
    emptyMsg.textContent = 'No matching dishes found. Use quick-add below to create one.';
    grid.appendChild(emptyMsg);
  }
}

function selectSlotValue(value) {
  const weekData = getWeekData(curWeekKey);
  if (weekData[modalTarget.dayIdx]) {
    weekData[modalTarget.dayIdx].meals[modalTarget.mealKey][modalTarget.slotKey] = value;
    saveWeekData(curWeekKey, weekData);
  }
  closeSelectorModal();
  refreshPlanner();
  toast(value ? `🍲 Planned: ${esc(value)}` : '🗑️ Slot cleared');
}

function addAndSelectCustomDish() {
  const quickAddEl = document.getElementById('modalQuickAdd');
  const rawName = quickAddEl ? quickAddEl.value.trim() : '';
  if (!rawName) {
    toast('⚠️ Enter a dish name');
    return;
  }

  const slotConfig = SLOT_MAPPINGS[modalTarget.mealKey][modalTarget.slotKey];
  const targetCategory = slotConfig.cat;
  const dishes = getDbDishes();

  let existing = dishes.find(x => x.name.toLowerCase() === rawName.toLowerCase());
  if (!existing) {
    dishes.push({ name: rawName, cat: targetCategory });
    saveDbDishes(dishes);
  }

  selectSlotValue(rawName);
}

// --- Shopping List ---
function getShoppingState(weekKey) {
  const allShop = getStorage('shopping_lists', {});
  if (!allShop[weekKey]) {
    allShop[weekKey] = {
      purchased: [],
      custom: []
    };
    setStorage('shopping_lists', allShop);
  }
  return allShop[weekKey];
}

function saveShoppingState(weekKey, state) {
  const allShop = getStorage('shopping_lists', {});
  allShop[weekKey] = state;
  setStorage('shopping_lists', allShop);
  triggerAutoSync();
}

function refreshShoppingPage() {
  const shopWeekEl = document.getElementById('shoppingWeekTitle');
  if (shopWeekEl) shopWeekEl.textContent = curWeekKey;

  const weekData = getWeekData(curWeekKey);
  const shopState = getShoppingState(curWeekKey);

  const ingredientsMap = {};

  weekData.forEach(day => {
    for (const [mealKey, meal] of Object.entries(day.meals)) {
      for (const [slotKey, val] of Object.entries(meal)) {
        if (!val) continue;

        let items = DISH_INGREDIENTS[val] || [];
        if (items.length === 0) {
          items = [val];
        }

        items.forEach(it => {
          ingredientsMap[it] = (ingredientsMap[it] || 0) + 1;
        });
      }
    }
  });

  const checklistContainer = document.getElementById('shoppingChecklist');
  if (!checklistContainer) return;
  checklistContainer.innerHTML = '';

  const autoItems = Object.entries(ingredientsMap).map(([name, qty]) => ({
    name,
    qty,
    custom: false,
    checked: shopState.purchased.includes(name)
  }));

  const customItems = shopState.custom.map(it => ({
    name: it.name,
    qty: 1,
    custom: true,
    checked: it.bought
  }));

  const allItems = [...autoItems, ...customItems];
  const activeItems = allItems.filter(x => !x.checked);
  const checkedItems = allItems.filter(x => x.checked);

  if (allItems.length === 0) {
    checklistContainer.innerHTML = '<p class="empty-state-msg">📋 No items needed. Start planning meals in the Planner tab!</p>';
    return;
  }

  const renderItem = (it) => {
    const div = document.createElement('div');
    div.className = `shop-item-row${it.checked ? ' checked' : ''}`;
    div.onclick = () => toggleShoppingItem(it.name, it.custom);

    div.innerHTML = `
      <div class="shop-chk"></div>
      <div class="shop-item-text">${esc(it.name)}</div>
      ${it.qty > 1 && !it.checked ? `<span class="shop-qty-badge">${it.qty}x</span>` : ''}
    `;

    if (it.custom && curUser && curUser.role !== 'viewer') {
      const delBtn = document.createElement('button');
      delBtn.className = 'shop-item-del';
      delBtn.innerHTML = '✕';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        removeCustomShoppingItem(it.name);
      };
      div.appendChild(delBtn);
    }

    return div;
  };

  if (activeItems.length > 0) {
    const activeSection = document.createElement('div');
    activeSection.className = 'shop-items-grid';
    activeItems.forEach(it => activeSection.appendChild(renderItem(it)));
    checklistContainer.appendChild(activeSection);
  }

  if (checkedItems.length > 0) {
    const divider = document.createElement('div');
    divider.className = 'shop-cat-title';
    divider.style.marginTop = '15px';
    divider.textContent = `✅ Purchased (${checkedItems.length})`;
    checklistContainer.appendChild(divider);

    const checkedSection = document.createElement('div');
    checkedSection.className = 'shop-items-grid';
    checkedItems.forEach(it => checkedSection.appendChild(renderItem(it)));
    checklistContainer.appendChild(checkedSection);
  }

  const writeArea = document.getElementById('shopAddContainer');
  if (curUser && curUser.role === 'viewer') {
    if (writeArea) writeArea.style.display = 'none';
  } else {
    if (writeArea) writeArea.style.display = 'block';
  }

  // Handle Pantry Suggestions
  const suggestionsContainer = document.getElementById('shopSuggestionsContainer');
  const suggestionsGrid = document.getElementById('shopSuggestionsGrid');
  if (suggestionsContainer && suggestionsGrid) {
    const pantry = getStorage('pantry', DEFAULT_PANTRY_ITEMS);
    const existingNames = activeItems.map(it => it.name.toLowerCase());
    const suggestions = pantry.filter(p => {
      if (p.qty > p.minStock) return false;
      if (existingNames.includes(p.name.toLowerCase())) return false;
      return true;
    });

    if (suggestions.length > 0 && curUser && curUser.role !== 'viewer') {
      suggestionsContainer.style.display = 'block';
      suggestionsGrid.innerHTML = '';
      suggestions.forEach(sug => {
        const pill = document.createElement('div');
        pill.className = 'shop-suggestion-pill';
        pill.innerHTML = `<span>${esc(sug.name)}</span> <span class="badge ${sug.qty === 0 ? 'badge-red' : 'badge-amber'}">${sug.qty === 0 ? 'Out' : 'Low'}</span>`;
        pill.onclick = () => {
          const inputEl = document.getElementById('shopNewItem');
          if (inputEl) inputEl.value = sug.name;
          addShoppingItem();
        };
        suggestionsGrid.appendChild(pill);
      });
    } else {
      suggestionsContainer.style.display = 'none';
    }
  }
}

function toggleShoppingItem(name, isCustom) {
  if (curUser && curUser.role === 'viewer') return;

  const shopState = getShoppingState(curWeekKey);

  if (isCustom) {
    const item = shopState.custom.find(x => x.name === name);
    if (item) item.bought = !item.bought;
  } else {
    const idx = shopState.purchased.indexOf(name);
    if (idx > -1) {
      shopState.purchased.splice(idx, 1);
    } else {
      shopState.purchased.push(name);
    }
  }

  saveShoppingState(curWeekKey, shopState);
  refreshShoppingPage();
}

function addShoppingItem() {
  const inputEl = document.getElementById('shopNewItem');
  const name = inputEl ? inputEl.value.trim() : '';
  if (!name) {
    toast('⚠️ Enter an item name');
    return;
  }

  const shopState = getShoppingState(curWeekKey);
  if (shopState.custom.find(x => x.name.toLowerCase() === name.toLowerCase())) {
    toast('⚠️ Custom item already on shopping list');
    return;
  }

  shopState.custom.push({ name, bought: false });
  saveShoppingState(curWeekKey, shopState);
  if (inputEl) inputEl.value = '';
  refreshShoppingPage();
  toast(`🛒 Added: ${esc(name)}`);
}

function removeCustomShoppingItem(name) {
  const shopState = getShoppingState(curWeekKey);
  shopState.custom = shopState.custom.filter(x => x.name !== name);
  saveShoppingState(curWeekKey, shopState);
  refreshShoppingPage();
}

function clearPurchasedItems() {
  if (curUser && curUser.role === 'viewer') return;

  const shopState = getShoppingState(curWeekKey);
  if (shopState.purchased.length === 0 && shopState.custom.filter(x => x.bought).length === 0) {
    toast('⚠️ No checked items to clear');
    return;
  }

  showConfirm('Clear Checked Items', 'This will clear all completed checklist items. Continue?', () => {
    shopState.purchased = [];
    shopState.custom = shopState.custom.filter(x => !x.bought);
    saveShoppingState(curWeekKey, shopState);
    refreshShoppingPage();
    toast('🧹 Completed items cleared');
  });
}

// --- Settings ---
function refreshSettingsPage() {
  const users = getStorage('users', DEFAULT_USERS);
  const listUl = document.getElementById('memberList');
  if (!listUl) return;
  listUl.innerHTML = '';

  users.forEach(u => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div><strong>${esc(u.name)}</strong> <span class="user-meta">${esc(u.role)}</span></div>
    `;

    if (curUser && curUser.role === 'admin' && u.id !== curUser.id && u.id !== 'admin') {
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-o btn-s';
      delBtn.innerHTML = '🗑️';
      delBtn.onclick = () => deleteFamilyMember(u.id);
      li.appendChild(delBtn);
    }
    listUl.appendChild(li);
  });

  const memberWrite = document.getElementById('settingsMemberWriteArea');
  if (memberWrite) memberWrite.style.display = (curUser && curUser.role === 'admin') ? 'block' : 'none';

  const resetBtn = document.getElementById('settingsResetBtn');
  if (resetBtn) resetBtn.style.display = (curUser && curUser.role === 'admin') ? 'inline-flex' : 'none';

  // Load sync config
  const sync = getStorage('sync_settings', {});
  const patEl = document.getElementById('syncPAT');
  const gistIdEl = document.getElementById('syncGistId');
  if (patEl) patEl.value = sync.pat || '';
  if (gistIdEl) gistIdEl.value = sync.gistId || '';

  updateSyncStatusUI();
}

function addFamilyMember() {
  const nameEl = document.getElementById('newUserName');
  const roleEl = document.getElementById('newUserRole');
  const name = nameEl ? nameEl.value.trim() : '';
  const role = roleEl ? roleEl.value : 'editor';

  if (!name) {
    toast('⚠️ Enter a valid member name');
    return;
  }

  const users = getStorage('users', DEFAULT_USERS);
  const id = name.toLowerCase().replace(/\s/g, '');

  if (users.find(x => x.id === id)) {
    toast('⚠️ Member username already exists');
    return;
  }

  users.push({ id, name, role, pass: id + '123' });
  setStorage('users', users);
  if (nameEl) nameEl.value = '';
  refreshSettingsPage();
  toast(`✅ Added member: ${esc(name)} (Password: ${id}123)`);
}

function deleteFamilyMember(userId) {
  showConfirm('Delete Member', 'Are you sure you want to remove this family member?', () => {
    let users = getStorage('users', DEFAULT_USERS);
    users = users.filter(x => x.id !== userId);
    setStorage('users', users);
    refreshSettingsPage();
    toast('🗑️ Member removed');
  });
}

function changeUserPassword() {
  const oldPassEl = document.getElementById('oldPass');
  const newPassEl = document.getElementById('newPass');
  const oldPass = oldPassEl ? oldPassEl.value : '';
  const newPass = newPassEl ? newPassEl.value : '';

  if (!curUser) return;

  if (curUser.pass !== oldPass) {
    toast('❌ Current password incorrect');
    return;
  }

  if (newPass.length < 6) {
    toast('⚠️ New password must be at least 6 characters');
    return;
  }

  const users = getStorage('users', DEFAULT_USERS);
  const user = users.find(x => x.id === curUser.id);
  if (user) {
    user.pass = newPass;
    curUser.pass = newPass;
    setStorage('users', users);
  }

  if (oldPassEl) oldPassEl.value = '';
  if (newPassEl) newPassEl.value = '';
  toast('🔑 Password changed successfully');
}

// --- Import / Export ---
function exportDataJSON() {
  const data = {
    _app: 'MenuPlanner',
    _version: '1.2',
    _exportDate: new Date().toISOString(),
    users: getStorage('users', DEFAULT_USERS),
    dishes: getDbDishes(),
    weekly_plans: getStorage('weekly_plans', {}),
    shopping_lists: getStorage('shopping_lists', {}),
    pantry: getStorage('pantry', [])
    // Note: sync_settings excluded from export for security (contains PAT)
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `menuplanner_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);

  toast('📥 Data backup exported!');
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);

      // Validate basic structure
      if (!data.dishes && !data.weekly_plans && !data.users) {
        toast('❌ Invalid backup file: missing expected data keys');
        return;
      }

      if (data.users) setStorage('users', data.users);
      if (data.dishes) setStorage('dishes', data.dishes);
      if (data.weekly_plans) setStorage('weekly_plans', data.weekly_plans);
      if (data.shopping_lists) setStorage('shopping_lists', data.shopping_lists);
      if (data.pantry) setStorage('pantry', data.pantry);

      toast('✅ Backup imported successfully!');
      setTimeout(() => location.reload(), 500);
    } catch (err) {
      toast('❌ Invalid backup JSON file');
      console.error('Import error:', err);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function confirmResetAll() {
  showConfirm('Reset Entire App', '⚠️ WARNING: This will permanently delete ALL customized dishes, planned menus, and user profiles. This cannot be undone!', () => {
    // Only clear our own keys, not all localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mp_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    location.reload();
  });
}

// --- GitHub Gist Sync ---
function updateSyncStatusUI(status, isError) {
  const el = document.getElementById('syncStatus');
  if (!el) return;

  const sync = getStorage('sync_settings', {});

  if (!sync.pat) {
    el.textContent = 'Not Linked (Local Storage Only)';
    el.className = 'sync-status';
    const syncBtn = document.getElementById('headerSyncBtn');
    if (syncBtn) syncBtn.style.display = 'none';
    return;
  }

  const syncBtn = document.getElementById('headerSyncBtn');
  if (syncBtn) syncBtn.style.display = 'flex';

  if (status) {
    el.textContent = status;
    el.className = 'sync-status' + (isError ? ' error' : ' active');
  } else {
    const lastSync = sync.lastSyncTime ? new Date(sync.lastSyncTime).toLocaleString() : 'Never';
    el.textContent = `✅ Linked (Last Sync: ${lastSync})`;
    el.className = 'sync-status active';
  }
}

function triggerAutoSync() {
  const sync = getStorage('sync_settings', {});
  if (sync.pat && sync.gistId) {
    // Debounce: don't auto-push more than once every 10 seconds
    if (triggerAutoSync._timer) clearTimeout(triggerAutoSync._timer);
    triggerAutoSync._timer = setTimeout(() => pushToCloud(true), 3000);
  }
}

function saveSyncSettings() {
  if (curUser && curUser.role !== 'admin') {
    toast('⚠️ Only Admin can configure cloud sync settings');
    return;
  }

  const patEl = document.getElementById('syncPAT');
  const gistIdEl = document.getElementById('syncGistId');
  const pat = patEl ? patEl.value.trim() : '';
  const gistId = gistIdEl ? gistIdEl.value.trim() : '';

  const sync = getStorage('sync_settings', {});
  sync.pat = pat;
  sync.gistId = gistId;
  setStorage('sync_settings', sync);

  if (!pat) {
    updateSyncStatusUI();
    toast('☁️ Cloud sync disabled. Local storage active.');
    return;
  }

  syncData();
}

async function syncData() {
  const sync = getStorage('sync_settings', {});
  if (!sync.pat) return;

  updateSyncStatusUI('Syncing...', false);

  try {
    if (!sync.gistId) {
      updateSyncStatusUI('Creating new Gist on GitHub...', false);
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${sync.pat}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'MenuPlanner Application Private Data Sync',
          public: false,
          files: {
            'menuplanner_data.json': {
              content: JSON.stringify(getAllLocalData(), null, 2)
            }
          }
        })
      });

      if (!res.ok) {
        if (res.status === 403 || res.status === 404 || res.status === 401) {
           throw new Error(`GitHub responded with status ${res.status}. Note: Ensure you are using a Classic PAT with 'gist' scope, not a Fine-Grained token.`);
        }
        throw new Error(`GitHub responded with status ${res.status}`);
      }

      const gist = await res.json();
      sync.gistId = gist.id;
      sync.lastSyncTime = Date.now();
      setStorage('sync_settings', sync);

      const gistIdEl = document.getElementById('syncGistId');
      if (gistIdEl) gistIdEl.value = gist.id;

      updateSyncStatusUI();
      toast('✅ Sync linked! Created new private GitHub Gist.');
    } else {
      await pullFromCloud(false);
    }
  } catch (err) {
    console.error(err);
    updateSyncStatusUI('Sync failed: ' + err.message, true);
    toast('❌ Sync failed: ' + err.message);
  }
}

function getAllLocalData() {
  return {
    dishes: getDbDishes(),
    weekly_plans: getStorage('weekly_plans', {}),
    shopping_lists: getStorage('shopping_lists', {}),
    pantry: getStorage('pantry', []),
    timestamp: Date.now()
  };
}

function mergeRemoteData(remote) {
  if (remote.dishes) setStorage('dishes', remote.dishes);
  if (remote.weekly_plans) {
    const localPlans = getStorage('weekly_plans', {});
    const mergedPlans = { ...localPlans, ...remote.weekly_plans };
    setStorage('weekly_plans', mergedPlans);
  }
  if (remote.shopping_lists) {
    const localShop = getStorage('shopping_lists', {});
    const mergedShop = { ...localShop, ...remote.shopping_lists };
    setStorage('shopping_lists', mergedShop);
  }
  if (remote.pantry) setStorage('pantry', remote.pantry);
}

async function pullFromCloud(silent = false) {
  const sync = getStorage('sync_settings', {});
  if (!sync.pat || !sync.gistId) {
    if (!silent) toast('⚠️ Cloud sync parameters not set');
    return;
  }

  if (!silent) updateSyncStatusUI('Pulling latest from GitHub...', false);

  try {
    const res = await fetch(`https://api.github.com/gists/${sync.gistId}`, {
      headers: {
        'Authorization': `token ${sync.pat}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 404 || res.status === 401) {
         throw new Error(`Status ${res.status}. Note: Ensure you are using a Classic PAT with 'gist' scope.`);
      }
      throw new Error(`Gist not found (Status ${res.status})`);
    }

    const gist = await res.json();
    const file = gist.files['menuplanner_data.json'];
    if (!file) throw new Error('menuplanner_data.json missing from Gist');

    const remoteData = JSON.parse(file.content);
    mergeRemoteData(remoteData);

    sync.lastSyncTime = Date.now();
    setStorage('sync_settings', sync);

    if (!silent) {
      updateSyncStatusUI();
      toast('📥 Pulled latest plans from cloud!');
      const activePg = document.querySelector('.pg.active');
      if (activePg) showPage(activePg.id, document.querySelector('.bnav button.active'));
    }
  } catch (err) {
    console.error(err);
    if (!silent) {
      updateSyncStatusUI('Pull failed: ' + err.message, true);
      toast('❌ Pull failed: ' + err.message);
    }
  }
}

async function pushToCloud(silent = false) {
  const sync = getStorage('sync_settings', {});
  if (!sync.pat || !sync.gistId) return;

  if (!silent) updateSyncStatusUI('Pushing to GitHub...', false);

  try {
    const res = await fetch(`https://api.github.com/gists/${sync.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${sync.pat}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'menuplanner_data.json': {
            content: JSON.stringify(getAllLocalData(), null, 2)
          }
        }
      })
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 404 || res.status === 401) {
         throw new Error(`Status ${res.status}. Note: Ensure you are using a Classic PAT with 'gist' scope.`);
      }
      throw new Error(`Status ${res.status}`);
    }

    sync.lastSyncTime = Date.now();
    setStorage('sync_settings', sync);

    if (!silent) {
      updateSyncStatusUI();
      toast('📤 Pushed latest plans to cloud!');
    }
  } catch (err) {
    console.error(err);
    if (!silent) {
      updateSyncStatusUI('Push failed: ' + err.message, true);
      toast('❌ Push failed: ' + err.message);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// PANTRY INVENTORY MODULE
// ═══════════════════════════════════════════════════════════

const PANTRY_CATEGORIES = {
  spices: 'Spices & Seeds',
  grains: 'Grains & Rice',
  dal: 'Dals & Lentils',
  masala: 'Masala & Powders',
  snacks: 'Snacks & Cereals',
  oils: 'Oils & Liquids',
  dryfruits: 'Dry Fruits & Nuts',
  baking: 'Baking & Sweeteners',
  household: 'Household',
  baby: 'Baby Care',
  cleaning: 'Cleaning'
};

const DEFAULT_PANTRY_ITEMS = [
  // Spices & Seeds
  { name: 'Cardamom', cat: 'spices', qty: 0, unit: 'g', minStock: 20, price: 0 },
  { name: 'Clove', cat: 'spices', qty: 0, unit: 'g', minStock: 20, price: 1350 },
  { name: 'Cumin Seeds', cat: 'spices', qty: 0, unit: 'g', minStock: 50, price: 630 },
  { name: 'Fennel Seeds', cat: 'spices', qty: 0, unit: 'g', minStock: 50, price: 240 },
  { name: 'Fenugreek', cat: 'spices', qty: 0, unit: 'g', minStock: 50, price: 180 },
  { name: 'Mustard Seeds', cat: 'spices', qty: 0, unit: 'kg', minStock: 0.2, price: 115 },
  { name: 'Pepper', cat: 'spices', qty: 0, unit: 'g', minStock: 50, price: 0 },
  { name: 'Dry Red Chilli', cat: 'spices', qty: 0, unit: 'g', minStock: 50, price: 0 },
  { name: 'Chia Seeds', cat: 'spices', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Flax Seeds', cat: 'spices', qty: 0, unit: 'kg', minStock: 0.2, price: 0 },
  { name: 'Sunflower Seeds', cat: 'spices', qty: 0, unit: 'g', minStock: 100, price: 0 },

  // Grains & Rice
  { name: 'Pacha Rice (Matta)', cat: 'grains', qty: 0, unit: 'kg', minStock: 2, price: 33 },
  { name: 'Basmati Rice', cat: 'grains', qty: 0, unit: 'kg', minStock: 1, price: 0 },
  { name: 'Rava (Semolina)', cat: 'grains', qty: 0, unit: 'kg', minStock: 1, price: 99 },
  { name: 'Atta Multi Grains', cat: 'grains', qty: 0, unit: 'kg', minStock: 1, price: 0 },
  { name: 'Aval (Flattened Rice)', cat: 'grains', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Puttu Podi', cat: 'grains', qty: 0, unit: 'kg', minStock: 1, price: 92 },
  { name: 'Ragi Puttu Podi', cat: 'grains', qty: 0, unit: 'kg', minStock: 1, price: 90 },
  { name: 'Corn Puttu Podi', cat: 'grains', qty: 0, unit: 'kg', minStock: 1, price: 90 },
  { name: 'Idiyappam Powder', cat: 'grains', qty: 0, unit: 'kg', minStock: 1, price: 0 },
  { name: 'Oats', cat: 'grains', qty: 0, unit: 'kg', minStock: 0.3, price: 0 },
  { name: 'Ragi', cat: 'grains', qty: 0, unit: 'kg', minStock: 0.5, price: 110 },
  { name: 'Corn Flour', cat: 'grains', qty: 0, unit: 'g', minStock: 200, price: 0 },
  { name: 'Corn Flakes', cat: 'grains', qty: 0, unit: 'kg', minStock: 0.3, price: 0 },
  { name: 'Salt', cat: 'grains', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },

  // Dals & Lentils
  { name: 'Cheru Payar (Green Gram)', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.5, price: 127 },
  { name: 'Van Payar (Red Cowpeas)', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.5, price: 94.5 },
  { name: 'Kadala (Chickpeas)', cat: 'dal', qty: 0, unit: 'kg', minStock: 1, price: 75 },
  { name: 'Channa', cat: 'dal', qty: 0, unit: 'kg', minStock: 1, price: 134 },
  { name: 'Pottu Kadala', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.2, price: 240 },
  { name: 'Green Peas', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Dal Toor', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Dal Red Toor', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Dal Moong', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Dal Urad (Uzhunu)', cat: 'dal', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Soya Chunks', cat: 'dal', qty: 0, unit: 'g', minStock: 200, price: 0 },

  // Masala & Powders
  { name: 'Chilli Powder', cat: 'masala', qty: 0, unit: 'kg', minStock: 0.2, price: 0 },
  { name: 'Turmeric Powder', cat: 'masala', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Coriander Powder', cat: 'masala', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Kashmiri Chilli Powder', cat: 'masala', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Garam Masala', cat: 'masala', qty: 0, unit: 'kg', minStock: 0.1, price: 1080 },
  { name: 'Sambar Powder', cat: 'masala', qty: 0, unit: 'kg', minStock: 0.1, price: 540 },
  { name: 'Chat Masala', cat: 'masala', qty: 0, unit: 'g', minStock: 50, price: 0 },
  { name: 'Chicken Masala', cat: 'masala', qty: 0, unit: 'g', minStock: 50, price: 580 },
  { name: 'Chicken Fry Masala', cat: 'masala', qty: 0, unit: 'g', minStock: 50, price: 600 },
  { name: 'Meat Masala', cat: 'masala', qty: 0, unit: 'g', minStock: 100, price: 580 },
  { name: 'Biriyani Masala', cat: 'masala', qty: 0, unit: 'g', minStock: 50, price: 0 },
  { name: 'Biriyani Spices', cat: 'masala', qty: 0, unit: 'pkt', minStock: 1, price: 0 },
  { name: 'Kasuri Methi', cat: 'masala', qty: 0, unit: 'g', minStock: 25, price: 0 },
  { name: 'Chammanthi Podi', cat: 'masala', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Dahamukthi', cat: 'masala', qty: 0, unit: 'g', minStock: 50, price: 0 },
  { name: 'Turmeric Powder (Cleaning)', cat: 'masala', qty: 0, unit: 'g', minStock: 100, price: 0 },

  // Snacks & Cereals
  { name: 'Biscuits', cat: 'snacks', qty: 0, unit: 'pkt', minStock: 2, price: 0 },
  { name: 'Choco Fills Biscuit', cat: 'snacks', qty: 0, unit: 'pkt', minStock: 1, price: 0 },
  { name: 'Rusk', cat: 'snacks', qty: 0, unit: 'pkt', minStock: 1, price: 0 },
  { name: 'Tea Powder (Strong)', cat: 'snacks', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },

  // Oils & Liquids
  { name: 'Tamarind', cat: 'oils', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Vinegar', cat: 'oils', qty: 0, unit: 'ml', minStock: 200, price: 0 },

  // Dry Fruits & Nuts
  { name: 'Almonds', cat: 'dryfruits', qty: 0, unit: 'kg', minStock: 0.2, price: 0 },
  { name: 'Cashew', cat: 'dryfruits', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Pista', cat: 'dryfruits', qty: 0, unit: 'g', minStock: 100, price: 0 },
  { name: 'Raisins (Kismiss)', cat: 'dryfruits', qty: 0, unit: 'kg', minStock: 0.2, price: 0 },
  { name: 'Dates', cat: 'dryfruits', qty: 0, unit: 'g', minStock: 200, price: 0 },

  // Baking & Sweeteners
  { name: 'Cane Sugar', cat: 'baking', qty: 0, unit: 'kg', minStock: 1, price: 0 },
  { name: 'Jaggery', cat: 'baking', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Jaggery Powder', cat: 'baking', qty: 0, unit: 'g', minStock: 250, price: 0 },
  { name: 'Vellam Loose', cat: 'baking', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Baking Soda', cat: 'baking', qty: 0, unit: 'g', minStock: 50, price: 0 },

  // Household
  { name: 'Tissue Paper Box', cat: 'household', qty: 0, unit: 'pcs', minStock: 2, price: 0 },
  { name: 'Tissue Paper Roll', cat: 'household', qty: 0, unit: 'pcs', minStock: 4, price: 0 },
  { name: 'Sponge Scrubber', cat: 'household', qty: 0, unit: 'pcs', minStock: 2, price: 0 },
  { name: 'Steel Scrubber', cat: 'household', qty: 0, unit: 'pcs', minStock: 2, price: 0 },

  // Baby Care
  { name: 'Baby Powder', cat: 'baby', qty: 0, unit: 'pcs', minStock: 1, price: 0 },
  { name: 'Baby Lotion', cat: 'baby', qty: 0, unit: 'pcs', minStock: 1, price: 0 },
  { name: 'Body Lotion', cat: 'baby', qty: 0, unit: 'pcs', minStock: 1, price: 0 },

  // Cleaning
  { name: 'Handwash', cat: 'cleaning', qty: 0, unit: 'pcs', minStock: 1, price: 0 },
  { name: 'Shampoo', cat: 'cleaning', qty: 0, unit: 'pcs', minStock: 1, price: 0 },
  { name: 'Soap', cat: 'cleaning', qty: 0, unit: 'pcs', minStock: 2, price: 0 },
  { name: 'Soap Powder', cat: 'cleaning', qty: 0, unit: 'kg', minStock: 0.5, price: 0 },
  { name: 'Washing Soap', cat: 'cleaning', qty: 0, unit: 'pcs', minStock: 2, price: 0 },
  { name: 'Laundry Detergent', cat: 'cleaning', qty: 0, unit: 'L', minStock: 1, price: 0 },
  { name: 'Drain Cleaner', cat: 'cleaning', qty: 0, unit: 'pcs', minStock: 1, price: 0 },
  { name: 'Tooth Brush', cat: 'cleaning', qty: 0, unit: 'pcs', minStock: 2, price: 0 },
  { name: 'Tooth Paste', cat: 'cleaning', qty: 0, unit: 'pcs', minStock: 1, price: 0 }
];

function getPantryItems() {
  return getStorage('pantry', DEFAULT_PANTRY_ITEMS);
}

function savePantryItems(items) {
  setStorage('pantry', items);
  triggerAutoSync();
}

function getStockStatus(item) {
  if (item.qty <= 0) return 'out';
  if (item.qty <= item.minStock) return 'low';
  return 'ok';
}

function getExpiryStatus(item) {
  if (!item.expiryDate) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(item.expiryDate + 'T00:00:00');
  const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring';
  return 'ok';
}

function refreshPantryPage() {
  const items = getPantryItems();

  // Compute stats
  let totalCount = items.length;
  let lowCount = 0;
  let outCount = 0;
  items.forEach(it => {
    const st = getStockStatus(it);
    if (st === 'low') lowCount++;
    if (st === 'out') outCount++;
  });

  const totalEl = document.getElementById('pantryTotalCount');
  const lowEl = document.getElementById('pantryLowCount');
  const outEl = document.getElementById('pantryOutCount');
  if (totalEl) totalEl.textContent = totalCount;
  if (lowEl) lowEl.textContent = lowCount;
  if (outEl) outEl.textContent = outCount;

  // Toggle glow on status cards
  const lowCard = document.querySelector('.status-card.status-low');
  const outCard = document.querySelector('.status-card.status-out');
  if (lowCard) lowCard.classList.toggle('has-items', lowCount > 0);
  if (outCard) outCard.classList.toggle('has-items', outCount > 0);

  // Build category filter
  const filterDiv = document.getElementById('pantryCatFilter');
  if (filterDiv) {
    const currentActive = filterDiv.querySelector('.catb.active');
    const currentCat = currentActive ? currentActive.dataset.cat : 'all';
    filterDiv.innerHTML = '<div class="catb active" data-cat="all" onclick="filterPantryCat(\'all\', this)">All</div>';
    for (const [key, label] of Object.entries(PANTRY_CATEGORIES)) {
      filterDiv.innerHTML += `<div class="catb" data-cat="${esc(key)}" onclick="filterPantryCat('${esc(key)}', this)">${esc(label)}</div>`;
    }
    const activeBtn = filterDiv.querySelector(`[data-cat="${currentCat}"]`);
    if (activeBtn) {
      filterDiv.querySelectorAll('.catb').forEach(b => b.classList.remove('active'));
      activeBtn.classList.add('active');
    }
  }

  // Populate category dropdown in add form
  const catSelect = document.getElementById('pantryNewCat');
  if (catSelect && catSelect.options.length === 0) {
    for (const [key, label] of Object.entries(PANTRY_CATEGORIES)) {
      catSelect.innerHTML += `<option value="${esc(key)}">${esc(label)}</option>`;
    }
  }

  // Role-based visibility
  const addContainer = document.getElementById('pantryAddContainer');
  const resetBtn = document.getElementById('pantryResetBtn');
  if (curUser && curUser.role === 'viewer') {
    if (addContainer) addContainer.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
  } else {
    if (addContainer) addContainer.style.display = 'block';
    if (resetBtn) resetBtn.style.display = 'inline-flex';
  }

  refreshPantryList();
}

function filterPantryCat(cat, btn) {
  document.querySelectorAll('#pantryCatFilter .catb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  refreshPantryList();
}

function refreshPantryList() {
  const items = getPantryItems();
  const searchEl = document.getElementById('pantrySearch');
  const search = searchEl ? searchEl.value.toLowerCase() : '';
  const activeCatEl = document.querySelector('#pantryCatFilter .catb.active');
  const filterCat = activeCatEl ? activeCatEl.dataset.cat : 'all';
  const stockFilterEl = document.getElementById('pantryStockFilter');
  const stockFilter = stockFilterEl ? stockFilterEl.value : 'all';

  const grid = document.getElementById('pantryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  let visibleCount = 0;

  items.forEach((item, idx) => {
    const matchSearch = item.name.toLowerCase().includes(search);
    const matchCat = filterCat === 'all' || item.cat === filterCat;
    const status = getStockStatus(item);
    const expStatus = getExpiryStatus(item);
    
    let matchStock = false;
    if (stockFilter === 'all') matchStock = true;
    else if (stockFilter === 'expiring' && (expStatus === 'expired' || expStatus === 'expiring')) matchStock = true;
    else if (stockFilter === status) matchStock = true;

    if (!matchSearch || !matchCat || !matchStock) return;
    visibleCount++;

    const statusClass = status === 'out' ? 'stock-out' : status === 'low' ? 'stock-low' : 'stock-ok';
    const badgeClass = status === 'out' ? 'badge-out' : status === 'low' ? 'badge-low' : 'badge-ok';
    const badgeText = status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock';
    
    const catLabel = PANTRY_CATEGORIES[item.cat] || item.cat;
    const priceStr = item.price > 0 ? `\u20b9${item.price}/${item.unit}` : '';
    const updatedStr = item.lastUpdated || '';
    
    let expiryBadge = '';
    if (expStatus === 'expired') {
      expiryBadge = `<span class="pi-badge badge-out">🔴 Expired</span>`;
    } else if (expStatus === 'expiring') {
      expiryBadge = `<span class="pi-badge badge-low">🟡 Expiring Soon</span>`;
    } else if (item.expiryDate) {
      expiryBadge = `<span class="pi-badge" style="background:var(--bg-card);color:var(--text-sub);border:1px solid var(--border)">🗓️ ${item.expiryDate}</span>`;
    }

    const card = document.createElement('div');
    card.className = `pantry-item ${statusClass}`;
    card.innerHTML = `
      <div class="pi-header">
        <span class="pi-name">${esc(item.name)}</span>
        <div>
          ${expiryBadge}
          <span class="pi-badge ${badgeClass}">${badgeText}</span>
        </div>
      </div>
      <div class="pi-details">
        <div class="pi-qty-controls">
          <button class="pi-qty-btn minus" onclick="updatePantryQty(${idx}, -getQtyStep(${idx}))" ${curUser && curUser.role === 'viewer' ? 'disabled' : ''}>\u2212</button>
          <span class="pi-qty-display">${item.qty} ${esc(item.unit)}</span>
          <button class="pi-qty-btn plus" onclick="updatePantryQty(${idx}, getQtyStep(${idx}))" ${curUser && curUser.role === 'viewer' ? 'disabled' : ''}>+</button>
        </div>
        <div class="pi-meta">
          <span class="pi-cat-tag">${esc(catLabel)}</span>
          ${priceStr ? `<span class="pi-price">${priceStr}</span>` : ''}
        </div>
        <div class="pi-actions">
          ${curUser && curUser.role !== 'viewer' ? `
            <button class="pi-action-btn" onclick="promptExpiry(${idx})" title="Set Expiry Date">📅</button>
            <button class="pi-action-btn" onclick="deletePantryItem(${idx})" title="Delete">🗑️</button>
          ` : ''}
        </div>
      </div>
      ${updatedStr ? `<div class="pi-updated">Updated: ${esc(updatedStr)}</div>` : ''}
    `;

    grid.appendChild(card);
  });

  if (visibleCount === 0) {
    grid.innerHTML = '<div class="pantry-empty">No items match your filters. Try adjusting category or search.</div>';
  }

  const countEl = document.getElementById('pantryVisibleCount');
  if (countEl) countEl.textContent = visibleCount;
}

function getQtyStep(idx) {
  const items = getPantryItems();
  const item = items[idx];
  if (!item) return 1;
  if (item.unit === 'kg' || item.unit === 'L') return 0.5;
  if (item.unit === 'g' || item.unit === 'ml') return 50;
  return 1;
}

function updatePantryQty(idx, delta) {
  if (curUser && curUser.role === 'viewer') return;
  const items = getPantryItems();
  if (!items[idx]) return;
  items[idx].qty = Math.max(0, Math.round((items[idx].qty + delta) * 100) / 100);
  items[idx].lastUpdated = new Date().toISOString().split('T')[0];
  savePantryItems(items);
  refreshPantryPage();
}

function promptExpiry(idx) {
  if (curUser && curUser.role === 'viewer') return;
  const items = getPantryItems();
  if (!items[idx]) return;
  const current = items[idx].expiryDate || '';
  const newDate = prompt(`Set expiry date for ${items[idx].name} (YYYY-MM-DD):`, current);
  if (newDate !== null) {
    if (newDate.trim() === '') {
      items[idx].expiryDate = '';
      savePantryItems(items);
      refreshPantryPage();
      toast('🗓️ Expiry date cleared');
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(newDate.trim())) {
      items[idx].expiryDate = newDate.trim();
      savePantryItems(items);
      refreshPantryPage();
      toast('🗓️ Expiry date updated');
    } else {
      toast('⚠️ Invalid format. Use YYYY-MM-DD');
    }
  }
}

function addPantryItem() {
  const nameEl = document.getElementById('pantryNewName');
  const catEl = document.getElementById('pantryNewCat');
  const qtyEl = document.getElementById('pantryNewQty');
  const unitEl = document.getElementById('pantryNewUnit');
  const minEl = document.getElementById('pantryNewMin');
  const priceEl = document.getElementById('pantryNewPrice');
  const expiryEl = document.getElementById('pantryNewExpiry');

  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) { toast('\u26a0\ufe0f Enter item name'); return; }

  const items = getPantryItems();
  if (items.find(x => x.name.toLowerCase() === name.toLowerCase())) {
    toast('\u26a0\ufe0f Item already exists'); return;
  }

  items.push({
    name,
    cat: catEl ? catEl.value : 'household',
    qty: qtyEl ? parseFloat(qtyEl.value) || 0 : 0,
    unit: unitEl ? unitEl.value : 'pcs',
    minStock: minEl ? parseFloat(minEl.value) || 0.5 : 0.5,
    price: priceEl ? parseFloat(priceEl.value) || 0 : 0,
    expiryDate: expiryEl ? expiryEl.value : '',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  savePantryItems(items);
  if (nameEl) nameEl.value = '';
  if (qtyEl) qtyEl.value = '';
  if (minEl) minEl.value = '';
  if (priceEl) priceEl.value = '';
  refreshPantryPage();
  toast('\u2705 Item added to pantry');
}

function deletePantryItem(idx) {
  showConfirm('Delete Item', 'Remove this item from your pantry inventory?', () => {
    const items = getPantryItems();
    if (idx >= 0 && idx < items.length) {
      items.splice(idx, 1);
      savePantryItems(items);
      refreshPantryPage();
      toast('\ud83d\uddd1\ufe0f Item removed');
    }
  });
}

function resetPantryDefaults() {
  showConfirm('Reset Pantry', 'Reset pantry inventory to defaults? All quantity data will be lost.', () => {
    savePantryItems(DEFAULT_PANTRY_ITEMS);
    refreshPantryPage();
    toast('\ud83d\udd04 Pantry reset to defaults');
  });
}

// ═══════════════════════════════════════════════════════════
// DOMContentLoaded — Safe initialization after DOM is ready
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Initialize week key
  curWeekKey = getWeekKey(new Date());

  // Wire up confirm modal button (MUST happen after DOM is ready)
  const confirmBtn = document.getElementById('confirmExecuteBtn');
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      if (confirmCallback) confirmCallback();
      closeConfirmModal();
    };
  }

  // Wire up Enter key on login fields
  const loginPass = document.getElementById('loginPass');
  const loginUser = document.getElementById('loginUser');
  if (loginPass) {
    loginPass.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') login();
    });
  }
  if (loginUser) {
    loginUser.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') login();
    });
  }

  // Wire up Enter key on shopping item input
  const shopInput = document.getElementById('shopNewItem');
  if (shopInput) {
    shopInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addShoppingItem();
    });
  }

  // Wire up Enter key on modal quick-add
  const modalQuickAdd = document.getElementById('modalQuickAdd');
  if (modalQuickAdd) {
    modalQuickAdd.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addAndSelectCustomDish();
    });
  }

  // Wire up Enter key on db new dish
  const dbNewName = document.getElementById('dbNewName');
  if (dbNewName) {
    dbNewName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNewDish();
    });
  }

  // Wire up Enter key on pantry new item
  const pantryNewName = document.getElementById('pantryNewName');
  if (pantryNewName) {
    pantryNewName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addPantryItem();
    });
  }

  // Ensure login screen is visible on start
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('appHeader').style.display = 'none';
  document.getElementById('appContent').style.display = 'none';
  document.getElementById('bnav').style.display = 'none';
});
