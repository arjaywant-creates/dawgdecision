"use client";

/** React & Next.js */
import { useState } from "react";
import { useRouter } from "next/navigation";

/** UI Components (HeroUI) */
import {
  Button,
  Surface,
  Link,
  Form,
  TextField,
  Label,
  Input,
  FieldError,
  Description,
  Fieldset,
  Spinner,
} from "@heroui/react";

/** Form Handling & Validation */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/** Auth Actions & Types */
import { signUp } from "@/lib/auth-client";
import { signupSchema, type SignupInput } from "@/types/auth";

/**
 * Signup page component handling new user registration
 */
export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError("");

    try {
      const { error: signUpError } = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (signUpError) {
        setError(
          signUpError.message || "Failed to create account. Please try again.",
        );
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-1 pt-4 pb-24">
      {/* Signup Card Surface */}
      <Surface
        className="w-full max-w-md rounded-2xl shadow-sm p-6"
        variant="default"
      >
        {/* Registration Form */}
        <Form
          className="w-full"
          validationBehavior="aria"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Fieldset className="w-full">
            {/* Header Section */}
            <Fieldset.Legend className="text-2xl font-bold">
              Create Account
            </Fieldset.Legend>
            <Description>Join DawgDecision today</Description>

            {/* Form Fields Section */}
            <Fieldset.Group>
              <TextField
                isRequired
                className="w-full"
                /** Convert error object to boolean */
                isInvalid={!!errors.name}
              >
                <Label>Name</Label>
                <Input
                  placeholder="Enter your name"
                  type="text"
                  variant="secondary"
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </TextField>
              <TextField
                isRequired
                className="w-full"
                /** Convert error object to boolean */
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
                /** Convert error object to boolean */
                isInvalid={!!errors.password}
              >
                <Label>Password</Label>
                <Input
                  placeholder="Create a password"
                  type="password"
                  variant="secondary"
                  {...register("password")}
                />
                <Description>Must be at least 8 characters</Description>
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </TextField>
              <TextField
                isRequired
                className="w-full"
                /** Convert error object to boolean */
                isInvalid={!!errors.confirmPassword}
              >
                <Label>Confirm Password</Label>
                <Input
                  placeholder="Confirm your password"
                  type="password"
                  variant="secondary"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                )}
              </TextField>
            </Fieldset.Group>

            {/* Error Message Display */}
            {error && <p className="text-danger text-sm">{error}</p>}

            {/* Submit & Links Actions */}
            <Fieldset.Actions className="flex flex-col w-full gap-4">
              <Button
                className="w-full gap-2"
                isPending={isLoading}
                type="submit"
                variant="primary"
              >
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "Signing Up..." : "Sign Up"}
                  </>
                )}
              </Button>
              <div className="text-center text-sm w-full">
                Already have an account? <Link href="/login">Sign In</Link>
              </div>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </Surface>
    </div>
  );
}
