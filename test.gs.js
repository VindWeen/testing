if (!currentCCCD) {
  alert("Bạn chưa đăng nhập!");
  window.location.href = "index.html";
}
/* =========  HÀM TIỆN ÍCH GỌI API  ========= */
async function callAPI(params){
  const body = new URLSearchParams(params);
  const res  = await fetch(scriptURL, { method:'POST', body });
  return res.text();            // Apps Script trả về chuỗi (JSON hoặc plain)
}

/* =========  PERSONAL – sheet: Personal  ========= */
const infoForm         = document.getElementById('infoForm');
const infoTableHolder  = document.getElementById('infoTableContainer');
const btnSavePersonal  = document.getElementById('btnSave');

/* Tải dữ liệu cá nhân ngay khi vào trang */
loadPersonal();
async function loadPersonal(){
  const txt = await callAPI({
    action : 'loadSingle',
    sheet  : 'Personal',
    cccd   : currentCCCD
  });
  const data = JSON.parse(txt || '{}');
  for (const k in data) if (infoForm[k]) infoForm[k].value = data[k];
  renderInfoTable(data);
}

/* Lưu thông tin cá nhân */
btnSavePersonal.onclick = async ()=>{
  const obj = { cccd: currentCCCD };
  Array.from(infoForm.elements).forEach(el=>{ if(el.id) obj[el.id] = el.value; });

  await callAPI({
    action : 'saveSingle',
    sheet  : 'Personal',
    cccd   : currentCCCD,
    data   : JSON.stringify(obj)
  });
  alert('Đã lưu thông tin cá nhân!');
  renderInfoTable(obj);
};

/* Hàm dựng bảng preview */
function renderInfoTable(d){
  const label = {fullName:'Họ và tên',dob:'Ngày sinh',gender:'Giới tính',degree:'Học vị',
    academicTitle:'Học hàm',position:'Chức vụ',year:'Năm công nhận',
    hometown:'Quê quán',ethnicity:'Dân tộc',cccd:'CCCD',email:'Email',altEmail:'Email phụ',
    phone:'SĐT',workplace:'Nơi công tác',workAddress:'Địa chỉ cơ quan',province:'Tỉnh/TP'};
  let html='<table class="info-table">';
  Object.keys(label).forEach(k=>{
     html += `<tr><td>${label[k]}</td><td>${d[k]||''}</td></tr>`;
  });
  html+='</table>';
  infoTableHolder.innerHTML = html;
}

/* =========  LIST-GENERIC  ========= */
function buildListModule(sheetName, localList, renderFn, saveBtnId){
  /* load */
  (async ()=>{
    const txt = await callAPI({
      action:'loadList', sheet:sheetName, cccd:currentCCCD
    });
    localList.splice(0,localList.length,...JSON.parse(txt||'[]').map(r=>{
      // bỏ cccd & idx, giữ field còn lại
      const o = {...r}; delete o.CCCD; delete o['Số thứ tự (idx)']; return o;
    }));
    renderFn();
  })();

  /* save */
  document.getElementById(saveBtnId).onclick = async ()=>{
    await callAPI({
      action:'saveList',
      sheet : sheetName,
      cccd  : currentCCCD,
      data  : JSON.stringify(localList)
    });
    alert(`Đã lưu ${sheetName}!`);
  };
}

/* =========  EDUCATION  ========= */
const eduForm = document.getElementById('eduForm');
const eduBody = document.querySelector('#eduTable tbody');
const eduList = [];
buildListModule('Education', eduList, renderEdu, 'btnSaveEdu');

