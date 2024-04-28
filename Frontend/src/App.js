import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Authentication from "./Routes/Authentication/authentication.jsx";
import Home from "./Routes/Home/home.jsx";
import Teacher from "./Routes/Teacher/teacher.jsx";
import Student from "./Routes/Student/student.jsx";
import ClassQuiz from "./Components/StudentClass/classQuiz.jsx";
import NavigationBar from "./Components/NavigationBar/navigationBar.jsx";
import "react-toastify/dist/ReactToastify.css";
import Protected from "./Components/Protected/Protected.jsx";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
function App() {
  let teacherAuth = useSelector(state=>state.user.teacherAuth);
  let studentAuth = useSelector(state=>state.user.studentAuth);
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<NavigationBar />}>
          <Route index element={<Home />}></Route>
          <Route path="auth" element={<Authentication />}></Route>
          <Route path="teacher" element={<Protected isAuth={teacherAuth}><Teacher /></Protected>}></Route>
          <Route path="student" element={<Protected isAuth={studentAuth}><Student /></Protected>}></Route>
          <Route path="student/:id" element={<ClassQuiz />} />
          <Route path="*" element={<h1>Not Found</h1>}></Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;