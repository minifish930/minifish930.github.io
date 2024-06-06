document.addEventListener('DOMContentLoaded', () => {
    let conferences = [];

    const today = new Date().toISOString().split('T')[0]; // 获取当前日期

    const conferenceBody = document.getElementById('conferenceBody');
    const conferenceForm = document.getElementById('conferenceForm');
    const downloadBtn = document.getElementById('downloadBtn');
    const uploadFile = document.getElementById('uploadFile');
    const importBtn = document.getElementById('importBtn');
    const editIndexInput = document.getElementById('editIndex');

    function updateConferenceList() {
        conferenceBody.innerHTML = ''; // 清空表格内容

        const pastConferences = [];
        const futureConferences = [];

        conferences.forEach((conference, index) => {
            if (conference.date < today) {
                pastConferences.push({ ...conference, index });
            } else {
                futureConferences.push({ ...conference, index });
            }
        });

        const sortedConferences = [...futureConferences, ...pastConferences];

        sortedConferences.forEach(conference => {
            const tr = document.createElement('tr');
            if (conference.date < today) {
                tr.classList.add('past');
            }
            const attachmentLink = conference.attachment ? `<a href="/attachments/${encodeURIComponent(conference.attachment)}" target="_blank">查看附件</a>` : '';
            tr.innerHTML = `
                <td>${conference.date}</td>
                <td>${conference.name}</td>
                <td>${conference.location}</td>
                <td>${conference.status}</td>
                <td>${conference.milestones}</td>
                <td>${attachmentLink}</td>
                <td>
                    <button class="editBtn" data-index="${conference.index}">编辑</button>
                    <button class="deleteBtn" data-index="${conference.index}">删除</button>
                </td>
            `;
            conferenceBody.appendChild(tr);
        });

        document.querySelectorAll('.deleteBtn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                deleteConference(index);
            });
        });

        document.querySelectorAll('.editBtn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                editConference(index);
            });
        });
    }

    function deleteConference(index) {
        conferences.splice(index, 1);
        localStorage.setItem('conferences', JSON.stringify(conferences));
        updateConferenceList();
    }

    function editConference(index) {
        const conference = conferences[index];
        document.getElementById('date').value = conference.date;
        document.getElementById('name').value = conference.name;
        document.getElementById('location').value = conference.location;
        document.getElementById('status').value = conference.status;
        document.getElementById('milestones').value = conference.milestones;
        editIndexInput.value = index;
    }

    function downloadFile(content, fileName, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    function loadConferencesFromFile() {
        fetch('/conferences.json')
            .then(response => response.json())
            .then(data => {
                conferences = data;
                localStorage.setItem('conferences', JSON.stringify(conferences));
                updateConferenceList();
            })
            .catch(error => console.error('Error loading conferences:', error));
    }

    function loadConferencesFromLocalStorage() {
        const storedConferences = localStorage.getItem('conferences');
        if (storedConferences) {
            conferences = JSON.parse(storedConferences);
            updateConferenceList();
        } else {
            loadConferencesFromFile();
        }
    }

    conferenceForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(conferenceForm);
        const date = formData.get('date');
        const name = formData.get('name');
        const location = formData.get('location');
        const status = formData.get('status');
        const milestones = formData.get('milestones');
        const attachmentInput = document.getElementById('attachment');
        const editIndex = editIndexInput.value;

        if (attachmentInput.files.length > 0) {
            fetch('/upload', {
                method: 'POST',
                body: formData,
            }).then(response => response.json())
             
            .then(data => {
                const attachment = data.attachment;

                if (editIndex !== '') {
                    conferences[editIndex].date = date;
                    conferences[editIndex].name = name;
                    conferences[editIndex].location = location;
                    conferences[editIndex].status = status;
                    conferences[editIndex].milestones = milestones;
                    if (attachment) {
                        conferences[editIndex].attachment = attachment;
                    }
                    editIndexInput.value = '';
                } else {
                    conferences.push({
                        date: date,
                        name: name,
                        location: location,
                        status: status,
                        milestones: milestones,
                        attachment: attachment
                    });
                }

                localStorage.setItem('conferences', JSON.stringify(conferences));
                updateConferenceList();
                conferenceForm.reset(); // 重置表单
            })
            .catch(error => console.error('Error uploading file:', error));
        } else {
            if (editIndex !== '') {
                conferences[editIndex].date = date;
                conferences[editIndex].name = name;
                conferences[editIndex].location = location;
                conferences[editIndex].status = status;
                conferences[editIndex].milestones = milestones;
                editIndexInput.value = '';
            } else {
                conferences.push({
                    date: date,
                    name: name,
                    location: location,
                    status: status,
                    milestones: milestones,
                    attachment: null
                });
            }

            localStorage.setItem('conferences', JSON.stringify(conferences));
            updateConferenceList();
            conferenceForm.reset(); // 重置表单
        }
    });

    downloadBtn.addEventListener('click', () => {
        const json = JSON.stringify(conferences, null, 2);
        downloadFile(json, 'conferences.json', 'application/json');
    });

    importBtn.addEventListener('click', () => {
        if (uploadFile.files.length > 0) {
            const file = uploadFile.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedConferences = JSON.parse(e.target.result);
                conferences = importedConferences;
                localStorage.setItem('conferences', JSON.stringify(conferences));
                updateConferenceList();
            };
            reader.readAsText(file);
        } else {
            alert("请选择一个文件进行导入");
        }
    });

    loadConferencesFromLocalStorage();
});
