"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Button, Surface, Link, Form, TextField, Label, Input, FieldError, Description, Fieldset, Spinner } from "@heroui/react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupInput = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError("");

    try {
      const { error: signUpError } = await signUp.email({ 
        email: data.email, 
        password: data.password, 
        name: data.name 
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] py-10">
      <Surface className="w-full max-w-md rounded-2xl shadow-sm p-6" variant="default">
        <Form onSubmit={handleSubmit(onSubmit)} className="w-full" validationBehavior="aria">
          <Fieldset className="w-full">
            <Fieldset.Legend className="text-2xl font-bold">Create Account</Fieldset.Legend>
            <Description>Join DawgDecision today</Description>
            
            <Fieldset.Group>
              <TextField
                isRequired
                isInvalid={!!errors.name}
                className="w-full"
              >
                <Label>Name</Label>
                <Input type="text" placeholder="Enter your name" variant="secondary" {...register("name")} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </TextField>
              <TextField
                isRequired
                isInvalid={!!errors.email}
                className="w-full"
              >
                <Label>Email</Label>
                <Input type="email" placeholder="Enter your email" variant="secondary" {...register("email")} />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </TextField>
              <TextField
                isRequired
                isInvalid={!!errors.password}
                className="w-full"
              >
                <Label>Password</Label>
                <Input type="password" placeholder="Create a password" variant="secondary" {...register("password")} />
                <Description>Must be at least 8 characters</Description>
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </TextField>
            </Fieldset.Group>
            
            {error && <p className="text-danger text-sm">{error}</p>}
            
            <Fieldset.Actions className="flex flex-col w-full gap-4">
              <Button
                type="submit"
                variant="primary"
                isPending={isLoading}
                className="w-full gap-2"
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "Signing Up..." : "Sign Up"}
                  </>
                )}
              </Button>
              <div className="text-center text-sm w-full">
                Already have an account?{" "}
                <Link href="/login">
                  Sign In
                </Link>
              </div>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </Surface>
    </div>
  );
}
