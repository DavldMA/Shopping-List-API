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

async function generateNewShortURL(list) {
    var body = list;
    console.log(body);
    const listObject = JSON.parse(list.list);
    console.log(body);
    var body2 = JSON.parse(body.list);
    if (!body || !body2.name) {
        return res.status(400).json({ error: 'url is required' });
    }
    const shortID = shortid();
    const db = await connectToMongoDB();
    const listCollection = db.collection(listListCollection);
    console.log(body2.name)
    const lists = await listCollection.findOne({ name: body2.name, users: body.username });
    console.log(lists)
    
    try {
        const urlCollection = db.collection('url');
    
        const result = await urlCollection.insertOne({
            shortId: shortID,
            listId: lists._id,
        });

        return { "CODE": "001", "url": "shopping-list-api-beta.vercel.app/list/share/id/"+shortID };
    } catch (error) {
        console.error('Error creating a new short URL:', error);
        return { "CODE": "002" };
    } finally {
        await disconnectFromMongoDB();
    }
}

async function findRedirectURL(body) {
    console.log(body)
    var loginCredentials = {
        "password" : body.password, "email": body.email
    }
    
    var message = await login(loginCredentials);
    switch (message.CODE) {
        case "001":
            var url = body.url;
            const parts = url.split('/');
            const finalPart = parts[parts.length - 1];
            var xd = await findRedirectURLByShortId(finalPart, message.username);
            return xd
        default:
            return message
    }

}

async function findRedirectURLByShortId(shortId, username) {
    try {
        await connectToMongoDB()
        console.log(shortId)
        const collectionName = "url"
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const query = { shortId };
        const result = await collection.findOne(query);
        if (result.listId) {

            return await addUserToList(username, result.listId);
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

async function addUserToList(username, listID) {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection('lists');
        console.log(listID);
        const query = { _id: listID, users: { $ne: username } }; // Check if username isn't already in the list
        const updateDoc = {
            $push: { users: username }
        };

        const result = await collection.updateOne(query, updateDoc);

        if (result.modifiedCount === 1) {
            return { success: true };
        } else {
            console.log(`User ${username} is already in the list or list with ID ${listID} not found.`);
            return { success: false, error: 'User already in the list or list not found' };
        }
    } catch (error) {
        console.error('Error adding user to list:', error);
        return { success: false, error: 'Internal server error' };
    } finally {
        await disconnectFromMongoDB();
    }
}

async function updateListProducts(body) {
    try {
        const listObject = JSON.parse(body.list);
        var username = body.username;
        var listName = listObject.name;
        var products = listObject.products;
        const db = await connectToMongoDB();
        const collection = db.collection('lists');
        
        // Find the list by username and list name
        const query = { username: username, name: listName };
        const list = await collection.findOne(query);
        
        if (!list) {
            console.log(`List ${listName} for user ${username} not found.`);
            return { success: false, error: 'List not found' };
        }
        
        // Update products array
        const updateDoc = {
            $set: { products: products }
        };

        const result = await collection.updateOne(query, updateDoc);

        if (result.modifiedCount === 1) {
            return { success: true };
        } else {
            console.log(`Failed to update products for list ${listName} for user ${username}.`);
            return { success: false, error: 'Failed to update products' };
        }
    } catch (error) {
        console.error('Error updating list products:', error);
        return { success: false, error: 'Internal server error' };
    } finally {
        await disconnectFromMongoDB();
    }
}


async function login(user) {
    console.log("called")
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
    generateNewShortURL,
    findRedirectURL,
    updateListProducts
};
