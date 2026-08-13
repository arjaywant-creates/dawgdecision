"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Surface,
  Link,
  Form,
  TextField,
  Label,
  Input,
  FieldError,
  Fieldset,
  Description,
  Spinner,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { signIn } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError("");

    try {
      const { error: signInError } = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message || "Failed to sign in. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] py-10">
      <Surface
        className="w-full max-w-md rounded-2xl shadow-sm p-6"
        variant="default"
      >
        <Form
          className="w-full"
          validationBehavior="aria"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Fieldset className="w-full">
            <Fieldset.Legend className="text-2xl font-bold">
              Welcome Back
            </Fieldset.Legend>
            <Description>Sign in to your account</Description>

            <Fieldset.Group>
              <TextField
                isRequired
                className="w-full"
                isInvalid={!!errors.email}
              >
                <Label>Email</Label>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  variant="secondary"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </TextField>
              <TextField
                isRequired
                className="w-full"
                isInvalid={!!errors.password}
              >
                <Label>Password</Label>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  variant="secondary"
                  {...register("password")}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </TextField>
            </Fieldset.Group>

            {error && <p className="text-danger text-sm">{error}</p>}

            <Fieldset.Actions className="flex flex-col w-full gap-4">
              <Button
                className="w-full"
                isPending={isLoading}
                type="submit"
                variant="primary"
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "Signing In..." : "Sign In"}
                  </>
                )}
              </Button>
              <div className="text-center text-sm w-full">
                Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
              </div>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </Surface>
    </div>
  );
}
