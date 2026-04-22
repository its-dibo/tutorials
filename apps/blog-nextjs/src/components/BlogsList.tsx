import { IBlog } from "#types/blog";
import "./BlogsList.css";
import { Card } from "./Card";

export async function BlogsList() {
  let blogs: IBlog[] = [];
  let error: string | null = null;

  try {
    const res = await fetch(`https://jsonplaceholder.org/posts`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    blogs = await res.json();
  } catch (error_) {
    error = error_ instanceof Error ? error_.message : "Failed to load blogs";
    console.error(`Failed to load blogs"`, error_);
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div id="blogs" className="w-4xl m-auto">
      {blogs.map((blog) => (
        <Card
          key={blog.id}
          title={blog.title}
          content={blog.content}
          image={`https://placehold.co/600x200`}
          url={`/${blog.slug}/${blog.id}`}
          className="m-4 align-middle"
        />
      ))}
    </div>
  );
}
