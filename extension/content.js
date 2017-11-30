function initFirebase() {
    var config = {
        apiKey: "AIzaSyBrd4PqBBQwVVZwiPiLgsYiAI6vaSkAhHk",
        authDomain: "remoteforgs.firebaseapp.com",
        databaseURL: "https://remoteforgs.firebaseio.com",
        projectId: "remoteforgs",
        storageBucket: "remoteforgs.appspot.com",
        messagingSenderId: "602692243423"
    };

    firebase.initializeApp(config);
}

function getRandomSlideID() {
    return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}

function getSlideData() {
    var slidetitle = document.querySelector('meta[property="og:title"]').content;
    var currentslide = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-posinset'));
    var totalslide = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-setsize'));
    var docID = window.location.href.replace('https://docs.google.com/presentation/d/', '').split('/')[0];
    firebase.database().ref('/slides/' + slideid).set({
        current_slide: currentslide,
        total_slide: totalslide,
        title: slidetitle,
        id: docID
    });

    var container = document.querySelector('.punch-viewer-nav-rounded-container');
    var divider = document.createElement("div");
    divider.className = 'goog-toolbar-separator goog-toolbar-separator-disabled goog-inline-block';
    var div = document.createElement("div");
    div.className = 'goog-inline-block goog-flat-button'
    div.style = 'text-align: center; line-height: 16px';
    var label_container = document.createElement("div");
    label_container.innerHTML = 'Slide ID:'
    var id_container = document.createElement("div");
    id_container.innerHTML = slideid;
    id_container.style = 'font-size: 16px; font-weight: 600'
    var guide_container = document.createElement("div");
    guide_container.className = 'goog-inline-block goog-flat-button';
    guide_container.innerHTML = 'Remote for Google Slides:<br><span style="font-size: 14px">https://s.limhenry.xyz<div>'
    guide_container.style = 'text-align: center; font-size: 11px; line-height: 16px;';
    div.appendChild(label_container);
    div.appendChild(id_container);
    container.appendChild(divider);
    container.appendChild(div);
    container.appendChild(guide_container);
}

function listenToFirebase() {
    var fbRef = firebase.database().ref('slides/' + slideid)
    fbRef.child('current_slide').on('value', function (snapshot) {
        fbRef.once('value').then(function (snapshot) {
            var data = snapshot.val();
            var currentslide = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-posinset'));
            if (data.current_slide != currentslide) {
                if (data.current_slide > currentslide) {
                    var wheelDelta = -150;
                    firebase.database().ref('/slides/' + slideid + '/current_slide').set(currentslide + 1);
                    var speaker_note = viewerData.docData[1][currentslide][8];
                }
                else if (data.current_slide < currentslide) {
                    var wheelDelta = 150;
                    firebase.database().ref('/slides/' + slideid + '/current_slide').set(currentslide - 1);
                    var speaker_note = viewerData.docData[1][currentslide - 2][8];
                }
                firebase.database().ref('/slides/' + slideid + '/speaker_note').set(speaker_note);
                firebase.database().ref('/slides/' + slideid + '/timestamp').set(parseInt(Date.now()));
                var script = document.createElement('script');
                script.textContent = '(' + function (wheelDelta) {
                    var ele = document.querySelector('.punch-viewer-container');
                    var evt = document.createEvent("Events");
                    evt.initEvent('mousewheel', true, false);
                    evt.wheelDelta = wheelDelta;
                    ele.dispatchEvent(evt);
                } + ')(' + '\"' + wheelDelta + '\", ' + ')';

                (document.head || document.documentElement).appendChild(script);
                script.parentNode.removeChild(script);
            }
        })
    })
}

function startRemote() {
    chrome.runtime.sendMessage({
        from: 'content',
        subject: 'showNotification',
        msg: `Enter code -  ${slideid} in s.limhenry.xyz`
    });

    getSlideData();
    listenToFirebase();
}

function connectToFirebase() {
    var docsID = window.location.href.replace('https://docs.google.com/presentation/d/', '').split('/')[0];

    chrome.storage.sync.get(docsID, function (result) {
        if (Object.keys(result).length === 0) {
            firebase.database().ref("/slides/" + slideid).once('value').then(function (snapshot) {
                if (snapshot.val()) {
                    slideid = getRandomSlideID();
                    connectToFirebase();
                }
                else {
                    var save = {};
                    save[docsID] = slideid;
                    chrome.storage.sync.set(save);
                    startRemote();
                }
            })
        }
        else {
            firebase.database().ref("/slides/" + result[docsID]).once('value').then(function (snapshot) {
                if (snapshot.val()) {
                    slideid = result[docsID];
                    startRemote();
                }
                else {
                    chrome.storage.sync.remove(docsID, function (result) {
                        slideid = getRandomSlideID();
                        connectToFirebase();
                    })
                }
            })
        }
    })
}

var script = document.createElement('script');
script.id = 'tmpScript';
scriptContent = "document.querySelector('body').setAttribute('viewerData', JSON.stringify(viewerData))"
script.appendChild(document.createTextNode(scriptContent));
(document.body || document.head || document.documentElement).appendChild(script);
var viewerData = JSON.parse(document.querySelector("body").getAttribute('viewerData'));
document.querySelector("#tmpScript").remove();
document.querySelector("body").removeAttribute("viewerData");

if (window.location.host == 'slides.limhenry.xyz') {
    var isInstalledNode = document.createElement('div');
    isInstalledNode.id = 'extension-is-installed';
    document.body.appendChild(isInstalledNode);
}
else {
    initFirebase();
    var slideid = getRandomSlideID();
    connectToFirebase();
}