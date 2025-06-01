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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface CommentFormProps {
  post_id: string;
  onCommentAdd?: () => void;
}

const CommentSchema = z.object({
  content: z
    .string()
    .trim()
    .nonempty({ message: "Comments can not be empty" })
    .max(350, {
      message: "Comment can not be longer than 350 characters!",
    }),
});

type FormFields = z.infer<typeof CommentSchema>;

export default function CommentForm({
  post_id,
  onCommentAdd,
}: CommentFormProps) {
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<FormFields>({
    resolver: zodResolver(CommentSchema),
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

  async function onSubmit(data: FormFields) {
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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(createdComment);

      form.reset();

      if (onCommentAdd) {
        onCommentAdd();
      }
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
