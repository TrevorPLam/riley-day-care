"use client";

import { use } from 'react';
import { createResource, AsyncBoundary } from '@/lib/react19';

// Example data fetching with React 19 use API
interface BlogPost {
  id: number;
  title: string;
  content: string;
  publishedAt: string;
}

// Server function to fetch data (would typically be in API route)
async function fetchBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/blog-posts');
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  return response.json();
}

// Component that uses the use API for data fetching
function BlogPostsList({ postsPromise }: { postsPromise: Promise<BlogPost[]> }) {
  const posts = use(postsPromise);
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post.id} className="border-b border-slate-200 pb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {post.title}
          </h3>
          <p className="text-sm text-slate-600 mb-2">
            Published: {new Date(post.publishedAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {post.content}
          </p>
        </article>
      ))}
    </div>
  );
}

// Wrapper component that provides the data with Suspense
export default function BlogPostsSection() {
  const postsResource = createResource(fetchBlogPosts());
  
  return (
    <AsyncBoundary
      fallback={<div className="text-center py-8">Loading blog posts...</div>}
      error={<div className="text-center py-8 text-red-600">Failed to load blog posts</div>}
    >
      <BlogPostsList postsPromise={postsResource.read()} />
    </AsyncBoundary>
  );
}
