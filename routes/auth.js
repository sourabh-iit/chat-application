const mongoclient = require('mongodb').MongoClient;
const passwordHash = require('password-hash');
const auth = require('../auth_util');
const assert = require('assert');

const url = "mongodb://localhost:27017";

async function connect() {
  const client = await mongoclient.connect(url);
  return client.db('chat');
}

const login = async function(req, res, next) {
  try {
    let username = req.body.username;
    let password = req.body.password;
  
    const db = await connect();
    const user = await db.collection('users').findOne({username: username});
    assert(user && passwordHash.verify(password, user.password), "Invalid username or password");
    res.json({success: true, token: auth.createToken(username)});
  } catch(error) {
    res.json({success: false, error: error.message}, status=400);
  }
}

const register = async function(req, res, next) {
  try {
    let user = {};
    user.first_name = req.body.first_name || "";
    user.last_name = req.body.last_name || "";
    user.username = req.body.username;
    user.password = req.body.password;
    user.confirm_password = req.body.confirm_password;
    
    assert(user.username && user.username.length > 0, "username is required");
    assert(user.password && user.confirm_password && user.password === user.confirm_password,"password and confirm password should match");
    assert(user.first_name.trim() != "", "first name is required");
  
    const db = await connect();
    const users = await db.collection('users').find({username: {$in: [user.username]}}).toArray();
    assert(users.length == 0, "username already exists");
    user.password = passwordHash.generate(user.password);
    delete user.confirm_password;
    await db.collection('users').insertOne(user);
    res.json({success: true});
  } catch(error) {
    res.json({success: false, error: error.message}, status=400);
  }
}

module.exports.login = login;
module.exports.register = register;
