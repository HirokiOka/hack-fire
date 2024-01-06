class Sound {
    constructor() {
        this.ctx = new AudioContext();
        this.source = null;
    }

    load(audioPath, callback) {
        fetch(audioPath)
            .then((response) => {
                return response.arrayBuffer();
            })
            .then((buffer) => {
                return this.ctx.decodeAudioData(buffer);
            })
            .then((decodeAudio) => {
                this.source = decodeAudio;
                callback();
            })
            .catch(() => {
                callback('error!');
            });
    }

    play() {
        let node = new AudioBufferSourceNode(this.ctx, { buffer: this.source });
        node.connect(this.ctx.destination);
        node.addEventListener('ended', () => {
            node.stop();
            node.disconnect();
            node = null;
        }, false);
        node.start();
    }
}

//Init Sounds
let explodeSound = new Sound();
explodeSound.load('../sound/explode.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

let shotSound = new Sound();
shotSound.load('../sound/shot.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

let chargeSound = new Sound();
chargeSound.load('../sound/charge.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

let hitSound = new Sound();
hitSound.load('../sound/hit.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

let scratchSound = new Sound();
scratchSound.load('../sound/scratch_se.mp3', (error) => {
    if (error != null) {
        alert('ファイルの読み込みエラーです．');
        return;
    }
});

export { Sound, explodeSound, shotSound, chargeSound, hitSound, scratchSound };
