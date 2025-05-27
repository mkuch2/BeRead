import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string | null;
  publishedDate: string;
}

interface PostFormValues {
  book_title: string;
  pages: string;
  content: string;
  quote: string;
}

export default function AddPost() {
  const { currentUser } = useAuthContext() as AuthContextType;
  const [posts, setPosts] = useState<PostFormValues[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

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

  const form = useForm<PostFormValues>({
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

  async function onSubmit(data: PostFormValues) {
    // to database
    // for now, just local
    console.log("Submitted post:", data);

    console.log(username);

    try {
      await axios.post("/api/post", {
        user_id: uid,
        book_title: data.book_title,
        pages: data.pages,
        content: data.content,
        quote: data.quote,
        author: selectedBook?.authors || [],
        username: username,
      });

      setPosts((prev) => [...prev, data]);
      setSelectedBook(null);

      form.reset();
    } catch (e) {
      console.log("Error creating post: ", e);

      form.setError("root", {
        type: "server",
        message: "Could not upload post, please try again.",
      });
    }
  }

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

              <Button type="submit" disabled={!isValid}>
                Submit
              </Button>
              <Button type="button" onClick={() => setSelectedBook(null)}>
                Change book
              </Button>
            </form>
          </Form>
        </>
      )}

      {/* Render new posts immediately below the form */}
      <div className="mt-8 space-y-6">
        {posts.map((p, idx) => (
          <Post
            key={idx}
            title={p.book_title}
            content={p.content}
            quote={p.quote}
          />
        ))}
      </div>
    </>
  );
}
