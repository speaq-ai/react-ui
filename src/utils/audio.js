export class AudioRecorder {
	constructor() {
		this.audioChunks = [];
		this.mediaRecorder = null;
		this.audioURL = null;
		this.isRecording = false;
	}
	record = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		this.audioChunks = [];
		this.mediaRecorder = new MediaRecorder(stream);
		this.mediaRecorder.addEventListener("dataavailable", e =>
			this.audioChunks.push(e.data)
		);
		this.mediaRecorder.start();
		this.isRecording = true;
	};

	stop = async () => {
		return new Promise((resolve, reject) => {
			this.mediaRecorder.addEventListener("stop", () => {
				const audioBlob = new Blob(this.audioChunks);
				this.audioURL = URL.createObjectURL(audioBlob);
				this.isRecording = false;
				const mimeType = this.mediaRecorder.mimeType;
				this.mediaRecorder = null;
				resolve([audioBlob, mimeType]);
			});
			this.mediaRecorder.stop();
		});
	};

	playback = () => {
		if (!this.audioURL) {
			alert("No audio recording to playback.");
		}
		const audio = new Audio(this.audioURL);
		audio.play();
	};
}

export function base64ToBlob(s) {
	const byteData = atob(s);
	const byteNums = new Array(byteData.length);
	for (let i = 0; i < byteData.length; i++) {
		byteNums[i] = byteData.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNums);
	return new Blob([byteArray]);
}

export async function blobToBase64(b) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function() {
			const data = reader.result.substr(reader.result.indexOf(",") + 1);
			resolve(data);
		};
		reader.readAsDataURL(b);
	});
}
