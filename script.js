// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    
    // 立即显示时钟
    updateClock();
    setInterval(updateClock, 1000);
    
    // 初始化所有功能
    initSidebar();
    initBackgroundSetting();  // 必须先初始化背景
    initDiarySystem();
    initScheduleSystem();
    initTimerSystem();
    initFloatingWindow();
    initBubbleSystem();
    initDiarySearch();
    
    // 页面加载完成问候
    setTimeout(() => {
        showBubbleMessage('欢迎回来~今天过得怎么样？', 'greeting');
    }, 1000);
    
    console.log('所有功能初始化完成！');
});

// ==================== 1. 时钟功能 ====================
function updateClock() {
    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        });
        const timeStr = now.toLocaleTimeString('zh-CN', {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.innerHTML = `${dateStr}<br><span>${timeStr}</span>`;
        }
    } catch (error) {
        console.error('时钟更新出错:', error);
    }
}

// ==================== 2. 侧边栏功能 ====================
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.add('sidebar-open');
        });
    }
    
    [closeSidebarBtn, sidebarOverlay].forEach(el => {
        if (el) el.addEventListener('click', () => {
            document.body.classList.remove('sidebar-open');
        });
    });
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            const targetPane = document.getElementById(tabId);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

// ==================== 3. 背景设置功能（修复版） ====================
function initBackgroundSetting() {
    console.log('正在初始化背景设置...');
    
    const bgGrid = document.getElementById('bgGrid');
    const bgImageUrlInput = document.getElementById('bgImageUrl');
    const saveBgBtn = document.getElementById('saveBgBtn');
    const backgroundEl = document.getElementById('background');
    
    // 检查元素是否存在
    if (!backgroundEl) {
        console.error('错误：找不到背景元素');
        return;
    }
    
    // 定义内置背景（使用本地图片）
    const builtInBackgrounds = [
        { 
            name: '默认背景', 
            url: '2.png',
            desc: '系统默认背景'
        },
        { 
            name: '星空', 
            url: 'images/background2.jpg',
            desc: '璀璨星空'
        },
        { 
            name: '森林', 
            url: 'images/background3.jpg',
            desc: '宁静森林'
        },
        { 
            name: '海边', 
            url: 'images/background4.jpg',
            desc: '海边日落'
        }
    ];
    
    // 生成背景选择网格
    if (bgGrid) {
        bgGrid.innerHTML = builtInBackgrounds.map(bg => `
            <div class="bg-option" data-url="${bg.url}">
                <div class="bg-preview-box" style="background-image: url('${bg.url}')"></div>
                <span class="bg-name">${bg.name}</span>
                <span class="bg-desc">${bg.desc}</span>
            </div>
        `).join('');
        
        console.log('内置背景选择器已生成');
    }
    
    // 设置背景的函数
    function setBackground(url, name = '自定义背景') {
        console.log(`设置背景: ${name}, URL: ${url}`);
        
        if (!url) {
            alert('请提供图片地址');
            return;
        }
        
        // 创建测试图片
        const testImg = new Image();
        testImg.onload = function() {
            console.log('图片加载成功');
            
            // 应用背景
            backgroundEl.style.opacity = '0.7';
            setTimeout(() => {
                backgroundEl.style.backgroundImage = `url('${url}')`;
                backgroundEl.style.opacity = '1';
                
                // 保存到本地存储
                localStorage.setItem('companionBackground', url);
                console.log('背景已保存到本地存储');
                
                // 显示消息
                showBubbleMessage(`背景已更换为: ${name}`);
            }, 300);
        };
        
        testImg.onerror = function() {
            console.error('图片加载失败:', url);
            alert('图片加载失败，请检查路径或网络连接');
        };
        
        testImg.src = url;
    }
    
    // 绑定内置背景点击事件（事件委托）
    if (bgGrid) {
        bgGrid.addEventListener('click', function(event) {
            const bgOption = event.target.closest('.bg-option');
            if (bgOption) {
                const url = bgOption.getAttribute('data-url');
                const name = bgOption.querySelector('.bg-name').textContent;
                setBackground(url, name);
                
                // 更新输入框
                if (bgImageUrlInput) {
                    bgImageUrlInput.value = url;
                }
            }
        });
    }
    
    // 绑定保存按钮事件
    if (saveBgBtn) {
        saveBgBtn.addEventListener('click', function() {
            const url = bgImageUrlInput ? bgImageUrlInput.value.trim() : '';
            if (url) {
                setBackground(url, '自定义背景');
            } else {
                alert('请输入图片地址');
            }
        });
    }
    
    // 加载已保存的背景
    function loadSavedBackground() {
        const savedBg = localStorage.getItem('companionBackground');
        console.log('从本地存储读取背景:', savedBg);
        
        if (savedBg) {
            // 验证图片是否可以加载
            const testImg = new Image();
            testImg.onload = function() {
                backgroundEl.style.backgroundImage = `url('${savedBg}')`;
                console.log('已加载保存的背景');
                
                // 更新输入框
                if (bgImageUrlInput && savedBg.startsWith('http')) {
                    bgImageUrlInput.value = savedBg;
                }
            };
            
            testImg.onerror = function() {
                console.warn('保存的背景加载失败，使用默认背景');
                // 使用默认背景
                backgroundEl.style.backgroundImage = "url('images/background.jpg')";
            };
            
            testImg.src = savedBg;
        } else {
            // 使用默认背景
            backgroundEl.style.backgroundImage = "url('images/background.jpg')";
        }
    }
    
    // 加载保存的背景
    loadSavedBackground();
    
    console.log('背景设置功能初始化完成');
}