eduForm.onsubmit = e=>{
  e.preventDefault();
  eduList.push({
    degree : document.getElementById('eduDegree').value.trim(),
    major  : document.getElementById('eduMajor').value.trim(),
    school : document.getElementById('eduSchool').value.trim(),
    country: document.getElementById('eduCountry').value.trim(),
    year   : document.getElementById('eduYear').value.trim()
  });
  renderEdu();
  eduForm.reset();
};
function renderEdu(){
  eduBody.innerHTML = eduList.map((ed,i)=>`
    <tr>
      <td>${i+1}</td><td>${ed.degree}</td><td>${ed.major}</td><td>${ed.school}</td>
      <td>${ed.country}</td><td>${ed.year}</td>
      <td><button data-i="${i}" class="delEdu">Xóa</button></td>
    </tr>`).join('');
  document.querySelectorAll('.delEdu').forEach(btn=>{
    btn.onclick=()=>{ eduList.splice(btn.dataset.i,1); renderEdu(); };
  });
}

/* =========  WORK  ========= */
const workForm = document.getElementById('workForm');
const workBody = document.querySelector('#workTable tbody');
const workList = [];
buildListModule('Work', workList, renderWork, 'btnSaveWork');

workForm.onsubmit = e=>{
  e.preventDefault();
  workList.push({
    time : document.getElementById('workTime').value.trim(),
    place: document.getElementById('workPlace').value.trim(),
    job  : document.getElementById('workJob').value.trim()
  });
  renderWork(); workForm.reset();
};
function renderWork(){
  workBody.innerHTML = workList.map((w,i)=>`
    <tr>
      <td>${i+1}</td><td>${w.time}</td><td>${w.place}</td><td>${w.job}</td>
      <td><button data-i="${i}" class="delWork">Xóa</button></td>
    </tr>`).join('');
  document.querySelectorAll('.delWork').forEach(btn=>{
    btn.onclick=()=>{ workList.splice(btn.dataset.i,1); renderWork(); };
  });
}

/* =========  Lặp lại tương tự cho Language / Experience / Achievement / Research / Projects / Publications ========= */
/* Chỉ cần copy‑paste: đổi sheetName, localList, các field, renderFn & form xử lý */

/* ============ LANGUAGE =============================== */
const languageForm = document.getElementById('languageForm');
const languageBody = document.querySelector('#languageTable tbody');
const languageList = [];
buildListModule('Language', languageList, renderLang, 'btnSaveLanguage');

languageForm.onsubmit = e=>{
  e.preventDefault();
  languageList.push({
    language: document.getElementById('languageName').value.trim(),
    read    : document.getElementById('langRead').value.trim(),
    write   : document.getElementById('langWrite').value.trim(),
    listen  : document.getElementById('langListen').value.trim(),
    speak   : document.getElementById('langSpeak').value.trim()
  });
  renderLang(); languageForm.reset();
};
function renderLang(){
  languageBody.innerHTML = languageList.map((l,i)=>`
    <tr>
      <td>${i+1}</td><td>${l.language}</td><td>${l.read}</td><td>${l.write}</td>
      <td>${l.listen}</td><td>${l.speak}</td>
      <td><button data-i="${i}" class="delLang">Xóa</button></td>
    </tr>`).join('');
  document.querySelectorAll('.delLang').forEach(btn=>{
    btn.onclick = ()=>{ languageList.splice(btn.dataset.i,1); renderLang(); };
  });
}

/* ============ EXPERIENCE ============================= */
const experienceForm = document.getElementById('experienceForm');
const experienceListEl = document.getElementById('experienceList');
const experienceList = [];
buildListModule('Experience', experienceList, renderExp, 'btnSaveExperience');

experienceForm.onsubmit = e=>{
  e.preventDefault();
  const v = document.getElementById('experienceInput').value.trim();
  if (v){ experienceList.push({experience:v}); renderExp(); experienceForm.reset(); }
};
function renderExp(){
  experienceListEl.innerHTML = experienceList.map((e,i)=>`
    <li>${e.experience}
      <button data-i="${i}" class="delExp">Xóa</button>
    </li>`).join('');
  document.querySelectorAll('.delExp').forEach(btn=>{
    btn.onclick=()=>{ experienceList.splice(btn.dataset.i,1); renderExp(); };
  });
}

