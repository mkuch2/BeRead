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
import { logger } from "@/frontend/lib/logger";

interface ReplyFormProps {
  post_id: string;
  parent_comment_id: string;
  onReplyAdd?: () => void;
  onCancel?: () => void;
}

const ReplySchema = z.object({
  content: z
    .string()
    .trim()
    .nonempty({ message: "Reply can not be empty" })
    .max(350, {
      message: "Reply can not be longer than 350 characters!",
    }),
});

type FormFields = z.infer<typeof ReplySchema>;

export default function ReplyForm({
  post_id,
  parent_comment_id,
  onReplyAdd,
  onCancel,
}: ReplyFormProps) {
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<FormFields>({
    resolver: zodResolver(ReplySchema),
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
        logger.log("Could not get username: ", e);
      }
    }

    getUsername();
  }, [uid]);

  async function onSubmit(data: FormFields) {
    logger.log("Submitted reply:", data);

    setLoading(true);
    const token = await getToken();

    try {
      const createdReply = await axios.post(
        "/api/comment",
        {
          username: username,
          content: data.content,
          user_id: uid,
          post_id: post_id,
          parent_comment_id: parent_comment_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      logger.log(createdReply);

      form.reset();

      if (onReplyAdd) {
        onReplyAdd();
      }
    } catch (e) {
      logger.log("Error creating post: ", e);

      form.setError("root", {
        type: "server",
        message: "Could not upload reply, please try again.",
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
              <FormLabel>Reply</FormLabel>
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
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    </Form>
  );
}
