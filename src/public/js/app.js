// ================================================================
//  app.js — Frontend JS that connects to the NestJS REST API
// ================================================================

const API = "/api/products";

// ── State ────────────────────────────────────────────────────────
let state = {
  products: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  search: "", category: "", isActive: "", sortBy: "createdAt", order: "desc",
  editId: null,
};

// ── API Helpers ──────────────────────────────────────────────────
async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Load Products ─────────────────────────────────────────────────
async function loadProducts(page = 1) {
  state.meta.page = page;
  const params = new URLSearchParams();
  if (state.search)   params.set("search",   state.search);
  if (state.category) params.set("category", state.category);
  if (state.isActive !== "") params.set("isActive", state.isActive);
  params.set("sortBy", state.sortBy);
  params.set("order",  state.order);
  params.set("page",   page);
  params.set("limit",  state.meta.limit);

  try {
    const result = await apiFetch(`${API}?${params}`);
    state.products = result.data;
    state.meta     = result.meta;
    renderTable();
    renderPagination();
  } catch (e) { showToast(e.message, "error"); }
}

// ── Load Stats ────────────────────────────────────────────────────
async function loadStats() {
  try {
    const s = await apiFetch(`${API}/stats`);
    document.getElementById("stat-total").textContent    = s.totalProducts ?? 0;
    document.getElementById("stat-active").textContent   = s.activeProducts ?? 0;
    document.getElementById("stat-stock").textContent    = s.totalStock ?? 0;
    document.getElementById("stat-avg").textContent      = s.avgPrice ? `₹${s.avgPrice}` : "—";
    document.getElementById("stat-low").textContent      = s.lowStock ?? 0;
  } catch (_) {}
}

// ── Render Table ──────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById("tbody");
  if (!state.products.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">No products found.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.products.map((p) => `
    <tr>
      <td><code style="color:#818cf8;font-size:12px">${p.sku}</code></td>
      <td><strong>${esc(p.name)}</strong></td>
      <td><span class="cat-badge">${p.category}</span></td>
      <td>₹${Number(p.price).toFixed(2)}</td>
      <td class="${p.stock < 10 ? "low-stock" : ""}">${p.stock}${p.stock < 10 ? " ⚠" : ""}</td>
      <td><span class="badge ${p.isActive ? "badge-active" : "badge-off"}">${p.isActive ? "Active" : "Inactive"}</span></td>
      <td style="color:var(--muted);font-size:12px">${fmtDate(p.createdAt)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-edit btn-sm" onclick="openEdit(${p.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id},'${esc(p.name)}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ── Render Pagination ─────────────────────────────────────────────
function renderPagination() {
  const { page, totalPages, total } = state.meta;
  const pg = document.getElementById("pagination");
  pg.innerHTML = `
    <span style="color:var(--muted);font-size:13px;margin-right:8px">${total} product${total !== 1 ? "s" : ""}</span>
    <button class="page-btn" onclick="loadProducts(${page - 1})" ${page <= 1 ? "disabled" : ""}>← Prev</button>
    <span style="font-size:13px;color:var(--muted)">Page ${page} / ${totalPages}</span>
    <button class="page-btn" onclick="loadProducts(${page + 1})" ${page >= totalPages ? "disabled" : ""}>Next →</button>
  `;
}

// ── Modal ─────────────────────────────────────────────────────────
function openAdd() {
  state.editId = null;
  document.getElementById("modal-title").textContent = "Add Product";
  document.getElementById("product-form").reset();
  document.getElementById("field-isactive").checked = true;
  document.getElementById("modal-error").classList.add("hidden");
  document.getElementById("modal").classList.remove("hidden");
}

async function openEdit(id) {
  try {
    const p = await apiFetch(`${API}/${id}`);
    state.editId = id;
    document.getElementById("modal-title").textContent = "Edit Product";
    document.getElementById("field-name").value        = p.name;
    document.getElementById("field-sku").value         = p.sku;
    document.getElementById("field-description").value = p.description ?? "";
    document.getElementById("field-category").value    = p.category;
    document.getElementById("field-price").value       = p.price;
    document.getElementById("field-stock").value       = p.stock;
    document.getElementById("field-imageurl").value    = p.imageUrl ?? "";
    document.getElementById("field-isactive").checked  = p.isActive;
    document.getElementById("modal-error").classList.add("hidden");
    document.getElementById("modal").classList.remove("hidden");
  } catch (e) { showToast(e.message, "error"); }
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  state.editId = null;
}

// ── Save (Create / Update) ────────────────────────────────────────
document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("modal-error");
  errEl.classList.add("hidden");

  const payload = {
    name:        document.getElementById("field-name").value.trim(),
    sku:         document.getElementById("field-sku").value.trim(),
    description: document.getElementById("field-description").value.trim() || undefined,
    category:    document.getElementById("field-category").value,
    price:       Number(document.getElementById("field-price").value),
    stock:       Number(document.getElementById("field-stock").value),
    imageUrl:    document.getElementById("field-imageurl").value.trim() || undefined,
    isActive:    document.getElementById("field-isactive").checked,
  };

  const saveBtn = document.getElementById("save-btn");
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  try {
    if (state.editId) {
      await apiFetch(`${API}/${state.editId}`, { method: "PUT", body: JSON.stringify(payload) });
      showToast("✅ Product updated!");
    } else {
      await apiFetch(API, { method: "POST", body: JSON.stringify(payload) });
      showToast("✅ Product created!");
    }
    closeModal();
    loadProducts(1);
    loadStats();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  } finally {
    saveBtn.textContent = "Save Product";
    saveBtn.disabled = false;
  }
});

// ── Delete ────────────────────────────────────────────────────────
async function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await apiFetch(`${API}/${id}`, { method: "DELETE" });
    showToast("🗑 Product deleted", "success");
    loadProducts(state.meta.page);
    loadStats();
  } catch (e) { showToast(e.message, "error"); }
}

// ── Filters ───────────────────────────────────────────────────────
let searchTimeout;
document.getElementById("search").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { state.search = e.target.value; loadProducts(1); }, 350);
});
document.getElementById("filter-category").addEventListener("change", (e) => {
  state.category = e.target.value; loadProducts(1);
});
document.getElementById("filter-status").addEventListener("change", (e) => {
  state.isActive = e.target.value; loadProducts(1);
});
document.getElementById("filter-sort").addEventListener("change", (e) => {
  const [field, order] = e.target.value.split(":");
  state.sortBy = field; state.order = order; loadProducts(1);
});

// ── Tab Nav ───────────────────────────────────────────────────────
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 2800);
}

// ── Utils ─────────────────────────────────────────────────────────
function esc(str) { return String(str).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
function fmtDate(iso) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

// ── Init ──────────────────────────────────────────────────────────
loadStats();
loadProducts(1);
