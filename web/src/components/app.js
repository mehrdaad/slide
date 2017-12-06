import { h, Component } from 'preact';
import { Router } from 'preact-router';
import Home from '../routes/home';
import Control from '../routes/control';

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	reload = () => {
		location.reload();
	}

	render() {
		return (
			<div id="app">
				<div class="toast">
					<span>New version available</span>
					<span class="button" onClick={this.reload}>Refresh</span>
				</div>
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Control path="/:id" />
				</Router>
			</div>
		);
	}
}