// ==================== 4. 日记系统 ====================
function initDiarySystem() {
    const diaryInput = document.getElementById('diaryInput');
    const saveDiaryBtn = document.getElementById('saveDiaryBtn');
    const clearDiaryBtn = document.getElementById('clearDiaryBtn');
    const diaryList = document.getElementById('diaryList');
    const STORAGE_KEY = 'myCompanionDiaries';
    
    if (!saveDiaryBtn) return;
    
    // 加载日记
    function loadDiaries() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (saved.length === 0) {
            diaryList.innerHTML = '<li class="empty-tip">还没有日记哦</li>';
            return;
        }
        diaryList.innerHTML = saved.map((item, index) => `
            <li data-index="${index}">
                <div class="diary-meta">
                    <span class="diary-time">${item.time}</span>
                    <button class="delete-diary-btn">×</button>
                </div>
                <div class="diary-content">${item.content.replace(/\n/g, '<br>')}</div>
                ${item.mood ? `<span class="diary-tag">${item.mood}</span>` : ''}
                ${item.weather ? `<span class="diary-tag">${item.weather}</span>` : ''}
            </li>
        `).join('');
        
        document.querySelectorAll('.delete-diary-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const li = this.closest('li');
                const index = parseInt(li.getAttribute('data-index'));
                if (confirm('删除这条日记？')) {
                    deleteDiary(index);
                }
            });
        });
    }
    
    // 保存日记
    function saveDiary() {
        const content = diaryInput.value.trim();
        if (!content) {
            alert('请输入内容');
            return;
        }
        
        const moodBtn = document.querySelector('.mood-selector button.active');
        const weatherBtn = document.querySelector('.weather-selector button.active');
        
        const newDiary = {
            content: content,
            time: new Date().toLocaleString('zh-CN'),
            mood: moodBtn ? moodBtn.getAttribute('data-mood') : null,
            weather: weatherBtn ? weatherBtn.getAttribute('data-weather') : null
        };
        
        let saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        saved.unshift(newDiary);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        
        diaryInput.value = '';
        document.querySelectorAll('.mood-selector button, .weather-selector button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        loadDiaries();
        showBubbleMessage('日记保存好啦~', 'diary');
    }
    
    // 删除日记
    function deleteDiary(index) {
        let saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        saved.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        loadDiaries();
    }
    
    // 事件绑定
    saveDiaryBtn.addEventListener('click', saveDiary);
    clearDiaryBtn.addEventListener('click', () => {
        if (diaryInput.value.trim() && confirm('清空当前内容？')) {
            diaryInput.value = '';
        }
    });
    
    // 心情天气选择器
    document.querySelectorAll('.mood-selector button, .weather-selector button').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 初始化加载
    loadDiaries();
}

