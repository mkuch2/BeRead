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
import axios from "axios";
import { isAxiosError } from "axios";
import {
  useAuthContext,
  type AuthContextType,
} from "../../hooks/useAuthContext";
import { useState } from "react";

//Validation schema for user
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
    .nonempty({ message: "Please provide a password " })
    .min(8, { message: "Password must be at least 8 characters!" })
    .max(50, { message: "Password can not be longer than 50 characters!" })
    .regex(/^[a-zA-Z0-9!@#$%^&*]+$/, {
      message:
        "Password must consist of only letters, numbers, and characters !@#$%^&*",
    }),
});

//Define types for form fields from zod's validation schema
type FormFields = z.infer<typeof User>;

function Signup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormFields>({
    resolver: zodResolver(User),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  interface ServerError {
    msg: string;
    meta: {
      modelName: string;
      target: string[];
    };
    code?: string;
  }

  const { signUp } = useAuthContext() as AuthContextType;

  //TODO: IMPLEMENT
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    console.log("In onSubmit");
    setIsSubmitting(true);
    try {
      const backendPromise = axios.post("/api/signup", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      const firebasePromise = signUp(data.email, data.password);

      //Succeed if both axios and firebase promise fulfilled, fail otherwise
      await Promise.all([backendPromise, firebasePromise]);

      navigate("/");
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response) {
          console.log("Response data", e.response.data);
          console.log("Response", e.response);
          // Server responded with error code
          if (e.response.data?.errors) {
            //Display error message at appropiate field
            console.log("Inside if statement", e.response.data?.errors);
            e.response.data.errors.forEach((err: ServerError) => {
              if (
                err.meta.target[0] &&
                err.meta.target[0] in form.getValues()
              ) {
                form.setError(err.meta.target[0] as keyof FormFields, {
                  type: "server",
                  message: err.msg,
                });
              }
            });
          }
        } else if (e.request) {
          console.log(e.request);
          // Request made but no response recieved
          form.setError("root", {
            type: "server",
            message: "Connection error. Please try again.",
          });
        } else {
          // Error setting up request
          form.setError("root", {
            type: "server",
            message: e.message || "Error setting up request",
          });
        }
      } else {
        console.log("Unknown error:", e);
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
    <>
      {form.formState.errors.root && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {form.formState.errors.root.message}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="username" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </form>
      </Form>

      <Link to="/">Home Page</Link>
      <Link to="/login">Login Page</Link>
    </>
  );
}

export default Signup;
