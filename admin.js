window.onload = function() {
  const users = JSON.parse(localStorage.getItem('users')) || {};

  // Lọc clients và sort theo orderIndex
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
        <td class="actions-cell">
          <a href="test.html?user=${encodeURIComponent(email)}" target="_blank">Xem</a>
          <a class="delete-btn" data-email="${email}">Xóa</a>
        </td>
      </tr>`;
      tbody.innerHTML += row;
    });
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
          addDeleteEvent(); // Gắn lại
        }
      };
    });
  }

  renderUserTable(clients);
  addDeleteEvent();

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

    // Gán lại orderIndex mới
    sorted.forEach(([email, data], index) => {
      data.orderIndex = index;
    });

    localStorage.setItem('users', JSON.stringify(users));

    renderUserTable(sorted);
    addDeleteEvent();
  };

  new Sortable(tbody, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: function () {
      // Sau khi kéo thả xong, lưu lại thứ tự mới
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
};
