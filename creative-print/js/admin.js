// ============ الإعدادات ============
const API_BASE = 'api/'; // مسار ملفات PHP

const SECTIONS = {
  certificates: ['SCHOOL', 'SPORT', 'EVENT'],
  badges:       ['GOLD', 'SILVER', 'BRONZE'],
  invitations:  ['WEDDING', 'BIRTHDAY', 'GRADUATION'],
  gifts:        ['MUGS', 'TSHIRTS', 'FRAMES'],
};

let selectedFiles = [];

// ============ التحقق من صلاحيات المسؤول ============
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    alert('يجب تسجيل دخول المسؤول أولاً');
    location.href = 'index.html';
    return;
  }
  updateCategories();
  loadExisting();
});

// ============ تحديث التصنيفات ============
function updateCategories() {
  const section = document.getElementById('sectionSelect').value;
  const catSelect = document.getElementById('categorySelect');
  catSelect.innerHTML = SECTIONS[section]
    .map(c => `<option value="${c}">${c}</option>`)
    .join('');
}

// ============ السحب والإفلات ============
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

// ============ معالجة الملفات المختارة ============
function handleFiles(files) {
  for (const file of files) {
    selectedFiles.push(file);
  }
  renderPreview();
}

function renderPreview() {
  const preview = document.getElementById('filesPreview');
  preview.innerHTML = '';

  selectedFiles.forEach((file, index) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
    
    const div = document.createElement('div');
    div.className = 'file-preview';
    
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        div.innerHTML = `
          <button class="remove-btn" onclick="removeFile(${index})">×</button>
          <img src="${e.target.result}" alt="${file.name}">
          <div class="file-info">
            <span class="file-type-badge badge-image">صورة</span>
            <div style="margin-top:3px">${file.name}</div>
          </div>
        `;
      };
      reader.readAsDataURL(file);
    } else {
      div.innerHTML = `
        <button class="remove-btn" onclick="removeFile(${index})">×</button>
        <div style="height:120px;display:flex;align-items:center;justify-content:center;background:#fce4ec">
          <span class="material-icons-outlined" style="font-size:50px;color:#c2185b">description</span>
        </div>
        <div class="file-info">
          <span class="file-type-badge badge-ai">${ext.toUpperCase()}</span>
          <div style="margin-top:3px">${file.name}</div>
        </div>
      `;
    }
    
    preview.appendChild(div);
  });

  document.getElementById('uploadBtn').disabled = selectedFiles.length === 0;
  document.getElementById('uploadBtn').textContent = 
    selectedFiles.length > 0 ? `رفع ${selectedFiles.length} ملف` : 'رفع الملفات';
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderPreview();
}

// ============ رفع الملفات للسيرفر ============
async function uploadFiles() {
  if (selectedFiles.length === 0) return;

  const token = localStorage.getItem('adminToken');
  const section = document.getElementById('sectionSelect').value;
  const category = document.getElementById('categorySelect').value;

  const formData = new FormData();
  formData.append('section', section);
  formData.append('category', category);
  
  selectedFiles.forEach(file => {
    formData.append('files[]', file);
  });

  const btn = document.getElementById('uploadBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  
  btn.disabled = true;
  btn.textContent = 'جاري الرفع...';
  progressBar.style.display = 'block';

  try {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        progressFill.style.width = percent + '%';
      }
    });

    xhr.addEventListener('load', () => {
      const response = JSON.parse(xhr.responseText);
      if (response.success) {
        alert(`✅ تم رفع ${response.count} ملف بنجاح!`);
        selectedFiles = [];
        renderPreview();
        loadExisting();
      } else {
        alert('❌ خطأ: ' + (response.error || 'فشل الرفع'));
      }
      btn.disabled = false;
      btn.textContent = 'رفع الملفات';
      progressBar.style.display = 'none';
      progressFill.style.width = '0%';
    });

    xhr.addEventListener('error', () => {
      alert('❌ خطأ في الاتصال بالسيرفر');
      btn.disabled = false;
      progressBar.style.display = 'none';
    });

    xhr.open('POST', API_BASE + 'upload.php');
    xhr.setRequestHeader('X-Admin-Token', token);
    xhr.send(formData);

  } catch (e) {
    alert('❌ خطأ: ' + e.message);
    btn.disabled = false;
    progressBar.style.display = 'none';
  }
}

// ============ عرض الملفات الموجودة ============
async function loadExisting() {
  const section = document.getElementById('sectionSelect').value;
  const category = document.getElementById('categorySelect').value;
  const token = localStorage.getItem('adminToken');

  const container = document.getElementById('existingFiles');
  container.innerHTML = '<p>⏳ جاري التحميل...</p>';

  try {
    const res = await fetch(`${API_BASE}list.php?section=${section}&category=${category}`, {
      headers: { 'X-Admin-Token': token }
    });
    const data = await res.json();

    if (!data.files || data.files.length === 0) {
      container.innerHTML = '<p style="color:#999">📭 لا توجد ملفات في هذا التصنيف</p>';
      return;
    }

    container.innerHTML = `
      <p style="margin-bottom:10px">📊 المجموع: <b>${data.files.length}</b> ملف</p>
      <div class="files-preview">
        ${data.files.map(f => `
          <div class="file-preview">
            <img src="${f.url}" alt="${f.name}">
            <div class="file-info">
              <div>${f.name}</div>
              ${f.ai ? `<span class="file-type-badge badge-ai">AI: ${f.ai}</span>` : ''}
              <div style="margin-top:5px;display:flex;gap:5px;justify-content:center">
                ${f.ai ? `
                  <button onclick="downloadAi('${section}','${category}','${f.ai}')" 
                          style="background:#4CAF50;color:white;border:none;padding:4px 8px;border-radius:5px;cursor:pointer;font-size:11px">
                    ⬇️ AI
                  </button>
                ` : ''}
                <button onclick="deleteFile('${section}','${category}','${f.name}')" 
                        style="background:#F44336;color:white;border:none;padding:4px 8px;border-radius:5px;cursor:pointer;font-size:11px">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p style="color:red">❌ خطأ: ${e.message}</p>`;
  }
}

// ============ تحميل ملف AI ============
function downloadAi(section, category, filename) {
  const token = localStorage.getItem('adminToken');
  const url = `${API_BASE}download.php?section=${section}&category=${category}&filename=${filename}&token=${token}`;
  window.location.href = url;
}

// ============ حذف ملف ============
async function deleteFile(section, category, filename) {
  if (!confirm(`هل تريد حذف "${filename}"؟\n(سيتم حذف ملف AI المرتبط أيضاً)`)) return;

  const token = localStorage.getItem('adminToken');
  
  try {
    const res = await fetch(API_BASE + 'delete.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token
      },
      body: JSON.stringify({ section, category, filename })
    });
    
    const data = await res.json();
    if (data.success) {
      alert('✅ تم الحذف');
      loadExisting();
    } else {
      alert('❌ ' + (data.error || 'فشل الحذف'));
    }
  } catch (e) {
    alert('❌ خطأ: ' + e.message);
  }
}

// ============ تسجيل خروج ============
function logout() {
  if (confirm('تسجيل الخروج من وضع المسؤول؟')) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    location.href = 'index.html';
  }
}