// ==================== 5. 日记搜索功能 ====================
function initDiarySearch() {
    const searchInput = document.getElementById('diarySearchInput');
    const searchBtn = document.getElementById('diarySearchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const diaryList = document.getElementById('diaryList');
    const STORAGE_KEY = 'myCompanionDiaries';
    
    if (!searchInput || !searchBtn) return;
    
    function searchDiaries() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (!keyword) {
            loadDiaries();
            return;
        }
        
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const filtered = saved.filter(diary => {
            if (diary.content.toLowerCase().includes(keyword)) return true;
            if (diary.time.toLowerCase().includes(keyword)) return true;
            if (diary.mood && diary.mood.toLowerCase().includes(keyword)) return true;
            if (diary.weather && diary.weather.toLowerCase().includes(keyword)) return true;
            return false;
        });
        
        displaySearchResults(filtered, keyword);
    }
    
    function displaySearchResults(diaries, keyword) {
        if (diaries.length === 0) {
            diaryList.innerHTML = `<li class="empty-tip">没有找到包含"${keyword}"的日记</li>`;
            return;
        }
        
        diaryList.innerHTML = diaries.map((diary, index) => `
            <li data-index="${index}">
                <div class="diary-meta">
                    <span class="diary-time">${diary.time}</span>
                </div>
                <div class="diary-content">
                    ${highlightText(diary.content, keyword)}
                </div>
                ${diary.mood ? `<span class="diary-tag">${diary.mood}</span>` : ''}
                ${diary.weather ? `<span class="diary-tag">${diary.weather}</span>` : ''}
            </li>
        `).join('');
    }
    
    function highlightText(text, keyword) {
        if (!keyword) return text.replace(/\n/g, '<br>');
        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>').replace(/\n/g, '<br>');
    }
    
    function loadDiaries() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (saved.length === 0) {
            diaryList.innerHTML = '<li class="empty-tip">还没有日记哦</li>';
            return;
        }
        diaryList.innerHTML = saved.map((item, index) => `
            <li data-index="${index}">
                <div class="diary-meta">
                    <span class="diary-time">${item.time}</span>
                    <button class="delete-diary-btn">×</button>
                </div>
                <div class="diary-content">${item.content.replace(/\n/g, '<br>')}</div>
                ${item.mood ? `<span class="diary-tag">${item.mood}</span>` : ''}
                ${item.weather ? `<span class="diary-tag">${item.weather}</span>` : ''}
            </li>
        `).join('');
    }
    
    // 事件绑定
    searchBtn.addEventListener('click', searchDiaries);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchDiaries();
    });
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            loadDiaries();
        });
    }
}

