const user = require("../Models/user");
const story = require("../Models/story");
const authMiddleware = require('../Middlewares/authMiddleware')
const express = require("express");
const router = express.Router();

router.post("/create", async(req,res)=>{
    try {
        const { userId, slides } = req.body;
        if (!userId|| !slides) {
            return res.status(400).json({ message: "bad request" });
        }
        const Story = new story({ slides, userId });
        await Story.save();
        res.status(201).json({ success: true, story });
      } catch (err) {
        console.log("Something went wrong", err);
      }
})

router.post('/getstory', async (req, res) => {
    try {
      const { category } = req.body;
      let query = {};
  
      if (category) {
        query = { 'slides.category': category };
      }
      
      const stories = await story.find(query);
  
      res.status(200).json(stories);
    } catch (err) {
      console.error('Error fetching stories:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get("/isBookmarked/:slideId" , authMiddleware, async (req, res) => {
    try {
      const { slideId } = req.params;
      const userId = req.user;
  
      if (!userId || !slideId) {
        return res.status(400).json({ message: "bad request" });
      }
  
      const userDetails = await user.findById(userId);
      if (!userDetails) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const isBookmarked = userDetails.bookmarks.includes(slideId);
      res.status(200).json({ isBookmarked });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/addBookmark", authMiddleware, async (req, res) => {
    try {
        const { slideId } = req.body;
        const userId = req.user;

        if (!userId || !slideId) {
            return res.status(400).json({ message: "Bad request" });
        }

        const userDetails = await user.findById(userId);
        if (!userDetails) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!userDetails.bookmarks.includes(slideId)) {
            userDetails.bookmarks.push(slideId);
            await userDetails.save();

            const storyDetails = await story.findOne({ "slides._id": slideId });
            if (storyDetails) {
                const slide = storyDetails.slides.find(s => s._id.toString() === slideId);
                if (slide) {
                    if (!slide.bookmarks.includes(userId)) {
                        slide.bookmarks.push(userId);
                        await storyDetails.save();
                    }
                }
            }
        }

        res.status(200).json({ message: "Bookmark added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/removeBookmark", authMiddleware, async (req, res) => {
    try {
        const { slideId } = req.body;
        const userId = req.user;

        if (!userId || !slideId) {
            return res.status(400).json({ message: "Bad request" });
        }

        const userDetails = await user.findById(userId);
        if (!userDetails) {
            return res.status(404).json({ error: "User not found" });
        }

        userDetails.bookmarks = userDetails.bookmarks.filter(bookmark => bookmark.toString() !== slideId);
        await userDetails.save();

        const storyDetails = await story.findOne({ "slides._id": slideId });
        if (storyDetails) {
          const slide = storyDetails.slides.find(s => s._id.toString() === slideId);
            if (slide) {
                slide.bookmarks = slide.bookmarks.filter(b => b.toString() !== userId);
                await storyDetails.save();
            }
        }

        res.status(200).json({ message: "Bookmark removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


  router.post("/like", authMiddleware, async (req, res) => {
    try {
        const { slideId } = req.body;
        const userId = req.user;

        if (!userId || !slideId) {
            return res.status(400).json({ message: "Bad request" });
        }

        const Story = await story.findOne({ "slides._id": slideId });
        if (!Story) {
            return res.status(404).json({ error: "Slide not found" });
        }

        const slide = Story.slides.find(s => s._id.toString() === slideId);
        if (!slide) {
            return res.status(404).json({ error: "Slide not found" });
        }

        slide.likes = slide.likes || [];

        const hasLiked = slide.likes.includes(userId);

        if (hasLiked) {
            slide.likes = slide.likes.filter(like => like.toString() !== userId);
        } else {
            slide.likes.push(userId);
        }

        Story.totalLikes = Story.slides.reduce((total, s) => total + (s.likes ? s.likes.length : 0), 0);

        await Story.save();

        const User = await user.findById(userId);
        if (!User.likes.includes(slideId)) {
            User.likes.push(slideId);
            await User.save();
        }

        res.status(200).json({
            message: hasLiked ? "Slide unliked successfully" : "Slide liked successfully",
            totalLikes: slide.likes.length,
            likeStatus: !hasLiked,
            slides:Story.slides
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/likeData/:slideId" , authMiddleware, async (req, res) => {
  try {
    const { slideId } = req.params;
    const userId = req.user;

    if (!userId || !slideId) {
      return res.status(400).json({ message: "bad request" });
    }

    const userDetails = await user.findById(userId);
    if (!userDetails) {
      return res.status(404).json({ error: "User not found" });
    }

    const isLiked = userDetails.likes.includes(slideId);
    res.status(200).json({ isLiked });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/viewstory/:slideId", async (req, res) => {
  try {
    const { slideId } = req.params;

    if (!slideId) {
      return res.status(400).json({ message: "Bad request" });
    }

    const storyDetails = await story.findOne({ "slides._id": slideId });

    if (!storyDetails) {
      return res.status(404).json({ error: "Story not found" });
    }

    const slideData = storyDetails.slides;

    res.status(200).json({ slideData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get('/getUserStories', async (req, res) => {
  const { userId } = req.query;

  try {
      const userStories = await story.find({ userId });

      if (!userStories) {
          return res.status(404).json({ message: "User stories not found" });
      }

      res.status(200).json(userStories);
  } catch (error) {
      console.error("Error fetching user stories:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { userId, slides } = req.body;
  
  try {
      const updatedStory = await story.findByIdAndUpdate(id, { userId, slides }, { new: true });
      if (!updatedStory) {
          return res.status(404).json({ message: "Story not found" });
      }
      res.status(200).json({updatedStory});
  } catch (error) {
      console.error('Error updating story:', error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get('/bookmarks', async (req,res)=>{
    try {
      const {userId}  = req.query;
      const userDetails = await user.findById(userId);
  
      if (!userDetails) {
        throw new Error('User not found');
      }
  
      const bookmarkedSlideIds = userDetails.bookmarks;
  
      const groupedSlides = await story.aggregate([
        {
          $unwind: '$slides',
        },
        {
          $match: {
            'slides._id': { $in: bookmarkedSlideIds },
          },
        },
      ]);
  
      const uniqueStoryIds = groupedSlides.map(group => group._id);
  
      const bookmarkedStories = await story.find({ _id: { $in: uniqueStoryIds } });
  
      res.status(200).json(bookmarkedStories);

    } catch (error) {
      console.error('Error fetching bookmark stories:', error);
    }
})



  

module.exports = router;