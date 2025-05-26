import { useLocation, useNavigate, Link } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import { FirebaseError } from "firebase/app";
import {
  useAuthContext,
  type AuthContextType,
} from "../../hooks/useAuthContext";
import { useState } from "react";

type FormFields = {
  email: string;
  password: string;
};

function Login() {
  const { login } = useAuthContext() as AuthContextType;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormFields>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = "/home"; // always go to home after login

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setIsSubmitting(true);

    try {
      await login(data.email, data.password);
      navigate(from);
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code === "auth/invalid-credential") {
          form.setError("root", {
            type: "client",
            message: "Incorrect username or password.",
          });
        } else if (e.code === "auth/invalid-email") {
          form.setError("email", {
            type: "client",
            message: "Please enter a valid email",
          });
        } else if (e.code === "auth/missing-password") {
          form.setError("password", {
            type: "client",
            message: "Please enter a password",
          });
        }
      } else {
        form.setError("root", {
          type: "client",
          message: "Unknown error occurred.",
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
        <p className="text-center text-sm text-gray-400 mb-6">Because books deserve a feed too.</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {isSubmitting ? "Loading..." : "Log in"}
            </Button>

            {form.formState.errors.root && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {form.formState.errors.root.message}
              </div>
            )}
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="underline text-white">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
