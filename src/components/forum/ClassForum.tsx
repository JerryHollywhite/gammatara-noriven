"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Image as ImageIcon, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ForumPost {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    authorType: string;
    createdAt: string;
    author: {
        name: string;
        image?: string;
        role: string;
    };
    replyCount: number;
}

interface ForumReply {
    id: string;
    content: string;
    imageUrl?: string;
    authorType: string;
    createdAt: string;
    author: {
        name: string;
        image?: string;
        role: string;
    };
}

export default function ClassForum({ classId, userRole = "STUDENT" }: { classId: string; userRole?: "TEACHER" | "STUDENT" }) {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [replies, setReplies] = useState<{ [key: string]: ForumReply[] }>({});
    const [loadingReplies, setLoadingReplies] = useState<{ [key: string]: boolean }>({});

    // New post form (teachers only)
    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState<File | null>(null);
    const [newPostImagePreview, setNewPostImagePreview] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Reply forms - one per post
    const [replyContents, setReplyContents] = useState<{ [key: string]: string }>({});
    const [replyImages, setReplyImages] = useState<{ [key: string]: File | null }>({});
    const [replyImagePreviews, setReplyImagePreviews] = useState<{ [key: string]: string }>({});
    const [submittingReplies, setSubmittingReplies] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchPosts();
    }, [classId]);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`/api/forum/posts?classId=${classId}`);
            const data = await res.json();
            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReplies = async (postId: string) => {
        setLoadingReplies(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await fetch(`/api/forum/posts/${postId}/replies`);
            const data = await res.json();
            if (data.success) {
                setReplies(prev => ({ ...prev, [postId]: data.replies }));
            }
        } catch (error) {
            console.error("Error fetching replies:", error);
        } finally {
            setLoadingReplies(prev => ({ ...prev, [postId]: false }));
        }
    };

    const togglePost = (postId: string) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
            if (!replies[postId]) {
                fetchReplies(postId);
            }
        }
    };

    const handleImageSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "post" | "reply",
        postId?: string
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1048576) {
            alert("Image must be less than 1MB");
            return;
        }

        if (type === "post") {
            setNewPostImage(file);
            setNewPostImagePreview(URL.createObjectURL(file));
        } else if (postId) {
            setReplyImages(prev => ({ ...prev, [postId]: file }));
            setReplyImagePreviews(prev => ({ ...prev, [postId]: URL.createObjectURL(file) }));
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload/forum-image", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                return data.url;
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
        return null;
    };

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) return;

        setSubmitting(true);
        try {
            let imageUrl = null;
            if (newPostImage) {
                imageUrl = await uploadImage(newPostImage);
            }

            const payload = {
                classId,
                title: newPostTitle,
                content: newPostContent,
                imageUrl,
            };

            const res = await fetch("/api/forum/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(`Error creating post: ${data.error || 'Unknown error'}`);
                return;
            }

            if (data.success) {
                setNewPostTitle("");
                setNewPostContent("");
                setNewPostImage(null);
                setNewPostImagePreview("");
                fetchPosts();
            }
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddReply = async (postId: string) => {
        const content = replyContents[postId];
        if (!content?.trim()) return;

        setSubmittingReplies(prev => ({ ...prev, [postId]: true }));
        try {
            let imageUrl = null;
            const image = replyImages[postId];
            if (image) {
                imageUrl = await uploadImage(image);
            }

            const res = await fetch(`/api/forum/posts/${postId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    imageUrl,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setReplyContents(prev => ({ ...prev, [postId]: "" }));
                setReplyImages(prev => ({ ...prev, [postId]: null }));
                setReplyImagePreviews(prev => ({ ...prev, [postId]: "" }));
                fetchReplies(postId);
                setPosts(prev => prev.map(p =>
                    p.id === postId
                        ? { ...p, replyCount: p.replyCount + 1 }
                        : p
                ));
            }
        } catch (error) {
            console.error("Error adding reply:", error);
        } finally {
            setSubmittingReplies(prev => ({ ...prev, [postId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Teacher-only: Create Post Form */}
            {userRole === "TEACHER" && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Start a Discussion
                    </h3>

                    <input
                        type="text"
                        placeholder="Post title..."
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                        disabled={submitting}
                    />

                    <textarea
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                        rows={4}
                        disabled={submitting}
                    />

                    {newPostImagePreview && (
                        <div className="relative mt-3 inline-block">
                            <img
                                src={newPostImagePreview}
                                alt="Preview"
                                className="max-h-40 rounded-lg border border-slate-200"
                            />
                            <button
                                onClick={() => {
                                    setNewPostImage(null);
                                    setNewPostImagePreview("");
                                }}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                                disabled={submitting}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageSelect(e, "post")}
                                className="hidden"
                                disabled={submitting}
                            />
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-sm">
                                <ImageIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">Add Image</span>
                            </div>
                        </label>

                        <button
                            onClick={handleCreatePost}
                            disabled={
                                !newPostTitle.trim() ||
                                !newPostContent.trim() ||
                                submitting
                            }
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Post
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Posts List - Full Width for Students */}
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500 font-medium">
                            {userRole === "TEACHER" ? "No posts yet. Start the first discussion!" : "No posts yet from your teacher."}
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                        >
                            {/* Post Header - Always Visible */}
                            <div
                                className="p-4 md:p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => togglePost(post.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <img
                                        src={post.author.image || "/default-avatar.png"}
                                        alt={post.author.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="font-bold text-slate-800">
                                                {post.author.name}
                                            </span>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${post.author.role === "TEACHER"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {post.author.role}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-xl text-slate-800 mb-2">
                                            {post.title}
                                        </h4>
                                        <p className="text-slate-600 mb-3">{post.content}</p>
                                        {post.imageUrl && (
                                            <img
                                                src={post.imageUrl}
                                                alt="Post attachment"
                                                className="mt-3 rounded-lg max-h-64 object-cover border border-slate-200"
                                            />
                                        )}
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
                                                </span>
                                            </div>
                                            <button className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                                {expandedPostId === post.id ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4" />
                                                        Hide discussion
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4" />
                                                        View discussion
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Replies Section - Expandable */}
                            <AnimatePresence>
                                {expandedPostId === post.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-slate-200 bg-slate-50"
                                    >
                                        <div className="p-4 md:p-6 space-y-4">
                                            {/* Replies List */}
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                                    <MessageSquare className="w-5 h-5" />
                                                    Replies ({loadingReplies[post.id] ? "..." : replies[post.id]?.length || 0})
                                                </h4>

                                                {loadingReplies[post.id] ? (
                                                    <div className="flex justify-center py-8">
                                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                                    </div>
                                                ) : replies[post.id]?.length === 0 ? (
                                                    <p className="text-slate-400 text-center py-6 text-sm">
                                                        No replies yet. Be the first to respond!
                                                    </p>
                                                ) : (
                                                    replies[post.id]?.map((reply) => (
                                                        <div
                                                            key={reply.id}
                                                            className="flex gap-3 md:gap-4 p-4 bg-white border border-slate-200 rounded-lg"
                                                        >
                                                            <img
                                                                src={reply.author.image || "/default-avatar.png"}
                                                                alt={reply.author.name}
                                                                className="w-10 h-10 rounded-full flex-shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <span className="font-bold text-sm text-slate-800">
                                                                        {reply.author.name}
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${reply.author.role === "TEACHER"
                                                                        ? "bg-purple-100 text-purple-700"
                                                                        : "bg-blue-100 text-blue-700"
                                                                        }`}>
                                                                        {reply.author.role}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400">
                                                                        {new Date(reply.createdAt).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <p className="text-slate-700 whitespace-pre-wrap">
                                                                    {reply.content}
                                                                </p>
                                                                {reply.imageUrl && (
                                                                    <img
                                                                        src={reply.imageUrl}
                                                                        alt="Reply attachment"
                                                                        className="mt-3 rounded-lg max-w-full"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Reply Form - Larger */}
                                            <div className="bg-white border border-slate-200 rounded-lg p-4">
                                                <textarea
                                                    placeholder="Write a reply..."
                                                    value={replyContents[post.id] || ""}
                                                    onChange={(e) => setReplyContents(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                                                    rows={4}
                                                    disabled={submittingReplies[post.id]}
                                                />

                                                {replyImagePreviews[post.id] && (
                                                    <div className="relative mt-3 inline-block">
                                                        <img
                                                            src={replyImagePreviews[post.id]}
                                                            alt="Preview"
                                                            className="max-h-32 rounded-lg"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                setReplyImages(prev => ({ ...prev, [post.id]: null }));
                                                                setReplyImagePreviews(prev => ({ ...prev, [post.id]: "" }));
                                                            }}
                                                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                            disabled={submittingReplies[post.id]}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mt-3">
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageSelect(e, "reply", post.id)}
                                                            className="hidden"
                                                            disabled={submittingReplies[post.id]}
                                                        />
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors">
                                                            <ImageIcon className="w-4 h-4" />
                                                            <span className="text-sm font-medium">Add Image</span>
                                                        </div>
                                                    </label>

                                                    <button
                                                        onClick={() => handleAddReply(post.id)}
                                                        disabled={!replyContents[post.id]?.trim() || submittingReplies[post.id]}
                                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                                    >
                                                        {submittingReplies[post.id] ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="w-4 h-4" />
                                                                Reply
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
