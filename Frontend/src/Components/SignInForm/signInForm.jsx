import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { SignInContainer, ButtonsContainer } from "./signInForm-style.jsx";
import FormInput from "../FormInput/formInput";
import Button from "../Button/button";
import { useDispatch } from 'react-redux';
import { setUser } from '../../Store/userSlice';

export default function SignInForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: "",
  });
  const [lockedEmails, setLockedEmails] = useState({}); // Store locked email data (email: { attempts, lockedAt })

  const { email, password } = userCredentials;

  const handleFailedLogin = (email) => {
    const newAttempts = (lockedEmails[email]?.attempts || 0) + 1;
    const isLocked = newAttempts >= 3;
    setLockedEmails({
      ...lockedEmails,
      [email]: {
        attempts: newAttempts,
        lockedAt: isLocked ? new Date() : null,
      },
    });
  };

  useEffect(() => {
    // Clear timeouts on component unmount
    return () => {
      for (const lockedEmail in lockedEmails) {
        clearTimeout(lockedEmails[lockedEmail].timeoutId);
      }
    };
  }, []); // Empty dependency array to run only once

  const handleSubmit = async (event) => {
    event.preventDefault();

    const lockedEmailData = lockedEmails[email];
    if (lockedEmailData && lockedEmailData.lockedAt && new Date() - lockedEmailData.lockedAt < 30000) {
      console.log("This account is locked. Please try again later.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3005/api/users/login",
        userCredentials,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userid);
      }

      if (data.role === "teacher") {
        let user = {
          studentAuth: false,
          teacherAuth: true,
        };
        dispatch(setUser(user));
        navigate("/teacher");
      } else if (data.role === "student" || data.userid) {
        let user = {
          studentAuth: true,
          teacherAuth: false,
        };
        dispatch(setUser(user));
        navigate("/student");
      }
    } catch (error) {
      console.log(error);
      handleFailedLogin(email);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserCredentials({ ...userCredentials, [name]: value });
  };

  return (
    <SignInContainer>
      <h2>Already have an account?</h2>
      <span>Sign in with your email and password</span>
      {lockedEmails[email] && lockedEmails[email].lockedAt && new Date() - lockedEmails[email].lockedAt < 30000 && (
        <p>This account is locked. Please try again later.</p>
      )}
      <form onSubmit={handleSubmit}>
        <FormInput
          label={"Email"}
          required
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
        />
        <FormInput
          required
          label={"Password"}
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
        />
        <ButtonsContainer>
          <Button button={"default"} type="submit">
            Sign In
          </Button>
        </ButtonsContainer>
      </form>
    </SignInContainer>
  );
}
