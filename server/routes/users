const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// 获取所有用户（用于添加好友）
router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const userId = req.query.userId;

    if (!keyword || keyword.trim() === '') {
      return res.json({
        success: true,
        users: []
      });
    }

    const users = await User.find({
      $and: [
        { 
          $or: [
            { username: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } }
          ]
        },
        { _id: { $ne: userId } },
        { _id: { $nin: userId ? [userId] : [] } }
      ]
    }).select('username email avatar bio status').limit(20);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索用户失败'
    });
  }
});

// 获取用户详情
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败'
    });
  }
});

module.exports = router;
