import { Link } from "react-router";
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

//Validation schema for user
const User = z.object({
  username: z
    .string()
    .trim()
    .min(2, { message: "Please provide a username longer than 2 characters" })
    .max(50, {
      message: "Please provide a username shorter than 50 characters",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only consist of letters, numbers, and underscores",
    }),
  email: z.string().trim().email(),
  password: z
    .string()
    .trim()
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
  const form = useForm<FormFields>({
    resolver: zodResolver(User),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => console.log(data);

  return (
    <>
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>

      <Link to="/">Home Page</Link>
      <Link to="/login">Login Page</Link>
    </>
  );
}

export default Signup;
