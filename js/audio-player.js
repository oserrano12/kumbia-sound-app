// Reproductor de audio básico para Kumbia Sound
// AudioPlayer: clase que encapsula la lógica de reproducción principal
// Comentarios y explicaciones en español para cada método.
class AudioPlayer {
    constructor() {
        // Elemento <audio> principal para la reproducción de la playlist
        this.audio = new Audio();
        this.currentTrackIndex = 0;
        this.playlist = [];
        this.isPlaying = false;
        // Volumen (0.0 - 1.0)
        this.volume = 0.5;


        this.initializeElements();
        this.bindEvents();
        this.loadPlaylist();
    }
    
    // Obtener referencias a elementos del DOM y sincronizar estados iniciales
    initializeElements() {
        this.playBtn = document.getElementById('play-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.currentTrackDisplay = document.getElementById('current-track');
        this.playlistSelect = document.getElementById('playlist-select');
        this.playlistBtn = document.getElementById('playlist-btn');
        this.playlistDropdown = document.getElementById('playlist-dropdown');

        // Controles adicionales añadidos: seek, tiempos y mute
        this.seekBar = document.getElementById('seek-bar');
        this.currentTimeDisplay = document.getElementById('current-time');
        this.durationTimeDisplay = document.getElementById('duration-time');
        this.muteBtn = document.getElementById('mute-btn');

        // Alinear control de volumen con valor inicial
        if (this.volumeSlider) this.volumeSlider.value = Math.round(this.volume * 100);
        this.audio.volume = this.volume;
    }
    
    bindEvents() {
        // Agregar listeners solo si existen los elementos (robusto frente a cambios en el DOM)
        if (this.playBtn) this.playBtn.addEventListener('click', () => this.play());
        if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.pause());
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.previous());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }

        // Actualizar posiciones de tiempo y permitir seek
        if (this.audio) {
            this.audio.addEventListener('ended', () => this.next());
            this.audio.addEventListener('timeupdate', () => this._onTimeUpdate());
            this.audio.addEventListener('loadedmetadata', () => this._onLoadedMetadata());
            this.audio.addEventListener('error', (e) => this._onAudioError(e));
        }

        if (this.seekBar) {
            this.seekBar.addEventListener('input', (e) => {
                const pct = e.target.value / 100;
                if (this.audio.duration && !isNaN(this.audio.duration)) {
                    this.audio.currentTime = pct * this.audio.duration;
                }
            });
        }

        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => {
                this.audio.muted = !this.audio.muted;
                this.muteBtn.innerHTML = this.audio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
            });
        }

        if (this.playlistBtn && this.playlistDropdown) {
            this.playlistBtn.addEventListener('click', () => {
                this.playlistDropdown.classList.toggle('active');
            });
        }

        if (this.playlistSelect) {
            this.playlistSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.playTrack(parseInt(e.target.value) - 1);
                }
            });
        }

        // Cerrar playlist al hacer clic fuera (con comprobaciones de existencia)
        document.addEventListener('click', (e) => {
            if (this.playlistBtn && this.playlistDropdown) {
                if (!this.playlistBtn.contains(e.target) && !this.playlistDropdown.contains(e.target)) {
                    this.playlistDropdown.classList.remove('active');
                }
            }
        });

        // Tecla espacio para play/pause (evitar cuando el foco está en inputs)
        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            if (e.code === 'Space' && (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA'))) {
                e.preventDefault();
                if (this.isPlaying) this.pause(); else this.play();
            }
        });
    }
    
    loadPlaylist() {
        // Playlist de muestra con cumbia peruana
        this.playlist = [
            { 
                id: 1, 
                title: "Los Destellos - Cumbia Clásica Peruana", 
                url: "assets/audio/demo1.mp3"
            },
            { 
                id: 2, 
                title: "Grupo Celeste - Cumbia Andina", 
                url: "assets/audio/demo2.mp3"
            },
            { 
                id: 3, 
                title: "Juaneco y su Combo - Cumbia Amazónica", 
                url: "assets/audio/demo3.mp3"
            }
        ];
        
        // Cargar la primera canción
        if (this.playlist.length > 0) {
            this.playTrack(0);
        }
    }
    
    playTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentTrackIndex = index;
            const track = this.playlist[index];
            
            this.currentTrackDisplay.textContent = track.title;
            this.playlistSelect.value = track.id;
            
            this.audio.src = track.url;
            this.audio.volume = this.volume;
            // Reiniciar barra de progreso
            if (this.seekBar) this.seekBar.value = 0;
            this.play();
        }
    }
    
    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.updatePlaybackControls();
                
                // Animar el vinilo
                const vinylDisc = document.querySelector('.vinyl-disc');
                if (vinylDisc) vinylDisc.classList.add('playing');
                
                const vinylArm = document.querySelector('.vinyl-arm');
                if (vinylArm) vinylArm.classList.add('playing');
            })
            .catch(error => {
                console.error("Error al reproducir:", error);
                if (window.kumbiaUtils && window.kumbiaUtils.showNotification) {
                    window.kumbiaUtils.showNotification('Error al reproducir pista.');
                }
            });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlaybackControls();
        
        // Detener animación del vinilo
        const vinylDisc = document.querySelector('.vinyl-disc');
        if (vinylDisc) vinylDisc.classList.remove('playing');
        
        const vinylArm = document.querySelector('.vinyl-arm');
        if (vinylArm) vinylArm.classList.remove('playing');
    }
    
    next() {
        const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.playTrack(nextIndex);
    }
    
    previous() {
        const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playTrack(prevIndex);
    }
    
    setVolume(value) {
        this.volume = value;
        this.audio.volume = value;
    }
    
    updatePlaybackControls() {
        if (this.isPlaying) {
            this.playBtn.style.display = 'none';
            this.pauseBtn.style.display = 'inline-block';
        } else {
            this.playBtn.style.display = 'inline-block';
            this.pauseBtn.style.display = 'none';
        }
    }

    /* --- Helpers --- */
    _onTimeUpdate() {
        if (!this.audio.duration || isNaN(this.audio.duration)) return;
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        if (this.seekBar) this.seekBar.value = pct;
        if (this.currentTimeDisplay) this.currentTimeDisplay.textContent = this._formatTime(this.audio.currentTime);
    }

    _onLoadedMetadata() {
        if (this.durationTimeDisplay && this.audio.duration && !isNaN(this.audio.duration)) {
            this.durationTimeDisplay.textContent = this._formatTime(this.audio.duration);
        }
    }

    _onAudioError(e) {
        console.error('Audio error', e);
        if (window.kumbiaUtils && window.kumbiaUtils.showNotification) {
            window.kumbiaUtils.showNotification('Error al cargar el audio. Intenta otra pista.');
        }
    }

    _formatTime(seconds) {
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const m = Math.floor(seconds / 60);
        return `${m}:${s}`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        const player = new AudioPlayer();
        window.kumbiaPlayer = player;
        
        // Inicializar botones de preview con manejo para que sólo suene un preview a la vez
        let currentPreviewAudio = null;
        document.querySelectorAll('.preview-btn').forEach(btn => {
            const audio = btn.nextElementSibling;
            if (!audio) return;

            btn.addEventListener('click', () => {
                // Si hay otro preview sonando, pausarlo
                if (currentPreviewAudio && currentPreviewAudio !== audio) {
                    currentPreviewAudio.pause();
                    const prevBtn = document.querySelector('.preview-btn.playing');
                    if (prevBtn) {
                        prevBtn.classList.remove('playing');
                        prevBtn.innerHTML = '<i class="fas fa-play"></i> Escuchar Fragmento';
                    }
                }

                if (audio.paused) {
                    audio.play();
                    btn.classList.add('playing');
                    btn.setAttribute('aria-pressed','true');
                    btn.innerHTML = '<i class="fas fa-pause"></i> Pausar Preview';
                    currentPreviewAudio = audio;
                } else {
                    audio.pause();
                    btn.classList.remove('playing');
                    btn.setAttribute('aria-pressed','false');
                    btn.innerHTML = '<i class="fas fa-play"></i> Escuchar Fragmento';
                    currentPreviewAudio = null;
                }
            });

            audio.addEventListener('ended', () => {
                btn.classList.remove('playing');
                btn.setAttribute('aria-pressed','false');
                btn.innerHTML = '<i class="fas fa-play"></i> Escuchar Fragmento';
                if (currentPreviewAudio === audio) currentPreviewAudio = null;
            });
        });
    } catch (error) {
        console.error("Error al inicializar el reproductor:", error);
    }
});