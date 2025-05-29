import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/frontend/components/ui/form";
import { useForm } from "react-hook-form";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";

interface CommentFormValues {
  content: string;
}

interface CommentFormProps {
  post_id: string;
}

export default function CommentForm({ post_id }: CommentFormProps) {
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<CommentFormValues>({
    defaultValues: {
      content: "",
    },
    mode: "onSubmit",
  });

  const { currentUser, getToken } = useAuthContext() as AuthContextType;

  //Get user's (Firebase) uid
  useEffect(() => {
    if (currentUser) {
      setUid(currentUser.uid);
    }
  }, [currentUser]);

  //Get username after successfully getting uid
  useEffect(() => {
    async function getUsername() {
      if (!uid) return;

      try {
        const user = await axios.get(
          `/api/user?query=${encodeURIComponent(uid as string)}`
        );

        setUsername(user.data.username);
      } catch (e) {
        console.log("Could not get username: ", e);
      }
    }

    getUsername();
  }, [uid]);

  async function onSubmit(data: CommentFormValues) {
    console.log("Submitted comment:", data);

    setLoading(true);
    const token = await getToken();

    try {
      const createdComment = await axios.post(
        "/api/comment",
        {
          username: username,
          content: data.content,
          replies: [],
          user_id: uid,
          post_id: post_id,
        },
        {
          headers: {
            auth: token,
          },
        }
      );

      console.log(createdComment);

      form.reset();
    } catch (e) {
      console.log("Error creating post: ", e);

      form.setError("root", {
        type: "server",
        message: "Could not upload comment, please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          rules={{ required: "At least one character is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          Post
        </Button>
      </form>
    </Form>
  );
}
