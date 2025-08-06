const bcrypt = require("bcrypt");

const plainPassword = "123456";

bcrypt.hash(plainPassword, 10, function(err, hash) {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Hashed password:", hash);
});
