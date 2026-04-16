const API = 'https://687f4c3aefe65e52008922e1.mockapi.io/user/directory';
const $ = id => document.getElementById(id);

// ================= ELEMENT =================
const el = {
  grid: $('directory-grid'),
  search: $('search-input'),

  loading: $('loading-banner'),
  success: $('success-banner'),
  successMsg: $('success-message'),
  error: $('error-banner'),
  errorMsg: $('error-message'),

  retry: $('retry-button'),
  dismiss: $('dismiss-success'),

  openCreate: $('open-create-button'),

  modal: $('form-modal'),
  form: $('contact-form'),
  name: $('name'),
  phone: $('phone'),
  email: $('email'),
  address: $('address'),
  closeModal: $('close-modal'),
  cancelBtn: $('cancel-btn'),
  formTitle: $('form-title'),

  deleteModal: $('delete-modal'),
  cancelDelete: $('cancel-delete'),
  confirmDelete: $('confirm-delete'),
};

let contacts = [];
let searchTerm = '';
let editingId = null;
let deletingId = null;

const ICONS = {
  phone: `
    <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.2 19.2 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72c.12.92.34 1.8.66 2.64a2 2 0 0 1-.45 2.11L8 9.8a16 16 0 0 0 6.2 6.2l1.33-1.33a2 2 0 0 1 2.11-.45c.84.32 1.72.54 2.64.66A2 2 0 0 1 22 16.92Z"/>
    </svg>
  `,
  email: `
    <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="m3 7 9 6 9-6"/>
    </svg>
  `,
  address: `
    <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 21s6-5.33 6-11a6 6 0 0 0-12 0c0 5.67 6 11 6 11Z"/>
      <circle cx="12" cy="10" r="2.25"/>
    </svg>
  `
};

// ================= UI =================
const show = e => e.classList.remove('hidden');
const hide = e => e.classList.add('hidden');

const showSuccess = msg => {
  el.successMsg.textContent = msg;
  show(el.success);
  setTimeout(() => hide(el.success), 2000);
};

const showError = msg => {
  el.errorMsg.textContent = msg;
  show(el.error);
};

// ================= API =================
const request = async (url = '', options = {}) => {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Lỗi server');
  return data;
};

// ================= LOAD =================
const fetchContacts = async () => {
  try {
    contacts = await request('');
    applyFilter();
  } catch {
    showError('không thể tải danh bạ');
  }
};

// ================= RENDER =================
const render = list => {
  el.grid.innerHTML = list.length
    ? list.map(c => `
      <article class="flex min-h-[260px] flex-col justify-between rounded-2xl border bg-[#FFFFFF] p-6 shadow-sm">
        <div>
          <h2 class="mb-4 text-xl font-bold">${c.name}</h2>
          <div class="space-y-3 text-base text-[#4B5563]">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 text-[#4B5563]">${ICONS.phone}</span>
              <span>${c.phone}</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="mt-0.5 text-[#4B5563]">${ICONS.email}</span>
              <span>${c.email || ''}</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="mt-0.5 text-[#4B5563]">${ICONS.address}</span>
              <span>${c.address || ''}</span>
            </div>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <button onclick="editContact('${c.id}')" class="rounded-xl border py-3 text-base font-medium hover:bg-[#F3F4F6]">Sửa</button>
          <button onclick="openDelete('${c.id}')" class="rounded-xl border py-3 text-base font-medium text-[#EF4444] hover:bg-[#FEE2E2]">Xóa</button>
        </div>
      </article>
    `).join('')
        : `<p class="col-span-full py-14 text-center text-lg text-[#4B5563]">Chưa có danh bạ nào .Hãy thêm danh bạ mới !</p>`;
};

// ================= SEARCH =================
const applyFilter = () => {
  const k = searchTerm.toLowerCase();

  render(
    contacts.filter(c =>
      [c.name, c.phone, c.email, c.address]
        .some(v => (v || '').toLowerCase().includes(k))
    )
  );
};

el.search.oninput = e => {
  searchTerm = e.target.value;
  applyFilter();
};

// ================= MODAL =================
const openModal = (mode = 'create', data = {}) => {
  editingId = mode === 'edit' ? data.id : null;

  el.formTitle.textContent =
    mode === 'edit' ? 'Chỉnh sửa danh bạ' : 'Thêm Danh bạ Mới';

  el.form.reset();

  if (mode === 'edit') {
    el.name.value = data.name || '';
    el.phone.value = data.phone || '';
    el.email.value = data.email || '';
    el.address.value = data.address || '';
  }

  show(el.modal);
  el.modal.classList.add('flex');
};

const closeModal = () => {
  hide(el.modal);
  el.modal.classList.remove('flex');
};

// ================= CREATE =================
el.openCreate.onclick = () => openModal('create');

// ================= EDIT =================
window.editContact = async id => {
  try {
    const data = await request(`/${id}`);
    openModal('edit', data);
  } catch {
    showError('Không thể tải dữ liệu');
  }
};

// ================= DELETE =================
window.openDelete = id => {
  deletingId = String(id);

  show(el.deleteModal);
  el.deleteModal.classList.add('flex');
};

const closeDeleteModal = () => {
  hide(el.deleteModal);
  el.deleteModal.classList.remove('flex');
  deletingId = null;
};

el.confirmDelete.onclick = async () => {
  if (!deletingId) return;

  const id = String(deletingId);

  closeDeleteModal();

  try {
    await request(`/${id}`, { method: 'DELETE' });

    contacts = contacts.filter(c => String(c.id) !== id);
    applyFilter();

    showSuccess('Xóa thành công');
  } catch (err) {
    console.log(err);
    showError('Xóa thất bại');
  }
};

el.cancelDelete.onclick = closeDeleteModal;

el.deleteModal.onclick = e => {
  if (e.target === el.deleteModal) closeDeleteModal();
};

// ================= SUBMIT (FIXED CORE BUG HERE) =================
el.form.onsubmit = async e => {
  e.preventDefault();

  const data = {
    name: el.name.value,
    phone: el.phone.value,
    email: el.email.value,
    address: el.address.value
  };

  try {
    const saved = await request(
      editingId ? `/${editingId}` : '',
      {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(data)
      }
    );

    // Ä‘Å¸â€Â¥ UPDATE LOCAL STATE (KHÄ‚â€NG fetchContacts nĂ¡Â»Â¯a)
    if (editingId) {
      contacts = contacts.map(c =>
        String(c.id) === String(editingId)
          ? { ...c, ...data }
          : c
      );
    } else {
      contacts.push(saved);
    }

    applyFilter();
    closeModal();
    showSuccess(editingId ? 'Cập nhật thành công' : 'Thêm thành công');

  } catch {
    showError('Lưu thất bại');
  }
};

// ================= EVENTS =================
el.retry.onclick = fetchContacts;
el.dismiss.onclick = () => hide(el.success);

el.closeModal.onclick = closeModal;
el.cancelBtn.onclick = closeModal;

el.modal.onclick = e => {
  if (e.target === el.modal) closeModal();
};

// ================= INIT =================
fetchContacts();