/* ============ ACHIEVEMENT ============================ */
const achievementForm = document.getElementById('achievementForm');
const achievementListEl = document.getElementById('achievementList');
const achievementList = [];
buildListModule('Achievement', achievementList, renderAch, 'btnSaveAchievement');

achievementForm.onsubmit = e=>{
  e.preventDefault();
  const v = document.getElementById('achievementInput').value.trim();
  if (v){ achievementList.push({achievement:v}); renderAch(); achievementForm.reset(); }
};
function renderAch(){
  achievementListEl.innerHTML = achievementList.map((a,i)=>`
    <li>${a.achievement}
      <button data-i="${i}" class="delAch">Xóa</button>
    </li>`).join('');
  document.querySelectorAll('.delAch').forEach(btn=>{
    btn.onclick=()=>{ achievementList.splice(btn.dataset.i,1); renderAch(); };
  });
}

/* ============ RESEARCH =============================== */
const researchForm = document.getElementById('researchForm');
const researchListEl = document.getElementById('researchList');
const researchList = [];
buildListModule('Research', researchList, renderRes, 'btnSaveResearch');

researchForm.onsubmit = e=>{
  e.preventDefault();
  const v = document.getElementById('researchInput').value.trim();
  if (v){ researchList.push({topic:v}); renderRes(); researchForm.reset(); }
};
function renderRes(){
  researchListEl.innerHTML = researchList.map((r,i)=>`
    <li>${r.topic}
      <button data-i="${i}" class="delRes">Xóa</button>
    </li>`).join('');
  document.querySelectorAll('.delRes').forEach(btn=>{
    btn.onclick=()=>{ researchList.splice(btn.dataset.i,1); renderRes(); };
  });
}

/* ============ PROJECTS =============================== */
const projectForm = document.getElementById('projectForm');
const projectBody = document.querySelector('#projectTable tbody');
const projectList = [];
buildListModule('Projects', projectList, renderProj, 'btnSaveProjects');

projectForm.onsubmit = e=>{
  e.preventDefault();
  projectList.push({
    name   : document.getElementById('projectName').value.trim(),
    agency : document.getElementById('fundingAgency').value.trim(),
    duration: document.getElementById('duration').value.trim(),
    role   : document.getElementById('role').value.trim()
  });
  renderProj(); projectForm.reset();
};
function renderProj(){
  projectBody.innerHTML = projectList.map((p,i)=>`
    <tr>
      <td>${i+1}</td><td>${p.name}</td><td>${p.agency}</td>
      <td>${p.duration}</td><td>${p.role}</td>
      <td><button data-i="${i}" class="delProj">Xóa</button></td>
    </tr>`).join('');
  document.querySelectorAll('.delProj').forEach(btn=>{
    btn.onclick=()=>{ projectList.splice(btn.dataset.i,1); renderProj(); };
  });
}

/* ============ PUBLICATIONS =========================== */
const pubBody = document.getElementById('pubTableBody');
const publicationList = [];
buildListModule('Publications', publicationList, renderPub, 'btnSavePublication');

document.getElementById('btnAddPublication').onclick = ()=>{
  const author  = document.getElementById('pubAuthor').value.trim();
  const title   = document.getElementById('pubTitle').value.trim();
  const journal = document.getElementById('pubJournal').value.trim();
  const note    = document.getElementById('pubNote').value.trim();
  if (author && title && journal){
    publicationList.push({author,title,journal,note});
    renderPub();
    ['pubAuthor','pubTitle','pubJournal','pubNote'].forEach(id=>document.getElementById(id).value='');
  }
};
function renderPub(){
  pubBody.innerHTML = publicationList.map((p,i)=>`
    <tr>
      <td>${i+1}</td><td>${p.author}</td><td>${p.title}</td>
      <td>${p.journal}</td><td>${p.note}</td>
      <td><button data-i="${i}" class="delPub">Xóa</button></td>
    </tr>`).join('');
  document.querySelectorAll('.delPub').forEach(btn=>{
    btn.onclick=()=>{ publicationList.splice(btn.dataset.i,1); renderPub(); };
  });
}

