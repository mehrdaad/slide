import { h, Component } from 'preact';
import { route } from 'preact-router';
import linkState from 'linkstate';
import * as firebase from 'firebase/app';
import * as database from 'firebase/database';
import style from './style';

export default class Home extends Component {

	state = {
		pin: ''
	};

	connect = () => {
		let button = document.querySelector('button');
		let input = document.querySelector('#input');
		if (this.state.pin) {
			button.disabled = true;
			button.innerHTML = 'Loading ...';
			this.database.ref('slides/' + this.state.pin).once('value').then((snapshot) => {
				if (snapshot.val()) {
					input.style.borderBottom = '1px solid #ccc';
					button.disabled = false;
					button.innerHTML = 'Connect';
					route(`/${this.state.pin}`);
				}
				else {
					input.style.borderBottom = '1px solid red';
					button.disabled = false;
					button.innerHTML = 'Connect';
				}
			}).catch(error => {
				button.disabled = false;
				button.innerHTML = 'Connect';
			});
		}
		else {
			input.style.borderBottom = '1px solid red';
			button.disabled = false;
			button.innerHTML = 'Connect';
		}
	}

	installExtension = () => {
		chrome.webstore.install();
	}

	openExtension = () => {
		chrome.runtime.sendMessage('pojijacppbhikhkmegdoechbfiiibppi', { message: 'guide' });
	}

	something = (e) => {
		if (e.key === 'Enter') {
			this.connect();
		}
	}

	constructor() {
		super();
		this.database = firebase.database();
	}

	componentWillMount() {
		if (typeof window !== 'undefined') {
			if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
				if (chrome.runtime) {
					chrome.runtime.sendMessage('pojijacppbhikhkmegdoechbfiiibppi', { message: 'version' },
						(reply) => {
							if (!reply) {
								document.querySelector('#install').style.display = 'block';
							}
							else {
								document.querySelector('#guide').style.display = 'block';
							}
						});
				}

			}
		}
	}

	render({ }, { pin }) {
		return (
			<div class={style.home}>
				<h1>Remote for<br />Google Slides</h1>
				<input aria-label="Enter Code Here" id="input" type="number" value={pin} onInput={linkState(this, 'pin')} onkeyup={this.something} placeholder="Enter Code Here" />
				<button aria-label="Connect" onClick={this.connect}>Connect</button>
				<button aria-label="Install Extension" onClick={this.installExtension} id="install" class={style.install}>Install Extension</button>
				<button aria-label="Help" onClick={this.openExtension} id="guide" class={style.install}>Help</button>
				<div class={style.footer}>&copy; Copyright 2017 Henry Lim</div>
			</div>
		);
	}
}
