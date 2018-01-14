import { h, Component } from 'preact';
import { route } from 'preact-router';
import * as firebase from 'firebase/app';
import * as database from 'firebase/database';
import style from './style';

export default class Control extends Component {

	state = {
		currentSlide: '0',
		totalSlide: '0',
		title: '',
		previous_btn_disabled: true,
		next_btn_disabled: true,
		timer: '00:00:00'
	};

	disconnect = () => {
		this.toggleOverlay();
		// if (confirm('Disconnect?')) {
		// 	document.querySelector('#speakernote').style.display = 'none';
		// 	document.querySelector('#control').style.display = 'flex';
		// 	route('/');
		// }
	}

	toggleSpeakerNote = () => {
		let speakernote = document.querySelector('#speakernote');
		let control = document.querySelector('#control');

		if (speakernote.style.display === 'flex') {
			speakernote.style.display = 'none';
			control.style.display = 'flex';
		}
		else {
			speakernote.style.display = 'flex';
			control.style.display = 'none';
		}
	}

	nextSlide = () => {
		firebase.database().ref('slides/' + this.id + '/current_slide').set(this.state.currentSlide + 1);
	}

	prevSlide = () => {
		firebase.database().ref('slides/' + this.id + '/current_slide').set(this.state.currentSlide - 1);
	}

	timer = () => {
		let count = 1;
		
		setInterval(() => {
			this.setState({ timer: new Date(count++ * 1000).toISOString().substr(11, 8) });
		}, 1000);
	}

	toggleOverlay = () => {
		let dialog = document.querySelector('#dialog');
		if (dialog.style.display === 'flex') {
			dialog.style.display = 'none';
		}
		else {
			dialog.style.display = 'flex';
		}
	}

	constructor(props) {
		super(props);

		if (!navigator.onLine) {
			this.setState({ nextBtnDisabled: true });
			this.setState({ previousBtnDisabled: true });
		}

		// console.log('push to ga!');

		let checkTimer = false;
		this.id = props.id;
		this.database = firebase.database();
		this.database.ref('slides/' + props.id).on('value', (snapshot) => {
			let data = snapshot.val();
			if (data) {
				let current = data.current_slide;
				let total = data.total_slide;
				let slideTitle = data.title;

				if (current <= 1){
					this.setState({ previousBtnDisabled: true });
				}
				else {
					this.setState({ previousBtnDisabled: false });
				}
				
				if (current >= total) {
					this.setState({ nextBtnDisabled: true });
				}
				else {
					this.setState({ nextBtnDisabled: false });
				}

				this.setState({ currentSlide: current, totalSlide: total, title: slideTitle });

				setTimeout(() => {
					let speakernoteContainer = document.querySelector('#speakernoteContainer');
					if (data.speaker_note !== undefined) {
						document.querySelector('#speakernoteBtn').style.display = 'flex';
						speakernoteContainer.innerHTML = data.speaker_note;
					}
					else {
						document.querySelector('#speakernoteBtn').style.display = 'none';
						speakernoteContainer.innerHTML = '';
					}
				}, 10);
				
				if (!checkTimer) {
					this.timer();
					checkTimer = true;
				}
			}
			else {
				route('/');
			}
		});
	}

	render({ id }, { currentSlide, totalSlide, title, nextBtnDisabled, previousBtnDisabled, timer }) {
		return (
			<div class={style.main}>
				<div class={style.dialog} id="dialog">
					<div class={style.dialog_overlay} onClick={this.toggleOverlay} />
					<div class={style.dialog_content}>
						<p>put something inside</p>
					</div>
				</div>
				<div class={style.connection} id="connection">
					<div class={style.status} />
					<span>Offline</span>
				</div>
				<div class={style.header}>
					<div class={style.icon} onClick={this.disconnect}>
						<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false">
							<g>
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
							</g>
						</svg>
					</div>
					<h1>{title}</h1>
					<div class={style.icon} onClick={this.toggleSpeakerNote} id="speakernoteBtn" style="display: none">
						<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" >
							<g>
								<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z" />
							</g>
						</svg>
					</div>
				</div>
				<div class={style.container}>
					<div class={style.control} id="control">
						<button onClick={this.nextSlide} disabled={nextBtnDisabled} id="next_btn">Next Slide</button>
						<button onClick={this.prevSlide} disabled={previousBtnDisabled} id="previous_btn">Previous Slide</button>
					</div>
					<div class={style.speakernote} id="speakernote">
						<div class={style.speakernoteContainer} id="speakernoteContainer" />
						<div class={style.buttonContainer}>
							<button onClick={this.nextSlide} disabled={nextBtnDisabled} id="next_btn">Next Slide</button>
							<button onClick={this.prevSlide} disabled={previousBtnDisabled} id="previous_btn">Previous Slide</button>
						</div>
					</div>
				</div>
				<div class={style.footer}>
					<span class={style.info}>Slide {currentSlide} of {totalSlide}</span>
					<span class={style.timer}>{timer}</span>
				</div>
			</div>
		);
	}
}
