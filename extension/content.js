var origin, docsID, slideid, fbRef;

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

function getSlidesData() {
    if (origin == 'ludus') {
        var slidetitle = document.querySelector('[property="og:title"]').content;
        var currentslide = parseInt(document.querySelector('#current-slide').innerHTML);
        var totalslide = parseInt(document.querySelector('#total-slides').innerHTML);
        firebase.database().ref('/slides/' + slideid).set({
            current_slide: currentslide,
            total_slide: totalslide,
            title: slidetitle,
            id: docsID,
            type: 'ludus'
        });
    } else {
        var slidetitle = document.querySelector('meta[property="og:title"]').content;
        var currentslide = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-posinset'));
        var totalslide = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-setsize'));
        var speaker_note = viewerData.docData[1][currentslide - 1][8];
        firebase.database().ref('/slides/' + slideid).set({
            current_slide: currentslide,
            total_slide: totalslide,
            title: slidetitle,
            id: docsID,
            speaker_note: speaker_note,
            type: 'googleslides'
        });

        if (document.querySelector('#rfgs_id_container')) {
            document.querySelector('#rfgs_id_container').innerHTML = slideid;
        }
        else {
            var container = document.querySelector('.punch-viewer-nav-rounded-container');
            var divider = document.createElement("div");
            divider.className = 'goog-toolbar-separator goog-toolbar-separator-disabled goog-inline-block';
            var divider2 = document.createElement("div");
            divider2.className = 'goog-toolbar-separator goog-toolbar-separator-disabled goog-inline-block';
            var div = document.createElement("div");
            div.className = 'goog-inline-block goog-flat-button'
            div.style = 'text-align: center; line-height: 16px';
            var label_container = document.createElement("div");
            label_container.innerHTML = 'Slide ID:'
            var id_container = document.createElement("div");
            id_container.innerHTML = slideid;
            id_container.id = 'rfgs_id_container';
            id_container.style = 'font-size: 16px; font-weight: 600'
            var guide_container = document.createElement("div");
            guide_container.className = 'goog-inline-block goog-flat-button';
            guide_container.innerHTML = 'Remote for Google Slides:<br><span style="font-size: 14px">https://s.limhenry.xyz<div>'
            guide_container.style = 'text-align: center; font-size: 11px; line-height: 16px;';

            var div2 = document.createElement("div");
            div2.style.display = 'inline-block';
            div2.innerHTML = `
                <div class="goog-inline-block goog-flat-button">
                    <div class="punch-viewer-captioned-button" id="rfgs_refresh_id">
                        <div style="width:24px; height:24px">
                            <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%; fill: #cacaca;"><g><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></g></svg>
                        </div>
                        <div class="punch-viewer-speaker-notes-text goog-inline-block">Refresh ID</div>
                    </div>
                </div>
                <div class="goog-inline-block goog-flat-button">
                    <div class="punch-viewer-captioned-button" id="rfgs_stop_remote">
                        <div style="width:24px; height:24px">
                            <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%; fill: #cacaca;"><g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g></svg>
                        </div>
                        <div class="punch-viewer-speaker-notes-text goog-inline-block">Stop Remote</div>
                    </div>
                </div>`;

            div.appendChild(label_container);
            div.appendChild(id_container);
            container.appendChild(divider);
            container.appendChild(div);
            container.appendChild(guide_container);
            container.appendChild(divider2);
            container.appendChild(div2);

            document.querySelector('#rfgs_refresh_id').addEventListener('click', function() {
                chrome.storage.sync.remove(docsID, function (result) {
                    firebase.database().ref('/slides/' + slideid).remove();
                    slideid = getRandomSlideID();
                    connectToFirebase();
                });
            });

            document.querySelector('#rfgs_stop_remote').addEventListener('click', function() {
                fbRef.child('current_slide').off('value', console.log());
                document.querySelector('#rfgs_id_container').innerHTML = "-";
                firebase.database().ref('/slides/' + slideid + '/speaker_note').set('');
            })
        }
    }
}

