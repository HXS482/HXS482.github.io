var posts=["2025/05/12/hello-world/","2025/05/12/博客搭建/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };