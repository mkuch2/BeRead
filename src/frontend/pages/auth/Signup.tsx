import { useNavigate, Link } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/frontend/components/ui/form";
import axios, { isAxiosError } from "axios";
import {
  useAuthContext,
  type AuthContextType,
} from "../../hooks/useAuthContext";
import { useState } from "react";

// Validation schema
const User = z.object({
  username: z
    .string()
    .trim()
    .nonempty({ message: "Please provide a username" })
    .min(5, { message: "Please provide a username longer than 5 characters" })
    .max(50, {
      message: "Please provide a username shorter than 50 characters",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only consist of letters, numbers, and underscores",
    }),
  email: z
    .string()
    .trim()
    .nonempty({ message: "Please provide an email" })
    .email(),
  password: z
    .string()
    .trim()
    .nonempty({ message: "Please provide a password" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50, { message: "Password must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9!@#$%^&*]+$/, {
      message:
        "Password must contain only letters, numbers, and !@#$%^&*",
    }),
});

type FormFields = z.infer<typeof User>;

function Signup() {
  const navigate = useNavigate();
  const form = useForm<FormFields>({
    resolver: zodResolver(User),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const { signUp } = useAuthContext() as AuthContextType;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setIsSubmitting(true);
    try {
      const backendPromise = axios.post("/api/signup", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      const firebasePromise = signUp(data.email, data.password);
      await Promise.all([backendPromise, firebasePromise]);

      navigate("/");
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.data?.errors) {
          e.response.data.errors.forEach((err: any) => {
            if (err.meta.target[0]) {
              form.setError(err.meta.target[0] as keyof FormFields, {
                type: "server",
                message: err.msg,
              });
            }
          });
        } else {
          form.setError("root", {
            type: "server",
            message: "Server error. Please try again.",
          });
        }
      } else {
        form.setError("root", {
          type: "server",
          message: "An unknown error occurred",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
      <div className="bg-neutral-900 px-8 py-10 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-1">BeRead</h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Create an account to join the feed.
        </p>

        {form.formState.errors.root && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {form.formState.errors.root.message}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} className="bg-neutral-800 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} className="bg-neutral-800 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="password"
                      {...field}
                      className="bg-neutral-800 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
              {isSubmitting ? "Submitting..." : "Sign up"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="underline text-white">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
