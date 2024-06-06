document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0]; // 获取当前日期
    const upcomingConferenceBody = document.getElementById('upcomingConferenceBody');
    const pastConferenceBody = document.getElementById('pastConferenceBody');

    function loadConferencesFromFile() {
        fetch('/conferences.json')
            .then(response => response.json())
            .then(data => {
                updateConferenceList(data);
            })
            .catch(error => console.error('Error loading conferences:', error));
    }

    function updateConferenceList(conferences) {
        const pastConferences = [];
        const futureConferences = [];

        conferences.forEach(conference => {
            if (conference.date < today) {
                pastConferences.push(conference);
            } else {
                futureConferences.push(conference);
            }
        });

        futureConferences.sort((a, b) => new Date(a.date) - new Date(b.date));
        pastConferences.sort((a, b) => new Date(b.date) - new Date(a.date));

        futureConferences.forEach(conference => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${conference.date}</td>
                <td>${conference.name}</td>
                <td>${conference.location}</td>
                <td>${conference.status}</td>
                <td>${conference.milestones}</td>
                <td>${conference.attachment ? `<a href="/attachments/${encodeURIComponent(conference.attachment)}" target="_blank">查看附件</a>` : ''}</td>
            `;
            upcomingConferenceBody.appendChild(tr);
        });

        pastConferences.forEach(conference => {
            const tr = document.createElement('tr');
            tr.classList.add('past');
            tr.innerHTML = `
                <td>${conference.date}</td>
                <td>${conference.name}</td>
                <td>${conference.location}</td>
                <td>${conference.status}</td>
                <td>${conference.milestones}</td>
                <td>${conference.attachment ? `<a href="/attachments/${encodeURIComponent(conference.attachment)}" target="_blank">查看附件</a>` : ''}</td>
            `;
            pastConferenceBody.appendChild(tr);
        });
    }

    loadConferencesFromFile();
});
