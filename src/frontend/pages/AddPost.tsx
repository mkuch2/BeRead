import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Textarea } from "@/frontend/components/ui/textarea";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/frontend/components/ui/form";
import { Post } from "@/frontend/components/Post";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import BookSearch from "../components/BookSearch";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string | null;
  publishedDate: string;
}

interface Post {
  book_title: string;
  pages: string;
  content: string;
  quote: string;
  username: string;
  published_at: string;
  post_id: string;
}

const PostSchema = z.object({
  content: z
    .string()
    .trim()
    .nonempty({ message: "Post requires at least 1 character" })
    .max(328, { message: "Posts cannot be longer than 328 characters" }),
  book_title: z
    .string()
    .trim()
    .nonempty({ message: "Please enter a book title" })
    .max(255, {
      message: "Titles can not be more than 64 characters long",
    }),
  quote: z
    .string()
    .trim()
    .max(128, { message: "Quotes can not be longer than 128 characters" }),
  pages: z
    .string()
    .trim()
    .max(10, { message: "Pages can not be longer than 10 characters long" }),
});

type FormFields = z.infer<typeof PostSchema>;

export default function AddPost() {
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

  const form = useForm<FormFields>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      book_title: "",
      pages: "",
      content: "",
      quote: "",
    },
    mode: "onChange",
  });

  const { isValid } = form.formState;

  const handleBookSelect = (book: Book): void => {
    setSelectedBook(book);

    form.setValue("book_title", book.title);
  };

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    console.log("Submitted post:", data);

    console.log(username);

    const token = await getToken();

    setLoading(true);

    //Send post to database
    try {
      const createdPost = await axios.post(
        "/api/post",
        {
          user_id: uid,
          book_title: data.book_title,
          pages: data.pages,
          content: data.content,
          quote: data.quote,
          author: selectedBook?.authors || [],
          username: username,
        },
        {
          headers: {
            auth: token,
          },
        }
      );

      setPosts((prev) => [
        ...prev,
        {
          book_title: createdPost.data.book_title,
          pages: createdPost.data.pages,
          quote: createdPost.data.quote,
          content: createdPost.data.content,
          username: createdPost.data.username,
          published_at: createdPost.data.published_at,
          post_id: createdPost.data.id,
        },
      ]);
      setSelectedBook(null);

      form.reset();
    } catch (e) {
      console.log("Error creating post: ", e);

      form.setError("root", {
        type: "server",
        message: "Could not upload post, please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!selectedBook ? (
        <BookSearch onSelectBook={handleBookSelect} />
      ) : (
        <>
          {form.formState.errors.root && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {form.formState.errors.root.message}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="book_title"
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quote"
                //rules={{ required: "Daily Quote is required" }}
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

              <FormField
                control={form.control}
                name="pages"
                //rules={{ required: "Daily Quote is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pages read</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading || !isValid}
                className="hover:cursor-pointer"
              >
                Submit
              </Button>
              <Button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="hover: cursor-pointer"
              >
                Change book
              </Button>
            </form>
          </Form>
        </>
      )}

      {/* Render new posts immediately below the form */}
      <div className="mt-8 space-y-6">
        {posts.map((p) => (
          <Post
            key={p.post_id}
            username={p.username}
            published_at={p.published_at}
            title={p.book_title}
            content={p.content}
            quote={p.quote}
          />
        ))}
      </div>
    </>
  );
}
