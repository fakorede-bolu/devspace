const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post model
const Post = require("../../models/Posts");

// Profile model
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validator/posts");

// requireAuth passport
const requireAuth = passport.authenticate("jwt", { session: false });

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) =>
  res.json({
    msg: "post Works"
  })
);

// @route   POST api/posts
// @desc    Create post route
// @access  Private
router.post("/", requireAuth, (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }
  const { text, name, avatar } = req.body;
  const newPost = new Post({
    text,
    name,
    avatar,
    user: req.user.id
  });

  newPost.save().then(post => res.json(post));
});

// @route   GET api/posts
// @desc    Get posts route
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No post found" }));
});

// @route   GET api/posts/:id
// @desc    Get post by id route
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res
        .status(404)
        .json({ nopostfound: "Can't find the specified post with that ID" })
    );
});

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete("/:id", requireAuth, (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        // Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notAuthorized: "User not authorized" });
        }

        // Delete
        post.remove().then(() => {
          res.json({ success: true });
        });
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
});

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post("/like/:id", requireAuth, (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id).then(post => {
      if (
        post.likes.filter(like => like.user.toString() === req.user.id).length >
        0
      ) {
        return res
          .status(400)
          .json({ alreadyliked: "User already liked this post" });
      }

      // Add the user id to the likes array
      post.likes.push({ user: req.user.id });

      post.save().then(post => res.json(post));
    });
  });
});

// @route   POST api/posts/unlike/:id
// @desc    unlike post
// @access  Private
router.post("/unlike/:id", requireAuth, (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ alreadyliked: "You have not yet liked this post" });
        }

        // Get the remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);

        // Save the post
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  });
});

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private

router.post("/comment/:id", requireAuth, (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check validation
  if (!isValid) {
    // If any errors, send 400 with errors object
    return res.status(400).json(errors);
  }

  const { text, name, avatar } = req.body;
  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text,
        name,
        avatar,
        user: req.user.id
      };

      // Add to the comment array
      post.comments.unshift(newComment);

      // Save
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: "No post found" }));
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private

router.delete("/comment/:id/:comment_id", requireAuth, (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      // Check if the comment exist
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res
          .status(404)
          .json({ commentnotexist: "Comment does not exist" });
      }

      // Get the remove index
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      // Splice comment from array
      post.comments.splice(removeIndex, 1);

      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: "No post found" }));
});

module.exports = router;
