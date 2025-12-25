import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Harika Konular Havuzu (TR/EN)
const questions = [
    { tr: "Telefonsuz bir gün mü, internetsiz bir ay mı daha zor?", en: "A day without a phone or a month without internet, which is harder?" },
    { tr: "Kimse hatırlamasa da doğru olanı yapar mıydın?", en: "Would you still do the right thing if no one remembered?" },
    { tr: "Hayatında geri almak istediğin tek karar hangisi?", en: "Which single decision in your life would you want to take back?" },
    { tr: "Yalnızlık mı insanı büyütür, kalabalık mı?", en: "Does loneliness help one grow, or the crowd?" },
    { tr: "Para olmasaydı insanlar daha mı iyi olurdu?", en: "Would people be better off if money didn't exist?" },
    { tr: "Herkes seni yanlış tanıyorsa, sorun kimdedir?", en: "If everyone knows you wrongly, where is the problem?" },
    { tr: "Mutlu olmak mı daha zor, mutlu kalmak mı?", en: "Is it harder to be happy or to stay happy?" },
    { tr: "Bir sırrı sonsuza kadar taşıyabilir misin?", en: "Can you carry a secret forever?" },
    { tr: "İnsan en çok kendine mi yalan söyler?", en: "Do people lie to themselves the most?" },
    { tr: "Sessiz kalmak da bir suç olabilir mi?", en: "Can remaining silent also be a crime?" },
    { tr: "Hiç kimse izlemezse yine de doğruyu yapar mıydın?", en: "Would you still do the right thing if no one was watching?" },
    { tr: "Geçmişi silmek mi, geleceği görmek mi?", en: "Erase the past or see the future?" },
    { tr: "Birini affetmek mi daha zor, kendini affetmek mi?", en: "Is it harder to forgive someone else or yourself?" },
    { tr: "Korkuların seni mi koruyor, sınırlıyor mu?", en: "Do your fears protect you or limit you?" },
    { tr: "İnsan gerçekten değişir mi, yoksa sadece uyum mu sağlar?", en: "Do people really change, or do they just adapt?" },
    { tr: "Yalnız olmak mı daha ağır, anlaşılmamak mı?", en: "Is it heavier to be alone or to be misunderstood?" },
    { tr: "Gerçek seni kaç kişi tanıyor?", en: "How many people know the real you?" },
    { tr: "Herkes dürüst olsaydı dünya daha mı kötü olurdu?", en: "Would the world be worse if everyone were honest?" },
    { tr: "Mutluluk bir hedef mi, yan etki mi?", en: "Is happiness a goal or a side effect?" },
    { tr: "Hiçbir şey yapmadan da değerli olabilir misin?", en: "Can you be valuable even without doing anything?" },
    { tr: "Sosyal medya olmasaydı daha mı özgür olurduk?", en: "Would we be freer if social media didn't exist?" },
    { tr: "İnsan en çok neyi kaybedince büyür?", en: "What do people lose that makes them grow the most?" },
    { tr: "Bir hatayı bilerek tekrarlar mıydın?", en: "Would you knowingly repeat a mistake?" },
    { tr: "Doğru zaman diye bir şey var mı?", en: "Is there such a thing as the right time?" },
    { tr: "Başarı mı insanı değiştirir, başarısızlık mı?", en: "Does success change a person, or failure?" },
    { tr: "Hayat adil olsaydı daha mı sıkıcı olurdu?", en: "Would life be more boring if it were fair?" },
    { tr: "Kendinle yalnız kalmaktan korkuyor musun?", en: "Are you afraid of being alone with yourself?" },
    { tr: "İnsan en çok ne zaman gerçek olur?", en: "When does a person become most real?" },
    { tr: "Mutlu görünmek mi, mutsuz olmak mı daha yorucu?", en: "Is it more tiring to look happy or to be unhappy?" },
    { tr: "Susmak bazen konuşmaktan daha mı cesurcadır?", en: "Is remaining silent sometimes braver than speaking?" },
    { tr: "Bugün her şey sıfırlansa kim olurdun?", en: "If everything were reset today, who would you be?" },
    { tr: "Kimse seni yargılamasa neyi yapardın?", en: "What would you do if no one judged you?" },
    { tr: "İnsan neden sevdiğini incitir?", en: "Why do people hurt the ones they love?" },
    { tr: "Gerçek mutluluk paylaşılınca mı artar?", en: "Does true happiness increase when shared?" },
    { tr: "En büyük korkun seni mi yönetiyor?", en: "Is your biggest fear controlling you?" },
    { tr: "İnsan kaç yaşında büyür?", en: "At what age does a person grow up?" },
    { tr: "Para mı güven verir, insanlar mı?", en: "Does money give security, or people?" },
    { tr: "Doğru olmak mı daha önemli, haklı olmak mı?", en: "Is it more important to be right or to be justified?" },
    { tr: "Bir gün herkes seni unutsa üzülür müydün?", en: "Would you be sad if one day everyone forgot you?" },
    { tr: "İnsan en çok neyi saklar?", en: "What do people hide the most?" },
    { tr: "Sevgi mi zamanla azalır, alışkanlık mı artar?", en: "Does love decrease over time, or does habit increase?" },
    { tr: "Yalnız kalmak bir seçim mi, sonuç mu?", en: "Is being alone a choice or a result?" },
    { tr: "İnsan neden kendinden kaçar?", en: "Why do people run away from themselves?" },
    { tr: "Her şeyin bir bedeli olmalı mı?", en: "Should everything have a price?" },
    { tr: "Hayat seni mi değiştiriyor, sen mi hayatı?", en: "Is life changing you, or are you changing life?" },
    { tr: "Güç insanı bozar mı, yoksa ortaya mı çıkarır?", en: "Does power corrupt a person, or reveal them?" },
    { tr: "Mutluluk geçici olmalı mı?", en: "Should happiness be temporary?" },
    { tr: "En son ne zaman gerçekten sustun?", en: "When was the last time you were truly silent?" },
    { tr: "İnsan en çok neyi kontrol edemez?", en: "What can a person control the least?" },
    { tr: "Kendinle gurur duyuyor musun?", en: "Are you proud of yourself?" },
    { tr: "Herkes seni sevse mutlu olur muydun?", en: "Would you be happy if everyone loved you?" },
    { tr: "İnsan neden aynı hataya geri döner?", en: "Why do people go back to the same mistake?" },
    { tr: "Yalnız kalınca kim oluyorsun?", en: "Who are you when you are alone?" },
    { tr: "Doğruyu bilip susmak yanlış mıdır?", en: "Is it wrong to know the truth and remain silent?" },
    { tr: "İnsan neden acıyı saklar?", en: "Why do people hide pain?" },
    { tr: "Mutlu olmak için kaç şeye ihtiyacın var?", en: "How many things do you need to be happy?" },
    { tr: "Hayat sana borçlu mu?", en: "Does life owe you anything?" },
    { tr: "Bir anı silmek ister miydin?", en: "Would you want to erase a memory?" },
    { tr: "İnsan en çok ne zaman yorulur?", en: "When does a person get most tired?" },
    { tr: "Gerçek cesaret nedir?", en: "What is true courage?" },
    { tr: "Başkası için vazgeçmek güç mü, zayıflık mı?", en: "Is giving up for someone else strength or weakness?" },
    { tr: "İnsan kendini ne zaman tanır?", en: "When does a person truly know themselves?" },
    { tr: "Herkes mutlu olmayı hak eder mi?", en: "Does everyone deserve to be happy?" },
    { tr: "Yalnız kalmak mı, yalnız hissetmek mi daha kötü?", en: "Is it worse to be alone or to feel alone?" },
    { tr: "İnsan neden geçmişe takılır?", en: "Why do people get stuck in the past?" },
    { tr: "Affetmek unutmak mıdır?", en: "Is forgiving the same as forgetting?" },
    { tr: "Hayat sana ikinci bir şans verdi mi?", en: "Did life give you a second chance?" },
    { tr: "İnsan neden değişmekten korkar?", en: "Why are people afraid of change?" },
    { tr: "Mutlu olmak bir tercih midir?", en: "Is being happy a choice?" },
    { tr: "Kimsen olmasaydı kim olurdun?", en: "Who would you be if you had no one?" },
    { tr: "İnsan en çok ne zaman yalan söyler?", en: "When do people lie the most?" },
    { tr: "Doğruyu söylemek her zaman gerekli mi?", en: "Is it always necessary to tell the truth?" },
    { tr: "Hayat bir sınav olsaydı geçer miydin?", en: "If life were an exam, would you pass?" },
    { tr: "İnsan neden sevilmek ister?", en: "Why do people want to be loved?" },
    { tr: "Yalnızlık insanı güçlendirir mi?", en: "Does loneliness strengthen a person?" },
    { tr: "İnsan kendini kandırabilir mi?", en: "Can a person deceive themselves?" },
    { tr: "Zaman mı her şeyi çözer?", en: "Does time solve everything?" },
    { tr: "Bugün son günün olsaydı neyi ertelerdin?", en: "If today were your last day, what would you postpone?" },
    { tr: "İnsan neden vazgeçemez?", en: "Why can't people give up?" },
    { tr: "Mutluluk alışkanlık mıdır?", en: "Is happiness a habit?" },
    { tr: "İnsan neden kendine yüklenir?", en: "Why do people put so much pressure on themselves?" },
    { tr: "Hayat senin kontrolünde mi?", en: "Is life under your control?" },
    { tr: "Bir gerçeği bilmemek bazen daha mı iyidir?", en: "Is it sometimes better not to know a truth?" },
    { tr: "İnsan neden korktuğu şeyi ister?", en: "Why do people want what they fear?" },
    { tr: "Yalnız kalınca zaman daha mı yavaş akar?", en: "Does time flow slower when you are alone?" },
    { tr: "Kendini affetmek mümkün mü?", en: "Is it possible to forgive oneself?" },
    { tr: "İnsan neden geçmişi güzelleştirir?", en: "Why do people romanticize the past?" },
    { tr: "Mutluluk sessizlikte mi gizlidir?", en: "Is happiness hidden in silence?" },
    { tr: "İnsan neden umut eder?", en: "Why do people hope?" },
    { tr: "Bir gün her şey bitecekse neden çabalıyoruz?", en: "Why do we struggle if everything will end one day?" },
    { tr: "İnsan en çok neyi kaybetmekten korkar?", en: "What do people fear losing the most?" },
    { tr: "Gerçek özgürlük nedir?", en: "What is true freedom?" },
    { tr: "Hayat bir yarış mı?", en: "Is life a race?" },
    { tr: "İnsan neden sabretmekte zorlanır?", en: "Why do people find it hard to be patient?" },
    { tr: "Her şeyin bir anlamı olmak zorunda mı?", en: "Does everything have to have a meaning?" },
    { tr: "İnsan neden susmayı seçer?", en: "Why do people choose to remain silent?" },
    { tr: "Mutlu olmak için cesur olmak gerekir mi?", en: "Do you need to be brave to be happy?" },
    { tr: "Hayat seni yordu mu?", en: "Has life worn you out?" },
    { tr: "İnsan en çok ne zaman yalnızdır?", en: "When is a person most alone?" },
    { tr: "Bugün kendin için ne yaptın?", en: "What did you do for yourself today?" }
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
