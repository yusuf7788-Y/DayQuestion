# 🌅 DayQuestion

> **"Bir Gün. Bir Soru. Binlerce Fikir."**
> **"One Day. One Question. Thousands of Perspectives."**

![Project Banner](https://via.placeholder.com/1200x500/da7452/ffffff?text=DayQuestion)

**DayQuestion**, kullanıcıların her gün değişen tek bir konu üzerine fikirlerini paylaştığı, minimalist ve modern bir sosyal platformdur. 24 saatlik döngülerle yenilenen içerik, kullanıcıları "o anı" yakalamaya ve düşüncelerini kısa, öz bir şekilde ifade etmeye teşvik eder.

## ✨ Özellikler (Features)

- **🔄 Günlük Dinamik Konular:** Her gece otomatik yenilenen tartışma başlıkları.
- **💬 Gerçek Zamanlı Etkileşim:** Firebase altyapısı ile anlık yorum ve beğeni sistemi.
- **⚡ Optimistic UI:** Kullanıcı deneyimini maksimize eden takılmasız, anında tepki veren arayüz.
- **🎨 Modern Tasarım:** Glassmorphism etkileri, akıcı animasyonlar ve Dark/Light mod desteği.
- **🌍 Çoklu Dil Desteği:** Türkçe ve İngilizce arasında anlık geçiş.
- **🔒 Güvenli Kimlik:** Benzersiz kullanıcı adı rezervasyon sistemi.
- **📱 Mobil Öncelikli:** Her cihazda kusursuz çalışan responsive yapı.

## 🛠️ Teknolojiler (Tech Stack)

Bu proje, modern web standartları ve performans odaklı bir yaklaşımla geliştirilmiştir:

- **Frontend:** HTML5, CSS3 (CSS Variables, Flexbox/Grid), Modern JavaScript (ES6+)
- **Backend (BaaS):** Google Firebase (Firestore Database)
- **Hosting:** Netlify Ready

## 🚀 Kurulum (Local Setup)

Projeyi kendi bilgisayarınızda çalıştırmak için:

1. **Repoyu klonlayın:**
   ```bash
   git clone https://github.com/username/DayQuestion.git
   cd DayQuestion
   ```

2. **Firebase Ayarları:**
   - `firebase-config.js` dosyasını oluşturun ve kendi Firebase proje bilgilerinizi ekleyin.

3. **Başlatın:**
   - **VS Code Live Server** eklentisi ile `index.html`'i açın.
   - Veya terminal üzerinden:
     ```bash
     npx serve .
     ```

     npx serve .
     ```

## ⚠️ Önemli Yapılandırma (Configuration)

Projeyi çalıştırmadan önce aşağıdaki dosyaları kendi bilgilerinizle güncellemeniz gerekmektedir:
- **index.html (Satır 130)**: `copyEmail` fonksiyonuna kendi e-posta adresinizi giriniz.
- **src/firebase-config.js**: Kendi Firebase proje bilgilerinizi giriniz.
- **src/admin.js**: Admin panelinde görünecek soruları düzenleyiniz.
- **src/script.js (Satır 759)**: `secretCode` değişkenine kendi geliştirici şifrenizi belirleyiniz.

## 🤝 Katkıda Bulunma

Fikirleriniz bizim için değerli! Pull request göndermekten çekinmeyin.
1. Forklayın
2. Feature branch oluşturun (`git checkout -b ozellik/YeniOzellik`)
3. Commit leyin (`git commit -m 'Yeni özellik eklendi'`)
4. Pushlayın (`git push origin ozellik/YeniOzellik`)
5. Pull Request açın

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.

---
<div align="center">
  <sub>Built with ❤️ by <b>Ufine Digital</b></sub>
</div>
