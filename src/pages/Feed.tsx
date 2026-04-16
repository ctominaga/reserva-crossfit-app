import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { PostCard } from "../components/features/PostCard";
import { StoryBar } from "../components/features/StoryBar";
import { NewPostSheet } from "../components/features/NewPostSheet";
import { mockPosts, mockStories, type Post } from "../data/mock";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";

type FilterType = "all" | "achievement" | "text" | "announcement";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useLocalStorage<Post[]>("reserva-feed-posts", mockPosts);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showNewPost, setShowNewPost] = useState(false);

  const filtered = filter === "all" ? posts : posts.filter((p) => p.type === filter);

  const handleLike = useCallback(
    (id: string) => {
      setPosts((prev: Post[]) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, likedByUser: !p.likedByUser, likes: p.likes + (p.likedByUser ? -1 : 1) }
            : p
        )
      );
    },
    [setPosts]
  );

  const handleComment = useCallback(
    (id: string, text: string) => {
      setPosts((prev: Post[]) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: `c-${Date.now()}`,
                    authorName: user?.name ?? "Você",
                    authorInitial: user?.avatar ?? "?",
                    authorColor: "#22C55E",
                    content: text,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : p
        )
      );
    },
    [setPosts, user]
  );

  const handleNewPost = useCallback(
    (content: string, type: "text" | "achievement" | "image") => {
      const isAdmin = user?.role === "admin";
      const newPost: Post = {
        id: `p-${Date.now()}`,
        authorName: user?.name ?? "Você",
        authorInitial: user?.avatar ?? "?",
        authorColor: isAdmin ? "#22C55E" : "#10B981",
        authorRole: isAdmin ? "admin" : "athlete",
        content,
        type: isAdmin ? "announcement" : type,
        likes: 0,
        comments: [],
        likedByUser: false,
        createdAt: new Date().toISOString(),
        tags: [],
      };
      setPosts((prev: Post[]) => [newPost, ...prev]);
    },
    [setPosts, user]
  );

  const filters: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "all" },
    { label: "Conquistas", value: "achievement" },
    { label: "Treinos", value: "text" },
    { label: "Anúncios", value: "announcement" },
  ];

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      {/* Stories */}
      <StoryBar stories={mockStories} />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`chip ${filter === f.value ? "chip-active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted">
          <p className="font-display font-bold text-lg">Nenhum post encontrado</p>
          <p className="text-sm mt-1">Tente outro filtro ou crie o primeiro post!</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowNewPost(true)}
        className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full bg-primary text-black shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary-dark transition"
      >
        <Plus className="w-6 h-6" strokeWidth={3} />
      </button>

      <NewPostSheet
        open={showNewPost}
        onClose={() => setShowNewPost(false)}
        onPublish={handleNewPost}
      />
    </div>
  );
}
