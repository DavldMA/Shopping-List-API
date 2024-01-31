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

const databaseName = 'url';

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

async function findRedirectURLByShortId(shortId) {
    try {
        await connectToMongoDB()
        const collectionName = "url"
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const query = { shortId };
        const result = await collection.findOne(query);
        if (result.redirectURL) {
            return result.redirectURL;
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

async function deleteAllDocumentsInUrlCollection() {
    try {
        const collectionName = "url";
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        const deleteResult = await collection.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} documents in the "${collectionName}" collection.`);
    } catch (err) {
        console.error('Error deleting documents in the "url" collection:', err);
    }
}

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB,
    findRedirectURLByShortId,
    deleteAllDocumentsInUrlCollection
};
