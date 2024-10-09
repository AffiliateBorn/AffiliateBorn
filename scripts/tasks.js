document.addEventListener('DOMContentLoaded', () => {
    const tasks = [
        'Collect 10 points',
        'Share your referral link',
        'Complete 3 levels',
    ];

    const tasksList = document.getElementById('tasks-list');
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task;
        tasksList.appendChild(li);
    });
});
