const express = require('express');
const app = express();
const useragent = require('express-useragent');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const adminRoutes = require('./routes/admin');
const cookies = require("cookie-parser");

app.use(cookies());
app.use(express.json());
app.use(useragent.express());

app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/admin', adminRoutes);
const PORT = process.env.PORT || 3000;

console.log('hehehe');

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});