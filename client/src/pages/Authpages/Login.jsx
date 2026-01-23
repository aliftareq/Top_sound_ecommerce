import CommonForm from "@/components/Common_components/Form";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth_slice";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialState = {
  phoneNumber: "",
  password: "",
};

const AuthLogin = () => {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onSubmit = (event) => {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message || "login successfull");
      } else {
        toast.error(data?.payload?.message || "login failed");
        if (
          data?.payload?.message == "User doesn't exists! Please register first"
        ) {
          navigate("/auth/register");
        }
      }
    });
  };

  console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("login.text1")}
        </h1>
        <p className="mt-2">
          {t("login.text2")}
          <Link
            className="font-medium ml-2 text-primary hover:underline text-blue-800"
            to="/auth/register"
          >
            {t("login.text3")}
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default AuthLogin;
