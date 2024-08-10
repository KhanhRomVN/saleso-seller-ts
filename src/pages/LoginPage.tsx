import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BACKEND_URI } from "@/api";

const gradientBackgroundUri =
  "https://i.ibb.co/HFMBf1q/Orange-And-White-Gradient-Background.jpg";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BACKEND_URI}/auth/login`, {
        email,
        password,
        role: "seller",
      });
      const { currentUser, accessToken, refreshToken } = response.data;

      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      toast({ title: "Login successful!", variant: "success" });
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
      toast({
        title: "Login failed.",
        description: "Please check your credentials.",
        variant: "error",
      });
    }
  };

  const navigateToRegister = () => {
    navigate("/register");
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
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

      const localStorageCurrentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );

      if (!localStorageCurrentUser.username) {
        navigate(`/register/username/${sub}`);
        return;
      }

      toast({ title: "Login successful!", variant: "success" });
      navigate("/");
    } catch (err) {
      toast({ title: "Google login failed.", variant: "error" + err });
    }
  };

  const handleGoogleLoginError = () => {
    toast({ title: "Google login failed.", variant: "error" });
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center flex-col p-5"
      style={{ backgroundImage: `url(${gradientBackgroundUri})` }}
    >
      <div className="bg-background rounded-lg p-4 w-full max-w-md mb-5">
        <div className="flex flex-col gap-3 mb-5">
          <div className="w-full h-10 text-center">
            <img
              src="https://i.postimg.cc/jd0dTYF1/logo.png"
              alt="logo"
              className="object-cover h-full mx-auto"
            />
          </div>
          <h2 className="text-2xl text-center">Welcome to Saleso!</h2>
          <p className="text-sm text-center">
            Please enter your email and password to login
          </p>
        </div>
        <div className="flex flex-col bg-secondary p-4 rounded-md">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3"
          />
          <Button onClick={handleLogin} className="mt-3 bg-primary">
            Login
          </Button>
          <div className="w-full mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-2 items-center gap-2">
        <p className="text-secondary">Don't have an account?</p>
        <p className="text-primary cursor-pointer" onClick={navigateToRegister}>
          Register here
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
