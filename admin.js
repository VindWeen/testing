// ===== admin.js =====

// Lấy data
function getData() {
  return {
    globalAwards: JSON.parse(localStorage.getItem('awards')) || [],
    users: JSON.parse(localStorage.getItem('users')) || {}
  };
}

// ===== QUẢN LÝ GIẢI THƯỞNG =====

// Hiển thị giải thưởng chờ duyệt
function renderPendingAwards() {
  const container = document.getElementById('pendingAwardsContainer');
  container.innerHTML = '';
  let awards = JSON.parse(localStorage.getItem('awards')) || [];
  const pending = awards.filter(a => a.status === 'pending');
  if (pending.length === 0) {
    container.innerHTML = '<p>Không có giải thưởng chờ duyệt.</p>';
    return;
  }
  pending.forEach((award, idx) => {
    const div = document.createElement('div');
    div.className = 'award-row';
    div.style = 'border:1px solid #bbb; padding:8px; margin-bottom:8px;';
    div.innerHTML = `
      <b>${idx+1}. ${award.title}</b> - <i>${award.tenCuocThi}</i><br>
      Tác giả: ${award.tacGia}, Đơn vị: ${award.diaChi}, Giải: ${award.datGiai}, Tiền: ${award.tien}<br>
      Minh chứng: ${(award.minhChung && award.minhChung.length) ? `<img src="${award.minhChung[0]}" width="50" />` : 'Không có'}<br>
      Link: <a href="${award.link}" target="_blank">Xem</a>
      <br>
      <button onclick="approveAward(${award.awardId})">Duyệt</button>
    `;
    container.appendChild(div);
  });
}

// Hiển thị giải thưởng đã duyệt
function renderApprovedAwardsAdmin() {
  const container = document.getElementById('approvedAwardsContainer');
  container.innerHTML = '';
  let awards = JSON.parse(localStorage.getItem('awards')) || [];
  const approved = awards.filter(a => a.status === 'approved');
  if (approved.length === 0) {
    container.innerHTML = '<p>Không có giải thưởng đã duyệt.</p>';
    return;
  }
  approved.forEach((award, idx) => {
    const div = document.createElement('div');
    div.className = 'award-row';
    div.style = 'border:1px solid #bbb; padding:8px; margin-bottom:8px;';
    div.innerHTML = `
      <b>${idx+1}. ${award.title}</b> - <i>${award.tenCuocThi}</i><br>
      Tác giả: ${award.tacGia}, Đơn vị: ${award.diaChi}, Giải: ${award.datGiai}, Tiền: ${award.tien}<br>
      Minh chứng: ${(award.minhChung && award.minhChung.length) ? `<img src="${award.minhChung[0]}" width="50" />` : 'Không có'}<br>
      Link: <a href="${award.link}" target="_blank">Xem</a>
      <br>
      <span style="color:green;">Đã duyệt</span>
    `;
    container.appendChild(div);
  });
}

// Hàm xử lý duyệt giải thưởng
function approveAward(awardId) {
  let awards = JSON.parse(localStorage.getItem('awards')) || [];
  let awardIdx = awards.findIndex(a => a.awardId == awardId);
  if (awardIdx === -1) return alert('Không tìm thấy giải thưởng!');

  // Update status
  awards[awardIdx].status = 'approved';
  localStorage.setItem('awards', JSON.stringify(awards));

  // Update cả user awards
  let users = JSON.parse(localStorage.getItem('users')) || {};
  Object.keys(users).forEach(userKey => {
    if (Array.isArray(users[userKey].awards)) {
      users[userKey].awards.forEach(a => {
        if (a.awardId == awardId) a.status = 'approved';
      });
    }
  });
  localStorage.setItem('users', JSON.stringify(users));

  alert('Đã duyệt giải thưởng!');
  renderPendingAwards();
  renderApprovedAwardsAdmin();

  // Nếu bạn có các bảng tài khoản, hãy gọi hàm render lại bảng nếu cần
  // renderUserTableBody();
}

// Gọi khi vào trang
window.addEventListener('DOMContentLoaded', () => {
  renderPendingAwards();
  renderApprovedAwardsAdmin();
});

window.onload = function() {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  const clients = Object.entries(users)
    .filter(([_, u]) => u.role === 'client')
    .sort((a, b) => (a[1].orderIndex ?? 9999) - (b[1].orderIndex ?? 9999));

  const tbody = document.getElementById('userTableBody');

  function renderUserTable(userList) {
    tbody.innerHTML = '';
    userList.forEach(([email, data]) => {
      const info = data.info || {};
      const row = `<tr>
        <td>${info.fullName || ''}</td>
        <td>${info.dob || ''}</td>
        <td>${info.gender || ''}</td>
        <td>${info.cccd || ''}</td>
        <td>${email}</td>
        <td>${info.phone || ''}</td>
        <td>${info.position || ''}</td>
        <td>
          <a href="test.html?user=${encodeURIComponent(email)}" target="_blank">Xem</a>
          <a class="delete-btn" data-email="${email}">Xóa</a>
        </td>
      </tr>`;
      tbody.innerHTML += row;
    });
    addDeleteEvent();
  }

  function addDeleteEvent() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.onclick = () => {
        const email = btn.dataset.email;
        if (confirm(`Bạn chắc chắn muốn xóa user ${email}?`)) {
          delete users[email];
          localStorage.setItem('users', JSON.stringify(users));
          const index = clients.findIndex(([em, _]) => em === email);
          if (index !== -1) clients.splice(index, 1);
          renderUserTable(clients);
        }
      };
    });
  }

  renderUserTable(clients);

  // ✅ Sortable chỉ cần init 1 lần duy nhất
  new Sortable(tbody, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: function () {
      const newOrderEmails = Array.from(tbody.querySelectorAll('tr')).map(tr => {
        const emailCell = tr.querySelector('td:nth-child(5)');
        return emailCell?.textContent?.trim();
      });

      newOrderEmails.forEach((email, index) => {
        if (users[email]) {
          users[email].orderIndex = index;
        }
      });

      localStorage.setItem('users', JSON.stringify(users));
    }
  });

  const positionOrder = {
    "Giáo sư": 5,
    "Phó giáo sư": 4,
    "Giảng viên": 3,
    "Chuyên viên": 2,
    "": 1
  };

  document.getElementById('sortPositionBtn').onclick = () => {
    const sorted = clients.sort((a, b) => {
      const posA = positionOrder[(a[1].info?.position || '').trim()] ?? 1;
      const posB = positionOrder[(b[1].info?.position || '').trim()] ?? 1;
      return posB - posA;
    });

    sorted.forEach(([email, data], index) => {
      data.orderIndex = index;
    });

    localStorage.setItem('users', JSON.stringify(users));
    renderUserTable(sorted);
  };
};
