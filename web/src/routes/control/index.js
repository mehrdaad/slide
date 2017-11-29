import { h, Component } from 'preact';
import { route } from 'preact-router';
import firebase from 'firebase/app';
import database from 'firebase/database';
import style from './style';

export default class Control extends Component {

	state = {
		current_slide: '0',
		total_slide: '0',
		title: '',
		previous_btn_disabled: true,
		next_btn_disabled: true
	};

	constructor(props) {
		super(props);
	
		this.id = props.id;
		this.database = firebase.database();
		this.database.ref('slides/' + props.id).on('value', (snapshot) => {
			var data = snapshot.val();
			if (data) {
				var current_slide = data.current_slide;
				var total_slide = data.total_slide;
				var title = data.title;

				if (current_slide <= 1){
					this.setState({previous_btn_disabled: true});
				}
				else {
					this.setState({previous_btn_disabled: false});
				}
				
				if (current_slide >= total_slide) {
					this.setState({next_btn_disabled: true});
				}
				else {
					this.setState({next_btn_disabled: false});
				}

				this.setState(
					{ 
						current_slide: current_slide,
						total_slide: total_slide,
						title: title
					}
				);				
			}
			else {
				route('/');
			}
		});
	}

	disconnect = () => {
		if (confirm('Disconnect?')) {
			route('/');
		}
	}

	nextSlide = () => {
		firebase.database().ref('slides/' + this.id + '/current_slide').set(this.state.current_slide + 1)
	}

	prevSlide = () => {
		firebase.database().ref('slides/' + this.id + '/current_slide').set(this.state.current_slide - 1)			
	}

	render({ id }, { current_slide, total_slide, title, next_btn_disabled, previous_btn_disabled }) {
		return (
			<div class={style.control}>
				<div class={style.header}>
					<div class={style.title}>
						<h1>{ title }</h1>
						<p>Current Slide: { current_slide }/{ total_slide }</p>
					</div>
				</div>
				<div class={style.container}>
					<button onClick={this.nextSlide} disabled={ next_btn_disabled } id="next_btn">Next Slide</button>
					<button onClick={this.prevSlide} disabled={ previous_btn_disabled } id="previous_btn">Previous Slide</button>
				</div>
				<div class={style.bottom}>
					<button id={style.disconnect} onClick={this.disconnect}>Disconnect</button>
				</div>
			</div>
		);
	}
}
