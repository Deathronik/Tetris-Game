let firebaseConfig = {
    apiKey: "AIzaSyCvtf9frESud5TO0paq1OGsNYS48AvmIKA",
    authDomain: "tetris-app-c00bc.firebaseapp.com",
    projectId: "tetris-app-c00bc",
    storageBucket: "tetris-app-c00bc.appspot.com",
    messagingSenderId: "286354481236",
    appId: "1:286354481236:web:395bfb1b7df9ca8af50dc1"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
