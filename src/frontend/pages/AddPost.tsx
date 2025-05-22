import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/frontend/components/ui/form";
import { Post } from "@/frontend/components/Post";

interface PostFormValues {
  title: string;
  content: string;
  quote: string;
}

export default function AddPost() {
  const form = useForm<PostFormValues>({
    defaultValues: { title: "", content: "",  quote: "" },
    mode: "onChange",
  });
  const { isValid } = form.formState;
  const [posts, setPosts] = useState<PostFormValues[]>([]);

  function onSubmit(data: PostFormValues) {
    // to database
    // for now, just local
    console.log("Submitted post:", data);
    setPosts((prev) => [...prev, data]);
    form.reset();
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: "Book title is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Book Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            // rules={{ required: "Content is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quote"
            rules={{ required: "Daily Quote is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Quote</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={!isValid}>
            Submit
          </Button>
        </form>
      </Form>

      {/* Render new posts immediately below the form */}
      <div className="mt-8 space-y-6">
        {posts.map((p, idx) => (
          <Post
            key={idx}
            title={p.title}
            content={p.content}
            quote={p.quote}
          />
        ))}
      </div>
    </div>
  );
}
