const Post = require('../models/Post');
const User = require('../models/User');

exports.getPosts = async (req, res) => {
  const { category, category_ne, page = 1, limit = 5 } = req.query;
  try {
    const query = { author: req.user.id };
    if (category) query.category = category;
    if (category_ne) query.category = { $ne: category_ne };
    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.json({ data: posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { title, content, category, grade } = req.body;
  try {
    const attachments = req.files?.map(file => file.path) || [];
    const post = new Post({
      title,
      content,
      category,
      grade,
      author: req.user.id,
      attachments,
    });
    await post.save();

    const user = await User.findById(req.user.id);
    user.activity.push({
      date: new Date().toISOString().split('T')[0],
      count: 1,
      details: [`Created a post: ${title || 'Untitled'}`],
    });
    await user.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();

      const user = await User.findById(req.user.id);
      user.activity.push({
        date: new Date().toISOString().split('T')[0],
        count: 1,
        details: [`Liked a post: ${post.title || 'Untitled'}`],
      });
      await user.save();
    }
    res.json({ message: 'Liked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.shares = (post.shares || 0) + 1;
    await post.save();

    const user = await User.findById(req.user.id);
    user.activity.push({
      date: new Date().toISOString().split('T')[0],
      count: 1,
      details: [`Shared a post: ${post.title || 'Untitled'}`],
    });
    await user.save();

    res.json({ message: 'Shared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({
      user: req.user.id,
      content,
      createdAt: new Date(),
    });
    await post.save();

    const user = await User.findById(req.user.id);
    user.activity.push({
      date: new Date().toISOString().split('T')[0],
      count: 1,
      details: [`Commented on a post: ${post.title || 'Untitled'}`],
    });
    await user.save();

    res.json({ message: 'Comment added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};