function changeSlides() {
    fbRef = firebase.database().ref('slides/' + slideid);
    fbRef.child('current_slide').on('value', function (snapshot) {
        fbRef.once('value').then(function (snapshot) {
            var data = snapshot.val();
            if (origin == 'ludus') {
                var currentslide = parseInt(document.querySelector('#current-slide').innerHTML);
                if (data.current_slide != currentslide) {
                    if (data.current_slide > currentslide) {
                        firebase.database().ref('/slides/' + slideid + '/current_slide').set(currentslide + 1);
                        window.postMessage('nextSlide', location.origin);
                    } else if (data.current_slide < currentslide) {
                        firebase.database().ref('/slides/' + slideid + '/current_slide').set(currentslide - 1);
                        window.postMessage('previousSlide', location.origin);
                    }
                    firebase.database().ref('/slides/' + slideid + '/timestamp').set(parseInt(Date.now()));
                }
            } else {
                var currentslide = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-posinset'));
                if (data.current_slide != currentslide) {
                    var observer_content = new MutationObserver(function(mutations) {
                        slideNumber = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-posinset'));
                        var speaker_note = viewerData.docData[1][slideNumber - 1][8];
                        firebase.database().ref('/slides/' + slideid + '/current_slide').set(slideNumber);
                        firebase.database().ref('/slides/' + slideid + '/speaker_note').set(speaker_note);
                        observer_content.disconnect();
                    });
                    var observer_number = new MutationObserver(function(mutations) {
                        slideNumber = parseInt(document.querySelector('.goog-flat-menu-button-caption').getAttribute('aria-posinset'));
                        var speaker_note = viewerData.docData[1][slideNumber - 1][8];
                        firebase.database().ref('/slides/' + slideid + '/current_slide').set(slideNumber);
                        firebase.database().ref('/slides/' + slideid + '/speaker_note').set(speaker_note);
                        observer_number.disconnect();
                    });
                    var config = { attributes: true, childList: true, characterData: true, subtree: true };

                    if (data.current_slide > currentslide) {
                        var wheelDelta = -50;
                        var newSlideValue = currentslide + 1;
                        var speaker_note = viewerData.docData[1][newSlideValue - 1][8];
                        observer_content.observe(document.querySelector('.punch-viewer-content'), config);   
                    } else if (data.current_slide < currentslide) {
                        var wheelDelta = 50;
                        var newSlideValue = currentslide - 1;
                        var speaker_note = viewerData.docData[1][newSlideValue - 1][8];
                        observer_content.observe(document.querySelector('.punch-viewer-content'), config);
                        observer_number.observe(document.querySelector('.goog-flat-menu-button-caption'), config);   
                    }

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

    getSlidesData();
    changeSlides();
}

function connectToFirebase() {
    chrome.storage.sync.get(docsID, function (result) {
        if (Object.keys(result).length === 0) {
            firebase.database().ref("/slides/" + slideid).once('value').then(function (snapshot) {
                if (snapshot.val()) {
                    slideid = getRandomSlideID();
                    connectToFirebase();
                } else {
                    var save = {};
                    save[docsID] = slideid;
                    chrome.storage.sync.set(save);
                    startRemote();
                }
            })
        } else {
            firebase.database().ref("/slides/" + result[docsID]).once('value').then(function (snapshot) {
                if (snapshot.val()) {
                    slideid = result[docsID];
                    startRemote();
                } else {
                    chrome.storage.sync.remove(docsID, function (result) {
                        slideid = getRandomSlideID();
                        connectToFirebase();
                    })
                }
            })
        }
    })
}

if (window.location.host == 'slides.limhenry.xyz') {
    var isInstalledNode = document.createElement('div');
    isInstalledNode.id = 'extension-is-installed';
    document.body.appendChild(isInstalledNode);
} else if (window.location.host == 'app.ludus.one') {
    var script = document.createElement('script');
    script.id = 'tmpScript';
    scriptContent = "document.querySelector('body').setAttribute('presentationid', window.presentationId);"
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    docsID = document.querySelector("body").getAttribute('presentationid');
    document.querySelector("#tmpScript").remove();
    document.querySelector("body").removeAttribute("presentationid");

    if (window.name == 'ludus_viewer') {
        origin = 'ludus';
        slideid = getRandomSlideID();
        initFirebase();
        function waitForElementToDisplay() {
            if(document.querySelector('#current-slide')!=null) {
                connectToFirebase();
                return;
            }
            else {
                setTimeout(function() {
                    waitForElementToDisplay();
                }, 500);
            }
        }
        waitForElementToDisplay();
    }
} else {
    if (window.location.pathname.indexOf('/edit') > 0) {
        var title_bar = document.querySelector('.docs-titlebar-buttons');
        var btn_container = document.createElement("a");
        btn_container.href = window.location.href.replace('edit', 'present');
        btn_container.className = 'goog-inline-block jfk-button jfk-button-standard docs-titlebar-button';
        btn_container.style.marginRight = '0';
        btn_container.style.cursor = 'pointer';
        btn_container.style.textDecoration = 'none';
        btn_container.style.color = 'black';
        var label_container = document.createElement("span");
        label_container.innerHTML = 'Present with Remote';
        btn_container.appendChild(label_container);
        title_bar.insertBefore(btn_container, title_bar.childNodes[0]);

    } else {
        if (window.location.pathname.indexOf(window.location.href.replace('https://docs.google.com/presentation/d/', '').split('/')[0] + '/present') > 0) {
            origin = 'gslides';
            docsID = window.location.href.replace('https://docs.google.com/presentation/d/', '').split('/')[0];
            slideid = getRandomSlideID();

            var script = document.createElement('script');
            script.id = 'tmpScript';
            scriptContent = "document.querySelector('body').setAttribute('viewerData', JSON.stringify(viewerData))"
            script.appendChild(document.createTextNode(scriptContent));
            (document.body || document.head || document.documentElement).appendChild(script);
            var viewerData = JSON.parse(document.querySelector("body").getAttribute('viewerData'));
            document.querySelector("#tmpScript").remove();
            document.querySelector("body").removeAttribute("viewerData");

            initFirebase();
            connectToFirebase();
        }
    }
}