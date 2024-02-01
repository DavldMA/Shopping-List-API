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
    const existingList = await getListInfo(db, list.name);

    if (!existingList) {
        const listCollection = db.collection(listListCollection);
        await listCollection.insertOne(list);
    }
}

async function addProduct(db, product) {
    const existingProduct = await getProductInfo(db, product.name);

    if (!existingProduct) {
        const productCollection = db.collection(productListCollection);
        await productCollection.insertOne(product);
    }
}

async function getUserInfo(db, username) {
    const userCollection = db.collection(userListCollection);
    return await userCollection.findOne({ username });
}

async function getUserInfoWithLists(db, username) {
    const userCollection = db.collection(userListCollection);
    return await userCollection.aggregate([
        {
            $match: { username: username }
        },
        {
            $lookup: {
                from: listListCollection,
                localField: 'username',
                foreignField: 'users',
                as: 'lists'
            }
        }
    ]).toArray();
}

async function getListInfo(db, name) {
    const listCollection = db.collection(listListCollection);
    return await listCollection.findOne({ name });
}

async function getProductInfo(db, name) {
    const productCollection = db.collection(productListCollection);
    return await productCollection.findOne({ name });
}




async function main() {
    const db = await connectToMongoDB();

    const username = 'john_doe';
    const userInfoWithLists = await getUserInfoWithLists(db, username);

    await disconnectFromMongoDB();

    return userInfoWithLists[0]['lists']

    const user = {
        username: 'john_doe',
        email: 'john@example.com',
        password: '123_Se'
    };

    const product = {
        name: 'Milk',
        ptName: 'Leite',
        category: 'Dairy',
        quantity: 2
    };

    const list = {
        name: 'Shopping List 1',
        users: [user.username],
        products: [retrievedProduct.name],
        productQuantity: [1]
    };

}

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB,
    main
};
