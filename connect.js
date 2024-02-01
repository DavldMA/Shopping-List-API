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

async function addUser(user) {
    const db = await connectToMongoDB();

    const existingUser = await getUserInfo(db, user.username);
    const existingEmail = await getUserInfo(db, user.email);
    console.log(existingUser)
    console.log(existingEmail)

    if (!existingUser && !existingEmail) {
        const userCollection = db.collection(userListCollection);
        await userCollection.insertOne(user);
        await disconnectFromMongoDB();
        return {"SUCCESSFUL:" : "001."};
    } else {
        await disconnectFromMongoDB();
        if (existingUser) {
            return {"ERROR:" : "002"}; //This username already exists.
        } else if (existingEmail) {
            return {"ERROR:" :  "003"}; //This email already exists.
        }
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

async function getUserInfo(db, value) {
    const userCollection = db.collection(userListCollection);
    return await userCollection.findOne({ value });
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

async function getListInfo(db, value) {
    const listCollection = db.collection(listListCollection);
    return await listCollection.findOne({ value });
}

async function getProductInfo(db, value) {
    const productCollection = db.collection(productListCollection);
    return await productCollection.findOne({ value });
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
    main,
    addUser
};
