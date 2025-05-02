/**
 * Main JS file for portfolio site
 * Initializes all necessary functions
 */

document.addEventListener('DOMContentLoaded', function () {
  // Initialize all modules
  Navigation.init();
  ScrollSpy.init();
  TypingEffect.init();
  Projects.init();
  Blog.fetchPosts();
});