// ==================== 6. 日程系统 ====================
function initScheduleSystem() {
    const scheduleInput = document.getElementById('scheduleInput');
    const addScheduleBtn = document.getElementById('addScheduleBtn');
    const scheduleList = document.getElementById('scheduleList');
    const STORAGE_KEY = 'myCompanionSchedule';
    
    if (!addScheduleBtn) return;
    
    function loadSchedule() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (saved.length === 0) {
            scheduleList.innerHTML = '<li class="empty-tip">今天还没有安排</li>';
            return;
        }
        scheduleList.innerHTML = saved.map((task, index) => `
            <li class="${task.completed ? 'completed' : ''}">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-btn complete-btn" data-index="${index}">
                        ${task.completed ? '✓' : '○'}
                    </button>
                    <button class="task-btn delete-btn" data-index="${index}">×</button>
                </div>
            </li>
        `).join('');
        
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                toggleTaskCompletion(index);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (confirm('确定要删除这个日程吗？')) {
                    deleteTask(index);
                }
            });
        });
    }
    
    function addTask() {
        const text = scheduleInput.value.trim();
        if (!text) {
            alert('请输入内容');
            return;
        }
        const newTask = { 
            text, 
            createdAt: new Date().toLocaleTimeString('zh-CN'),
            completed: false
        };
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        saved.push(newTask);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        scheduleInput.value = '';
        loadSchedule();
        updateFloatingSchedule();
        showBubbleMessage('日程添加成功！');
    }
    
    function toggleTaskCompletion(index) {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (index >= 0 && index < saved.length) {
            saved[index].completed = !saved[index].completed;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
            loadSchedule();
            updateFloatingSchedule();
            showBubbleMessage(saved[index].completed ? '任务完成！' : '任务已重置');
        }
    }
    
    function deleteTask(index) {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        saved.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        loadSchedule();
        updateFloatingSchedule();
        showBubbleMessage('日程已删除');
    }
    
    addScheduleBtn.addEventListener('click', addTask);
    scheduleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    loadSchedule();
}

