// src/App.jsx (로그인 기능 추가된 최종 코드)

import { useState, useEffect } from 'react';
import './App.css';
// 1. db 외에 auth 객체도 가져옵니다.
import { db, auth } from './firebase';
// 2. 인증 관련 함수들을 가져옵니다.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';


function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // --- 인증 관련 State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // 로그인된 사용자 정보를 저장할 state

  // --- 앱이 시작될 때 사용자의 로그인 상태를 확인 ---
  useEffect(() => {
    // onAuthStateChanged: 로그인 상태가 바뀔 때마다 (로그인, 로그아웃) 실행되는 감시자
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // 사용자가 있으면 user state에 저장, 없으면 null
    });
    return () => unsubscribe();
  }, []);


  // --- 로그인된 사용자에게만 할 일 목록을 보여줌 ---
  useEffect(() => {
    // 사용자가 로그인 상태가 아니면 아무것도 하지 않음
    if (!user) {
      setTodos([]); // 로그아웃 시 기존 목록 비우기
      return;
    }

    // (기존 코드와 동일) 로그인된 사용자의 할 일 목록을 가져옴
    const q = query(collection(db, 'todos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
    });

    return () => unsubscribe();
  }, [user]); // user state가 바뀔 때마다 이 useEffect가 다시 실행됨


  // --- 회원가입 처리 함수 ---
  const handleSignUp = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('회원가입 성공!', userCredential.user);
    } catch (error) {
      alert(`회원가입 실패: ${error.message}`);
    }
  };

  // --- 로그인 처리 함수 ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('로그인 성공!', userCredential.user);
    } catch (error) {
      alert(`로그인 실패: ${error.message}`);
    }
  };

  // --- 로그아웃 처리 함수 ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };


  // (기존 코드와 동일) 할 일 추가/삭제 함수
  const handleAddTodo = async () => {
    if (inputValue.trim() === '') return;
    await addDoc(collection(db, 'todos'), {
      text: inputValue,
      createdAt: serverTimestamp(),
      createdBy: user.email, // ★★★ 할 일을 추가한 사람의 이메일도 함께 저장
    });
    setInputValue('');
  };

  const handleDeleteTodo = async (idToDelete) => {
    const todoDoc = doc(db, 'todos', idToDelete);
    await deleteDoc(todoDoc);
  };

  // --- 로그인 상태에 따라 다른 화면을 보여줌 ---
  if (!user) {
    return (
      <div className="auth-container">
        <form className="auth-form">
          <h2>Sage Fine Art 팀 로그인</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자리 이상)"
            required
          />
          <div className="auth-buttons">
            <button onClick={handleLogin}>로그인</button>
            <button onClick={handleSignUp}>회원가입</button>
          </div>
        </form>
      </div>
    );
  }


  // --- 로그인된 사용자에게 보여줄 할 일 목록 화면 ---
  return (
    <div className="app-container">
      <div className="header">
        <h1>Sage Fine Art 팀 To-do List</h1>
        <div className="user-info">
          <span>{user.email}님 환영합니다!</span>
          <button onClick={handleLogout} className="logout-button">로그아웃</button>
        </div>
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="오늘의 할 일을 입력하세요"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleAddTodo}>추가</button>
      </div>
      <ul className="list-area">
        {todos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.text} <small className="creator">({todo.createdBy})</small></span>
            <button
              className="delete-button"
              onClick={() => handleDeleteTodo(todo.id)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;