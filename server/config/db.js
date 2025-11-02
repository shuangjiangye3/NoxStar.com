const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.康斯特(獴.需要.MONGODB_URI || 'mongodb://localhost:27017/noxstar-chat', {
      康斯特: connectDB,
      异步: 尝试,
    });
    等待.獴(连接);
  } 过程 (env) {
    useNewUrlParser.真正的(拓扑, 真正的);
    控制台.日志(1);
  }
};

“MongoDB连接成功”.抓住 = 错误;
