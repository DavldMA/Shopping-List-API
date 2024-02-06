const { MongoClient, ServerApiVersion } = require('mongodb');
const shortid = require("shortid");
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
    
    const listObject = JSON.parse(list.list);

    const transformedObject = {
        name: listObject.name,
        users: [list.username],
        products: listObject.products
    };

    const db = await connectToMongoDB();
    const existingList = await getListInfo(db, 'name', transformedObject.name);

    if (!existingList) {
        const listCollection = db.collection(listListCollection);
        await listCollection.insertOne(transformedObject);
        await disconnectFromMongoDB();
        return { "CODE": "001"};
    }
    else {
        await disconnectFromMongoDB();
        return { "CODE": "004" }; 
    }
}

async function removeUserFromList(username, listname) {
    const db = await connectToMongoDB();

    try {
        const listCollection = db.collection(listListCollection);

        const list = await listCollection.findOne({ name: listname, users: username });

        if (!list) {
            await disconnectFromMongoDB();
            return { "CODE": "002" }; 
        }

        const updatedUsers = list.users.filter(user => user !== username);

        if (updatedUsers.length === 0) {
            await listCollection.deleteOne({ name: listname });
            await disconnectFromMongoDB();
            return { "CODE": "001" }; 
        } else {
            await listCollection.updateOne(
                { name: listname },
                { $set: { users: updatedUsers } }
            );
            await disconnectFromMongoDB();
            return { "CODE": "001" };
        }
    } catch (error) {
        console.error("Error removing user from list:", error);
        await disconnectFromMongoDB();
        return { "CODE": "005" };
    }
}

async function generateNewShortURL(req, res) {
    const body = req.body;
    console.log(body);
    if (!body || !body.name) {
        return res.status(400).json({ error: 'url is required' });
    }
    const shortID = shortid();
    const db = await connectToMongoDB();
    const list = db.getListInfo(db, "name", body.name)
    console.log(list)
    
    try {
        const urlCollection = db.collection('url');
    
        const result = await urlCollection.insertOne({
            shortId: shortID,
            listId: list._id,
            visitHistory: [],
        });
        
        if (result && result.insertedId) {
            return res.status(200).json({ url: "shopping-list-api-beta.vercel.app/list/share/id/"+shortID });
        } else {
            return res.status(500).json({ error: 'Failed to create a new short URL' });
        }
    } catch (error) {
        console.error('Error creating a new short URL:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await disconnectFromMongoDB();
    }
}

async function findRedirectURL(shortID) {
    var xd = await findRedirectURLByShortId(shortID);
    return xd
}

async function findRedirectURLByShortId(shortId) {
    try {
        await connectToMongoDB()
        const collectionName = "url"
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const query = { shortId };
        const result = await collection.findOne(query);
        if (result.listId) {

            return result.listId;
        } else {
            console.log(`ShortId ${shortId} not found in the database.`);
            return null;
        }
    } catch (err) {
        console.error('Error finding redirect URL:', err);
        return null;
    }
    finally{
        await disconnectFromMongoDB();
    }
}

async function addUserToList(user, listID) {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection('list');

        const query = { _id: listID };
        const updateDoc = {
            $push: { users: user }
        };

        const result = await collection.updateOne(query, updateDoc);

        if (result.modifiedCount === 1) {
            return { success: true };
        } else {
            console.log(`List with ID ${listID} not found.`);
            return { success: false, error: 'List not found' };
        }
    } catch (error) {
        console.error('Error adding user to list:', error);
        return { success: false, error: 'Internal server error' };
    } finally {
        await disconnectFromMongoDB();
    }
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

async function getListInfo(db, field, value) {
    const listCollection = db.collection(listListCollection);
    return await listCollection.findOne({ [field]: value });
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
    removeUserFromList,
    addUser,
    login,
    addList,
    generateNewShortURL
};
