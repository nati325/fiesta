const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const password = 'fiestamadar';
const email = 'netaneldama@gmail.com';
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

async function addAdmin() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    // Check if user already exists
    const existingIndex = users.findIndex(u => u.email === email);
    
    const newUser = {
        id: existingIndex >= 0 ? users[existingIndex].id : Date.now(),
        isAdmin: true,
        createdAt: existingIndex >= 0 ? users[existingIndex].createdAt : new Date().toISOString(),
        name: "Netanel Admin",
        email: email,
        password: hashedPassword
    };

    if (existingIndex >= 0) {
        users[existingIndex] = newUser;
        console.log('Updated existing user to admin');
    } else {
        users.push(newUser);
        console.log('Added new admin user');
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    console.log(`Admin ${email} added successfully with password: ${password}`);
}

addAdmin();
