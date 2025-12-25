import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Harika Konular Havuzu (TR/EN)
const questions = [
    { tr: "Telefonsuz bir gün mü, internetsiz bir ay mı daha zor?", en: "A day without a phone or a month without internet, which is harder?" },
    //DİĞER SORULAR...
];

async function seedTopics() {
    console.log("Konular (RESİMSİZ) hazırlanıyor (2025 - 2027)...");
    const batch = writeBatch(db);

    // Start from Today
    const startDate = new Date();
    // End Date: Jan 1, 2027
    const endDate = new Date('2027-01-01');

    let currentDate = new Date(startDate);
    let questionIndex = 0;

    const allTopics = [];
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        const q = questions[questionIndex % questions.length];
        allTopics.push({
            date: dateStr,
            title_tr: q.tr,
            title_en: q.en,
            title: q.tr,
            image: null
        });

        // Advance
        currentDate.setDate(currentDate.getDate() + 1);
        questionIndex++;
    }

    try {
        const chunkSize = 400;
        for (let i = 0; i < allTopics.length; i += chunkSize) {
            const chunk = allTopics.slice(i, i + chunkSize);
            const chunkBatch = writeBatch(db);

            chunk.forEach(t => {
                const docRef = doc(db, "topics", t.date);
                console.log("Writing to Firestore:", t.date, t);
                chunkBatch.set(docRef, t);
            });

            await chunkBatch.commit();
            console.log("SUCCESS: Batch committed.");
            const status = document.getElementById('status-container');
            if (status) status.innerText = `${i + chunk.length} / ${allTopics.length} konu yüklendi...`;
            console.log(`${i + chunk.length} / ${allTopics.length} yüklendi...`);
        }

        console.log("TÜM KONULAR GÜNCELLENDİ!");
        if (status) {
            status.style.color = "green";
            status.innerText = "✅ TÜM KONULAR GÜNCELLENDİ!";
        }
        alert("Güncelleme Başarılı! Şimdi ana sayfayı yenileyebilirsiniz.");
    } catch (e) {
        const status = document.getElementById('status-container');
        if (status) {
            status.style.color = "red";
            status.innerText = "❌ Hata: " + e.message;
        }
        console.error("Yükleme Hatası:", e);
        alert("HATA OLUŞTU: " + e.message);
    }
}

document.getElementById('start-btn').addEventListener('click', seedTopics);
