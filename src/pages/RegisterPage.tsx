import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BACKEND_URI } from "@/api";

const gradientBackgroundUri =
  "https://i.ibb.co/HFMBf1q/Orange-And-White-Gradient-Background.jpg";

interface GoogleUserData {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const EmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleEmailSubmit = async () => {
    try {
      await axios.post(`${BACKEND_URI}/auth/email-verify`, { email });
      setShowOTPInput(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        console.error("Email already registered");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        console.error("Error sending email verification:", error);
      }
    }
  };

  const handleOTPSubmit = async () => {
    try {
      const response = await axios.post(`${BACKEND_URI}/auth/register-otp`, {
        email,
        otp,
        username,
        password,
      });
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const decoded = jwtDecode(
        credentialResponse.credential
      ) as GoogleUserData;
      const { email, name, picture, sub } = decoded;
      const userData = { email, name, picture, sub };
      const response = await axios.post(
        `${BACKEND_URI}/auth/login/google`,
        userData
      );
      const { accessToken, refreshToken, currentUser } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      let localStorageCurrentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (!localStorageCurrentUser.username) {
        const username = prompt("Please enter your username:");
        if (username) {
          const updateResponse = await axios.post(
            `${BACKEND_URI}/user/update-username`,
            { username },
            {
              headers: {
                "Content-Type": "application/json",
                accessToken,
              },
            }
          );
          localStorageCurrentUser.username = updateResponse.data.username;
          localStorage.setItem(
            "currentUser",
            JSON.stringify(localStorageCurrentUser)
          );
        } else {
          console.error("Username is required.");
          return;
        }
      }

      console.log("Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Google login failed.");
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google login failed.");
  };

  return (
    <div
      className="h-screen flex justify-center items-center bg-cover bg-center flex-col"
      style={{ backgroundImage: `url(${gradientBackgroundUri})` }}
    >
      <Card className="w-96">
        <CardHeader className="space-y-1">
          <div className="w-full h-9">
            <img
              src="https://i.postimg.cc/jd0dTYF1/logo.png"
              alt="logo"
              className="object-cover h-full"
            />
          </div>
          <p variant="h4">Welcome to Saleso!</p>
          <p variant="muted">Create an account to experience many new things</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {showOTPInput && (
            <>
              <Input
                type="password"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}
          <Button
            className="w-full"
            onClick={showOTPInput ? handleOTPSubmit : handleEmailSubmit}
          >
            {showOTPInput ? "Verify OTP" : "Register"}
          </Button>
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex mt-2 gap-2">
        <p variant="muted">Already have an account?</p>
        <p className="text-primary cursor-pointer" onClick={navigateToLogin}>
          Login here
        </p>
      </div>
    </div>
  );
};

export default EmailPage;
