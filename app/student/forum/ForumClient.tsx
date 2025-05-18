'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Post {
  id: string;
  content: string;
}

const ForumClient = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    axios.get('/api/posts')
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  }, []);

const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post<Post>('/api/posts', { content: newPost })
        .then(response => {
            setPosts([...posts, response.data]);
            setNewPost('');
        })
        .catch(error => {
            console.error('Error creating post:', error);
        });
};

  return (
    <div>
      <h1>Forum</h1>
      <form onSubmit={handlePostSubmit}>
        <input
          type="text"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Write a new post"
        />
        <button type="submit">Post</button>
      </form>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default ForumClient;
