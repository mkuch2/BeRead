import { useNavigate, Link } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import auth from "../../firebase";
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

type FormFields = {
  email: string;
  password: string;
};

function Login() {
  const form = useForm<FormFields>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormFields> = async (data: {
    email: string;
    password: string;
  }) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);

      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e.code, e.message);
        //Invalid credentials
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
        } else if (e.code == "auth/missing-password") {
          form.setError("password", {
            type: "client",
            message: "Please enter a password",
          });
        }
      } else {
        form.setError("root", {
          type: "client",
          message: "Unknown error occured.",
        });
      }
    }
  };

  return (
    <>
      <p>Login page</p>
      <Link to="/">Home Page</Link>
      <Link to="/signup">Signup Page</Link>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  <Input placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Log in</Button>
        </form>
      </Form>
      {form.formState.errors.root && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {form.formState.errors.root.message}
        </div>
      )}
    </>
  );
}

export default Login;
