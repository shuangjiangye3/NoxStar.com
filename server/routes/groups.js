const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// 获取用户加入的群组
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const groups = await Group.find({
      members: userId
    })
    .populate('creator', 'username avatar')
    .populate('admins', 'username avatar')
    .populate('members', 'username avatar status')
    .sort({ createdAt: -1 });

    const formattedGroups = groups.map(group => ({
      id: group._id,
      name: group.name,
      description: group.description,
      creator: {
        id: group.creator._id,
        username: group.creator.username,
        avatar: group.creator.avatar
      },
      admins: group.admins.map(admin => ({
        id: admin._id,
        username: admin.username,
        avatar: admin.avatar
      })),
      members: group.members.map(member => ({
        id: member._id,
        username: member.username,
        avatar: member.avatar,
        status: member.status
      })),
      isPublic: group.isPublic,
      memberCount: group.members.length,
      avatar: group.avatar,
      createdAt: group.createdAt
    }));

    res.json({
      success: true,
      groups: formattedGroups,
      totalCount: formattedGroups.length
    });
  } catch (error) {
    console.error('获取群组列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取群组列表失败'
    });
  }
});

// 创建群组
router.post('/', async (req, res) => {
  try {
    const { name, description, isPublic = false, memberIds = [] } = req.body;
    const userId = req.user.userId;

    // 验证必填字段
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: '群组名称不能为空'
      });
    }

    // 创建群组
    const group = new Group({
      name: name.trim(),
      description: description || '一个温馨的二次元群组~ 🌸',
      creator: userId,
      members: [userId, ...memberIds],
      admins: [userId],
      isPublic
    });

    await group.save();

    // 将群组添加到成员的好友列表中
    await User.findByIdAndUpdate(userId, {
      $addToSet: { groups: group._id }
    });

    const memberUsers = await User.find({
      _id: { $in: [userId, ...memberIds] }
    });

    res.json({
      success: true,
      message: '🎉 群组创建成功！',
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        memberCount: group.members.length,
        creator: {
          id: group.creator,
          username: 'You'
        },
        isPublic: group.isPublic,
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    console.error('创建群组错误:', error);
    res.status(500).json({
      success: false,
      message: '创建群组失败'
    });
  }
});

// 获取群组详情
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const group = await Group.findById(groupId)
      .populate('creator', 'username avatar')
      .populate('admins', 'username avatar')
      .populate('members', 'username avatar status')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }

    // 检查用户是否是群组成员
    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: '您不是该群组的成员'
      });
    }

    const formattedGroup = {
      id: group._id,
      name: group.name,
      description: group.description,
      creator: {
        id: group.creator._id,
        username: group.creator.username,
        avatar: group.creator.avatar
      },
      admins: group.admins.map(admin => ({
        id: admin._id,
        username: admin.username,
        avatar: admin.avatar
      })),
      members: group.members.map(member => ({
        id: member._id,
        username: member.username,
        avatar: member.avatar,
        status: member.status
      })),
      isPublic: group.isPublic,
      memberCount: group.members.length,
      avatar: group.avatar,
      lastMessage: group.lastMessage,
      createdAt: group.createdAt
    };

    res.json({
      success: true,
      group: formattedGroup
    });
  } catch (error) {
    console.error('获取群组详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取群组详情失败'
    });
  }
});

module.exports = router;
