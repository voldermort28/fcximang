/* eslint-disable no-console */
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics';
import 'firebase/firestore';
// import Utils from '../../../../core/truonghoangphuc/utils';

const firebaseConfig = {
  apiKey: 'AIzaSyBXUB5Qn_FOc7wnJvPCWbMC3SYYfugvRgc',
  authDomain: 'fico-luckydraw.firebaseapp.com',
  databaseURL: 'https://fico-luckydraw.firebaseio.com',
  projectId: 'fico-luckydraw',
  storageBucket: 'fico-luckydraw.appspot.com',
  messagingSenderId: '42777115684',
  appId: '1:42777115684:web:2a88bb251843b98edb6cb1',
  measurementId: 'G-PHQY4DRHPE',
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();
firebase.auth().useDeviceLanguage();

// const database = firebase.database();
const db = firebase.firestore();
const providerFB = new firebase.auth.FacebookAuthProvider();
const providerG = new firebase.auth.GoogleAuthProvider();
class FirebaseFico {
  // eslint-disable-next-line class-methods-use-this
  getAllUser(cb) {
    const res = [];
    db.collection('users').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        res.push({
          id: doc.id,
          data: doc.data(),
        });
      });
    });
    cb(res);
  }

  // eslint-disable-next-line class-methods-use-this
  getUser(condition, value, cb) {
    const res = [];
    // console.log(condition, value);
    db.collection('users').where(condition, '==', value).get().then((querySnapshot) => {
      // console.log(querySnapshot);
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        user.id = doc.id;
        res.push(user);
      });
      cb(res);
    })
      .catch((error) => {
        console.log(error);
        cb(error);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  getMaxLucky(cb) {
    db.collection('users').orderBy('lucky', 'desc').limit(1).get()
      .then((querySnapshot) => {
        if (querySnapshot.docs[0]) {
          cb(querySnapshot.docs[0].data().lucky);
        }
      })
      .catch((error) => {
        console.log(error);
        cb(error);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  getBills(user, cb) {
    const res = [];
    db.collection('bill').where('user_id', '==', user.id).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const bill = doc.data();
        bill.id = doc.id;
        res.push(bill);
      });
      cb(res);
    })
      .catch((error) => {
        console.log(error);
        cb(error);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  addUser(user, cb) {
    // console.log(user);
    db.collection('users').add(user)
      .then((docRef) => {
        cb(docRef);
      })
      .catch((error) => {
        cb(error);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  updateUser(user, cb) {
    // console.log(user);
    db.collection('users').doc(user.id).set(user, { merge: true })
      .then(() => {
        cb();
      })
      .catch((error) => {
        cb(error);
      });
    // db.collection('users').doc(user.id).get()
    //   .then((doc) => {
    //     console.log(doc.data());
    //     cb(doc);
    //   })
    //   .catch((error) => {
    //     cb(error);
    //   });
  }

  // eslint-disable-next-line class-methods-use-this
  addBill(bill, cb) {
    console.log(bill);
    db.collection('bill').add(bill)
      .then((docRef) => {
        cb(docRef);
      })
      .catch((error) => {
        cb(error);
      });
  }

  signInPopup(provider, cb) {
    const $this = this;
    let _p;
    if (provider === 'facebook') _p = providerFB;
    if (provider === 'google') _p = providerG;

    firebase.auth().signInWithPopup(_p).then((result) => {
      const token = result.credential.accessToken;
      // The signed-in user info.
      const { user } = result;
      $this.user = user;
      $this.token = token;
      cb({ token, user });
    }).catch(error => cb(error));

    // Handle Errors here.
    // const errorCode = error.code;
    // const errorMessage = error.message;
    // // The email of the user's account used.
    // const { email } = error;
    // // The firebase.auth.AuthCredential type that was used.
    // const { credential } = error;
  }

  // eslint-disable-next-line class-methods-use-this
  signUpPhone(data, cb) {
    db.collection('users').add(data)
      .then((docRef) => {
        cb(docRef);
      })
      .catch((error) => {
        cb(error);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  signInPhone(data, cb) {
    console.log(data);
    const res = [];
    let query = db.collection('users').where('phone', '==', data.phone);
    query = query.where('password', '==', data.password);

    query.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        user.id = doc.id;
        res.push(user);
      });
      cb(res);
    })
      .catch((error) => {
        console.log(error);
        cb(error);
      });
  }

  init() {
    const $this = this;
    return $this;
  }
}

export default FirebaseFico;
