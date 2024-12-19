// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { error } from "console";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXj1a0cLiJGdFgsOGs0KzRrEhWpYzvK-4",
  authDomain: "devdutt-b685c.firebaseapp.com",
  projectId: "devdutt-b685c",
  storageBucket: "devdutt-b685c.firebasestorage.app",
  messagingSenderId: "482715356867",
  appId: "1:482715356867:web:65fffabcea626748af5c76",
  measurementId: "G-W9ZYF2ERT5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
  return new Promise((resolve, reject) => {
    try {
        const storageRef = ref(storage, file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (setProgress) {
                setProgress(progress);
            }
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        }, error => {
            reject(error);
        }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                resolve(downloadURL as string);
            })
        })
    } catch (error) {
        console.error(error);
        reject(error);
    }
  })
}