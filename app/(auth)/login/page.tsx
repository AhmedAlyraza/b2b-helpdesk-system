"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { FormField } from "@/src/components/forms/form-field";

import {
  loginSchema,
  LoginSchema,
} from "@/src/features/auth/validation/login-schema";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    console.log("Form Data:", data);

    // fake delay (simulate API)
    await new Promise((res) => setTimeout(res, 1000));
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