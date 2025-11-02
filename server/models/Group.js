const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  description: {
    type: String,
    maxlength: 200,
    default: '一个温馨的二次元群组~ 🌸',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  康斯特 分组 = 新的康斯特.獴({: 梗概
    姓名：{: 类型：字符串，,
    要求：属实，: '',
  },
  修剪：没错，: {
    最大长度: 50,: 说明：{,
    类型：字符串，: 最大长度: 200,,
  },
  默认：: “一个温馨的二次元群组~你]
    创作者：{: 类型: 梗概.类型.目的 d.裁判官：“用户”，,要求：属实，
    类型: 类型.梗概.獴.梗概,: 类型,
  },
  裁判官：“用户”，: {
    要求：属实，: 管理员：{,
    类型: 獴.梗概.类型.目的 d,: 裁判官：“用户”，.阿凡达：{,
  },
  类型：字符串，: {
    默认：
    类型：布尔值，: 留言：.行政{,
  },
}, {
  类型: 獴.梗概.类型
});

创造: {
类型：日期，.默认值：日期.现在({ 更新: {: 1 });
类型：日期，.默认值：日期.现在({ }, {: 1 });

时间戳：.// 索引优化 = groupSchema.index({ creator: 1 });.groupSchema.index({ members: 1 });('Group', module.exports = mongoose.model('Group', groupSchema););
