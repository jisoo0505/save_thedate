// ===============================================
// Firebase 설정 & 헬퍼
// 기본 버전 / 큰 글씨 버전 두 파일이 같은 컬렉션을 공유합니다.
// - rsvp: 참석 회신
// - guestbook: 방명록
// ===============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBj8ec5gOhPSsinMyFSsR6vSxc0DwWWle4",
  authDomain: "wedding-rsvp-db-66205.firebaseapp.com",
  projectId: "wedding-rsvp-db-66205",
  storageBucket: "wedding-rsvp-db-66205.firebasestorage.app",
  messagingSenderId: "1002812724559",
  appId: "1:1002812724559:web:132388405763fc7e2d613a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// window에 노출해서 인라인 스크립트에서 접근 가능하게
window.WeddingDB = {
  // RSVP 저장
  async submitRsvp(data) {
    return await addDoc(collection(db, "rsvp"), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  // 방명록 저장
  async submitGuestbook(data) {
    return await addDoc(collection(db, "guestbook"), {
      ...data,
      createdAt: serverTimestamp()
    });
  },

  // 방명록 실시간 구독
  subscribeGuestbook(callback) {
    const q = query(
      collection(db, "guestbook"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    return onSnapshot(q, (snap) => {
      const items = [];
      snap.forEach(doc => {
        const d = doc.data();
        items.push({
          id: doc.id,
          name: d.name,
          msg: d.msg,
          createdAt: d.createdAt?.toDate?.() || new Date()
        });
      });
      callback(items);
    }, (err) => {
      console.error('guestbook subscribe error:', err);
      callback([]);
    });
  },

  // 관리자용: RSVP 전체 조회
  async fetchAllRsvp() {
    const q = query(collection(db, "rsvp"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach(doc => {
      const d = doc.data();
      items.push({
        id: doc.id,
        ...d,
        createdAt: d.createdAt?.toDate?.() || null
      });
    });
    return items;
  },

  // 관리자용: 방명록 전체 조회
  async fetchAllGuestbook() {
    const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach(doc => {
      const d = doc.data();
      items.push({
        id: doc.id,
        ...d,
        createdAt: d.createdAt?.toDate?.() || null
      });
    });
    return items;
  }
};

// Ready 신호
window.dispatchEvent(new Event('weddingdb-ready'));
