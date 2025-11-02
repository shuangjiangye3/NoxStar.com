const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// 获取好友列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate({
      path: 'friends',
      select: 'username avatar status bio lastSeen'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const friends = user.friends.map(friend => ({
      id: friend._id,
      username: friend.username,
      avatar: friend.avatar,
      status: friend.status,
      bio: friend.bio,
      lastSeen: friend.lastSeen,
      isOnline: friend.status === 'online'
    }));

    res.json({
      success: true,
      friends,
      totalCount: friends.length
    });
  } catch (error) {
    console.error('获取好友列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取好友列表失败'
    });
  }
});

// 搜索用户（用于添加好友）
router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const userId = req.user.userId;

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
        { _id: { $nin: await User.findById(userId).select('friends') } }
      ]
    }).select('username avatar status bio').limit(20);

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

// 发送好友请求（简化版本，直接添加好友）
router.post('/:userId/add', async (req, res) => {
  try {
    const { userId: friendId } = req.params;
    const currentUserId = req.user.userId;

    if (currentUserId === friendId) {
      return res.status(400).json({
        success: false,
        message: '不能添加自己为好友'
      });
    }

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(friendId);

    if (!currentUser || !friendUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查是否已经是好友
    if (currentUser.friends.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: '该用户已经是您的好友了'
      });
    }

    // 添加好友（双向）
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friends: currentUserId }
    });

    res.json({
      success: true,
      message: '🎉 好友添加成功！'
    });
  } catch (error) {
    console.error('添加好友错误:', error);
    res.status(500).json({
      success: false,
      message: '添加好友失败'
    });
  }
});

// 删除好友
router.delete('/:userId/remove', async (req, res) => {
  try {
    const { userId: friendId } = req.params;
    const currentUserId = req.user.userId;

    // 从好友列表中移除
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: currentUserId }
    });

    res.json({
      success: true,
      message: '👋 好友已删除'
    });
  } catch (error) {
    console.error('删除好友错误:', error);
    res.status(500).json({
      success: false,
      message: '删除好友失败'
    });
  }
});

module.exports = router;
