33

import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
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
import {
  useAuthContext,
  type AuthContextType,
} from "../../hooks/useAuthContext";
import BookSearch from "../../components/BookSearch";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import NavBar from "../../components/NavBar";

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
  likes: number;
  dislikes: number;
  author: string[];
  user_id: string;
  id: string;
  thumbnail?: string | null;
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

// async function fetchThumbnail(title: string): Promise<string | null> {
//   try {
//     if (!title.trim()) return null;
//     const query = encodeURIComponent(`intitle:${title}`);
//     const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
//     const response = await fetch(url);
//     const data = await response.json();
//     if (
//       data &&
//       Array.isArray(data.items) &&
//       data.items.length > 0 &&
//       data.items[0].volumeInfo.imageLinks?.thumbnail
//     ) {
//       return data.items[0].volumeInfo.imageLinks.thumbnail as string;
//     } else {
//       return null;
//     }
//   } catch (err) {
//     console.error("fetchThumbnail error:", err);
//     return null;
//   }
// };

export default function AddPost() {
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState<string | null>(null);

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

    if (book.thumbnail) {
      let thumbUrl = book.thumbnail;
      if (thumbUrl.startsWith("http://")) {
        thumbUrl = thumbUrl.replace(/^http:\/\//, "https://");
      }
      setThumbnail(thumbUrl);
    } else {
      setThumbnail(null);
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
    const token = await getToken();
    setLoading(true);

    console.log("selectedBook:", selectedBook);
    console.log("thumbnail:", thumbnail);

    //Send post to database
    try {
      const payload: Record<string, any> = {
        user_id: uid,
        book_title: data.book_title,
        pages: data.pages,
        content: data.content,
        quote: data.quote,
        author: selectedBook?.authors || [],
        username: username,
      };
      if (thumbnail) {
        payload.thumbnail = thumbnail;
      }

      const response = await axios.post("/api/post", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("POST /api/post response:", response.data);

      setSelectedBook(null);
      setThumbnail(null);
      form.reset();
      navigate("/display-post", { state: { post: response.data } });

    } catch (error: any) {
      console.log("Error creating post: ", error);

      if (error.response && error.response.data) {
        console.error("Validation errors from server:", error.response.data);
      }
  
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
      <NavBar />
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
  <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto mt-8 space-y-6 p-6 bg-black text-white rounded-md">
    <div className="grid md:grid-cols-3 gap-6">
      {thumbnail && (
        <div className="md:col-span-1 flex items-start justify-center">
          <img
            src={thumbnail}
            alt={selectedBook?.title + ' cover'}
            className="w-36 h-auto rounded-lg shadow-lg"
          />
        </div>
      )}
      <div className="md:col-span-2 space-y-4">
        <FormField
          control={form.control}
          name="book_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Book Title</FormLabel>
              <FormControl>
                <Input className="bg-zinc-800 text-white" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quote"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Quote or description</FormLabel>
              <FormControl>
                <Textarea className="bg-zinc-800 text-white" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Content</FormLabel>
              <FormControl>
                <Textarea className="bg-zinc-800 text-white" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pages"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Pages Read</FormLabel>
              <FormControl>
                <Input className="bg-zinc-800 text-white" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 mt-4">
          <Button type="submit" disabled={loading || !isValid}>Submit</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSelectedBook(null);
              setThumbnail(null);
            }}
          >
            Change book
          </Button>
        </div>
      </div>
    </div>
  </form>
</Form>

        </>
      )}
    </>
  );
}

