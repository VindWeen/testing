// === QUẢN LÝ GIẢI THƯỞNG ===

// Đảm bảo có loggedInUser
if (!localStorage.getItem('loggedInUser')) {
  localStorage.setItem('loggedInUser', 'guest');
}

// Khi submit form
document.getElementById('awardForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = e.target;

  const newAward = {
    awardId: Date.now(),
    tenDeTai: form.elements['tenDeTai'].value.trim(),
    tenCuocThi: form.elements['tenCuocThi'].value.trim(),
    tacGia: form.elements['tacGia'].value.trim(),
    diaChi: form.elements['donVi'].value.trim(),
    datGiai: form.elements['datGiai'].value.trim(),
    tien: form.elements['tien'].value.trim(),
    ghiChu: form.elements['ghiChu'].value.trim(),
    link: form.elements['link'].value.trim(),
    status: 'pending',
    user: localStorage.getItem('loggedInUser')
  };

  let users = JSON.parse(localStorage.getItem('users')) || {};
  const viewingUser = newAward.user;

  if (!users[viewingUser]) {
    users[viewingUser] = { awards: [] };
  }
  users[viewingUser].awards.push(newAward);
  localStorage.setItem('users', JSON.stringify(users));

  let globalAwards = JSON.parse(localStorage.getItem('awards')) || [];
  globalAwards.push(newAward);
  localStorage.setItem('awards', JSON.stringify(globalAwards));

  alert('Đã lưu giải thưởng!');
  form.reset();
  renderAwardTable();
  renderApprovedAwards();
});

// Bảng chờ xét duyệt
function renderAwardTable() {
  const viewingUser = localStorage.getItem('loggedInUser');
  const users = JSON.parse(localStorage.getItem('users')) || {};
  const awards = (users[viewingUser] && users[viewingUser].awards) || [];

  const tbody = document.getElementById('awardTableBody');
  tbody.innerHTML = '';

  awards.filter(a => a.status === 'pending').forEach((award, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${award.tenDeTai}</td>
      <td>${award.tenCuocThi}</td>
      <td>${award.tacGia}</td>
      <td>${award.diaChi}</td>
      <td>${award.datGiai}</td>
      <td>${award.tien}</td>
      <td>${award.ghiChu}</td>
      <td><a href="${award.link}" target="_blank">Link</a></td>
      <td>${award.status}</td>
      <td><button onclick="deleteAward(${award.awardId})">Xóa</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Bảng đã duyệt
function renderApprovedAwards() {
  const awards = JSON.parse(localStorage.getItem('awards')) || [];
  const approved = awards.filter(a => a.status === 'approved');

  const tbody = document.getElementById('awardApprovedTableBody');
  tbody.innerHTML = '';

  approved.forEach((award, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${award.tenDeTai}</td>
      <td>${award.tenCuocThi}</td>
      <td>${award.tacGia}</td>
      <td>${award.diaChi}</td>
      <td>${award.datGiai}</td>
      <td>${award.tien}</td>
      <td>${award.ghiChu}</td>
      <td><a href="${award.link}" target="_blank">Link</a></td>
      <td>${award.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Xóa
function deleteAward(id) {
  let users = JSON.parse(localStorage.getItem('users')) || {};
  let global = JSON.parse(localStorage.getItem('awards')) || [];
  const viewingUser = localStorage.getItem('loggedInUser');

  if (users[viewingUser]) {
    users[viewingUser].awards = users[viewingUser].awards.filter(a => a.awardId != id);
  }
  global = global.filter(a => a.awardId != id);

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('awards', JSON.stringify(global));

  alert('Đã xóa!');
  renderAwardTable();
  renderApprovedAwards();
}

// Load trang thì render ngay
window.addEventListener('load', () => {
  renderAwardTable();
  renderApprovedAwards();
});
