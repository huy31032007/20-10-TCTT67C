'use strict';
(() => {
  const el = id => document.getElementById(id);
  let token = '', busy = false;
  const status = message => { el('adminStatus').textContent = message; };
  const setBusy = value => {
    busy = value;
    document.querySelectorAll('button').forEach(button => { button.disabled = value; });
    el('adminPassword').disabled = value;
  };
  function logout() {
    token = ''; el('adminPassword').value = ''; el('members').replaceChildren();
    el('managePanel').hidden = true; el('loginPanel').hidden = false;
    status('Đã đăng xuất.'); el('adminPassword').focus();
  }
  async function request(method = 'GET', id) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/admin/garden', {
        method, cache: 'no-store', credentials: 'same-origin', signal: controller.signal,
        headers: { Authorization: `Bearer ${token}`, ...(id ? { 'Content-Type': 'application/json' } : {}) },
        ...(id ? { body: JSON.stringify({ id }) } : {})
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) logout();
        throw new Error(data.error || 'Chưa kết nối được với vườn.');
      }
      return data;
    } finally { clearTimeout(timer); }
  }
  function render(garden) {
    el('memberCount').textContent = `${garden.members.length} cụm hoa`;
    const rows = garden.members.map(member => {
      const row = document.createElement('li'), name = document.createElement('span'), button = document.createElement('button');
      name.textContent = member.name;
      button.type = 'button'; button.className = 'danger'; button.textContent = 'Xóa';
      button.setAttribute('aria-label', `Xóa hoa của ${member.name}`);
      button.addEventListener('click', () => remove(member));
      row.append(name, button); return row;
    });
    if (!rows.length) {
      const empty = document.createElement('li'); empty.textContent = 'Vườn đang trống.'; rows.push(empty);
    }
    el('members').replaceChildren(...rows);
  }
  async function load() {
    if (busy) return;
    setBusy(true); status('Đang tải vườn…');
    try {
      render(await request());
      el('loginPanel').hidden = true; el('managePanel').hidden = false;
      el('adminPassword').value = ''; status('Đã kết nối với vườn.');
    } catch (error) { status(error.name === 'AbortError' ? 'Kết nối quá lâu. Hãy thử lại.' : error.message); }
    finally { setBusy(false); }
  }
  async function remove(member) {
    if (busy) return;
    const dialog = el('deleteDialog');
    el('deleteDescription').textContent = `Xóa cụm hoa của ${member.name} khỏi vườn chung? Thao tác này không có nút hoàn tác.`;
    dialog.returnValue = 'cancel'; dialog.showModal();
    const confirmed = await new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true }));
    if (!confirmed) return;
    setBusy(true); status('Đang xóa cụm hoa…');
    try { render((await request('DELETE', member.id)).garden); status(`Đã xóa cụm hoa của ${member.name}.`); }
    catch (error) { status(error.name === 'AbortError' ? 'Chưa xác nhận được kết quả. Bấm Tải lại trước khi thử tiếp.' : error.message); }
    finally { setBusy(false); }
  }
  el('loginForm').addEventListener('submit', event => {
    event.preventDefault(); if (busy) return;
    token = el('adminPassword').value;
    load();
  });
  el('refreshMembers').addEventListener('click', load);
  el('logout').addEventListener('click', logout);
  window.addEventListener('pagehide', () => { token = ''; el('adminPassword').value = ''; });
})();
