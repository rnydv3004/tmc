import { initializeApp } from "firebase/app";
import { get, getDatabase, ref } from "firebase/database";
import { NextRequest, NextResponse } from "next/server"
const { containerBootstrap } = require("@nlpjs/core");
const { Nlp } = require("@nlpjs/nlp");
const { LangEn } = require("@nlpjs/lang-en-min");
import NextCors from 'nextjs-cors';

// Firebase setup

const firebaseConfig = {
    databaseURL: process.env.DB_URL,
};

// Initialize Firebase
const fbApp = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase();

async function readUserData(botId: any) {
    try {
        const chatbotRef = ref(db, `chatbot/${botId}/botData`);
        const snapshot = await get(chatbotRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            return data; // Return the data
        } else {
            return null; // Return null if no data is available
        }
    } catch (error) {
        console.error("Error reading data:", error);
        throw error; // Re-throw the error to handle it elsewhere if needed
    }
}

// firebase setup ends here

// cors setup


export async function POST(request: NextRequest) {
    try {

        //destructuring the response
        const reqBody = await request.json()
        const { message } = reqBody

        // model setup
        const container = await containerBootstrap();
        container.use(Nlp);
        container.use(LangEn);
        const nlp = container.get("nlp");
        nlp.settings.autoSave = false;
        nlp.addLanguage("en");


        // getting the raw trained model
        const modelTrainedStr = await readUserData("gdhry476rgfh");
        const modelTrained = JSON.parse(modelTrainedStr);

        // Load the NLP model from the JSON object
        nlp.fromJSON(modelTrained);

        // TAKING RESPONSE OF MESSAGE
        const processedResponse = await nlp.process("en", message);
        const answer = processedResponse.answer;

        // creating a response to return
        const response = NextResponse.json(
            { message: answer }, { status: 200 }
        )

        return response

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}


export async function GET() {
    try {

        const response = NextResponse.json({
            message: "Hi There, I am Taxmechanic Chatbot",
            success: true
        })

        return response

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}