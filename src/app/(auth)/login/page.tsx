"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";

import {
  loginSchema,
  LoginSchema,
} from "@/features/auth/validation/login-schema";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Login failed");
      return;
    }

    // redirect after successful login
    window.location.href = "/dashboard";

  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl font-bold">Login</h1>

      <FormField label="Email" error={errors.email?.message}>
        <Input {...register("email")} placeholder="Enter your email" />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <Input
          type="password"
          {...register("password")}
          placeholder="Enter your password"
        />
      </FormField>

      <Button className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}