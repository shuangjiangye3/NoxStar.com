const express = require('express');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// 获取用户的聊天列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    // 查找与用户相关的所有聊天
    const chats = await Chat.find({
      participants: userId
    })
    .populate({
      path: 'participants',
      select: 'username avatar status'
    })
    .populate({
      path: 'lastMessage',
      select: 'content createdAt sender',
      populate: {
        path: 'sender',
        select: 'username avatar'
      }
    })
    .sort({ updatedAt: -1 });

    // 格式化聊天数据
    const formattedChats = chats.map(chat => {
      const otherParticipants = chat.participants.filter(p => p._id.toString() !== userId);
      const lastMessage = chat.lastMessage || null;
      
      return {
        id: chat._id,
        participants: otherParticipants,
        lastMessage,
        unreadCount: 0, // 这里应该计算未读消息数
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };
    });

    res.json({
      success: true,
      chats: formattedChats
    });
  } catch (error) {
    console.error('获取聊天列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天列表失败'
    });
  }
});

// 获取特定聊天记录
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 验证聊天是否存在且用户参与其中
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: '聊天不存在或您无权访问'
      });
    }

    // 获取消息
    const messages = await Message.find({
      chatId,
      chatType: 'Chat'
    })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalMessages = await Message.countDocuments({
      chatId,
      chatType: 'Chat'
    });

    // 格式化消息数据
    const formattedMessages = messages.reverse().map(message => ({
      id: message._id,
      content: message.content,
      contentType: message.contentType,
      sender: {
        id: message.sender._id,
        username: message.sender.username,
        avatar: message.sender.avatar
      },
      createdAt: message.createdAt,
      isRead: message.readBy.includes(userId)
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: skip + limit < totalMessages
      }
    });
  } catch (error) {
    console.error('获取消息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取消息失败'
    });
  }
});

// 发送消息
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, contentType = 'text' } = req.body;
    const userId = req.user.userId;

    // 验证聊天是否存在且用户参与其中
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: '聊天不存在或您无权发送消息'
      });
    }

    // 创建消息
    const message = new Message({
      sender: userId,
      content,
      contentType,
      chatId,
      chatType: 'Chat'
    });

    await message.save();

    // 更新聊天的最后消息
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // 格式化消息数据
    const formattedMessage = {
      id: message._id,
      content: message.content,
      contentType: message.contentType,
      sender: {
        id: message.sender,
        username: 'You', // 这里应该从数据库获取真实用户名
        avatar: '' // 这里应该从数据库获取真实头像
      },
      createdAt: message.createdAt,
      isRead: true
    };

    res.json({
      success: true,
      message: formattedMessage,
      chatId
    });

  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({
      success: false,
      message: '发送消息失败'
    });
  }
});

// 标记消息为已读
router.post('/:chatId/read', async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // 这里应该实现标记消息为已读的逻辑
    // 由于需要消息ID，这里简化处理

    res.json({
      success: true,
      message: '消息已标记为已读'
    });
  } catch (error) {
    console.error('标记已读错误:', error);
    res.status(500).json({
      success: false,
      message: '标记已读失败'
    });
  }
});

module.exports = router;
