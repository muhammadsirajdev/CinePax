const bcrypt = require('bcrypt');

async function testCompare() {
  const plain = 'Password123';
  const hash = '$2b$10$ZQ35cDNnh3dttQemfmCGOevV17Qp9U8EEVK7bXJLTq4GL.VY4HOQS'; // your stored hash

  const result = await bcrypt.compare(plain, hash);
  console.log('Password match?', result);
}

testCompare();
