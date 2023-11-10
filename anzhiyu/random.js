var posts=["2023/11/09/hello-world/","2023/11/10/我的第一篇博客文章/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };