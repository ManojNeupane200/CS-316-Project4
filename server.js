const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const accountsFile = path.join(__dirname, "accounts.json");
const accountDataFolder = path.join(__dirname, "account-data");
const publicFolder = path.join(__dirname, "public");


// -----------------------------
// Middleware
// -----------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "cs316-project4-secret-key",
        resave: false,
        saveUninitialized: false
    })
);


// -----------------------------
// Make sure required files/folders exist
// -----------------------------

if (!fs.existsSync(accountsFile)) {
    fs.writeFileSync(accountsFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(accountDataFolder)) {
    fs.mkdirSync(accountDataFolder);
}


// -----------------------------
// Helper functions
// -----------------------------

function readAccounts() {
    try {
        const data = fs.readFileSync(accountsFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading accounts:", error);
        return [];
    }
}


function saveAccounts(accounts) {
    fs.writeFileSync(
        accountsFile,
        JSON.stringify(accounts, null, 2)
    );
}


function requireLogin(req, res, next) {
    if (!req.session.accountId) {
        return res.status(401).json({
            success: false,
            message: "You must log in first."
        });
    }

    next();
}


// -----------------------------
// LOGIN
// -----------------------------

app.post("/api/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const accounts = readAccounts();

    const account = accounts.find(
        (item) =>
            item.username === username &&
            item.password === password
    );


    if (!account) {

        return res.status(401).json({
            success: false,
            message: "Incorrect username or password."
        });
    }


    req.session.accountId = account.accountId;
    req.session.username = account.username;


    res.json({
        success: true,
        message: "Login successful.",
        accountId: account.accountId
    });
});


// -----------------------------
// CREATE ACCOUNT
// -----------------------------

app.post("/api/create-account", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;


    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });
    }


    const accounts = readAccounts();


    // Prevent duplicate usernames
    const existingAccount = accounts.find(
        (item) => item.username === username
    );


    if (existingAccount) {

        return res.status(400).json({
            success: false,
            message: "That username already exists."
        });
    }


    // Generate unique account ID
    let newId = 1;

    if (accounts.length > 0) {

        const ids = accounts.map(
            (item) => item.accountId
        );

        newId = Math.max(...ids) + 1;
    }


    const accountFileName =
        `${newId}.json`;

    const accountFilePath =
        path.join(
            accountDataFolder,
            accountFileName
        );


    /*
        Create the individual account file.
        All form values begin empty.
    */

    const accountData = {
        accountId: newId,
        username: username,
        password: password,

        name: "",
        favoriteColor: "",
        year: "",
        rating: "",
        favoriteLanguage: "",
        comments: ""
    };


    fs.writeFileSync(
        accountFilePath,
        JSON.stringify(accountData, null, 2)
    );


    /*
        Add account to account list WITHOUT
        deleting older accounts.
    */

    const newAccount = {
        username: username,
        password: password,
        accountId: newId,
        accountFile:
            `account-data/${accountFileName}`
    };


    accounts.push(newAccount);

    saveAccounts(accounts);


    res.json({
        success: true,
        message: "Account created successfully.",
        accountId: newId
    });
});


// -----------------------------
// CHECK CURRENT LOGIN
// -----------------------------

app.get("/api/session", (req, res) => {

    if (!req.session.accountId) {

        return res.json({
            loggedIn: false
        });
    }


    res.json({
        loggedIn: true,
        accountId: req.session.accountId,
        username: req.session.username
    });
});


// -----------------------------
// LOGOUT
// -----------------------------

app.post("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true
        });

    });
});


// -----------------------------
// GET ALL ACCOUNT IDs
// Records page uses this
// -----------------------------

app.get(
    "/api/accounts",
    requireLogin,
    (req, res) => {

        const accounts = readAccounts();


        /*
            Only send IDs.
            Do NOT send passwords.
        */

        const accountIds =
            accounts.map(
                (account) => ({
                    accountId:
                        account.accountId
                })
            );


        res.json(accountIds);
    }
);


// -----------------------------
// GET ONE ACCOUNT'S FORM DATA
// Records page uses this
// -----------------------------

app.get(
    "/api/account/:id",
    requireLogin,
    (req, res) => {

        const id = Number(req.params.id);

        const accounts = readAccounts();


        const account =
            accounts.find(
                (item) =>
                    item.accountId === id
            );


        if (!account) {

            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }


        const accountFilePath =
            path.join(
                __dirname,
                account.accountFile
            );


        if (!fs.existsSync(accountFilePath)) {

            return res.status(404).json({
                success: false,
                message:
                    "Account data file not found."
            });
        }


        const data =
            JSON.parse(
                fs.readFileSync(
                    accountFilePath,
                    "utf8"
                )
            );


        /*
            Never send the password
            to the Records page.
        */

        const safeData = {
            accountId: data.accountId,
            name: data.name,
            favoriteColor:
                data.favoriteColor,
            year: data.year,
            rating: data.rating,
            favoriteLanguage:
                data.favoriteLanguage,
            comments: data.comments
        };


        res.json(safeData);
    }
);


// -----------------------------
// LOAD LOGGED-IN USER'S FORM
// -----------------------------

app.get(
    "/api/my-form",
    requireLogin,
    (req, res) => {

        const accounts = readAccounts();


        const account =
            accounts.find(
                (item) =>
                    item.accountId ===
                    req.session.accountId
            );


        if (!account) {

            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }


        const accountFilePath =
            path.join(
                __dirname,
                account.accountFile
            );


        const data =
            JSON.parse(
                fs.readFileSync(
                    accountFilePath,
                    "utf8"
                )
            );


        /*
            Password is not needed by the browser.
        */

        res.json({
            accountId: data.accountId,
            username: data.username,
            name: data.name,
            favoriteColor:
                data.favoriteColor,
            year: data.year,
            rating: data.rating,
            favoriteLanguage:
                data.favoriteLanguage,
            comments: data.comments
        });
    }
);


// -----------------------------
// SAVE / UPDATE LOGGED-IN USER'S FORM
// -----------------------------

app.post(
    "/api/my-form",
    requireLogin,
    (req, res) => {

        const accounts = readAccounts();


        const account =
            accounts.find(
                (item) =>
                    item.accountId ===
                    req.session.accountId
            );


        if (!account) {

            return res.status(404).json({
                success: false,
                message: "Account not found."
            });
        }


        const accountFilePath =
            path.join(
                __dirname,
                account.accountFile
            );


        const existingData =
            JSON.parse(
                fs.readFileSync(
                    accountFilePath,
                    "utf8"
                )
            );


        /*
            Account ID, username, and password
            stay unchanged.

            Only the form data is updated.
        */

        existingData.name =
            req.body.name || "";

        existingData.favoriteColor =
            req.body.favoriteColor || "";

        existingData.year =
            req.body.year || "";

        existingData.rating =
            req.body.rating || "";

        existingData.favoriteLanguage =
            req.body.favoriteLanguage || "";

        existingData.comments =
            req.body.comments || "";


        fs.writeFileSync(
            accountFilePath,
            JSON.stringify(
                existingData,
                null,
                2
            )
        );


        res.json({
            success: true,
            message:
                "Form information saved successfully."
        });
    }
);


// -----------------------------
// Website files
// -----------------------------

app.use(
    express.static(publicFolder)
);


// -----------------------------
// Start server
// -----------------------------

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