function toWord() {
  // Lấy user đang xem
  const userData = users[viewingUser] || {};

  const info = userData.info || {};
  const workList = userData.workList || [];
  const languages = userData.languageList || [];
  const experienceList = userData.experienceList || [];
  const achievementList = userData.achievementList || [];
  const researchList = userData.researchList || [];
  const projectList = userData.projectList || [];
  const publicationList = userData.publicationList || [];

  let html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: Segoe UI, sans-serif; padding: 20px; }
      h2 { color: #0d47a1; border-bottom: 1px solid #90caf9; padding-bottom: 4px; }
      .section { margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      td, th { border: 1px solid #000; padding: 8px; }
      th { background: #e3f2fd; color: #0d47a1; text-align: left; }
      ul { margin: 0; padding-left: 20px; }
    </style>
  </head>
  <body>
    <h2>A. Thông tin cá nhân</h2>
    <table>
      <tr><th>Họ và tên</th><td>${info.fullName || ''}</td></tr>
      <tr><th>Ngày sinh</th><td>${info.dob ? new Date(info.dob).toLocaleDateString('vi-VN') : ''}</td></tr>
      <tr><th>Giới tính</th><td>${info.gender || ''}</td></tr>
      <tr><th>Số CCCD</th><td>${info.cccd || ''}</td></tr>
      <tr><th>Email</th><td>${info.email || ''}</td></tr>
      <tr><th>Số điện thoại</th><td>${info.phone || ''}</td></tr>
    </table>

    <div class="section">
      <h2>B. Quá trình công tác chuyên môn</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Thời gian</th>
            <th>Nơi công tác</th>
            <th>Công việc đảm nhiệm</th>
          </tr>
        </thead>
        <tbody>
          ${workList.map((w, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${w.time}</td>
              <td>${w.place}</td>
              <td>${w.job}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>C. Ngoại ngữ</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Ngoại ngữ</th>
            <th>Đọc</th>
            <th>Viết</th>
            <th>Nghe</th>
            <th>Nói</th>
          </tr>
        </thead>
        <tbody>
          ${languages.map((l, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${l.language}</td>
              <td>${l.read}</td>
              <td>${l.write}</td>
              <td>${l.listen}</td>
              <td>${l.speak}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
  <h2>D. Kinh nghiệm & Thành tích</h2>
  <h3>1. Kinh nghiệm</h3>
  <ul>
    ${experienceList.map(item => `<li>${item}</li>`).join('')}
  </ul>
  <h3>2. Thành tích</h3>
  <ul>
    ${achievementList.map(item => `<li>${item}</li>`).join('')}
  </ul>
</div>


    <div class="section">
      <h2>E. Hướng nghiên cứu</h2>
      <ul>
        ${researchList.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h2>F. Đề tài nghiên cứu</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Tên đề tài</th>
            <th>Cơ quan tài trợ</th>
            <th>Thời gian</th>
            <th>Vai trò</th>
          </tr>
        </thead>
        <tbody>
          ${projectList.map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${p.name}</td>
              <td>${p.agency}</td>
              <td>${p.time}</td>
              <td>${p.role}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>G. Công bố khoa học</h2>
      <table>
        <thead>
          <tr>
            <th>TT</th>
            <th>Tác giả</th>
            <th>Tên công trình</th>
            <th>Tạp chí / Hội thảo</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${publicationList.map((p, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${p.author}</td>
              <td>${p.title}</td>
              <td>${p.journal}</td>
              <td>${p.note}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

  </body>
</html>`;

  // Tạo file Word
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Thong_tin_cv-${Date.now()}.doc`;
  link.click();
  URL.revokeObjectURL(url);
}
