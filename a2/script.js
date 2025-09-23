/*
js functionality overview:
this script provides complete media player functionality with focus on
user experience and accessibility.
*/

class RelaxationMusicPlayer {
    constructor() {
        // core player elements initialization
        this.audio = document.getElementById('audio-player');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.repeatBtn = document.getElementById('repeat-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.progressContainer = document.getElementById('progress-container');
        this.progressFill = document.getElementById('progress-fill');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeDisplay = document.getElementById('volume-display');
        this.currentTimeSpan = document.getElementById('current-time');
        this.totalTimeSpan = document.getElementById('total-time');
        this.trackTitle = document.getElementById('track-title');
        this.trackList = document.getElementById('track-list');

        // timer elements
        this.timerDisplay = document.getElementById('timer-display');
        this.timerStart = document.getElementById('timer-start');
        this.timerPause = document.getElementById('timer-pause');
        this.timerReset = document.getElementById('timer-reset');
        this.timer60 = document.getElementById('timer-60');
        this.timer30 = document.getElementById('timer-30');
        this.timer15 = document.getElementById('timer-15');

        // todo list elements
        this.todoInput = document.getElementById('todo-input');
        this.todoAddBtn = document.getElementById('todo-add');
        this.todoList = document.getElementById('todo-list');
        this.todoCount = document.getElementById('todo-count');

        // player state variables
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.isShuffled = false;
        this.isRepeating = false;
        this.tracks = [];
        
        // timer state variables
        this.timerMinutes = 60;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.timerRunning = false;

        // todo List state
        this.todos = [];
        this.todoIdCounter = 0;

        this.initializePlayer();
        this.setupEventListeners();
        this.loadTracks();
        this.loadTrack(0);
    }

    /*
    nitialization methods:
    setting up the player with default values and preparing all components
    for user interaction while maintaining the calm, focused atmosphere
    */
    initializePlayer() {
        this.audio.volume = 0.7; // Default comfortable volume for study/relaxation
        this.volumeDisplay.textContent = '70';
        this.updateTimerDisplay();
    }

    setupEventListeners() {
        // core playback controls with smooth user feedback
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

        // Progress bar interaction for seamless track navigation
        this.progressBar.addEventListener('input', () => this.seekTrack());
        this.progressBar.addEventListener('change', () => this.seekTrack());

        /*
        volume control with real-time feedback volume:
        the volume slider provides immediate audio and visual feedback,
        essential for maintaining the peaceful study environment without
        sudden volume changes that could disturb concentration.
        */
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            this.audio.volume = volume / 100;
            this.volumeDisplay.textContent = volume;
        });

