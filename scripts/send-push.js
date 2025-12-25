const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variable
// The 'FIREBASE_SERVICE_ACCOUNT' secret must be the full JSON content
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const messaging = admin.messaging();

async function sendDailyNotification() {
    try {
        // 1. Get Today's Date (YYYY-MM-DD formatted for Turkey)
        const options = { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' };
        const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
        const today = formatter.format(new Date());

        console.log(`Checking topic for date: ${today}`);

        // 2. Fetch Daily Topic
        const topicDoc = await db.collection('topics').doc(today).get();

        if (!topicDoc.exists) {
            console.log('No topic found for today. Skipping notification.');
            return;
        }

        const topicData = topicDoc.data();
        const topicTitle = topicData.title_tr || "Günün Konusu";

        console.log(`Topic found: ${topicTitle}`);

        // 3. Fetch All Registered Tokens
        // Note: iterating all docs might be heavy for huge apps, but fine for now.
        const tokensSnapshot = await db.collection('fcm_tokens').get();

        if (tokensSnapshot.empty) {
            console.log('No registered devices found.');
            return;
        }

        const tokens = [];
        tokensSnapshot.forEach(doc => {
            if (doc.data().token) {
                tokens.push(doc.data().token);
            }
        });

        console.log(`Found ${tokens.length} devices.`);

        if (tokens.length === 0) return;

        // 4. Create Notification Payload
        // "Yeni konu hemen ilk mesaj atanlardan ol"
        // "Konu: [Konu Başlığı]"
        const message = {
            notification: {
                title: '📢 Yeni Konu Yayında!',
                body: `"${topicTitle}"\nHemen ilk mesaj atanlardan ol! 🚀`
            },
            webpush: {
                fcm_options: {
                    link: 'https://dayquestion.netlify.app/' // Update with your actual domain
                },
                notification: {
                    icon: 'https://dayquestion.netlify.app/icon.png',
                    badge: 'https://dayquestion.netlify.app/icon.png'
                }
            },
            tokens: tokens
        };

        // 5. Send Multicast Message
        const response = await messaging.sendMulticast(message);

        console.log(`${response.successCount} messages were sent successfully.`);
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
            // Optional: Delete invalid tokens here
        }

    } catch (error) {
        console.log('Error sending notification:', error);
        process.exit(1);
    }
}

sendDailyNotification();
