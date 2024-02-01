const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();

const uri = `mongodb+srv://${process.env.USERNAME_MONGO_DB}:${process.env.PASSWORD_MONGO_DB}@cluster0.mxvkcnv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const databaseName = 'shoplistdb';

// Collection names
const userListCollection = 'users';
const listListCollection = 'lists';
const productListCollection = 'products';

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(databaseName);

        return db;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

async function disconnectFromMongoDB() {
    try {
        await client.close();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error disconnecting from MongoDB:', err);
    }
}

async function addUser(db, user) {
    const existingUser = await getUserInfo(db, user.username);

    if (!existingUser) {
        const userCollection = db.collection(userListCollection);
        await userCollection.insertOne(user);
    }
}

async function addList(db, list) {
    const listCollection = db.collection(listListCollection);
    await listCollection.insertOne(list);
}

async function addProduct(db, product) {
    const productCollection = db.collection(productListCollection);
    await productCollection.insertOne(product);
}

async function getUserInfo(db, username) {
    const userCollection = db.collection(userListCollection);
    return await userCollection.findOne({ username });
}

async function getProductInfo(db, product) {
    const productCollection = db.collection(productListCollection);
    return await productCollection.findOne({ product });
}

// Example usage:
async function main() {
    const db = await connectToMongoDB();

    // Example entries
    const user = {
        username: 'john_doe',
        email: 'john@example.com',
        password: '123_Se'
    };

    const product = {
        name: 'Milk',
        ptName: 'Leite',
        category: 'Dairy',
        quantity: 2,
    };



    // Insert entries
    await addUser(db, user);
    await addProduct(db, product);
    const retrievedProduct = await getProductInfo(db, product);
    const retrievedUser = await getUserInfo(db, 'john_doe');
    console.log(retrievedProduct);
    await disconnectFromMongoDB();
    return retrievedUser
    
}

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB,
    main
};