        // audio event listeners for responsive UI updates
        this.audio.addEventListener('loadedmetadata', () => this.updateTotalTime());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());

        // playlist interaction for easy track selection
        this.trackList.addEventListener('click', (e) => {
            if (e.target.closest('.track-item')) {
                const trackItem = e.target.closest('.track-item');
                const trackIndex = Array.from(this.trackList.children).indexOf(trackItem);
                this.loadTrack(trackIndex);
            }
        });

        /*
        focus timer event listeners:
        This additional feature provides Pomodoro technique support,
        enhancing the study experience by helping users maintain
        focused work sessions with appropriate breaks.
        */
        this.timerStart.addEventListener('click', () => this.startTimer());
        this.timerPause.addEventListener('click', () => this.pauseTimer());
        this.timerReset.addEventListener('click', () => this.resetTimer());
        this.timer60.addEventListener('click', () => this.setTimer(60));
        this.timer30.addEventListener('click', () => this.setTimer(30));
        this.timer15.addEventListener('click', () => this.setTimer(15));

        /*
        todo list event listeners:
        interactive task management integrated with the study environment.
        users can add, complete, and delete tasks while maintaining focus.
        */
        this.todoAddBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        this.todoList.addEventListener('click', (e) => this.handleTodoClick(e));
    }

    /*
    track management:
    efficient handling of playlist data and track switching with
    smooth transitions that don't interrupt the user's focus flow
    */
    loadTracks() {
        const trackItems = document.querySelectorAll('.track-item');
        this.tracks = Array.from(trackItems).map(item => ({
            src: item.dataset.src,
            title: item.dataset.title,
            element: item
        }));
    }

    loadTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            this.currentTrackIndex = index;
            const track = this.tracks[index];
            
            // update audio source and track info
            this.audio.src = track.src;
            this.trackTitle.textContent = track.title;
            
            // update visual indicators in playlist
            document.querySelectorAll('.track-item').forEach(item => 
                item.classList.remove('active'));
            track.element.classList.add('active');
            
            // reset progress indicators and animations
            this.progressBar.value = 0;
            this.progressFill.style.width = '0%';
            this.progressFill.classList.remove('playing');
            this.progressContainer.classList.remove('loading');
            this.currentTimeSpan.textContent = '0:00';
        }
    }

    /*
    playback control methods:
    core functionality with emphasis on smooth operation and
    appropriate visual feedback for the calming user experience
    */
    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.playPauseBtn.innerHTML = '<img src="./icon/play.svg" alt="play" width="20" height="24">';
            this.isPlaying = false;
            // remove playing animation from progress bar
            this.progressFill.classList.remove('playing');
            this.progressContainer.classList.remove('loading');
        } else {
            // show loading animation while starting
            this.progressContainer.classList.add('loading');
            
            this.audio.play().then(() => {
                this.playPauseBtn.innerHTML = '<img src="./icon/pause.svg" alt="Pause" width="20" height="20">';
                this.isPlaying = true;
                // add playing animation to progress bar
                this.progressFill.classList.add('playing');
                this.progressContainer.classList.remove('loading');
            }).catch(e => {
                console.log('Playback prevented by browser policy');
                this.progressContainer.classList.remove('loading');
            });
        }
    }

    playNext() {
        let nextIndex;
        if (this.isShuffled) {
            nextIndex = Math.floor(Math.random() * this.tracks.length);
        } else {
            nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        this.loadTrack(nextIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    playPrevious() {
        const prevIndex = this.currentTrackIndex === 0 ? 
            this.tracks.length - 1 : this.currentTrackIndex - 1;
        this.loadTrack(prevIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        // clear color-based feedback instead of opacity
        if (this.isShuffled) {
            this.shuffleBtn.style.backgroundColor = '#A0956B'; // secondary-earth
            this.shuffleBtn.style.color = '#FAF7F0'; // soft-cream
        } else {
            this.shuffleBtn.style.backgroundColor = '#8B7355'; // primary-earth
            this.shuffleBtn.style.color = '#FAF7F0'; // soft-cream
        }
    }

    toggleRepeat() {
        this.isRepeating = !this.isRepeating;
        // clear color-based feedback instead of opacity
        if (this.isRepeating) {
            this.repeatBtn.style.backgroundColor = '#A0956B'; // secondary-earth
            this.repeatBtn.style.color = '#FAF7F0'; // soft-cream
        } else {
            this.repeatBtn.style.backgroundColor = '#8B7355'; // primary-earth
            this.repeatBtn.style.color = '#FAF7F0'; // soft-cream
        }
    }

    /*
    progress and time management:
    smooth, responsive progress tracking that provides users with
    clear feedback about track position without being distracting
    */
    seekTrack() {
        const progress = this.progressBar.value;
        const seekTime = (progress / 100) * this.audio.duration;
        if (!isNaN(seekTime)) {
            this.audio.currentTime = seekTime;
        }
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.value = progress;
            // update animated progress fill
            this.progressFill.style.width = progress + '%';
            this.currentTimeSpan.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateTotalTime() {
        if (this.audio.duration) {
            this.totalTimeSpan.textContent = this.formatTime(this.audio.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    handleTrackEnd() {
        if (this.isRepeating) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.playNext();
        }
    }

    /*
    focus timer functionality:
    designed specifically for the study context.
    this Pomodoro-style timer helps users maintain productive study sessions
    while enjoying the relaxing background music. the timer integrates
    seamlessly with the music player to create a complete study environment.
    
    design rationale: the timer addresses the specific needs of students and
    knowledge workers who use background music for concentration. by combining
    music playback with time management, this feature transforms a simple
    music player into a productivity tool, perfectly aligned with the
    relaxation/study context.
    */
    startTimer() {
        if (!this.timerRunning && (this.timerMinutes > 0 || this.timerSeconds > 0)) {
            this.timerRunning = true;
            this.timerStart.textContent = 'Running...';
            this.timerStart.disabled = true;
            
            this.timerInterval = setInterval(() => {
                if (this.timerSeconds === 0) {
                    if (this.timerMinutes === 0) {
                        this.timerComplete();
                        return;
                    }
                    this.timerMinutes--;
                    this.timerSeconds = 59;
                } else {
                    this.timerSeconds--;
                }
                this.updateTimerDisplay();
            }, 1000);
        }
    }

    pauseTimer() {
        if (this.timerRunning) {
            this.timerRunning = false;
            this.timerStart.textContent = 'Start';
            this.timerStart.disabled = false;
            
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.timerMinutes = 60;
        this.timerSeconds = 0;
        this.timerStart.textContent = 'Start';
        this.timerStart.disabled = false;
        this.updateTimerDisplay();
        
        // reset all timer duration buttons to unselected state
        document.querySelectorAll('.timer-btn').forEach(btn => {
            if (btn.textContent.includes('min') || btn.textContent.includes('hour')) {
                btn.style.backgroundColor = '#FAF7F0';
                btn.style.color = '#7A8471';
            }
        });
    }

    setTimer(minutes) {
        this.pauseTimer();
        this.timerMinutes = minutes;
        this.timerSeconds = 0;
        this.timerStart.textContent = 'Start';
        this.timerStart.disabled = false;
        this.updateTimerDisplay();
        
        // visual feedback for button selection
        document.querySelectorAll('.timer-btn').forEach(btn => {
            if (btn.textContent.includes('min') || btn.textContent.includes('hour')) {
                btn.style.backgroundColor = '#FAF7F0';
                btn.style.color = '#7A8471';
            }
        });
        
        // highlight selected duration
        const buttonMap = {
            60: this.timer60,
            30: this.timer30,
            15: this.timer15
        };
        
        if (buttonMap[minutes]) {
            buttonMap[minutes].style.backgroundColor = '#A0956B';
            buttonMap[minutes].style.color = '#FAF7F0';
        }
    }

    updateTimerDisplay() {
        const formattedTime = `${this.timerMinutes.toString().padStart(2, '0')}:${this.timerSeconds.toString().padStart(2, '0')}`;
        this.timerDisplay.textContent = formattedTime;
    }

    /*
    timer completion handler:
    Provides gentle notification when focus session ends, maintaining
    the calm atmosphere while alerting the user to take a break
    */
    timerComplete() {
        this.pauseTimer();
        this.timerDisplay.textContent = "00:00";
        this.timerStart.textContent = 'Start';
        this.timerStart.disabled = false;
        
        // show completion message
        this.timerDisplay.textContent = "Session Complete!";
        
        // reset display after 4 seconds
        setTimeout(() => {
            this.resetTimer();
        }, 4000);

        // browser notification with permission check
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎓 Focus Session Complete!', {
                body: 'Great work! Time for a well-deserved break.',
                silent: false,
                tag: 'focus-timer'
            });
        }

        // optional: play a gentle completion sound (if audio context allows)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Pleasant chime frequency
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Silent fallback if audio context is not available
            console.log('Audio notification not available');
        }
    }

    /*
    todo list functionality:
    Complete task management system designed for the study/productivity context.
    Features include adding, completing, deleting tasks with persistent visual feedback.
    This enhances the study experience by providing organization tools alongside music.
    */
    addTodo() {
        const text = this.todoInput.value.trim();
        if (text === '') return;

        const todo = {
            id: this.todoIdCounter++,
            text: text,
            completed: false,
            timestamp: new Date()
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.renderTodos();
        this.updateTodoCount();
    }

    renderTodos() {
        this.todoList.innerHTML = '';
        
        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''} 
                       data-id="${todo.id}">
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <button class="todo-delete" data-id="${todo.id}">×</button>
            `;
            this.todoList.appendChild(li);
        });
    }

    handleTodoClick(e) {
        const todoId = parseInt(e.target.dataset.id);
        
        if (e.target.classList.contains('todo-checkbox')) {
            this.toggleTodo(todoId);
        } else if (e.target.classList.contains('todo-delete')) {
            this.deleteTodo(todoId);
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
            this.updateTodoCount();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.renderTodos();
        this.updateTodoCount();
    }

    updateTodoCount() {
        const remainingCount = this.todos.filter(t => !t.completed).length;
        this.todoCount.textContent = remainingCount;
    }
}

/*
player initalization:
initialize the player when DOM is fully loaded to ensure all elements
are available and properly connected for seamless user interaction
*/
document.addEventListener('DOMContentLoaded', () => {
    // request notification permission for timer alerts (user-friendly)
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // initialize the complete music player system
    const player = new RelaxationMusicPlayer();
    
    // optional: Add keyboard shortcuts for enhanced accessibility
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, button')) {
            e.preventDefault();
            player.togglePlayPause();
        }
    });

    // back to top button functionality
    const backToTopBtn = document.getElementById('back-to-top');
    
    // show/hide back to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // smooth scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

/*
error handling and feedbacks:
graceful degradation ensures the player remains functional even if
certain browser features are unavailable, maintaining the peaceful UX
*/
window.addEventListener('error', (e) => {
    console.log('Player error handled gracefully:', e.message);
});