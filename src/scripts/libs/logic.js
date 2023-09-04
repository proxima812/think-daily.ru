export const getSavedPosts = () => {
  const savedPostsData = localStorage.getItem("saved-posts");
  return savedPostsData ? JSON.parse(savedPostsData) : [];
};

export const setSavedPosts = (posts) => {
  localStorage.setItem("saved-posts", JSON.stringify(posts));
  const event = new CustomEvent("saved-posts-changed", {
    detail: posts.length,
  });
  document.dispatchEvent(event);
};

export const isPostSaved = (postId) => {
  const savedPosts = getSavedPosts();
  return savedPosts.some((post) => post.id === postId);
};

export const savePost = (postId, postTitle, postFormat, postSize) => {
  const savedPosts = getSavedPosts();
  savedPosts.push({
    id: postId,
    title: postTitle,
    format: postFormat,
    size: postSize,
  });
  setSavedPosts(savedPosts);
};

export const removePost = (postId) => {
  const savedPosts = getSavedPosts();
  const index = savedPosts.findIndex((post) => post.id === postId);
  if (index !== -1) {
    savedPosts.splice(index, 1);
    setSavedPosts(savedPosts);
  }
};
