import { useEffect, useState } from "react";
import { fetchPosts } from "./api/posts";
import Navbar from "./components/Navbar";
import CreatePost from "./components/CreatePost";
import PostList from "./components/PostList";
import type { Post } from "./types/post";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Fetch posts whenever the active search changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPosts(activeSearch)
      .then(setPosts)
      .catch(() => setError("Could not load posts. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [activeSearch]);

  function handleSearchSubmit() {
    const trimmed = search.trim();
    setActiveSearch(trimmed || undefined);
  }

  function handleSearchClear() {
    setSearch("");
    setActiveSearch(undefined);
  }

  function handleUsernameClick(username: string) {
    setSearch(username);
    setActiveSearch(username);
  }

  function handlePostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  const isSearching = !!activeSearch;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onSearchClear={handleSearchClear}
        theme={theme}
        onThemeToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Search context banner */}
        {isSearching && (
          <div className="alert alert-info">
            <span>
              Showing posts from <strong>{activeSearch}</strong>
            </span>
            <button className="btn btn-sm btn-ghost" onClick={handleSearchClear}>
              Clear
            </button>
          </div>
        )}

        {/* Create post — hidden when filtering by user */}
        {!isSearching && <CreatePost onPostCreated={handlePostCreated} />}

        <PostList
          posts={posts}
          loading={loading}
          error={error}
          onUsernameClick={handleUsernameClick}
        />
      </main>
    </div>
  );
}