// ==================== 7. 计时器系统 ====================
function initTimerSystem() {
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');
    const timerHint = document.getElementById('timerHint');
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    // 全局变量
    window.timerInterval = null;
    window.timerTimeLeft = 25 * 60;
    window.timerIsRunning = false;
    
    function updateTimerDisplay() {
        const min = Math.floor(window.timerTimeLeft / 60).toString().padStart(2, '0');
        const sec = (window.timerTimeLeft % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${min}:${sec}`;
        updateFloatingTimer();
    }
    
    function startTimer() {
        if (window.timerIsRunning) return;
        window.timerIsRunning = true;
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        if (timerHint) timerHint.textContent = '专注中...';
        
        window.timerInterval = setInterval(() => {
            window.timerTimeLeft--;
            updateTimerDisplay();
            if (window.timerTimeLeft <= 0) {
                clearInterval(window.timerInterval);
                window.timerIsRunning = false;
                if (timerHint) timerHint.textContent = '时间到！';
                startTimerBtn.disabled = false;
                pauseTimerBtn.disabled = true;
                showBubbleMessage('计时结束，休息一下吧~', 'timer');
            }
        }, 1000);
    }
    
    function pauseTimer() {
        if (!window.timerIsRunning) return;
        clearInterval(window.timerInterval);
        window.timerIsRunning = false;
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        if (timerHint) timerHint.textContent = '已暂停';
    }
    
    function resetTimer() {
        clearInterval(window.timerInterval);
        window.timerIsRunning = false;
        window.timerTimeLeft = 25 * 60;
        updateTimerDisplay();
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        if (timerHint) timerHint.textContent = '准备开始';
    }
    
    // 事件绑定
    if (startTimerBtn) startTimerBtn.addEventListener('click', startTimer);
    if (pauseTimerBtn) pauseTimerBtn.addEventListener('click', pauseTimer);
    if (resetTimerBtn) resetTimerBtn.addEventListener('click', resetTimer);
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const minutes = parseInt(this.getAttribute('data-minutes'));
            window.timerTimeLeft = minutes * 60;
            updateTimerDisplay();
            if (timerHint) timerHint.textContent = `已设为 ${minutes} 分钟`;
            if (window.timerIsRunning) pauseTimer();
        });
    });
    
    updateTimerDisplay();
}

// ==================== 8. 悬浮窗口功能 ====================
function initFloatingWindow() {
    const floatingWindow = document.getElementById('floatingWindow');
    const floatingHeader = document.getElementById('floatingHeader');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const closeBtn = document.getElementById('closeBtn');
    const floatingTabs = document.querySelectorAll('.floating-tab');
    const floatingPages = document.querySelectorAll('.floating-page');
    
    if (!floatingWindow) return;
    
    // 拖拽功能
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    floatingHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = floatingWindow.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        floatingWindow.style.transition = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;
        const maxX = window.innerWidth - floatingWindow.offsetWidth;
        const maxY = window.innerHeight - floatingWindow.offsetHeight;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        floatingWindow.style.left = newX + 'px';
        floatingWindow.style.top = newY + 'px';
        floatingWindow.style.right = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            floatingWindow.style.transition = 'all 0.3s ease';
            // 保存位置
            localStorage.setItem('floatingWindowPos', JSON.stringify({
                x: parseFloat(floatingWindow.style.left),
                y: parseFloat(floatingWindow.style.top)
            }));
        }
    });
    
    // 最小化/关闭
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            floatingWindow.classList.toggle('minimized');
            localStorage.setItem('floatingWindowMinimized', floatingWindow.classList.contains('minimized'));
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            floatingWindow.style.display = 'none';
            localStorage.setItem('floatingWindowVisible', 'false');
            showBubbleMessage('状态看板已关闭。');
        });
    }
    
    // 选项卡切换
    floatingTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            floatingTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            floatingPages.forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            localStorage.setItem('floatingActiveTab', tabId);
        });
    });
    
    // 更新悬浮窗口日程显示
    function updateFloatingSchedule() {
        const scheduleList = document.getElementById('floatingScheduleList');
        const completedCountEl = document.getElementById('completedCount');
        const totalCountEl = document.getElementById('totalCount');
        
        if (!scheduleList) return;
        
        const saved = JSON.parse(localStorage.getItem('myCompanionSchedule')) || [];
        
        // 更新计数
        const completedCount = saved.filter(task => task.completed).length;
        if (completedCountEl) completedCountEl.textContent = completedCount;
        if (totalCountEl) totalCountEl.textContent = saved.length;
        
        if (saved.length === 0) {
            scheduleList.innerHTML = '<li class="empty-tip">今天还没有安排</li>';
            return;
        }
        
        scheduleList.innerHTML = saved.map((task, index) => `
            <li class="schedule-item ${task.completed ? 'completed' : ''}">
                <div class="task-content">${task.text}</div>
                <div class="task-actions">
                    <button class="task-btn complete-btn ${task.completed ? 'completed' : ''}" 
                            data-index="${index}">
                        ${task.completed ? '✓ 已完成' : '标记完成'}
                    </button>
                    <button class="task-btn delete-btn" 
                            data-index="${index}">
                        删除
                    </button>
                </div>
            </li>
        `).join('');
        
        // 添加事件监听
        scheduleList.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                toggleTaskCompletion(index);
            });
        });
        
        scheduleList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (confirm('确定要删除这个日程吗？')) {
                    deleteTask(index);
                }
            });
        });
    }
    
    // 更新悬浮窗口计时器显示
    function updateFloatingTimer() {
        const timerDisplay = document.getElementById('floatingTimerDisplay');
        const progressBar = document.getElementById('timerProgressBar');
        const progressText = document.getElementById('timerProgressText');
        const statusText = document.getElementById('timerStatusText');
        
        if (!timerDisplay) return;
        
        if (window.timerTimeLeft !== undefined) {
            const totalTime = 25 * 60;
            const progress = ((totalTime - window.timerTimeLeft) / totalTime) * 100;
            
            const min = Math.floor(window.timerTimeLeft / 60).toString().padStart(2, '0');
            const sec = (window.timerTimeLeft % 60).toString().padStart(2, '0');
            
            timerDisplay.textContent = `${min}:${sec}`;
            
            if (progressBar) {
                progressBar.style.width = `${Math.min(progress, 100)}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${Math.round(progress)}%`;
            }
            
            if (statusText) {
                statusText.textContent = window.timerIsRunning ? '运行中' : '暂停';
                statusText.style.color = window.timerIsRunning ? '#48bb78' : '#ed8936';
            }
        }
    }
    
    // 从initScheduleSystem中复制过来的函数
    function toggleTaskCompletion(index) {
        const saved = JSON.parse(localStorage.getItem('myCompanionSchedule')) || [];
        if (index >= 0 && index < saved.length) {
            saved[index].completed = !saved[index].completed;
            localStorage.setItem('myCompanionSchedule', JSON.stringify(saved));
            updateFloatingSchedule();
            showBubbleMessage(saved[index].completed ? '任务完成！' : '任务已重置');
        }
    }
    
    function deleteTask(index) {
        const saved = JSON.parse(localStorage.getItem('myCompanionSchedule')) || [];
        saved.splice(index, 1);
        localStorage.setItem('myCompanionSchedule', JSON.stringify(saved));
        updateFloatingSchedule();
        showBubbleMessage('日程已删除');
    }
    
    // 初始化悬浮窗口内容
    updateFloatingSchedule();
    updateFloatingTimer();
    
    // 恢复保存的状态
    const savedPos = localStorage.getItem('floatingWindowPos');
    if (savedPos) {
        const { x, y } = JSON.parse(savedPos);
        floatingWindow.style.left = x + 'px';
        floatingWindow.style.top = y + 'px';
        floatingWindow.style.right = 'auto';
    }
    
    if (localStorage.getItem('floatingWindowMinimized') === 'true') {
        floatingWindow.classList.add('minimized');
    }
    
    if (localStorage.getItem('floatingWindowVisible') === 'false') {
        floatingWindow.style.display = 'none';
    }
    
    const savedTab = localStorage.getItem('floatingActiveTab');
    if (savedTab && document.querySelector(`[data-tab="${savedTab}"]`)) {
        document.querySelectorAll('.floating-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${savedTab}"]`).classList.add('active');
        floatingPages.forEach(p => p.classList.remove('active'));
        document.getElementById(savedTab).classList.add('active');
    }
    
    // 定期更新计时器显示
    setInterval(() => {
        if (window.timerIsRunning) {
            updateFloatingTimer();
        }
    }, 1000);
}

