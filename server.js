require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const indexRoutes = require('./routes/index');
const survivorRoutes = require('./routes/survivor');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', indexRoutes);
app.use('/survivor', survivorRoutes);

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(() => {
    console.log('Mongo connected');
    app.listen(PORT, () => console.log('Server listening on', PORT));
  })
  .catch(err => {
    console.error('Mongo connect error', err);
  });
