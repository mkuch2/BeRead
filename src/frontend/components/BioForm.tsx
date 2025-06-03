import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/frontend/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { Button } from "@/frontend/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";

const BioSchema = z.object({
  content: z
    .string()
    .trim()
    .nonempty({ message: "Bio can not be empty" })
    .max(160, { message: "Bio can not be more than 160 characters" }),
});

type FormFields = z.infer<typeof BioSchema>;

interface BioFormProps {
  oldBio: string;
  onBioUpdate?: (updatedBio: string) => void;
  onCancel?: () => void;
}

export default function BioForm({
  oldBio = "",
  onBioUpdate,
  onCancel,
}: BioFormProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<FormFields>({
    resolver: zodResolver(BioSchema),
    defaultValues: {
      content: oldBio,
    },
    mode: "onSubmit",
  });

  const { currentUser, getToken } = useAuthContext() as AuthContextType;

  async function onSubmit(data: FormFields) {
    setLoading(true);

    try {
      const token = await getToken();
      const uid = currentUser?.uid;

      if (!token) {
        console.log("Error getting user token in handleSetBio");
        return;
      }
      if (!uid) {
        console.log("Error getting userid in handleSetBio");
        return;
      }

      const response = await axios.put(
        `/api/user/${uid}/bio`,
        {
          bio: data.content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedBio = response.data.bio;

      if (onBioUpdate) {
        onBioUpdate(updatedBio);
      }
    } catch (e) {
      console.log("Error updating bio, ", e);
      form.setError("root", {
        type: "server",
        message: "Could not update bio, please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            Submit
          </Button>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        </form>
      </Form>
    </>
  );
}
