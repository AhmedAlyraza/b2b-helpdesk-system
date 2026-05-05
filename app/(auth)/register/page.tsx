"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { FormField } from "@/src/components/forms/form-field";

type RegisterForm = {
  email: string;
  password: string;
};

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log(result);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl font-bold">Register</h1>

      <FormField label="Email">
        <Input {...register("email")} />
      </FormField>

      <FormField label="Password">
        <Input type="password" {...register("password")} />
      </FormField>

      <Button className="w-full">Create Account</Button>
    </form>
  );
}