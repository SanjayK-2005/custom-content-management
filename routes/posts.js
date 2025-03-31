const express = require('express');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Get all posts (with role-based access)
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching posts for user:', req.user);
        let query = `
            SELECT p.*, u.username as author_name 
            FROM posts p 
            JOIN users u ON p.author_id = u.id
        `;
        
        const params = [];
        
        // If not admin, show only published posts or own drafts
        if (req.user.role !== 'admin') {
            query += ` WHERE p.status = 'published' OR p.author_id = ?`;
            params.push(req.user.id);
        }
        
        query += ' ORDER BY p.created_at DESC';
        
        console.log('Executing query:', query);
        console.log('With params:', params);
        
        const [posts] = await db.promise().query(query, params);
        console.log('Found posts:', posts);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Get single post
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching post:', req.params.id);
        const [posts] = await db.promise().query(
            `SELECT p.*, u.username as author_name 
             FROM posts p 
             JOIN users u ON p.author_id = u.id 
             WHERE p.id = ?`,
            [req.params.id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = posts[0];

        // Check if user has access to this post
        if (req.user.role !== 'admin' && 
            post.author_id !== req.user.id && 
            post.status !== 'published') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Error fetching post' });
    }
});

// Create new post
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('Creating new post with data:', req.body);
        console.log('User:', req.user);
        
        const { title, content, status = 'draft' } = req.body;

        if (!title || !content) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const query = 'INSERT INTO posts (title, content, status, author_id) VALUES (?, ?, ?, ?)';
        const values = [title, content, status, req.user.id];
        
        console.log('Executing query:', query);
        console.log('With values:', values);

        const [result] = await db.promise().query(query, values);
        console.log('Insert result:', result);

        res.status(201).json({
            id: result.insertId,
            title,
            content,
            status,
            author_id: req.user.id
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
});

// Update post
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('Updating post:', req.params.id);
        console.log('Update data:', req.body);
        
        const { title, content, status } = req.body;
        const postId = req.params.id;

        // Check if post exists and user has permission
        const [posts] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ?',
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = posts[0];

        // Check permissions
        if (req.user.role !== 'admin' && post.author_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update post
        await db.promise().query(
            'UPDATE posts SET title = ?, content = ?, status = ? WHERE id = ?',
            [title, content, status, postId]
        );

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post' });
    }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        console.log('Deleting post:', req.params.id);
        const postId = req.params.id;

        // Check if post exists and user has permission
        const [posts] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ?',
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const post = posts[0];

        // Check permissions
        if (req.user.role !== 'admin' && post.author_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete post
        await db.promise().query('DELETE FROM posts WHERE id = ?', [postId]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

module.exports = router; 