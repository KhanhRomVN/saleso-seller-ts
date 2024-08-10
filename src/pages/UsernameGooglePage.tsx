import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URI } from "@/api";

const gradientBackgroundUri =
  "https://i.ibb.co/HFMBf1q/Orange-And-White-Gradient-Background.jpg";

const UsernameGooglePage = () => {
  const { sub } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");

  const handleRegister = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${BACKEND_URI}/user/update-username`,
        { username },
        {
          headers: {
            "Content-Type": "application/json",
            accessToken: accessToken,
          },
        }
      );
      console.log(response.data);
      navigate("/");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div
      className="h-screen flex justify-center items-center bg-cover bg-center flex-col"
      style={{ backgroundImage: `url(${gradientBackgroundUri})` }}
    >
      <div className="bg-background rounded-md p-1.5">
        <div className="flex flex-col gap-0.5 p-3.5">
          <div className="w-full h-9">
            <img
              src="https://i.postimg.cc/jd0dTYF1/logo.png"
              alt="logo"
              className="object-cover h-full"
            />
          </div>
          <h2 className="text-2xl">Welcome to Saleso!</h2>
          <p className="text-sm">Please enter username to access the website</p>
        </div>
        <div className="flex flex-col bg-muted p-3.5">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            onClick={handleRegister}
            className="mt-2.5 bg-primary text-primary-foreground"
          >
            Register
          </Button>
        </div>
      </div>
      <div className="flex mt-1 gap-1.5">
        <p className="text-muted-foreground">Already have an account?</p>
        <p className="text-primary">Login here</p>
      </div>
    </div>
  );
};

export default UsernameGooglePage;
