# Öğrenci Test Platformu - Geliştirme Yol Haritası (TODO)

Bu doküman, platforma eklenecek yeni özellikleri ve yapılacak geliştirmeleri takip etmek için oluşturulmuştur.

## V2 - Temel Yapı ve Soru Bankası (Mevcut Durum)

- [x] **Temel Hiyerarşi (Ders > Ünite > Konu > Test):** İçeriklerin hiyerarşik olarak yönetilmesi.
- [x] **Hiyerarşi Genişletmesi (Sınıf):** Derslerin ait olduğu "Sınıf" (örn: 9. Sınıf) seviyesini hiyerarşinin en başına ekleme.
- [x] **Kullanıcı Yönetimi ve Rol Tabanlı Erişim (RBAC):** Admin ve öğrenci rolleri.
- [x] **Temel Test Akışı:** Test çözme, süre takibi, sonuç görüntüleme.
- [x] **Profil ve Performans Sayfası:** Geçmiş testleri ve temel grafiği görüntüleme.
- [x] **Admin Paneli:** İçerik, kullanıcı yönetimi ve CSV ile soru aktarma.
- [x] **Gelişmiş Soru Bankası (Altyapı):** Veritabanı mimarisini, soruların merkezi bir havuzda toplanacağı ve testlerle Çok'a-Çok (Many-to-Many) ilişki kuracağı şekilde güncelleme.
- [x] **Soru Bankası Arayüz Geliştirmeleri (Admin):**
    - [x] Admin panelinde, testlerden bağımsız olarak tüm soruların listelendiği, filtrelendiği ve yönetildiği bir "Soru Bankası" ekranı oluşturma.
    - [x] Test oluşturma/düzenleme ekranında, mevcut soruları Soru Bankası'ndan seçerek bir teste ekleme arayüzü (örn: checkbox listesi).

---

## V3 - Geliştirilecek Özellikler

### 🚀 Öncelikli Geliştirmeler

- [ ] **Açıklamalı Cevaplar (Explanations):**
    - [ ] `questions` tablosuna `explanation` (text) adında yeni bir kolon ekleme.
    - [ ] Admin paneline, soru eklerken/düzenlerken açıklama girebileceği bir alan ekleme.
    - [ ] Sonuç sayfasında (`ResultPage`), her sorunun doğru cevabının altında bu açıklamayı gösterme.

### ✨ Öğrenci Deneyimini İyileştirmeler

- [ ] **Detaylı Performans Analizi:**
    - [ ] **Konu Bazında Başarı:** Profil sayfasında, kullanıcının en başarılı ve en zayıf olduğu konuları listeleyen bir bölüm ekleme.
    - [ ] **Zaman İçindeki Gelişim Grafiği:** Profil sayfasındaki grafiği, belirli bir testteki puanların tarihsel değişimini gösterecek şekilde (çizgi grafik) geliştirme.
- [ ] **Kişisel Tekrar Modu:**
    - [ ] **Yanlış Yapılan Sorular Testi:** Kullanıcının geçmiş testlerde yanlış yaptığı sorulardan otomatik olarak yeni bir "Tekrar Testi" oluşturma özelliği.
    - [ ] **Soru Kaydetme (Bookmark):** Test çözerken veya sonuç ekranında, kullanıcının istediği soruyu "kaydedebilmesi" ve profil sayfasında bu soruları listeleyebilmesi.

### ⚙️ Yönetici Yeteneklerini Artırma

- [ ] **Gelişmiş Soru Parametreleri:**
    - [ ] `questions` tablosuna `difficulty` ('kolay', 'orta', 'zor') ve `tags` (etiketler, JSONB) gibi yeni kolonlar ekleme.
    - [ ] Admin arayüzünde bu parametreleri yönetme imkanı.
- [ ] **Farklı Soru Tipleri Desteği:**
    - [ ] **Çoklu Doğru Cevap:** Veritabanı ve arayüzü, birden fazla doğru seçeneği olan soruları destekleyecek şekilde güncelleme.
    - [ ] **Doğru/Yanlış:** Hızlı bir soru tipi olarak ekleme.
- [ ] **Görsel ve Medya Desteği:**
    - [ ] Supabase Storage kullanarak sorulara ve seçeneklere resim ekleme özelliği.

### 🎮 Oyunlaştırma (Gamification)

- [ ] **Rozetler ve Başarımlar (Badges & Achievements):**
    - [ ] Belirli hedeflere (örn: "İlk testi tamamladın!", "%100 başarı") ulaşıldığında kullanıcıya görsel rozetler verme.
- [ ] **Liderlik Tablosu (Leaderboard):**
    - [ ] Her test için en yüksek puan alan ilk 10 kullanıcıyı gösteren bir liderlik tablosu oluşturma.

### 🧠 Yapay Zeka Entegrasyonu (Gemini API)

- [ ] **Otomatik Soru Üretme:** Admin panelinde, yönetcinin belirttiği bir konu başlığından Gemini API kullanarak otomatik olarak soru ve seçenekler üretme.
- [ ] **Otomatik Açıklama Yazma:** Soru Bankası'ndaki açıklaması olmayan sorular için Gemini API ile otomatik olarak açıklama metinleri oluşturma.