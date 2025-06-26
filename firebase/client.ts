import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC-8R4BfV9c1WFaXkrO_lMj3kJcL2dRA6g",
    authDomain: "prepwise-ad49c.firebaseapp.com",
    projectId: "prepwise-ad49c",
    storageBucket: "prepwise-ad49c.appspot.com", // ✅ fixed here
    messagingSenderId: "557661637018",
    appId: "1:557661637018:web:9d6b77e434679d90099223",
    measurementId: "G-BBY8R782YW"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

//
// import { initializeApp,getApp,getApps } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
//
//
//
// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyC-8R4BfV9c1WFaXkrO_lMj3kJcL2dRA6g",
//     authDomain: "prepwise-ad49c.firebaseapp.com",
//     projectId: "prepwise-ad49c",
//     storageBucket: "prepwise-ad49c.firebasestorage.app",
//     messagingSenderId: "557661637018",
//     appId: "1:557661637018:web:9d6b77e434679d90099223",
//     measurementId: "G-BBY8R782YW"
// };
//
// // Initialize Firebase
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// export const auth=getAuth(app);
// export const db=getFirestore(app);
