// src/App.jsx (새로운 전체 코드)

import { useState, useEffect } from 'react';
import './App.css';
import { db, auth } from './firebase'; // auth도 가져오는지 확인
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
  doc,
  updateDoc, // ★★★ 데이터를 업데이트하기 위한 updateDoc 함수를 가져옵니다. ★★★
  serverTimestamp,
  deleteDoc, // (선택) 완료된 항목을 진짜로 지우고 싶을 때를 위해 남겨둡니다.
} from 'firebase/firestore';


function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  // --- 로그인 및 데이터 로딩 관련 코드는 기존과 동일 ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTodos([]);
      return;
    }
    const q = query(collection(db, 'todos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosArray = [];
      querySnapshot.forEach((doc) => {
        todosArray.push({ ...doc.data(), id: doc.id });
      });
      setTodos(todosArray);
    });
    return () => unsubscribe();
  }, [user]);

  // ★★★ '할 일 추가' 함수 (status 필드 추가됨) ★★★
  const handleAddTodo = async () => {
    if (inputValue.trim() === '') return;
    await addDoc(collection(db, 'todos'), {
      text: inputValue,
      createdAt: serverTimestamp(),
      createdBy: user.email,
      status: 'todo', // 기본 상태는 'todo'
    });
    setInputValue('');
  };

  // ★★★ '할 일 완료' 처리 함수 (새로 만듦!) ★★★
  const handleCompleteTodo = async (idToComplete) => {
    const todoDoc = doc(db, 'todos', idToComplete);
    await updateDoc(todoDoc, {
      status: 'done', // status 필드를 'done'으로 업데이트
    });
  };

  // (선택) 완료된 항목을 영구 삭제하는 함수
  const handleDeleteCompletedTodo = async (idToDelete) => {
    const todoDoc = doc(db, 'todos', idToDelete);
    await deleteDoc(todoDoc);
  };


  // --- 로그인/회원가입/로그아웃 함수는 기존과 동일 ---
  const handleSignUp = async (e) => { e.preventDefault(); try { await createUserWithEmailAndPassword(auth, email, password); } catch (error) { alert(`회원가입 실패: ${error.message}`); } };
  const handleLogin = async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, email, password); } catch (error) { alert(`로그인 실패: ${error.message}`); } };
  const handleLogout = async () => { try { await signOut(auth); } catch (error) { console.error('로그아웃 실패', error); } };


  // --- 로그인 화면 (기존과 동일) ---
  if (!user) {
    return (
      <div className="auth-container">
        <form className="auth-form">
          <h2>Sage Fine Art 팀 로그인</h2>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 (6자리 이상)" required />
          <div className="auth-buttons">
            <button onClick={handleLogin}>로그인</button>
            <button onClick={handleSignUp}>회원가입</button>
          </div>
        </form>
      </div>
    );
  }

  // ★★★ 화면에 그릴 데이터를 필터링합니다. ★★★
  const pendingTodos = todos.filter(todo => todo.status === 'todo');
  const completedTodos = todos.filter(todo => todo.status === 'done');


  // --- 로그인 후 메인 화면 (수정됨!) ---
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
        <input type="text" placeholder="새로운 업무를 입력하세요" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button onClick={handleAddTodo}>추가</button>
      </div>

      {/* ★★★ '해야 할 일' 섹션 ★★★ */}
      <h2 className="section-title">해야 할 일 ({pendingTodos.length})</h2>
      <ul className="list-area">
        {pendingTodos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.text} <small className="creator">({todo.createdBy})</small></span>
            <button
              className="complete-button" // CSS 클래스 이름 변경
              onClick={() => handleCompleteTodo(todo.id)}
            >
              완료
            </button>
          </li>
        ))}
      </ul>

      {/* ★★★ '완료된 일' 섹션 ★★★ */}
      <h2 className="section-title">완료된 일 ({completedTodos.length})</h2>
      <ul className="list-area">
        {completedTodos.map((todo) => (
          <li key={todo.id} className="completed-item">
            <span>{todo.text} <small className="creator">({todo.createdBy})</small></span>
            <button
                className="delete-button"
                onClick={() => handleDeleteCompletedTodo(todo.id)}
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