// ==================== 9. 云朵气泡系统 ====================
function initBubbleSystem() {
    const responseBubble = document.getElementById('responseBubble');
    const responseText = document.getElementById('responseText');
    const characterImg = document.getElementById('characterImg');
    const bubbleContainer = document.getElementById('bubbleContainer');
    
    if (!responseBubble || !responseText || !bubbleContainer) return;
    
    // 回应词库
    const messages = {
        greeting: ['今天过得怎么样？', '我一直在你身边哦', '随时可以找我聊天~'],
        diary: ['心事记录下来啦', '我会好好珍藏的', '又了解了你一点呢'],
        schedule: ['新任务get！', '要记得完成哦', '我会提醒你的'],
        timer: ['时间到！休息一下吧', '辛苦了~', '完成任务的感觉真棒'],
        character: ['呀，被你发现啦！', '嘻嘻，我在呢', '想要摸摸头吗？'],
        idle: ['今天的云真好看...', '偷偷打了个小盹~', '唔...有点无聊呢']
    };
    
    // 显示气泡
    function showBubbleMessage(text, type = 'normal') {
        // 清除现有动画
        responseBubble.classList.remove('visible');
        responseBubble.classList.remove('fading');
        
        // 设置内容
        responseText.textContent = text;
        
        // 显示气泡
        setTimeout(() => {
            responseBubble.classList.add('visible');
        }, 10);
        
        // 3.5秒后自动隐藏
        setTimeout(() => {
            responseBubble.classList.add('fading');
            setTimeout(() => {
                responseBubble.classList.remove('visible');
                responseBubble.classList.remove('fading');
            }, 500);
        }, 3500);
    }
    
    // 角色点击
    if (characterImg) {
        characterImg.addEventListener('click', () => {
            const msgs = messages.character;
            const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
            showBubbleMessage(randomMsg, 'character');
        });
    }
    
    // 暴露给其他功能使用
    window.showBubbleMessage = showBubbleMessage;
    
    // 气泡拖拽功能
    let isDraggingBubble = false;
    let bubbleOffset = { x: 0, y: 0 };
    
    bubbleContainer.addEventListener('mousedown', (e) => {
        // 防止在调整大小时触发拖拽
        if (e.offsetX > responseBubble.offsetWidth - 20 && 
            e.offsetY > responseBubble.offsetHeight - 20) {
            return;
        }
        
        isDraggingBubble = true;
        const rect = bubbleContainer.getBoundingClientRect();
        bubbleOffset.x = e.clientX - rect.left;
        bubbleOffset.y = e.clientY - rect.top;
        
        bubbleContainer.style.cursor = 'grabbing';
        document.addEventListener('mousemove', dragBubble);
        document.addEventListener('mouseup', stopDragBubble);
        
        e.preventDefault();
    });
    
    function dragBubble(e) {
        if (!isDraggingBubble) return;
        
        let x = e.clientX - bubbleOffset.x;
        let y = e.clientY - bubbleOffset.y;
        
        const maxX = window.innerWidth - bubbleContainer.offsetWidth;
        const maxY = window.innerHeight - bubbleContainer.offsetHeight;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        bubbleContainer.style.left = x + 'px';
        bubbleContainer.style.top = y + 'px';
        bubbleContainer.style.transform = 'none';
    }
    
    function stopDragBubble() {
        isDraggingBubble = false;
        bubbleContainer.style.cursor = 'move';
        document.removeEventListener('mousemove', dragBubble);
        document.removeEventListener('mouseup', stopDragBubble);
        
        // 保存位置
        saveBubblePosition();
    }
    
    // 保存和加载气泡位置
    function saveBubblePosition() {
        const rect = bubbleContainer.getBoundingClientRect();
        const position = {
            x: rect.left,
            y: rect.top,
            width: responseBubble.offsetWidth,
            height: responseBubble.offsetHeight
        };
        localStorage.setItem('bubblePosition', JSON.stringify(position));
    }
    
    function loadBubblePosition() {
        const saved = localStorage.getItem('bubblePosition');
        if (saved) {
            const position = JSON.parse(saved);
            
            // 检查位置是否在屏幕内
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            if (position.x > screenWidth - 100 || position.y > screenHeight - 100 || 
                position.x < 0 || position.y < 0) {
                // 位置超出屏幕，重置
                resetBubblePosition();
                return;
            }
            
            bubbleContainer.style.left = position.x + 'px';
            bubbleContainer.style.top = position.y + 'px';
            bubbleContainer.style.transform = 'none';
            
            if (position.width && position.height) {
                responseBubble.style.width = position.width + 'px';
                responseBubble.style.height = position.height + 'px';
            }
        }
    }
    
    function resetBubblePosition() {
        bubbleContainer.style.left = '50%';
        bubbleContainer.style.top = '280px';
        bubbleContainer.style.transform = 'translateX(-50%)';
    }
    
    // 加载气泡位置
    loadBubblePosition();
    
    // 定期保存位置
    setInterval(saveBubblePosition, 5000);
    
    // 待机语音
    function scheduleIdleSpeech() {
        const delay = 30000 + Math.random() * 90000;
        setTimeout(() => {
            if (!responseBubble.classList.contains('visible')) {
                const msgs = messages.idle;
                const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
                showBubbleMessage(randomMsg, 'idle');
            }
            scheduleIdleSpeech();
        }, delay);
    }
    
    // 开始待机语音循环
    setTimeout(scheduleIdleSpeech, 10000);
}