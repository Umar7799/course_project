const { Router } = require('express');
const express = require("express");
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Import the JWT library for decoding

// http://localhost:5000/auth/salesforce/login

let salesforceAuth = {
    accessToken: null,
    instanceUrl: null,
    refreshToken: null, // Store refresh token here
};

const router = Router();

// Helper function to check if the access token is expired
const isAccessTokenExpired = (accessToken) => {
    const decoded = jwt.decode(accessToken);
    if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }
    return false;
};

// Helper function to refresh the Salesforce access token
const refreshSalesforceToken = async () => {
    try {
        const clientId = process.env.SALESFORCE_CLIENT_ID;
        const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
        const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

        const response = await axios.post("https://login.salesforce.com/services/oauth2/token", null, {
            params: {
                grant_type: "refresh_token",
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: salesforceAuth.refreshToken,
            },
        });

        // Save the new access token
        salesforceAuth.accessToken = response.data.access_token;
        console.log("Salesforce refreshed token:", salesforceAuth.accessToken);
    } catch (error) {
        console.error("Error refreshing Salesforce token:", error.response?.data || error.message);
    }
};

router.get("/salesforce/callback", async (req, res) => {
    const code = req.query.code;

    if (code) {
        try {
            const clientId = process.env.SALESFORCE_CLIENT_ID;
            const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
            const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

            const response = await axios.post("https://login.salesforce.com/services/oauth2/token", null, {
                params: {
                    grant_type: "authorization_code",
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                },
            });

            const { access_token, instance_url, refresh_token } = response.data;

            // Save token and refresh token in memory
            salesforceAuth.accessToken = access_token;
            salesforceAuth.instanceUrl = instance_url;
            salesforceAuth.refreshToken = refresh_token;

            console.log("Salesforce Access Token: ", salesforceAuth.accessToken);
            console.log("Salesforce Refresh Token: ", salesforceAuth.refreshToken);

            res.json({ message: "Salesforce callback received and token stored!" });
        } catch (error) {
            console.error("Salesforce token exchange failed:", error.response?.data || error.message);
            res.status(500).json({
                error: "Failed to exchange code for access token",
                details: error.response?.data || error.message,
            });
        }
    } else {
        res.status(400).json({ error: "No authorization code found in the callback URL" });
    }
});

// Salesforce Login route
router.get("/salesforce/login", (req, res) => {
    const clientId = process.env.SALESFORCE_CLIENT_ID; // From your Salesforce App
    const redirectUri = process.env.SALESFORCE_REDIRECT_URI; // Your redirect URI

    // Salesforce OAuth authorization URL
    const authorizationUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

    // Redirect the user to Salesforce's OAuth page
    res.redirect(authorizationUrl);
});

// POST /salesforce/sync
router.post("/salesforce/sync", authMiddleware(), async (req, res) => {
    const { user } = req;
    const { company, phone } = req.body;

    if (!salesforceAuth.accessToken || !salesforceAuth.instanceUrl) {
        return res.status(401).json({ error: "Salesforce is not authenticated yet." });
    }

    if (!user || (!user.email && user.role !== 'ADMIN')) {
        return res.status(403).json({ error: "Unauthorized to sync user." });
    }

    if (isAccessTokenExpired(salesforceAuth.accessToken)) {
        console.log("Access token expired, refreshing...");
        await refreshSalesforceToken();
    }

    try {
        // 🔍 1. Check if Contact with this email already exists
        const contactLookup = await axios.get(
            `${salesforceAuth.instanceUrl}/services/data/v58.0/query`,
            {
                params: {
                    q: `SELECT Id, FirstName, LastName, Email, AccountId FROM Contact WHERE Email = '${user.email}' LIMIT 1`,
                },
                headers: {
                    Authorization: `Bearer ${salesforceAuth.accessToken}`,
                },
            }
        );

        if (contactLookup.data.records.length > 0) {
            const existing = contactLookup.data.records[0];
            return res.status(409).json({
                error: "Duplicate detected",
                message: `A Contact with this email already exists in Salesforce.`,
                existingContactId: existing.Id,
                accountId: existing.AccountId,
            });
        }

        // 🏢 2. Create Account
        const accountResponse = await axios.post(
            `${salesforceAuth.instanceUrl}/services/data/v58.0/sobjects/Account`,
            {
                Name: company || `${user.name}'s Company`,
                Phone: phone || "",
            },
            {
                headers: {
                    Authorization: `Bearer ${salesforceAuth.accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const accountId = accountResponse.data.id;

        // 👤 3. Create Contact
        const contactResponse = await axios.post(
            `${salesforceAuth.instanceUrl}/services/data/v58.0/sobjects/Contact`,
            {
                FirstName: user.name,
                LastName: user.name || "Unknown",
                Email: user.email,
                AccountId: accountId,
            },
            {
                headers: {
                    Authorization: `Bearer ${salesforceAuth.accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({
            message: "✅ User synced to Salesforce.",
            accountId,
            contactId: contactResponse.data.id,
        });

    } catch (error) {
        const errData = error.response?.data;

        console.error("Salesforce sync error:", errData || error.message);
        res.status(500).json({
            error: "Failed to sync with Salesforce",
            details: errData || error.message,
        });
    }
});

module.exports = { router, salesforceAuth };
