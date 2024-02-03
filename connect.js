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

    const existingUser = await getUserInfo(db, 'username', user.username);
    const existingEmail = await getUserInfo(db, 'email', user.email);
    console.log(existingUser);
    console.log(existingEmail);

    if (!existingUser && !existingEmail) {
        const userCollection = db.collection(userListCollection);
        await userCollection.insertOne(user);
        await disconnectFromMongoDB();
        return { "CODE": "001" };
    } else {
        await disconnectFromMongoDB();
        if (existingUser) {
            return { "CODE": "002" }; // This username already exists.
        } else if (existingEmail) {
            return { "CODE": "003" }; // This email already exists.
        }
    }
}

async function login(user) {
    const db = await connectToMongoDB();

    const existingUser = await getUserInfo(db, 'email', user.email);

    if (existingUser) {
        if (user.password === existingUser.password) {
            await disconnectFromMongoDB();
            return { "CODE": "001" , "username": existingUser.username };
        } else {
            await disconnectFromMongoDB();
            return { "CODE": "004" }; 
        }
    } else {
        await disconnectFromMongoDB();
        return { "CODE": "005" }; 
    }
}



async function addList(list) {
    const listString = JSON.stringify(list);

    const parsedList = JSON.parse(listString);

    const transformedObject = {
        name: parsedList.name,
        users: [list.username],
        products: parsedList.products
    };

    console.log(transformedObject);

    const resultJSON = JSON.stringify(transformedObject);
    const db = await connectToMongoDB();
    const existingList = await getListInfo(db, resultJSON.name);

    if (!existingList) {
        const listCollection = db.collection(listListCollection);
        await listCollection.insertOne(resultJSON);
        await disconnectFromMongoDB();
        return { "CODE": "001"};
    }
    else {
        await disconnectFromMongoDB();
        return { "CODE": "004" }; 
    }
}


async function updateList(db, list) {
    //update
}

async function getUserInfo(db, field, value) {
    const userCollection = db.collection(userListCollection);
    return await userCollection.findOne({ [field]: value });
}


async function getUserInfoWithLists(username) {
    const db = await connectToMongoDB();
    const userCollection = db.collection(userListCollection);
    const value = await userCollection.aggregate([
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
    await disconnectFromMongoDB();
    return value
}

async function getListInfo(db, value) {
    const listCollection = db.collection(listListCollection);
    console.log(listCollection.findOne({ "name": value }))
    return await listCollection.findOne({ "name": value });
}

async function getAllListsByUsername(username) {
    const userInfoWithLists = await getUserInfoWithLists(username);

    const listsWithoutId = userInfoWithLists[0]["lists"].map(list => {
        const { _id, ...listWithoutId } = list;
        return listWithoutId;
    });

    return listsWithoutId;
}

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB,
    getAllListsByUsername,
    addUser,
    login,
    addList
};
