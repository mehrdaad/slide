import './style';
import App from './components/app';
import firebase from 'firebase/app';

const config = {
	apiKey: "AIzaSyBrd4PqBBQwVVZwiPiLgsYiAI6vaSkAhHk",
    authDomain: "remoteforgs.firebaseapp.com",
    databaseURL: "https://remoteforgs.firebaseio.com",
    projectId: "remoteforgs",
    storageBucket: "remoteforgs.appspot.com",
    messagingSenderId: "602692243423"
};

firebase.initializeApp(config);

export default App;
