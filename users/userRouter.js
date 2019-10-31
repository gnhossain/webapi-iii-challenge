const express = require('express');

const router = express.Router();

const User = require("./userDb");
const Post = require("../posts/postDb");

router.post('/',validateUser,(req, res) => {
    const user = req.body;

    User.insert(user)
        .then(user => {
            res.status(201).json(user);
        })

        .catch(err => {
            console.log(err);
            res.status(500).json({ error:"Error retrieveng the user"});
        })

});

router.post('/:id/posts', validateUserId,validatePost,(req, res) => {
    const post = req.body;
    Post.insert(post)
        .then(post => {
            res.status(201).json(post);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error:" Error adding the user"})
        })
});

// this only runs if the url has /api/user in it
router.get('/', (req, res) => {

    console.log('doubled', req.doubled);
    User.get()
        .then(users => {
            res.status(200).json(users)
        })
        .catch(error => {
            // log error to server
            console.log(error);
            res.status(500).json({
              message: 'Error retrieving the users',
            });
          });
});

// /api/user/:id

router.get('/:id', (req, res) => {
    User.findById(req.params.id)
      .then(user => {
        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ message: 'Users not found' });
        }
      })
      .catch(error => {
        // log error to server
        console.log(error);
        res.status(500).json({
          message: 'Error retrieving the user',
        });
      });
  });

// add an endpoint that returns all the messages for a user
// this is a sub-route or sub-resource
router.get('/:id/post', (req, res) => {
    User.findUserPosts(req.params.id)
      .then(post => {
        res.status(200).json(post);
      })
      .catch(error => {
        // log error to server
        console.log(error);
        res.status(500).json({
          message: 'Error getting the messages for the user',
        });
      });
  });

  router.delete('/:id', (req, res) => {
    User.remove(req.params.id)
      .then(count => {
        if (count > 0) {
          res.status(200).json({ message: 'The user has been nuked' });
        } else {
          res.status(404).json({ message: 'The user could not be found' });
        }
      })
      .catch(error => {
        // log error to server
        console.log(error);
        res.status(500).json({
          message: 'Error removing the user',
        });
      });
  });
  router.put('/:id', (req, res) => {
    User.update(req.params.id, req.body)
      .then(user => {
        if (user) {
          res.status(200).json(user);
        } else {
          res.status(404).json({ message: 'The user could not be found' });
        }
      })
      .catch(error => {
        // log error to server
        console.log(error);
        res.status(500).json({
          message: 'Error updating the user',
        });
      });
  });

//custom middleware

function validateUserId(req, res, next) {
    const { id } = req.params;
    User.getById(id).then(user => {
      if (user) {
        next();
      } else {
        res.status(404).json({ error: "User with this id does not exist" });
      }
    });
  
};

function validateUser(req, res, next) {

    const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }
  if (typeof name !== "string") {
    return res.status(400).json({ error: "Name must be a string" });
  }
  next();

};

function validatePost(req, res, next) {
    const { id: user_id } = req.params;
  const { text } = req.body;
  if (!req.body) {
    return res.status(400).json({ error: "Posts requires body" });
  }
  if (!text) {
    return res.status(400).json({ error: "Posts requires text" });
  }
  req.body = { user_id, text };
  next();


};

module.exports = router;
