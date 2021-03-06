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
				if (snapshot.val() && !snapshot.val().offline) {
					console.log(snapshot.val());
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
			if (!document.querySelector('#connect_btn').disabled) {
				this.connect();
			}
		}
	}

	notifyNetworkStatus(e) {
		if (navigator.onLine) {
			console.log('online');
			document.querySelector('#connection').classList.remove('active');
		}
		else {
			console.log('offline');
			document.querySelector('#connection').classList.add('active');
		}
	}

	constructor() {
		super();
		this.database = firebase.database();
	}

	componentWillMount() {
		if (typeof window !== 'undefined') {
			if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
				if (window.chrome && chrome.runtime) {
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

	componentDidMount () {
		let adsbygoogle = document.querySelector('.adsbygoogle');
		adsbygoogle.style.display = 'block';
		adsbygoogle.setAttribute('data-ad-slot', '2594658120');
		adsbygoogle.setAttribute('data-ad-format', 'auto');
		adsbygoogle.setAttribute('data-ad-client', 'ca-pub-3866326270033666');
		adsbygoogle.removeAttribute('data-adsbygoogle-status');
		(window.adsbygoogle = window.adsbygoogle || []).push({});
		let resizeTimer;
		let width = window.innerWidth;
		window.addEventListener('resize', (event) => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				if (width !== window.innerWidth) {
					width = window.innerWidth;
					adsbygoogle.removeAttribute('data-adsbygoogle-status');
					(window.adsbygoogle = window.adsbygoogle || []).push({});
				}
			}, 250);
		});

		window.addEventListener('online', (e) => this.notifyNetworkStatus(e));
		window.addEventListener('offline', (e) => this.notifyNetworkStatus(e));


		// if (!navigator.onLine) {
		// 	document.querySelector('#connection').style.display = 'flex';
		// 	document.querySelector('#connect_btn').disabled = true;
		// }
		// else {
		// 	document.querySelector('#connection').style.display = 'none';
		// 	document.querySelector('#connect_btn').disabled = false;
		// }
	}

	render({ }, { pin }) {
		return (
			<div class={style.home}>
				<div class={style.connection} id="connection">
					<div class={style.status} />
					<span>Offline</span>
				</div>
				<div class={style.container}>
					<h1>Remote for Slides</h1>
					<input aria-label="Enter Code Here" id="input" type="number" value={pin} onInput={linkState(this, 'pin')} onkeyup={this.something} placeholder="Enter Code Here" />
					<button aria-label="Connect" onClick={this.connect} id="connect_btn">Connect</button>
					<button aria-label="Install Extension" onClick={this.installExtension} id="install" class={style.install}>Install Extension</button>
					<button aria-label="Help" onClick={this.openExtension} id="guide" class={style.install}>Help</button>
				</div>
				
				<div class={style.footer}>
					<div class={style.ads}>
						<ins class="adsbygoogle" />
					</div>
					<div class={style.footer_link}>
						<a href="https://limhenry.xyz/slides/">Home</a> &middot; <a href="https://paypal.me/henrylim96">Donate</a>
					</div>
					<span>&copy; Copyright 2017 Henry Lim</span>
				</div>
			</div>
		);
	}
}
