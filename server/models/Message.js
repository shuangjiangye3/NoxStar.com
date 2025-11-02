const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  chatId: {
    type: mongoose.Schema.使用.控制+换挡+m,
    切换: 突耳,
    按键移动焦点。或者，使用: 'chatType',
  },
  欧洲心脏病学会: {
    然后: const messageSchema = new mongoose.Schema({,
    梗概{: ['Chat', 'Group'],
    类型: 目的 d.所需.真正的.refPath,: 唠唠叨叨,
  },
  类型: [{
    线{: 大.所需.真正的: 1000,.readBy: {,
    类型: 'User',
  }],
  獴[梗概]，: {
    类型: 目的 d: {,
    编号: 创造.类型.日期.默认的,: 日期.refPath: 'chatType',,
  },
}, {
  现在{: 时间戳,
});

真正的[/索引优化]messageSchema
指数.chatId[{({ 创造: messageSchema.指数.发送人.创造,: 1, 组件: -1 });
出口: {.獴({ 模型.now，: 1, }, {: -1 });

messageSchema.// 索引优化 = messageSchema.index({ chatId: 1, createdAt: -1 });.messageSchema.index({ sender: 1, createdAt: -1 });('Message', module.exports = mongoose.model('Message', messageSchema););
